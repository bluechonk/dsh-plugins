// http.test.mjs —— host 半文件路由的直测面（伪造 webServer / workspaceRegistry）。

import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { apply } from '../lib/index.js'

function makeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(key, value) { this.headers[String(key).toLowerCase()] = value },
    end(body) { if (body !== undefined) this.body = String(body) },
  }
}

function makeRequest(options = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || '/dsh-viz/file',
    headers: Object.assign({ host: '127.0.0.1:39180' }, options.headers || {}),
    socket: { remoteAddress: options.remoteAddress || '127.0.0.1' },
  }
}

function makeHost(workspacePaths) {
  const routes = new Map()
  const services = {
    workspaceRegistry: { list: () => workspacePaths.map((path) => ({ path })) },
  }
  const ctx = {
    get: (name) => services[name],
    inject: (names, fn) => fn({ webServer: services.webServer }),
    effect: () => () => {},
  }
  services.webServer = { register(route) { routes.set(route.path, route) } }
  apply(ctx, {})
  return routes
}

function call(route, options = {}) {
  const request = makeRequest(options)
  const response = makeResponse()
  route.handler(request, response)
  return response
}

function makeTree() {
  const base = mkdtempSync(join(tmpdir(), 'dshviz-http-'))
  const workspace = join(base, 'workspace')
  const outside = join(base, 'outside')
  mkdirSync(join(workspace, '.dsh', 'visualizations'), { recursive: true })
  mkdirSync(outside, { recursive: true })
  writeFileSync(join(workspace, '.dsh', 'visualizations', 'a.html'), '<!doctype html><title>a</title>', 'utf8')
  writeFileSync(join(outside, 'secret.html'), '<!doctype html><title>secret</title>', 'utf8')
  return { base, workspace, outside }
}

test('GET 工作区内的页面：200 + text/html + CSP + nosniff', () => {
  const { workspace, base } = makeTree()
  try {
    const routes = makeHost([workspace])
    const response = call(routes.get('/dsh-viz/file'), {
      url: '/dsh-viz/file?path=' + encodeURIComponent(join(workspace, '.dsh', 'visualizations', 'a.html')),
    })
    assert.equal(response.statusCode, 200)
    assert.match(response.headers['content-type'], /^text\/html/)
    assert.match(response.headers['content-security-policy'], /default-src 'none'/)
    assert.equal(response.headers['x-content-type-options'], 'nosniff')
    assert.match(response.body, /<title>a<\/title>/)
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

test('GET 越界路径 / 不存在的文件：404', () => {
  const { workspace, outside, base } = makeTree()
  try {
    const routes = makeHost([workspace])
    const escaped = call(routes.get('/dsh-viz/file'), {
      url: '/dsh-viz/file?path=' + encodeURIComponent(join(outside, 'secret.html')),
    })
    assert.equal(escaped.statusCode, 404)
    const missing = call(routes.get('/dsh-viz/file'), { url: '/dsh-viz/file?path=' + encodeURIComponent(join(workspace, 'nope.html')) })
    assert.equal(missing.statusCode, 404)
    const bad = call(routes.get('/dsh-viz/file'), { url: '/dsh-viz/file?path=relative.html' })
    assert.equal(bad.statusCode, 404)
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

test('HEAD：200 且不带响应体', () => {
  const { workspace, base } = makeTree()
  try {
    const routes = makeHost([workspace])
    const response = call(routes.get('/dsh-viz/file'), {
      method: 'HEAD',
      url: '/dsh-viz/file?path=' + encodeURIComponent(join(workspace, '.dsh', 'visualizations', 'a.html')),
    })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, '')
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

test('非 GET/HEAD：405 带 Allow', () => {
  const routes = makeHost([])
  const response = call(routes.get('/dsh-viz/file'), { method: 'POST' })
  assert.equal(response.statusCode, 405)
  assert.equal(response.headers.allow, 'GET, HEAD')
})

test('跨站来源与非常规来源地址都被拒', () => {
  const routes = makeHost([])
  const crossSite = call(routes.get('/dsh-viz/file'), { headers: { 'sec-fetch-site': 'cross-site' } })
  assert.equal(crossSite.statusCode, 403)
  const badOrigin = call(routes.get('/dsh-viz/file'), { headers: { origin: 'http://evil.example' } })
  assert.equal(badOrigin.statusCode, 403)
  const remote = call(routes.get('/dsh-viz/file'), { remoteAddress: '10.0.0.5' })
  assert.equal(remote.statusCode, 403)
})
