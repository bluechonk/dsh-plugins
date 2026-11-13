(() => {
  // plugins/dsh-skills-manager/src/client/runtime.js
  var React = null;
  function bindReact(instance) {
    React = instance;
  }
  function getReact() {
    return React;
  }
  function h(type, props, ...children) {
    return React.createElement(type, props, ...children);
  }

  // plugins/dsh-skills-manager/src/client/i18n.js
  var LOCALE_NS = "dsh-skills-manager";
  var LOCALE_DICT = {
    zh: {
      "section.title": "\u6280\u80FD",
      "section.installed": "\u5DF2\u5B89\u88C5",
      "section.builtin": "\u5185\u7F6E",
      "toolbar.count": "\u6280\u80FD {n}",
      "toolbar.search": "\u641C\u7D22\u6280\u80FD...",
      "toolbar.clearSearch": "\u6E05\u9664\u641C\u7D22",
      "scope.user": "\u7528\u6237 \xB7 \u672C\u673A",
      "scope.localSuffix": "\xB7 \u672C\u673A",
      "scope.group.workspaces": "\u5DE5\u4F5C\u533A",
      "scope.personal": "\u4E2A\u4EBA",
      "scope.builtin": "\u5185\u7F6E",
      "scope.workspace": "\u5DE5\u4F5C\u533A",
      "action.refresh": "\u5237\u65B0",
      "action.backToTop": "\u56DE\u5230\u9876\u90E8",
      "action.retry": "\u91CD\u8BD5",
      "action.close": "\u5173\u95ED",
      "action.copyPath": "\u590D\u5236\u8DEF\u5F84",
      "action.copied": "\u5DF2\u590D\u5236",
      "action.copyFailed": "\u590D\u5236\u5931\u8D25",
      "action.rescan": "\u91CD\u65B0\u626B\u63CF",
      "detail.description": "\u63CF\u8FF0",
      "detail.content": "\u6587\u4EF6\u5185\u5BB9",
      "detail.scope": "\u8303\u56F4",
      "detail.path": "\u6587\u4EF6\u8DEF\u5F84",
      "detail.titleSuffix": "\u8BE6\u60C5",
      "list.readonly": "\u53EA\u8BFB",
      "list.blockedBadge": "DSH \u4E0D\u52A0\u8F7D",
      "list.blockedTitle": "DSH \u4E0D\u4F1A\u52A0\u8F7D\u8FD9\u4E2A\u6280\u80FD\uFF1A{reason}",
      "issue.missing-name": "frontmatter \u7F3A\u5C11 name",
      "issue.missing-description": "frontmatter \u7F3A\u5C11 description",
      "issue.legacy-invocation-key": "\u542B DSH \u5DF2\u5E9F\u5F03\u7684\u8C03\u7528\u952E\uFF08disableModelInvocation / modelInvocable / userInvocable\uFF09",
      "issue.invalid-invocation-value": "\u8C03\u7528\u952E\u7684\u53D6\u503C\u4E0D\u662F\u5E03\u5C14\uFF08true / false\uFF09",
      "detail.truncated": "\u6587\u4EF6\u8F83\u5927\uFF0C\u6B63\u6587\u5DF2\u622A\u65AD\u663E\u793A\u3002",
      "detail.noDescription": "\uFF08\u8BE5\u6280\u80FD\u6CA1\u6709\u63CF\u8FF0\uFF09",
      "detail.noContent": "\uFF08\u8BE5\u6280\u80FD\u6CA1\u6709\u6B63\u6587\uFF09",
      "detail.builtinNoFile": "\uFF08\u5185\u7F6E\u6280\u80FD\uFF0C\u65E0\u672C\u5730\u6587\u4EF6\uFF09",
      "detail.translate": "\u7FFB\u8BD1",
      "detail.sourceText": "\u539F\u6587",
      "detail.translatedText": "\u8BD1\u6587",
      "detail.translating": "\u7FFB\u8BD1\u4E2D\u2026",
      "detail.retranslate": "\u91CD\u65B0\u7FFB\u8BD1",
      "state.loading": "\u52A0\u8F7D\u4E2D\u2026",
      "state.loadFailed": "\u52A0\u8F7D\u5931\u8D25\uFF1A{error}",
      "state.empty": "\u6CA1\u6709\u627E\u5230\u4EFB\u4F55\u6280\u80FD\u3002",
      "state.registryUnavailable": "\u6280\u80FD\u6CE8\u518C\u8868\u6682\u4E0D\u53EF\u7528\uFF0C\u5F53\u524D\u4EC5\u663E\u793A\u672C\u5730\u626B\u63CF\u7ED3\u679C\u3002",
      "aria.dialog": "\u5BF9\u8BDD\u6846",
      "root.userDsh": "\u5168\u5C40 DSH",
      "root.userAgents": "\u5168\u5C40 Agents",
      "root.projectDsh": "\u9879\u76EE DSH",
      "root.projectAgents": "\u9879\u76EE Agents",
      "root.custom": "\u81EA\u5B9A\u4E49\u76EE\u5F55",
      "root.bundled": "\u5185\u7F6E\u76EE\u5F55",
      "root.runtime": "\u8FD0\u884C\u65F6",
      "error.request-failed": "\u8BF7\u6C42\u5931\u8D25\uFF1A{status}",
      "error.timeout": "\u8BF7\u6C42\u8D85\u65F6\uFF0810 \u79D2\uFF09\uFF0C\u5BBF\u4E3B\u65E0\u54CD\u5E94",
      "error.internal-error": "\u5185\u90E8\u9519\u8BEF",
      "error.bad-json": "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON",
      "error.body-too-large": "\u8BF7\u6C42\u4F53\u8D85\u8FC7 1MB \u4E0A\u9650",
      "error.skill-not-found": "\u627E\u4E0D\u5230\u6280\u80FD\uFF1A{name}",
      "error.not-utf8": "SKILL.md \u4E0D\u662F UTF-8 \u7F16\u7801\uFF0C\u5DF2\u62D2\u7EDD\u6539\u5199\u4EE5\u514D\u635F\u574F\u5185\u5BB9",
      "error.outside-root": "\u62D2\u7EDD\u64CD\u4F5C\u6280\u80FD\u6839\u4E4B\u5916\u7684\u8DEF\u5F84",
      "error.invalid-name": "\u6280\u80FD\u540D\u5FC5\u987B\u662F kebab-case\uFF08\u4EC5\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u4E0E\u8FDE\u5B57\u7B26\uFF09",
      "error.empty-description": "\u63CF\u8FF0\u4E0D\u80FD\u4E3A\u7A7A",
      "error.description-too-long": "\u63CF\u8FF0\u8FC7\u957F\uFF08\u4E0A\u9650 500 \u5B57\uFF09",
      "error.target-root-unavailable": "\u76EE\u6807\u6839\u4E0D\u53EF\u7528\uFF08\u9879\u76EE\u843D\u70B9\u5FC5\u987B\u6765\u81EA\u5DF2\u767B\u8BB0\u7684\u5DE5\u4F5C\u533A\uFF09",
      "error.skill-exists": "\u6280\u80FD\u5DF2\u5B58\u5728\uFF1A{name}",
      "error.target-exists": "\u76EE\u6807\u5DF2\u5B58\u5728\u540C\u540D\u6280\u80FD\uFF1A{name}",
      "error.no-local-dir": "\u8BE5\u6280\u80FD\u6CA1\u6709\u53EF\u6253\u5F00\u7684\u672C\u5730\u76EE\u5F55",
      "error.dir-missing": "\u76EE\u5F55\u4E0D\u5B58\u5728\uFF1A{path}",
      "error.translator-unavailable": "\u7FFB\u8BD1\u670D\u52A1\u672A\u542F\u7528",
      "error.translation-failed": "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u663E\u793A\u539F\u6587",
      "error.TRANSLATION_TIMEOUT": "\u7FFB\u8BD1\u8D85\u65F6",
      "error.TRANSLATION_TEXT_LIMIT": "\u6587\u672C\u8FC7\u957F",
      "error.TRANSLATION_HTTP_ERROR": "\u7FFB\u8BD1\u670D\u52A1\u8BF7\u6C42\u5931\u8D25",
      "error.TRANSLATION_INVALID_RESPONSE": "\u7FFB\u8BD1\u7ED3\u679C\u65E0\u6548",
      "error.TRANSLATION_REQUEST_FAILED": "\u7FFB\u8BD1\u8BF7\u6C42\u5931\u8D25"
    },
    en: {
      "section.title": "Skills",
      "section.installed": "Installed",
      "section.builtin": "Built-in",
      "toolbar.count": "Skills {n}",
      "toolbar.search": "Search skills...",
      "toolbar.clearSearch": "Clear search",
      "scope.user": "User \xB7 Local",
      "scope.localSuffix": "\xB7 Local",
      "scope.group.workspaces": "Workspaces",
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
      "detail.translating": "Translating\u2026",
      "detail.retranslate": "Retranslate",
      "state.loading": "Loading\u2026",
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
      "error.translation-failed": "Translation failed \u2014 showing the original",
      "error.TRANSLATION_TIMEOUT": "Translation timed out",
      "error.TRANSLATION_TEXT_LIMIT": "Text too long",
      "error.TRANSLATION_HTTP_ERROR": "The translation service request failed",
      "error.TRANSLATION_INVALID_RESPONSE": "The translation result is invalid",
      "error.TRANSLATION_REQUEST_FAILED": "The translation request failed"
    }
  };
  var currentT = null;
  function setT(t2) {
    currentT = t2;
  }
  function t(key, params) {
    return tr(currentT, key, params);
  }
  function interpolate(template, params) {
    if (params === null || params === void 0) return template;
    return String(template).replace(
      /\{(\w+)\}/g,
      (match, name) => name in params ? String(params[name]) : match
    );
  }
  function fallbackT() {
    return (key, params) => {
      const dict = LOCALE_DICT.zh;
      const template = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
      return interpolate(template, params);
    };
  }
  function tr(t2, key, params) {
    const text = (t2 === null || t2 === void 0 ? currentT || fallbackT() : t2)(key, params);
    if (typeof text === "string" && text.includes("{") && text.includes("}")) {
      console.warn("[dsh-skills-manager] unresolved placeholder in translation key: " + key + " -> " + text);
    }
    return text;
  }
  var ROOT_TITLE_KEYS = {
    "user-dsh": "root.userDsh",
    "user-agents": "root.userAgents",
    "project-dsh": "root.projectDsh",
    "project-agents": "root.projectAgents",
    custom: "root.custom",
    bundled: "root.bundled",
    runtime: "root.runtime"
  };
  function rootTitleOf(source) {
    const key = ROOT_TITLE_KEYS[source];
    return key ? tr(currentT, key) : String(source || "");
  }
  function scopeTextOf(skill) {
    const source = skill.source || "";
    if (source === "project-dsh" || source === "project-agents") {
      const parts = String(skill.rootPath || "").split(/[\\/]+/).filter(Boolean);
      return parts.length >= 3 ? parts[parts.length - 3] : tr(currentT, "scope.workspace");
    }
    if (source === "bundled" || source === "runtime") return tr(currentT, "scope.builtin");
    return tr(currentT, "scope.personal");
  }
  function filterSkills(skills, query) {
    const needle = String(query || "").trim().toLowerCase();
    if (needle === "") return skills;
    return skills.filter((skill) => [skill.name, skill.description, skill.path, skill.source].some((field) => String(field || "").toLowerCase().includes(needle)));
  }
  function localizeError(error) {
    if (!error) return tr(currentT, "error.internal-error");
    const code = error.code ? String(error.code) : "";
    if (code && Object.prototype.hasOwnProperty.call(LOCALE_DICT.zh, "error." + code)) {
      return tr(currentT, "error." + code, error.params || {});
    }
    return error.message || tr(currentT, "error.internal-error");
  }

  // plugins/dsh-skills-manager/src/client/api.js
  var API = "/dsh-skills-manager";
  var REQUEST_TIMEOUT_MS = 1e4;
  function makeError(payload, status) {
    const error = new Error(payload && payload.error || t("error.request-failed", { status }));
    if (payload && payload.code) error.code = payload.code;
    if (payload && payload.params) error.params = payload.params;
    return error;
  }
  async function request(path, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(API + path, Object.assign({ signal: controller.signal }, options));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) throw makeError(payload, response.status);
      return payload;
    } catch (error) {
      if (error && error.name === "AbortError") throw new Error(t("error.timeout"));
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  function apiGet(path, params) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(path + query, { headers: { accept: "application/json" } });
  }
  function apiPost(path, body) {
    return request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {})
    });
  }

  // plugins/dsh-skills-manager/src/client/styles.js
  var CSS = [
    // —— 主面板页骨架 ——
    // main 槽位不给页头、内边距与滚动，页面自持（与官方「自动化任务」页一致）。
    ".dsm-page{position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;background:var(--dsw-alias-bg-base,transparent)}",
    ".dsm-pageScroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}",
    ".dsm-pageContent{max-width:960px;margin:0 auto;padding:28px clamp(24px,4vw,48px) 0}",
    "[data-platform=darwin] .dsm-pageContent{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}",
    ".dsm-root{display:flex;flex-direction:column;gap:32px;min-width:0;max-width:896px;margin:0 auto;padding-bottom:40px;color:var(--dsw-alias-label-primary);font-size:14px}",
    ".dsm-title{font-size:30px;font-weight:600;letter-spacing:-.75px;line-height:36px;margin:0}",
    // —— 顶部工具条 ——
    ".dsm-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}",
    ".dsm-toolbarLeft{display:flex;flex-wrap:wrap;align-items:center;gap:12px;min-width:0}",
    ".dsm-scope{position:relative;flex:none}",
    ".dsm-scopeBtn{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border-radius:9999px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;font-weight:400;cursor:pointer}",
    ".dsm-scopeBtn:hover{background:var(--dsw-alias-bg-layer-1)}",
    ".dsm-divider{width:1px;height:20px;background:var(--dsw-alias-border-l1);flex:none}",
    ".dsm-meta{color:var(--dsw-alias-label-secondary);font-size:14px;white-space:nowrap}",
    ".dsm-meta b{font-weight:400;color:var(--dsw-alias-label-secondary)}",
    ".dsm-searchWrap{position:relative;display:flex;align-items:center;width:256px;max-width:100%;flex:none}",
    ".dsm-searchWrap .dsm-searchIcon{position:absolute;left:10px;pointer-events:none;color:var(--dsw-alias-label-secondary)}",
    ".dsm-search{width:100%;height:36px;padding:0 30px 0 36px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;outline:none}",
    ".dsm-searchClear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
    ".dsm-searchClear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}",
    ".dsm-searchClear svg{width:12px;height:12px}",
    ".dsm-search:focus{border-color:var(--dsw-alias-brand-primary)}",
    ".dsm-search::placeholder{color:var(--dsw-alias-label-secondary)}",
    // —— 分组标题 ——
    ".dsm-sectionHead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}",
    ".dsm-sectionTitle{font-size:14px;font-weight:400;color:var(--dsw-alias-label-primary)}",
    ".dsm-sectionCount{color:var(--dsw-alias-label-secondary);font-weight:400;font-size:12px;margin-left:2px}",
    ".dsm-actions{display:flex;align-items:center;gap:8px}",
    ".dsm-iconBtn{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer}",
    ".dsm-iconBtn:hover{background:var(--dsw-alias-bg-layer-2)}",
    // 回到顶部：浮动在面板右下角，只在滚过标题与工具条后出现
    ".dsm-backTop{position:absolute;right:20px;bottom:20px;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28)}",
    ".dsm-backTop:hover{background:var(--dsw-alias-bg-layer-2)}",
    ".dsm-primary{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px 0 6px;border-radius:8px;border:1px solid transparent;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);font:inherit;font-size:14px;font-weight:400;cursor:pointer}",
    ".dsm-primary:disabled{opacity:.5;cursor:not-allowed}",
    // —— 列表 ——
    ".dsm-list{display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
    ".dsm-row{display:flex;align-items:center;gap:12px;min-height:65px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);cursor:pointer}",
    ".dsm-row:last-child{border-bottom:none}",
    ".dsm-row:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent)}",
    ".dsm-icon{width:36px;height:36px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);color:var(--dsw-alias-label-secondary)}",
    ".dsm-rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".dsm-name{font-size:14px;font-weight:400;line-height:21px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dsm-desc{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dsm-badges{display:flex;gap:6px;align-items:center;flex:none}",
    ".dsm-badge{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:11.5px;white-space:nowrap}",
    ".dsm-badgeWarn{color:var(--dsw-alias-state-warning,var(--dsw-alias-label-secondary));border-color:color-mix(in srgb, var(--dsw-alias-state-warning,#d29922) 45%, transparent)}",
    ".dsm-rowMainTitle{display:flex;align-items:center;gap:8px;min-width:0}",
    ".dsm-groupTitle{padding:10px 4px 6px;font-size:12.5px;color:var(--dsw-alias-label-secondary);font-weight:600}",
    // —— 下拉菜单 ——
    ".dsm-menu{position:absolute;z-index:40;top:calc(100% + 6px);left:0;min-width:230px;padding:6px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);box-shadow:0 12px 32px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:2px}",
    ".dsm-menuItem{display:flex;align-items:center;gap:10px;padding:8px 10px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;text-align:left;cursor:pointer;width:100%}",
    ".dsm-menuItem:hover{background:var(--dsw-alias-bg-layer-2)}",
    ".dsm-menuItem span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dsm-menuLabel{padding:8px 10px 4px;color:var(--dsw-alias-label-secondary);font-size:12px}",
    // —— 弹窗 ——
    ".dsm-overlay{position:fixed;inset:0;z-index:60;box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:24px}",
    ".dsm-modal{width:min(680px,100%);max-height:88vh;display:flex;flex-direction:column;border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);box-shadow:0 24px 64px rgba(0,0,0,.32);overflow:hidden}",
    ".dsm-modalHead{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
    ".dsm-modalTitle{font-size:15px;font-weight:600}",
    ".dsm-modalBody{padding:16px 18px 20px;overflow:auto;display:flex;flex-direction:column;gap:10px}",
    ".dsm-label{font-size:12.5px;color:var(--dsw-alias-label-secondary)}",
    ".dsm-mdScroll{flex:none;max-height:210px;overflow:auto;padding-right:6px;font-size:13px;line-height:1.7;color:var(--dsw-alias-label-primary);word-break:break-word}",
    ".dsm-mdCard{flex:none;max-height:min(46vh,420px);overflow:auto;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);padding:14px 16px;font-size:13px;line-height:1.75;color:var(--dsw-alias-label-primary);word-break:break-word}",
    ".dsm-mdCard .dsm-md-h{font-size:15px;font-weight:600;margin:16px 0 8px;line-height:1.45}",
    ".dsm-mdCard .dsm-md-h:first-child{margin-top:0}",
    ".dsm-mdCard .dsm-md-p{margin:0 0 10px}",
    ".dsm-mdCard .dsm-md-list{list-style:disc;margin:0 0 10px;padding-left:20px}",
    ".dsm-mdCard .dsm-md-list li{margin:4px 0}",
    ".dsm-mdCard .dsm-md-code{font-size:12px;padding:2px 6px;border-radius:6px}",
    ".dsm-badgeSkill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:11.5px}",
    // —— Markdown 渲染 ——
    ".dsm-md-p{margin:0 0 8px}",
    ".dsm-md-p:last-child{margin-bottom:0}",
    ".dsm-md-h{font-size:14px;font-weight:600;margin:12px 0 6px;line-height:1.4}",
    ".dsm-md-h:first-child{margin-top:0}",
    ".dsm-md-list{margin:0 0 8px;padding-left:20px}",
    ".dsm-md-list li{margin:2px 0}",
    ".dsm-md-quote{margin:0 0 8px;padding:4px 10px;border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}",
    ".dsm-md-pre{margin:0 0 8px;padding:10px 12px;border-radius:8px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);border:1px solid var(--dsw-alias-border-l1);overflow:auto;white-space:pre}",
    ".dsm-md-pre code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px}",
    ".dsm-md-code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;padding:1px 4px;border-radius:4px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)}",
    ".dsm-md-p a,.dsm-md-list a,.dsm-md-h a,.dsm-md-quote a{color:var(--dsw-alias-brand-primary)}",
    ".dsm-md-hr{border:0;border-top:1px solid var(--dsw-alias-border-l1);margin:10px 0}",
    ".dsm-muted{color:var(--dsw-alias-label-secondary)}",
    ".dsm-value{font-size:13.5px;margin-top:4px}",
    ".dsm-pathRow{display:flex;align-items:center;gap:6px;margin-top:2px;min-width:0}",
    ".dsm-path{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dsm-iconBtnSm{width:26px;height:26px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
    ".dsm-iconBtnSm:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}",
    // 文本按钮：图标按钮是 30px 方形，装不下「取消」这类文字
    ".dsm-btnText{display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;white-space:nowrap;cursor:pointer}",
    ".dsm-btnText:hover{background:var(--dsw-alias-bg-layer-2)}",
    ".dsm-select{position:relative}",
    ".dsm-selectBtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}",
    // —— 表单 ——
    ".dsm-field{display:flex;flex-direction:column;gap:6px}",
    ".dsm-input{height:34px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;outline:none}",
    ".dsm-input:focus{border-color:var(--dsw-alias-brand-primary)}",
    ".dsm-textarea{min-height:76px;padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;outline:none;resize:vertical}",
    ".dsm-textarea:focus{border-color:var(--dsw-alias-brand-primary)}",
    ".dsm-error{color:var(--dsw-alias-state-error-primary);font-size:12.5px}",
    ".dsm-state{padding:28px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13.5px}",
    ".dsm-footNote{margin-top:10px;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.6}",
    // —— 翻译分段按钮与出错提示 ——
    ".dsm-seg{display:inline-flex;align-items:center;gap:2px;height:24px;padding:2px;margin-left:8px;border-radius:9999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}",
    ".dsm-segBtn{height:20px;padding:0 10px;border:0;border-radius:9999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer}",
    ".dsm-segBtn:hover{color:var(--dsw-alias-label-primary)}",
    '.dsm-segBtn[data-on="true"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}',
    ".dsm-translateBar{display:flex;align-items:center;gap:8px;margin:-2px 0 10px;min-height:20px;font-size:12.5px;color:var(--dsw-alias-label-secondary)}",
    ".dsm-translateError{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warning,#d29922) 35%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warning,#d29922) 12%, transparent);color:var(--dsw-alias-state-warning,var(--dsw-alias-label-secondary));font-size:12.5px;line-height:1.5}",
    ".dsm-translateError svg{width:14px;height:14px;flex:none}",
    ".dsm-retranslate{height:24px;padding:0 8px;margin-left:8px;border-radius:9999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer}",
    ".dsm-retranslate:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}"
  ].join("");
  function ensureStyles() {
    if (typeof document === "undefined") return;
    const id = "@bluechonk/dsh-skills-manager";
    let style = document.querySelector('style[data-plugin-css="' + id + '"]');
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-plugin-css", id);
      document.head.appendChild(style);
    }
    if (style.textContent !== CSS) style.textContent = CSS;
  }

  // plugins/dsh-skills-manager/src/client/icons.js
  var Svg = (props) => h("svg", Object.assign({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }, props));
  var IconMonitor = (p) => h(Svg, p, h("rect", { x: 3, y: 4, width: 18, height: 13, rx: 2 }), h("path", { d: "M8 21h8M12 17v4" }));
  var IconFolder = (p) => h(Svg, p, h("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }));
  var IconCaret = (p) => h(Svg, Object.assign({ width: 14, height: 14 }, p), h("path", { d: "m6 9 6 6 6-6" }));
  var IconSearch = (p) => h(Svg, p, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "m20 20-3.2-3.2" }));
  var IconRefresh = (p) => h(Svg, p, h("path", { d: "M20 11a8 8 0 1 0-2.3 5.7" }), h("path", { d: "M20 4v7h-7" }));
  var IconArrowUp = (p) => h(Svg, p, h("path", { d: "M12 19V5" }), h("path", { d: "m5 12 7-7 7 7" }));
  var IconClose = (p) => h(Svg, p, h("path", { d: "m6 6 12 12M18 6 6 18" }));
  var IconWarning = (p) => h(Svg, p, h("path", { d: "M12 3 2.5 19.5h19L12 3Z" }), h("path", { d: "M12 10v4" }), h("path", { d: "M12 17.5h.01" }));
  var IconCheck = (p) => h(Svg, p, h("path", { d: "m5 13 4 4 10-10" }));
  var IconCopy = (p) => h(Svg, p, h("rect", { x: 9, y: 9, width: 11, height: 11, rx: 2 }), h("path", { d: "M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" }));
  var IconSparkle = (p) => h(Svg, p, h("path", { d: "M12 3c1 4 2 5 6 6-4 1-5 2-6 6-1-4-2-5-6-6 4-1 5-2 6-6Z" }), h("path", { d: "M18 15c.5 2 1 2.5 3 3-2 .5-2.5 1-3 3-.5-2-1-2.5-3-3 2-.5 2.5-1 3-3Z" }));
  var IconLayers = (p) => h(Svg, p, h("rect", { x: 4, y: 4, width: 12, height: 12, rx: 2 }), h("path", { d: "M9 20h9a2 2 0 0 0 2-2V9" }));

  // plugins/dsh-skills-manager/src/client/components.js
  function IconButton(props, children) {
    return h("button", {
      type: "button",
      className: props.className || "dsm-iconBtn",
      "aria-label": props.label,
      title: props.title || props.label,
      onClick: (event) => {
        event.stopPropagation();
        props.onClick(event);
      }
    }, children);
  }
  function Dropdown(props) {
    const { useState, useEffect, useRef } = getReact();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      if (!open) return void 0;
      const onDown = (event) => {
        if (ref.current && !ref.current.contains(event.target)) setOpen(false);
      };
      const onKey = (event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);
    return h(
      "div",
      { className: props.className || "dsm-select", ref },
      h("button", {
        type: "button",
        className: props.buttonClassName || "dsm-selectBtn",
        onClick: () => setOpen((value) => !value),
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false"
      }, props.trigger, props.hideCaret ? null : h(IconCaret, null)),
      open ? h("div", { className: "dsm-menu", role: "menu" }, props.children(open ? () => setOpen(false) : () => {
      })) : null
    );
  }
  function Modal(props) {
    const { useEffect, useRef } = getReact();
    const ref = useRef(null);
    const restoreRef = useRef(null);
    useEffect(() => {
      restoreRef.current = document.activeElement;
      if (ref.current) ref.current.focus();
      const onKey = (event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        props.onClose();
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        const restore = restoreRef.current;
        if (restore && typeof restore.focus === "function") restore.focus();
      };
    }, [props.onClose]);
    return h("div", {
      className: "dsm-overlay",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) props.onClose();
      }
    }, h("div", {
      className: "dsm-modal" + (props.modalClassName ? " " + props.modalClassName : ""),
      role: "dialog",
      "aria-modal": "true",
      "aria-label": props.label || t("aria.dialog"),
      tabIndex: -1,
      ref
    }, props.children));
  }

  // plugins/dsh-skills-manager/src/client/markdown.js
  var SAFE_LINK = /^(?:https?:|mailto:|tel:|#|\/)/i;
  function parseInline(text) {
    const nodes = [];
    const source = String(text == null ? "" : text);
    const pattern = /(`[^`]+`)|(\*\*[^*]+?\*\*)|(~~[^~]+?~~)|(\[[^\]\n]*?\]\([^)\s]*?\))|(\*[^*\s][^*\n]*?\*)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (match.index > last) nodes.push({ type: "text", text: source.slice(last, match.index) });
      const token = match[0];
      if (token.startsWith("`")) {
        nodes.push({ type: "code", text: token.slice(1, -1) });
      } else if (token.startsWith("**")) {
        nodes.push({ type: "strong", text: token.slice(2, -2) });
      } else if (token.startsWith("~~")) {
        nodes.push({ type: "del", text: token.slice(2, -2) });
      } else if (token.startsWith("[")) {
        const link = /\[([^\]]*)\]\(([^)]*)\)/.exec(token);
        const label = link ? link[1] : token;
        const href = link ? link[2].trim() : "";
        if (SAFE_LINK.test(href)) nodes.push({ type: "link", text: label, href });
        else nodes.push({ type: "text", text: token });
      } else {
        nodes.push({ type: "em", text: token.slice(1, -1) });
      }
      last = match.index + token.length;
    }
    if (last < source.length) nodes.push({ type: "text", text: source.slice(last) });
    return nodes;
  }
  function parseMarkdown(text) {
    const lines = String(text == null ? "" : text).replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        i += 1;
        continue;
      }
      if (/^```/.test(line.trim())) {
        const buffer2 = [];
        i += 1;
        while (i < lines.length && !/^```/.test(lines[i].trim())) {
          buffer2.push(lines[i]);
          i += 1;
        }
        i += 1;
        blocks.push({ type: "code", text: buffer2.join("\n") });
        continue;
      }
      const heading = /^(#{1,6})\s+(.*)$/.exec(line);
      if (heading) {
        blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
        i += 1;
        continue;
      }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        blocks.push({ type: "hr" });
        i += 1;
        continue;
      }
      if (/^\s*>\s?/.test(line)) {
        const buffer2 = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          buffer2.push(lines[i].replace(/^\s*>\s?/, ""));
          i += 1;
        }
        blocks.push({ type: "quote", children: parseMarkdown(buffer2.join("\n")) });
        continue;
      }
      const isOrdered = /^\s*\d+[.)]\s+/.test(line);
      if (isOrdered || /^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length) {
          const item = isOrdered ? /^\s*\d+[.)]\s+(.*)$/.exec(lines[i]) : /^\s*[-*+]\s+(.*)$/.exec(lines[i]);
          if (!item) break;
          items.push(item[1]);
          i += 1;
        }
        blocks.push({ type: isOrdered ? "ol" : "ul", items });
        continue;
      }
      const buffer = [];
      while (i < lines.length && lines[i].trim() !== "" && !/^```/.test(lines[i].trim()) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      if (buffer.length === 0) {
        i += 1;
        continue;
      }
      blocks.push({ type: "p", text: buffer.join("\n") });
    }
    return blocks;
  }
  function renderInline(nodes, keyPrefix) {
    return nodes.map((node, index) => {
      const key = keyPrefix + index;
      if (node.type === "code") return h("code", { key, className: "dsm-md-code" }, node.text);
      if (node.type === "strong") return h("strong", { key }, node.text);
      if (node.type === "em") return h("em", { key }, node.text);
      if (node.type === "del") return h("del", { key }, node.text);
      if (node.type === "link") return h("a", { key, href: node.href, target: "_blank", rel: "noreferrer noopener" }, node.text);
      return node.text;
    });
  }
  function renderBlocks(blocks, keyPrefix) {
    const prefix = keyPrefix || "b";
    return blocks.map((block, index) => {
      const key = prefix + index;
      if (block.type === "code") return h("pre", { key, className: "dsm-md-pre" }, h("code", null, block.text));
      if (block.type === "h") return h("h" + block.level, { key, className: "dsm-md-h" }, renderInline(parseInline(block.text), key + "i"));
      if (block.type === "hr") return h("hr", { key, className: "dsm-md-hr" });
      if (block.type === "quote") return h("blockquote", { key, className: "dsm-md-quote" }, renderBlocks(block.children, key + "c"));
      if (block.type === "ul" || block.type === "ol") {
        return h(block.type, { key, className: "dsm-md-list" }, block.items.map((item, position) => h("li", { key: key + "l" + position }, renderInline(parseInline(item), key + "l" + position + "i"))));
      }
      return h("p", { key, className: "dsm-md-p" }, renderInline(parseInline(block.text), key + "i"));
    });
  }
  function renderMarkdown(text) {
    return renderBlocks(parseMarkdown(text), "b");
  }

  // plugins/dsh-skills-manager/src/client/translate.js
  var TRANSLATE_TARGET = "zh";
  var TRANSLATE_CHUNK_CHARS = 3500;
  var TRANSLATE_CONCURRENCY = 3;
  var translationCache = /* @__PURE__ */ new Map();
  function translationChunks(text, limit) {
    const parts = [];
    const paragraphs = String(text).split(/(\r?\n(?:[\t ]*\r?\n)+)/);
    let buffer = "";
    for (const part of paragraphs) {
      if (buffer.length > 0 && buffer.length + part.length > limit) {
        parts.push(buffer);
        buffer = "";
      }
      if (part.length > limit) {
        let rest = part;
        while (rest.length > limit) {
          parts.push(rest.slice(0, limit));
          rest = rest.slice(limit);
        }
        buffer = rest;
      } else {
        buffer += part;
      }
    }
    if (buffer.length > 0) parts.push(buffer);
    return parts.filter((part) => part.trim() !== "");
  }
  function mergeChunks(chunks, done) {
    let out = "";
    for (let i = 0; i < chunks.length; i += 1) {
      const translated = done[i];
      out += translated === null || translated === void 0 ? chunks[i] : translated;
    }
    return out;
  }
  async function translateChunk(chunk, force) {
    if (!force) {
      const cached = translationCache.get(chunk);
      if (cached !== void 0) return cached;
    }
    const payload = await apiPost("/translate", { text: chunk, targetLanguage: TRANSLATE_TARGET, force: Boolean(force) });
    const text = typeof payload.text === "string" ? payload.text : "";
    translationCache.set(chunk, text);
    return text;
  }

  // plugins/dsh-skills-manager/src/client/detail.js
  function DetailModal(props) {
    const { useState, useEffect, useRef, useCallback } = getReact();
    const tt = props.t || fallbackT();
    const skill = props.skill;
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(null);
    const [translateOn, setTranslateOn] = useState(false);
    const [progress, setProgress] = useState(null);
    const [translateError, setTranslateError] = useState(null);
    const translatedKey = useRef(null);
    const forceRef = useRef(false);
    const [retranslateToken, setRetranslateToken] = useState(0);
    useEffect(() => {
      let alive = true;
      setDetail(null);
      setError(null);
      setCopied(null);
      setProgress(null);
      setTranslateError(null);
      translatedKey.current = null;
      apiPost("/body", { name: skill.name, cwd: props.cwd }).then((payload) => {
        if (alive) setDetail(payload);
      }).catch((err) => {
        if (alive) setError(localizeError(err));
      });
      return () => {
        alive = false;
      };
    }, [skill.name, props.cwd]);
    const copyPath = () => {
      const path = detail && detail.skill && detail.skill.path || skill.path || "";
      if (!path) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(path).then(() => setCopied(true)).catch(() => setCopied(false));
        return;
      }
      setCopied(false);
    };
    const scopeText = scopeTextOf(skill);
    const descriptionText = detail && detail.frontmatter && typeof detail.frontmatter.description === "string" && detail.frontmatter.description !== "" ? detail.frontmatter.description : skill.description || "";
    const bodyText = detail && typeof detail.body === "string" ? detail.body.trim() : "";
    useEffect(() => {
      if (!translateOn) {
        setTranslateError(null);
        return void 0;
      }
      const fields = [["desc", descriptionText], ["content", bodyText]].filter(([, text]) => Boolean(text));
      if (fields.length === 0) return void 0;
      const signature = skill.name + "|" + props.cwd + "|" + descriptionText + "|" + bodyText;
      if (translatedKey.current === signature && !forceRef.current) return void 0;
      translatedKey.current = signature;
      const force = forceRef.current;
      forceRef.current = false;
      let alive = true;
      setTranslateError(null);
      const next = {};
      for (const [key, text] of fields) {
        const chunks = translationChunks(text, TRANSLATE_CHUNK_CHARS);
        next[key] = { chunks, done: new Array(chunks.length).fill(null) };
      }
      setProgress(next);
      const runField = async (key) => {
        const chunks = next[key].chunks;
        let cursor = 0;
        const worker = async () => {
          while (cursor < chunks.length) {
            const index = cursor;
            cursor += 1;
            let result;
            try {
              result = await translateChunk(chunks[index], force);
            } catch (error2) {
              if (!alive) return;
              setTranslateError(localizeError(error2));
              return;
            }
            if (!alive) return;
            setProgress((prev) => {
              if (!prev || !prev[key]) return prev;
              const done = prev[key].done.slice();
              done[index] = result;
              return { ...prev, [key]: { chunks: prev[key].chunks, done } };
            });
          }
        };
        await Promise.all(Array.from({ length: Math.min(TRANSLATE_CONCURRENCY, chunks.length) }, worker));
      };
      Promise.all(fields.map(([key]) => runField(key)));
      return () => {
        alive = false;
      };
    }, [skill.name, props.cwd, translateOn, detail, retranslateToken]);
    const translating = translateOn && (!progress || ["desc", "content"].some((key) => progress[key] && progress[key].done.some((value) => value === null)));
    const viewOf = (key, original) => {
      const field = progress && progress[key];
      if (!field || !field.done.some((value) => value !== null)) return original;
      return mergeChunks(field.chunks, field.done);
    };
    const descShown = translateOn ? viewOf("desc", descriptionText) : descriptionText;
    const bodyShown = translateOn ? viewOf("content", bodyText) : bodyText;
    const doRetranslate = useCallback(() => {
      forceRef.current = true;
      setRetranslateToken((value) => value + 1);
    }, []);
    return h(
      Modal,
      { onClose: props.onClose, label: skill.name + " " + tt("detail.titleSuffix") },
      h(
        "div",
        { className: "dsm-modalHead" },
        h("span", { className: "dsm-modalTitle" }, skill.name),
        h("span", { className: "dsm-badgeSkill", style: { marginLeft: "8px" } }, "Skill"),
        h(
          "div",
          { className: "dsm-seg", role: "group", "aria-label": tt("detail.translate") },
          h("button", {
            type: "button",
            className: "dsm-segBtn",
            "data-on": translateOn ? "false" : "true",
            "aria-pressed": translateOn ? "false" : "true",
            onClick: () => setTranslateOn(false)
          }, tt("detail.sourceText")),
          h("button", {
            type: "button",
            className: "dsm-segBtn",
            "data-on": translateOn ? "true" : "false",
            "aria-pressed": translateOn ? "true" : "false",
            onClick: () => setTranslateOn(true)
          }, tt("detail.translatedText"))
        ),
        translateOn ? h("button", { type: "button", className: "dsm-retranslate", onClick: doRetranslate }, tt("detail.retranslate")) : null,
        h(
          "div",
          { style: { marginLeft: "auto" } },
          IconButton({ className: "dsm-iconBtnSm", label: "\u5173\u95ED", onClick: props.onClose }, h(IconClose, null))
        )
      ),
      h(
        "div",
        { className: "dsm-modalBody" },
        h(
          "div",
          { className: "dsm-translateBar" },
          translating ? h("span", null, tt("detail.translating")) : translateError ? h(
            "div",
            { className: "dsm-translateError" },
            h(IconWarning, null),
            h("span", null, translateError)
          ) : null
        ),
        h("div", { className: "dsm-label" }, tt("detail.description")),
        h("div", { className: "dsm-mdScroll" }, error ? h("div", { className: "dsm-error" }, error) : descShown ? renderMarkdown(descShown) : h("span", { className: "dsm-muted" }, tt("detail.noDescription"))),
        h("div", { className: "dsm-label" }, tt("detail.content")),
        h("div", { className: "dsm-mdCard" }, bodyShown ? renderMarkdown(bodyShown) : h("span", { className: "dsm-muted" }, detail ? tt("detail.noContent") : tt("state.loading"))),
        detail && detail.contentTruncated ? h("div", { className: "dsm-footNote" }, tt("detail.truncated")) : null,
        h(
          "div",
          null,
          h("div", { className: "dsm-label" }, tt("detail.scope")),
          h("div", { className: "dsm-value" }, scopeText)
        ),
        h("div", { className: "dsm-label" }, tt("detail.path")),
        h(
          "div",
          { className: "dsm-pathRow" },
          h("code", { className: "dsm-path", title: skill.path || "" }, skill.path || tt("detail.builtinNoFile")),
          IconButton({ className: "dsm-iconBtnSm", label: copied === null ? tt("action.copyPath") : copied ? tt("action.copied") : tt("action.copyFailed"), onClick: copyPath }, h(IconCopy, null))
        )
      )
    );
  }

  // plugins/dsh-skills-manager/src/client/pure.js
  var localeDict = LOCALE_DICT;

  // plugins/dsh-skills-manager/src/client/panel.js
  var PANEL_ID = "skills-manager";
  var PANEL_ORDER = 30;
  var WRITABLE_ROOT_KINDS = /* @__PURE__ */ new Set(["global", "project", "custom"]);
  var BACK_TOP_THRESHOLD = 240;
  function PanelIcon(props) {
    const size = typeof props.size === "number" && props.size > 0 ? props.size : 16;
    return h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 16 16",
        fill: "none",
        "aria-hidden": "true",
        focusable: "false"
      },
      // 摊开的书：技能都落在 SKILL.md 上，也比「插件」行的图形更容易区分。
      h("path", {
        d: "M8 4.7C6.95 3.85 5.5 3.4 3.1 3.4v7.95c2.4 0 3.85.45 4.9 1.3 1.05-.85 2.5-1.3 4.9-1.3V3.4C10.5 3.4 9.05 3.85 8 4.7Z",
        stroke: "currentColor",
        strokeWidth: 1.6,
        strokeLinejoin: "round"
      }),
      h("path", { d: "M8 4.7v7.95", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" })
    );
  }
  function PanelPage(props) {
    const { useState, useRef } = getReact();
    const tt = props.t || fallbackT();
    const [showBackTop, setShowBackTop] = useState(false);
    const scrollRef = useRef(null);
    return h(
      "div",
      { className: "dsm-page" },
      h(
        "div",
        {
          className: "dsm-pageScroll",
          ref: scrollRef,
          onScroll: (event) => setShowBackTop(event.currentTarget.scrollTop > BACK_TOP_THRESHOLD)
        },
        h("div", { className: "dsm-pageContent" }, h(Panel, props))
      ),
      showBackTop ? IconButton({
        className: "dsm-backTop",
        label: tt("action.backToTop"),
        onClick: () => {
          const el = scrollRef.current;
          if (el && typeof el.scrollTo === "function") el.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, h(IconArrowUp, null)) : null
    );
  }
  function Panel(props) {
    const { useState, useEffect, useMemo, useRef, useCallback } = getReact();
    const tt = props.t || fallbackT();
    const [state, setState] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [scope, setScope] = useState({ kind: "global", path: "", title: "" });
    const [detail, setDetail] = useState(null);
    const [notice, setNotice] = useState(null);
    const requestSeq = useRef(0);
    const cwd = scope.kind === "project" ? scope.path : "";
    const load = useCallback((useRefresh) => {
      const seq = requestSeq.current + 1;
      requestSeq.current = seq;
      setLoading(true);
      const params = {};
      if (cwd) params.cwd = cwd;
      if (useRefresh) params.refresh = "1";
      apiGet("/state", params).then((payload) => {
        if (seq !== requestSeq.current) return;
        setState(payload);
        setError(null);
      }).catch((err) => {
        if (seq !== requestSeq.current) return;
        setError(localizeError(err));
      }).finally(() => {
        if (seq !== requestSeq.current) return;
        setLoading(false);
      });
    }, [cwd]);
    useEffect(() => {
      load();
    }, [load]);
    const skills = state && state.skills || [];
    const totals = state && state.totals || { skills: 0, installed: 0 };
    const roots = useMemo(() => state && state.roots || [], [state]);
    const rootTitle = useMemo(() => {
      const map = /* @__PURE__ */ new Map();
      for (const root of roots) map.set(root.label, root.title);
      return map;
    }, [roots]);
    const writableSources = useMemo(() => {
      const set = /* @__PURE__ */ new Set();
      for (const root of roots) {
        if (WRITABLE_ROOT_KINDS.has(root.kind)) set.add(root.label);
      }
      return set;
    }, [roots]);
    const filtered = useMemo(() => filterSkills(skills, search), [skills, search]);
    const installed = useMemo(
      () => filtered.filter((skill) => writableSources.has(skill.source) && skill.exists),
      [filtered, writableSources]
    );
    const builtin = useMemo(
      () => filtered.filter((skill) => !(writableSources.has(skill.source) && skill.exists)),
      [filtered, writableSources]
    );
    const builtinGroups = useMemo(() => {
      const groups = /* @__PURE__ */ new Map();
      for (const skill of builtin) {
        const key = skill.source || "runtime";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(skill);
      }
      return [...groups.entries()];
    }, [builtin]);
    const scopeLabel = scope.kind === "project" ? scope.title + " " + tt("scope.localSuffix") : tt("scope.user");
    const openDirectory = async (skill) => {
      setNotice(null);
      try {
        await apiPost("/reveal", { name: skill.name, cwd });
      } catch (err) {
        setNotice(localizeError(err));
      }
    };
    const renderRow = (skill) => {
      const writable = writableSources.has(skill.source) && skill.exists;
      const issues = Array.isArray(skill.issues) ? skill.issues : [];
      const blocked = issues.length > 0;
      const issueText = issues.map((issue) => tt("issue." + issue, {})).join("\uFF1B");
      return h(
        "div",
        {
          key: skill.name,
          className: "dsm-row",
          role: "button",
          tabIndex: 0,
          onClick: () => setDetail(skill),
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setDetail(skill);
            }
          }
        },
        h("div", { className: "dsm-icon" }, writable ? h(IconSparkle, null) : h(IconLayers, null)),
        h(
          "div",
          { className: "dsm-rowMain" },
          h(
            "div",
            { className: "dsm-rowMainTitle" },
            h("div", { className: "dsm-name", title: skill.name }, skill.name),
            blocked ? h("span", { className: "dsm-badge dsm-badgeWarn", title: tt("list.blockedTitle", { reason: issueText }) }, tt("list.blockedBadge")) : null
          ),
          h("div", { className: "dsm-desc", title: skill.description }, skill.description || tt("detail.noDescription"))
        ),
        writable ? null : h("span", { className: "dsm-badge" }, tt("list.readonly")),
        skill.path ? IconButton({ className: "dsm-iconBtnSm", label: "\u6253\u5F00\u76EE\u5F55 " + skill.name, onClick: () => openDirectory(skill) }, h(IconFolder, null)) : null
      );
    };
    return h(
      "div",
      { className: "dsm-root" },
      h("h1", { className: "dsm-title" }, tt("section.title")),
      h(
        "div",
        { className: "dsm-toolbar" },
        h(
          "div",
          { className: "dsm-toolbarLeft" },
          h(Dropdown, {
            className: "dsm-scope",
            buttonClassName: "dsm-scopeBtn",
            trigger: h(
              "span",
              { style: { display: "inline-flex", alignItems: "center", gap: "8px" } },
              scope.kind === "project" ? h(IconFolder, null) : h(IconMonitor, null),
              h("span", null, scopeLabel)
            ),
            children: (close) => [
              h("button", {
                key: "global",
                type: "button",
                className: "dsm-menuItem",
                onClick: () => {
                  setScope({ kind: "global", path: "", title: "" });
                  close();
                }
              }, h(IconMonitor, null), h("span", null, tt("scope.user")), scope.kind === "global" ? h(IconCheck, null) : null),
              h("div", { key: "label", className: "dsm-menuLabel" }, tt("scope.group.workspaces")),
              (state && state.workspaces || []).map((workspace) => h("button", {
                key: workspace.id,
                type: "button",
                className: "dsm-menuItem",
                onClick: () => {
                  setScope({ kind: "project", path: workspace.path, title: workspace.title });
                  close();
                }
              }, h(IconFolder, null), h("span", null, workspace.title + " " + tt("scope.localSuffix")), scope.path === workspace.path ? h(IconCheck, null) : null))
            ]
          }),
          h("div", { className: "dsm-divider" }),
          h("div", { className: "dsm-meta" }, tt("toolbar.count", { n: totals.skills || 0 }))
        ),
        h(
          "div",
          { className: "dsm-searchWrap" },
          h(IconSearch, { className: "dsm-searchIcon" }),
          h("input", {
            className: "dsm-search",
            value: search,
            placeholder: tt("toolbar.search"),
            onChange: (event) => setSearch(event.target.value)
          }),
          search ? h("button", {
            type: "button",
            className: "dsm-searchClear",
            "aria-label": tt("toolbar.clearSearch"),
            title: tt("toolbar.clearSearch"),
            onClick: () => setSearch("")
          }, h(IconClose, null)) : null
        )
      ),
      h(
        "div",
        { className: "dsm-sectionHead" },
        h("div", { className: "dsm-sectionTitle" }, tt("section.installed"), h("span", { className: "dsm-sectionCount" }, String(installed.length))),
        h(
          "div",
          { className: "dsm-actions" },
          IconButton({ className: "dsm-iconBtn", label: tt("action.refresh"), onClick: () => load(true) }, h(IconRefresh, null))
        )
      ),
      notice ? h("div", { className: "dsm-error" }, notice) : null,
      // 刷新失败也要说出来：只在「还没有任何数据」时才显示错误，等于把刷新失败静默吞掉。
      error && state ? h("div", { className: "dsm-error" }, "\u5237\u65B0\u5931\u8D25\uFF1A" + error) : null,
      state && state.registryError ? h("div", { className: "dsm-footNote" }, tt("state.registryUnavailable")) : null,
      loading && !state ? h("div", { className: "dsm-state" }, tt("state.loading")) : error && !state ? h(
        "div",
        { className: "dsm-state" },
        h("div", null, tt("state.loadFailed", { error })),
        h(
          "div",
          { style: { marginTop: "10px" } },
          h("button", { type: "button", className: "dsm-primary", onClick: load }, h("span", null, "\u91CD\u8BD5"))
        )
      ) : installed.length === 0 && builtin.length === 0 ? h("div", { className: "dsm-state" }, tt("state.empty")) : null,
      installed.length > 0 ? h("div", { className: "dsm-list" }, installed.map(renderRow)) : null,
      builtinGroups.length > 0 ? h(
        "div",
        null,
        h(
          "div",
          { className: "dsm-sectionHead" },
          h("div", { className: "dsm-sectionTitle" }, tt("section.builtin"), h("span", { className: "dsm-sectionCount" }, String(builtin.length)))
        ),
        builtinGroups.map(([source, group]) => h(
          "div",
          { key: source },
          h("div", { className: "dsm-groupTitle" }, rootTitleOf(source) + " \xB7 " + group.length),
          h("div", { className: "dsm-list" }, group.map(renderRow))
        ))
      ) : null,
      detail ? h(DetailModal, { t: tt, skill: detail, cwd, onClose: () => setDetail(null) }) : null
    );
  }
  function apply(ctx) {
    ensureStyles();
    if (ctx === null || typeof ctx !== "object" || !ctx.slots) {
      console.warn("[dsh-skills-manager] \u5BBF\u4E3B\u672A\u63D0\u4F9B slots\uFF0C\u6280\u80FD\u9762\u677F\u672A\u6CE8\u518C\u3002");
      return;
    }
    let boundT = null;
    if (ctx.locale !== null && ctx.locale !== void 0) {
      ctx.effect(
        () => ctx.locale.register(LOCALE_NS, LOCALE_DICT),
        "dsh-skills-manager: locale dictionary"
      );
      boundT = ctx.locale.bind(LOCALE_NS);
      setT(boundT);
    } else {
      console.warn("[dsh-skills-manager] \u5BBF\u4E3B\u672A\u63D0\u4F9B locale\uFF0C\u9762\u677F\u4FDD\u6301\u4E2D\u6587\u3002");
    }
    ctx.slots.inject(
      "main",
      () => ctx.slots.register(
        {
          name: "main",
          key: PANEL_ID,
          // 声明 locale 命名空间：宿主据此注入 t prop（引用随语言切换而变 → 自动重渲染）
          locale: LOCALE_NS
        },
        PanelPage
      )
    );
    ctx.slots.inject(
      "sidebar.panellist",
      () => ctx.slots.register(
        {
          name: "sidebar.panellist",
          id: PANEL_ID,
          order: PANEL_ORDER,
          locale: LOCALE_NS,
          label: () => tr(boundT, "section.title")
        },
        PanelIcon
      )
    );
  }
  var inject = ["slots", "locale"];

  // plugins/dsh-skills-manager/src/client/index.js
  var PURE = Object.freeze({
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
    localizeError
  });
  window.__ModuleLoader__.load({
    // 模块 id 必须与包名逐字一致——宿主按包名注册 factory，id 不符会加载失败。
    id: "@bluechonk/dsh-skills-manager",
    factory: (require2) => {
      bindReact(require2("react"));
      return { inject, apply, __pure: PURE };
    }
  });
})();
