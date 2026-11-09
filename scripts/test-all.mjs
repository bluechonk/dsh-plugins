/**
 * 逐个跑 plugins/ 下每个插件自己的单测。
 *
 * 干什么：与 check-all.mjs 配对，把每个插件的 `test` 脚本串起来。
 *
 * 怎么跑：node scripts/test-all.mjs
 * 依赖：无。任一插件测试失败即以该退出码结束。
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

let failed = 0;
for (const name of plugins) {
  const dir = join(pluginsDir, name);
  const manifest = join(dir, "package.json");
  if (!existsSync(manifest)) continue;
  const pkg = JSON.parse(readFileSync(manifest, "utf8"));
  if (!pkg.scripts?.test) {
    console.log(`- ${name}: 无 test 脚本，跳过`);
    continue;
  }
  process.stdout.write(`- ${name}: npm test ... `);
  const result = spawnSync("npm", ["test"], { cwd: dir, stdio: "inherit", shell: true });
  if (result.status === 0) {
    console.log("✓");
  } else {
    console.log(`✗（退出码 ${String(result.status)}）`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${String(failed)} 个插件测试失败`);
  process.exit(1);
}
console.log("\n全部通过");
