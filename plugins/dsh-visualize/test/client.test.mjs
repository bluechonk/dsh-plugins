// client.test.mjs —— client/client.js 的直测面（零 DOM、零 npm 依赖）。
//
// 物化手法：顶层摸 window.__ModuleLoader__.load，用最小 React 桩跑 factory，
// 取出 module.exports（apply / __pure），再直接渲染遮蔽组件验证行为。

import test from 'node:test'
import assert from 'node:assert/strict'

const reactStub = {
  Component: class {},
  useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
  useRef: (v) => ({ current: v }),
  useCallback: (fn) => fn,
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
}
const stubRequire = (id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
  throw new Error('client.test 桩未覆盖的 require：' + id)
}

let captured = null
globalThis.window = { __ModuleLoader__: { load: (def) => { captured = def.factory(stubRequire) } } }
await import('../client/client.js')
delete globalThis.window
assert.ok(captured !== null && captured.__pure !== undefined, '桩物化失败：client.js 的 factory 未被宿主 load 调到')
const P = captured.__pure

test('__pure 导出面固定（防导出漂移）', () => {
  assert.deepEqual(Object.keys(P).sort(), [
    'collectVisualizeSpecs', 'hasVisualizeFence', 'parseVisualizeSpec', 'splitVisualizeFences',
    'stripVisualizeFences', 'visualizeUrlOf', 'withVisualizeFencesStripped',
  ])
  assert.ok(Object.isFrozen(P))
})

/** 深度收集节点（children 里可能嵌套数组——React 会摊平，桩不会）。 */
function collect(node, out = []) {
  if (node === null || node === undefined) return out
  if (Array.isArray(node)) {
    for (const item of node) collect(item, out)
    return out
  }
  out.push(node)
  for (const child of node.children || []) collect(child, out)
  return out
}

/** 造一套 ctx：entries 里放一个假官方条目，register 捕获本插件的遮蔽条目。 */
function makeCtx() {
  const registers = []
  let capturedEntry = null
  const FakeBuiltin = () => null
  const mine = []
  const ctx = {
    effect: () => () => {},
    slots: {
      // 槽位已声明时 inject 同步执行回调（与宿主一致）
      inject: (_name, fn) => fn(),
      register: (options, component) => {
        const record = { options, component, children: undefined }
        capturedEntry = record
        registers.push(record)
        mine.push(record)
        return () => {}
      },
      entries: () => [
        {
          component: FakeBuiltin,
          options: { key: 'assistant-step' },
          children: { 'conversation.chat.reasoning.body': { kind: 'single' } },
          inject: () => ({}),
        },
        ...mine,
      ],
      subscribe: () => () => {},
    },
  }
  captured.apply(ctx)
  return { registers, entry: capturedEntry, FakeBuiltin }
}

test('装配：遮蔽 assistant-step，注册时不重复声明子槽、注册后补上', () => {
  const { registers, entry } = makeCtx()
  assert.equal(registers.length, 1)
  assert.equal(entry.options.name, 'conversation.chat.node')
  assert.equal(entry.options.key, 'assistant-step')
  assert.equal(entry.options.priority, -1, 'priority 更小才能遮蔽官方条目')
  // 注册时声明子槽会撞官方条目报「already declared」，所以注册时不能带
  assert.equal(entry.options.children, undefined)
  assert.equal(entry.children['conversation.chat.reasoning.body'].kind, 'single', '注册后要补声明 reasoning body')
  assert.equal(entry.children['conversation.chat.message.images'].kind, 'single', '注册后要补声明 message images')
})

test('渲染：有围栏时把剥掉围栏的节点交给官方组件，并追加可视化卡片', () => {
  const { entry, FakeBuiltin } = makeCtx()
  const node = {
    data: {
      status: 'closed',
      blocks: [{ kind: 'text', text: '看这个 ```visualize\n{"path":"/tmp/a.html","title":"原型"}\n```' }],
    },
  }
  const tree = entry.component({ node, sessionId: 's1', t: (key) => (key === 'copy' ? '复制' : key) })
  const nodes = collect(tree)

  // 官方组件拿到的是克隆节点：围栏已剥掉，且不是原节点
  const official = nodes.find((n) => n.type === FakeBuiltin)
  assert.ok(official, '应渲染官方组件')
  assert.notEqual(official.props.node, node, '官方组件应拿到克隆节点')
  assert.equal(official.props.node.data.blocks[0].text, '看这个', '围栏应从文本里剥掉')

  // 可视化卡片：组件元素带着解析出的规格（组件本身由 React 渲染，这里直接调用它）
  const frameEl = nodes.find((n) => n.props && n.props.spec && n.props.spec.path === '/tmp/a.html')
  assert.ok(frameEl, '应渲染可视化卡片')
  const frameNodes = collect(frameEl.type(frameEl.props))
  assert.ok(frameNodes.some((n) => n.props && n.props.className === 'dviz-card'), '卡片根节点应有 dviz-card 类')
  assert.ok(frameNodes.some((n) => n.props && n.props.className === 'dviz-loading'), '加载中应有占位')
  const barText = frameNodes.map((n) => (typeof n.type === 'string' ? n.children.filter((c) => typeof c === 'string').join('') : '')).join('')
  assert.ok(barText.includes('原型'), '卡片标题应显示 spec.title')
  assert.ok(frameNodes.some((n) => n.props && n.props.title === '/tmp/a.html'), '标题条应带完整路径作为 title')
})

test('渲染：没有围栏时直接把原 props 交给官方组件', () => {
  const { entry, FakeBuiltin } = makeCtx()
  const node = { data: { status: 'closed', blocks: [{ kind: 'text', text: '普通回复' }] } }
  const props = { node, sessionId: 's1', t: (key) => key }
  const tree = entry.component(props)
  const nodes = collect(tree)
  const official = nodes.find((n) => n.type === FakeBuiltin)
  assert.ok(official)
  assert.equal(official.props.node, node, '无围栏时应原样转发原节点')
  assert.equal(nodes.some((n) => n.props && n.props.className === 'dviz-card'), false, '无围栏时不应有可视化卡片')
})
