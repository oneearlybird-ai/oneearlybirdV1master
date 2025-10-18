import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-2" href="/" aria-label="EarlyBird AI">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_12px_30px_rgba(99,102,241,0.25)]">
        <Image src="/brand/icon.svg" alt="EarlyBird icon" width={28} height={28} priority />
      </span>
      <Image src="/brand/wordmark.svg" alt="EarlyBird AI" width={184} height={40} priority className="hidden sm:block" />
      <span className="sm:hidden text-lg font-semibold tracking-tight text-white">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  );
}
