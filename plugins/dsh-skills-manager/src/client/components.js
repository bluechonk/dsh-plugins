/** 通用小组件：图标按钮、弹窗。 */

import { h, getReact } from "./runtime.js";
import { t } from "./i18n.js";

export function IconButton(props, children) {
  return h("button", {
    type: "button",
    className: props.className || "dsm-iconBtn",
    "aria-label": props.label,
    title: props.title || props.label,
    onClick: (event) => { event.stopPropagation(); props.onClick(event); },
  }, children);
}

export function Modal(props) {
  const { useEffect, useRef } = getReact();
  const ref = useRef(null);
  const restoreRef = useRef(null);
  useEffect(() => {
    restoreRef.current = document.activeElement;
    if (ref.current) ref.current.focus();
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      // 只关自己：别让宿主的 Escape 处理（关面板、关侧栏）一起触发。
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
    onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose(); },
  }, h("div", {
    className: "dsm-modal" + (props.modalClassName ? " " + props.modalClassName : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": props.label || t("aria.dialog"),
    tabIndex: -1,
    ref: ref,
  }, props.children));
}
