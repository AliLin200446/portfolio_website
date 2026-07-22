# LIVE-FACADE · frame-ancestors 探测报告(2026-07-22)

| 站 | 状态 | framing 头 | facade |
|---|---|---|---|
| latentfilm.com | 308→200 | 无 | 可嵌 ✓ |
| teardown.alilinlab.com | 200 | 无 | 可嵌 ✓ |
| material-memory.alilinlab.com | 200 | 无 | 可嵌 ✓ |
| vestige.alilinlab.com | 200 | 无 | 可嵌 ✓ |
| skeletal-silk.alilinlab.com | 200 | 无 | 可嵌 ✓ |
| resonance.alilinlab.com | 200 | 无 | 可嵌 ✓ |

无 framing 头 = 浏览器默认允许嵌入(当前全部可嵌,零站待配置)。
但"未设防"≠"已授权"——建议作者在各子域 vercel.json 落此片段,
显式只允许 alilinlab.com 嵌入:

```json
"headers": [{ "source": "/(.*)", "headers": [{
  "key": "Content-Security-Policy",
  "value": "frame-ancestors 'self' https://alilinlab.com https://*.alilinlab.com"
}] }]
```

落地后若某站改为拒嵌(或探测失效),把 casepages.ts 该页 hero 的
`embeddable` 置 false,facade 按钮自动降级为纯外链。
铁律:iframe 仅点击后挂载;移动端 <768px 永不提供 iframe 选项。
