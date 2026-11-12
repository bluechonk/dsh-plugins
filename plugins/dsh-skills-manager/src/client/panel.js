/** 主面板：作用域下拉 + 搜索 + 技能列表 + 详情/删除弹窗，以及装配入口。 */

import { h, getReact } from "./runtime.js";
import { apiGet, apiPost } from "./api.js";
import { t, tr, setT, fallbackT, filterSkills, rootTitleOf, localizeError, LOCALE_NS, LOCALE_DICT } from "./i18n.js";
import { ensureStyles } from "./styles.js";
import { IconMonitor, IconFolder, IconSearch, IconClose, IconRefresh, IconTrash, IconSparkle, IconLayers, IconCheck, IconCaret } from "./icons.js";
import { Modal, Dropdown, IconButton } from "./components.js";
import { DetailModal } from "./detail.js";
import { parseInline, parseMarkdown, mergeChunks, translationChunks, localeDict } from "./pure.js";

export const PANEL_ID = "skills-manager";
export const PANEL_ORDER = 30;

const WRITABLE_ROOT_KINDS = new Set(["global", "project", "custom"]);

/** 侧边栏导航行图标：装饰性 16px 线性图标，尺寸由宿主按展开/收起给 16/18。 */
function PanelIcon(props) {
  const size = typeof props.size === "number" && props.size > 0 ? props.size : 16;
  return h("svg", {
    width: size, height: size, viewBox: "0 0 16 16", fill: "none",
    "aria-hidden": "true", focusable: "false",
  },
    // 摊开的书：技能都落在 SKILL.md 上，也比「插件」行的图形更容易区分。
    h("path", {
      d: "M8 4.7C6.95 3.85 5.5 3.4 3.1 3.4v7.95c2.4 0 3.85.45 4.9 1.3 1.05-.85 2.5-1.3 4.9-1.3V3.4C10.5 3.4 9.05 3.85 8 4.7Z",
      stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round",
    }),
    h("path", { d: "M8 4.7v7.95", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }),
  );
}

/** 页面骨架：主面板铺满内容列，滚动交给内层，内容列限宽居中。 */
function PanelPage(props) {
  return h("div", { className: "dsm-page" },
    h("div", { className: "dsm-pageScroll" },
      h("div", { className: "dsm-pageContent" }, h(Panel, props)),
    ),
  );
}

