from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

POSTERS = [
    ("poster-01-thriller", "#120808", "#4a1010", "#D4A72C", "thriller"),
    ("poster-02-action", "#0a0a12", "#1a2848", "#F2C75C", "action"),
    ("poster-03-fantasy", "#0d0818", "#2a1450", "#9b59b6", "fantasy"),
    ("poster-04-scifi", "#050810", "#0c2038", "#3B82F6", "scifi"),
    ("poster-05-sports", "#081008", "#143820", "#4ade80", "sports"),
    ("poster-06-drama", "#100c08", "#382818", "#FFD978", "drama"),
    ("poster-07-horror", "#080808", "#181010", "#8b0000", "horror"),
    ("poster-08-crime", "#0a0c10", "#1c2430", "#64748b", "crime"),
    ("poster-09-adventure", "#0c1008", "#283818", "#ca8a04", "adventure"),
    ("poster-10-series", "#100818", "#301840", "#e879f9", "series"),
    ("poster-11-football", "#081210", "#1a3820", "#22c55e", "football"),
    ("poster-12-landscape", "#080c14", "#142038", "#60a5fa", "landscape"),
]


def figure(genre: str, accent: str) -> str:
    if genre == "thriller":
        return f"""
      <ellipse cx="100" cy="95" rx="38" ry="48" fill="#000" opacity="0.7"/>
      <path d="M70 200 L130 200 L115 260 L85 260 Z" fill="#111" opacity="0.8"/>
      <circle cx="88" cy="82" r="4" fill="{accent}" opacity="0.9"/>
      <circle cx="112" cy="82" r="4" fill="{accent}" opacity="0.9"/>"""
    if genre == "action":
        return f"""
      <polygon points="100,60 140,120 100,100 60,120" fill="{accent}" opacity="0.35"/>
      <rect x="55" y="140" width="90" height="8" rx="2" fill="{accent}" opacity="0.5" transform="rotate(-15 100 144)"/>
      <rect x="60" y="170" width="80" height="6" rx="2" fill="#fff" opacity="0.15" transform="rotate(10 100 173)"/>"""
    if genre == "fantasy":
        return f"""
      <polygon points="100,50 115,90 155,95 120,120 130,160 100,135 70,160 80,120 45,95 85,90" fill="{accent}" opacity="0.25"/>
      <circle cx="100" cy="200" r="30" fill="{accent}" opacity="0.12"/>"""
    if genre == "scifi":
        return f"""
      <circle cx="100" cy="110" r="45" fill="none" stroke="{accent}" stroke-width="2" opacity="0.4"/>
      <circle cx="100" cy="110" r="28" fill="{accent}" opacity="0.15"/>
      <line x1="40" y1="180" x2="160" y2="180" stroke="{accent}" stroke-width="1" opacity="0.3"/>"""
    if genre == "sports":
        return f"""
      <ellipse cx="100" cy="220" rx="70" ry="18" fill="#000" opacity="0.4"/>
      <circle cx="100" cy="130" r="35" fill="{accent}" opacity="0.2"/>
      <path d="M100 95 L100 165" stroke="#fff" stroke-width="3" opacity="0.3"/>"""
    if genre == "drama":
        return f"""
      <rect x="60" y="80" width="80" height="100" rx="4" fill="#000" opacity="0.35"/>
      <line x1="70" y1="240" x2="130" y2="240" stroke="{accent}" stroke-width="2" opacity="0.4"/>"""
    if genre == "horror":
        return f"""
      <path d="M100 70 Q130 120 100 180 Q70 120 100 70" fill="#000" opacity="0.5"/>
      <circle cx="100" cy="110" r="8" fill="{accent}" opacity="0.6"/>"""
    if genre == "crime":
        return f"""
      <rect x="70" y="100" width="60" height="80" fill="#000" opacity="0.45" transform="rotate(8 100 140)"/>
      <line x1="50" y1="220" x2="150" y2="200" stroke="{accent}" stroke-width="1.5" opacity="0.35"/>"""
    if genre == "adventure":
        return f"""
      <polygon points="100,55 145,200 55,200" fill="{accent}" opacity="0.18"/>
      <path d="M75 200 L125 200 L100 240 Z" fill="#000" opacity="0.4"/>"""
    if genre == "series":
        return f"""
      <rect x="55" y="90" width="35" height="50" rx="2" fill="{accent}" opacity="0.2"/>
      <rect x="95" y="75" width="35" height="65" rx="2" fill="{accent}" opacity="0.3"/>
      <rect x="135" y="100" width="25" height="40" rx="2" fill="{accent}" opacity="0.15"/>"""
    if genre == "football":
        return f"""
      <circle cx="100" cy="130" r="40" fill="none" stroke="#fff" stroke-width="2" opacity="0.2"/>
      <path d="M100 90 L100 170 M70 130 L130 130" stroke="#fff" stroke-width="1.5" opacity="0.15"/>
      <ellipse cx="100" cy="230" rx="55" ry="12" fill="#000" opacity="0.35"/>"""
    return f"""
      <path d="M0 180 Q50 120 100 150 T200 130 L200 300 L0 300 Z" fill="{accent}" opacity="0.2"/>
      <circle cx="150" cy="60" r="20" fill="{accent}" opacity="0.25"/>"""


def svg(name: str, bg1: str, bg2: str, accent: str, genre: str) -> str:
    fig = figure(genre, accent)
    uid = name.replace("-", "")
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <defs>
    <linearGradient id="bg{uid}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="{bg2}"/>
      <stop offset="100%" stop-color="{bg1}"/>
    </linearGradient>
    <radialGradient id="glow{uid}" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="{bg1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="300" fill="url(#bg{uid})"/>
  <rect width="200" height="300" fill="url(#glow{uid})"/>
  {fig}
  <rect width="200" height="80" y="220" fill="url(#bg{uid})" opacity="0.55"/>
  <rect width="200" height="300" fill="#000" opacity="0.08"/>
</svg>"""


def main() -> None:
    for name, bg1, bg2, accent, genre in POSTERS:
        (OUT / f"{name}.svg").write_text(svg(name, bg1, bg2, accent, genre), encoding="utf-8")
    print(f"Created {len(POSTERS)} posters in {OUT}")


if __name__ == "__main__":
    main()
