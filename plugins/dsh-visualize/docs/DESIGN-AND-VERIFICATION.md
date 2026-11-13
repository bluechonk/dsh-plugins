# 设计与验证记录

## 一、目标

DSH 的回复默认只有 Markdown，模型做「界面原型 / 交互图表 / 方案对比」时只能贴代码块。目标：给一条**对话内**的 HTML 渲染通道，且满足：

- 页面由模型生成、落在工作区里（可复查、可复用）；
- 渲染结果内联在对话中，不是侧边栏；
- 不影响不含可视化的普通回复；
- 页面脚本碰不到宿主（沙箱 + CSP）。

## 二、关键调研结论（决定了架构）

调研对象：`resources/app.asar`（版本 `0.2.1-rc.2`），方法与 `dsh-usage-stats/docs/dsh-client-runtime-capabilities.md` 同源。

1. **官方插件目录没有可视化能力**。内置可选插件里没有 GenUI / visualize 一类条目；包体内检索 `::visualize`、`dsh-ui` 均 0 命中。ZCode 的 `visualize` 技能依赖 ZCode 宿主的 presentation surface（协议入口 `includeVisualize: true`），DSH 不渲染 `::visualize` 引用。
2. **聊天节点是 keyed / session 作用域的槽**。`conversation.chat.node` 由 `dsh-client-ui-chat` 声明（`kind: "keyed"`, `scope: "session"`, `inject: CHAT_NODE_INJECT`），Chat 渲染时按节点 `kind` 选条目（`renderSlot("conversation.chat.node", owner, { entryKey: routedNode.kind })`）。官方 `assistant-step` 条目渲染助手回复。
3. **槽位支持遮蔽**：同 key 不同 `priority` 时数值小者胜出，被遮蔽的条目仍留在 `slots.entries(key)` 里。社区插件 dsh-genui 正是用 `priority: -1` 遮蔽 `assistant-step` 来拦截 `schemaJson` 围栏。
4. **官方条目带 `children` 与 `inject`**：`conversation.chat.reasoning.body` / `conversation.chat.message.images` 两个子槽，以及 `presentation` / `resolveFilePath` / `fileMentions` 注入。遮蔽条目必须补齐，否则官方组件拿不到这些。
5. **官方文档明确反对重写聊天渲染**："Write your own controls and match the host instead"，且重写会与宿主长期漂移。→ 结论：**遮蔽 + 委托**，只在确有围栏时接管。

## 三、设计

### 3.1 围栏语法

模型在回复里写：

````text
```visualize
{"path":"/abs/path/to/page.html","title":"可选","height":420}
```
````

- 大小写敏感（`visualize`），避免误吞普通代码块；
- 围栏体是**一行 JSON**；解析不出来的围栏当普通代码块留给官方渲染器，不静默吞掉；
- 未闭合的围栏不算围栏（流式输出中途不闪卡片）。

### 3.2 client 半：遮蔽 + 委托

```
VizAssistantView（priority -1 遮蔽 assistant-step）
 ├─ 没有 viz 围栏 → h(官方组件, props)            ← 与原生完全一致
 └─ 有 viz 围栏   → h(官方组件, { ...props, node: 剥掉围栏的克隆节点 })
                     + specs.map(VizFrame)          ← 沙箱 iframe 卡片
```

- 官方条目（`component` + `inject`）从 `slots.entries("conversation.chat.node")` 捕获；本条目代理它的 `inject`，槽位注入的 `presentation` / `resolveFilePath` / `fileMentions` 与原条目一致。
- 条目自身声明 `conversation.chat.reasoning.body` 与 `conversation.chat.message.images` 两个子槽，官方的 `renderSlot` 调用才能解析。
- 槽位注册后用 `slots.subscribe` 监听变更：官方条目若比本插件更晚注册，出现即重新捕获。
- 捕获不到官方组件时降级为纯文本渲染文本块（`dviz-plain`），绝不白屏。

### 3.3 host 半：文件路由

`GET /dsh-visualize/file?path=<绝对路径>`：

