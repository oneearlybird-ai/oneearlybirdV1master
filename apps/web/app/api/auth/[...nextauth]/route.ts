import NextAuth, { NextAuthOptions, type Session, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

export const runtime = "nodejs";

type TokenWithEmail = JWT & { userEmail?: string };

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        const email = (credentials?.email || "").trim();
        const password = credentials?.password || "";
        const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!looksEmail) return null;
        if (password !== "demo") return null; // demo-only; replace with real auth later
        const name = email.split("@")[0];
        return { id: email, email, name } as User;
      }
    })
  ],
  pages: { signIn: "/login" },
  callbacks: {
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
