import Link from "next/link";
import Image from "next/image";
import LogoLockup from "@/public/brand/header-lockup.png";

export default function Logo() {
  return (
    <Link className="inline-flex items-center" href="/" aria-label="EarlyBird AI">
      <Image
        src={LogoLockup}
        alt="EarlyBird AI"
        priority
        width={368}
        height={123}
        className="h-10 w-auto sm:h-12"
      />
    </Link>
  );
}