1. 回环 + 同源守卫（`remoteAddress` / `sec-fetch-site` / `origin`）；
2. 白名单：`<dshHome>/visualizations` 与所有已登记工作区（`workspaceRegistry`）；
3. 用 `realpath` 取真实路径后再校验包含关系——挡「根内目录项是指向别处的符号链接」；
4. 普通文件且 ≤ 1MB；
5. 响应头：`Content-Type: text/html`、CSP（`default-src 'none'`，放行内联脚本样式与常用 CDN）、`X-Content-Type-Options: nosniff`、`Cache-Control: no-store`。

### 3.4 沙箱

iframe 用 `sandbox="allow-scripts"`（不给 `allow-same-origin`）：文档是独立源，读不到宿主、发不出同源请求；配合 CSP 禁掉 `connect-src`，页面里的 `fetch` / XHR 也出不去。

## 四、验证

### 4.1 静态与单元测试

```
npm run check    → 9 个文件语法检查通过
npm test         → 27 项全绿
```

覆盖：

| 测试 | 覆盖点 |
|---|---|
| `pure.test.mjs` | 围栏切分（顺序、多围栏、大小写、未闭合）、`parseVisualizeSpec`（缺 path / 坏 JSON / 非对象 / height 取值）、`stripVisualizeFences`、`collectVisualizeSpecs`（只读 text 块、坏围栏跳过）、`withVisualizeFencesStripped`（无围栏不克隆、有围栏只改文本块且不动原节点）、`visualizeUrlOf` 编码 |
| `visualize-path.test.mjs` | 白名单根的构成、根内/等于根/父目录穿越/根外、相对路径、不存在、目录、超 1MB、符号链接绕行（指向根外拒绝、指向根内放行并返回真实路径） |
| `http.test.mjs` | 200 + `text/html` + CSP + nosniff；越界 / 不存在 / 相对路径 404；HEAD 无响应体；非 GET/HEAD 405 带 `Allow`；跨站来源、坏 origin、非常规来源地址 403 |
| `client.test.mjs` | `__pure` 导出面快照；遮蔽条目的 name / key / priority / 两个子槽；有围栏时官方组件拿到剥掉围栏的克隆节点且追加卡片（标题取 `spec.title`、`title` 属性带完整路径、加载占位）；无围栏时原样转发原节点且没有卡片 |

### 4.2 真机复验（2026-11-13）

在临时 profile（`dsh-web-verify`，复制 desktop 插件组合）+ dsh web + agent-browser 上跑通：

| 步骤 | 结果 |
|---|---|
| 插件激活 | host 半挂上 `/dsh-visualize/file`（日志 `route registered`）；client 半 factory/apply 均执行，`style[data-plugin-css="@bluechonk/dsh-visualize"]` 已注入 |
| 普通回复 | 遮蔽组件 `specs=0`，原样转交官方组件渲染，界面与原生一致 |
| 含 viz 围栏的回复 | 模型写 `<workspace>/.dsh/visualizations/demo.html` 并在回复里放 ```` ```visualize ```` 围栏；组件 `specs=1`，回复里出现沙箱 iframe（`/dsh-visualize/file?path=...`），页面正文显示 `Hello Viz` |

复验中修掉的两个真实问题：

1. **槽位声明时机**：注册条目时带上 `children`（`conversation.chat.reasoning.body` / `conversation.chat.message.images`）会撞官方条目报 `slot ... is already declared`，整个 web boot 失败；改成 `slots.inject` 等槽位声明后再注册、注册后往**自己的条目记录**（`slots.entries` 里那条，不是 `register` 的返回值）补 `children`。
2. **Windows 路径不是合法 JSON**：模型直接写 `{"path":"C:\Users\..."}`，反斜杠未转义导致 `JSON.parse` 失败。`parseVisualizeSpec` 增加两级兜底：像 JSON 就用正则抠出 `path`/`title`/`height`；整段不像 JSON 就当纯路径。

> 复验用的临时 profile 与插件联接只在验证期间存在，验证后已清理（见 `.tmp/` 下的脚本）。

## 五、回滚

`plugin_manager remove_bundle`（目标 `@bluechonk/dsh-visualize`），或在 profile 的 `cordis.patch.yml` 里把 `@bluechonk/dsh-visualize` 行置为 `disabled: true`。插件自身不写任何持久化数据。
