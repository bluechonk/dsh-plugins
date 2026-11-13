# 变更记录

本文件记录 dsh-visualize 的版本变更。

**版本策略**：自用插件，走 `0.1.x` 迭代——接口未稳定，不做兼容性承诺。不发布到 npm，只经 dsh-plugins 的插件市场索引安装。**没有明确要求就不发版**：日常改代码既不 bump 版本号也不打 tag，未发布的改动先攒在本文件顶部的「未发布」段。

## 未发布

- **对话内可视化**：模型把 HTML 页面写到 `<workspace>/.dsh/visualizations/<name>.html`，在回复里放一个 `visualize` 围栏（绝对路径 + 可选 title / height），插件用沙箱 iframe 把页面渲染在回复正文之后。
- **遮蔽而非重写**：用 `priority: -1` 遮蔽官方 `assistant-step` 聊天节点；没有 viz 围栏时把整个 props 原样交给官方组件（行为与原生一致），有围栏时才剥掉围栏并追加卡片。官方条目的 `component` / `inject` 被捕获并代理，保证官方组件拿到的 props 不变。
- **host 路由** `GET /dsh-visualize/file`：回环 + 同源守卫；路径必须是绝对路径且真实路径（跟随符号链接后）落在 `<dshHome>/visualizations` 或已登记工作区之内；单文件不超过 1MB；响应带 CSP / nosniff / no-store。
- **技能** `skills/viz/SKILL.md`：说明使用时机、页面约束（CSP 只放行内联脚本样式与常用 CDN，禁用 fetch）与围栏写法。
- **围栏体兼容纯路径**：模型在 Windows 上常直接写 `{"path":"C:\Users\..."}`（反斜杠未转义，不是合法 JSON），`parseVisualizeSpec` 增加两级兜底——像 JSON 就用正则抠字段，整段不像 JSON 就当纯路径。
- **槽位声明时机**：遮蔽条目注册时不再带 `children`（会撞官方条目报 `already declared` 并让整个 web boot 失败），改为 `slots.inject` 等槽位声明后注册、注册后往自己的条目记录补 `children`。真机复验：普通回复原样委托官方组件，含围栏的回复渲染出沙箱 iframe。
