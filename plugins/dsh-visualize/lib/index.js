/**
 * dsh-visualize —— host 半。
 *
 * 职责：挂一条同源路由 `/dsh-visualize/file`，把模型写出的 HTML 页面按白名单校验后
 *       发给前端的沙箱 iframe。页面内容一律来自本机文件，插件不产生任何页面。
 *
 * 安全：仅本机同源请求；路径必须落在插件自有目录或已登记工作区之内，且真实路径
 *       （跟随符号链接后）仍在白名单内；单文件不超过 1MB；响应带 CSP 与 nosniff。
 */

import { readFileSync } from 'node:fs'

import { allowedRoots, resolveVisualizeFile } from './visualize-path.js'
import { registerBundledSkill } from './skill.js'

export const name = '@bluechonk/dsh-visualize'

/**
 * 依赖的宿主服务：技能注册表（挂随包技能）、Web 路由、插件清单。
 * 与官方 office 技能一致用静态 inject 声明，保证 apply 时服务已就绪
 * （运行时 `ctx.inject` 只等「组合里声明过」的服务）。
 */
export const inject = ['skills', 'webServer', 'loader']

const API_BASE = '/dsh-visualize'

/**
 * 页面 CSP：默认全禁，只放行内联脚本/样式与常用 CDN 的脚本、字体与图片。
 * iframe 另带 sandbox="allow-scripts"（无 allow-same-origin），文档拿到的是
 * 独立源，读不到宿主、也发不出同源请求。
 */
const PAGE_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://esm.sh",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  'img-src data: https:',
  'font-src https://fonts.gstatic.com',
  "form-action 'none'",
  "base-uri 'none'",
].join('; ')

/** 同源 + 回环守卫：只接受本机同源请求。 */
function isLoopbackRequest(request) {
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

/** 已登记工作区的路径列表（白名单的第二部分）。 */
function workspacePathsOf(ctx) {
  const registry = ctx.get('workspaceRegistry')
  if (!registry || typeof registry.list !== 'function') return []
  try {
    const list = registry.list() || []
    return list
      .map((workspace) => (typeof workspace.path === 'string' ? workspace.path : typeof workspace.directory === 'string' ? workspace.directory : ''))
      .filter((path) => path !== '')
  } catch {
    return []
  }
}

function sendText(response, status, body) {
  response.statusCode = status
  response.setHeader('content-type', 'text/plain; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  response.end(body)
}

export function apply(ctx, config = {}) {
  // 随包技能：等 skills 服务就绪后把包内 SKILL.md 挂成内置技能，
  // 技能面板与模型都能直接看到，不必让用户手动拷进某个技能根。
  ctx.inject(['skills'], () => { registerBundledSkill(ctx, config) })

  ctx.inject(['webServer', 'loader'], (host) => {
    const webServer = host.webServer || ctx.get('webServer')
    if (!webServer || typeof webServer.register !== 'function') return
    webServer.register({
      kind: 'exact',
      path: `${API_BASE}/file`,
      handler: (request, response) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.statusCode = 405
          response.setHeader('allow', 'GET, HEAD')
          response.end('method not allowed')
          return
        }
        if (!isLoopbackRequest(request)) {
          sendText(response, 403, 'forbidden')
          return
        }
        const params = new URL(request.url || '/', 'http://loopback').searchParams
        const file = resolveVisualizeFile(params.get('path') || '', allowedRoots({ workspacePaths: workspacePathsOf(ctx) }))
        if (file === null) {
          sendText(response, 404, 'visualization file not found or not allowed')
          return
        }
        let body
        try {
          body = readFileSync(file)
        } catch {
          sendText(response, 500, 'failed to read visualization file')
          return
        }
        response.statusCode = 200
        response.setHeader('content-type', 'text/html; charset=utf-8')
        response.setHeader('content-length', body.length)
        response.setHeader('content-security-policy', PAGE_CSP)
        response.setHeader('x-content-type-options', 'nosniff')
        response.setHeader('cache-control', 'no-store')
        if (request.method === 'HEAD') {
          response.end()
          return
        }
        response.end(body)
      },
    })
  })
}
