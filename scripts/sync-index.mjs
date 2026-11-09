/**
 * 从 plugins/ 生成 market-index.json。
 *
 * 干什么：DSH 的「插件 → 发现」读一份索引 JSON（format 1），索引里每个插件用
 *        `git + commit + path` 指向本仓库的子目录。手写这份 JSON 会在发版后立刻
 *        过期——commit 变了、版本变了，索引却还指着旧的。所以由脚本生成。
 *
 * 怎么跑：node scripts/sync-index.mjs            写盘
 *        node scripts/sync-index.mjs --check    只比对，不一致则非零退出
 *        node scripts/sync-index.mjs --push     生成后打印索引 URL 与提交命令
 * 依赖：无（只用 node 内置模块）。需要 git 在 PATH 上。
 *
 * 为什么索引里的 commit 必须是 40 位小写 hex：宿主的校验器
 * （@deepseek-ai/dsh-plugin-market-index）对 source.commit 有正则校验，
 * 且安装时按该 commit 拉取。因此这里的 commit 取「已提交的 HEAD」，
 * 工作区有未提交改动时给出警告——否则发布的索引指向一个推不上去的状态。
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const CHECK_ONLY = process.argv.includes("--check");
const SHOW_PUSH = process.argv.includes("--push");
const REPO_URL = "https://github.com/bluechonk/dsh-plugins.git";

function git(args, options = {}) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", ...options }).trim();
  } catch (error) {
    return null;
  }
}

function short(text, n) {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length <= n ? one : `${one.slice(0, n)}…`;
}

/** 读插件的 package.json，缺字段直接跳过并说明 */
function readPlugin(dir) {
  const manifest = join(dir, "package.json");
  if (!existsSync(manifest)) return null;
  try {
    return JSON.parse(readFileSync(manifest, "utf8"));
  } catch {
    return null;
  }
}

/** 从 README 首段提取中文简介：取第一个非标题、非图片的段落 */
function summaryFromReadme(dir, limit) {
  for (const name of ["README.md", "README.zh.md", "README_EN.md", "README.en.md"]) {
    const path = join(dir, name);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const text = line.trim();
      if (!text || text.startsWith("#") || text.startsWith("![") || text.startsWith("<")) continue;
      if (text.startsWith("|") || text.startsWith("-")) continue;
      return short(text, limit);
    }
  }
  return "";
}

const pluginsDir = join(ROOT, "plugins");
const commit = git(["rev-parse", "HEAD"]);
const dirty = git(["status", "--porcelain"]) !== "";

if (!commit) {
  console.error("✗ 取不到 git HEAD——本脚本必须在 git 仓库里跑");
  process.exit(1);
}

const entries = [];
for (const name of ["dsh-skills-manager", "dsh-usage-stats"]) {
  const dir = join(pluginsDir, name);
  const pkg = readPlugin(dir);
  if (!pkg) {
    console.error(`✗ plugins/${name}/package.json 读不到`);
    process.exit(1);
  }
  const summary = summaryFromReadme(dir, 200);
  entries.push({
    name: pkg.name,
    title: { en: pkg.name.replace(/^@bluechonk\//, ""), zh: summary ? short(summary, 40) : pkg.name },
    description: { en: short(pkg.description ?? summary, 300), zh: summary },
    icon: `https://raw.githubusercontent.com/bluechonk/dsh-plugins/main/plugins/${name}/icon.svg`,
    author: "bluechonk",
    homepage: `https://github.com/bluechonk/dsh-plugins/tree/main/plugins/${name}`,
    repository: { url: REPO_URL },
    versions: [
      {
        version: pkg.version,
        // 固定用 0：索引本身不带时间语义，宿主只要求是 [0, 10^11) 的整数。
        // 真实发布时间以 CHANGELOG 为准。
        publishTimestamp: 0,
        source: { type: "git", url: REPO_URL, commit, path: `plugins/${name}` },
      },
    ],
  });
}

const index = {
  format: 1,
  title: { en: "bluechonk DSH plugins", zh: "bluechonk DSH 插件" },
  description: {
    en: "Plugins for DeepSeek Harness: skills management and usage statistics.",
    zh: "DeepSeek Harness 插件：技能管理与使用统计。",
  },
  plugins: entries,
};

const outPath = join(ROOT, "market-index.json");
const next = `${JSON.stringify(index, null, "\t")}\n`;
const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : null;

if (CHECK_ONLY) {
  if (current === next) {
    console.log("✓ market-index.json 与 plugins/ 一致");
    process.exit(0);
  }
  console.error("✗ market-index.json 与 plugins/ 不一致，请跑 npm run index");
  process.exit(1);
}

writeFileSync(outPath, next, "utf8");
console.log(`已生成 market-index.json（${entries.length} 个插件）`);
console.log(`commit: ${commit}`);

if (dirty) {
  console.log("\n⚠ 工作区有未提交改动。索引指向已提交的 HEAD，未提交的改动不会进入索引。");
}

if (SHOW_PUSH) {
  console.log(`
索引地址（DSH 里粘贴这一条）：
  https://gcore.jsdelivr.net/gh/bluechonk/dsh-plugins@main/market-index.json

提交并推送：
  git add market-index.json
  git commit -m "chore(index): 同步插件索引"
  git push
`);
}
