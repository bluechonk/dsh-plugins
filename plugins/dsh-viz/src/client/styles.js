/**
 * 面板样式。
 *
 * 只用 --dsw-alias-* 令牌，深浅色自动跟随官方主题；类名统一 dviz-* 前缀。
 */

export const CSS = [
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
  ".dviz-plainText{margin:0;white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.6;color:var(--dsw-alias-label-primary)}",
].join("");

/** 注入样式（按 data-plugin-css 去重，热重载原位替换）。 */
export function ensureStyles() {
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