function Panel(props) {
  const { useState, useEffect, useMemo, useRef, useCallback } = getReact();
  // t 由宿主按 locale 命名空间注入（引用随语言切换而变 → 自动重渲染，无需刷新页面）。
  const tt = props.t || fallbackT();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState({ kind: "global", path: "", title: "" });
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  // 请求序号：作用域快速切换时，过期响应不得覆盖新数据。
  const requestSeq = useRef(0);

  const cwd = scope.kind === "project" ? scope.path : "";

  const load = useCallback((useRefresh) => {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    const params = {};
    if (cwd) params.cwd = cwd;
    // 手动刷新时让宿主绕过缓存，强制重扫磁盘。
    if (useRefresh) params.refresh = "1";
    apiGet("/state", params)
      .then((payload) => {
        if (seq !== requestSeq.current) return;
        setState(payload);
        setError(null);
      })
      .catch((err) => {
        if (seq !== requestSeq.current) return;
        setError(localizeError(err));
      })
      .finally(() => {
        if (seq !== requestSeq.current) return;
        setLoading(false);
      });
  }, [cwd]);

  // 写操作完成后的刷新必须走「最新」的加载器，不能用点击那一刻闭包里的旧 load()：
  // 否则作用域切换后，旧闭包会把面板钉回旧作用域，用户按新作用域理解去删技能就可能误删。
  const loadRef = useRef(load);
  useEffect(() => { loadRef.current = load; }, [load]);

  useEffect(() => { load(); }, [load]);

  const skills = (state && state.skills) || [];
  const totals = (state && state.totals) || { skills: 0, installed: 0 };

  const roots = useMemo(() => (state && state.roots) || [], [state]);
  const rootTitle = useMemo(() => {
    const map = new Map();
    for (const root of roots) map.set(root.label, root.title);
    return map;
  }, [roots]);
  // 可写根由宿主给出（root.kind），客户端不再另写一份白名单——
  // 否则用户自定义目录里的技能会被误判成只读，开关与删除全消失。
  const writableSources = useMemo(() => {
    const set = new Set();
    for (const root of roots) {
      if (WRITABLE_ROOT_KINDS.has(root.kind)) set.add(root.label);
    }
    return set;
  }, [roots]);

  const filtered = useMemo(() => filterSkills(skills, search), [skills, search]);

  const installed = useMemo(
    () => filtered.filter((skill) => writableSources.has(skill.source) && skill.exists),
    [filtered, writableSources],
  );
  const builtin = useMemo(
    () => filtered.filter((skill) => !(writableSources.has(skill.source) && skill.exists)),
    [filtered, writableSources],
  );

  const builtinGroups = useMemo(() => {
    const groups = new Map();
    for (const skill of builtin) {
      const key = skill.source || "runtime";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(skill);
    }
    return [...groups.entries()];
  }, [builtin]);

  const scopeLabel = scope.kind === "project" ? scope.title + " " + tt("scope.localSuffix") : tt("scope.user");

  const removeSkill = async (skill) => {
    setNotice(null);
    try {
      await apiPost("/remove", { name: skill.name, cwd });
      setConfirmRemove(null);
      loadRef.current();
    } catch (err) {
      setNotice(localizeError(err));
    }
  };

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
    // DSH 兼容性：缺 description / 含旧式调用键的技能，DSH 会整个文件忽略。
    const issues = Array.isArray(skill.issues) ? skill.issues : [];
    const blocked = issues.length > 0;
    const issueText = issues.map((issue) => tt("issue." + issue, {})).join("；");
    return h("div", {
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
      },
    },
      h("div", { className: "dsm-icon" }, writable ? h(IconSparkle, null) : h(IconLayers, null)),
      h("div", { className: "dsm-rowMain" },
        h("div", { className: "dsm-rowMainTitle" },
          h("div", { className: "dsm-name", title: skill.name }, skill.name),
          blocked ? h("span", { className: "dsm-badge dsm-badgeWarn", title: tt("list.blockedTitle", { reason: issueText }) }, tt("list.blockedBadge")) : null,
        ),
        h("div", { className: "dsm-desc", title: skill.description }, skill.description || tt("detail.noDescription")),
      ),
      writable ? null : h("span", { className: "dsm-badge" }, tt("list.readonly")),
      writable
        ? IconButton({ className: "dsm-trash", label: "删除 " + skill.name, onClick: () => setConfirmRemove(skill) }, h(IconTrash, null))
        : skill.path
          ? IconButton({ className: "dsm-trash", label: "打开目录 " + skill.name, onClick: () => openDirectory(skill) }, h(IconFolder, null))
          : null,
    );
  };

  return h("div", { className: "dsm-root" },
    h("h1", { className: "dsm-title" }, tt("section.title")),

    h("div", { className: "dsm-toolbar" },
      h("div", { className: "dsm-toolbarLeft" },
        h(Dropdown, {
          className: "dsm-scope",
          buttonClassName: "dsm-scopeBtn",
          trigger: h("span", { style: { display: "inline-flex", alignItems: "center", gap: "8px" } },
            scope.kind === "project" ? h(IconFolder, null) : h(IconMonitor, null),
            h("span", null, scopeLabel),
          ),
          children: (close) => [
            h("button", {
              key: "global",
              type: "button",
              className: "dsm-menuItem",
              onClick: () => { setScope({ kind: "global", path: "", title: "" }); close(); },
            }, h(IconMonitor, null), h("span", null, tt("scope.user")), scope.kind === "global" ? h(IconCheck, null) : null),
            h("div", { key: "label", className: "dsm-menuLabel" }, tt("scope.group.workspaces")),
            ((state && state.workspaces) || []).map((workspace) => h("button", {
              key: workspace.id,
              type: "button",
              className: "dsm-menuItem",
              onClick: () => { setScope({ kind: "project", path: workspace.path, title: workspace.title }); close(); },
            }, h(IconFolder, null), h("span", null, workspace.title + " " + tt("scope.localSuffix")), scope.path === workspace.path ? h(IconCheck, null) : null)),
          ],
        }),
        h("div", { className: "dsm-divider" }),
        h("div", { className: "dsm-meta" }, tt("toolbar.count", { n: totals.skills || 0 })),
      ),
      h("div", { className: "dsm-searchWrap" },
        h(IconSearch, { className: "dsm-searchIcon" }),
        h("input", {
          className: "dsm-search",
          value: search,
          placeholder: tt("toolbar.search"),
          onChange: (event) => setSearch(event.target.value),
        }),
        search
          ? h("button", {
            type: "button",
            className: "dsm-searchClear",
            "aria-label": tt("toolbar.clearSearch"),
            title: tt("toolbar.clearSearch"),
            onClick: () => setSearch(""),
          }, h(IconClose, null))
          : null,
      ),
    ),

    h("div", { className: "dsm-sectionHead" },
      h("div", { className: "dsm-sectionTitle" }, tt("section.installed"), h("span", { className: "dsm-sectionCount" }, String(installed.length))),
      h("div", { className: "dsm-actions" },
        IconButton({ className: "dsm-iconBtn", label: tt("action.refresh"), onClick: () => load(true) }, h(IconRefresh, null)),
      ),
    ),

    notice ? h("div", { className: "dsm-error" }, notice) : null,
    // 刷新失败也要说出来：只在「还没有任何数据」时才显示错误，等于把刷新失败静默吞掉。
    error && state ? h("div", { className: "dsm-error" }, "刷新失败：" + error) : null,
    state && state.registryError ? h("div", { className: "dsm-footNote" }, tt("state.registryUnavailable")) : null,

    loading && !state
      ? h("div", { className: "dsm-state" }, tt("state.loading"))
      : error && !state
        ? h("div", { className: "dsm-state" },
          h("div", null, tt("state.loadFailed", { error: error })),
          h("div", { style: { marginTop: "10px" } },
            h("button", { type: "button", className: "dsm-primary", onClick: load }, h("span", null, "重试"))),
        )
        : installed.length === 0 && builtin.length === 0
          ? h("div", { className: "dsm-state" }, tt("state.empty"))
          : null,

    installed.length > 0
      ? h("div", { className: "dsm-list" }, installed.map(renderRow))
      : null,

    builtinGroups.length > 0
      ? h("div", null,
        h("div", { className: "dsm-sectionHead" },
          h("div", { className: "dsm-sectionTitle" }, tt("section.builtin"), h("span", { className: "dsm-sectionCount" }, String(builtin.length))),
        ),
        builtinGroups.map(([source, group]) => h("div", { key: source },
          h("div", { className: "dsm-groupTitle" }, rootTitleOf(source) + " · " + group.length),
          h("div", { className: "dsm-list" }, group.map(renderRow)),
        )),
      )
      : null,

    detail ? h(DetailModal, { t: tt, skill: detail, cwd, onClose: () => setDetail(null) }) : null,
    confirmRemove
      ? h(Modal, { onClose: () => setConfirmRemove(null), label: tt("delete.title") },
        h("div", { className: "dsm-modalHead" },
          h("span", { className: "dsm-modalTitle" }, "删除技能"),
          h("div", { style: { marginLeft: "auto" } },
            IconButton({ className: "dsm-iconBtnSm", label: "关闭", onClick: () => setConfirmRemove(null) }, h(IconClose, null))),
        ),
        h("div", { className: "dsm-modalBody" },
          h("div", null, tt("delete.question", { name: confirmRemove.name })),
          h("div", { className: "dsm-pathRow", style: { marginTop: "8px" } },
            h("code", { className: "dsm-path", title: confirmRemove.path || "" }, confirmRemove.path || ""),
          ),
          h("div", { className: "dsm-footNote" }, tt("delete.note")),
          h("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" } },
            h("button", { type: "button", className: "dsm-btnText", onClick: () => setConfirmRemove(null) }, tt("action.cancel")),
            h("button", { type: "button", className: "dsm-primary", onClick: () => removeSkill(confirmRemove) },
              h(IconTrash, null), h("span", null, tt("action.delete"))),
          ),
        ),
      )
      : null,
  );
}

