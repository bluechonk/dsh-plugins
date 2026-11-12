/**
 * client 半入口。
 *
 * 产物是被 __ModuleLoader__ 的 factory(require) 包裹的单文件（DSH 官方约定，见
 * cordis-plugin-development 的 templates/decoration/client.js）；本文件是源码入口，
 * 由 scripts/build.mjs 打包成 client/client.js。
 */

import { bindReact } from "./runtime.js";
import { LOCALE_NS } from "./i18n.js";
import { apply, inject } from "./panel.js";
import {
  parseInline,
  parseMarkdown,
  filterSkills,
  mergeChunks,
  scopeTextOf,
  translationChunks,
  localeDict,
  interpolate,
  fallbackT,
  tr,
  localizeError,
} from "./pure.js";

const PURE = Object.freeze({
  parseInline,
  parseMarkdown,
  filterSkills,
  mergeChunks,
  scopeTextOf,
  translationChunks,
  localeDict,
  localeNs: LOCALE_NS,
  interpolate,
  fallbackT,
  tr,
  localizeError,
});

window.__ModuleLoader__.load({
  // 模块 id 必须与包名逐字一致——宿主按包名注册 factory，id 不符会加载失败。
  id: "@bluechonk/dsh-skills-manager",
  factory: (require) => {
    bindReact(require("react"));
    return { inject, apply, __pure: PURE };
  },
});
