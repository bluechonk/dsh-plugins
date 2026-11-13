/**
 * 可视化文件的路径白名单校验（纯函数，host 半直测面）。
 *
 * 只允许读两类位置：
 *   1. 插件自有目录 <dshHome>/visualizations（模型可以把页面写在这儿）；
 *   2. 任意已登记工作区之内（模型按技能说明写到 <workspace>/.dsh/visualizations/）。
 * 超出白名单、符号链接绕行、非普通文件、超过 1MB 一律拒绝。
 */

import { realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve, sep } from 'node:path'

/** 单文件大小上限：内联页面超过 1MB 没意义，反而拖慢 iframe。 */
export const MAX_FILE_BYTES = 1024 * 1024

/** 允许读取的根目录列表。 */
export function allowedRoots({ workspacePaths = [], dshHome } = {}) {
  const home = dshHome || process.env.DSH_HOME || join(homedir(), '.dsh')
  const roots = [resolve(home, 'visualizations')]
  for (const path of workspacePaths) {
    if (typeof path === 'string' && path.trim() !== '') roots.push(resolve(path))
  }
  return roots
}

/** 统一分隔符、去尾斜杠、Windows 小写，避免同一目录因写法不同被绕过。 */
function normalize(value) {
  const unified = resolve(value).replace(/[\\/]+/g, '/').replace(/\/$/, '')
  return process.platform === 'win32' ? unified.toLowerCase() : unified
}

/** 目标是否在某个根之内（含等于根本身）。 */
export function withinRoots(target, roots) {
  if (!Array.isArray(roots) || roots.length === 0) return false
  const normalized = normalize(target)
  return roots.some((root) => {
    const base = normalize(root)
    return normalized === base || normalized.startsWith(base + '/')
  })
}

/** 真实路径（跟随符号链接）；失败返回 null。 */
function realPathOf(target) {
  try {
    return realpathSync(target)
  } catch {
    return null
  }
}

/**
 * 校验并返回可读取的真实绝对路径；不合法返回 null。
 * @param {unknown} path 客户端传来的绝对路径
 * @param {string[]} roots 允许的根
 * @returns {string|null}
 */
export function resolveVizFile(path, roots) {
  if (typeof path !== 'string' || path.trim() === '') return null
  if (!isAbsolute(path)) return null
  const real = realPathOf(path)
  if (real === null) return null
  // 真实路径必须仍在真实根之内：字符串层面的包含挡不住「根内的目录项是指向别处的符号链接」。
  const realRoots = roots.map((root) => realPathOf(root) || normalize(root))
  if (!withinRoots(real, realRoots)) return null
  let stat
  try {
    stat = statSync(real)
  } catch {
    return null
  }
  if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return null
  return real
}
