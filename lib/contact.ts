/** Εύκολα αντικαταστάσιμα στοιχεία επικοινωνίας */
export const contactConfig = {
  email: "support@grvipott.com",
  phone: "+30 695 594 0150",
  phoneE164: "+306955940150",
  telegram: "https://t.me/+306955940150",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  liveChatEnabled: false,
} as const;

export function telegramUrl(_message?: string) {
  return contactConfig.telegram;
}
