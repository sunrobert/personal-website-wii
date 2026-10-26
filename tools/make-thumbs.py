#!/usr/bin/env python3
"""Regenerate Photography cover thumbnails into assets/photography/_thumbs/.

Run after changing an album's `thumb` (or first image) in photography.html:
    python3 tools/make-thumbs.py
"""
import re
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "photography.html").read_text()
out = ROOT / "assets/photography/_thumbs"
out.mkdir(exist_ok=True)

for slug, thumb, first in re.findall(r'slug: "([^"]+)".*?thumb: "([^"]*)", images: \[\s*"([^"]+)"', html, re.S):
    src = ROOT / "assets/photography" / slug / (thumb or first)
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((720, 720), Image.LANCZOS)
    dst = out / f"{slug}.jpg"
    im.save(dst, quality=82, optimize=True, progressive=True)
    print(f"{slug:32s} {src.stat().st_size // 1024:5d} KB -> {dst.stat().st_size // 1024:3d} KB")
