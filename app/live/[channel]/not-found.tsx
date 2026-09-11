import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ChannelNotFound() {
  return (
    <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center pt-28 pb-20 text-center">
      <p className="font-display text-3xl text-white">Channel not found</p>
      <p className="mt-3 max-w-md text-text-muted">
        This live channel is unavailable or the link is invalid.
      </p>
      <div className="mt-8">
        <Button href="/live">Back to Live TV</Button>
      </div>
      <Link href="/" className="mt-4 text-sm text-text-dim hover:text-gold">
        Go home
      </Link>
    </div>
  );
}
