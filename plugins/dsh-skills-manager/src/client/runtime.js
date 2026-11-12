/**
 * React 运行时绑定。
 *
 * 为什么需要这层：client 半的产物是被 __ModuleLoader__ 的 factory(require) 包裹的单文件，
 * 拿不到 ESM import，React 由宿主注入。构建期把各模块打进这个工厂，所以模块不能
 * `import React`——统一从这里取。
 */

let React = null;

/** 由入口在工厂里调用一次，注入宿主的 React。 */
export function bindReact(instance) {
  React = instance;
}

/** 组件内取 React（含 hooks）；必须在 bindReact 之后调用。 */
export function getReact() {
  return React;
}

export function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
}
