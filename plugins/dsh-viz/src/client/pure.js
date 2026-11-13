/**
 * viz 围栏解析（纯函数，client 半直测面）。
 *
 * 围栏语法（模型在回复里写）：
 *   ```viz
 *   {"path":"/abs/path/to/page.html","title":"可选标题","height":420}
 *   ```
 * 一段回复里可以有多个围栏；每个围栏渲染成一个沙箱 iframe。
 */

/** 完整围栏：```viz 开头，到下一个 ``` 结束（大小写敏感，避免误吞普通代码块）。 */
const COMPLETE_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```/g;
/** 只用于「判断文本里有没有围栏」的非全局版本。 */
const HAS_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```/;
/** 剥除围栏：连它后面紧跟的一个换行一起吃掉，避免留下空行。 */
const STRIP_FENCE = /```viz[ \t]*\r?\n?([\s\S]*?)```\r?\n?/g;

/**
 * 把一段文本切成 markdown 与 viz 围栏两类片段，保持原有顺序。
 * @param {string} text
 * @returns {Array<{kind:"markdown",text:string}|{kind:"viz",raw:string}>}
 */
export function splitVizFences(text) {
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

/** 文本里是否含有完整 viz 围栏。 */
export function hasVizFence(text) {
  return typeof text === "string" && HAS_FENCE.test(text);
}

/**
 * 解析围栏体。优先按 JSON（支持 title / height）；JSON 不合法时兜底成「围栏体
 * 直接就是路径」——Windows 路径里的反斜杠不是合法 JSON 转义，模型经常直接写
 * `C:\...`，硬要求转义会让每次都要靠模型自觉。
 * @param {string} raw
 * @returns {{path:string,title:string,height:number|null}|null}
 */
export function parseVizSpec(raw) {
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
      height: Number.isFinite(height) && height > 0 ? Math.round(height) : null,
    };
  }
  // 兜底一：像 JSON 对象但反斜杠没转义（Windows 路径）——用正则把字段抠出来
  if (text.startsWith("{")) {
    const pathMatch = /"path"\s*:\s*"([^"]*)"/.exec(text);
    if (pathMatch === null || pathMatch[1].trim() === "") return null;
    const titleMatch = /"title"\s*:\s*"([^"]*)"/.exec(text);
    const heightMatch = /"height"\s*:\s*(-?\d+(?:\.\d+)?)/.exec(text);
    const height = heightMatch === null ? null : Number(heightMatch[1]);
    return {
      path: pathMatch[1].trim(),
      title: titleMatch === null ? "" : titleMatch[1],
      height: Number.isFinite(height) && height > 0 ? Math.round(height) : null,
    };
  }
  // 兜底二：整段就是一个路径。要求长得像路径，避免把坏 JSON 当成路径去试。
  const plain = text.replace(/^["']+|["']+$/g, "").trim();
  if (plain === "" || /[\r\n]/.test(plain)) return null;
  const looksLikePath = plain.includes("/") || plain.includes("\\") || plain.startsWith("~");
  if (!looksLikePath) return null;
  return { path: plain, title: "", height: null };
}

/**
 * 剥掉文本里的 viz 围栏，顺带收掉留下的空行。
 * 用于把含围栏的回复交回官方渲染器前先去掉围栏本身。
 * @param {string} text
 */
export function stripVizFences(text) {
  const source = typeof text === "string" ? text : "";
  return source.replace(STRIP_FENCE, "").trim();
}

/**
 * 收集一个 assistant 节点里所有可渲染的 viz 规格（按出现顺序）。
 * @param {any} node 聊天节点（conversation.chat.node 的 node）
 * @returns {Array<{path:string,title:string,height:number|null}>}
 */
export function collectVizSpecs(node) {
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

/**
 * 把含 viz 围栏的节点克隆一份、文本块里的围栏剥掉，供官方渲染器使用。
 * 没有围栏时原样返回原节点（避免无谓克隆）。
 * @param {any} node
 */
export function withVizFencesStripped(node) {
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

/** 前端 iframe 的地址：同源路由 + 绝对路径查询参数。 */
export function vizUrlOf(path) {
  return "/dsh-viz/file?path=" + encodeURIComponent(String(path));
}
