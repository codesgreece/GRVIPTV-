"""Precision fixes for logos that need special handling."""
from pathlib import Path
import numpy as np
from PIL import Image

RAW = Path("public/images/brands/raw")
OUT = Path("public/images/brands")
CANVAS_W, CANVAS_H, PAD = 480, 180, 20


def rgba(img):
    return img.convert("RGBA")


def lum(arr):
    r, g, b = arr[..., 0].astype(np.float32), arr[..., 1].astype(np.float32), arr[..., 2].astype(np.float32)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def chroma(arr):
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    return np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)


def alpha_bbox(img, thr=8):
    a = np.array(rgba(img))[..., 3]
    ys, xs = np.where(a > thr)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def fit(logo: Image.Image) -> Image.Image:
    logo = rgba(logo)
    box = alpha_bbox(logo)
    if box:
        x0, y0, x1, y1 = box
        logo = logo.crop((max(0, x0 - 1), max(0, y0 - 1), min(logo.width, x1 + 1), min(logo.height, y1 + 1)))
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    max_w, max_h = CANVAS_W - PAD * 2, CANVAS_H - PAD * 2
    lw, lh = logo.size
    scale = min(max_w / lw, max_h / lh)
    nw, nh = max(1, int(round(lw * scale))), max(1, int(round(lh * scale)))
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((CANVAS_W - nw) // 2, (CANVAS_H - nh) // 2))
    return canvas


def fix_cosmote_tv():
    """Remove navy plate; keep green/blue icon + gradient text + white TV."""
    img = rgba(Image.open(RAW / "cosmote.png"))
    arr = np.array(img)
    L = lum(arr)
    C = chroma(arr)
    # Keep colorful logo OR bright white/silver text
    keep = ((C > 25) & (L > 35)) | ((L > 150) & (C < 40))
    # Soft alpha
    a = np.zeros(L.shape, dtype=np.uint8)
    a[keep] = 255
    arr[..., 3] = a
    out = Image.fromarray(arr, "RGBA")
    box = alpha_bbox(out)
    assert box, "cosmote empty"
    x0, y0, x1, y1 = box
    # pad
    x0, y0 = max(0, x0 - 4), max(0, y0 - 4)
    x1, y1 = min(img.width, x1 + 4), min(img.height, y1 + 4)
    cropped = out.crop((x0, y0, x1, y1))
    fit(cropped).save(OUT / "cosmote.png", optimize=True)
    print("fixed cosmote.png", cropped.size)


def fix_cosmote_cinema():
    """Manual precise crop of the badge from collage based on measured proportions."""
    img = rgba(Image.open(RAW / "cosmote-cinema-raw.png"))
    w, h = img.size
    # Empirically: badge spans ~8%-92% width and ~22%-78% height on this asset,
    # but previous auto crop cut the icon top — expand upward and stop before posters.
    # Analyze horizontal band with highest "logo-like" score.
    arr = np.array(img)
    L = lum(arr)
    # Badge interior is dark navy/charcoal with white text and colorful icon
    # Scan for continuous dark band in vertical center
    mid = L[:, int(w * 0.15) : int(w * 0.85)]
    dark_ratio = (mid < 60).mean(axis=1)

    # Find longest run of dark rows
    is_dark = dark_ratio > 0.55
    best = (0, 0)
    start = None
    for i, v in enumerate(is_dark):
        if v and start is None:
            start = i
        if (not v or i == len(is_dark) - 1) and start is not None:
            end = i if not v else i + 1
            if end - start > best[1] - best[0]:
                best = (start, end)
            start = None
    y0, y1 = best
    # Expand up a bit for icon top (icon protrudes slightly into lighter area sometimes)
    y0 = max(0, y0 - 8)
    # Trim bottom: find glow line near bottom of band then cut just after it
    band = L[y0:y1, :]
    # glow line is bright cyan/green thin row near bottom of badge
    row_max = band.max(axis=1)
    # from bottom of band upward, find first bright-ish row after dark body
    glow_idx = None
    for i in range(len(row_max) - 2, int(len(row_max) * 0.5), -1):
        if row_max[i] > 120 and band[i].mean() < 90:
            glow_idx = i
            break
    if glow_idx is not None:
        y1 = y0 + glow_idx + 3
    else:
        y1 = min(h, y1 - 2)

    # Horizontal: find dark columns in this y range
    zone = L[y0:y1, :]
    col_dark = (zone < 65).mean(axis=0)
    xs = np.where(col_dark > 0.4)[0]
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    x0 = max(0, x0 - 2)
    x1 = min(w, x1 + 2)

    cropped = img.crop((x0, y0, x1, y1))
    # Verify icon isn't clipped: if top rows are mostly non-dark (poster), we may have
    # expanded into poster — check top 6 rows
    carr = np.array(cropped)
    top = lum(carr)[:6, :]
    if (top > 90).mean() > 0.35:
        # trim poster bleed from top
        for i in range(carr.shape[0]):
            if (lum(carr)[i] < 70).mean() > 0.55:
                cropped = cropped.crop((0, i, cropped.width, cropped.height))
                break

    # Trim bottom poster bleed if any bright colorful strip remains under glow
    carr = np.array(cropped)
    for i in range(carr.shape[0] - 1, int(carr.shape[0] * 0.7), -1):
        row = carr[i]
        # poster rows are colorful and mid-bright
        if chroma(row[None, ...])[0].mean() > 40 and lum(row[None, ...])[0].mean() > 50:
            continue
        else:
            cropped = cropped.crop((0, 0, cropped.width, i + 1))
            break

    fit(cropped).save(OUT / "cosmote-cinema.png", optimize=True)
    print("fixed cosmote-cinema.png", (x0, y0, x1, y1), cropped.size)


def fix_disney():
    """Remove faint navy glow artifact."""
    img = rgba(Image.open(RAW / "disney.png"))
    arr = np.array(img)
    L = lum(arr)
    C = chroma(arr)
    # Keep white logo, cyan/blue arc; drop very dark navy glow patches
    keep = (L > 25) | ((C > 30) & (L > 18))
    # specifically kill dim blue glow: blue-ish, low luminance
    b, g = arr[..., 2].astype(np.int16), arr[..., 1].astype(np.int16)
    dim_blue_glow = (b > g + 15) & (L < 55) & (L > 8) & (C < 55)
    a = np.where(keep & ~dim_blue_glow, 255, 0).astype(np.uint8)
    # also kill near-black
    a[L < 10] = 0
    arr[..., 3] = a
    out = Image.fromarray(arr, "RGBA")
    fit(out).save(OUT / "disney.png", optimize=True)
    print("fixed disney.png")


def fix_cosmote_without_scipy():
    fix_cosmote_tv()


if __name__ == "__main__":
    fix_cosmote_without_scipy()
    fix_cosmote_cinema()
    fix_disney()
    # size assert
    for name in ["cosmote.png", "cosmote-cinema.png", "disney.png"]:
        s = Image.open(OUT / name).size
        assert s == (480, 180), s
        print(name, s, "OK")