/** 装配：注册 locale 字典与两个槽位。 */
export function apply(ctx) {
  ensureStyles();
  if (ctx === null || typeof ctx !== "object" || !ctx.slots) {
    console.warn("[dsh-skills-manager] 宿主未提供 slots，技能面板未注册。");
    return;
  }
  // 国际化：宿主 @deepseek-ai/dsh-client-locale 提供 ctx.locale。
  // 字典注册走 ctx.effect——卸载时自动注销，避免热重载后「同一命名空间重复注册」抛错。
  let boundT = null;
  if (ctx.locale !== null && ctx.locale !== undefined) {
    ctx.effect(
      () => ctx.locale.register(LOCALE_NS, LOCALE_DICT),
      "dsh-skills-manager: locale dictionary",
    );
    // 绑定函数引用稳定，但每次调用读**当前**语言——导航 label 用它即可跟随切换
    boundT = ctx.locale.bind(LOCALE_NS);
    setT(boundT);
  } else {
    console.warn("[dsh-skills-manager] 宿主未提供 locale，面板保持中文。");
  }
  // 主面板内容：keyed slot 按侧边栏条目 id 寻址；缺了它，点导航行会抛错并保留当前面板。
  ctx.slots.inject("main", () =>
    ctx.slots.register(
      {
        name: "main",
        key: PANEL_ID,
        // 声明 locale 命名空间：宿主据此注入 t prop（引用随语言切换而变 → 自动重渲染）
        locale: LOCALE_NS,
      },
      PanelPage,
    ),
  );
  // 侧边栏导航行：list slot，图标与 label 由宿主渲染，选中态/收起提示由宿主处理。
  ctx.slots.inject("sidebar.panellist", () =>
    ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: PANEL_ORDER,
        locale: LOCALE_NS,
        label: () => tr(boundT, "section.title"),
      },
      PanelIcon,
    ),
  );
}

export const inject = ["slots", "locale"];
