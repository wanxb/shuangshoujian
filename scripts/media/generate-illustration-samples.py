from pathlib import Path

import cv2
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
VIDEO = ROOT / "docs" / "IMG_4455.MP4"
OUTPUT = ROOT / "public" / "media" / "illustrations"
FONT_PATH = Path("C:/Windows/Fonts/msyh.ttc")

INK = "#171918"
PAPER = "#f7f7f4"
VERMILION = "#a6382c"
PINE = "#2f6255"
STEEL = "#3f6678"
WHITE = "#ffffff"


def font(size: int):
    return ImageFont.truetype(str(FONT_PATH), size)


def frame_at(second: float):
    video = cv2.VideoCapture(str(VIDEO))
    video.set(cv2.CAP_PROP_POS_MSEC, second * 1000)
    ok, frame = video.read()
    video.release()
    if not ok:
        raise RuntimeError(f"无法读取视频 {second} 秒画面")
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    width, _ = image.size
    box = (width - 116, 16, width - 4, 56)
    watermark = image.crop(box)
    watermark = watermark.resize((16, 6), Image.Resampling.BOX)
    watermark = watermark.resize((112, 40), Image.Resampling.NEAREST)
    image.paste(watermark, box)
    return image


def draw_arrow(draw: ImageDraw.ImageDraw, start, end, color, width=10):
    draw.line([start, end], fill=color, width=width)
    x1, y1 = start
    x2, y2 = end
    dx, dy = x2 - x1, y2 - y1
    length = max((dx * dx + dy * dy) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    head = 24
    wing = 13
    points = [
        (x2, y2),
        (x2 - ux * head + px * wing, y2 - uy * head + py * wing),
        (x2 - ux * head - px * wing, y2 - uy * head - py * wing),
    ]
    draw.polygon(points, fill=color)


def label(draw, xy, title, subtitle=None, dark=True):
    x, y = xy
    title_font = font(28)
    subtitle_font = font(18)
    width = 250
    height = 48 if subtitle is None else 78
    fill = (23, 25, 24, 220) if dark else (247, 247, 244, 235)
    draw.rounded_rectangle((x, y, x + width, y + height), radius=6, fill=fill)
    color = WHITE if dark else INK
    draw.text((x + 14, y + 8), title, font=title_font, fill=color)
    if subtitle:
        draw.text((x + 14, y + 45), subtitle, font=subtitle_font, fill=color)


def technique_diagram(mirrored=False):
    image = frame_at(305).resize((1024, 560), Image.Resampling.LANCZOS)
    if mirrored:
        image = ImageOps.mirror(image)
    draw = ImageDraw.Draw(image, "RGBA")
    points = ((700, 245), (365, 245))
    if mirrored:
        points = tuple((1024 - x, y) for x, y in points)
    draw_arrow(draw, points[0], points[1], VERMILION, 12)
    for index, (x, y) in enumerate(((438, 474), (590, 474)), 1):
        px = 1024 - x if mirrored else x
        draw.ellipse((px - 25, y - 12, px + 25, y + 12), outline=STEEL, width=7)
        draw.text((px - 7, y - 13), str(index), font=font(18), fill=WHITE)
    draw.arc((380, 310, 660, 540), start=200, end=335, fill=PINE, width=10)
    label(draw, (24, 24), "击法 · 横向剑路", "朱红：剑路　钢蓝：足位")
    if mirrored:
        label(draw, (750, 468), "镜像视角", dark=False)
    return image


def group_sequence(mirrored=False):
    times = [421.5, 425.5, 429.5, 432.0, 435.5]
    labels = ["预备", "01 并步接剑上挑", "02 开步格抱剑", "03 蹲步带压剑", "04 上步崩挑剑"]
    canvas = Image.new("RGB", (1600, 620), PAPER)
    draw = ImageDraw.Draw(canvas, "RGBA")
    panel_width = 300
    for index, (second, title) in enumerate(zip(times, labels)):
        image = frame_at(second).resize((panel_width, 360), Image.Resampling.LANCZOS)
        if mirrored:
            image = ImageOps.mirror(image)
        x = 20 + index * 316
        canvas.paste(image, (x, 112))
        draw.rectangle((x, 112, x + panel_width, 472), outline="#d8dad5", width=2)
        draw.ellipse((x + 124, 420, x + 176, 446), outline=STEEL, width=7)
        draw.text((x + 142, 418), str(index + 1), font=font(18), fill=WHITE)
        draw.text((x, 490), title, font=font(21), fill=INK)
        draw.text((x, 526), f"{int(second // 60):02d}:{int(second % 60):02d}", font=font(17), fill=STEEL)
        if index < len(times) - 1:
            draw_arrow(draw, (x + 285, 96), (x + 325, 96), VERMILION, 7)
    draw.text((20, 20), "第一段第一组 · 动作顺序", font=font(34), fill=INK)
    draw.text((20, 64), "足位编号仅作画面定位，剑路与步法待专业校订", font=font(18), fill="#4b514e")
    if mirrored:
        label(draw, (1320, 18), "镜像视角", dark=False)
    return canvas


def save_pair(name, builder):
    for suffix, mirrored in (("", False), ("-mirrored", True)):
        output = OUTPUT / f"{name}{suffix}.webp"
        output.parent.mkdir(parents=True, exist_ok=True)
        builder(mirrored).save(output, "WEBP", quality=88, method=6)
        print(f"[illustration] {output.relative_to(ROOT)}")


if __name__ == "__main__":
    save_pair("technique-ji-path", technique_diagram)
    save_pair("section-1-group-1-sequence", group_sequence)
