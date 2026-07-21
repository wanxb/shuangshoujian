# 于承惠双手剑

面向初学者的公开科普与教学网站，整理于承惠双手剑二十法、四十式套路、片尾歌诀、人物资料及《武备志·朝鲜势法》二十四势。

## 本地开发

需要 Node.js 22.12 或更高版本，以及 pnpm 11。

```powershell
pnpm install
pnpm dev
```

默认地址为 `http://127.0.0.1:4321/`。

## 检查与构建

```powershell
pnpm run validate:content
pnpm test
pnpm run build
pnpm run check:release
```

公开部署前复制 `.env.example` 中的配置，并设置真实的站点地址、媒体地址和视频来源说明：

```powershell
pnpm run build:production
```

## 媒体文件

- `public/media/` 保存网站直接使用的图片和低码率视频，应随代码提交。
- `docs/IMG_4455.MP4` 是本地教学母版，体积约 254 MB，已被 Git 忽略。
- 需要重新生成海报、关键帧或视频时，使用 `pnpm run media:dev`；详细参数见 `scripts/media/README.md`。

## Cloudflare 部署

- Pages 项目：`shuangshoujian`
- Pages 域名：`https://ssj.bbing.xyz`
- R2 存储桶：`shuangshoujian`
- 建议的 R2 自定义域名：`https://media.ssj.bbing.xyz`

先在 R2 的“自定义域”中绑定 `media.ssj.bbing.xyz`，然后上传低码率视频：

```powershell
pnpm run deploy:r2
```

Cloudflare Pages 使用以下构建设置：

```text
Production branch: main
Build command: pnpm run build:cloudflare
Build output directory: dist
Node.js version: 22.16.0
pnpm version: 11.9.0
```

将 `.env.production.example` 中的变量配置到 Pages 的生产环境。Git 集成会自动部署；也可以在已登录 Wrangler 后运行 `pnpm run deploy:pages`。

## 项目结构

- `src/pages/`：页面路由
- `src/components/`：导航、播放器与教学组件
- `src/content/`：四十式、歌诀、人物、古谱和来源数据
- `public/media/`：可部署媒体资源
- `scripts/`：内容校验、媒体处理和发布检查
- `tests/`：单元、端到端与无障碍测试
