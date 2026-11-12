# 接口页面模板

模板中的 `<...>` 都必须替换。先完成 [接口工作单](api-change-template.md)，再写页面；不从模板推导业务事实。模板和工作单不会发布到客户站。

## 可调用接口

在 `api-reference/<domain>/<action>.mdx` 创建英文页面，在 `pt-br/api-reference/<domain>/<action>.mdx` 创建对应葡语页面。下面是结构模板，未提供新的真实端点或业务数值：

```mdx
---
title: "<Action and object>"
sidebarTitle: "<Short action>"
description: "<Explain the outcome and essential prerequisite independently of the title.>"
openapi: "openapi/en.json <METHOD> <PATH>"
keywords: ["<API path>", "<reader task>"]
---

<Explain what this operation does and who should call it, using the approved contract.>

| Credentials | Idempotency | Result |
| --- | --- | --- |
| <Verified credential types> | <Verified behavior or not applicable> | <Synchronous / asynchronous, verified> |

## Before you call

<State the environment, business prerequisites, credential scope and account headers.>

## Verify the result

<Explain HTTP versus business success and how to identify the requested resource.>

| Status | Meaning | What it confirms | What it does not confirm / Next step |
| --- | --- | --- | --- |
| <Verified status, only if this operation has one> | <Meaning> | <Evidence> | <Next check> |

## Handle errors and uncertain outcomes

<Describe verified errors, timeout handling, result queries and allowed retry behavior.>

## Next steps

<Link to the relevant query, callback or next operation with a root-relative URL.>
```

没有状态字段就删掉状态表并直接解释结果，不创造 PROCESSING、SUCCESS 等值。完整参数与响应由 OpenAPI 生成；需要额外业务说明时补正文，不再手写重复字段表。

现有结构参考：[查询账户余额](../api-reference/accounts/get-account-balance.mdx)。它的凭证范围、余额含义和异常处理仅属于该接口，不能直接复制为新接口的事实。

### 按需添加签名器

只有契约和现有工具均支持时才添加。当前在线发送逻辑只实现 POST；其他方法先适配并验证工具，或使用服务端示例。

```mdx
import { PlaygroundSigner } from "/snippets/playground-signer.jsx";

<PlaygroundSigner method="POST" path="<APPROVED_PATH>" body={{ /* APPROVED REQUEST BODY */ }} scope="<VERIFIED_SCOPE>" />
```

替换 method、path、完整示例 body 和已确认的 scope，不能保留注释空对象充当写操作示例。葡语组件加 `lang="pt"`；葡语 frontmatter 使用 `openapi/pt-br.json`，页面内链使用 `/pt-br/`。

六种语言的可运行示例放入该操作的 `x-codeSamples`。如果当前接口不能在浏览器直接发送，清楚说明原因和服务端调用方式，不扩大 CORS 或权限以适配页面。

## Webhook 事件

回调页面绑定事件名称而非发送端点：

```mdx
---
title: "<Event name>"
sidebarTitle: "<Short event name>"
description: "<When the callback occurs and what the receiver must do.>"
openapi: "openapi/en.json webhook <APPROVED_WEBHOOK_NAME>"
---

<Describe when Pagsmile sends this event and what it can and cannot prove.>

## Verify and acknowledge the event

<Link to the approved raw-body signature and replay-protection instructions. State the confirmed acknowledgement behavior.>

## Interpret the result

<Explain event identifiers, resource identifiers, status and how to confirm the business outcome.>

## Handle duplicates and out-of-order delivery

<Describe the confirmed idempotent handling, query fallback and recovery procedure.>
```

葡语绑定 `openapi/pt-br.json webhook <APPROVED_WEBHOOK_NAME>`。不要给回调接收页添加 `PlaygroundSigner`，也不要假设回调送达本身等于资金已完成。
