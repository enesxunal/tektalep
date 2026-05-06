import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/giris" },
  providers: [
    Credentials({
      name: "Giris",
      credentials: {
        username: { label: "Kullanıcı adı" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        const kullaniciAdi = credentials?.username as string | undefined;
        const sifre = credentials?.password as string | undefined;

        if (!kullaniciAdi?.trim() || !sifre) {
          return null;
        }

        const kullanici = await prisma.user.findUnique({
          where: { username: kullaniciAdi.trim() },
        });

        if (!kullanici) {
          return null;
        }

        const dogruMu = await bcrypt.compare(sifre, kullanici.password);
        if (!dogruMu) {
          return null;
        }

        return {
          id: kullanici.id,
          name: kullanici.name,
          email: `${kullanici.username}@uye.lokal`,
          username: kullanici.username,
          role: kullanici.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (
          user as { username?: string }
        ).username;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
