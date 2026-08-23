export const pricingPlans = [
  {
    id: "1-month",
    title: "1 Μήνας",
    months: 1,
    price: "€15",
    originalPrice: "€20",
    period: "/ μήνα",
    popular: false,
    features: [
      "24.000+ Ζωντανά Κανάλια",
      "120.000+ Ταινίες & Σειρές",
      "Full HD / 4K Ποιότητα",
      "Όλες οι Συσκευές",
      "Υποστήριξη 24/7",
    ],
  },
  {
    id: "3-months",
    title: "3 Μήνες",
    months: 3,
    price: "€35",
    originalPrice: "€47",
    period: "/ 3 μήνες",
    popular: true,
    badge: "ΠΙΟ ΔΗΜΟΦΙΛΕΣ",
    features: [
      "24.000+ Ζωντανά Κανάλια",
      "120.000+ Ταινίες & Σειρές",
      "Full HD / 4K Ποιότητα",
      "Όλες οι Συσκευές",
      "Υποστήριξη 24/7",
    ],
  },
  {
    id: "6-months",
    title: "6 Μήνες",
    months: 6,
    price: "€46",
    originalPrice: "€56",
    period: "/ 6 μήνες",
    popular: false,
    features: [
      "24.000+ Ζωντανά Κανάλια",
      "120.000+ Ταινίες & Σειρές",
      "Full HD / 4K Ποιότητα",
      "Όλες οι Συσκευές",
      "Υποστήριξη 24/7",
    ],
  },
  {
    id: "12-months",
    title: "12 Μήνες",
    months: 12,
    price: "€72",
    originalPrice: "€89",
    period: "/ έτος",
    popular: false,
    features: [
      "24.000+ Ζωντανά Κανάλια",
      "120.000+ Ταινίες & Σειρές",
      "Full HD / 4K Ποιότητα",
      "Όλες οι Συσκευές",
      "Υποστήριξη 24/7",
    ],
  },
] as const;

export const becomeResellerContent = {
  eyebrow: "Συνεργασία",
  title: "Γίνε Συνεργάτης",
  description:
    "Ξεκίνα το δικό σου reseller δίκτυο με υποστήριξη, υλικό προώθησης και ανταγωνιστικές τιμές χονδρικής.",
  benefits: [
    "Ειδικές τιμές reseller & υψηλά περιθώρια κέρδους",
    "Dashboard πελατών & γρήγορη ενεργοποίηση λογαριασμών",
    "Branding υλικό, scripts πωλήσεων & training από την ομάδα",
    "24/7 τεχνική υποστήριξη για εσένα και τους πελάτες σου",
  ],
  ctaLabel: "Θέλω να γίνω συνεργάτης",
} as const;

export const referralProgram = {
  eyebrow: "Referral Program",
  title: "Φέρε Φίλους, Κέρδισε Δωρεάν Μήνες",
  description:
    "Μοιράσου τον προσωπικό σου κωδικό. Όταν ενεργοποιηθεί νέος πελάτης, κερδίζετε και οι δύο.",
  reward: "1 μήνας δώρο",
  rewardDetail: "Για εσένα + 1 μήνας δώρο για τον φίλο σου στην πρώτη ενεργοποίηση",
  steps: [
    {
      id: "get-code",
      title: "Πάρε τον κωδικό σου",
      description:
        "Μετά την αγορά, σου στέλνουμε προσωπικό referral code μέσω Telegram.",
    },
    {
      id: "share",
      title: "Το μοιράζεσαι",
      description:
        "Στείλε το link σου ή πες στον φίλο να αναφέρει τον κωδικό στο Telegram κατά την παραγγελία.",
    },
    {
      id: "reward",
      title: "Κερδίζετε και οι δύο",
      description:
        "Μόλις ενεργοποιηθεί ο φίλος, παρατείνουμε αυτόματα τη συνδρομή σας με 1 δωρεάν μήνα.",
    },
  ],
  ctaExisting: "Έχω ήδη κωδικό — Ενεργοποίηση",
  ctaNew: "Θέλω referral code",
} as const;

export const guaranteeStrip = {
  title: "Εγγύηση ικανοποίησης 24 ωρών",
  description:
    "Αν δεν είσαι 100% ικανοποιημένος με την υπηρεσία, επιστρέφουμε το ποσό εντός 24 ωρών — χωρίς περιττές ερωτήσεις.",
  badges: [
    "Χωρίς κρυφές χρεώσεις",
    "Άμεση ενεργοποίηση",
    "Ασφαλείς πληρωμές",
  ],
} as const;

