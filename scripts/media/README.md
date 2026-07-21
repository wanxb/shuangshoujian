# 媒体处理管线

母版固定读取 `docs/IMG_4455.MP4`，任何命令都不会修改母版，也不会把它原样复制到 `public/`。

```powershell
pnpm media:assets       # WebVTT、海报、关键帧、媒体清单
pnpm media:dev          # 低码率全片 + 上述资产
pnpm media:production   # 标准版、低码率版 + 上述资产
```

默认使用 `ffmpeg-static`。需要使用系统 ffmpeg 时可设置 `FFMPEG_PATH`。生产视频使用 H.264、AAC、约 20fps、方形像素、`yuv420p` 和 `faststart`；标准版保持母版尺寸上限，低码率版缩至 640px 宽。所有公开派生物都应保留 `public/media/media-manifest.json` 中的源文件、处理参数、生成时间和可用状态。

公开视频、海报、关键帧和视频截图插图会对右上角 `YOUKU` 区域应用轻微像素化。母版 `docs/IMG_4455.MP4` 始终保留原样。

视频画面已经包含字幕，播放器不再生成或加载额外的 WebVTT 字幕轨道。40 式名称和两篇歌诀仅作为网页正文与章节导航使用。
