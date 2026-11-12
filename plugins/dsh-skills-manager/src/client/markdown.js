/** Markdown：纯解析（可单测）+ React 渲染。 */

import { h } from "./runtime.js";

/** 允许的链接协议：其余（javascript:、data: 等）一律降级为纯文本。 */
const SAFE_LINK = /^(?:https?:|mailto:|tel:|#|\/)/i;

/**
 * 行内标记解析（纯函数，不依赖 React）：行内代码、**粗体**、*斜体*、~~删除线~~、[链接](url)。
 * @returns {Array<{ type: string, text: string, href?: string }>}
 */
export function parseInline(text) {
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
export function parseMarkdown(text) {
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
export function renderInline(nodes, keyPrefix) {
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
export function renderBlocks(blocks, keyPrefix) {
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
export function renderMarkdown(text) {
  return renderBlocks(parseMarkdown(text), "b");
}
