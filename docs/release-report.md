# 于承惠双手剑发布候选验收报告

检查日期：2026-07-21

候选版本：0.1.0 本地发布候选

结论：有条件通过。站点功能、内容结构、响应式、无障碍、性能与 SEO 技术基础已达到首版要求；在补齐正式域名、公开勘误邮箱、最终视频来源与授权文案，并确认视频托管支持 Range 请求前，不应公开部署。

## 自动化结果

| 检查 | 结果 |
| --- | --- |
| 严格内容校验 | 通过，0 警告；4 段、40 动作、24 势、时间码与权利状态完整 |
| Astro 类型检查 | 通过；78 个文件，0 错误、0 警告、0 提示 |
| 静态构建 | 通过；83 个 HTML 页面 |
| Vitest | 5 个文件、16 项测试通过 |
| Playwright | 40 项有效用例通过，26 项按项目/视口条件跳过 |
| 无障碍 | 9 个关键页 axe-core 无 serious/critical 问题；跳到正文键盘流程通过 |
| 视觉与响应式 | 375、768、1024、1440、手机横屏、二十法及朝鲜势法图文页截图通过，无水平溢出 |
| 浏览器运行时 | 8 个关键页无控制台错误、页面异常或本地资源 4xx/5xx |
| 静态性能预算 | JS gzip 合计 65,088 B；CSS gzip 合计 8,672 B；最大图片 272,512 B |
| Lighthouse 首页 | Performance 100；Accessibility 100；Best Practices 100；SEO 69 |
| Lighthouse 指标 | LCP 1.4 s；TBT 0 ms；CLS 0 |
| 发布产物审计 | 83 页、241 个可解析 JSON-LD 块；二十法原图与朝鲜势法 24 张来源原图进入构建 |

Lighthouse 的 SEO 扣分仅来自本地候选构建主动设置 `Disallow: /`。这是未配置正式域名时的发布保护；配置 HTTPS 正式域名后，需重跑 Lighthouse 和 sitemap 检查。

## 上线阻塞项

1. 配置真实的 `PUBLIC_SITE_URL`，使用 HTTPS，并复核 canonical、Open Graph、robots 与两个 sitemap。
2. 配置公开的 `PUBLIC_CONTACT_EMAIL`，用于资料勘误和校订反馈。
3. 将 `PUBLIC_VIDEO_ATTRIBUTION` 替换为最终的视频来源、版本、公开授权与再编辑说明。
4. 确定视频托管地址和缓存策略，确认 32.8 MB 发布视频支持 HTTP Range；如使用 CDN，配置 `PUBLIC_MEDIA_BASE_URL`。

`build:production` 已增加发布环境门禁，上述前三项缺失时会在构建前失败，避免把 localhost canonical 或占位授权文案发布出去。

## 编辑后续

以下事项不阻塞首版公开科普站，但应进入后续内容路线图：

- 请双手剑专业人士校订四十式名称、动作分解和两篇歌诀疑字。
- 继续追查朝鲜势法二十四势的公版底本、卷页或明确许可；当前按用户要求使用知乎文章来源原图并逐图注明转载状态，不标作公版或本站原创。
- 补充更多动作组插图前，先对现有剑路与动作顺序示意完成专业方向复核。

## 复验命令

```powershell
pnpm run build:production
pnpm test
pnpm test:e2e
pnpm run check:performance
pnpm run check:release
pnpm run audit:lighthouse
```

公开部署后的最终验收还需执行搜索平台验证、真实移动网络视频抽检、Schema Markup Validator 和 Google Rich Results Test。
