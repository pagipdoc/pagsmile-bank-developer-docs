# Pagsmile 文档维护约束

适用范围是整个文档站。完整规则见 [内容与设计契约](../maintenance/contracts.md)，步骤与命令见 [更新流程](../CONTRIBUTING.md)。

1. 面向 Pagsmile 巴西业务的集成开发者。根目录为英文，`pt-br/` 为巴西葡语；同一能力同一变更中成对维护。
2. `openapi/en.json` 和 `openapi/pt-br.json` 保存对外接口契约。MDX 通过 `openapi` frontmatter 绑定操作，补充业务语义，不另造一份字段定义。
3. 所有在线 AK/SK 输入、签名和发送只允许 Sandbox。Production URL 仅作展示；导航中的 Banking platform 仍指向生产平台。
4. Developer Center 页面测试要放行当前电脑的公网出口 IP；服务器调用要放行服务器出口 IP。保留两者的区别。
5. HTTP 成功、请求受理和资金终态必须区分。状态、金额、重试、MED 等结论必须有对应版本的证据。
6. `docs.json` 的双语导航和 redirects 是生效配置。根目录 `redirects.json` 已被排除发布，不能用它代替配置。
7. 普通接口更新保持 almond 主题、现有海军蓝/薄荷绿、字体、导航和首页尺寸。视觉变更单独说明理由并按流程验收。
8. 自定义组件复用现有 `pgs-` 类及工具；不得把密钥写入持久存储、日志或遥测。当前 `PlaygroundSigner` 的发送只支持 POST。
9. 提交前运行两组 Node 测试、完整 Mintlify 验证、断链检查和 `git diff --check`；不要依赖作者机器上未提交的私有脚本。
10. 流程、模板和自动化文件由 `.mintignore` 排除客户站发布，但仍可能在 GitHub 可见，不得写入敏感材料。

规则中的技术事实发生已确认的变化时，同时更新契约、实现和测试并说明原因。不能为了让检查通过而只放松测试。
