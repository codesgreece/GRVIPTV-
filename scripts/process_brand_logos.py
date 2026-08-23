"""
Carefully crop brand logos and normalize to identical canvas size.
"""
from __future__ import annotations

from pathlib import Path
import numpy as np
from PIL import Image

RAW = Path("public/images/brands/raw")
OUT = Path("public/images/brands")
OUT.mkdir(parents=True, exist_ok=True)

# Uniform carousel canvas — all logos same final size
CANVAS_W = 480
CANVAS_H = 180
PAD = 18  # inner padding inside canvas
CONTENT_PAD = 6  # padding around detected content when cropping


def to_rgba(img: Image.Image) -> Image.Image:
    return img.convert("RGBA")


def luminance(arr: np.ndarray) -> np.ndarray:
    r, g, b = arr[..., 0].astype(np.float32), arr[..., 1].astype(np.float32), arr[..., 2].astype(np.float32)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def content_bbox_dark_bg(arr: np.ndarray, thr: float = 18.0) -> tuple[int, int, int, int]:
    """Bounding box of non-near-black pixels."""
    lum = luminance(arr)
    # also treat nearly transparent as empty if alpha exists
    if arr.shape[2] == 4:
        mask = (lum > thr) & (arr[..., 3] > 8)
    else:
        mask = lum > thr
    ys, xs = np.where(mask)
    if len(xs) == 0:
        h, w = arr.shape[:2]
        return 0, 0, w, h
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def content_bbox_light_bg(arr: np.ndarray, thr: float = 245.0) -> tuple[int, int, int, int]:
    """Bounding box of non-near-white pixels."""
    lum = luminance(arr)
    if arr.shape[2] == 4:
        mask = (lum < thr) & (arr[..., 3] > 8)
    else:
        mask = lum < thr
    ys, xs = np.where(mask)
    if len(xs) == 0:
        h, w = arr.shape[:2]
        return 0, 0, w, h
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def expand_bbox(x0, y0, x1, y1, w, h, pad: int) -> tuple[int, int, int, int]:
    return max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)


