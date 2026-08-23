"""Final precision crop for Cosmote TV + Cosmote Cinema + Disney artifact."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

RAW = Path("public/images/brands/raw")
OUT = Path("public/images/brands")
CW, CH, PAD = 480, 180, 22


def rgba(im):
    return im.convert("RGBA")


def lum(a):
    return (
        0.2126 * a[..., 0].astype(np.float32)
        + 0.7152 * a[..., 1].astype(np.float32)
        + 0.0722 * a[..., 2].astype(np.float32)
    )


def fit(logo: Image.Image) -> Image.Image:
    logo = rgba(logo)
    arr = np.array(logo)
    ys, xs = np.where(arr[..., 3] > 10)
    if len(xs):
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        logo = logo.crop(
            (
                max(0, x0 - 2),
                max(0, y0 - 2),
                min(logo.width, x1 + 2),
                min(logo.height, y1 + 2),
            )
        )
    canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    max_w, max_h = CW - PAD * 2, CH - PAD * 2
    lw, lh = logo.size
    s = min(max_w / lw, max_h / lh)
    nw, nh = max(1, int(round(lw * s))), max(1, int(round(lh * s)))
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((CW - nw) // 2, (CH - nh) // 2))
    return canvas


def cosmote_tv():
    im = rgba(Image.open(RAW / "cosmote.png"))
    a = np.array(im)
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    L = lum(a)
    # Logo greens / blues (icon + gradient text)
    greenish = (g > 95) & (g >= r - 10) & (g > b - 30) & (L > 40)
    blueish = (b > 90) & (b > r + 10) & (L > 35)
    # White / silver "TV"
    white = (L > 165) & (np.abs(r - g) < 25) & (np.abs(g - b) < 25)
    keep = greenish | blueish | white
    # morphological close-ish: expand keep by 1px
    keep2 = keep.copy()
    keep2[1:, :] |= keep[:-1, :]
    keep2[:-1, :] |= keep[1:, :]
    keep2[:, 1:] |= keep[:, :-1]
    keep2[:, :-1] |= keep[:, 1:]
    alpha = np.where(keep2, 255, 0).astype(np.uint8)
    a[..., 3] = alpha
    out = Image.fromarray(a, "RGBA")
    fit(out).save(OUT / "cosmote.png", optimize=True)
    ys, xs = np.where(alpha > 0)
    print("cosmote_tv content bbox", xs.min(), ys.min(), xs.max(), ys.max())


def cosmote_cinema():
    im = rgba(Image.open(RAW / "cosmote-cinema-raw.png"))
    w, h = im.size
    # Fixed proportional crop tuned for this specific asset (1013x436)
    # Badge is centered; leave small margin inside rounded corners.
    # Measured visually: icon top ~ y=95-100, badge bottom glow ~ y=310-320, posters below.
    # Using fractions of known size:
    x0 = int(w * 0.078)
    x1 = int(w * 0.922)
    y0 = int(h * 0.205)  # include full icon top
    y1 = int(h * 0.735)  # cut before poster strip under glow

    cropped = im.crop((x0, y0, x1, y1))
    arr = np.array(cropped)

    # Clean left/right poster slivers: keep rows/cols dominated by dark badge OR logo colors
    L = lum(arr)
    r, g, b = arr[..., 0].astype(np.int16), arr[..., 1].astype(np.int16), arr[..., 2].astype(np.int16)
    logoish = ((g > 90) & (b > 50)) | ((b > 100) & (g > 40)) | (L > 170)
    dark = L < 70
    good = logoish | dark

    # Trim columns where good ratio is low (poster bleed)
    col_ok = good.mean(axis=0) > 0.55
    xs = np.where(col_ok)[0]
    # Trim rows similarly but be careful with glow line
    row_ok = good.mean(axis=1) > 0.45
    ys = np.where(row_ok)[0]
    if len(xs) and len(ys):
        cropped = cropped.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

    # Soft round-rect mask optional: not required if crop is clean
    fit(cropped).save(OUT / "cosmote-cinema.png", optimize=True)
    print("cosmote_cinema crop", (x0, y0, x1, y1), "final", cropped.size)


def disney():
    im = rgba(Image.open(RAW / "disney.png"))
    a = np.array(im)
    L = lum(a)
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    # White mark
    white = L > 140
    # Cyan/blue arc
    arc = (b > 70) & (g > 40) & (b + g > r + 40) & (L > 30)
    # Kill corner glow rectangle (dim blue-ish blob)
    glow = (b > g) & (L < 80) & (L > 5) & ~arc & ~white
    alpha = np.zeros(L.shape, dtype=np.uint8)
    alpha[white | arc] = 255
    alpha[glow] = 0
    alpha[L < 8] = 0
    a[..., 3] = alpha
    fit(Image.fromarray(a, "RGBA")).save(OUT / "disney.png", optimize=True)
    print("disney fixed")


if __name__ == "__main__":
    cosmote_tv()
    cosmote_cinema()
    disney()
    for n in ["cosmote.png", "cosmote-cinema.png", "disney.png"]:
        s = Image.open(OUT / n).size
        assert s == (CW, CH)
        print(n, "size OK")
