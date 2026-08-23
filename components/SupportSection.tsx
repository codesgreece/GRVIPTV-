import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportSection() {
  return (
    <aside className="glass-card gold-glow sticky top-28 rounded-2xl p-7">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
        <Headphones className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl font-bold text-white">
        Χρειάζεστε Βοήθεια;
      </h3>
      <p className="mt-3 text-text-muted">Είμαστε εδώ για εσάς 24/7</p>
      <Button href="/epikoinonia" fullWidth className="mt-6 tracking-[0.1em] uppercase">
        Επικοινωνήστε Μαζί Μας
      </Button>
    </aside>
  );
}
