import NextAuth, { NextAuthOptions, type Session, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

export const runtime = "nodejs";

type TokenWithEmail = JWT & { userEmail?: string };

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const domainAllow = (process.env.GOOGLE_ALLOWED_DOMAINS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

function emailDomainOk(email: string) {
  if (domainAllow.length === 0) return true;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const dom = email.slice(at + 1).toLowerCase();
  return domainAllow.includes(dom);
}

function isGoogleProfile(p: unknown): p is GoogleProfile {
  if (!p || typeof p !== "object") return false;
  const v = (p as { email_verified?: unknown }).email_verified;
  return typeof v === "boolean";
}

const providers = [
  CredentialsProvider({
    name: "Email + Password",
    credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
    async authorize(credentials): Promise<User | null> {
      const email = (credentials?.email || "").trim();
      const password = credentials?.password || "";
      const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!looksEmail) return null;
      if (password !== "demo") return null;
      return { id: email, email, name: email.split("@")[0] } as User;
    }
  }),
  ...(googleEnabled
    ? [
        GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "select_account",
      access_type: "offline",
      response_type: "code"
    }
  }
})
      ]
    : [])
];

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = (user?.email || "").trim();
        if (!email) return false;
        if (!isGoogleProfile(profile) || !profile.email_verified) return false;
        if (!emailDomainOk(email)) return false;
      }
      return true;
    },
    async jwt({ token, user }): Promise<TokenWithEmail> {
      const t = token as TokenWithEmail;
      if (user?.email) t.userEmail = user.email;
      return t;
    },
    async session({ session, token }): Promise<Session> {
      const t = token as TokenWithEmail;
      if (!session.user) session.user = {};
      if (t.userEmail) session.user.email = t.userEmail;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
