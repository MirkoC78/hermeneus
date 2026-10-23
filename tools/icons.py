# Genera le icone di Hermeneus: quadrato viola, meandro lilla, lettera Ἑ bianca in GFS Didot.
import sys, os
from PIL import Image, ImageDraw, ImageFont
font_path, out = sys.argv[1], sys.argv[2]
GLAZE, CLAY, IVORY = (124, 92, 255), (214, 204, 255), (255, 255, 255)
def icon(size, maskable=False):
    S = 4 * size  # supercampionamento per bordi morbidi
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if maskable:
        d.rectangle([0, 0, S, S], fill=GLAZE)
        pad = int(S * 0.18)
    else:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=GLAZE)
        pad = int(S * 0.08)
    inner = S - 2 * pad
    # meandro in basso
    u = inner / 16.0
    y0 = pad + inner * 0.80
    w = max(2, int(u * 0.55))
    pts = []
    n = int((inner - 2 * u) // (4 * u))
    x = pad + (inner - n * 4 * u) / 2
    while len(pts) < 7 * n:
        pts += [(x, y0 + u), (x, y0 - 1.6 * u), (x + 2.2 * u, y0 - 1.6 * u), (x + 2.2 * u, y0 - 0.4 * u), (x + 1.1 * u, y0 - 0.4 * u)]
        pts += [(x + 1.1 * u, y0 + u), (x + 4 * u, y0 + u)]
        x += 4 * u
    d.line(pts, fill=CLAY, width=w, joint='curve')
    # lettera
    f = ImageFont.truetype(font_path, int(inner * 0.70))
    txt = 'Ἑ'
    bb = d.textbbox((0, 0), txt, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text((S / 2 - tw / 2 - bb[0], pad + inner * 0.40 - th / 2 - bb[1]), txt, font=f, fill=IVORY)
    return im.resize((size, size), Image.LANCZOS)
os.makedirs(out, exist_ok=True)
for name, size, m in [('icon-192.png', 192, False), ('icon-512.png', 512, False), ('icon-maskable-512.png', 512, True), ('apple-touch-icon.png', 180, True), ('favicon-32.png', 32, False)]:
    icon(size, m).save(os.path.join(out, name), optimize=True)
print('ok')
