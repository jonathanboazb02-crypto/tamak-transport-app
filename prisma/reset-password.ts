// À exécuter UNE SEULE FOIS : npx tsx prisma/reset-password.ts
// Réinitialise le mot de passe du compte indiqué ci-dessous avec un mot de
// passe temporaire connu. Le compte devra le changer à la prochaine connexion.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "admin@tamak-transport.cd";
const NOUVEAU_MOT_DE_PASSE_TEMPORAIRE = "TamakReset2026!";

async function main() {
  const motDePasseHash = await bcrypt.hash(NOUVEAU_MOT_DE_PASSE_TEMPORAIRE, 10);

  const utilisateur = await prisma.utilisateur.update({
    where: { email: EMAIL },
    data: {
      motDePasse: motDePasseHash,
      doitChangerMotDePasse: true,
      actif: true,
    },
  });

  console.log(`Mot de passe réinitialisé pour : ${utilisateur.email}`);
  console.log(`Nouveau mot de passe temporaire : ${NOUVEAU_MOT_DE_PASSE_TEMPORAIRE}`);
  console.log("Ce compte devra le changer dès sa prochaine connexion.");
}

main()
  .catch((e) => {
    console.error("Erreur — vérifie que l'adresse e-mail existe bien dans la base :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });