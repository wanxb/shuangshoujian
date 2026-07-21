const imageDimensions = [
  [580, 696], [580, 680], [580, 728], [580, 710], [580, 724], [580, 696],
  [580, 700], [580, 694], [580, 656], [580, 714], [580, 718], [580, 710],
  [580, 716], [580, 712], [580, 706], [580, 696], [580, 714], [580, 718],
  [592, 664], [580, 730], [580, 724], [580, 728], [580, 720], [580, 730],
] as const;

export const CHAOXIAN_FORM_IMAGE_FILES = [
  '01-juding.png', '02-dianjian.png', '03-zuoyi.png', '04-baotou.png',
  '05-tanfu.png', '06-kuayou.png', '07-liaolue.png', '08-yuche.png',
  '09-zhanqi.png', '10-kanshou.png', '11-yinmang.png', '12-zuanji.png',
  '13-yaoji.png', '14-zhanchi.png', '15-youyi.png', '16-jieji.png',
  '17-zuojia.png', '18-kuazuo.png', '19-xianji.png', '20-nilin.png',
  '21-lianchi.png', '22-youjia.png', '23-fengtou.png', '24-hengchong.png',
] as const;

export function chaoxianFormImage(formNumber: number) {
  const file = CHAOXIAN_FORM_IMAGE_FILES[formNumber - 1];
  const [width, height] = imageDimensions[formNumber - 1];
  return {
    path: `/media/classics/chaoxian-shifa/${file}`,
    width,
    height,
  };
}
