export const SITE = {
  name: '于承惠双手剑',
  shortName: '双手剑',
  description: '面向初学者的于承惠双手剑公开学习资料，包含基本技法、四段套路、歌诀、人物与《武备志·朝鲜势法》专题。',
  tagline: '从原始影像出发，循序学习双手剑。',
  url: import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  mediaBaseUrl: import.meta.env.PUBLIC_MEDIA_BASE_URL || '/media',
  editorLabel: import.meta.env.PUBLIC_EDITOR_LABEL || '本站整理',
  videoAttribution:
    import.meta.env.PUBLIC_VIDEO_ATTRIBUTION || '来源与授权说明待补充',
} as const;
