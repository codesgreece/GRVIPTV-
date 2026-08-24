const PAYSAFE_DENOMS = [100, 50, 25, 10, 5] as const;

export type PaysafeDenom = (typeof PAYSAFE_DENOMS)[number];

export function splitIntoPaysafeCards(amount: number): PaysafeDenom[] {
  let remaining = Math.max(0, Math.round(amount));
  if (remaining % 5 !== 0) remaining = Math.ceil(remaining / 5) * 5;

  const cards: PaysafeDenom[] = [];
  for (const denom of PAYSAFE_DENOMS) {
    while (remaining >= denom) {
      cards.push(denom);
      remaining -= denom;
    }
  }

  return cards.length > 0 ? cards : [5];
}
