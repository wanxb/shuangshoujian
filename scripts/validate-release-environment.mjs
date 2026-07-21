const errors = [];
const siteUrl = process.env.PUBLIC_SITE_URL?.trim() ?? '';
const mediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL?.trim() ?? '';
const contactEmail = process.env.PUBLIC_CONTACT_EMAIL?.trim() ?? '';
const attribution = process.env.PUBLIC_VIDEO_ATTRIBUTION?.trim() ?? '';

try {
  const parsed = new URL(siteUrl);
  if (parsed.protocol !== 'https:') errors.push('PUBLIC_SITE_URL 必须使用 HTTPS');
  if (['localhost', '127.0.0.1'].includes(parsed.hostname)) errors.push('PUBLIC_SITE_URL 不得指向本机');
} catch {
  errors.push('PUBLIC_SITE_URL 必须是有效的公开 URL');
}

if (mediaBaseUrl) {
  try {
    const parsed = new URL(mediaBaseUrl);
    if (parsed.protocol !== 'https:') errors.push('绝对 PUBLIC_MEDIA_BASE_URL 必须使用 HTTPS');
  } catch {
    if (!mediaBaseUrl.startsWith('/')) errors.push('PUBLIC_MEDIA_BASE_URL 必须是 HTTPS URL 或站内绝对路径');
  }
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
  errors.push('PUBLIC_CONTACT_EMAIL 必须是有效的公开勘误邮箱');
}

if (!attribution || /待补充|TODO|TBD/i.test(attribution)) {
  errors.push('PUBLIC_VIDEO_ATTRIBUTION 必须填写最终来源与授权说明');
}

if (errors.length) {
  for (const error of errors) console.error(`[release environment] ${error}`);
  process.exit(1);
}

console.log('[release environment] 发布环境配置通过');
