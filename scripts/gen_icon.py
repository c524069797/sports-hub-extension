"""Generate Sports Hub extension icons."""
from PIL import Image, ImageDraw
import os

SIZES = [16, 32, 48, 64, 128]
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'images')

def draw_icon(size: int) -> Image.Image:
    """Draw a sports hub icon: dark circle with stylized 'SH' and accent color."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle
    pad = max(1, size // 32)
    draw.ellipse([pad, pad, size - pad - 1, size - pad - 1], fill=(15, 20, 25))

    # Accent ring
    ring_w = max(1, size // 16)
    draw.ellipse([pad, pad, size - pad - 1, size - pad - 1], outline=(29, 155, 240), width=ring_w)

    # Inner design: a simple trophy/sports shape
    cx, cy = size // 2, size // 2
    r = size * 0.32

    # Draw a stylized "S" shape using arcs
    # Top arc (orange/accent)
    s = max(1, size // 10)
    # Simple approach: draw colored bars representing different sports
    bar_h = max(2, size // 8)
    bar_w = int(size * 0.5)
    gap = max(1, size // 16)
    start_x = (size - bar_w) // 2
    colors = [(239, 68, 68), (29, 155, 240), (0, 186, 124)]  # red, blue, green

    total_h = len(colors) * bar_h + (len(colors) - 1) * gap
    start_y = (size - total_h) // 2

    for i, color in enumerate(colors):
        y = start_y + i * (bar_h + gap)
        # Rounded bars
        radius = bar_h // 2
        draw.rounded_rectangle(
            [start_x, y, start_x + bar_w, y + bar_h],
            radius=radius,
            fill=color
        )

    return img


os.makedirs(OUT_DIR, exist_ok=True)

# Generate main icon at 128px, then resize for others
icon_128 = draw_icon(128)
for s in SIZES:
    if s == 128:
        icon_128.save(os.path.join(OUT_DIR, f'icon-{s}.png'))
    else:
        resized = icon_128.resize((s, s), Image.LANCZOS)
        resized.save(os.path.join(OUT_DIR, f'icon-{s}.png'))

# Also save as icon.png (128px) for backward compat
icon_128.save(os.path.join(OUT_DIR, 'icon.png'))

print('Icons generated successfully!')
for s in SIZES:
    print(f'  icon-{s}.png')
print('  icon.png')
