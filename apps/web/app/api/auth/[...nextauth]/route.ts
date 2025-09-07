import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const runtime = "nodejs";

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
      async authorize(credentials) {
        const email = credentials?.email?.trim() || "";
        const password = credentials?.password || "";
        const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!looksEmail) return null;
        if (password !== "demo") return null;
        return { id: email, email, name: email.split("@")[0] };
      }
    })
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = { email: (user as any).email as string };
      return token;
    },
    async session({ session, token }) {
      if ((token as any)?.user) (session as any).user = (token as any).user;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
