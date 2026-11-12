/**
 * 构建 dsh-skills-manager 的 client 半。
 *
 * 干什么：DSH 的 client 产物是被 __ModuleLoader__ 的 factory(require) 包裹的单文件
 *        （官方约定，见 cordis-plugin-development 的 templates/decoration/client.js）。
 *        源码按职责拆在 plugins/dsh-skills-manager/src/client/ 下，这里打包成
 *        client/client.js 交付。
 *
 * 怎么跑：npm install && npm run build         （仓库根目录）
 * 依赖：esbuild（仓库根 devDependencies）。产物已提交，装插件的人不需要它。
 */

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = join(ROOT, "plugins", "dsh-skills-manager");
const entry = join(PLUGIN, "src", "client", "index.js");
const outfile = join(PLUGIN, "client", "client.js");

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  target: "chrome111",
  // React 由宿主注入（factory 的 require），不能打进产物。
  external: ["react", "react/jsx-runtime"],
  logLevel: "info",
});

console.log(`已生成 ${outfile}`);
