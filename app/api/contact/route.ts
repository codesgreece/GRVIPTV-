import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/send-contact-email";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Συμπληρώστε όλα τα πεδία της φόρμας." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Μη έγκυρο email." }, { status: 400 });
  }

  if (name.length > 120 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { error: "Το μήνυμα είναι πολύ μεγάλο." },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail({ name, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Η αποστολή email δεν έχει ρυθμιστεί ακόμα στον server. Επικοινωνήστε μας στο Telegram.",
        },
        { status: 503 },
      );
    }

    console.error("Contact form email failed:", error);
    return NextResponse.json(
      { error: "Αποτυχία αποστολής. Δοκιμάστε ξανά ή στείλτε Telegram." },
      { status: 500 },
    );
  }
}
