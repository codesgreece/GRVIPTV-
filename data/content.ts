export const pricingPlans = [
  {
    id: "1-month",
    title: "1 Μήνας",
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
