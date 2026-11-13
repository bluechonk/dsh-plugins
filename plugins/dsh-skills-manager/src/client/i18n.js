/**
 * 国际化：宿主 @deepseek-ai/dsh-client-locale 提供 ctx.locale。
 *
 * 用法与 dsh-usage-stats 一致：ctx.locale.register(ns, {zh, en}) 注册字典；
 * 组件注册项声明 locale: ns 后，宿主注入 t prop（引用随语言切换而变 → React 自动重渲染）。
 */

export const LOCALE_NS = "dsh-skills-manager";

export const LOCALE_DICT = {
  zh: {
    "section.title": "技能",
    "filter.all": "全部",
    "filter.global": "全局",
    "filter.user": "用户级",
    "filter.bundled": "内置",
    "filter.workspace": "工作区",
    "badge.global": "全局",
    "badge.user": "用户级",
    "badge.bundled": "内置",
    "badge.workspace": "工作区",
    "toolbar.search": "搜索技能...",
    "toolbar.clearSearch": "清除搜索",
    "scope.personal": "个人",
    "scope.builtin": "内置",
    "scope.workspace": "工作区",
    "action.refresh": "刷新",
    "action.backToTop": "回到顶部",
    "action.retry": "重试",
    "action.close": "关闭",
    "action.copyPath": "复制路径",
    "action.copied": "已复制",
    "action.copyFailed": "复制失败",
    "action.rescan": "重新扫描",
    "detail.description": "描述",
    "detail.content": "文件内容",
    "detail.scope": "范围",
    "detail.path": "文件路径",
    "detail.titleSuffix": "详情",
    "list.readonly": "只读",
    "list.blockedBadge": "DSH 不加载",
    "list.blockedTitle": "DSH 不会加载这个技能：{reason}",
    "issue.missing-name": "frontmatter 缺少 name",
    "issue.missing-description": "frontmatter 缺少 description",
    "issue.legacy-invocation-key": "含 DSH 已废弃的调用键（disableModelInvocation / modelInvocable / userInvocable）",
    "issue.invalid-invocation-value": "调用键的取值不是布尔（true / false）",
    "detail.truncated": "文件较大，正文已截断显示。",
    "detail.noDescription": "（该技能没有描述）",
    "detail.noContent": "（该技能没有正文）",
    "detail.builtinNoFile": "（内置技能，无本地文件）",
    "detail.translate": "翻译",
    "detail.sourceText": "原文",
    "detail.translatedText": "译文",
    "detail.translating": "翻译中…",
    "detail.retranslate": "重新翻译",
    "state.loading": "加载中…",
    "state.loadFailed": "加载失败：{error}",
    "state.empty": "没有找到任何技能。",
    "state.registryUnavailable": "技能注册表暂不可用，当前仅显示本地扫描结果。",
    "aria.dialog": "对话框",
    "root.userDsh": "全局 DSH",
    "root.userAgents": "全局 Agents",
    "root.projectDsh": "项目 DSH",
    "root.projectAgents": "项目 Agents",
    "root.custom": "自定义目录",
    "root.bundled": "内置目录",
    "root.runtime": "运行时",
    "error.request-failed": "请求失败：{status}",
    "error.timeout": "请求超时（10 秒），宿主无响应",
    "error.internal-error": "内部错误",
    "error.bad-json": "请求体不是合法 JSON",
    "error.body-too-large": "请求体超过 1MB 上限",
    "error.skill-not-found": "找不到技能：{name}",
    "error.not-utf8": "SKILL.md 不是 UTF-8 编码，已拒绝改写以免损坏内容",
    "error.outside-root": "拒绝操作技能根之外的路径",
    "error.invalid-name": "技能名必须是 kebab-case（仅小写字母、数字与连字符）",
    "error.empty-description": "描述不能为空",
    "error.description-too-long": "描述过长（上限 500 字）",
    "error.target-root-unavailable": "目标根不可用（项目落点必须来自已登记的工作区）",
    "error.skill-exists": "技能已存在：{name}",
    "error.target-exists": "目标已存在同名技能：{name}",
    "error.no-local-dir": "该技能没有可打开的本地目录",
    "error.dir-missing": "目录不存在：{path}",
    "error.translator-unavailable": "翻译服务未启用",
    "error.translation-failed": "翻译失败，显示原文",
    "error.TRANSLATION_TIMEOUT": "翻译超时",
    "error.TRANSLATION_TEXT_LIMIT": "文本过长",
    "error.TRANSLATION_HTTP_ERROR": "翻译服务请求失败",
    "error.TRANSLATION_INVALID_RESPONSE": "翻译结果无效",
    "error.TRANSLATION_REQUEST_FAILED": "翻译请求失败",
  },
  en: {
    "section.title": "Skills",
    "filter.all": "All",
    "filter.global": "Global",
    "filter.user": "User-level",
    "filter.bundled": "Built-in",
    "filter.workspace": "Workspace",
    "badge.global": "Global",
    "badge.user": "User-level",
    "badge.bundled": "Built-in",
    "badge.workspace": "Workspace",
    "toolbar.search": "Search skills...",
    "toolbar.clearSearch": "Clear search",
    "scope.personal": "Personal",
    "scope.builtin": "Built-in",
    "scope.workspace": "Workspace",
    "action.refresh": "Refresh",
    "action.backToTop": "Back to top",
    "action.retry": "Retry",
    "action.close": "Close",
    "action.copyPath": "Copy path",
    "action.copied": "Copied",
    "action.copyFailed": "Copy failed",
    "action.rescan": "Rescan",
    "detail.description": "Description",
    "detail.content": "File content",
    "detail.scope": "Scope",
    "detail.path": "File path",
    "detail.titleSuffix": "Details",
    "list.readonly": "Read-only",
    "list.blockedBadge": "Not loaded by DSH",
    "list.blockedTitle": "DSH will not load this skill: {reason}",
    "issue.missing-name": "frontmatter has no name",
    "issue.missing-description": "frontmatter has no description",
    "issue.legacy-invocation-key": "carries an invocation key DSH no longer accepts (disableModelInvocation / modelInvocable / userInvocable)",
    "issue.invalid-invocation-value": "an invocation key is not a boolean (true / false)",
    "detail.truncated": "The file is large; the content is truncated.",
    "detail.noDescription": "(This skill has no description)",
    "detail.noContent": "(This skill has no content)",
    "detail.builtinNoFile": "(Built-in skill, no local file)",
    "detail.translate": "Translate",
    "detail.sourceText": "Original",
    "detail.translatedText": "Translated",
    "detail.translating": "Translating…",
    "detail.retranslate": "Retranslate",
    "state.loading": "Loading…",
    "state.loadFailed": "Failed to load: {error}",
    "state.empty": "No skills found.",
    "state.registryUnavailable": "The skill registry is unavailable; only locally scanned results are shown.",
    "aria.dialog": "Dialog",
    "root.userDsh": "Global DSH",
    "root.userAgents": "Global Agents",
    "root.projectDsh": "Project DSH",
    "root.projectAgents": "Project Agents",
    "root.custom": "Custom folder",
    "root.bundled": "Bundled folder",
    "root.runtime": "Runtime",
    "error.request-failed": "Request failed: {status}",
    "error.timeout": "Request timed out (10s); the host did not respond",
    "error.internal-error": "Internal error",
    "error.bad-json": "The request body is not valid JSON",
    "error.body-too-large": "The request body exceeds the 1MB limit",
    "error.skill-not-found": "Skill not found: {name}",
    "error.not-utf8": "SKILL.md is not UTF-8 encoded; refusing to modify it to avoid corrupting the content",
    "error.outside-root": "Refusing to operate on paths outside the skill root",
    "error.invalid-name": "Skill name must be kebab-case (lowercase letters, digits and hyphens only)",
    "error.empty-description": "Description is required",
    "error.description-too-long": "Description is too long (max 500 characters)",
    "error.target-root-unavailable": "Target root unavailable (a project target must come from a registered workspace)",
    "error.skill-exists": "Skill already exists: {name}",
    "error.target-exists": "A skill with the same name already exists at the target: {name}",
    "error.no-local-dir": "This skill has no local folder to open",
    "error.dir-missing": "Folder not found: {path}",
    "error.translator-unavailable": "Translation service not enabled",
    "error.translation-failed": "Translation failed — showing the original",
    "error.TRANSLATION_TIMEOUT": "Translation timed out",
    "error.TRANSLATION_TEXT_LIMIT": "Text too long",
    "error.TRANSLATION_HTTP_ERROR": "The translation service request failed",
    "error.TRANSLATION_INVALID_RESPONSE": "The translation result is invalid",
    "error.TRANSLATION_REQUEST_FAILED": "The translation request failed",
  },
};

