import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Used to keep authorize()'s timing constant whether or not the email exists —
// otherwise a missing user returns instantly while a wrong password waits on
// bcrypt, letting an attacker enumerate which emails have accounts.
const DUMMY_HASH = "$2b$12$iU.Asa6xfMr9SQVO.0zgvOa9Vhqb4j5dzI5xOKCr6rKnZllSqwC56";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required when self-hosting behind a reverse proxy (nginx, etc.) — without
  // this, Auth.js rejects every request because it can't verify the Host
  // header itself, which it otherwise only trusts on platforms like Vercel.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) return null;

        return { id: user.id, email: user.email, name: user.username };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.username = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.username = token.username as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});
