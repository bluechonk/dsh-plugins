/** 技能详情弹窗：描述 / 正文 / 范围 / 路径，含分块增量翻译与重新翻译。 */

import { h, getReact } from "./runtime.js";
import { apiPost } from "./api.js";
import { t, localizeError, fallbackT, scopeTextOf } from "./i18n.js";
import { renderMarkdown } from "./markdown.js";
import { mergeChunks, translateChunk, translationChunks, TRANSLATE_CHUNK_CHARS, TRANSLATE_CONCURRENCY } from "./translate.js";
import { Modal, IconButton } from "./components.js";
import { IconClose, IconCopy, IconWarning } from "./icons.js";

export function DetailModal(props) {
  const { useState, useEffect, useRef, useCallback } = getReact();
  const tt = props.t || fallbackT();
  const skill = props.skill;
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  // 翻译默认关闭：是否看译文由用户决定，且每次打开详情都从「原文」开始（不做持久化）。
  const [translateOn, setTranslateOn] = useState(false);
  // 分块进度：{ desc: { chunks, done }, content: { chunks, done } }，done[i] 为 null 表示该块还没译好。
  const [progress, setProgress] = useState(null);
  const [translateError, setTranslateError] = useState(null);
  // 同一套文本只译一次（把开关关掉再打开不应重新请求）；重新翻译时强制重译并覆盖缓存。
  const translatedKey = useRef(null);
  const forceRef = useRef(false);
  const [retranslateToken, setRetranslateToken] = useState(0);

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
    if (translatedKey.current === signature && !forceRef.current) return undefined;
    translatedKey.current = signature;
    const force = forceRef.current;
    forceRef.current = false;

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
            result = await translateChunk(chunks[index], force);
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
  }, [skill.name, props.cwd, translateOn, detail, retranslateToken]);

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

  const doRetranslate = useCallback(() => {
    forceRef.current = true;
    setRetranslateToken((value) => value + 1);
  }, []);

  return h(Modal, { onClose: props.onClose, label: skill.name + " " + tt("detail.titleSuffix") },
    h("div", { className: "dsm-modalHead" },
      h("span", { className: "dsm-modalTitle" }, skill.name),
      h("span", { className: "dsm-badgeSkill", style: { marginLeft: "8px" } }, "Skill"),
      h("div", { className: "dsm-seg", role: "group", "aria-label": tt("detail.translate") },
        h("button", {
          type: "button",
          className: "dsm-segBtn",
          "data-on": translateOn ? "false" : "true",
          "aria-pressed": translateOn ? "false" : "true",
          onClick: () => setTranslateOn(false),
        }, tt("detail.sourceText")),
        h("button", {
          type: "button",
          className: "dsm-segBtn",
          "data-on": translateOn ? "true" : "false",
          "aria-pressed": translateOn ? "true" : "false",
          onClick: () => setTranslateOn(true),
        }, tt("detail.translatedText"))),
      translateOn
        ? h("button", { type: "button", className: "dsm-retranslate", onClick: doRetranslate }, tt("detail.retranslate"))
        : null,
      h("div", { style: { marginLeft: "auto" } },
        IconButton({ className: "dsm-iconBtnSm", label: "关闭", onClick: props.onClose }, h(IconClose, null))),
    ),
    h("div", { className: "dsm-modalBody" },
      h("div", { className: "dsm-translateBar" },
        translating
          ? h("span", null, tt("detail.translating"))
          : translateError
            ? h("div", { className: "dsm-translateError" },
              h(IconWarning, null), h("span", null, translateError))
            : null,
      ),
      h("div", { className: "dsm-label" }, tt("detail.description")),
      h("div", { className: "dsm-mdScroll" }, error
        ? h("div", { className: "dsm-error" }, error)
        : descShown
          ? renderMarkdown(descShown)
          : h("span", { className: "dsm-muted" }, tt("detail.noDescription"))),
      h("div", { className: "dsm-label" }, tt("detail.content")),
      h("div", { className: "dsm-mdCard" }, bodyShown
        ? renderMarkdown(bodyShown)
        : h("span", { className: "dsm-muted" }, detail ? tt("detail.noContent") : tt("state.loading"))),
      detail && detail.contentTruncated ? h("div", { className: "dsm-footNote" }, tt("detail.truncated")) : null,
      h("div", null,
        h("div", { className: "dsm-label" }, tt("detail.scope")),
        h("div", { className: "dsm-value" }, scopeText),
      ),
      h("div", { className: "dsm-label" }, tt("detail.path")),
      h("div", { className: "dsm-pathRow" },
        h("code", { className: "dsm-path", title: skill.path || "" }, skill.path || tt("detail.builtinNoFile")),
        IconButton({ className: "dsm-iconBtnSm", label: copied === null ? tt("action.copyPath") : copied ? tt("action.copied") : tt("action.copyFailed"), onClick: copyPath }, h(IconCopy, null)),
      ),
    ),
  );
}
