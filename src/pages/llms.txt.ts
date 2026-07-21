import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

export const GET: APIRoute = () => new Response(`# ${SITE.name}

> ${SITE.description}

- [开始学习](/learn/): 安全、器械、握法与学习顺序
- [基本技法](/techniques/): 双手剑二十法完整索引；击、刺、格、洗含视频慢放课程
- [四段套路](/routine/): 四段四十式及整套演示
- [双手剑歌诀](/koujue/): 单练行功歌诀与剑论全文及逐句时间码
- [于承惠](/person/yu-chenghui/): 人物与双手剑创传资料
- [朝鲜势法](/classics/chaoxian-shifa/): 《武备志》二十四势专题及知乎来源原图
- [人物与资料](/sources/): 人物、视频、古籍、出版与研究资料

朝鲜势法古谱与现代四十式不是一一对应关系。
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
