/**
 * 目录扫描：在技能根里发现技能、收集文件清单、读取头部内容。
 *
 * 扫描规则与官方提供方 @deepseek-ai/dsh-skill-filesystem 一致：只认一层
 * `<root>/<name>/SKILL.md` 与 `<root>/<name>.md`，`.` 开头与常见噪声目录跳过。
 */

import { closeSync, existsSync, lstatSync, openSync, readSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

import { diagnoseFrontmatter, isValidSkillName, parseFrontmatter } from './frontmatter.js'

const SKIP_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.svn'])

/** 只读取文件头部若干字节：超大 SKILL.md 不必整个读进内存。 */
export function readTextHead(path, limit) {
  let fd
  try {
    fd = openSync(path, 'r')
    const buffer = Buffer.alloc(limit)
    const read = readSync(fd, buffer, 0, limit, 0)
    return buffer.subarray(0, read).toString('utf8')
  } catch {
    return null
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd)
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * 递归统计技能目录占用的文件（跳过 .git / node_modules 等）。
 * @param {string} baseDir
 * @param {Array<{ rel: string, abs: string, size: number }>} collected
 * @param {{ maxFiles: number, maxBytes: number }} limits
 */
function walk(baseDir, relDir, collected, limits) {
  let names
  try {
    names = readdirSync(baseDir)
  } catch {
    return
  }
  names.sort()
  for (const entry of names) {
    if (collected.files.length >= limits.maxFiles || collected.bytes >= limits.maxBytes) {
      collected.truncated = true
      return
    }
    if (SKIP_DIRS.has(entry)) continue
    const abs = join(baseDir, entry)
    const rel = relDir === '' ? entry : relDir + '/' + entry
    let st
    try {
      // 用 lstat：符号链接不跟随，避免把技能目录外的文件算进清单（也不误跟随到别处）。
      st = lstatSync(abs)
    } catch {
      continue
    }
    if (st.isSymbolicLink()) {
      collected.files.push({ rel, abs, size: 0, link: true })
      continue
    }
    if (st.isDirectory()) {
      walk(abs, rel, collected, limits)
      continue
    }
    if (!st.isFile()) continue
    if (collected.bytes + st.size > limits.maxBytes) {
      collected.truncated = true
      return
    }
    collected.files.push({ rel, abs, size: st.size })
    collected.bytes += st.size
  }
}

/**
 * 收集一个技能在磁盘上占用的文件。
 *
 * isBundle 必须由调用方按「该项是不是目录」给出：靠文件名猜会把根目录下平铺的
 * skill.md 当成目录 bundle，删除时连整个技能根一起删掉。
 * @param {string} skillPath SKILL.md 或平铺 .md 的绝对路径
 * @param {boolean} isBundle 该项是否为目录 bundle
 */
export function collectSkillFiles(skillPath, isBundle = false) {
  if (typeof skillPath !== 'string' || skillPath === '' || !existsSync(skillPath)) return null
  let st
  try {
    st = lstatSync(skillPath)
  } catch {
    return null
  }
  if (!st.isFile()) return null
  if (!isBundle) {
    return { dir: null, isBundle: false, files: [{ rel: basename(skillPath), abs: skillPath, size: st.size }], bytes: st.size, truncated: false }
  }
  const baseDir = dirname(skillPath)
  const collected = { files: [], bytes: 0, truncated: false }
  walk(baseDir, '', collected, { maxFiles: 600, maxBytes: 40 * 1024 * 1024 })
  return { dir: baseDir, isBundle: true, files: collected.files, bytes: collected.bytes, truncated: collected.truncated }
}

/**
 * 扫描一个技能根：仅一层 `<root>/<name>/SKILL.md` 与 `<root>/<name>.md`。
 * @param {Array<{ label: string, path: string, rank: number }>} roots
 */
export function discoverLocalSkills(roots) {
  const out = []
  const seen = new Set()
  // 按 rank 升序扫描：rank 越小优先级越高（项目根优先于用户根），与 DSH 注册表的裁决顺序一致。
  // 否则同名技能会显示成低优先级那份，面板停用的文件与 DSH 实际加载的文件不是同一个。
  const ordered = [...roots].sort((a, b) => (a.rank || 0) - (b.rank || 0))
  for (const root of ordered) {
    let names
    try {
      names = readdirSync(root.path)
    } catch {
      continue
    }
    names.sort()
    for (const entry of names) {
      if (entry.startsWith('.')) continue
      if (SKIP_DIRS.has(entry)) continue
      const abs = join(root.path, entry)
      let st
      try {
        st = lstatSync(abs)
      } catch {
        continue
      }
      let mdPath = null
      let isBundle = false
      if (st.isSymbolicLink()) {
        // 链接目录：内容照读（DSH 也会跟随），但标记出来，写操作另有真实路径校验。
        let target
        try {
          target = statSync(abs)
        } catch {
          continue
        }
        if (!target.isDirectory()) continue
        const candidate = join(abs, 'SKILL.md')
        if (!existsSync(candidate)) continue
        mdPath = candidate
        isBundle = true
      } else if (st.isDirectory()) {
        const candidate = join(abs, 'SKILL.md')
        if (!existsSync(candidate)) continue
        mdPath = candidate
        isBundle = true
      } else if (st.isFile() && entry.toLowerCase().endsWith('.md')) {
        mdPath = abs
        isBundle = false
      } else {
        continue
      }
      const text = readTextHead(mdPath, 65536)
      if (text === null) continue
      const frontmatter = parseFrontmatter(text)
      if (!frontmatter) continue
      const name = frontmatter.data.name
      if (!isValidSkillName(name)) continue
      const description = typeof frontmatter.data.description === 'string' ? frontmatter.data.description : ''
      if (description === '') continue
      if (seen.has(name)) continue
      seen.add(name)
      const info = collectSkillFiles(mdPath, isBundle)
      out.push({
        name,
        description,
        whenToUse: typeof frontmatter.data.whenToUse === 'string' ? frontmatter.data.whenToUse : undefined,
        provider: 'filesystem',
        source: root.label,
        rank: root.rank,
        path: mdPath,
        // bundle 的目录是技能自己的目录；平铺 .md 没有独立目录（dir 留给宿主在删除时判定）。
        dir: isBundle ? abs : dirname(mdPath),
        isFlat: !isBundle,
        root: root.label,
        rootPath: root.path,
        // DSH 兼容性诊断：缺 description 或含旧式调用键的技能，DSH 会整个文件忽略。
        issues: diagnoseFrontmatter(frontmatter).issues,
        fileCount: info ? info.files.length : 0,
        bytes: info ? info.bytes : 0,
        isBundle,
        truncated: info ? info.truncated : false,
        exists: info !== null,
        inRegistry: false,
        embedded: false,
      })
    }
  }
  return out
}
