/**
 * 语法检查：lib / client / src 下所有 js。
 *
 * 干什么：node --check 每个文件，任一个语法错误就非零退出。
 * 怎么跑：node scripts/check.mjs（或 npm run check）
 * 依赖：无。用 node 驱动而不是在 npm script 里写 shell 循环，省去 Windows cmd 与 bash 的差异。
 */

import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "lib/index.js",
  "lib/viz-path.js",
  "client/client.js",
  ...readdirSync(join(ROOT, "src", "client")).filter((name) => name.endsWith(".js")).map((name) => `src/client/${name}`),
];

for (const file of files) {
  execFileSync(process.execPath, ["--check", join(ROOT, file)], { stdio: "inherit" });
}

console.log(`✓ ${files.length} 个文件语法检查通过`);
