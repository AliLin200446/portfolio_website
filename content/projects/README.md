# content/projects — 项目页数据(作者只填这里,不碰组件)

## 两套 kind 怎么选
- **folio(实验室手记/分屏)**:有真手记料(证物、旁注、结论)才用。
  姿态是"看我如何测量"。样板:`latent.ts`(已填,照抄它)。
- **specimen(陈列签/单栏)**:无手记料的项目。姿态是"物自己说话,
  我退后"。签文 ≤120 词,超长构建时 console.warn(没料硬写=违纪)。

## 分配建议(可改)
folio: latent(已填)、teardown。
specimen: resonance(草稿已填待改)、skeletal-silk、vestige(+documents)、
acubot(签文须父亲过目后填;当前 no href,接路由前不上线)。

## 规则
- 每文件 `export default defineProject(slug, {...})`;未填模板 export null,
  路由自动回落旧页,不会渲染半成品。
- **src 留空 → 渲 `[EVIDENCE: …]` 占位框,绝不生成假图。**
- **marginNote / documents / signoff_zh 留空 → 该元素不渲染**(空是策展)。
- meta/specs 只填可验证硬事实;caption 写"什么条件下测的"。
- 中文只出现在 signoff_zh(落款对句)。
- 新增项目 = 加一个数据文件 + STATIONS 填 href。零组件改动。

## 升级通道
specimen 攒出真手记 → 同文件把 `kind` 改 `'folio'`、补 exhibits/findings。
题版落款(colophon)不动,组件不动。升级是改数据不是重写。

## schema 与 spec 的两处补漏(已在 _schema.ts 注明)
- exhibit 增加 `heading` + `paras`(spec 原稿缺左栏正文来源)。
- colophon 增加 `year`(落款需要)。

## 宪法(组件层自动继承,填数据不会填漏)
分屏是增强层(≥1024px+no-reduced+JS),否则单栏顺序阅读零丢失;
停滚即静;右栏/物永不跑第二个 WebGL;录屏懒加载进视口播;
朱:folio=active 证物号单例,specimen 默认无朱;无卡片阴影圆角。
