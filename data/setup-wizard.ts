export type WizardChoice = {
  id: string;
  name: string;
  sub: string;
  badge?: string;
  popular?: boolean;
};

export type WizardStep = {
  title: string;
  description: string;
};

export type WizardInstructions = {
  title: string;
  subtitle: string;
  warning?: string;
  steps: WizardStep[];
  success: string;
};

export const wizardDevices: WizardChoice[] = [
  {
    id: "firestick",
    name: "Amazon Firestick",
    sub: "Fire TV Stick / Fire TV Cube",
    badge: "Πιο Δημοφιλές",
    popular: true,
  },
  {
    id: "androidtv",
    name: "Android TV Box",
    sub: "Xiaomi, Shield, X96, H96...",
  },
  {
    id: "samsung",
    name: "Samsung Smart TV",
    sub: "Tizen OS (2016+)",
  },
  {
    id: "lg",
    name: "LG Smart TV",
    sub: "webOS (2014+)",
  },
  {
    id: "android",
    name: "Android Phone / Tablet",
    sub: "Samsung, Huawei, Xiaomi...",
  },
  {
    id: "iphone",
    name: "iPhone / iPad",
    sub: "iOS 13 και νεότερα",
  },
  {
    id: "appletv",
    name: "Apple TV",
    sub: "Apple TV 4K / HD",
  },
  {
    id: "pc",
    name: "PC / Mac",
    sub: "Windows, macOS, Linux",
  },
  {
    id: "mag",
    name: "MAG Box",
    sub: "MAG 254 / 256 / 322 / 420...",
  },
];

export const wizardApps: Record<string, WizardChoice[]> = {
  firestick: [
    {
      id: "tivimate",
      name: "TiviMate",
      sub: "Καλύτερος συνολικός IPTV player",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Δωρεάν, όλες οι πλατφόρμες",
    },
    {
      id: "ottnav",
      name: "OTT Navigator",
      sub: "Πλούσιες ρυθμίσεις",
    },
  ],
  androidtv: [
    {
      id: "tivimate",
      name: "TiviMate",
      sub: "Καλύτερος συνολικός IPTV player",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Δωρεάν, όλες οι πλατφόρμες",
    },
    {
      id: "ottnav",
      name: "OTT Navigator",
      sub: "Πλούσιες ρυθμίσεις",
    },
  ],
  android: [
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Δωρεάν από το Play Store",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "ottnav",
      name: "OTT Navigator",
      sub: "Προηγμένες δυνατότητες",
    },
    {
      id: "gse",
      name: "GSE Smart IPTV",
      sub: "Για προχωρημένους χρήστες",
    },
  ],
  samsung: [
    {
      id: "smartiptv",
      name: "Smart IPTV",
      sub: "Ιδανικό για Samsung Tizen",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "ssiptv",
      name: "SS IPTV",
      sub: "Δωρεάν και απλό",
    },
  ],
  lg: [
    {
      id: "smarters",
      name: "IPTV Smarters",
      sub: "Ιδανικό για LG webOS",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "ssiptv",
      name: "SS IPTV",
      sub: "Δωρεάν και απλό",
    },
  ],
  iphone: [
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Διαθέσιμο στο App Store",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "gse",
      name: "GSE Smart IPTV",
      sub: "Προηγμένες δυνατότητες",
    },
    {
      id: "flexiptv",
      name: "Flex IPTV",
      sub: "Καθαρό Apple-style UI",
    },
  ],
  appletv: [
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Διαθέσιμο στο tvOS",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "infuse",
      name: "Infuse",
      sub: "Premium player για Apple TV",
    },
  ],
  pc: [
    {
      id: "smarters",
      name: "IPTV Smarters Pro",
      sub: "Windows & Mac",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "vlc",
      name: "VLC Media Player",
      sub: "Δωρεάν, open-source",
    },
    {
      id: "kodi",
      name: "Kodi",
      sub: "Προχωρημένο media center",
    },
  ],
  mag: [
    {
      id: "stalker",
      name: "Stalker Portal",
      sub: "Ενσωματωμένο MAG browser",
      badge: "Προτεινόμενο",
      popular: true,
    },
  ],
};

