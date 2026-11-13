// pure.test.mjs —— 围栏解析与节点处理的直测面（零 DOM、零 npm 依赖）。

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  splitVizFences,
  parseVizSpec,
  stripVizFences,
  hasVizFence,
  collectVizSpecs,
  withVizFencesStripped,
  vizUrlOf,
} from '../src/client/pure.js'

test('splitVizFences：无围栏时整段是 markdown', () => {
  assert.deepEqual(splitVizFences('你好'), [{ kind: 'markdown', text: '你好' }])
  assert.deepEqual(splitVizFences(''), [])
})

test('splitVizFences：围栏与正文按原顺序切分', () => {
  const text = '前面\n```viz\n{"path":"/tmp/a.html"}\n```\n后面'
  assert.deepEqual(splitVizFences(text), [
    { kind: 'markdown', text: '前面\n' },
    { kind: 'viz', raw: '{"path":"/tmp/a.html"}\n' },
    { kind: 'markdown', text: '\n后面' },
  ])
})

test('splitVizFences：多个围栏与大小写敏感', () => {
  const segments = splitVizFences('a```viz\n{"path":"/1"}\n```b```viz\n{"path":"/2"}\n```c')
  assert.equal(segments.filter((s) => s.kind === 'viz').length, 2)
  // ```VIZ 不是本插件的围栏（避免误吞普通代码块）
  assert.equal(hasVizFence('```VIZ\n{"path":"/x"}\n```'), false)
  assert.equal(hasVizFence('```viz\n{"path":"/x"}\n```'), true)
})

test('splitVizFences：未闭合的围栏不算围栏', () => {
  const text = '```viz\n{"path":"/tmp/a.html"}'
  assert.equal(hasVizFence(text), false)
  assert.deepEqual(splitVizFences(text), [{ kind: 'markdown', text }])
})

test('parseVizSpec：合法 JSON 取 path/title/height', () => {
  assert.deepEqual(parseVizSpec('{"path":"/tmp/a.html"}'), { path: '/tmp/a.html', title: '', height: null })
  assert.deepEqual(
    parseVizSpec(' {"path":"/tmp/a.html","title":"原型","height":420} '),
    { path: '/tmp/a.html', title: '原型', height: 420 },
  )
})

test('parseVizSpec：缺 path / 坏 JSON / 非对象一律 null（当普通代码块处理）', () => {
  assert.equal(parseVizSpec('{"title":"x"}'), null)
  assert.equal(parseVizSpec('{"path":""}'), null)
  assert.equal(parseVizSpec('[1,2]'), null)
  assert.equal(parseVizSpec(''), null)
  assert.equal(parseVizSpec(undefined), null)
})

test('parseVizSpec：Windows 路径不转义反斜杠时兜底抠出 path', () => {
  // 模型经常直接写 C:\...，这在 JSON 里是非法转义
  assert.deepEqual(
    parseVizSpec('{"path":"C:\\Users\\a b\\demo.html","title":"演示"}'),
    { path: 'C:\\Users\\a b\\demo.html', title: '演示', height: null },
  )
  assert.deepEqual(parseVizSpec('{"path":"C:\\a\\demo.html","height":420}'), { path: 'C:\\a\\demo.html', title: '', height: 420 })
  assert.deepEqual(parseVizSpec('C:/Users/a/demo.html'), { path: 'C:/Users/a/demo.html', title: '', height: null })
  assert.deepEqual(parseVizSpec('/home/a/demo.html'), { path: '/home/a/demo.html', title: '', height: null })
  // 不像路径的坏 JSON 仍然返回 null
  assert.equal(parseVizSpec('{not json'), null)
  assert.equal(parseVizSpec('{"title":"x"}'), null, '有 JSON 形状但缺 path 仍拒绝')
  assert.equal(parseVizSpec('hello world'), null)
})

test('parseVizSpec：height 只接受正数', () => {
  assert.equal(parseVizSpec('{"path":"/a","height":0}').height, null)
  assert.equal(parseVizSpec('{"path":"/a","height":-5}').height, null)
  assert.equal(parseVizSpec('{"path":"/a","height":"abc"}').height, null)
  assert.equal(parseVizSpec('{"path":"/a","height":300.4}').height, 300)
})

test('stripVizFences：剥掉围栏并收掉多余空行', () => {
  const text = '前面\n```viz\n{"path":"/tmp/a.html"}\n```\n后面'
  assert.equal(stripVizFences(text), '前面\n后面')
  // 没有围栏时原样返回（trim 之外不动内容）
  assert.equal(stripVizFences('普通文本'), '普通文本')
})

test('collectVizSpecs：只从 text 块收集，顺序保持，坏围栏跳过', () => {
  const node = {
    data: {
      blocks: [
        { kind: 'reasoning', text: '想一下' },
        { kind: 'text', text: '看这个 ```viz\n{"path":"/a.html"}\n```' },
        { kind: 'image', text: '```viz\n{"path":"/b.html"}\n```' },
        { kind: 'text', text: '```viz\n{bad}\n``` 和 ```viz\n{"path":"/c.html"}\n```' },
      ],
    },
  }
  assert.deepEqual(collectVizSpecs(node), [{ path: '/a.html', title: '', height: null }, { path: '/c.html', title: '', height: null }])
})

test('collectVizSpecs：没有 blocks / 不是对象都安全返回空', () => {
  assert.deepEqual(collectVizSpecs(null), [])
  assert.deepEqual(collectVizSpecs({}), [])
  assert.deepEqual(collectVizSpecs({ data: {} }), [])
  assert.deepEqual(collectVizSpecs({ data: { blocks: 'x' } }), [])
})

test('withVizFencesStripped：没有围栏时原样返回原节点（不无谓克隆）', () => {
  const node = { data: { blocks: [{ kind: 'text', text: '普通' }] } }
  assert.equal(withVizFencesStripped(node), node)
})

test('withVizFencesStripped：有围栏时克隆节点并只剥文本块', () => {
  const node = {
    data: {
      status: 'closed',
      blocks: [
        { kind: 'text', text: '前 ```viz\n{"path":"/a"}\n``` 后' },
        { kind: 'reasoning', text: '思考' },
      ],
    },
  }
  const out = withVizFencesStripped(node)
  assert.notEqual(out, node)
  assert.notEqual(out.data, node.data)
  assert.equal(out.data.status, 'closed', '其余字段原样带过')
  assert.equal(out.data.blocks[0].text, '前  后')
  assert.equal(out.data.blocks[1].text, '思考', '非文本块不动')
  assert.equal(node.data.blocks[0].text.includes('viz'), true, '原节点不被改写')
})

test('vizUrlOf：绝对路径编码进查询参数', () => {
  assert.equal(vizUrlOf('C:/a b/页.html'), '/dsh-viz/file?path=' + encodeURIComponent('C:/a b/页.html'))
})
