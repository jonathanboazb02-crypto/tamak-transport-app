import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";
import bcrypt from "bcryptjs";

// Génère un mot de passe temporaire lisible (à communiquer à l'employé,
// qui devra le changer à sa première connexion)
function genererMotDePasseTemporaire() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let motDePasse = "";
  for (let i = 0; i < 10; i++) {
    motDePasse += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return motDePasse;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;

  // Section 5 du cahier des charges : module "Utilisateurs" = Direction uniquement
  if (!categorie || !peutEcrire(categorie, "utilisateurs")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { employeId, email } = body;

  const employe = await prisma.employe.findUnique({ where: { id: employeId } });
  if (!employe) {
    return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  }

  const motDePasseTemporaire = genererMotDePasseTemporaire();
  const motDePasseHash = await bcrypt.hash(motDePasseTemporaire, 10);

  try {
    await prisma.utilisateur.create({
      data: {
        email,
        motDePasse: motDePasseHash,
        role: employe.role,
        categorie: employe.categorie,
        employeId: employe.id,
      },
    });
  } catch {
    return NextResponse.json({ error: "Cet e-mail est déjà utilisé, ou cet employé a déjà un compte." }, { status: 400 });
  }

  // Le mot de passe temporaire n'est renvoyé qu'une seule fois, à l'écran,
  // pour être communiqué à l'employé — il n'est jamais stocké en clair.
  return NextResponse.json({ email, motDePasseTemporaire }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "utilisateurs")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id, actif } = await req.json();
  const utilisateur = await prisma.utilisateur.update({ where: { id }, data: { actif } });
  await prisma.journalAcces.create({
    data: { utilisateurId: id, action: actif ? "REACTIVATION_COMPTE" : "DESACTIVATION_COMPTE" },
  });
  return NextResponse.json(utilisateur);
}