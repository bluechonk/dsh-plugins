/**
 * 文案。
 *
 * 聊天节点条目的 locale 席位是宿主 chat 命名空间（遮蔽条目必须与官方一致，否则
 * 官方渲染器会拿到错语言的 t），所以这里不单独注册字典，改用一个确定存在于
 * chat 字典里的键（"copy"）探测当前语言。
 */

/** 当前 chat 语言是不是中文。探测失败时按中文兜底（与仓库既有插件一致）。 */
export function isChinese(t) {
  try {
    return String(t("copy")) === "复制";
  } catch {
    return true;
  }
}

/** 插件自己的少量界面文案。 */
export function vizText(zh, key) {
  const dict = zh
    ? { loading: "加载中…", failed: "可视化加载失败", open: "新窗口打开", empty: "可视化内容为空" }
    : { loading: "Loading…", failed: "Visualization failed to load", open: "Open in new window", empty: "Nothing to render" };
  return dict[key];
}
