"""Side quest icons (sketches/img/side-*.webp) at a size that stays sharp on a big screen.

A card shows its icon up to 240 CSS px, so 720 device px on a 3x screen; every icon is 768 px.
Photos and drawings come from the projects' own repositories at 1024 px; pixel icons are rebuilt
from their cell grid and enlarged by whole cells, so their edges stay hard.

Sources, cloned side by side into one folder (the main site is cybertatar/Portfolio):
  DOBROANDPOZITIV, sunnyshamanlang, telegramspeedreader, uxuieducationminiapp, Portfolio
Run from the repo root:
  python3 tools/side-icons.py ../path/to/that/folder
"""
import sys
from pathlib import Path

from PIL import Image

SIZE = 768
OUT = Path('sketches/img')


def save(img, name):
    img.save(OUT / f'side-{name}.webp', quality=88, method=6)


def cut_icon(path, box):
    """A macOS icon without its transparent margin and shadow: just the squircle's square."""
    return Image.open(path).convert('RGBA').crop(box).resize((SIZE, SIZE), Image.LANCZOS)


def read_grid(img, x0, y0, cell, cols, rows, fallback):
    """Colours at the centres of a pixel picture's cells; a see-through cell takes the fallback."""
    img = img.convert('RGBA')
    grid = []
    for j in range(rows):
        row = []
        for i in range(cols):
            r, g, b, a = img.getpixel((x0 + cell * i + cell // 2, y0 + cell * j + cell // 2))
            row.append((r, g, b) if a > 128 else fallback)
        grid.append(row)
    return grid


def draw_grid(grid, cell, x0, y0, background):
    img = Image.new('RGB', (SIZE, SIZE), background)
    for j, row in enumerate(grid):
        for i, colour in enumerate(row):
            img.paste(colour, (x0 + cell * i, y0 + cell * j, x0 + cell * (i + 1), y0 + cell * (j + 1)))
    return img


def whole_grid(path, cells, fallback):
    """A pixel icon whose cells fill the picture edge to edge."""
    img = Image.open(path)
    grid = read_grid(img, 0, 0, img.width // cells, cells, cells, fallback)
    return draw_grid(grid, SIZE // cells, 0, 0, fallback)


def kegl(path):
    """The cat from the bot's avatar: 26 by 23 cells of 18 px, set a bit below the middle."""
    yellow = (255, 209, 102)
    grid = read_grid(Image.open(path), 86, 140, 18, 26, 23, yellow)
    cell = 22
    x0 = (SIZE - 26 * cell) // 2
    y0 = round(SIZE * 347 / 640 - 23 * cell / 2)
    return draw_grid(grid, cell, x0, y0, yellow)


def main(src):
    src = Path(src)
    save(cut_icon(src / 'DOBROANDPOZITIV/Resources/AppIcon.png', (100, 100, 924, 924)), 'dobro')
    save(cut_icon(src / 'sunnyshamanlang/docs/icon.png', (100, 100, 925, 925)), 'shaman')
    vermis = Image.open(src / 'telegramspeedreader/docs/brand/avatar.png')
    save(vermis.resize((SIZE, SIZE), Image.LANCZOS), 'vermis')
    save(kegl(src / 'uxuieducationminiapp/brand/avatar-yellow.png'), 'kegl')
    save(whole_grid(src / 'Portfolio/public/assets/side/ytm.webp', 16, (33, 33, 33)), 'ytm')
    # The Figma plugin is a placeholder drawn here: 12 by 12 cells in a 96 px file
    save(whole_grid(OUT / 'side-figma.webp', 12, (124, 92, 214)), 'figma')


if __name__ == '__main__':
    main(sys.argv[1])
