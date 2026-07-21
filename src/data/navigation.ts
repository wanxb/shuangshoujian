export interface NavigationItem {
  label: string;
  href: string;
  match: string[];
}

export const desktopNavigation: NavigationItem[] = [
  { label: '开始学习', href: '/learn/', match: ['/learn/'] },
  { label: '基本技法', href: '/techniques/', match: ['/techniques/'] },
  { label: '四段套路', href: '/routine/', match: ['/routine/', '/practice/', '/koujue/'] },
  {
    label: '古谱专题',
    href: '/classics/chaoxian-shifa/',
    match: ['/classics/'],
  },
  {
    label: '人物与资料',
    href: '/sources/',
    match: ['/person/', '/sources/'],
  },
];

export const mobileNavigation: NavigationItem[] = [
  {
    label: '学习',
    href: '/learn/',
    match: ['/learn/', '/techniques/'],
  },
  {
    label: '套路',
    href: '/routine/',
    match: ['/routine/', '/practice/', '/koujue/'],
  },
  {
    label: '古谱',
    href: '/classics/chaoxian-shifa/',
    match: ['/classics/'],
  },
  {
    label: '资料',
    href: '/sources/',
    match: ['/person/', '/sources/'],
  },
];

export function isNavigationItemActive(pathname: string, item: NavigationItem) {
  return item.match.some((prefix) => pathname.startsWith(prefix));
}