export const wizardMethods: Record<string, WizardChoice[]> = {
  tivimate: [
    {
      id: "xtream",
      name: "Xtream Codes",
      sub: "Username + Password — πιο εύκολο",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Απευθείας playlist URL",
    },
  ],
  smarters: [
    {
      id: "xtream",
      name: "Xtream Codes",
      sub: "Username + Password — πιο εύκολο",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Απευθείας playlist URL",
    },
  ],
  ottnav: [
    {
      id: "xtream",
      name: "Xtream Codes",
      sub: "Username + Password — πιο εύκολο",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Απευθείας playlist URL",
    },
  ],
  gse: [
    {
      id: "xtream",
      name: "Xtream Codes",
      sub: "Username + Password",
      badge: "Προτεινόμενο",
      popular: true,
    },
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Απευθείας playlist URL",
    },
  ],
  flexiptv: [
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Επικολλήστε το M3U URL σας",
      popular: true,
    },
  ],
  smartiptv: [
    {
      id: "m3u",
      name: "M3U URL",
      sub: "Μέσω MAC address στο browser",
      popular: true,
    },
  ],
  ssiptv: [
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Επικολλήστε το M3U URL σας",
      popular: true,
    },
  ],
  infuse: [
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Προσθήκη μέσω Files ή URL",
      popular: true,
    },
  ],
  vlc: [
    {
      id: "m3u",
      name: "M3U Playlist",
      sub: "Open network stream",
      popular: true,
    },
  ],
  kodi: [
    {
      id: "xtream",
      name: "Xtream / PVR Plugin",
      sub: "PVR IPTV Simple Client",
      popular: true,
    },
  ],
  stalker: [
    {
      id: "stalker",
      name: "Stalker Portal URL",
      sub: "Εισάγετε portal URL στο μενού MAG",
      popular: true,
    },
  ],
};

