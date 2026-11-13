// viz-path.test.mjs —— host 半路径白名单直测面（临时目录 + 真实文件/符号链接）。

import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { allowedRoots, withinRoots, resolveVizFile, MAX_FILE_BYTES } from '../lib/viz-path.js'

function tempDir() {
  return mkdtempSync(join(tmpdir(), 'dshviz-'))
}

function makeTree() {
  const base = tempDir()
  const workspace = join(base, 'workspace')
  const outside = join(base, 'outside')
  mkdirSync(join(workspace, '.dsh', 'visualizations'), { recursive: true })
  mkdirSync(outside, { recursive: true })
  writeFileSync(join(workspace, '.dsh', 'visualizations', 'a.html'), '<!doctype html><title>a</title>', 'utf8')
  writeFileSync(join(outside, 'secret.html'), '<!doctype html><title>secret</title>', 'utf8')
  return { base, workspace, outside }
}

test('allowedRoots：插件自有目录 + 各工作区', () => {
  const home = process.platform === 'win32' ? 'C:/home/.dsh' : '/home/user/.dsh'
  const one = process.platform === 'win32' ? 'C:/ws/one' : '/ws/one'
  const two = process.platform === 'win32' ? 'C:/ws/two' : '/ws/two'
  const roots = allowedRoots({ dshHome: home, workspacePaths: [one, two] })
  assert.deepEqual(roots, [resolve(home, 'visualizations'), resolve(one), resolve(two)])
})

test('withinRoots：根内、等于根、根外、父目录穿越', () => {
  const roots = ['C:/ws/one']
  assert.equal(withinRoots('C:/ws/one/a.html', roots), true)
  assert.equal(withinRoots('C:/ws/one', roots), true)
  assert.equal(withinRoots('C:/ws/one/../two/a.html', roots), false)
  assert.equal(withinRoots('C:/ws/other/a.html', roots), false)
  assert.equal(withinRoots('C:/ws', roots), false)
  assert.equal(withinRoots('C:/ws/one/a.html', []), false)
})

test('resolveVizFile：工作区内的文件返回真实路径', () => {
  const { workspace, base } = makeTree()
  try {
    const roots = allowedRoots({ dshHome: join(base, 'unused'), workspacePaths: [workspace] })
    const file = resolveVizFile(join(workspace, '.dsh', 'visualizations', 'a.html'), roots)
    assert.equal(file, join(workspace, '.dsh', 'visualizations', 'a.html'))
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

test('resolveVizFile：工作区之外 / 相对路径 / 不存在 / 目录 / 超限一律拒绝', () => {
  const { workspace, outside, base } = makeTree()
  try {
    const roots = allowedRoots({ dshHome: join(base, 'unused'), workspacePaths: [workspace] })
    assert.equal(resolveVizFile(join(outside, 'secret.html'), roots), null, '工作区外拒绝')
    assert.equal(resolveVizFile('.dsh/visualizations/a.html', roots), null, '相对路径拒绝')
    assert.equal(resolveVizFile(join(workspace, '.dsh', 'visualizations', 'missing.html'), roots), null)
    assert.equal(resolveVizFile(join(workspace, '.dsh', 'visualizations'), roots), null, '目录拒绝')
    assert.equal(resolveVizFile('', roots), null)
    assert.equal(resolveVizFile(null, roots), null)

    writeFileSync(join(workspace, '.dsh', 'visualizations', 'big.html'), 'x'.repeat(MAX_FILE_BYTES + 1))
    assert.equal(resolveVizFile(join(workspace, '.dsh', 'visualizations', 'big.html'), roots), null, '超限拒绝')
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

test('resolveVizFile：符号链接指向根外时拒绝（realpath 兜底）', () => {
  const { workspace, outside, base } = makeTree()
  try {
    const roots = allowedRoots({ dshHome: join(base, 'unused'), workspacePaths: [workspace] })
    // 根内的链接 → 根外的真实文件
    symlinkSync(join(outside, 'secret.html'), join(workspace, '.dsh', 'visualizations', 'link.html'))
    assert.equal(resolveVizFile(join(workspace, '.dsh', 'visualizations', 'link.html'), roots), null, '链接绕行拒绝')
    // 根内的链接 → 根内的真实文件：放行并返回真实路径
    symlinkSync(join(workspace, '.dsh', 'visualizations', 'a.html'), join(workspace, '.dsh', 'visualizations', 'ok.html'))
    assert.equal(resolveVizFile(join(workspace, '.dsh', 'visualizations', 'ok.html'), roots), join(workspace, '.dsh', 'visualizations', 'a.html'))
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})