/** 宿主绑定的翻译函数（引用稳定，每次调用读当前语言）。 */
let currentT = null;

export function setT(t) {
  currentT = t;
}

/** 取当前语言的文案（组件外用）。 */
export function t(key, params) {
  return tr(currentT, key, params);
}

/** 填 {name} 占位符（与宿主 translate 的规则一致）。 */
export function interpolate(template, params) {
  if (params === null || params === undefined) return template;
  return String(template).replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

/** 中文兜底翻译器：宿主没给 t 时用它（输出与中文版逐字相同）。 */
export function fallbackT() {
  return (key, params) => {
    const dict = LOCALE_DICT.zh;
    const template = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
    return interpolate(template, params);
  };
}

/**
 * 取文案：优先用宿主注入的 t，其次用绑定的 currentT，最后中文兜底。
 * 占位符没被替换时告警一次，别让它悄悄显示到界面上。
 */
export function tr(t, key, params) {
  const text = (t === null || t === undefined ? (currentT || fallbackT()) : t)(key, params);
  if (typeof text === "string" && text.includes("{") && text.includes("}")) {
    console.warn("[dsh-skills-manager] unresolved placeholder in translation key: " + key + " -> " + text);
  }
  return text;
}

/** 根标签 → 展示名（由客户端本地化，不依赖宿主的中文标题）。 */
const ROOT_TITLE_KEYS = {
  "user-dsh": "root.userDsh",
  "user-agents": "root.userAgents",
  "project-dsh": "root.projectDsh",
  "project-agents": "root.projectAgents",
  custom: "root.custom",
  bundled: "root.bundled",
  runtime: "root.runtime",
};

export function rootTitleOf(source) {
  const key = ROOT_TITLE_KEYS[source];
  return key ? tr(currentT, key) : String(source || "");
}

/** 实时过滤：按名称 / 描述 / 路径 / 来源匹配，空查询原样返回。 */
/** 技能的作用范围：个人 / 项目名 / 内置。 */
export function scopeTextOf(skill) {
  const source = skill.source || "";
  if (source === "project-dsh" || source === "project-agents") {
    const parts = String(skill.rootPath || "").split(/[\\/]+/).filter(Boolean);
    // 根目录形如 <projectRoot>/.dsh/skills，倒退两级即项目根，取其末段做名字。
    return parts.length >= 3 ? parts[parts.length - 3] : tr(currentT, "scope.workspace");
  }
  if (source === "bundled" || source === "runtime") return tr(currentT, "scope.builtin");
  return tr(currentT, "scope.personal");
}

export function filterSkills(skills, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle === "") return skills;
  return skills.filter((skill) =>
    [skill.name, skill.description, skill.path, skill.source].some((field) => String(field || "").toLowerCase().includes(needle)));
}

/** 宿主返回的错误：按 code 查本地化文案，没有 code 就退回原文。 */
export function localizeError(error) {
  if (!error) return tr(currentT, "error.internal-error");
  const code = error.code ? String(error.code) : "";
  if (code && Object.prototype.hasOwnProperty.call(LOCALE_DICT.zh, "error." + code)) {
    return tr(currentT, "error." + code, error.params || {});
  }
  return error.message || tr(currentT, "error.internal-error");
}
