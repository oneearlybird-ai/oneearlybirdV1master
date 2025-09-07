import NextAuth, { NextAuthOptions, type Session, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

export const runtime = "nodejs";

type TokenWithEmail = JWT & { userEmail?: string };

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
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
        if (password !== "demo") return null; // demo-only; replace later
        const name = email.split("@")[0];
        return { id: email, email, name } as User;
      }
    }),
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
          })
        ]
      : [])
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
