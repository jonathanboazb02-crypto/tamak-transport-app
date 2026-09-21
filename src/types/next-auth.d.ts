import { Categorie } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      categorie?: Categorie;
      doitChangerMotDePasse?: boolean;
    };
  }
}