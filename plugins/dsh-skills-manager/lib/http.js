/**
 * HTTP 基础工具：同源回环守卫、JSON 响应、错误映射、请求体读取。
 *
 * 这些函数不依赖 ctx，可被各路由直接复用。
 */

import { writeFileSync } from 'node:fs'

export const BODY_LIMIT_BYTES = 1024 * 1024

/** 同源 + 回环守卫：只接受本机同源请求。 */
export function isLoopbackRequest(request) {
  const address = request.socket && request.socket.remoteAddress
  if (address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1') return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }
  if (hostUrl.hostname !== '127.0.0.1' && hostUrl.hostname !== 'localhost' && hostUrl.hostname !== '[::1]') return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

export function sendJson(response, status, value, headers) {
  const body = JSON.stringify(value)
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  if (headers) {
    for (const [key, headerValue] of Object.entries(headers)) response.setHeader(key, headerValue)
  }
  response.end(body)
}

/**
 * 错误响应。code 是稳定的机器可读标识（客户端据此取对应语言的文案），
 * params 是文案里的动态部分（如技能名）。
 */
export function sendError(response, status, message, headers, code, params) {
  const body = { ok: false, error: String(message) }
  if (code) body.code = code
  if (params) body.params = params
  sendJson(response, status, body, headers)
}

/** 把内部异常映射成合适的 HTTP 状态码。 */
export function errorStatusOf(error) {
  if (error && error.name === 'BodyTooLargeError') return 413
  if (error && error.name === 'BadRequestError') return 400
  return 500
}

export class BodyTooLargeError extends Error {
  constructor() {
    super('请求体超过 1MB 上限')
    this.name = 'BodyTooLargeError'
  }
}

export class BadRequestError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BadRequestError'
  }
}

export function readBody(request) {
  return new Promise((resolvePromise, reject) => {
    const chunks = []
    let total = 0
    let rejected = false
    request.on('data', (chunk) => {
      if (rejected) return
      total += chunk.length
      if (total > BODY_LIMIT_BYTES) {
        rejected = true
        // 不 destroy 连接：客户端要能收到 413 的响应体，而不是连接被重置。
        request.resume()
        reject(new BodyTooLargeError())
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (!rejected) resolvePromise(Buffer.concat(chunks).toString('utf8'))
    })
    request.on('error', reject)
  })
}

export async function readJsonBody(request) {
  const raw = await readBody(request)
  if (raw.trim() === '') return {}
  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    throw new BadRequestError('请求体不是合法 JSON')
  }
  // JSON 的 null / 数组 / 数字都不是对象载荷：统一按 400 处理，避免后续取字段抛 TypeError。
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BadRequestError('请求体必须是 JSON 对象')
  }
  return payload
}

export function writeFileUtf8(path, content) {
  writeFileSync(path, content, 'utf8')
}
