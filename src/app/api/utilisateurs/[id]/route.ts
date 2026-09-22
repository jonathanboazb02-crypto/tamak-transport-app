import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "utilisateurs")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {
    email: body.email ?? undefined,
    role: body.role ?? undefined,
    categorie: body.categorie ?? undefined,
    actif: body.actif !== undefined ? body.actif : undefined,
  };

  // Le nouveau mot de passe n'est appliqué que si la Direction en a saisi un
  if (body.nouveauMotDePasse) {
    data.motDePasse = await bcrypt.hash(body.nouveauMotDePasse, 10);
    data.doitChangerMotDePasse = true; // la personne devra le confirmer/changer à sa prochaine connexion
  }

  try {
    const utilisateur = await prisma.utilisateur.update({ where: { id: params.id }, data });
    return NextResponse.json(utilisateur);
  } catch {
    return NextResponse.json({ error: "Modification impossible (e-mail déjà utilisé ?)." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "utilisateurs")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.utilisateur.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}