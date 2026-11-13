// pure.test.mjs —— 围栏解析与节点处理的直测面（零 DOM、零 npm 依赖）。

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  splitVisualizeFences,
  parseVisualizeSpec,
  stripVisualizeFences,
  hasVisualizeFence,
  collectVisualizeSpecs,
  withVisualizeFencesStripped,
  visualizeUrlOf,
} from '../src/client/pure.js'

test('splitVisualizeFences：无围栏时整段是 markdown', () => {
  assert.deepEqual(splitVisualizeFences('你好'), [{ kind: 'markdown', text: '你好' }])
  assert.deepEqual(splitVisualizeFences(''), [])
})

test('splitVisualizeFences：围栏与正文按原顺序切分', () => {
  const text = '前面\n```visualize\n{"path":"/tmp/a.html"}\n```\n后面'
  assert.deepEqual(splitVisualizeFences(text), [
    { kind: 'markdown', text: '前面\n' },
    { kind: 'visualize', raw: '{"path":"/tmp/a.html"}\n' },
    { kind: 'markdown', text: '\n后面' },
  ])
})

test('splitVisualizeFences：多个围栏与大小写敏感', () => {
  const segments = splitVisualizeFences('a```visualize\n{"path":"/1"}\n```b```visualize\n{"path":"/2"}\n```c')
  assert.equal(segments.filter((s) => s.kind === 'visualize').length, 2)
  // ```VIZ 不是本插件的围栏（避免误吞普通代码块）
  assert.equal(hasVisualizeFence('```VIZ\n{"path":"/x"}\n```'), false)
  assert.equal(hasVisualizeFence('```visualize\n{"path":"/x"}\n```'), true)
})

test('splitVisualizeFences：未闭合的围栏不算围栏', () => {
  const text = '```visualize\n{"path":"/tmp/a.html"}'
  assert.equal(hasVisualizeFence(text), false)
  assert.deepEqual(splitVisualizeFences(text), [{ kind: 'markdown', text }])
})

test('parseVisualizeSpec：合法 JSON 取 path/title/height', () => {
  assert.deepEqual(parseVisualizeSpec('{"path":"/tmp/a.html"}'), { path: '/tmp/a.html', title: '', height: null })
  assert.deepEqual(
    parseVisualizeSpec(' {"path":"/tmp/a.html","title":"原型","height":420} '),
    { path: '/tmp/a.html', title: '原型', height: 420 },
  )
})

test('parseVisualizeSpec：缺 path / 坏 JSON / 非对象一律 null（当普通代码块处理）', () => {
  assert.equal(parseVisualizeSpec('{"title":"x"}'), null)
  assert.equal(parseVisualizeSpec('{"path":""}'), null)
  assert.equal(parseVisualizeSpec('[1,2]'), null)
  assert.equal(parseVisualizeSpec(''), null)
  assert.equal(parseVisualizeSpec(undefined), null)
})

test('parseVisualizeSpec：Windows 路径不转义反斜杠时兜底抠出 path', () => {
  // 模型经常直接写 C:\...，这在 JSON 里是非法转义
  assert.deepEqual(
    parseVisualizeSpec('{"path":"C:\\Users\\a b\\demo.html","title":"演示"}'),
    { path: 'C:\\Users\\a b\\demo.html', title: '演示', height: null },
  )
  assert.deepEqual(parseVisualizeSpec('{"path":"C:\\a\\demo.html","height":420}'), { path: 'C:\\a\\demo.html', title: '', height: 420 })
  assert.deepEqual(parseVisualizeSpec('C:/Users/a/demo.html'), { path: 'C:/Users/a/demo.html', title: '', height: null })
  assert.deepEqual(parseVisualizeSpec('/home/a/demo.html'), { path: '/home/a/demo.html', title: '', height: null })
  // 不像路径的坏 JSON 仍然返回 null
  assert.equal(parseVisualizeSpec('{not json'), null)
  assert.equal(parseVisualizeSpec('{"title":"x"}'), null, '有 JSON 形状但缺 path 仍拒绝')
  assert.equal(parseVisualizeSpec('hello world'), null)
})

test('parseVisualizeSpec：height 只接受正数', () => {
  assert.equal(parseVisualizeSpec('{"path":"/a","height":0}').height, null)
  assert.equal(parseVisualizeSpec('{"path":"/a","height":-5}').height, null)
  assert.equal(parseVisualizeSpec('{"path":"/a","height":"abc"}').height, null)
  assert.equal(parseVisualizeSpec('{"path":"/a","height":300.4}').height, 300)
})

test('stripVisualizeFences：剥掉围栏并收掉多余空行', () => {
  const text = '前面\n```visualize\n{"path":"/tmp/a.html"}\n```\n后面'
  assert.equal(stripVisualizeFences(text), '前面\n后面')
  // 没有围栏时原样返回（trim 之外不动内容）
  assert.equal(stripVisualizeFences('普通文本'), '普通文本')
})

test('collectVisualizeSpecs：只从 text 块收集，顺序保持，坏围栏跳过', () => {
  const node = {
    data: {
      blocks: [
        { kind: 'reasoning', text: '想一下' },
        { kind: 'text', text: '看这个 ```visualize\n{"path":"/a.html"}\n```' },
        { kind: 'image', text: '```visualize\n{"path":"/b.html"}\n```' },
        { kind: 'text', text: '```visualize\n{bad}\n``` 和 ```visualize\n{"path":"/c.html"}\n```' },
      ],
    },
  }
  assert.deepEqual(collectVisualizeSpecs(node), [{ path: '/a.html', title: '', height: null }, { path: '/c.html', title: '', height: null }])
})

test('collectVisualizeSpecs：没有 blocks / 不是对象都安全返回空', () => {
  assert.deepEqual(collectVisualizeSpecs(null), [])
  assert.deepEqual(collectVisualizeSpecs({}), [])
  assert.deepEqual(collectVisualizeSpecs({ data: {} }), [])
  assert.deepEqual(collectVisualizeSpecs({ data: { blocks: 'x' } }), [])
})

test('withVisualizeFencesStripped：没有围栏时原样返回原节点（不无谓克隆）', () => {
  const node = { data: { blocks: [{ kind: 'text', text: '普通' }] } }
  assert.equal(withVisualizeFencesStripped(node), node)
})

test('withVisualizeFencesStripped：有围栏时克隆节点并只剥文本块', () => {
  const node = {
    data: {
      status: 'closed',
      blocks: [
        { kind: 'text', text: '前 ```visualize\n{"path":"/a"}\n``` 后' },
        { kind: 'reasoning', text: '思考' },
      ],
    },
  }
  const out = withVisualizeFencesStripped(node)
  assert.notEqual(out, node)
  assert.notEqual(out.data, node.data)
  assert.equal(out.data.status, 'closed', '其余字段原样带过')
  assert.equal(out.data.blocks[0].text, '前  后')
  assert.equal(out.data.blocks[1].text, '思考', '非文本块不动')
  assert.equal(node.data.blocks[0].text.includes('visualize'), true, '原节点不被改写')
})

test('visualizeUrlOf：绝对路径编码进查询参数', () => {
  assert.equal(visualizeUrlOf('C:/a b/页.html'), '/dsh-visualize/file?path=' + encodeURIComponent('C:/a b/页.html'))
})
