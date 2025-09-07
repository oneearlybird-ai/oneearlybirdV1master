import Link from "next/link";
export default function ThanksPage() {
  return (
    <main className="p-6">
      <h2>Thanks!</h2>
      <p>Your submission has been received.</p>
      <p><Link href="/">Go back home</Link></p>
    </main>
  );
}
