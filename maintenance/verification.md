# 维护规范初次验收记录

日期：2026-11-12（Asia/Shanghai）。基于提交 `b7576ee2443231c23639f80a10f0e5a7ca064820` 的文档框架、品牌设计和 Sandbox 工具整理。

## 取证范围

- `docs.json`：almond、品牌色与字体、生产 Banking 入口、双语导航、直连 Sandbox Playground、有效 redirects。
- 两份 `openapi/*.json`：每种语言 37 个可调用操作和 5 个 Webhook 事件；这些数量是本次快照，自动检查不把它们写死。
- 两组 API 页面、双语快速开始与 API access、现有签名器和 Arazzo 引用。
- 已有 `sandbox-boundaries.test.cjs` 和新增 `docs-contract.test.cjs`。

## 本地验证结果

| 检查 | 结果 |
| --- | --- |
| Node 测试 | 29 项通过，0 失败、0 跳过 |
| Mintlify 4.3.16 完整验证 | passed，0 errors、0 warnings，build ran / passed 均为 true |
| 内链、锚点、redirect 与 snippet 检查 | 无断链 |
| workflow YAML | 解析通过；只读 contents 权限；PR、main push、手动触发 |
| 维护文档相对链接 | 全部指向存在的仓库文件 |
| 新读者测试 | 只读材料即可回答接口同步范围、未知事实、GET 工具限制、两类 IP、发布条件和 CI 强制执行边界 |

新读者审阅发现的两处文字歧义已修正：pt-BR 待审只能保留草稿；main push 后的检查不能阻止同时触发的 Mintlify 部署。README 和 CI 已补齐空白检查步骤。

## 对自动检查的反向验证

在内存中模拟以下错误，不修改真实文件；六种情况均被检查拦下：

1. 操作级 `servers` 被改成 Production。
2. 葡语导航漏掉页面。
3. 葡语字段类型与英文不同。
4. 接口少了一种代码示例语言。
5. 签名器的目标路径与页面绑定不一致。
6. 维护模板不再排除客户站发布。

## 验证边界

本次没有修改业务接口内容、公开页面的布局或品牌资产，没有执行真实业务 API，也没有调整仓库权限、分支保护或部署设置。GitHub 上的实际运行结果以对应提交的 [Documentation checks](https://github.com/pagipdoc/pagsmile-bank-developer-docs/actions/workflows/docs-checks.yml) 为准；本记录不把 workflow 文件存在等同于已强制阻止合并。
