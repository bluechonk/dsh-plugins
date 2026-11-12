/** 分块翻译：译好一块立即回填一块，不等全部完成。 */

import { apiPost } from "./api.js";

/**
 * 翻译目标语言：技能正文以英文为主，统一译成中文（与宿主的机翻配置一致）。
 * 主机侧的 translator 服务由 dsh-experimental-cot-translation-bundle 提供。
 */
export const TRANSLATE_TARGET = "zh";
/** 单块上限：宿主 translator 默认 maxTextChars=4000，留出余量避免被拒。 */
export const TRANSLATE_CHUNK_CHARS = 3500;
/** 并发上限：分块同时翻译，但别一次把宿主 translator 打满。 */
export const TRANSLATE_CONCURRENCY = 3;
/** 块级缓存：同一块只译一次，反复开关弹窗不重复请求。 */
export const translationCache = new Map();

/** 按空行把长文本切成不超过上限的块，逐块翻译后拼回。 */
export function translationChunks(text, limit) {
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
export function mergeChunks(chunks, done) {
  let out = "";
  for (let i = 0; i < chunks.length; i += 1) {
    const translated = done[i];
    out += translated === null || translated === undefined ? chunks[i] : translated;
  }
  return out;
}

/**
 * 翻译单个块（带缓存）；失败直接抛出，由调用方决定怎么提示。
 * force 为真时绕过缓存并覆盖写回，供「重新翻译」使用。
 */
export async function translateChunk(chunk, force) {
  if (!force) {
    const cached = translationCache.get(chunk);
    if (cached !== undefined) return cached;
  }
  const payload = await apiPost("/translate", { text: chunk, targetLanguage: TRANSLATE_TARGET, force: Boolean(force) });
  const text = typeof payload.text === "string" ? payload.text : "";
  translationCache.set(chunk, text);
  return text;
}
