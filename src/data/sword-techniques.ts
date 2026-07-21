export interface SwordTechnique {
  key: string;
  name: string;
  verse: string;
  uncertainParts?: string[];
  lessonKey?: 'ji' | 'ci' | 'ge' | 'xi';
}

export const SWORD_TECHNIQUES: SwordTechnique[] = [
  { key: 'chou', name: '抽', verse: '凶锋抽动只一闪，消息就在腰肘盘。' },
  { key: 'dai', name: '带', verse: '长刃带过狠而快，攻守俱在一回环。' },
  { key: 'yun', name: '云', verse: '腰手牵动云已过，常与反攻势相连。' },
  { key: 'mo', name: '抹', verse: '抹取劫腹腰肋间，需用身法把劲传。', uncertainParts: ['劫腹'] },
  { key: 'ti', name: '提', verse: '双手一提遮半身，贵在争锋一瞬间。' },
  { key: 'dian', name: '点', verse: '点中带挑人难识，欲奔筋脉刃须偏。' },
  { key: 'beng', name: '崩', verse: '崩动犀利刃须偏，更要挡取臂和腕。' },
  { key: 'ca', name: '擦', verse: '擦取腋下并全身，双手合力不要单。' },
  { key: 'ci', name: '刺', verse: '刺如长针使不弯，凶锋一线意要全。', lessonKey: 'ci' },
  { key: 'ji', name: '击', verse: '抖动击出脆而快，恰似扬手甩大鞭。', lessonKey: 'ji' },
  { key: 'jiao', name: '绞', verse: '绞取敌腕实中虚，扬手剑落是本源。' },
  { key: 'jie', name: '截', verse: '巧截来踪意在先，妙手回锋惊人胆。' },
  { key: 'zhan', name: '斩', verse: '斩取劲颈令人寒，法中有锉方呈险。', uncertainParts: ['劲颈'] },
  { key: 'ge', name: '格', verse: '格中有闪行一偏，撒手一攻不费难。', lessonKey: 'ge' },
  { key: 'pi', name: '劈', verse: '力劈头面并双肩，腰手并用势要坚。' },
  { key: 'tiao', name: '挑', verse: '挑如闪电划破天，又似蜻蜓把水点。' },
  { key: 'bo', name: '拨', verse: '拨法多用下盘间，夺机回锋贵一先。' },
  { key: 'gua', name: '挂', verse: '来锋挂出身已到，扬手一剑至人前。' },
  { key: 'cuo', name: '锉', verse: '利刃一锉只几寸，此法专奔筋脉关。' },
  { key: 'xi', name: '洗', verse: '洗字当是柔克刚，虚灵一转早奉还。', lessonKey: 'xi' },
];

export const SWORD_TECHNIQUE_GROUPS = Array.from({ length: 4 }, (_, index) =>
  SWORD_TECHNIQUES.slice(index * 5, index * 5 + 5),
);

export const SWORD_TECHNIQUE_MNEMONIC = '抽带云抹提，点崩擦刺击，绞截斩格劈，挑拨挂锉洗。';
export const SWORD_TECHNIQUE_CLOSING = '以上剑法二十全，朝夕磨炼勿畏艰，习至炉火纯青日，轨迹处处皆是剑。';
