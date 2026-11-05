"""Makes the lettering for the 3D-printable plaques (model/simple/reference/print-label.json).

Two lines of raised text on a strip along each plaque's bottom edge, so the printed object carries the required
caption (CLAUDE.md rule 1) and the site's address:
    Illustration, not a medical image
    openchiari.org

The output is a grid of 0/1 values, 4 per mm, that model/simple/build.mjs --print reads.
Run: python3 model/simple/print-label.py  (needs Pillow and the DejaVu Sans Bold font)
"""
import base64
import json
import os

from PIL import Image, ImageDraw, ImageFont

PX_PER_MM = 4
WIDTH_MM, HEIGHT_MM = 146, 16  # fits inside the 152 mm wide strip, with a margin
LINES = [('Illustration, not a medical image', 5.0), ('openchiari.org', 4.2)]  # text, cap height in mm
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

w, h = WIDTH_MM * PX_PER_MM, HEIGHT_MM * PX_PER_MM
img = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(img)
y = 1.2 * PX_PER_MM
for text, cap_mm in LINES:
    # DejaVu's capitals are about 0.73 of the font size.
    font = ImageFont.truetype(FONT, int(cap_mm / 0.73 * PX_PER_MM))
    box = draw.textbbox((0, 0), text, font=font)
    draw.text(((w - (box[2] - box[0])) / 2 - box[0], y - box[1]), text, fill=255, font=font)
    y += (box[3] - box[1]) + 2.2 * PX_PER_MM

bits = bytes(1 if v > 127 else 0 for v in img.getdata())
out = os.path.join(os.path.dirname(__file__), 'reference', 'print-label.json')
with open(out, 'w') as f:
    json.dump({'width': w, 'height': h, 'pxPerMm': PX_PER_MM, 'lines': [t for t, _ in LINES], 'bits': base64.b64encode(bits).decode()}, f)
print('wrote', out, w, 'x', h)
