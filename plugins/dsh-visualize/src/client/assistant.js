/**
 * 对话内可视化：遮蔽 assistant-step 聊天节点。
 *
 * 机制（与宿主聊天层的扩展点）：
 *   - `conversation.chat.node` 是 keyed / session 作用域槽，key = 节点 kind。官方
 *     assistant-step 条目渲染助手回复；本插件用同一 key、priority -1 遮蔽它。
 *   - 遮蔽条目**只在不影响官方行为的前提下接管**：
 *       · 没有 viz 围栏 → 直接把整个 props 交给官方组件（与原生完全一致）；
 *       · 有 viz 围栏 → 把围栏从文本块里剥掉再交给官方组件，随后追加沙箱 iframe。
 *   - 官方条目被遮蔽后仍留在 slots.entries 里，这里捕获它的 component 与 inject，
 *     由本条目代理注入（inject 直接转发官方结果），保证官方组件拿到的 props 不变。
 *
 * 为什么不自己实现一套 markdown 渲染：那会与官方渲染器长期漂移，且一旦出错就拖白
 * 整个聊天。遮蔽 + 委托把风险限制在「确实写了 viz 围栏」的回复上。
 */

import { h, getReact } from "./runtime.js";
import { collectVisualizeSpecs, withVisualizeFencesStripped, visualizeUrlOf } from "./pure.js";
import { ensureStyles } from "./styles.js";
import { isChinese, visualizeText } from "./i18n.js";

const REASONING_BODY_SLOT = "conversation.chat.reasoning.body";
const MESSAGE_IMAGES_SLOT = "conversation.chat.message.images";

/* ------------------------- 官方条目捕获 ------------------------- */

/** 被遮蔽的官方 assistant-step 条目（component + inject）。 */
let builtin = null;
const listeners = new Set();

function publish(next) {
  builtin = next;
  for (const listener of listeners) listener();
}

/** 订阅官方条目（供组件按官方渲染器的节奏重渲染）。 */
export function useBuiltinAssistant() {
  const { useSyncExternalStore } = getReact();
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => builtin,
    () => builtin,
  );
}

/** 是函数组件或 React.memo 结果。 */
function isRenderableComponent(value) {
  if (typeof value === "function") return true;
  if (typeof value !== "object" || value === null) return false;
  return typeof value.type === "function";
}

/**
 * 从槽位条目里挑出官方 assistant-step（排除自己）。
 * 优先挑声明了 reasoning body 子槽的那条——那才是完整的官方条目。
 */
export function captureBuiltinAssistant(entries, ownComponent) {
  if (!Array.isArray(entries)) return;
  const candidates = entries.filter(
    (entry) => entry && entry.options && entry.options.key === "assistant-step" && entry.component !== ownComponent && isRenderableComponent(entry.component),
  );
  const official = candidates.find((entry) => entry.children && entry.children[REASONING_BODY_SLOT] !== undefined) || candidates[0];
  if (official === undefined || !isRenderableComponent(official.component)) return;
  publish({ component: official.component, inject: official.inject });
}

/* ------------------------- 可视化卡片 ------------------------- */

/** 单张可视化：标题条 + 沙箱 iframe。加载失败给出可见错误，不留白框。 */
function VizFrame({ spec, zh }) {
  const { useState, useEffect } = getReact();
  const [state, setState] = useState("loading");
  const url = visualizeUrlOf(spec.path);
  useEffect(() => {
    let alive = true;
    setState("loading");
    // 先探一次：路由可能返回 404/403（路径越界、文件被删），提前给用户可见反馈。
    fetch(url, { headers: { accept: "text/html" } })
      .then((response) => { if (alive) setState(response.ok ? "ready" : "failed"); })
      .catch(() => { if (alive) setState("failed"); });
    return () => { alive = false; };
  }, [url]);
  const height = spec.height && spec.height > 0 ? spec.height : 420;
  return h("div", { className: "dviz-card" },
    h("div", { className: "dviz-bar" },
      h("span", { className: "dviz-title", title: spec.path }, spec.title || spec.path),
      h("a", { className: "dviz-open", href: url, target: "_blank", rel: "noreferrer" }, visualizeText(zh, "open")),
    ),
    state === "failed"
      ? h("div", { className: "dviz-error" }, visualizeText(zh, "failed"))
      : state === "loading"
        ? h("div", { className: "dviz-loading", style: { height: String(height) + "px" } }, visualizeText(zh, "loading"))
        : h("iframe", {
          className: "dviz-frame",
          src: url,
          // 只给脚本权限：拿不到同源、表单、弹窗与顶层导航，页面里的脚本也碰不到宿主。
          sandbox: "allow-scripts",
          loading: "lazy",
          style: { height: String(height) + "px" },
          title: spec.title || spec.path,
        }),
  );
}

