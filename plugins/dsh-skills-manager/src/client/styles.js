/**
 * 面板样式。
 *
 * 只用 --dsw-alias-* 令牌，深浅色自动跟随官方主题；类名统一 dsm-* 前缀。
 */

// 视觉规格对齐 ZCode 的「技能」页（实测取值）：
//   标题 30px/600/-0.75px、内容列 max-w-4xl(896px) 居中、块间距 32px、
//   工具条 justify-between + 12px 间隔、作用域按钮 28px 胶囊、搜索框 36px/12px 圆角/256px、
//   卡片 12px 圆角无描边、行高 65px/内距 12px 16px、图标块 36px/12px 圆角、
//   名称 14px/400、描述 12px 60%、开关 32x18（开=前景色轨 + 背景色钮）。
export const CSS = [
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
  ".dsm-scopeBtn{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border-radius:9999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;font-weight:400;cursor:pointer}",
  ".dsm-scopeBtn:hover{background:var(--dsw-alias-bg-layer-1)}",
  ".dsm-divider{width:1px;height:20px;background:var(--dsw-alias-border-l1);flex:none}",
  ".dsm-meta{color:var(--dsw-alias-label-secondary);font-size:14px;white-space:nowrap}",
  ".dsm-meta b{font-weight:400;color:var(--dsw-alias-label-secondary)}",
  ".dsm-searchWrap{position:relative;display:flex;align-items:center;width:256px;max-width:100%;flex:none}",
  ".dsm-searchWrap .dsm-searchIcon{position:absolute;left:10px;pointer-events:none;color:var(--dsw-alias-label-secondary)}",
  ".dsm-search{width:100%;height:36px;padding:0 30px 0 36px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;outline:none}",
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
  ".dsm-segBtn[data-on=\"true\"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}",
  ".dsm-translateBar{display:flex;align-items:center;gap:8px;margin:-2px 0 10px;min-height:20px;font-size:12.5px;color:var(--dsw-alias-label-secondary)}",
  ".dsm-translateError{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warning,#d29922) 35%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warning,#d29922) 12%, transparent);color:var(--dsw-alias-state-warning,var(--dsw-alias-label-secondary));font-size:12.5px;line-height:1.5}",
  ".dsm-translateError svg{width:14px;height:14px;flex:none}",
  ".dsm-retranslate{height:24px;padding:0 8px;margin-left:8px;border-radius:9999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer}",
  ".dsm-retranslate:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}",
].join("");

/** 注入样式（按 data-plugin-css 去重，热重载原位替换）。 */
export function ensureStyles() {
  if (typeof document === "undefined") return;
  // id 用包名：避免与其它插件的 data-plugin-css 撞名互相覆盖。
  const id = "@bluechonk/dsh-skills-manager";
  let style = document.querySelector('style[data-plugin-css="' + id + '"]');
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("data-plugin-css", id);
    document.head.appendChild(style);
  }
  if (style.textContent !== CSS) style.textContent = CSS;
}
