/**
 * dsh-visualize —— 随包技能注册。
 *
 * 包内 `skills/visualize/SKILL.md` 通过宿主的 `ctx.skills.registerProvider` 挂成
 * 「随包内置」技能（官方 office 技能就是这个机制）：挂上之后技能面板能看到它、
 * 模型也能按名字调用，效果与把文件拷进某个技能根一致，但插件不必去写用户目录。
 *
 * 技能缺失或宿主没有技能服务时静默跳过——少一个技能只影响模型能不能自动用，
 * 不该让插件整体加载失败。
 */

import { readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 宿主 `@deepseek-ai/dsh-skill` 的 `BUNDLED_SKILL_RANK`。装进来的插件通常解析不到那个包，按值写死。 */
const BUNDLED_SKILL_RANK = 600

const PROVIDER_NAME = '@bluechonk/dsh-visualize'
const SKILL_DIR = fileURLToPath(new URL('../skills/visualize/', import.meta.url))
const SKILL_FILE = join(SKILL_DIR, 'SKILL.md')

/** 去掉一层引号：frontmatter 里的 description 通常带引号。 */
function unquote(value) {
  const text = String(value).trim()
  if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
    return text.slice(1, -1)
  }
  return text
}

/**
 * 读 SKILL.md：取 frontmatter 的 name / description，正文原样返回（不做任何解析）。
 * @param {string} [file]
 * @returns {{name:string,description:string,body:string}|null}
 */
export function readBundledSkill(file = SKILL_FILE) {
  let raw
  try {
    raw = readFileSync(file, 'utf8')
  } catch {
    return null
  }
  const text = String(raw).replace(/^\uFEFF/, '')
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return null
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (/^\s/.test(line)) continue
    const entry = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!entry) continue
    meta[entry[1]] = unquote(entry[2])
  }
  if (meta.name === undefined || String(meta.name).trim() === '') return null
  if (meta.description === undefined || String(meta.description).trim() === '') return null
  return {
    name: String(meta.name).trim(),
    description: String(meta.description).trim(),
    body: text.slice(match[0].length).trim(),
  }
}

/**
 * 把包内技能挂到宿主技能注册表。
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{file?: string}} [options]
 * @returns {boolean} 是否注册成功
 */
export function registerBundledSkill(ctx, options = {}) {
  const skills = ctx.skills || (typeof ctx.get === 'function' ? ctx.get('skills') : undefined)
  if (!skills || typeof skills.registerProvider !== 'function') return false
  const skill = readBundledSkill(options.file)
  if (!skill) return false
  const candidate = {
    name: skill.name,
    description: skill.description,
    invocation: { modelInvocable: true, userInvocable: true },
    source: 'bundled',
    rank: BUNDLED_SKILL_RANK,
    provider: PROVIDER_NAME,
    // 资源根给技能一个可解析相对路径的基准；本技能目前不引用外部资源。
    resourceBase: { kind: 'directory', path: SKILL_DIR.split(sep).join('/') },
    locator: SKILL_FILE,
  }
  skills.registerProvider(() => ({
    name: PROVIDER_NAME,
    list: () => Promise.resolve([candidate]),
    get: async () => ({ ...candidate, content: skill.body }),
  }))
  return true
}
