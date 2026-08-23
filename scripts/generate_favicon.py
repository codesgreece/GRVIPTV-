from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "images" / "logo.png"
APP = ROOT / "app"
PUBLIC = ROOT / "public"


def build_square_logo(size: int) -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    width, height = logo.size

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    scale = min(size / width, size / height) * 0.88
    target = (int(width * scale), int(height * scale))
    resized = logo.resize(target, Image.Resampling.LANCZOS)
    offset = ((size - target[0]) // 2, (size - target[1]) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def save_ico(path: Path, sizes: tuple[int, ...]) -> None:
    images = [build_square_logo(s).convert("RGBA") for s in sizes]
    images[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )


def main() -> None:
    icon512 = build_square_logo(512)
    icon512.save(APP / "icon.png", format="PNG", optimize=True)
    build_square_logo(180).save(APP / "apple-icon.png", format="PNG", optimize=True)
    save_ico(APP / "favicon.ico", (16, 32, 48))
    save_ico(PUBLIC / "favicon.ico", (16, 32, 48))
    print("Generated app/icon.png, app/apple-icon.png, app/favicon.ico, public/favicon.ico")


if __name__ == "__main__":
    main()
