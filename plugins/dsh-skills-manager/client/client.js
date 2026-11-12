// dsh-skills-manager client 半边。
//
// 职责（单文件）：侧边栏导航「技能」独立面板（sidebar.panellist + main keyed）——
//   作用域下拉（用户·本机 / 各工作区）+ 技能计数 + 搜索框；
//   「已安装」分组（可管理：模型调用开关、删除、打开目录）+ 「内置」只读分组；
//   技能详情弹窗（描述 / SKILL.md 正文 Markdown / 范围 / 状态 / 文件路径）；
//   「导入外部 Agent 技能」弹窗（外部目录发现、软链或复制、导入到全局或项目）；
//   「新建」弹窗（生成最小可用技能目录）。
//
// 数据源：同源只读/写入路由 /dsh-skills-manager/*（host 半提供），全部走宿主，不直连文件系统。
// 主题：只用 --dsw-alias-* 令牌，深浅色自动跟随官方主题；类名统一 dsm-* 前缀。

window.__ModuleLoader__.load({
  // 模块 id 必须与包名逐字一致——宿主按包名注册 factory，id 不符会加载失败。
  id: "@bluechonk/dsh-skills-manager",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const React = require("react");
    const h = React.createElement;
    const { useState, useEffect, useMemo, useRef, useCallback } = React;

    const API = "/dsh-skills-manager";

    /* ---------------------------------------------------------------- */
    /* 样式                                                              */
    /* ---------------------------------------------------------------- */

    // 视觉规格对齐 ZCode 的「技能」页（实测取值）：
    //   标题 30px/600/-0.75px、内容列 max-w-4xl(896px) 居中、块间距 32px、
    //   工具条 justify-between + 12px 间隔、作用域按钮 28px 胶囊、搜索框 36px/12px 圆角/256px、
    //   卡片 12px 圆角无描边、行高 65px/内距 12px 16px、图标块 36px/12px 圆角、
    //   名称 14px/400、描述 12px 60%、开关 32x18（开=前景色轨 + 背景色钮）。
    const CSS = [
      // —— 主面板页骨架 ——
      // main 槽位不给页头、内边距与滚动，页面自持（与官方「自动化任务」页一致）。
      ".dsm-page{display:flex;flex-direction:column;width:100%;height:100%;min-height:0;background:var(--dsw-alias-bg-base,transparent)}",
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
      ".dsm-trash{width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
      ".dsm-trash:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2)}",
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
    ].join("");

    /** 注入样式（按 data-plugin-css 去重，热重载原位替换）。 */
    function ensureStyles() {
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

    /* ---------------------------------------------------------------- */
    /* 图标（自绘线性图标，随主题着色）                                     */
    /* ---------------------------------------------------------------- */

    const Svg = (props) => h("svg", Object.assign({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }, props));

    const IconMonitor = (p) => h(Svg, p, h("rect", { x: 3, y: 4, width: 18, height: 13, rx: 2 }), h("path", { d: "M8 21h8M12 17v4" }));
    const IconFolder = (p) => h(Svg, p, h("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }));
    const IconCaret = (p) => h(Svg, Object.assign({ width: 14, height: 14 }, p), h("path", { d: "m6 9 6 6 6-6" }));
    const IconSearch = (p) => h(Svg, p, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "m20 20-3.2-3.2" }));
    const IconRefresh = (p) => h(Svg, p, h("path", { d: "M20 11a8 8 0 1 0-2.3 5.7" }), h("path", { d: "M20 4v7h-7" }));
    const IconTrash = (p) => h(Svg, p, h("path", { d: "M4 7h16M10 11v6M14 11v6" }), h("path", { d: "M6 7l1 13h10l1-13" }), h("path", { d: "M9 7V4h6v3" }));
    const IconClose = (p) => h(Svg, p, h("path", { d: "m6 6 12 12M18 6 6 18" }));
    const IconWarning = (p) => h(Svg, p, h("path", { d: "M12 3 2.5 19.5h19L12 3Z" }), h("path", { d: "M12 10v4" }), h("path", { d: "M12 17.5h.01" }));
    const IconCheck = (p) => h(Svg, p, h("path", { d: "m5 13 4 4 10-10" }));
    const IconCopy = (p) => h(Svg, p, h("rect", { x: 9, y: 9, width: 11, height: 11, rx: 2 }), h("path", { d: "M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" }));
    const IconSparkle = (p) => h(Svg, p, h("path", { d: "M12 3c1 4 2 5 6 6-4 1-5 2-6 6-1-4-2-5-6-6 4-1 5-2 6-6Z" }), h("path", { d: "M18 15c.5 2 1 2.5 3 3-2 .5-2.5 1-3 3-.5-2-1-2.5-3-3 2-.5 2.5-1 3-3Z" }));
    const IconLayers = (p) => h(Svg, p, h("rect", { x: 4, y: 4, width: 12, height: 12, rx: 2 }), h("path", { d: "M9 20h9a2 2 0 0 0 2-2V9" }));

    /* ---------------------------------------------------------------- */
    /* Markdown：纯解析（可单测）+ React 渲染                              */
    /* ---------------------------------------------------------------- */

    /** 允许的链接协议：其余（javascript:、data: 等）一律降级为纯文本。 */
    const SAFE_LINK = /^(?:https?:|mailto:|tel:|#|\/)/i;

    /**
     * 行内标记解析（纯函数，不依赖 React）：行内代码、**粗体**、*斜体*、~~删除线~~、[链接](url)。
     * @returns {Array<{ type: string, text: string, href?: string }>}
     */
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
          // 非白名单协议（如 javascript:）不生成可点链接，只当普通文本。
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

    /**
     * 块级 Markdown 解析（纯函数，不依赖 React）：代码块、标题、分隔线、引用、有序/无序列表、段落。
     * @returns {Array<{ type: string, level?: number, text?: string, items?: string[], children?: any[] }>}
     */
    function parseMarkdown(text) {
      const lines = String(text == null ? "" : text).replace(/\r\n/g, "\n").split("\n");
      const blocks = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === "") { i += 1; continue; }

        if (/^```/.test(line.trim())) {
          const buffer = [];
          i += 1;
          while (i < lines.length && !/^```/.test(lines[i].trim())) {
            buffer.push(lines[i]);
            i += 1;
          }
          i += 1;
          blocks.push({ type: "code", text: buffer.join("\n") });
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
          const buffer = [];
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
            buffer.push(lines[i].replace(/^\s*>\s?/, ""));
            i += 1;
          }
          blocks.push({ type: "quote", children: parseMarkdown(buffer.join("\n")) });
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
        while (
          i < lines.length
          && lines[i].trim() !== ""
          && !/^```/.test(lines[i].trim())
          && !/^\s*[-*+]\s+/.test(lines[i])
          && !/^\s*\d+[.)]\s+/.test(lines[i])
          && !/^#{1,6}\s/.test(lines[i])
          && !/^\s*>\s?/.test(lines[i])
          && !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
        ) {
          buffer.push(lines[i]);
          i += 1;
        }
        if (buffer.length === 0) { i += 1; continue; }
        blocks.push({ type: "p", text: buffer.join("\n") });
      }
      return blocks;
    }

    /** 行内节点 → React 节点。 */
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

    /** 块 → React 元素。 */
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

    /** 对外：Markdown 文本 → React 节点。 */
    function renderMarkdown(text) {
      return renderBlocks(parseMarkdown(text), "b");
    }

    /* ---------------------------------------------------------------- */
    /* 数据访问                                                          */
    /* ---------------------------------------------------------------- */

    /** 宿主返回的错误对象：带上 code/params，界面按 code 查本地化文案。 */
    function makeError(payload, status) {
      const error = new Error((payload && payload.error) || tr(currentT, "error.request-failed", { status }));
      if (payload && payload.code) error.code = payload.code;
      if (payload && payload.params) error.params = payload.params;
      return error;
    }

    /** 请求超时上限：宿主卡住时不让界面永远停在「加载中」。 */
    const REQUEST_TIMEOUT_MS = 10000;

    async function apiGet(path, params) {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(API + path + query, { headers: { accept: "application/json" }, signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) throw makeError(payload, response.status);
        return payload;
      } catch (error) {
        if (error && error.name === "AbortError") throw new Error(tr(currentT, "error.timeout"));
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }

    async function apiPost(path, body) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(API + path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body || {}),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) throw makeError(payload, response.status);
        return payload;
      } catch (error) {
        if (error && error.name === "AbortError") throw new Error(tr(currentT, "error.timeout"));
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }

    /* ---------------------------------------------------------------- */
    /* 翻译                                                             */
    /* ---------------------------------------------------------------- */

    /**
     * 翻译目标语言：技能正文以英文为主，统一译成中文（与宿主的机翻配置一致）。
     * 主机侧的 translator 服务由 dsh-experimental-cot-translation-bundle 提供。
     */
    const TRANSLATE_TARGET = "zh";
    /** 单块上限：宿主 translator 默认 maxTextChars=4000，留出余量避免被拒。 */
    const TRANSLATE_CHUNK_CHARS = 3500;
    /** 并发上限：分块同时翻译，但别一次把宿主 translator 打满。 */
    const TRANSLATE_CONCURRENCY = 3;
    /** 块级缓存：同一块只译一次，反复开关弹窗不重复请求。 */
    const translationCache = new Map();

    /** 按空行把长文本切成不超过上限的块，逐块翻译后拼回。 */
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

    /**
     * 把译好的块填回原文：done[i] 为 null 表示该块还没译好，保留原文。
     * translationChunks 的块拼接起来等于原文，所以按位替换即可，未译好的块原样留下。
     */
    function mergeChunks(chunks, done) {
      let out = "";
      for (let i = 0; i < chunks.length; i += 1) {
        const translated = done[i];
        out += translated === null || translated === undefined ? chunks[i] : translated;
      }
      return out;
    }

    /** 翻译单个块（带缓存）；失败直接抛出，由调用方决定怎么提示。 */
    async function translateChunk(chunk) {
      const key = TRANSLATE_TARGET + "\n" + chunk;
      const cached = translationCache.get(key);
      if (cached !== undefined) return cached;
      const payload = await apiPost("/translate", { text: chunk, targetLanguage: TRANSLATE_TARGET });
      const text = typeof payload.text === "string" ? payload.text : "";
      translationCache.set(key, text);
      return text;
    }

    /* ---------------------------------------------------------------- */
    /* 国际化：宿主 @deepseek-ai/dsh-client-locale 提供 ctx.locale                */
    /*                                                                      */
    /* 用法与 dsh-usage-stats 一致：                                            */
    /*   ctx.locale.register(ns, {zh, en}) 注册字典；组件注册项声明 locale: ns 后，  */
    /*   宿主注入 t prop（引用随语言切换而变 → React 自动重渲染，无需刷新页面）。   */
    /*   字典内联在此：client 半走 __ModuleLoader__ 的工厂格式，不支持相对路径     */
    /*   require——单文件自包含是硬约束。                                          */
    /* ---------------------------------------------------------------- */

    const LOCALE_NS = "dsh-skills-manager";

    const LOCALE_DICT = {
      zh: {
        "section.title": "技能",
        "section.installed": "已安装",
        "section.builtin": "内置",
        "toolbar.count": "技能 {n}",
        "toolbar.search": "搜索技能...",
        "toolbar.clearSearch": "清除搜索",
        "scope.user": "用户 · 本机",
        "scope.localSuffix": "· 本机",
        "scope.group.workspaces": "工作区",
        "scope.personal": "个人",
        "scope.builtin": "内置",
        "scope.workspace": "工作区",
        "action.refresh": "刷新",
        "action.cancel": "取消",
        "action.delete": "删除",
        "action.retry": "重试",
        "action.close": "关闭",
        "action.copyPath": "复制路径",
        "action.copied": "已复制",
        "action.copyFailed": "复制失败",
        "action.rescan": "重新扫描",
        "detail.description": "描述",
        "detail.content": "文件内容",
        "detail.scope": "范围",
        "detail.path": "文件路径",
        "detail.titleSuffix": "详情",
        "list.readonly": "只读",
        "list.blockedBadge": "DSH 不加载",
        "list.blockedTitle": "DSH 不会加载这个技能：{reason}",
        "issue.missing-name": "frontmatter 缺少 name",
        "issue.missing-description": "frontmatter 缺少 description",
        "issue.legacy-invocation-key": "含 DSH 已废弃的调用键（disableModelInvocation / modelInvocable / userInvocable）",
        "issue.invalid-invocation-value": "调用键的取值不是布尔（true / false）",
        "detail.truncated": "文件较大，正文已截断显示。",
        "detail.noDescription": "（该技能没有描述）",
        "detail.noContent": "（该技能没有正文）",
        "detail.builtinNoFile": "（内置技能，无本地文件）",
        "detail.translate": "翻译",
        "detail.sourceText": "原文",
        "detail.translatedText": "译文",
        "detail.translating": "翻译中…",
        "delete.title": "删除技能",
        "delete.question": "确定删除技能「{name}」？",
        "delete.note": "技能目录下的全部文件都会被移除，此操作不可撤销。",
        "state.loading": "加载中…",
        "state.loadFailed": "加载失败：{error}",
        "state.empty": "没有找到任何技能。",
        "state.registryUnavailable": "技能注册表暂不可用，当前仅显示本地扫描结果。",
        "aria.dialog": "对话框",
        "root.userDsh": "全局 DSH",
        "root.userAgents": "全局 Agents",
        "root.projectDsh": "项目 DSH",
        "root.projectAgents": "项目 Agents",
        "root.custom": "自定义目录",
        "root.bundled": "内置目录",
        "root.runtime": "运行时",
        "error.request-failed": "请求失败：{status}",
        "error.timeout": "请求超时（10 秒），宿主无响应",
        "error.internal-error": "内部错误",
        "error.bad-json": "请求体不是合法 JSON",
        "error.body-too-large": "请求体超过 1MB 上限",
        "error.skill-not-found": "找不到技能：{name}",
        "error.skill-not-writable": "该技能没有可改写的 SKILL.md",
        "error.skill-readonly": "内置或运行时技能不可改写",
        "error.not-utf8": "SKILL.md 不是 UTF-8 编码，已拒绝改写以免损坏内容",
        "error.outside-root": "拒绝操作技能根之外的路径",
        "error.delete-root-refused": "拒绝删除技能根目录本身",
        "error.invalid-name": "技能名必须是 kebab-case（仅小写字母、数字与连字符）",
        "error.empty-description": "描述不能为空",
        "error.description-too-long": "描述过长（上限 500 字）",
        "error.target-root-unavailable": "目标根不可用（项目落点必须来自已登记的工作区）",
        "error.skill-exists": "技能已存在：{name}",
        "error.target-exists": "目标已存在同名技能：{name}",
        "error.no-local-dir": "该技能没有可打开的本地目录",
        "error.dir-missing": "目录不存在：{path}",
        "error.translator-unavailable": "翻译服务未启用",
        "error.translation-failed": "翻译失败，显示原文",
        "error.TRANSLATION_TIMEOUT": "翻译超时",
        "error.TRANSLATION_TEXT_LIMIT": "文本过长",
        "error.TRANSLATION_HTTP_ERROR": "翻译服务请求失败",
        "error.TRANSLATION_INVALID_RESPONSE": "翻译结果无效",
        "error.TRANSLATION_REQUEST_FAILED": "翻译请求失败",
      },
      en: {
        "section.title": "Skills",
        "section.installed": "Installed",
        "section.builtin": "Built-in",
        "toolbar.count": "Skills {n}",
        "toolbar.search": "Search skills...",
        "toolbar.clearSearch": "Clear search",
        "scope.user": "User · Local",
        "scope.localSuffix": "· Local",
        "scope.group.workspaces": "Workspaces",
        "scope.personal": "Personal",
        "scope.builtin": "Built-in",
        "scope.workspace": "Workspace",
        "action.refresh": "Refresh",
        "action.cancel": "Cancel",
        "action.delete": "Delete",
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
        "detail.translating": "Translating…",
        "delete.title": "Delete Skill",
        "delete.question": "Delete skill \u201c{name}\u201d?",
        "delete.note": "All files in the skill folder will be removed. This cannot be undone.",
        "state.loading": "Loading…",
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
        "error.skill-not-writable": "This skill has no writable SKILL.md",
        "error.skill-readonly": "Built-in or runtime skills cannot be modified",
        "error.not-utf8": "SKILL.md is not UTF-8 encoded; refusing to modify it to avoid corrupting the content",
        "error.outside-root": "Refusing to operate on paths outside the skill root",
        "error.delete-root-refused": "Refusing to delete the skill root itself",
        "error.invalid-name": "Skill name must be kebab-case (lowercase letters, digits and hyphens only)",
        "error.empty-description": "Description is required",
        "error.description-too-long": "Description is too long (max 500 characters)",
        "error.target-root-unavailable": "Target root unavailable (a project target must come from a registered workspace)",
        "error.skill-exists": "Skill already exists: {name}",
        "error.target-exists": "A skill with the same name already exists at the target: {name}",
        "error.no-local-dir": "This skill has no local folder to open",
        "error.dir-missing": "Folder not found: {path}",
        "error.translator-unavailable": "Translation service not enabled",
        "error.translation-failed": "Translation failed — showing the original",
        "error.TRANSLATION_TIMEOUT": "Translation timed out",
        "error.TRANSLATION_TEXT_LIMIT": "Text too long",
        "error.TRANSLATION_HTTP_ERROR": "The translation service request failed",
        "error.TRANSLATION_INVALID_RESPONSE": "The translation result is invalid",
        "error.TRANSLATION_REQUEST_FAILED": "The translation request failed",
      },
    };

    /** 填 {name} 占位符（与宿主 translate 的规则一致）。 */
    function interpolate(template, params) {
      if (params === null || params === undefined) return template;
      return String(template).replace(/\{(\w+)\}/g, (match, name) =>
        name in params ? String(params[name]) : match,
      );
    }

    /** 中文兜底翻译器：宿主没给 t 时用它（输出与中文版逐字相同）。 */
    function fallbackT() {
      return (key, params) => {
        const dict = LOCALE_DICT.zh;
        const template = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
        return interpolate(template, params);
      };
    }

    /**
     * 取文案：优先用宿主注入的 t，其次用绑定的 currentT，最后中文兜底。
     * 占位符没被替换时告警一次，别让它悄悄显示到界面上。
     */
    function tr(t, key, params) {
      const text = (t === null || t === undefined ? (currentT || fallbackT()) : t)(key, params);
      if (typeof text === "string" && text.includes("{") && text.includes("}")) {
        console.warn("[dsh-skills-manager] unresolved placeholder in translation key: " + key + " -> " + text);
      }
      return text;
    }

    /** 宿主绑定的翻译函数（引用稳定，每次调用读当前语言），供组件外的地方使用。 */
    let currentT = null;

    /** 根标签 → 展示名（由客户端本地化，不依赖宿主的中文标题）。 */
    const ROOT_TITLE_KEYS = {
      "user-dsh": "root.userDsh",
      "user-agents": "root.userAgents",
      "project-dsh": "root.projectDsh",
      "project-agents": "root.projectAgents",
      custom: "root.custom",
      bundled: "root.bundled",
      runtime: "root.runtime",
    };

    function rootTitleOf(source) {
      const key = ROOT_TITLE_KEYS[source];
      return key ? tr(currentT, key) : String(source || "");
    }

    /** 实时过滤：按名称 / 描述 / 路径 / 来源匹配，空查询原样返回。 */
    function filterSkills(skills, query) {
      const needle = String(query || "").trim().toLowerCase();
      if (needle === "") return skills;
      return skills.filter((skill) =>
        [skill.name, skill.description, skill.path, skill.source].some((field) => String(field || "").toLowerCase().includes(needle)));
    }

    /** 宿主返回的错误：按 code 查本地化文案，没有 code 就退回原文。 */
    function localizeError(error) {
      if (!error) return tr(currentT, "error.internal-error");
      const code = error.code ? String(error.code) : "";
      if (code && Object.prototype.hasOwnProperty.call(LOCALE_DICT.zh, "error." + code)) {
        return tr(currentT, "error." + code, error.params || {});
      }
      return error.message || tr(currentT, "error.internal-error");
    }

    /* ---------------------------------------------------------------- */
    /* 小组件                                                            */
    /* ---------------------------------------------------------------- */

    function IconButton(props, children) {
      return h("button", {
        type: "button",
        className: props.className || "dsm-iconBtn",
        "aria-label": props.label,
        title: props.title || props.label,
        onClick: (event) => { event.stopPropagation(); props.onClick(event); },
      }, children);
    }

    function Dropdown(props) {
      const [open, setOpen] = useState(false);
      const ref = useRef(null);
      useEffect(() => {
        if (!open) return undefined;
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
      const menuClass = "dsm-menu";
      return h("div", { className: props.className || "dsm-select", ref: ref },
        h("button", {
          type: "button",
          className: props.buttonClassName || "dsm-selectBtn",
          onClick: () => setOpen((value) => !value),
          "aria-haspopup": "menu",
          "aria-expanded": open ? "true" : "false",
        }, props.trigger, props.hideCaret ? null : h(IconCaret, null)),
        open ? h("div", { className: menuClass, role: "menu" }, props.children(open ? () => setOpen(false) : () => {})) : null,
      );
    }

    function Modal(props) {
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
        "aria-label": props.label || tr(currentT, "aria.dialog"),
        tabIndex: -1,
        ref: ref,
      }, props.children));
    }

    /* ---------------------------------------------------------------- */
    /* 详情弹窗                                                          */
    /* ---------------------------------------------------------------- */

    /** 技能的作用范围：个人 / 项目名 / 内置。 */
    function scopeTextOf(skill) {
      const source = skill.source || "";
      if (source === "project-dsh" || source === "project-agents") {
        const parts = String(skill.rootPath || "").split(/[\\/]+/).filter(Boolean);
        // 根目录形如 <projectRoot>/.dsh/skills，倒退两级即项目根，取其末段做名字。
        return parts.length >= 3 ? parts[parts.length - 3] : tr(currentT, "scope.workspace");
      }
      if (source === "bundled" || source === "runtime") return tr(currentT, "scope.builtin");
      return tr(currentT, "scope.personal");
    }

    function DetailModal(props) {
      const t = props.t || currentT || fallbackT();
      const skill = props.skill;
      const [detail, setDetail] = useState(null);
      const [error, setError] = useState(null);
      const [copied, setCopied] = useState(null);
      // 翻译默认关闭：是否看译文由用户决定，且每次打开详情都从「原文」开始（不做持久化）。
      const [translateOn, setTranslateOn] = useState(false);
      // 分块进度：{ desc: { chunks, done }, content: { chunks, done } }，done[i] 为 null 表示该块还没译好。
      const [progress, setProgress] = useState(null);
      const [translateError, setTranslateError] = useState(null);
      // 同一套文本只译一次（把开关关掉再打开不应重新请求）。
      const translatedKey = useRef(null);
      useEffect(() => {
        let alive = true;
        setDetail(null);
        setError(null);
        setCopied(null);
        setProgress(null);
        setTranslateError(null);
        translatedKey.current = null;
        apiPost("/body", { name: skill.name, cwd: props.cwd })
          .then((payload) => { if (alive) setDetail(payload); })
          .catch((err) => { if (alive) setError(localizeError(err)); });
        return () => { alive = false; };
      }, [skill.name, props.cwd]);

      const copyPath = () => {
        const path = (detail && detail.skill && detail.skill.path) || skill.path || "";
        if (!path) return;
        // 剪贴板可能不可用（非安全上下文）或被拒绝：给出反馈，不要静默失败。
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(path)
            .then(() => setCopied(true))
            .catch(() => setCopied(false));
          return;
        }
        setCopied(false);
      };

      const scopeText = scopeTextOf(skill);
      const descriptionText = (detail && detail.frontmatter && typeof detail.frontmatter.description === "string" && detail.frontmatter.description !== "")
        ? detail.frontmatter.description
        : skill.description || "";
      const bodyText = detail && typeof detail.body === "string" ? detail.body.trim() : "";

      // 翻译：描述与正文各自分块，译好一块就替换一块，不必等全部完成。
      useEffect(() => {
        if (!translateOn) {
          setTranslateError(null);
          return undefined;
        }
        const fields = [["desc", descriptionText], ["content", bodyText]].filter(([, text]) => Boolean(text));
        if (fields.length === 0) return undefined;

        const signature = skill.name + "|" + props.cwd + "|" + descriptionText + "|" + bodyText;
        if (translatedKey.current === signature) return undefined;
        translatedKey.current = signature;

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
                result = await translateChunk(chunks[index]);
              } catch (error) {
                if (!alive) return;
                setTranslateError(localizeError(error));
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
        return () => { alive = false; };
      }, [skill.name, props.cwd, translateOn, detail]);

      // 还有块没译完就算「翻译中」；失败也继续显示已译好的部分。
      const translating = translateOn
        && (!progress || ["desc", "content"].some((key) => progress[key] && progress[key].done.some((value) => value === null)));
      // 译好多少显示多少：未译好的块保留原文。
      const viewOf = (key, original) => {
        const field = progress && progress[key];
        if (!field || !field.done.some((value) => value !== null)) return original;
        return mergeChunks(field.chunks, field.done);
      };
      const descShown = translateOn ? viewOf("desc", descriptionText) : descriptionText;
      const bodyShown = translateOn ? viewOf("content", bodyText) : bodyText;

      return h(Modal, { onClose: props.onClose, label: skill.name + " " + t("detail.titleSuffix") },
        h("div", { className: "dsm-modalHead" },
          h("span", { className: "dsm-modalTitle" }, skill.name),
          h("span", { className: "dsm-badgeSkill", style: { marginLeft: "8px" } }, "Skill"),
          h("div", { className: "dsm-seg", role: "group", "aria-label": t("detail.translate") },
            h("button", {
              type: "button",
              className: "dsm-segBtn",
              "data-on": translateOn ? "false" : "true",
              "aria-pressed": translateOn ? "false" : "true",
              onClick: () => setTranslateOn(false),
            }, t("detail.sourceText")),
            h("button", {
              type: "button",
              className: "dsm-segBtn",
              "data-on": translateOn ? "true" : "false",
              "aria-pressed": translateOn ? "true" : "false",
              onClick: () => setTranslateOn(true),
            }, t("detail.translatedText"))),
          h("div", { style: { marginLeft: "auto" } },
            IconButton({ className: "dsm-iconBtnSm", label: "关闭", onClick: props.onClose }, h(IconClose, null))),
        ),
        h("div", { className: "dsm-modalBody" },
          h("div", { className: "dsm-translateBar" },
            translating
              ? h("span", null, t("detail.translating"))
              : translateError
                ? h("div", { className: "dsm-translateError" },
                  h(IconWarning, null), h("span", null, translateError))
                : null,
          ),
          h("div", { className: "dsm-label" }, t("detail.description")),
          h("div", { className: "dsm-mdScroll" }, error
            ? h("div", { className: "dsm-error" }, error)
            : descShown
              ? renderMarkdown(descShown)
              : h("span", { className: "dsm-muted" }, t("detail.noDescription"))),
          h("div", { className: "dsm-label" }, t("detail.content")),
          h("div", { className: "dsm-mdCard" }, bodyShown
            ? renderMarkdown(bodyShown)
            : h("span", { className: "dsm-muted" }, detail ? t("detail.noContent") : t("state.loading"))),
          detail && detail.contentTruncated ? h("div", { className: "dsm-footNote" }, t("detail.truncated")) : null,
          h("div", null,
            h("div", { className: "dsm-label" }, t("detail.scope")),
            h("div", { className: "dsm-value" }, scopeText),
          ),
          h("div", { className: "dsm-label" }, t("detail.path")),
          h("div", { className: "dsm-pathRow" },
            h("code", { className: "dsm-path", title: skill.path || "" }, skill.path || t("detail.builtinNoFile")),
            IconButton({ className: "dsm-iconBtnSm", label: copied === null ? t("action.copyPath") : copied ? t("action.copied") : t("action.copyFailed"), onClick: copyPath }, h(IconCopy, null)),
          ),
        ),
      );
    }

    /* ---------------------------------------------------------------- */
    /* 主面板                                                            */
    /* ---------------------------------------------------------------- */

    /**
     * 侧边栏导航行与主面板共用同一个 id：宿主按侧边栏条目 id 寻址 `main` keyed slot 的组件。
     * 排在「插件」(0)、「自动化任务」(10)、「使用统计」(20) 之后，「更多」之前。
     */
    const PANEL_ID = "skills-manager";
    const PANEL_ORDER = 30;

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

    const WRITABLE_ROOT_KINDS = new Set(["global", "project", "custom"]);

    function Panel(props) {
      // t 由宿主按 locale 命名空间注入（引用随语言切换而变 → 自动重渲染，无需刷新页面）。
      const t = props.t || currentT || fallbackT();
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

      const scopeLabel = scope.kind === "project" ? scope.title + " " + t("scope.localSuffix") : t("scope.user");

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
        const issueText = issues.map((issue) => t("issue." + issue, {})).join("；");
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
              blocked ? h("span", { className: "dsm-badge dsm-badgeWarn", title: t("list.blockedTitle", { reason: issueText }) }, t("list.blockedBadge")) : null,
            ),
            h("div", { className: "dsm-desc", title: skill.description }, skill.description || t("detail.noDescription")),
          ),
          writable ? null : h("span", { className: "dsm-badge" }, t("list.readonly")),
          writable
            ? IconButton({ className: "dsm-trash", label: "删除 " + skill.name, onClick: () => setConfirmRemove(skill) }, h(IconTrash, null))
            : skill.path
              ? IconButton({ className: "dsm-trash", label: "打开目录 " + skill.name, onClick: () => openDirectory(skill) }, h(IconFolder, null))
              : null,
        );
      };

      return h("div", { className: "dsm-root" },
        h("h1", { className: "dsm-title" }, t("section.title")),

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
              }, h(IconMonitor, null), h("span", null, t("scope.user")), scope.kind === "global" ? h(IconCheck, null) : null),
              h("div", { key: "label", className: "dsm-menuLabel" }, t("scope.group.workspaces")),
              ((state && state.workspaces) || []).map((workspace) => h("button", {
                key: workspace.id,
                type: "button",
                className: "dsm-menuItem",
                onClick: () => { setScope({ kind: "project", path: workspace.path, title: workspace.title }); close(); },
              }, h(IconFolder, null), h("span", null, workspace.title + " " + t("scope.localSuffix")), scope.path === workspace.path ? h(IconCheck, null) : null)),
            ],
          }),
          h("div", { className: "dsm-divider" }),
          h("div", { className: "dsm-meta" }, t("toolbar.count", { n: totals.skills || 0 })),
          ),
          h("div", { className: "dsm-searchWrap" },
            h(IconSearch, { className: "dsm-searchIcon" }),
            h("input", {
              className: "dsm-search",
              value: search,
              placeholder: t("toolbar.search"),
              onChange: (event) => setSearch(event.target.value),
            }),
            search
              ? h("button", {
                type: "button",
                className: "dsm-searchClear",
                "aria-label": t("toolbar.clearSearch"),
                title: t("toolbar.clearSearch"),
                onClick: () => setSearch(""),
              }, h(IconClose, null))
              : null,
          ),
        ),

        h("div", { className: "dsm-sectionHead" },
          h("div", { className: "dsm-sectionTitle" }, t("section.installed"), h("span", { className: "dsm-sectionCount" }, String(installed.length))),
          h("div", { className: "dsm-actions" },
            IconButton({ className: "dsm-iconBtn", label: t("action.refresh"), onClick: () => load(true) }, h(IconRefresh, null)),
          ),
        ),

        notice ? h("div", { className: "dsm-error" }, notice) : null,
        // 刷新失败也要说出来：只在「还没有任何数据」时才显示错误，等于把刷新失败静默吞掉。
        error && state ? h("div", { className: "dsm-error" }, "刷新失败：" + error) : null,
        state && state.registryError ? h("div", { className: "dsm-footNote" }, t("state.registryUnavailable")) : null,

        loading && !state
          ? h("div", { className: "dsm-state" }, t("state.loading"))
          : error && !state
            ? h("div", { className: "dsm-state" },
              h("div", null, t("state.loadFailed", { error: error })),
              h("div", { style: { marginTop: "10px" } },
                h("button", { type: "button", className: "dsm-primary", onClick: load }, h("span", null, "重试"))),
            )
            : installed.length === 0 && builtin.length === 0
              ? h("div", { className: "dsm-state" }, t("state.empty"))
              : null,

        installed.length > 0
          ? h("div", { className: "dsm-list" }, installed.map(renderRow))
          : null,

        builtinGroups.length > 0
          ? h("div", null,
            h("div", { className: "dsm-sectionHead" },
              h("div", { className: "dsm-sectionTitle" }, t("section.builtin"), h("span", { className: "dsm-sectionCount" }, String(builtin.length))),
            ),
            builtinGroups.map(([source, group]) => h("div", { key: source },
              h("div", { className: "dsm-groupTitle" }, rootTitleOf(source) + " · " + group.length),
              h("div", { className: "dsm-list" }, group.map(renderRow)),
            )),
          )
          : null,

        detail ? h(DetailModal, { t, skill: detail, cwd, onClose: () => setDetail(null) }) : null,
        confirmRemove
          ? h(Modal, { onClose: () => setConfirmRemove(null), label: t("delete.title") },
            h("div", { className: "dsm-modalHead" },
              h("span", { className: "dsm-modalTitle" }, "删除技能"),
              h("div", { style: { marginLeft: "auto" } },
                IconButton({ className: "dsm-iconBtnSm", label: "关闭", onClick: () => setConfirmRemove(null) }, h(IconClose, null))),
            ),
            h("div", { className: "dsm-modalBody" },
              h("div", null, t("delete.question", { name: confirmRemove.name })),
              h("div", { className: "dsm-pathRow", style: { marginTop: "8px" } },
                h("code", { className: "dsm-path", title: confirmRemove.path || "" }, confirmRemove.path || ""),
              ),
              h("div", { className: "dsm-footNote" }, t("delete.note")),
              h("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" } },
                h("button", { type: "button", className: "dsm-btnText", onClick: () => setConfirmRemove(null) }, t("action.cancel")),
                h("button", { type: "button", className: "dsm-primary", onClick: () => removeSkill(confirmRemove) },
                  h(IconTrash, null), h("span", null, t("action.delete"))),
              ),
            ),
          )
          : null,
      );
    }

    /* ---------------------------------------------------------------- */
    /* 装配                                                              */
    /* ---------------------------------------------------------------- */

    function apply(ctx) {
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
        currentT = boundT;
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

    const inject = ["slots", "locale"];

    exports.apply = apply;
    exports.inject = inject;
    // 纯函数直测面：Markdown 解析与作用域判定不依赖 React/DOM，可在 node 里直接断言。
    exports.__pure = Object.freeze({
      parseInline,
      parseMarkdown,
      filterSkills,
      mergeChunks,
      scopeTextOf,
      translationChunks,
      localeDict: LOCALE_DICT,
      localeNs: LOCALE_NS,
      interpolate,
      fallbackT,
      tr,
      localizeError,
    });
    return module.exports;
  },
});