export const audiencePersonas = [
  {
    id: "family",
    label: "Οικογένεια",
    title: "Όλοι μαζί, μία οθόνη τη φορά",
    description:
      "Κανάλια, ταινίες και σειρές για κάθε ηλικία. Ρύθμισέ το σε Smart TV, tablet ή κινητό και απόλαυσε premium ψυχαγωγία στο σαλόνι.",
    highlights: [
      "226+ ελληνικά κανάλια",
      "4.492+ ταινίες & σειρές",
      "Πολλαπλές συσκευές ταυτόχρονα",
    ],
    accent: "gold" as const,
    icon: "home" as const,
    featured: false,
  },
  {
    id: "sports",
    label: "Φίλος του Αθλητισμού",
    title: "Κάθε αγώνας, ζωντανά",
    description:
      "Super League, Champions League, EuroLeague, Formula 1 και αθλητικά από όλο τον κόσμο — Full HD & 4K χωρίς buffering.",
    highlights: [
      "Premium αθλητικά κανάλια",
      "Live events χωρίς καθυστέρηση",
      "Καθημερινή κάλυψη αγώνων",
    ],
    accent: "blue" as const,
    icon: "trophy" as const,
    featured: true,
  },
  {
    id: "diaspora",
    label: "Ο Ξενιτεμένος",
    title: "Η Ελλάδα, όπου κι αν είσαι",
    description:
      "Από Γερμανία, Αγγλία, Βέλγιο ή οπουδήποτε στην Ευρώπη — δες ελληνικά κανάλια, ειδήσεις και σειρές σαν να είσαι στο σπίτι.",
    highlights: [
      "Ελληνικό περιεχόμενο παντού",
      "Stable streaming από το εξωτερικό",
      "Εύκολη εγκατάσταση σε 5 λεπτά",
    ],
    accent: "emerald" as const,
    icon: "globe" as const,
    featured: false,
  },
] as const;

export const spinWheelPrizes = [
  {
    id: "discount-10",
    label: "10% Έκπτωση",
    shortLabel: "10%",
    title: "10% έκπτωση",
    description: "Σε οποιαδήποτε συνδρομή επιλέξετε.",
    color: "#D4A72C",
    telegramNote: "Κέρδισα 10% έκπτωση στον τροχό δώρων",
  },
  {
    id: "discount-15-6m",
    label: "15% / 6μηνο",
    shortLabel: "15%",
    title: "15% έκπτωση",
    description: "Ειδικά για 6μηνη συνδρομή.",
    color: "#2AABEE",
    telegramNote: "Κέρδισα 15% έκπτωση σε 6μηνη συνδρομή",
  },
  {
    id: "free-month",
    label: "1 Μήνας Δώρο",
    shortLabel: "1 Μήνας",
    title: "1 μήνας δώρο",
    description: "Επιπλέον μήνας σύνδρομης δωρεάν.",
    color: "#34D399",
    telegramNote: "Κέρδισα 1 μήνα δώρο στον τροχό",
  },
  {
    id: "daily-pass",
    label: "1 Ημέρα Δωρεάν",
    shortLabel: "1 Ημέρα",
    title: "Ημερήσιο δώρο",
    description: "Δες την αγαπημένη σου ομάδα free για 1 μέρα.",
    color: "#A78BFA",
    telegramNote: "Κέρδισα 1 ημερήσιο δώρο για αγώνα",
  },
  {
    id: "year-lottery",
    label: "Κλήρωση 1 Έτος",
    shortLabel: "Κλήρωση",
    title: "Κλήρωση 1 έτους",
    description: "Συμμετοχή σε κλήρωση για 1 από 10 συνδρομές 1 έτους.",
    color: "#F472B6",
    telegramNote: "Κέρδισα συμμετοχή σε κλήρωση 1 έτους συνδρομής",
  },
] as const;

export const resellersAdmin = {
  name: "GREEK VIPTV ADMIN",
  role: "Head Admin Founder",
  badge: "Official Admin",
} as const;

export const resellersPartners = [
  {
    id: "dimos-leonidiou",
    name: "DIMOS LEONIDIOU",
    avgMonthlyClients: 280,
  },
  {
    id: "giannis-kalaouris",
    name: "Γιάννης Καλαούρης",
    avgMonthlyClients: 176,
  },
  {
    id: "andreas-leontios",
    name: "Ανδρέας Λεώντιος",
    avgMonthlyClients: 345,
  },
] as const;

