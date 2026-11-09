/**
 * 逐个跑 plugins/ 下每个插件自己的语法检查。
 *
 * 干什么：插件自带 `check` 脚本（逐个 node --check），但移进仓库后宿主只跑根目录的
 *        npm scripts。这里把每个插件的 check 串起来，保证 CI 与本地门禁一致。
 *
 * 怎么跑：node scripts/check-all.mjs
 * 依赖：无。任一插件检查失败即以该退出码结束。
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const pluginsDir = join(ROOT, "plugins");

const plugins = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (plugins.length === 0) {
  console.log("plugins/ 下没有插件");
  process.exit(0);
}

let failed = 0;
for (const name of plugins) {
  const dir = join(pluginsDir, name);
  const manifest = join(dir, "package.json");
  if (!existsSync(manifest)) {
    console.log(`- ${name}: 无 package.json，跳过`);
    continue;
  }
  const pkg = JSON.parse(readFileSync(manifest, "utf8"));
  if (!pkg.scripts?.check) {
    console.log(`- ${name}: 无 check 脚本，跳过`);
    continue;
  }
  process.stdout.write(`- ${name}: npm run check ... `);
  // 显式给出 shell 可执行文件而非 shell:true：后者会触发 Node 的弃用警告，
  // 且参数拼接在 Windows 上需要 cmd 的 /c 语义
  const shell = process.platform === "win32" ? "cmd.exe" : "sh";
  const flag = process.platform === "win32" ? "/c" : "-c";
  const result = spawnSync(shell, [flag, "npm run check"], {
    cwd: dir,
    stdio: "inherit",
  });
  if (result.status === 0) {
    console.log("✓");
  } else {
    console.log(`✗（退出码 ${String(result.status)}）`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${String(failed)} 个插件检查失败`);
  process.exit(1);
}
console.log("\n全部通过");
