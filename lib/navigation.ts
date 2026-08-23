export const mainNav = [
  { href: "/", label: "Αρχική" },
  { href: "/kanalia", label: "Κανάλια" },
  { href: "/paketa", label: "Πακέτα" },
  { href: "/odigos-egkatastasis", label: "Οδηγός Εγκατάστασης" },
  { href: "/syskeyes", label: "Συσκευές" },
  { href: "/faq", label: "FAQ" },
  { href: "/epikoinonia", label: "Επικοινωνία" },
] as const;

export const footerNav = {
  navigation: mainNav,
  info: [
    { href: "/sxetika", label: "Σχετικά με Εμάς" },
    { href: "/oroi-xrisis", label: "Όροι Χρήσης" },
    { href: "/politiki-aporritou", label: "Πολιτική Απορρήτου" },
    { href: "/politiki-epistrofon", label: "Πολιτική Επιστροφών" },
  ],
  support: [
    { href: "/odigos-egkatastasis", label: "Οδηγός Εγκατάστασης" },
    { href: "/epikoinonia", label: "Επικοινωνία" },
    { href: "#telegram", label: "Telegram Support" },
    { href: "#live-chat", label: "Live Chat" },
  ],
} as const;
