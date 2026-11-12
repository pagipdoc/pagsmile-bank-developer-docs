# Pagsmile Open API 文档仓库

Pagsmile 巴西业务的开发者文档，使用 Mintlify，面向集成开发者提供英文和巴西葡语内容。

- [在线文档](https://corebanking.mintlify.app/)
- [维护流程：从这里开始](CONTRIBUTING.md)
- [必须遵守的内容与设计契约](maintenance/contracts.md)
- [新增接口变更单](maintenance/api-change-template.md)
- [接口与 Webhook 页面模板](maintenance/api-page-template.md)

## 本地检查

使用 Node.js 22 和 npm，在本仓库根目录执行：

```sh
node --test tests/sandbox-boundaries.test.cjs tests/docs-contract.test.cjs
npx --yes mint@4.3.16 validate --format json
npx --yes mint@4.3.16 broken-links --check-anchors --check-redirects --check-snippets
git diff --check
npx --yes mint@4.3.16 dev --port 3001
```

检查命令不需要真实 AK/SK。Node 测试使用合成凭证和模拟请求；Mintlify 验证需要联网下载构建工具，不会替你执行真实业务接口。

## 文件分工

| 文件 | 职责 |
| --- | --- |
| `docs.json` | 双语导航、品牌配置、Playground 设置、有效重定向 |
| `openapi/en.json`、`openapi/pt-br.json` | 对外接口字段、认证、请求与响应、六种语言的代码示例 |
| `api-reference/`、`pt-br/api-reference/` | 接口使用前提、业务语义、状态、失败处理与下一步 |
| `quickstart.mdx`、`api-access-setup.mdx` 及葡语对应页 | 注册、Sandbox 凭证、IP 白名单与首次调用 |
| `snippets/` | 签名、凭证、IP 工具及首页品牌组件 |
| `style.css`、`layout.css`、`hero.css` | 品牌样式、文档布局、紧凑首页动效 |
| `arazzo/` | 多接口业务流程与 `operationId` 引用 |
| `tests/`、`.github/workflows/` | 结构契约、Sandbox 边界和构建检查 |

维护文件通过 `.mintignore` 排除在客户文档站之外。这个排除规则不改变 GitHub 仓库的可见性，维护文件中也不能存放密钥、客户信息或内部业务材料。
