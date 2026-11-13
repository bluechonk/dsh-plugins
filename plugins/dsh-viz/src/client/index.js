/**
 * client 半入口。
 *
 * 产物是被 __ModuleLoader__ 的 factory(require) 包裹的单文件（DSH 官方约定）；
 * 本文件是源码入口，由仓库根的 scripts/build-client.mjs 打包成 client/client.js。
 */

import { bindReact } from "./runtime.js";
import { apply, inject } from "./assistant.js";
import {
  splitVizFences,
  parseVizSpec,
  stripVizFences,
  hasVizFence,
  collectVizSpecs,
  withVizFencesStripped,
  vizUrlOf,
} from "./pure.js";

const PURE = Object.freeze({
  splitVizFences,
  parseVizSpec,
  stripVizFences,
  hasVizFence,
  collectVizSpecs,
  withVizFencesStripped,
  vizUrlOf,
});

window.__ModuleLoader__.load({
  // 模块 id 必须与包名逐字一致——宿主按包名注册 factory，id 不符会加载失败。
  id: "@bluechonk/dsh-viz",
  factory: (require) => {
    bindReact(require("react"));
    return { inject, apply, __pure: PURE };
  },
});
