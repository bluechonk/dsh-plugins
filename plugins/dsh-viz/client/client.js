(() => {
  // plugins/dsh-viz/src/client/runtime.js
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

  // plugins/dsh-viz/src/client/pure.js
  var COMPLETE_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```/g;
  var HAS_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```/;
  var STRIP_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```\r?\n?/g;
  function splitVizFences(text) {
    const source = typeof text === "string" ? text : "";
    const out = [];
    let cursor = 0;
    COMPLETE_FENCE.lastIndex = 0;
    for (const match of source.matchAll(COMPLETE_FENCE)) {
      const index = match.index ?? 0;
      if (index > cursor) out.push({ kind: "markdown", text: source.slice(cursor, index) });
      out.push({ kind: "viz", raw: match[1] });
      cursor = index + match[0].length;
    }
    if (cursor < source.length) out.push({ kind: "markdown", text: source.slice(cursor) });
    return out;
  }
  function hasVizFence(text) {
    return typeof text === "string" && HAS_FENCE.test(text);
  }
  function parseVizSpec(raw) {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text === "") return null;
    let obj = null;
    try {
      const parsed = JSON.parse(text);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) obj = parsed;
    } catch {
      obj = null;
    }
    if (obj !== null) {
      if (typeof obj.path !== "string" || obj.path.trim() === "") return null;
      const height = Number(obj.height);
      return {
        path: obj.path.trim(),
        title: typeof obj.title === "string" ? obj.title : "",
        height: Number.isFinite(height) && height > 0 ? Math.round(height) : null
      };
    }
    if (text.startsWith("{")) {
      const pathMatch = /"path"\s*:\s*"([^"]*)"/.exec(text);
      if (pathMatch === null || pathMatch[1].trim() === "") return null;
      const titleMatch = /"title"\s*:\s*"([^"]*)"/.exec(text);
      const heightMatch = /"height"\s*:\s*(-?\d+(?:\.\d+)?)/.exec(text);
      const height = heightMatch === null ? null : Number(heightMatch[1]);
      return {
        path: pathMatch[1].trim(),
        title: titleMatch === null ? "" : titleMatch[1],
        height: Number.isFinite(height) && height > 0 ? Math.round(height) : null
      };
    }
    const plain = text.replace(/^["']+|["']+$/g, "").trim();
    if (plain === "" || /[\r\n]/.test(plain)) return null;
    const looksLikePath = plain.includes("/") || plain.includes("\\") || plain.startsWith("~");
    if (!looksLikePath) return null;
    return { path: plain, title: "", height: null };
  }
  function stripVizFences(text) {
    const source = typeof text === "string" ? text : "";
    return source.replace(STRIP_FENCE, "").trim();
  }
  function collectVizSpecs(node) {
    const blocks = node && node.data && Array.isArray(node.data.blocks) ? node.data.blocks : [];
    const specs = [];
    for (const block of blocks) {
      if (!block || block.kind !== "text" || typeof block.text !== "string") continue;
      for (const part of splitVizFences(block.text)) {
        if (part.kind !== "viz") continue;
        const spec = parseVizSpec(part.raw);
        if (spec !== null) specs.push(spec);
      }
    }
    return specs;
  }
  function withVizFencesStripped(node) {
    const data = node && node.data;
    if (!data || !Array.isArray(data.blocks)) return node;
    let changed = false;
    const blocks = data.blocks.map((block) => {
      if (!block || block.kind !== "text" || typeof block.text !== "string" || !hasVizFence(block.text)) return block;
      changed = true;
      return { ...block, text: stripVizFences(block.text) };
    });
    if (!changed) return node;
    return { ...node, data: { ...data, blocks } };
  }
  function vizUrlOf(path) {
    return "/dsh-viz/file?path=" + encodeURIComponent(String(path));
  }

  // plugins/dsh-viz/src/client/styles.js
  var CSS = [
    // 卡片：与聊天消息同宽，避免 iframe 把列撑破
    ".dviz-card{display:flex;flex-direction:column;min-width:0;border-radius:var(--dsw-radius-md,12px);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);overflow:hidden}",
    ".dviz-bar{display:flex;align-items:center;gap:8px;min-width:0;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
    ".dviz-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dsw-font-family-code,ui-monospace,monospace)}",
    ".dviz-open{flex:none;color:var(--dsw-alias-link);text-decoration:none;white-space:nowrap}",
    ".dviz-open:hover{text-decoration:underline}",
    ".dviz-frame{display:block;width:100%;height:420px;border:0;background:var(--dsw-alias-bg-base)}",
    ".dviz-error{display:flex;align-items:center;gap:6px;padding:18px;color:var(--dsw-alias-state-error-primary);font-size:12.5px}",
    ".dviz-loading{display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:12.5px;background:var(--dsw-alias-bg-base)}",
    // 官方渲染器捕获不到时的兜底：纯文本，绝不白屏
    ".dviz-plain{display:flex;flex-direction:column;gap:6px;min-width:0}",
    ".dviz-plainText{margin:0;white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.6;color:var(--dsw-alias-label-primary)}"
  ].join("");
  function ensureStyles() {
    if (typeof document === "undefined") return;
    const id = "@bluechonk/dsh-viz";
    let style = document.querySelector('style[data-plugin-css="' + id + '"]');
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-plugin-css", id);
      document.head.appendChild(style);
    }
    if (style.textContent !== CSS) style.textContent = CSS;
  }

  // plugins/dsh-viz/src/client/i18n.js
  function isChinese(t) {
    try {
      return String(t("copy")) === "\u590D\u5236";
    } catch {
      return true;
    }
  }
  function vizText(zh, key) {
    const dict = zh ? { loading: "\u52A0\u8F7D\u4E2D\u2026", failed: "\u53EF\u89C6\u5316\u52A0\u8F7D\u5931\u8D25", open: "\u65B0\u7A97\u53E3\u6253\u5F00", empty: "\u53EF\u89C6\u5316\u5185\u5BB9\u4E3A\u7A7A" } : { loading: "Loading\u2026", failed: "Visualization failed to load", open: "Open in new window", empty: "Nothing to render" };
    return dict[key];
  }

  // plugins/dsh-viz/src/client/assistant.js
  var REASONING_BODY_SLOT = "conversation.chat.reasoning.body";
  var MESSAGE_IMAGES_SLOT = "conversation.chat.message.images";
  var builtin = null;
  var listeners = /* @__PURE__ */ new Set();
  function publish(next) {
    builtin = next;
    for (const listener of listeners) listener();
  }
  function useBuiltinAssistant() {
    const { useSyncExternalStore } = getReact();
    return useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      () => builtin,
      () => builtin
    );
  }
  function isRenderableComponent(value) {
    if (typeof value === "function") return true;
    if (typeof value !== "object" || value === null) return false;
    return typeof value.type === "function";
  }
  function captureBuiltinAssistant(entries, ownComponent) {
    if (!Array.isArray(entries)) return;
    const candidates = entries.filter(
      (entry) => entry && entry.options && entry.options.key === "assistant-step" && entry.component !== ownComponent && isRenderableComponent(entry.component)
    );
    const official = candidates.find((entry) => entry.children && entry.children[REASONING_BODY_SLOT] !== void 0) || candidates[0];
    if (official === void 0 || !isRenderableComponent(official.component)) return;
    publish({ component: official.component, inject: official.inject });
  }
  function VizFrame({ spec, zh }) {
    const { useState, useEffect } = getReact();
    const [state, setState] = useState("loading");
    const url = vizUrlOf(spec.path);
    useEffect(() => {
      let alive = true;
      setState("loading");
      fetch(url, { headers: { accept: "text/html" } }).then((response) => {
        if (alive) setState(response.ok ? "ready" : "failed");
      }).catch(() => {
        if (alive) setState("failed");
      });
      return () => {
        alive = false;
      };
    }, [url]);
    const height = spec.height && spec.height > 0 ? spec.height : 420;
    return h(
      "div",
      { className: "dviz-card" },
      h(
        "div",
        { className: "dviz-bar" },
        h("span", { className: "dviz-title", title: spec.path }, spec.title || spec.path),
        h("a", { className: "dviz-open", href: url, target: "_blank", rel: "noreferrer" }, vizText(zh, "open"))
      ),
      state === "failed" ? h("div", { className: "dviz-error" }, vizText(zh, "failed")) : state === "loading" ? h("div", { className: "dviz-loading", style: { height: String(height) + "px" } }, vizText(zh, "loading")) : h("iframe", {
        className: "dviz-frame",
        src: url,
        // 只给脚本权限：拿不到同源、表单、弹窗与顶层导航，页面里的脚本也碰不到宿主。
        sandbox: "allow-scripts",
        loading: "lazy",
        style: { height: String(height) + "px" },
        title: spec.title || spec.path
      })
    );
  }
  function PlainFallback(props) {
    const blocks = props.node && props.node.data && Array.isArray(props.node.data.blocks) ? props.node.data.blocks : [];
    return h(
      "div",
      { className: "dviz-plain" },
      blocks.map((block, index) => {
        if (!block || block.kind !== "text" || typeof block.text !== "string") return null;
        return h("p", { key: index, className: "dviz-plainText" }, block.text);
      })
    );
  }
  function VizAssistantView(props) {
    const { useMemo, Fragment } = getReact();
    const builtinEntry = useBuiltinAssistant();
    const specs = useMemo(() => collectVizSpecs(props.node), [props.node]);
    const zh = isChinese(props.t);
    if (specs.length === 0) {
      if (builtinEntry) return h(builtinEntry.component, props);
      return h(PlainFallback, props);
    }
    const cleaned = withVizFencesStripped(props.node);
    return h(
      Fragment,
      null,
      builtinEntry ? h(builtinEntry.component, { ...props, node: cleaned }) : h(PlainFallback, { ...props, node: cleaned }),
      specs.map((spec, index) => h(VizFrame, { key: "dviz-" + index, spec, zh }))
    );
  }
  function apply(ctx) {
    ensureStyles();
    const slots = ctx.slots;
    if (!slots || typeof slots.register !== "function") return;
    slots.inject("conversation.chat.node", () => {
      const disposeEntry = slots.register({
        name: "conversation.chat.node",
        key: "assistant-step",
        priority: -1,
        locale: "chat",
        inject: (sessionId) => {
          const source = builtin;
          if (!source || typeof source.inject !== "function") return {};
          try {
            return source.inject(sessionId);
          } catch {
            return {};
          }
        }
      }, VizAssistantView);
      const sync = () => {
        const entries = typeof slots.entries === "function" ? slots.entries("conversation.chat.node") : [];
        captureBuiltinAssistant(entries, VizAssistantView);
        const own = entries.find((entry) => entry && entry.component === VizAssistantView);
        if (own && own.children === void 0) {
          own.children = {
            [REASONING_BODY_SLOT]: { kind: "single", scope: "session" },
            [MESSAGE_IMAGES_SLOT]: { kind: "single", scope: "session" }
          };
        }
      };
      sync();
      const disposeWatch = typeof slots.subscribe === "function" ? slots.subscribe("conversation.chat.node", sync) : null;
      ctx.effect(() => () => {
        if (disposeWatch) disposeWatch();
        disposeEntry();
      }, "dsh-viz: assistant-step shadow");
    });
  }
  var inject = ["slots", "locale"];

  // plugins/dsh-viz/src/client/index.js
  var PURE = Object.freeze({
    splitVizFences,
    parseVizSpec,
    stripVizFences,
    hasVizFence,
    collectVizSpecs,
    withVizFencesStripped,
    vizUrlOf
  });
  window.__ModuleLoader__.load({
    // 模块 id 必须与包名逐字一致——宿主按包名注册 factory，id 不符会加载失败。
    id: "@bluechonk/dsh-viz",
    factory: (require2) => {
      bindReact(require2("react"));
      return { inject, apply, __pure: PURE };
    }
  });
})();
