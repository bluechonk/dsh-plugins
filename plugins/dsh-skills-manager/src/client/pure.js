/**
 * 纯函数直测面。
 *
 * 这些函数不依赖 React/DOM，可在 node 里直接断言。组件通过 __pure 暴露它们，
 * 避免测试去物化整个 client 工厂。
 */

import { LOCALE_DICT, LOCALE_NS } from "./i18n.js";

export { parseInline, parseMarkdown } from "./markdown.js";
export { filterSkills, scopeTextOf, interpolate, fallbackT, tr, localizeError } from "./i18n.js";
export { mergeChunks, translationChunks } from "./translate.js";

export const localeDict = LOCALE_DICT;
export const localeNs = LOCALE_NS;
