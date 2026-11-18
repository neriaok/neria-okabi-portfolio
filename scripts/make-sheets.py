#!/usr/bin/env python3
"""Pack a folder of frames (0001.webp ...) into sprite sheets (sheet-01.webp ...).

Usage: python3 scripts/make-sheets.py public/frames/<id> [per_sheet=10] [cols=2]
A scroll sequence of 150 frames becomes 15 files instead of 150, which keeps the
number of hosted files small and lets the browser fetch fewer, larger images.
"""
import sys
from pathlib import Path
from PIL import Image

folder = Path(sys.argv[1])
per = int(sys.argv[2]) if len(sys.argv) > 2 else 10
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
rows = -(-per // cols)
frames = sorted(folder.glob('[0-9][0-9][0-9][0-9].*'))
if not frames:
    sys.exit(f'no frames in {folder}')
w, h = Image.open(frames[0]).size
for old in folder.glob('sheet-*.webp'):
    old.unlink()
for s in range(0, len(frames), per):
    sheet = Image.new('RGB', (w * cols, h * rows))
    for k, f in enumerate(frames[s:s + per]):
        sheet.paste(Image.open(f).convert('RGB'), ((k % cols) * w, (k // cols) * h))
    sheet.save(folder / f'sheet-{s // per + 1:02d}.webp', quality=74, method=5)
for f in frames:
    f.unlink()
print(f"{folder}: {len(frames)} frames -> {-(-len(frames) // per)} sheets ({w}x{h}, {per}/sheet, {cols} cols)")
print(f"  count: {len(frames)}, perSheet: {per}, cols: {cols}")
