// render.test.mjs —— 面板装配后的渲染面直测（最小 React 桩 + 假 fetch）。
//
// 为什么需要这一层：client.test.mjs 只覆盖纯函数，组件体里的错误抓不到——实测踩过一次
// `ReferenceError: getReact is not defined`（重构时把 import 删了），结果是点卡片整个面板白屏，
// 单测全绿。这里把 main 槽位的页面组件**真正渲染出来**并触发点击，让每个组件体都执行一遍。

import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 假 /state：一个用户级技能 + 一个只读内置技能。 */
const STATE_PAYLOAD = {
  ok: true,
  roots: [{ label: "user-dsh", title: "全局 DSH", path: "/tmp/dsm-test", kind: "global", rank: 400, exists: true, count: 1 }],
  skills: [
    {
      name: "alpha-skill",
      description: "第一个技能",
      source: "user-dsh",
      rank: 400,
      path: "/tmp/dsm-test/alpha-skill/SKILL.md",
      dir: "/tmp/dsm-test/alpha-skill",
      exists: true,
      issues: [],
      provider: "filesystem",
      root: "user-dsh",
      rootPath: "/tmp/dsm-test",
    },
    {
      name: "beta-skill",
      description: "内置技能",
      source: "runtime",
      rank: 900,
      path: null,
      dir: null,
      exists: false,
      embedded: true,
      issues: [],
      provider: "test",
      root: "runtime",
      rootPath: null,
    },
  ],
  totals: { skills: 2, installed: 1, missing: 0 },
  workspaces: [],
  registryError: null,
  diagnostics: {},
};

const BODY_PAYLOAD = {
  ok: true,
  skill: STATE_PAYLOAD.skills[0],
  frontmatter: { name: "alpha-skill", description: "第一个技能" },
  body: "# alpha\n\n正文",
};

/** 最小 React 桩：hooks 按依赖记忆，setState 排队重渲染（模拟批处理）。 */
function makeReact() {
  const state = [];
  let index = 0;
  let effects = [];
  let rerender = null;

  /** deps 缺失、长度不同或任一不等 → 需要重算/重跑。 */
  const depsChanged = (prev, deps) => {
    if (!prev || !Array.isArray(prev.deps)) return true;
    if (!Array.isArray(deps) || prev.deps.length !== deps.length) return true;
    return deps.some((value, i) => value !== prev.deps[i]);
  };

  const React = {
    createElement(type, props, ...children) {
      // 与真 React 一致：children 同时挂在 props 上（组件可能直接读 props.children）。
      const merged = Object.assign({}, props);
      if (children.length > 0) merged.children = children.length === 1 ? children[0] : children;
      return { type, props: merged, children };
    },
    useState(initial) {
      const slot = index++;
      if (!(slot in state)) state[slot] = typeof initial === "function" ? initial() : initial;
      return [state[slot], (value) => {
        state[slot] = typeof value === "function" ? value(state[slot]) : value;
        if (rerender) Promise.resolve().then(rerender);
      }];
    },
    useRef(value) {
      const slot = index++;
      if (!(slot in state)) state[slot] = { current: value };
      return state[slot];
    },
    useCallback(fn, deps) {
      const slot = index++;
      if (depsChanged(state[slot], deps)) state[slot] = { fn, deps };
      return state[slot].fn;
    },
    useEffect(fn, deps) {
      const slot = index++;
      if (depsChanged(state[slot], deps)) {
        state[slot] = { deps };
        effects.push({ fn });
      }
    },
    useMemo(fn, deps) {
      const slot = index++;
      if (depsChanged(state[slot], deps)) state[slot] = { value: fn(), deps };
      return state[slot].value;
    },
  };

  return {
    React,
    /** 渲染一次；挂载副作用立即执行一轮（宿主里也是挂载后执行）。 */
    render(component, props) {
      let tree = null;
      const draw = () => {
        index = 0;
        tree = build(component(props));
        const pending = effects;
        effects = [];
        for (const effect of pending) effect.fn();
        return tree;
      };
      rerender = draw;
      draw();
      return { get tree() { return tree; } };
    },
  };
}

/** 递归展开函数组件：任一组件体抛错就带着组件名抛出，避免「静默少渲染」。 */
function build(node) {
  if (node === null || node === undefined) return null;
  if (Array.isArray(node)) return node.map(build);
  if (typeof node !== "object") return node;
  if (typeof node.type === "function") {
    let inner;
    try {
      inner = node.type(node.props || {});
    } catch (error) {
      throw new Error(`组件 ${node.type.name || "<anonymous>"} 渲染失败: ${error && error.message}`);
    }
    return build(inner);
  }
  return { type: node.type, props: node.props || {}, children: (node.children || []).map(build) };
}