export const stats = [
  {
    id: "gr-channels",
    value: 226,
    suffix: "",
    label: "ΕΛΛΗΝΙΚΑ ΚΑΝΑΛΙΑ",
    group: "greek" as const,
    icon: "tv",
  },
  {
    id: "gr-movies",
    value: 4492,
    suffix: "",
    label: "ΕΛΛΗΝΙΚΕΣ ΤΑΙΝΙΕΣ",
    group: "greek" as const,
    icon: "film",
  },
  {
    id: "gr-series",
    value: 226,
    suffix: "",
    label: "ΕΛΛΗΝΙΚΕΣ ΣΕΙΡΕΣ",
    group: "greek" as const,
    icon: "clapperboard",
  },
] as const;

export const features = [
  {
    title: "Premium Κανάλια",
    description:
      "Πρόσβαση σε χιλιάδες ζωντανά κανάλια από όλο τον κόσμο.",
    icon: "radio",
  },
  {
    title: "VOD Βιβλιοθήκη",
    description:
      "Τεράστια συλλογή από ταινίες και σειρές με συνεχείς ενημερώσεις.",
    icon: "library",
  },
  {
    title: "Ζωντανά Αθλητικά",
    description: "Όλοι οι κορυφαίοι αγώνες και PPV events.",
    icon: "trophy",
  },
  {
    title: "Υψηλή Ποιότητα",
    description:
      "Απολαύστε περιεχόμενο σε Full HD, 4K και εκπληκτική ποιότητα εικόνας.",
    icon: "monitor",
  },
  {
    title: "Γρήγορο & Σταθερό",
    description: "Ισχυροί servers με εξαιρετική σταθερότητα.",
    icon: "zap",
  },
  {
    title: "Υποστήριξη 24/7",
    description: "Η ομάδα υποστήριξης είναι διαθέσιμη όταν τη χρειάζεστε.",
    icon: "headset",
  },
] as const;

export const benefits = [
  {
    title: "Anti-Freeze Τεχνολογία",
    description: "Σταθερή και ομαλή εμπειρία streaming.",
    icon: "shield",
  },
  {
    title: "Multi-Screen",
    description:
      "Παρακολουθήστε από πολλές συσκευές ανάλογα με το πακέτο σας.",
    icon: "screens",
  },
  {
    title: "EPG Υποστήριξη",
    description: "Πλήρης τηλεοπτικός οδηγός για τα διαθέσιμα κανάλια.",
    icon: "calendar",
  },
  {
    title: "Γονικός Έλεγχος",
    description: "Ρυθμίσεις για ασφαλέστερη εμπειρία.",
    icon: "lock",
  },
  {
    title: "Τακτικές Ενημερώσεις",
    description: "Νέο περιεχόμενο και συνεχείς βελτιώσεις.",
    icon: "refresh",
  },
] as const;

export const apps = [
  {
    id: "smarters",
    name: "IPTV Smarters",
    description: "Δημοφιλής εφαρμογή με εύκολο setup και καθαρό interface.",
  },
  {
    id: "tivimate",
    name: "TiviMate",
    description: "Ιδανική για Android TV με ισχυρό EPG και recordings.",
  },
  {
    id: "xciptv",
    name: "XCIPTV Player",
    description: "Γρήγορη αναπαραγωγή και απλή διαχείριση λιστών.",
  },
  {
    id: "perfect",
    name: "Perfect Player",
    description: "Ελαφριά λύση με σταθερή απόδοση σε πολλές συσκευές.",
  },
  {
    id: "ott-nav",
    name: "OTT Navigator",
    description: "Πλούσιες ρυθμίσεις και σύγχρονη εμπειρία παρακολούθησης.",
  },
  {
    id: "more",
    name: "& Περισσότερα",
    description: "Υποστηρίζουμε επιπλέον εφαρμογές ανάλογα με τη συσκευή σας.",
  },
] as const;

