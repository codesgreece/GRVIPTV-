from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "hero" / "screens"
OUT.mkdir(parents=True, exist_ok=True)

SCENES = {
    "football": {
        "bg": ("#061208", "#0f2810", "#1a4018"),
        "accent": "#4ade80",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <ellipse cx="160" cy="200" rx="200" ry="80" fill="#0a1808"/>
      <rect x="0" y="95" width="320" height="85" fill="#143818"/>
      <line x1="0" y1="130" x2="320" y2="130" stroke="#fff" stroke-width="1.5" opacity="0.25"/>
      <circle cx="160" cy="130" r="28" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.2"/>
      <ellipse cx="90" cy="118" rx="8" ry="14" fill="#111" opacity="0.85"/>
      <ellipse cx="110" cy="112" rx="7" ry="12" fill="#222" opacity="0.8"/>
      <ellipse cx="200" cy="115" rx="8" ry="14" fill="#111" opacity="0.85"/>
      <ellipse cx="220" cy="108" rx="7" ry="12" fill="#333" opacity="0.75"/>
      <circle cx="160" cy="128" r="4" fill="#fff" opacity="0.5"/>
      <rect x="0" y="0" width="320" height="50" fill="url(#lights)"/>
""",
    },
    "basketball": {
        "bg": ("#0a0810", "#1a1020", "#2a1830"),
        "accent": "#f97316",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <ellipse cx="160" cy="210" rx="180" ry="60" fill="#0d0812"/>
      <rect x="20" y="60" width="280" height="100" fill="#1a1220" opacity="0.6"/>
      <rect x="130" y="30" width="60" height="4" fill="#555"/>
      <rect x="155" y="30" width="10" height="50" fill="#666"/>
      <ellipse cx="160" cy="78" rx="28" ry="6" fill="none" stroke="#f97316" stroke-width="2" opacity="0.7"/>
      <ellipse cx="160" cy="95" rx="12" ry="22" fill="#111"/>
      <ellipse cx="160" cy="72" rx="10" ry="10" fill="#222"/>
      <path d="M148 95 L160 55 L172 95" fill="#333" opacity="0.9"/>
      <circle cx="250" cy="40" r="20" fill="url(#glow)" opacity="0.5"/>
      <circle cx="70" cy="45" r="15" fill="url(#glow)" opacity="0.35"/>
""",
    },
    "action": {
        "bg": ("#120808", "#281008", "#401808"),
        "accent": "#f97316",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <ellipse cx="200" cy="100" rx="120" ry="80" fill="url(#glow)" opacity="0.45"/>
      <ellipse cx="80" cy="120" rx="60" ry="40" fill="#ff6600" opacity="0.25"/>
      <rect x="40" y="100" width="30" height="50" fill="#111" opacity="0.9" transform="rotate(-15 55 125)"/>
      <rect x="200" y="90" width="25" height="45" fill="#222" opacity="0.85" transform="rotate(10 212 112)"/>
      <path d="M0 140 L320 120 L320 180 L0 180 Z" fill="#0a0604"/>
      <line x1="120" y1="60" x2="200" y2="90" stroke="#ffd978" stroke-width="2" opacity="0.4"/>
      <line x1="180" y1="50" x2="240" y2="80" stroke="#f97316" stroke-width="1.5" opacity="0.5"/>
""",
    },
    "drama": {
        "bg": ("#080c14", "#101828", "#182038"),
        "accent": "#60a5fa",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <rect x="0" y="100" width="320" height="80" fill="#060810"/>
      <ellipse cx="100" cy="110" rx="18" ry="28" fill="#111"/>
      <ellipse cx="100" cy="88" rx="14" ry="14" fill="#1a2030"/>
      <ellipse cx="220" cy="108" rx="16" ry="26" fill="#151820"/>
      <ellipse cx="220" cy="88" rx="13" ry="13" fill="#202830"/>
      <rect x="60" y="130" width="200" height="2" fill="#d4a72c" opacity="0.3"/>
      <circle cx="280" cy="40" r="25" fill="url(#glow)" opacity="0.2"/>
      <rect x="0" y="0" width="120" height="180" fill="#000" opacity="0.25"/>
""",
    },
    "fantasy": {
        "bg": ("#0c0818", "#181028", "#281840"),
        "accent": "#a78bfa",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <path d="M0 120 Q80 80 160 100 T320 90 L320 180 L0 180 Z" fill="#141020"/>
      <path d="M0 140 Q100 100 200 115 T320 105 L320 180 L0 180 Z" fill="#0a0810"/>
      <polygon points="240,90 260,130 220,130" fill="#111" opacity="0.8"/>
      <rect x="235" y="70" width="10" height="25" fill="#222"/>
      <polygon points="100,60 115,95 85,95" fill="#a78bfa" opacity="0.2"/>
      <circle cx="260" cy="50" r="18" fill="#ffd978" opacity="0.35"/>
      <ellipse cx="160" cy="150" rx="80" ry="20" fill="#000" opacity="0.3"/>
""",
    },
    "racing": {
        "bg": ("#080808", "#141414", "#1c1c1c"),
        "accent": "#ef4444",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <path d="M0 130 Q160 110 320 125 L320 180 L0 180 Z" fill="#111"/>
      <path d="M0 140 L320 135" stroke="#fff" stroke-width="2" opacity="0.15" stroke-dasharray="20 10"/>
      <rect x="60" y="115" width="50" height="14" rx="4" fill="#222" transform="skewX(-20)"/>
      <rect x="65" y="118" width="8" height="8" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="180" y="120" width="55" height="15" rx="4" fill="#333" transform="skewX(-15)"/>
      <rect x="185" y="123" width="8" height="8" rx="2" fill="#ffd978" opacity="0.8"/>
      <ellipse cx="100" cy="122" rx="30" ry="8" fill="#f97316" opacity="0.15"/>
      <ellipse cx="210" cy="127" rx="35" ry="8" fill="#ef4444" opacity="0.12"/>
""",
    },
    "stadium": {
        "bg": ("#081008", "#101820", "#182028"),
        "accent": "#22c55e",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <ellipse cx="160" cy="200" rx="220" ry="90" fill="#0a1208"/>
      <path d="M20 100 Q160 60 300 100 L300 180 L20 180 Z" fill="#143018"/>
      <ellipse cx="160" cy="95" rx="140" ry="25" fill="#000" opacity="0.35"/>
      <circle cx="80" cy="88" r="3" fill="#fff" opacity="0.4"/>
      <circle cx="120" cy="85" r="3" fill="#fff" opacity="0.35"/>
      <circle cx="200" cy="86" r="3" fill="#fff" opacity="0.4"/>
      <circle cx="240" cy="88" r="3" fill="#fff" opacity="0.35"/>
      <circle cx="160" cy="82" r="3" fill="#fff" opacity="0.45"/>
      <rect x="0" y="0" width="320" height="40" fill="url(#lights)" opacity="0.5"/>
""",
    },
    "cinema": {
        "bg": ("#100808", "#201010", "#301818"),
        "accent": "#d4a72c",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <path d="M0 100 L320 85 L320 180 L0 180 Z" fill="#0a0606"/>
      <ellipse cx="160" cy="70" rx="100" ry="35" fill="url(#glow)" opacity="0.35"/>
      <rect x="130" y="55" width="60" height="70" fill="#111" opacity="0.7"/>
      <ellipse cx="160" cy="50" rx="20" ry="22" fill="#222"/>
      <path d="M100 130 L160 90 L220 130 Z" fill="#1a1010" opacity="0.8"/>
      <line x1="0" y1="60" x2="320" y2="45" stroke="#d4a72c" stroke-width="0.5" opacity="0.2"/>
""",
    },
    "tennis": {
        "bg": ("#081018", "#0c1820", "#102028"),
        "accent": "#38bdf8",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <rect x="40" y="70" width="240" height="90" fill="#1a3040" opacity="0.7"/>
      <line x1="160" y1="70" x2="160" y2="160" stroke="#fff" stroke-width="1" opacity="0.2"/>
      <line x1="40" y1="115" x2="280" y2="115" stroke="#fff" stroke-width="1" opacity="0.2"/>
      <ellipse cx="200" cy="100" rx="10" ry="18" fill="#111"/>
      <ellipse cx="200" cy="85" rx="8" ry="8" fill="#222"/>
      <path d="M190 100 L200 70 L210 100" stroke="#333" stroke-width="3" fill="none"/>
      <circle cx="120" cy="105" r="4" fill="#38bdf8" opacity="0.8"/>
""",
    },
    "scifi": {
        "bg": ("#050810", "#0a1020", "#101830"),
        "accent": "#3b82f6",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <circle cx="160" cy="90" r="50" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.4"/>
      <circle cx="160" cy="90" r="30" fill="#3b82f6" opacity="0.12"/>
      <rect x="100" y="120" width="120" height="40" fill="#0a1020" opacity="0.8"/>
      <line x1="60" y1="150" x2="260" y2="150" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>
      <circle cx="80" cy="60" r="3" fill="#fff" opacity="0.6"/>
      <circle cx="240" cy="50" r="2" fill="#fff" opacity="0.5"/>
      <circle cx="200" cy="70" r="2" fill="#fff" opacity="0.4"/>
""",
    },
    "documentary": {
        "bg": ("#0c1008", "#182010", "#243018"),
        "accent": "#84cc16",
        "svg": """
      <rect width="320" height="180" fill="url(#sky)"/>
      <path d="M0 110 Q80 70 160 95 T320 80 L320 180 L0 180 Z" fill="#142010"/>
      <path d="M0 130 Q100 90 200 110 T320 100 L320 180 L0 180 Z" fill="#0c1808"/>
      <ellipse cx="250" cy="60" rx="40" ry="15" fill="#ffd978" opacity="0.2"/>
      <path d="M60 100 L90 60 L120 100 Z" fill="#111" opacity="0.5"/>
      <ellipse cx="180" cy="140" rx="60" ry="15" fill="#000" opacity="0.25"/>
""",
    },
}


def build(name: str, scene: dict) -> str:
    bg1, bg2, bg3 = scene["bg"]
    accent = scene["accent"]
    uid = name.replace("-", "")
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
  <defs>
    <linearGradient id="sky{uid}" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="{bg3}"/>
      <stop offset="55%" stop-color="{bg2}"/>
      <stop offset="100%" stop-color="{bg1}"/>
    </linearGradient>
    <radialGradient id="glow{uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="{bg1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lights{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  {scene["svg"].replace("url(#sky)", f"url(#sky{uid})").replace("url(#glow)", f"url(#glow{uid})").replace("url(#lights)", f"url(#lights{uid})")}
  <rect width="320" height="180" fill="#000" opacity="0.06"/>
</svg>"""


def main() -> None:
    for name, scene in SCENES.items():
        (OUT / f"{name}.svg").write_text(build(name, scene), encoding="utf-8")
    print(f"Created {len(SCENES)} screen artworks in {OUT}")


if __name__ == "__main__":
    main()
