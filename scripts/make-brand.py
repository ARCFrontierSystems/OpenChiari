# Makes the web versions of the logo (design/brand/open-chiari-logo.png) into public/brand/:
#   logo.png        see-through, for light backgrounds (page header)
#   logo-dark.png   see-through, light outline and lettering, for the dark 3D Explorer header
#   icon-32.png, icon-180.png, icon-512.png   the head-and-brain mark, for browser tabs and home screens
#   share.png       1200 x 630, the logo on white, the picture shown when a link is shared
# Run: python3 scripts/make-brand.py   (needs Pillow)
import colorsys, os
from PIL import Image

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = Image.open(os.path.join(root, 'design/brand/open-chiari-logo.png')).convert('RGB')
out = os.path.join(root, 'public/brand')
os.makedirs(out, exist_ok=True)

def unwhite(im):
    """White background to transparency, keeping smooth edges (colour = white blended with the true colour)."""
    px = im.load()
    res = Image.new('RGBA', im.size)
    rp = res.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            a = 255 - min(r, g, b)
            if a < 8:
                rp[x, y] = (255, 255, 255, 0)
                continue
            f = 255 / a
            c = [max(0, min(255, round(255 - (255 - v) * f))) for v in (r, g, b)]
            rp[x, y] = (*c, a)
    return res

box = (125 - 12, 139 - 12, 1651 + 12, 765 + 12)
logo = unwhite(src.crop(box))
logo.save(os.path.join(out, 'logo.png'))

# Dark backgrounds: the navy outline and "Open" become the Explorer's light text colour; the deep purple
# ("Chiari", the curve) becomes a lighter purple so it stays readable on dark.
dark = logo.copy()
dp = dark.load()
for y in range(dark.height):
    for x in range(dark.width):
        r, g, b, a = dp[x, y]
        if a == 0:
            continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        hue = h * 360
        if l < 0.16:
            dp[x, y] = (236, 234, 228, a)
        elif 262 < hue <= 300 and l < 0.42:
            rr, gg, bb = colorsys.hls_to_rgb(h, 0.74, 0.55)
            dp[x, y] = (round(rr * 255), round(gg * 255), round(bb * 255), a)
dark.save(os.path.join(out, 'logo-dark.png'))

# Icon: the head-and-brain mark, square, on white so it shows on any tab colour.
head = src.crop((112, 128, 664, 742)).copy()  # the head and brain only, up to the tip of the nose
head.paste((255, 255, 255), (465 - 112, 690 - 128, head.width, head.height))  # leave out the start of the curve
side = max(head.size)
mark = Image.new('RGB', (side, side), (255, 255, 255))
mark.paste(head, ((side - head.width) // 2, (side - head.height) // 2))
for size in (32, 180, 512):
    mark.resize((size, size), Image.LANCZOS).save(os.path.join(out, f'icon-{size}.png'))

share = Image.new('RGB', (1200, 630), (255, 255, 255))
w = 960
scaled = src.crop(box).resize((w, round(w * (box[3] - box[1]) / (box[2] - box[0]))), Image.LANCZOS)
share.paste(scaled, ((1200 - scaled.width) // 2, (630 - scaled.height) // 2))
share.save(os.path.join(out, 'share.png'))
print('wrote', sorted(os.listdir(out)))

# Small copies for the page headers (shown about 48 px tall; made at twice that for sharp screens).
for name, img in (('logo-header.png', logo), ('logo-header-dark.png', dark)):
    h = 112
    small = img.resize((round(img.width * h / img.height), h), Image.LANCZOS)
    small.save(os.path.join(out, name), optimize=True)
print('wrote header copies')