export const devices = [
  {
    id: "smart-tv",
    name: "Smart TV",
    description: "Samsung, LG και άλλες σύγχρονες τηλεοράσεις.",
  },
  {
    id: "android-tv",
    name: "Android TV",
    description: "Android TV boxes και τηλεοράσεις με Google TV.",
  },
  {
    id: "firestick",
    name: "Firestick",
    description: "Amazon Fire TV Stick και Fire TV συσκευές.",
  },
  {
    id: "smartphone",
    name: "Smartphone",
    description: "Android και iOS κινητά για θέαση εν κινήσει.",
  },
  {
    id: "tablet",
    name: "Tablet",
    description: "Tablets για άνετη εμπειρία παντού.",
  },
  {
    id: "mag",
    name: "MAG Box",
    description: "Κλασικές IPTV συσκευές MAG.",
  },
  {
    id: "desktop",
    name: "Windows / Mac",
    description: "Υπολογιστές και laptops με εφαρμογές ή browser.",
  },
] as const;

export const faqItems = [
  {
    question: "Τι είναι το GRVIP OTT;",
    answer:
      "Το GRVIP OTT είναι μια premium υπηρεσία streaming που σας δίνει πρόσβαση σε χιλιάδες ζωντανά κανάλια, ταινίες και σειρές σε υψηλή ποιότητα, από οποιαδήποτε συμβατή συσκευή.",
  },
  {
    question: "Πώς μπορώ να ξεκινήσω;",
    answer:
      "Επιλέξτε το πακέτο που σας ταιριάζει, ολοκληρώστε την αγορά και θα λάβετε άμεσα τα στοιχεία σύνδεσης μαζί με οδηγίες εγκατάστασης.",
  },
  {
    question: "Ποιες συσκευές υποστηρίζονται;",
    answer:
      "Smart TV, Android TV, Firestick, smartphones, tablets, MAG boxes και υπολογιστές Windows/Mac. Δείτε τον αναλυτικό οδηγό εγκατάστασης για κάθε συσκευή.",
  },
  {
    question: "Πόσο γρήγορα ενεργοποιείται η υπηρεσία;",
    answer:
      "Η ενεργοποίηση γίνεται συνήθως άμεσα μετά την ολοκλήρωση της παραγγελίας σας.",
  },
  {
    question: "Πώς ανανεώνω τη συνδρομή μου;",
    answer:
      "Μπορείτε να ανανεώσετε οποιαδήποτε στιγμή επιλέγοντας ξανά το επιθυμητό πακέτο ή επικοινωνώντας με την υποστήριξη.",
  },
  {
    question: "Τι χρειάζομαι για να λειτουργήσει;",
    answer:
      "Χρειάζεστε σταθερή σύνδεση στο διαδίκτυο, μια συμβατή συσκευή και μία από τις υποστηριζόμενες εφαρμογές με τα στοιχεία που θα σας αποσταλούν.",
  },
  {
    question: "Είναι ασφαλής η πληρωμή;",
    answer:
      "Οι πληρωμές πραγματοποιούνται μέσω ασφαλών καναλιών. Δεν αποθηκεύουμε ευαίσθητα στοιχεία καρτών στη δική μας πλατφόρμα.",
  },
  {
    question: "Τι γίνεται αν χρειαστώ βοήθεια;",
    answer:
      "Η ομάδα υποστήριξής μας είναι διαθέσιμη 24/7 μέσω φόρμας επικοινωνίας, Telegram και Live Chat.",
  },
] as const;

export const channelCategories = [
  {
    id: "greek",
    title: "Ελληνικά Κανάλια",
    description: "Ψυχαγωγία, ενημέρωση και τοπικό περιεχόμενο σε ένα μέρος.",
  },
  {
    id: "sports",
    title: "Αθλητικά",
    description: "Αγώνες, highlights και αθλητικά events σε υψηλή ποιότητα.",
  },
  {
    id: "movies",
    title: "Ταινίες",
    description: "Μεγάλη συλλογή ταινιών για κάθε διάθεση και στιγμή.",
  },
  {
    id: "series",
    title: "Σειρές",
    description: "Δημοφιλείς σειρές και binge-worthy περιεχόμενο on demand.",
  },
  {
    id: "kids",
    title: "Παιδικά",
    description: "Ασφαλές επιλογές ψυχαγωγίας για όλη την οικογένεια.",
  },
  {
    id: "international",
    title: "Διεθνή",
    description: "Περιεχόμενο από πολλές χώρες και γλώσσες.",
  },
  {
    id: "news",
    title: "Ειδησεογραφικά",
    description: "Ενημέρωση και ειδήσεις από Ελλάδα και εξωτερικό.",
  },
  {
    id: "music",
    title: "Μουσικά",
    description: "Μουσικά κανάλια και στιγμές για κάθε διάθεση.",
  },
] as const;
