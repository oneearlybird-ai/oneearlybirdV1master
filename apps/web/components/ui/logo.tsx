import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-2" href="/" aria-label="EarlyBird AI">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 shadow-[0_12px_30px_rgba(99,102,241,0.25)]">
        <Image src="/brand/icon.svg" alt="EarlyBird icon" width={24} height={24} priority />
      </span>
      <Image src="/brand/wordmark.svg" alt="EarlyBird AI" width={124} height={24} priority />
    </Link>
  );
}
