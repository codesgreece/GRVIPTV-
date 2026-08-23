const ATHENS_TZ = "Europe/Athens";
const PROMO_START_DAY = 17;

type AthensDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getAthensDateTime(date: Date): AthensDateTime {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATHENS_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function athensLocalToUtc(local: Omit<AthensDateTime, "hour" | "minute" | "second"> & Partial<Pick<AthensDateTime, "hour" | "minute" | "second">>): Date {
  const target = {
    year: local.year,
    month: local.month,
    day: local.day,
    hour: local.hour ?? 0,
    minute: local.minute ?? 0,
    second: local.second ?? 0,
  };

  const targetStamp =
    target.year * 1_000_000_000_000 +
    target.month * 10_000_000_000 +
    target.day * 100_000_000 +
    target.hour * 1_000_000 +
    target.minute * 10_000 +
    target.second;

  let guess = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute, target.second);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const current = getAthensDateTime(new Date(guess));
    const currentStamp =
      current.year * 1_000_000_000_000 +
      current.month * 10_000_000_000 +
      current.day * 100_000_000 +
      current.hour * 1_000_000 +
      current.minute * 10_000 +
      current.second;

    if (currentStamp === targetStamp) {
      return new Date(guess);
    }

    guess += targetStamp > currentStamp ? 3_600_000 : -3_600_000;
  }

  return new Date(guess);
}

export function isPromoActive(now = new Date()) {
  const { day } = getAthensDateTime(now);
  return day >= PROMO_START_DAY;
}

export type PromoCountdownMode = "sale-ending" | "sale-starting";

export function getPromoCountdown(now = new Date()): {
  mode: PromoCountdownMode;
  target: Date;
  promoActive: boolean;
} {
  const athens = getAthensDateTime(now);
  const promoActive = athens.day >= PROMO_START_DAY;

  if (promoActive) {
    const lastDay = getDaysInMonth(athens.year, athens.month);
    return {
      mode: "sale-ending",
      promoActive: true,
      target: athensLocalToUtc({
        year: athens.year,
        month: athens.month,
        day: lastDay,
        hour: 23,
        minute: 59,
        second: 59,
      }),
    };
  }

  return {
    mode: "sale-starting",
    promoActive: false,
    target: athensLocalToUtc({
      year: athens.year,
      month: athens.month,
      day: PROMO_START_DAY,
      hour: 0,
      minute: 0,
      second: 0,
    }),
  };
}

export function getPromoRemainingMs(now = new Date(), target: Date) {
  return Math.max(0, target.getTime() - now.getTime());
}

export function splitCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

type PricingPlan = (typeof import("@/data/content").pricingPlans)[number];

export function getPlanDisplay(plan: PricingPlan, promoActive: boolean) {
  if (promoActive) {
    return {
      price: plan.price,
      originalPrice: plan.originalPrice,
      showSale: true,
    };
  }

  return {
    price: plan.originalPrice,
    originalPrice: null,
    showSale: false,
  };
}
