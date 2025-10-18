"use client";

import { notFound } from "next/navigation";
import { GoogleOauthCallbackView, type GoogleCallbackIntent } from "@/components/auth/GoogleOauthCallbackView";

const VALID_INTENTS: GoogleCallbackIntent[] = ["signin", "signup"];

export default function GoogleOauthCallbackPage({ params }: { params: { intent: string } }) {
  if (!VALID_INTENTS.includes(params.intent as GoogleCallbackIntent)) {
    notFound();
  }
  return <GoogleOauthCallbackView intent={params.intent as GoogleCallbackIntent} />;
}