export function getWizardInstructions(
  deviceId: string,
  deviceName: string,
  appId: string,
  appName: string,
  methodId: string,
): WizardInstructions {
  if (appId === "tivimate" && methodId === "xtream") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Ακολουθήστε τα βήματα προσεκτικά — διαρκεί περίπου 2 λεπτά",
      warning:
        deviceId === "firestick"
          ? "Το TiviMate απαιτεί δωρεάν λογαριασμό στο tivimate.com για ενεργοποίηση. Εγκαταστήστε το από το Amazon App Store."
          : "Εγκαταστήστε το TiviMate από το Google Play Store.",
      steps: [
        {
          title: "Ανοίξτε το TiviMate",
          description:
            "Εκκινήστε το TiviMate. Στην πρώτη εκκίνηση πατήστε Προσθήκη Playlist.",
        },
        {
          title: "Επιλέξτε Xtream Codes",
          description:
            'Επιλέξτε "Xtream codes API" από τη λίστα τύπων playlist.',
        },
        {
          title: "Εισάγετε το Server URL",
          description:
            "Βάλτε το server URL που λάβατε (χωρίς /get.php ή κάτι μετά το port).",
        },
        {
          title: "Username & Password",
          description:
            "Εισάγετε username και password ακριβώς όπως σας στάλθηκαν. Πατήστε Next.",
        },
        {
          title: "Ονομάστε την playlist",
          description:
            'Δώστε οποιοδήποτε όνομα (π.χ. "GRVIP") και πατήστε Add.',
        },
        {
          title: "Περιμένετε τον συγχρονισμό",
          description:
            "Το TiviMate θα κατεβάσει τη λίστα καναλιών. Μπορεί να πάρει 1–2 λεπτά.",
        },
      ],
      success: "Έτοιμοι! Περιηγηθείτε στα κανάλια από την αρχική οθόνη του TiviMate.",
    };
  }

  if (appId === "tivimate" && methodId === "m3u") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Γρήγορη ρύθμιση με M3U URL",
      steps: [
        {
          title: "Ανοίξτε TiviMate → Add Playlist",
          description: "Εκκινήστε το TiviMate και πατήστε Add Playlist.",
        },
        {
          title: "Επιλέξτε M3U Playlist",
          description: 'Επιλέξτε "M3U playlist" από τη λίστα.',
        },
        {
          title: "Επικολλήστε το M3U URL",
          description:
            'Πατήστε "Enter URL" και επικολλήστε το πλήρες M3U URL που λάβατε. Πατήστε Next.',
        },
        {
          title: "Ονομάστε και προσθέστε",
          description:
            'Δώστε όνομα όπως "GRVIP" και πατήστε Add. Θα φορτωθούν τα κανάλια.',
        },
      ],
      success: "Τέλος! Η playlist φορτώθηκε στο TiviMate.",
    };
  }

  if (appId === "smarters" && methodId === "xtream") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Απλή σύνδεση με Xtream Codes",
      warning:
        "Εγκαταστήστε το IPTV Smarters Pro από App Store / Play Store / Amazon App Store.",
      steps: [
        {
          title: "Ανοίξτε IPTV Smarters Pro",
          description:
            'Εκκινήστε την εφαρμογή και πατήστε "Login with Xtream Codes API".',
        },
        {
          title: "Εισάγετε τα στοιχεία",
          description:
            "Συμπληρώστε: Any Name (π.χ. GRVIP), Username, Password και URL όπως σας στάλθηκαν.",
        },
        {
          title: "Πατήστε Add User",
          description:
            "Πατήστε Add User. Η εφαρμογή θα συνδεθεί και θα φορτώσει την playlist.",
        },
        {
          title: "Περιηγηθείτε στο περιεχόμενο",
          description:
            "Επιλέξτε προφίλ και μετά Live TV, Movies ή Series από το κύριο μενού.",
        },
      ],
      success: "Έτοιμοι! Το IPTV Smarters Pro είναι ρυθμισμένο.",
    };
  }

  if (appId === "ottnav" && methodId === "xtream") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Ρύθμιση με Xtream Codes",
      steps: [
        {
          title: "Ανοίξτε OTT Navigator",
          description: "Εκκινήστε την εφαρμογή και προσθέστε νέο προφίλ.",
        },
        {
          title: "Επιλέξτε Xtream",
          description: "Επιλέξτε σύνδεση με Xtream Codes / XC API.",
        },
        {
          title: "Συμπληρώστε credentials",
          description:
            "Εισάγετε host/URL, username και password από τα στοιχεία GRVIP OTT.",
        },
        {
          title: "Αποθηκεύστε και φορτώστε",
          description: "Αποθηκεύστε το προφίλ και περιμένετε τη φόρτωση λίστας.",
        },
      ],
      success: "Τέλος! Μπορείτε να ξεκινήσετε την παρακολούθηση.",
    };
  }

  if (appId === "gse" && methodId === "xtream") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Ρύθμιση Xtream Codes",
      steps: [
        {
          title: "Ανοίξτε GSE Smart IPTV",
          description: 'Μενού ≡ (πάνω αριστερά) → "Xtream Codes API".',
        },
        {
          title: "Προσθέστε λογαριασμό",
          description:
            "Πατήστε +, δώστε όνομα, server URL, username και password.",
        },
        {
          title: "Αποθήκευση",
          description: "Πατήστε Save. Η λίστα καναλιών θα φορτωθεί αυτόματα.",
        },
      ],
      success: "Όλα έτοιμα! Live TV, Movies και Series από το κύριο μενού.",
    };
  }

  if (appId === "vlc") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Άνοιγμα M3U μέσω network stream",
      steps: [
        {
          title: "Ανοίξτε VLC",
          description: "Εκκινήστε το VLC στον υπολογιστή σας.",
        },
        {
          title: "Media → Open Network Stream",
          description:
            "Από το μενού Media επιλέξτε Open Network Stream (Ctrl+N στα Windows).",
        },
        {
          title: "Επικολλήστε M3U URL",
          description: "Επικολλήστε το M3U URL και πατήστε Play.",
        },
        {
          title: "Περιηγηθείτε στα κανάλια",
          description: "Χρησιμοποιήστε το playlist sidebar για τα κανάλια.",
        },
      ],
      success: "Έτοιμοι! Το VLC αναπαράγει τα κανάλια σας.",
    };
  }

  if (appId === "kodi") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Ρύθμιση μέσω PVR client",
      steps: [
        {
          title: "Εγκαταστήστε PVR IPTV Simple Client",
          description:
            "Add-ons → Install from repository → PVR clients → PVR IPTV Simple Client.",
        },
        {
          title: "Ρυθμίστε το add-on",
          description:
            "My add-ons → PVR clients → PVR IPTV Simple Client → Configure.",
        },
        {
          title: "Ορίστε M3U URL",
          description: "Στο πεδίο M3U playlist URL επικολλήστε το URL σας.",
        },
        {
          title: "Ενεργοποιήστε Live TV",
          description: "Settings → Live TV → General → Enable.",
        },
      ],
      success: "Τέλος! Τα κανάλια είναι στο Live TV του Kodi.",
    };
  }

  if (appId === "smartiptv") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Ρύθμιση μέσω MAC address",
      steps: [
        {
          title: "Βρείτε το MAC address",
          description:
            "Ανοίξτε Smart IPTV στην TV. Σημειώστε το MAC address στην οθόνη.",
        },
        {
          title: "Καταχωρήστε στο siptv.eu",
          description:
            "Από κινητό/PC μπείτε στο siptv.eu, βάλτε MAC και το M3U URL σας.",
        },
        {
          title: "Επανεκκινήστε την εφαρμογή",
          description:
            "Κλείστε και ανοίξτε ξανά το Smart IPTV. Τα κανάλια θα εμφανιστούν.",
        },
      ],
      success: "Έτοιμοι! Η Samsung TV είναι ρυθμισμένη με GRVIP OTT.",
    };
  }

  if (appId === "ssiptv") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Εξωτερική playlist με M3U",
      steps: [
        {
          title: "Εγκαταστήστε SS IPTV",
          description: "Αναζητήστε SS IPTV στο app store της TV σας.",
        },
        {
          title: "Ανοίξτε ρυθμίσεις",
          description: "Settings (γρανάζι) → External Playlist.",
        },
        {
          title: "Εισάγετε M3U URL",
          description: "Επικολλήστε το M3U URL και αποθηκεύστε.",
        },
        {
          title: "Φορτώστε κανάλια",
          description: "Επιστρέψτε στην αρχική. Η λίστα θα φορτωθεί.",
        },
      ],
      success: "Τέλος! Περιηγηθείτε στα κανάλια στο SS IPTV.",
    };
  }

  if (appId === "stalker") {
    return {
      title: `${appName} στο ${deviceName}`,
      subtitle: "Σύνδεση μέσω Portal URL",
      steps: [
        {
          title: "Ανοίξτε το MAG box",
          description: "Ενεργοποιήστε τη συσκευή και περιμένετε το κύριο μενού.",
        },
        {
          title: "Settings → Servers",
          description: "Μεταβείτε σε Settings → Servers → Portals.",
        },
        {
          title: "Εισάγετε Portal URL",
          description:
            "Στο Portal 1 URL βάλτε το portal URL που λάβατε και αποθηκεύστε.",
        },
        {
          title: "Επανεκκινήστε",
          description:
            "Κάντε reboot. Θα συνδεθεί στο portal και θα φορτώσει κανάλια.",
        },
      ],
      success: "Έτοιμοι! Το MAG box συνδέθηκε στο GRVIP OTT.",
    };
  }

  // Generic M3U / fallback
  return {
    title: `${appName} στο ${deviceName}`,
    subtitle: "Γενικές οδηγίες σύνδεσης",
    warning:
      methodId === "m3u"
        ? "Θα χρειαστείτε το M3U URL που λάβατε μετά την αγορά σας."
        : undefined,
    steps: [
      {
        title: "Πάρτε τα στοιχεία σας",
        description:
          "Χρησιμοποιήστε τα στοιχεία σύνδεσης (Xtream ή M3U) που λάβατε από το GRVIP OTT.",
      },
      {
        title: "Ανοίξτε την εφαρμογή",
        description: `Εκκινήστε την εφαρμογή ${appName}.`,
      },
      {
        title: "Προσθέστε playlist / λογαριασμό",
        description:
          'Αναζητήστε "Add playlist", "Xtream Codes", "M3U URL" ή "Remote URL".',
      },
      {
        title: "Εισάγετε τα στοιχεία",
        description:
          "Συμπληρώστε ή επικολλήστε τα στοιχεία ακριβώς όπως σας στάλθηκαν και επιβεβαιώστε.",
      },
    ],
    success: "Τέλος! Τα κανάλια σας είναι έτοιμα για παρακολούθηση.",
  };
}