function collect(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { for (const item of node) collect(item, out); return out; }
  out.push(node);
  for (const child of node.children || []) collect(child, out);
  return out;
}

const byClass = (tree, className) => collect(tree).filter((node) => node.props && node.props.className === className);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const { React, render } = makeReact();

function stubRequire(id) {
  if (id === "react") return React;
  if (id === "react/jsx-runtime") return { jsx: (t, p) => ({ type: t, props: p }), jsxs: (t, p) => ({ type: t, props: p }) };
  throw new Error("render.test 桩未覆盖的 require：" + id);
}

let captured = null;
globalThis.window = { __ModuleLoader__: { load: (def) => { captured = def.factory(stubRequire); } } };
await import(pathToFileURL(join(ROOT, "client", "client.js")).href);
delete globalThis.window;
assert.ok(captured && typeof captured.apply === "function", "client 产物物化失败");

// 最小 DOM 桩：样式注入与弹窗副作用会摸 document。
globalThis.document = {
  activeElement: null,
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  createElement() { return { setAttribute() {}, style: {}, textContent: "" }; },
  head: { appendChild() {} },
};

const slots = {};
captured.apply({
  get: () => null,
  inject: (names, fn) => fn({}),
  effect: () => () => {},
  slots: {
    inject: (name, fn) => fn(),
    register: (def, component) => {
      const key = def.key ? "key:" + def.key : def.id ? "id:" + def.id : def.name;
      slots[key] = { def, component };
    },
  },
});
const PanelPage = slots["key:skills-manager"].component;

/** 假 fetch：按 URL 分派 /state 与 /body。 */
globalThis.fetch = async (url) => {
  const text = String(url);
  const payload = text.includes("/body") ? BODY_PAYLOAD : STATE_PAYLOAD;
  return { ok: true, json: async () => payload };
};

test("渲染主面板：筛选胶囊带数量、技能一行一个", async () => {
  const view = render(PanelPage, { t: null });
  await flush();

  const chips = byClass(view.tree, "dsm-chip");
  assert.equal(chips.length, 5, "应有 5 个来源胶囊（全部/全局/用户级/内置/工作区）");
  const labels = chips.map((chip) => (chip.children || []).join(""));
  assert.deepEqual(labels, ["全部 2", "全局 1", "用户级 0", "内置 1", "工作区 0"], "胶囊文案与数量应来自 /state");

  const cards = byClass(view.tree, "dsm-card");
  assert.equal(cards.length, 2, "默认「全部」视图应渲染两行技能");
  // 全局根（user-dsh）的技能标「全局」，运行时提供的只读技能标「内置」。
  const badges = collect(view.tree).filter((node) => node.props && /^dsm-badge( |$)/.test(String(node.props.className)));
  assert.ok(badges.some((node) => (node.children || []).join("") === "全局"), "全局根技能应标「全局」");
  assert.ok(badges.some((node) => (node.children || []).join("") === "内置"), "注册表技能应标「内置」");
  assert.ok(byClass(view.tree, "dsm-head"), "头部应存在");
  assert.ok(byClass(view.tree, "dsm-search").length > 0, "搜索框应存在");
});

test("点卡片开详情、再关闭：Modal 与 DetailModal 的组件体都要执行到", async () => {
  const view = render(PanelPage, { t: null });
  await flush();

  const firstCard = byClass(view.tree, "dsm-card")[0];
  assert.ok(firstCard, "应有卡片");
  firstCard.props.onClick();

  // Modal 用 useEffect 拉取正文；await 两拍确保状态回写并触发重渲染。
  await flush();
  await flush();

  const modal = byClass(view.tree, "dsm-modal");
  assert.equal(modal.length, 1, "点击卡片后应渲染详情弹窗");
  const title = collect(modal[0]).find((node) => node.props && node.props.className === "dsm-modalTitle");
  assert.ok(title, "弹窗应有标题节点");

  const close = collect(modal[0]).find((node) => node.props && node.props.className === "dsm-iconBtnSm");
  assert.ok(close, "弹窗应有复制/关闭按钮");
  close.props.onClick({ stopPropagation: () => {} });
  await flush();

  assert.equal(byClass(view.tree, "dsm-modal").length, 0, "关闭后弹窗应消失");
});
