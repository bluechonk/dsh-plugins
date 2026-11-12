import test from 'node:test'
import assert from 'node:assert/strict'

import { isLosslessUtf8, isValidSkillName, parseFrontmatter } from '../lib/frontmatter.js'
import {
  deriveDescription,
  diagnoseFrontmatter,
  normalizeSkillFrontmatter,
} from '../lib/frontmatter.js'

test('diagnoseFrontmatter 按 DSH 的规则判断能否被加载', () => {
  // 正常技能：没有诊断项
  const ok = diagnoseFrontmatter(parseFrontmatter(['---', 'name: demo', 'description: 描述', '---', ''].join('\n')))
  assert.deepEqual(ok.issues, [])
  assert.equal(ok.loadable, true)

  // 缺 description：DSH 会忽略整个文件
  const noDesc = diagnoseFrontmatter(parseFrontmatter(['---', 'name: demo', '---', ''].join('\n')))
  assert.equal(noDesc.issues.includes('missing-description'), true)
  assert.equal(noDesc.loadable, false)

  // 缺 name
  const noName = diagnoseFrontmatter(parseFrontmatter(['---', 'description: 描述', '---', ''].join('\n')))
  assert.equal(noName.issues.includes('missing-name'), true)

  // 旧式调用键：DSH 直接判非法
  const legacy = diagnoseFrontmatter(parseFrontmatter(['---', 'name: demo', 'description: 描述', 'disableModelInvocation: true', '---', ''].join('\n')))
  assert.deepEqual(legacy.legacyKeys, ['disableModelInvocation'])
  assert.equal(legacy.issues.includes('legacy-invocation-key'), true)

  // 调用键取值不是布尔
  const badBool = diagnoseFrontmatter(parseFrontmatter(['---', 'name: demo', 'description: 描述', 'disable-model-invocation: yes-please', '---', ''].join('\n')))
  assert.deepEqual(badBool.invalidBooleans, ['disable-model-invocation'])
})

test('deriveDescription 从正文派生一句描述', () => {
  assert.equal(deriveDescription('# 标题\n\n正文第一段\n第二段', '兜底'), '标题')
  assert.equal(deriveDescription('正文第一段\n第二段', '兜底'), '正文第一段 第二段')
  assert.equal(deriveDescription('', '兜底'), '兜底')
})

test('normalizeSkillFrontmatter 补 name/description 并删旧式调用键', () => {
  const text = ['---', 'name: demo', 'disableModelInvocation: true', 'allowed-tools: Bash(x:*)', '---', '', '# 正文', '内容'].join('\n')
  const fixed = normalizeSkillFrontmatter(text, { name: 'demo' })
  assert.equal(fixed.changes.includes('added-description'), true)
  assert.equal(fixed.changes.includes('removed-legacy-key'), true)
  assert.match(fixed.text, /name: demo/)
  assert.match(fixed.text, /description: /)
  assert.doesNotMatch(fixed.text, /disableModelInvocation/)
  assert.match(fixed.text, /allowed-tools: Bash\(x:\*\)/)
  // 正文逐字保留
  assert.match(fixed.text, /# 正文\n内容/)
})

test('normalizeSkillFrontmatter 没有 frontmatter 时补一整段', () => {
  const fixed = normalizeSkillFrontmatter('# 只有正文\n内容', { name: 'demo', description: '描述' })
  assert.equal(fixed.changes.includes('added-frontmatter'), true)
  assert.match(fixed.text, /^---\nname: demo\ndescription: [^\n]+\n---/)
  assert.match(fixed.text, /# 只有正文/)
})

test('parseFrontmatter 解析顶层标量与引号', () => {
  const text = ['---', 'name: demo-skill', 'description: "带引号的描述"', '---', '', '正文'].join('\n')
  const parsed = parseFrontmatter(text)
  assert.equal(parsed.data.name, 'demo-skill')
  assert.equal(parsed.data.description, '带引号的描述')
  assert.equal(parsed.body.trim(), '正文')
})

test('parseFrontmatter 支持折叠块并跳过非键行', () => {
  const text = ['---', 'name: demo', 'description: >-', '  第一段', '  第二段', 'whenToUse: 何时使用', '---', 'body'].join('\n')
  const parsed = parseFrontmatter(text)
  assert.equal(parsed.data.description, '第一段 第二段')
  assert.equal(parsed.data.whenToUse, '何时使用')
})

test('parseFrontmatter 缺少闭合或无 frontmatter 时返回 null', () => {
  assert.equal(parseFrontmatter('没有 frontmatter'), null)
  assert.equal(parseFrontmatter('---\nname: x\n'), null)
})

test('isValidSkillName 只接受 kebab-case', () => {
  assert.equal(isValidSkillName('demo-skill'), true)
  assert.equal(isValidSkillName('Demo'), false)
  assert.equal(isValidSkillName('demo_skill'), false)
  assert.equal(isValidSkillName('-demo'), false)
  assert.equal(isValidSkillName('x'.repeat(65)), false)
})

test('parseFrontmatter 不把块标量里的 --- 当成结束标记', () => {
  const text = ['---', 'name: demo', 'description: |', '  第一段', '  ---', '  第二段', '---', 'body'].join('\n')
  const parsed = parseFrontmatter(text)
  assert.equal(parsed.data.name, 'demo')
  assert.match(parsed.data.description, /第一段/)
  assert.match(parsed.data.description, /第二段/)
  assert.equal(parsed.body.trim(), 'body')
})

test('isLosslessUtf8 识别非 UTF-8 内容', () => {
  assert.equal(isLosslessUtf8(Buffer.from('你好', 'utf8')), true)
  // GBK 的「你好」
  const gbk = Buffer.from([0xc4, 0xe3, 0xba, 0xc3])
  assert.equal(isLosslessUtf8(gbk), false)
  // 带 BOM 的 UTF-8 仍算可无损解码
  assert.equal(isLosslessUtf8(Buffer.from('\uFEFFabc', 'utf8')), true)
})
