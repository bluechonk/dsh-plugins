/** 同源 HTTP 访问：全部走宿主路由，不直连文件系统。 */

import { t } from "./i18n.js";

export const API = "/dsh-skills-manager";

/** 请求超时上限：宿主卡住时不让界面永远停在「加载中」。 */
export const REQUEST_TIMEOUT_MS = 10000;

/** 宿主返回的错误对象：带上 code/params，界面按 code 查本地化文案。 */
export function makeError(payload, status) {
  const error = new Error((payload && payload.error) || t("error.request-failed", { status }));
  if (payload && payload.code) error.code = payload.code;
  if (payload && payload.params) error.params = payload.params;
  return error;
}

async function request(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(API + path, Object.assign({ signal: controller.signal }, options));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) throw makeError(payload, response.status);
    return payload;
  } catch (error) {
    if (error && error.name === "AbortError") throw new Error(t("error.timeout"));
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function apiGet(path, params) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request(path + query, { headers: { accept: "application/json" } });
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}
