import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 jours
  jwt: { maxAge: 30 * 24 * 60 * 60 }, // 30 jours
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "E-mail", type: "email" },
        motDePasse: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.motDePasse) return null;

        const utilisateur = await prisma.utilisateur.findUnique({
          where: { email: credentials.email },
          include: { employe: true },
        });

        if (!utilisateur || !utilisateur.actif) return null;

        const motDePasseValide = await bcrypt.compare(credentials.motDePasse, utilisateur.motDePasse);
        if (!motDePasseValide) return null;

        await prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { derniereConnexion: new Date() },
        });
        await prisma.journalAcces.create({
          data: { utilisateurId: utilisateur.id, action: "CONNEXION" },
        });

        return {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.employe ? `${utilisateur.employe.prenom} ${utilisateur.employe.nom}` : utilisateur.email,
          role: utilisateur.role,
          categorie: utilisateur.categorie,
          doitChangerMotDePasse: utilisateur.doitChangerMotDePasse,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.categorie = (user as any).categorie;
        token.doitChangerMotDePasse = (user as any).doitChangerMotDePasse;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).categorie = token.categorie;
        (session.user as any).doitChangerMotDePasse = token.doitChangerMotDePasse;
      }
      return session;
    },
  },
};