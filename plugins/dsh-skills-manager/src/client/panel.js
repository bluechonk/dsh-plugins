/** 主面板：作用域下拉 + 搜索 + 技能列表 + 详情弹窗，以及装配入口。 */

import { h, getReact } from "./runtime.js";
import { apiGet, apiPost } from "./api.js";
import { t, tr, setT, fallbackT, filterSkills, localizeError, LOCALE_NS, LOCALE_DICT } from "./i18n.js";
import { ensureStyles } from "./styles.js";
import { IconFolder, IconSearch, IconClose, IconRefresh, IconArrowUp, IconSparkle, IconLayers } from "./icons.js";
import { IconButton } from "./components.js";
import { DetailModal } from "./detail.js";
import { parseInline, parseMarkdown, mergeChunks, translationChunks, localeDict } from "./pure.js";

export const PANEL_ID = "skills-manager";
export const PANEL_ORDER = 30;

const WRITABLE_ROOT_KINDS = new Set(["global", "project", "custom"]);

/** 滚动超过这个距离才出现「回到顶部」——一进来就常驻会挡住列表右下角。 */
const BACK_TOP_THRESHOLD = 240;

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
  const { useState, useRef } = getReact();
  const tt = props.t || fallbackT();
  const [showBackTop, setShowBackTop] = useState(false);
  const scrollRef = useRef(null);
  return h("div", { className: "dsm-page" },
    h("div", {
      className: "dsm-pageScroll",
      ref: scrollRef,
      onScroll: (event) => setShowBackTop(event.currentTarget.scrollTop > BACK_TOP_THRESHOLD),
    },
      h("div", { className: "dsm-pageContent" }, h(Panel, props)),
    ),
    showBackTop
      ? IconButton({
        className: "dsm-backTop",
        label: tt("action.backToTop"),
        onClick: () => {
          const el = scrollRef.current;
          if (el && typeof el.scrollTo === "function") el.scrollTo({ top: 0, behavior: "smooth" });
        },
      }, h(IconArrowUp, null))
      : null,
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
  const [category, setCategory] = useState("all");
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState(null);
  // 请求序号：连续刷新时，过期响应不得覆盖新数据。
  const requestSeq = useRef(0);

  const load = useCallback((useRefresh) => {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    // 不带 cwd：宿主返回全局 + 用户级 + 所有已登记工作区的技能，由客户端按来源分类。
    const params = {};
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
  }, []);

  useEffect(() => { load(); }, [load]);

  const skills = (state && state.skills) || [];

  const roots = useMemo(() => (state && state.roots) || [], [state]);
  const workspaces = useMemo(() => (state && state.workspaces) || [], [state]);
  const rootTitle = useMemo(() => {
    const map = new Map();
    for (const root of roots) map.set(root.label, root.title);
    return map;
  }, [roots]);
  // 可写根由宿主给出（root.kind），客户端不再另写一份白名单——
  // 否则用户自定义目录里的技能会被误判成只读，行内操作全消失。
  const writableSources = useMemo(() => {
    const set = new Set();
    for (const root of roots) {
      if (WRITABLE_ROOT_KINDS.has(root.kind)) set.add(root.label);
    }
    return set;
  }, [roots]);

  const filtered = useMemo(() => filterSkills(skills, search), [skills, search]);

  // 根标签 → 作用域分类（宿主给出）：工作区根与其余可写根分开统计。
  const sourceKindOf = useMemo(() => {
    const map = new Map();
    for (const root of roots) map.set(root.label, root.kind);
    return map;
  }, [roots]);

  /**
   * 技能属于哪个筛选分类（口径与 DSH 的根语义一致）：
   *   全局 = `<dshHome>/skills`；用户级 = `<agentsHome>/skills`；
   *   内置 = 预设/自定义目录与注册表提供（没有本地文件）的技能；工作区 = 已登记工作区的 `.agents/skills`。
   */
  const categoryOf = useCallback((skill) => {
    if (!(writableSources.has(skill.source) && skill.exists)) return "bundled";
    if (skill.source === "user-dsh") return "global";
    if (skill.source === "user-agents") return "user";
    return sourceKindOf.get(skill.source) === "project" ? "workspace" : "bundled";
  }, [writableSources, sourceKindOf]);

  const counts = useMemo(() => {
    const value = { all: filtered.length, global: 0, user: 0, bundled: 0, workspace: 0 };
    for (const skill of filtered) value[categoryOf(skill)] += 1;
    return value;
  }, [filtered, categoryOf]);

  // 「全部」= 当前搜索下的全部；其余胶囊只看自己那一类。
  const selected = useMemo(
    () => filtered.filter((skill) => category === "all" || categoryOf(skill) === category),
    [filtered, category, categoryOf],
  );

  // 工作区技能的分组名取工作区标题（宿主给出的已登记工作区），其余取根展示名。
  const workspaceTitleOf = useCallback((skill) => {
    const rootPath = String(skill.rootPath || "");
    for (const workspace of workspaces) {
      if (workspace.path !== "" && rootPath.startsWith(workspace.path)) return workspace.title;
    }
    return rootTitle.get(skill.source) || skill.source;
  }, [workspaces, rootTitle]);

  /** 反查技能所在工作区的路径；不在任何工作区下时返回空串（全局作用域）。 */
  const workspacePathOf = useCallback((skill) => {
    const rootPath = String(skill.rootPath || "");
    for (const workspace of workspaces) {
      if (workspace.path !== "" && rootPath.startsWith(workspace.path)) return workspace.path;
    }
    return "";
  }, [workspaces]);

  // 只有「全部」需要按来源分组（工作区再按工作区分）；单一分类视图平铺即可。
  const groupBySource = category === "all" || category === "workspace";
  const groups = useMemo(() => {
    if (!groupBySource) return [];
    const map = new Map();
    for (const skill of selected) {
      const cat = categoryOf(skill);
      const key = cat === "workspace" ? workspaceTitleOf(skill) : tt("badge." + cat);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(skill);
    }
    return [...map.entries()];
  }, [selected, groupBySource, categoryOf, workspaceTitleOf, tt]);

  const openDirectory = async (skill) => {
    setNotice(null);
    try {
      // 工作区技能要把所在工作区作为 cwd 传回去，否则宿主只在全局根里找这个名字。
      await apiPost("/reveal", { name: skill.name, cwd: workspacePathOf(skill) });
    } catch (err) {
      setNotice(localizeError(err));
    }
  };

  const renderCard = (skill) => {
    const writable = writableSources.has(skill.source) && skill.exists;
    // DSH 兼容性：缺 description / 含旧式调用键的技能，DSH 会整个文件忽略。
    const issues = Array.isArray(skill.issues) ? skill.issues : [];
    const blocked = issues.length > 0;
    const issueText = issues.map((issue) => tt("issue." + issue, {})).join("；");
    const cardCategory = categoryOf(skill);
    return h("article", {
      key: skill.name,
      className: "dsm-card",
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
      // 图标沿用原设计：可写技能四角星、只读技能叠层。
      h("div", { className: "dsm-cardIcon" }, writable ? h(IconSparkle, null) : h(IconLayers, null)),
      h("div", { className: "dsm-cardMain" },
        h("div", { className: "dsm-cardTitle" },
          h("span", { className: "dsm-name", title: skill.name }, skill.name),
          blocked ? h("span", { className: "dsm-badge dsm-badgeWarn", title: tt("list.blockedTitle", { reason: issueText }) }, tt("list.blockedBadge")) : null,
        ),
        h("p", { className: "dsm-cardDesc", title: skill.description || undefined },
          skill.description || tt("detail.noDescription")),
      ),
      h("div", { className: "dsm-cardFoot" },
        h("span", { className: "dsm-badge" + (cardCategory === "bundled" ? " dsm-badgeCat" : "") }, tt("badge." + cardCategory)),
        writable ? null : h("span", { className: "dsm-badge" }, tt("list.readonly")),
      ),
      skill.path
        ? IconButton({ className: "dsm-cardOpen", label: "打开目录 " + skill.name, onClick: () => openDirectory(skill) }, h(IconFolder, null))
        : null,
    );
  };

  return h("div", { className: "dsm-root" },
    h("div", { className: "dsm-head" },
      h("h1", { className: "dsm-title" }, tt("section.title")),
      h("div", { className: "dsm-headActions" },
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
        IconButton({ className: "dsm-iconBtn", label: tt("action.refresh"), onClick: () => load(true) }, h(IconRefresh, null)),
      ),
    ),

    // 来源筛选：分类与数量都在这一行，内容随选择切换；不再有作用域下拉。
    h("div", { className: "dsm-filterRow" },
      h("div", { className: "dsm-chips", role: "group" },
        [
          { key: "all", label: tt("filter.all"), count: counts.all },
          { key: "global", label: tt("filter.global"), count: counts.global },
          { key: "user", label: tt("filter.user"), count: counts.user },
          { key: "bundled", label: tt("filter.bundled"), count: counts.bundled },
          { key: "workspace", label: tt("filter.workspace"), count: counts.workspace },
        ].map((item) => h("button", {
          key: item.key,
          type: "button",
          className: "dsm-chip",
          "data-on": String(category === item.key),
          "aria-pressed": String(category === item.key),
          onClick: () => setCategory(item.key),
        }, item.label + " " + item.count)),
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
        : !state
          ? null
          : selected.length === 0
            ? h("div", { className: "dsm-state" }, tt("state.empty"))
            : groupBySource
              ? groups.map(([name, items]) => h("div", { key: name, className: "dsm-group" },
                h("div", { className: "dsm-groupTitle" }, name + " · " + items.length),
                h("div", { className: "dsm-list" }, items.map(renderCard)),
              ))
              : h("div", { className: "dsm-list" }, selected.map(renderCard)),

    detail ? h(DetailModal, { t: tt, skill: detail, cwd: "", onClose: () => setDetail(null) }) : null,
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