/** 官方组件捕获不到时的兜底：纯文本渲染文本块，绝不白屏。 */
function PlainFallback(props) {
  const blocks = (props.node && props.node.data && Array.isArray(props.node.data.blocks)) ? props.node.data.blocks : [];
  return h("div", { className: "dviz-plain" },
    blocks.map((block, index) => {
      if (!block || block.kind !== "text" || typeof block.text !== "string") return null;
      return h("p", { key: index, className: "dviz-plainText" }, block.text);
    }),
  );
}

/* ------------------------- 遮蔽组件 ------------------------- */

/**
 * 遮蔽 assistant-step 的渲染入口。
 * props 由宿主聊天层注入：node / groupPart / sessionId / t / renderSlot /
 * renderMessageImages / usePresentation …（本条目代理了官方的 inject）。
 */
export function VizAssistantView(props) {
  const { useMemo, Fragment } = getReact();
  const builtinEntry = useBuiltinAssistant();
  const specs = useMemo(() => collectVisualizeSpecs(props.node), [props.node]);
  const zh = isChinese(props.t);

  // 没有 viz 围栏：原样交给官方渲染器，行为与原生一致
  if (specs.length === 0) {
    if (builtinEntry) return h(builtinEntry.component, props);
    return h(PlainFallback, props);
  }

  // 有围栏：剥掉围栏再交给官方组件，随后追加可视化卡片。
  // 用 Fragment 而不是再包一层 div——多一层容器会改变官方回复在聊天流里的布局上下文。
  const cleaned = withVisualizeFencesStripped(props.node);
  return h(Fragment, null,
    builtinEntry ? h(builtinEntry.component, { ...props, node: cleaned }) : h(PlainFallback, { ...props, node: cleaned }),
    specs.map((spec, index) => h(VizFrame, { key: "dviz-" + index, spec, zh })),
  );
}

/* ------------------------- 装配 ------------------------- */

/**
 * 注册遮蔽条目。
 * 条目自身不带 inject：由它代理官方 inject（见 inject 闭包），这样官方组件
 * 收到的 presentation / resolveFilePath / fileMentions 与未被遮蔽时一致。
 */
export function apply(ctx) {
  ensureStyles();
  const slots = ctx.slots;
  if (!slots || typeof slots.register !== "function") return;

  // 等宿主声明 conversation.chat.node 再注册：槽位还没声明时注册会报
  // 「slot ... is not declared（a parent entry's children table must declare it）」。
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
      },
    }, VizAssistantView);

    const sync = () => {
      const entries = typeof slots.entries === "function" ? slots.entries("conversation.chat.node") : [];
      captureBuiltinAssistant(entries, VizAssistantView);
      // 官方条目已经声明过这两个子槽。槽位声明有唯一性检查，注册时再声明一次会报
      // 「already declared」；遮蔽条目要在注册之后往自己的条目记录上补，官方组件的
      // renderSlot 才能解析。注意要改 entries 里的记录，不是 register 的返回值。
      const own = entries.find((entry) => entry && entry.component === VizAssistantView);
      if (own && own.children === undefined) {
        own.children = {
          [REASONING_BODY_SLOT]: { kind: "single", scope: "session" },
          [MESSAGE_IMAGES_SLOT]: { kind: "single", scope: "session" },
        };
      }
    };
    sync();
    // 官方条目可能比本插件更晚注册：订阅槽位变更，出现即捕获。
    const disposeWatch = typeof slots.subscribe === "function" ? slots.subscribe("conversation.chat.node", sync) : null;
    ctx.effect(() => () => {
      if (disposeWatch) disposeWatch();
      disposeEntry();
    }, "dsh-visualize: assistant-step shadow");
  });
}

export const inject = ["slots", "locale"];