def crop_box(img: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return img.crop(box)


def make_transparent_from_black(img: Image.Image, thr: float = 16.0) -> Image.Image:
    """Turn near-black background into transparent."""
    arr = np.array(to_rgba(img))
    lum = luminance(arr)
    alpha = arr[..., 3].astype(np.float32)
    # soft edge: fully transparent if very dark, keep logo pixels
    new_a = np.where(lum <= thr, 0, alpha)
    # slight soft feather for thr..thr+8
    mid = (lum > thr) & (lum < thr + 10)
    new_a = np.where(mid, np.clip((lum - thr) / 10.0 * alpha, 0, 255), new_a)
    arr[..., 3] = new_a.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def make_transparent_from_white(img: Image.Image, thr: float = 248.0) -> Image.Image:
    arr = np.array(to_rgba(img))
    lum = luminance(arr)
    alpha = arr[..., 3].astype(np.float32)
    new_a = np.where(lum >= thr, 0, alpha)
    mid = (lum < thr) & (lum > thr - 10)
    new_a = np.where(mid, np.clip((thr - lum) / 10.0 * alpha, 0, 255), new_a)
    arr[..., 3] = new_a.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def recolor_black_to_white(img: Image.Image, thr: float = 60.0) -> Image.Image:
    """For logos with black text meant for white bg — make text white for dark site."""
    arr = np.array(to_rgba(img))
    lum = luminance(arr)
    # only recolor dark, opaque-ish pixels that are near-neutral (not red)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    chroma = np.maximum(np.maximum(r, g), b).astype(np.int16) - np.minimum(np.minimum(r, g), b).astype(np.int16)
    dark_neutral = (lum < thr) & (a > 20) & (chroma < 40)
    arr[dark_neutral, 0] = 255
    arr[dark_neutral, 1] = 255
    arr[dark_neutral, 2] = 255
    return Image.fromarray(arr, "RGBA")


def alpha_bbox(img: Image.Image, thr: int = 10) -> tuple[int, int, int, int] | None:
    arr = np.array(to_rgba(img))
    ys, xs = np.where(arr[..., 3] > thr)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def trim_transparent(img: Image.Image, pad: int = 2) -> Image.Image:
    box = alpha_bbox(img)
    if box is None:
        return img
    x0, y0, x1, y1 = expand_bbox(*box, img.width, img.height, pad)
    return img.crop((x0, y0, x1, y1))


def fit_on_canvas(logo: Image.Image) -> Image.Image:
    """Scale logo to fit identical canvas with consistent padding."""
    logo = trim_transparent(to_rgba(logo), pad=1)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    max_w = CANVAS_W - PAD * 2
    max_h = CANVAS_H - PAD * 2
    lw, lh = logo.size
    scale = min(max_w / lw, max_h / lh)
    nw = max(1, int(round(lw * scale)))
    nh = max(1, int(round(lh * scale)))
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (CANVAS_W - nw) // 2
    y = (CANVAS_H - nh) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def process_dark_bg(path: Path, out_name: str, thr: float = 18.0) -> None:
    img = to_rgba(Image.open(path))
    arr = np.array(img)
    x0, y0, x1, y1 = content_bbox_dark_bg(arr, thr=thr)
    x0, y0, x1, y1 = expand_bbox(x0, y0, x1, y1, img.width, img.height, CONTENT_PAD)
    cropped = crop_box(img, (x0, y0, x1, y1))
    transparent = make_transparent_from_black(cropped, thr=thr)
    final = fit_on_canvas(transparent)
    final.save(OUT / out_name, optimize=True)
    print(f"OK {out_name}: crop=({x0},{y0},{x1},{y1}) -> {final.size}")


def process_light_bg(path: Path, out_name: str, whiten_text: bool = True) -> None:
    img = to_rgba(Image.open(path))
    arr = np.array(img)
    x0, y0, x1, y1 = content_bbox_light_bg(arr, thr=245)
    x0, y0, x1, y1 = expand_bbox(x0, y0, x1, y1, img.width, img.height, CONTENT_PAD)
    cropped = crop_box(img, (x0, y0, x1, y1))
    transparent = make_transparent_from_white(cropped, thr=248)
    if whiten_text:
        transparent = recolor_black_to_white(transparent, thr=70)
    final = fit_on_canvas(transparent)
    final.save(OUT / out_name, optimize=True)
    print(f"OK {out_name}: crop=({x0},{y0},{x1},{y1}) -> {final.size}")


def process_cosmote_cinema(path: Path, out_name: str = "cosmote-cinema.png") -> None:
    """
    Extract the central dark rounded badge (logo) from the poster collage.
    Strategy: find the large dark contiguous region near the image center.
    """
    img = to_rgba(Image.open(path))
    arr = np.array(img)
    h, w = arr.shape[:2]
    lum = luminance(arr)

    # Dark pixels that form the badge (not pure black edges only)
    dark = lum < 55

    # Prefer center band: ignore outer 8% margins which are mostly posters
    mx, my = int(w * 0.06), int(h * 0.08)
    center_mask = np.zeros_like(dark, dtype=bool)
    center_mask[my : h - my, mx : w - mx] = True
    mask = dark & center_mask

    # Row/col projection to find badge extents (dense dark area)
    col_density = mask.mean(axis=0)
    row_density = mask.mean(axis=1)

    # Threshold densities for solid badge body
    col_hits = np.where(col_density > 0.35)[0]
    row_hits = np.where(row_density > 0.25)[0]

    if len(col_hits) == 0 or len(row_hits) == 0:
        # fallback: tighter center crop by finding darkest horizontal band
        # scan for rows with high dark ratio in middle
        mid_cols = slice(int(w * 0.12), int(w * 0.88))
        row_score = (lum[:, mid_cols] < 50).mean(axis=1)
        row_hits = np.where(row_score > 0.45)[0]
        col_score = (lum[int(h * 0.2) : int(h * 0.8), :] < 50).mean(axis=0)
        col_hits = np.where(col_score > 0.35)[0]

    x0, x1 = int(col_hits.min()), int(col_hits.max()) + 1
    y0, y1 = int(row_hits.min()), int(row_hits.max()) + 1

    # Expand slightly to include the bottom gradient line fully
    x0, y0, x1, y1 = expand_bbox(x0, y0, x1, y1, w, h, 4)

    # Ensure we don't include too much poster: clamp to reasonable badge aspect
    cropped = crop_box(img, (x0, y0, x1, y1))

    # Refine: within cropped region, trim remaining bright poster bleed
    carr = np.array(cropped)
    # Keep pixels that are either dark OR colorful logo greens/blues/whites near logo
    clum = luminance(carr)
    r, g, b = carr[..., 0], carr[..., 1], carr[..., 2]
    colorful = ((g > 80) & (b > 60)) | ((b > 100) & (g > 40)) | (clum > 180)
    keep = (clum < 70) | colorful
    # bbox of keep
    ys, xs = np.where(keep)
    if len(xs):
        rx0, ry0, rx1, ry1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
        rx0, ry0, rx1, ry1 = expand_bbox(rx0, ry0, rx1, ry1, cropped.width, cropped.height, 2)
        cropped = crop_box(cropped, (rx0, ry0, rx1, ry1))

    # Do NOT punch transparency on the badge dark fill — keep badge intact
    final = fit_on_canvas(to_rgba(cropped))
    final.save(OUT / out_name, optimize=True)
    print(f"OK {out_name}: crop=({x0},{y0},{x1},{y1}) size={cropped.size} -> {final.size}")


def process_gray_bg(path: Path, out_name: str, thr: float = 70.0) -> None:
    """Dark charcoal gray background (nova premier) — treat similar to black but higher thr."""
    img = to_rgba(Image.open(path))
    arr = np.array(img)
    # content = not near background gray
    lum = luminance(arr)
    # background ~ charcoal; content is white/red
    # use deviation from median edge color
    bg = np.median(lum[0:5, :])
    mask = np.abs(lum - bg) > 25
    if arr.shape[2] == 4:
        mask &= arr[..., 3] > 8
    ys, xs = np.where(mask)
    if len(xs) == 0:
        process_dark_bg(path, out_name, thr=thr)
        return
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    x0, y0, x1, y1 = expand_bbox(x0, y0, x1, y1, img.width, img.height, CONTENT_PAD)
    cropped = crop_box(img, (x0, y0, x1, y1))

    # make bg transparent: pixels close to original bg luminance and low chroma
    carr = np.array(to_rgba(cropped))
    clum = luminance(carr)
    r, g, b, a = carr[..., 0], carr[..., 1], carr[..., 2], carr[..., 3]
    chroma = np.maximum(np.maximum(r, g), b).astype(np.int16) - np.minimum(np.minimum(r, g), b).astype(np.int16)
    is_bg = (np.abs(clum - bg) < 28) & (chroma < 35)
    carr[is_bg, 3] = 0
    transparent = Image.fromarray(carr, "RGBA")
    final = fit_on_canvas(transparent)
    final.save(OUT / out_name, optimize=True)
    print(f"OK {out_name}: crop=({x0},{y0},{x1},{y1}) -> {final.size}")


def main() -> None:
    # Dark / black backgrounds
    process_dark_bg(RAW / "cosmote.png", "cosmote.png", thr=22)
    process_dark_bg(RAW / "cosmote-sport.png", "cosmote-sport.png", thr=22)
    process_dark_bg(RAW / "nova.png", "nova.png", thr=18)
    process_dark_bg(RAW / "nova-cinema.png", "nova-cinema.png", thr=18)
    process_dark_bg(RAW / "netflix.png", "netflix.png", thr=20)
    process_dark_bg(RAW / "hbo.png", "hbo.png", thr=18)
    process_dark_bg(RAW / "disney.png", "disney.png", thr=12)
    process_dark_bg(RAW / "euroleague.png", "euroleague.png", thr=18)
    process_dark_bg(RAW / "adults.png", "adults.png", thr=18)

    # Charcoal gray bg
    process_gray_bg(RAW / "nova-premier.png", "nova-premier.png")

    # White background
    process_light_bg(RAW / "nova-sports.png", "nova-sports.png", whiten_text=True)

    # Special collage crop
    process_cosmote_cinema(RAW / "cosmote-cinema-raw.png", "cosmote-cinema.png")

    # Verify all outputs same size
    outs = sorted(OUT.glob("*.png"))
    sizes = {p.name: Image.open(p).size for p in outs if p.name != "README.md"}
    # filter only our logos
    logo_names = [
        "cosmote.png",
        "cosmote-sport.png",
        "cosmote-cinema.png",
        "nova.png",
        "nova-sports.png",
        "nova-premier.png",
        "nova-cinema.png",
        "euroleague.png",
        "netflix.png",
        "hbo.png",
        "disney.png",
        "adults.png",
    ]
    print("\n=== SIZE CHECK ===")
    for name in logo_names:
        p = OUT / name
        assert p.exists(), f"MISSING {name}"
        size = Image.open(p).size
        assert size == (CANVAS_W, CANVAS_H), f"{name} size {size} != {(CANVAS_W, CANVAS_H)}"
        print(f"{name}: {size} OK")
    print("ALL LOGOS IDENTICAL SIZE")


if __name__ == "__main__":
    main()
