// skill.test.mjs —— 随包技能注册的直测面。
//
// 手法：伪造最小 ctx（skills.registerProvider 捕获 provider），读真实的
// skills/visualize/SKILL.md，断言 list/get 的形状与内容。

import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readBundledSkill, registerBundledSkill } from '../lib/skill.js'

/** 造一个只带 skills.registerProvider 的 ctx；injected 属性优先。 */
function makeCtx() {
  const providers = []
  return {
    providers,
    ctx: {
      skills: {
        registerProvider(create) {
          const provider = create({ signal: new AbortController().signal, invalidate() {} })
          providers.push(provider)
          return () => {}
        },
      },
      get: () => undefined,
    },
  }
}

test('readBundledSkill：从真实 SKILL.md 取 name / description 与正文', () => {
  const skill = readBundledSkill()
  assert.ok(skill, '应读到包内 SKILL.md')
  assert.equal(skill.name, 'visualize')
  assert.match(skill.description, /可视化/)
  assert.match(skill.body, /# 对话内可视化/)
  assert.doesNotMatch(skill.body, /^---/, '正文不该把 frontmatter 也带上')
})

test('readBundledSkill：文件不存在或没有 name / description 时返回 null', () => {
  const home = mkdtempSync(join(tmpdir(), 'dsm-skill-'))
  try {
    assert.equal(readBundledSkill(join(home, 'missing.md')), null)

    const noMeta = join(home, 'no-meta.md')
    writeFileSync(noMeta, '# 只有正文\n', 'utf8')
    assert.equal(readBundledSkill(noMeta), null)

    const noDescription = join(home, 'no-desc.md')
    writeFileSync(noDescription, '---\nname: visualize\n---\n\n# 正文\n', 'utf8')
    assert.equal(readBundledSkill(noDescription), null)
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
})

test('registerBundledSkill：挂上 provider，list/get 形状符合宿主契约', async () => {
  const { ctx, providers } = makeCtx()
  assert.equal(registerBundledSkill(ctx), true)
  assert.equal(providers.length, 1)

  const provider = providers[0]
  assert.equal(provider.name, '@bluechonk/dsh-visualize')

  const candidates = await provider.list()
  assert.equal(candidates.length, 1)
  const candidate = candidates[0]
  assert.equal(candidate.name, 'visualize')
  assert.equal(candidate.provider, '@bluechonk/dsh-visualize')
  assert.equal(candidate.source, 'bundled')
  assert.equal(typeof candidate.rank, 'number')
  assert.deepEqual(candidate.invocation, { modelInvocable: true, userInvocable: true })
  assert.equal(candidate.resourceBase.kind, 'directory')

  const definition = await provider.get(candidate)
  assert.equal(definition.name, candidate.name, 'get 返回的 name 必须与 candidate 一致')
  assert.equal(definition.description, candidate.description)
  assert.equal(definition.provider, candidate.provider)
  assert.equal(definition.source, 'bundled')
  assert.equal(definition.content, readBundledSkill().body, 'get 应回传 SKILL.md 正文')
})

test('registerBundledSkill：没有 skills 服务或文件缺失时静默跳过', () => {
  const { ctx } = makeCtx()
  assert.equal(registerBundledSkill({ get: () => undefined }), false)
  assert.equal(registerBundledSkill(ctx, { file: join(tmpdir(), 'definitely-missing-SKILL.md') }), false)
})
