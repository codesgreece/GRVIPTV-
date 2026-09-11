const GREEK_MAP: Record<string, string> = {
  α: "a",
  ά: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  έ: "e",
  ζ: "z",
  η: "i",
  ή: "i",
  θ: "th",
  ι: "i",
  ί: "i",
  ϊ: "i",
  ΐ: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  ό: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  ύ: "y",
  ϋ: "y",
  ΰ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o",
  ώ: "o",
};

function transliterateGreek(input: string): string {
  let out = "";
  for (const char of input) {
    const lower = char.toLowerCase();
    out += GREEK_MAP[lower] ?? char;
  }
  return out;
}

/** Deterministic URL-safe slug; supports Greek channel names. */
export function slugifyChannelName(name: string): string {
  const base = transliterateGreek(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return base || "channel";
}

/** Short deterministic hash for collision suffixes (stable across runs). */
export function shortHash(input: string, length = 6): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(length, "0").slice(0, length);
}

export function buildUniqueChannelId(
  name: string,
  tvgId: string,
  streamUrl: string,
  used: Set<string>,
): string {
  const preferred = slugifyChannelName(name);
  if (!used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }

  const fromTvg = tvgId ? slugifyChannelName(tvgId) : "";
  if (fromTvg && fromTvg !== preferred && !used.has(fromTvg)) {
    used.add(fromTvg);
    return fromTvg;
  }

  const withHash = `${preferred}-${shortHash(`${name}|${tvgId}|${streamUrl}`)}`;
  if (!used.has(withHash)) {
    used.add(withHash);
    return withHash;
  }

  let n = 2;
  while (used.has(`${withHash}-${n}`)) n += 1;
  const finalId = `${withHash}-${n}`;
  used.add(finalId);
  return finalId;
}
