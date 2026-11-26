# 贡献与发布

## 修改

- 主题注册、设置和装饰组件位于 `index.js`。
- 视觉样式位于 `style.css`，所有规则必须由 `html.ql-theme-active` 门控。
- 图标与封面资源放在插件根目录，并使用相对路径引用。
- 不提交 `dist/`、`preview/`、`MEMORY.md`、调试截图、压缩包或用户数据。

## 验证

```powershell
node --check index.js
node --test
```

测试会检查 Manifest、两套主题注册、设置默认值、主题源索引和关键 CSS 契约。

## 发布

1. 修改 `manifest.json` 的 semver 版本。
2. 运行全部测试。
3. 提交并推送当前仓库。
4. 在线插件源会从同一仓库读取 Manifest，不需要修改 `echo-plugins.json` 的版本字段。
5. 只有插件 ID、仓库地址或目录位置变化时，才需要更新官方插件源索引。

官方索引收录后，用户添加：

```text
https://github.com/hoowhoami/EchoMusicPlugins
```

即可在 EchoMusic「插件管理 → 在线插件」中安装。

