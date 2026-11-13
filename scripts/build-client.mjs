/**
 * 构建各插件的 client 半。
 *
 * 干什么：DSH 的 client 产物是被 __ModuleLoader__ 的 factory(require) 包裹的单文件
 *        （官方约定，见 cordis-plugin-development 的 templates/decoration/client.js）。
 *        源码按职责拆在各插件的 src/client/ 下，这里统一打包成 client/client.js 交付。
 *        哪些插件要构建由「有没有 src/client/index.js」决定，新增插件不用改本脚本。
 *
 * 怎么跑：npm install && npm run build         （仓库根目录）
 * 依赖：esbuild（仓库根 devDependencies）。产物已提交，装插件的人不需要它。
 */

import { build } from "esbuild";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = join(ROOT, "plugins");

const targets = readdirSync(pluginsDir)
  .map((name) => join(pluginsDir, name))
  .filter((dir) => existsSync(join(dir, "src", "client", "index.js")));

if (targets.length === 0) {
  console.error("✗ 没有找到任何带 src/client/index.js 的插件");
  process.exit(1);
}

for (const dir of targets) {
  const outfile = join(dir, "client", "client.js");
  await build({
    entryPoints: [join(dir, "src", "client", "index.js")],
    outfile,
    bundle: true,
    format: "iife",
    target: "chrome111",
    // React 由宿主注入（factory 的 require），不能打进产物。
    external: ["react", "react/jsx-runtime"],
    logLevel: "info",
  });
  console.log(`已生成 ${outfile}`);
}
