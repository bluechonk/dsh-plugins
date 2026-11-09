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
 * 且安装时按该 commit 拉取。因此这里取「最后一次改动 plugins/ 的提交」，
 * 且拒绝在 plugins/ 有未提交改动时生成——否则索引指向一份不含当前代码的提交。
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

/**
 * 从 README 提取一句简介。
 *
 * 必须跳过「语言切换行」——README 开头常见 `**中文** | [English](README.en.md)`，
 * 它不是简介，一旦被当成简介，DSH 发现页的标题就会显示这串 Markdown 原文（实测踩过）。
 * 判据：剥掉 Markdown 链接与强调符号后，剩余纯文本少于 10 字符的行不算句子。
 */
function summaryFromReadme(dir, limit) {
  for (const name of ["README.md", "README.zh.md", "README_EN.md", "README.en.md"]) {
    const path = join(dir, name);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const text = line.trim();
      if (!text || text.startsWith("#") || text.startsWith("![") || text.startsWith("<")) continue;
      if (text.startsWith("|") || text.startsWith("-")) continue;
      const plain = text
        .replace(/\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/[*_`#>|]/g, "")
        .trim();
      if (plain.length < 10) continue;
      return short(text, limit);
    }
  }
  return "";
}

/** 插件的展示名。DSH 发现页直接显示它，必须短，不能是 README 段落。 */
const TITLES = {
  "dsh-skills-manager": { en: "Skills Manager", zh: "技能管理器" },
  "dsh-usage-stats": { en: "Usage Stats", zh: "使用统计" },
};

/**
 * 索引指向哪个 commit：**最后一次改动 plugins/ 的提交**，不是 HEAD。
 *
 * 为什么：索引文件本身也在仓库里，若指向 HEAD，那么提交索引这个动作会让 HEAD 前进、
 * 索引当场过期，形成自引用悖论——每次改插件都要先提交索引、再改索引、再提交，
 * 永远追不上。而提交索引不碰 plugins/，所以「最后一次改动 plugins/ 的提交」在
 * 提交索引前后保持不变，指针稳定。
 */
function pluginsCommit() {
  return git(["log", "-1", "--format=%H", "--", "plugins/"]);
}

const pluginsDir = join(ROOT, "plugins");
const commit = pluginsCommit();
const dirty = git(["status", "--porcelain"]) !== "";

if (!commit) {
  console.error("✗ 取不到 plugins/ 的提交——本脚本必须在 git 仓库里跑");
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
  const title = TITLES[name] ?? { en: name, zh: name };
  // 发布时间取该插件最后一次提交的时间：填 0 会让 DSH 显示 1970 年
  const published = Number(git(["log", "-1", "--format=%ct", "--", `plugins/${name}`])) || 0;
  // 描述用 package.json 的 description：README 段落里的 **强调** 与 [链接]() 在 DSH
  // 发现页不渲染，会显示成原文
  const description = short(pkg.description ?? summary ?? "", 300);
  entries.push({
    name: pkg.name,
    title,
    description: { en: description, zh: description },
    // 与索引地址同源走 GitHub raw，不引入 CDN
    icon: `https://raw.githubusercontent.com/bluechonk/dsh-plugins/main/plugins/${name}/icon.svg`,
    author: "bluechonk",
    homepage: `https://github.com/bluechonk/dsh-plugins/tree/main/plugins/${name}`,
    repository: { url: REPO_URL },
    versions: [
      {
        version: pkg.version,
        publishTimestamp: published,
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

// 索引指向的是「最后一次改动 plugins/ 的提交」。工作区若还有 plugins/ 的改动，
// 那个 commit 里就没有这些改动，生成的索引会指向一份旧代码。
const dirtyPlugins = git(["status", "--porcelain", "--", "plugins/"]) !== "";
if (dirtyPlugins) {
  console.error("✗ plugins/ 有未提交改动。索引必须指向已提交的代码，请先提交 plugins/ 的改动再生成索引。");
  process.exit(1);
}

writeFileSync(outPath, next, "utf8");
console.log(`已生成 market-index.json（${entries.length} 个插件）`);
console.log(`指向 commit: ${commit}`);

if (dirty) {
  console.log("\n⚠ 工作区还有其他未提交改动（不影响索引，但提交索引时请一并处理）。");
}

if (SHOW_PUSH) {
  console.log(`
索引地址（DSH 里粘贴这一条）：
  https://raw.githubusercontent.com/bluechonk/dsh-plugins/main/market-index.json

提交并推送：
  git add market-index.json
  git commit -m "chore(index): 同步插件索引"
  git push
`);
}
