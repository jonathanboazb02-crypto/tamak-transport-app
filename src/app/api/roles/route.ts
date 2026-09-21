import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function GET() {
  const roles = await prisma.role.findMany({ orderBy: [{ categorie: "asc" }, { nom: "asc" }] });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  // La gestion des rôles est un réglage d'organisation, réservé à la Direction (comme "Paramètres")
  if (!categorie || !peutEcrire(categorie, "parametres")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  try {
    const role = await prisma.role.create({ data: { nom: body.nom, categorie: body.categorie } });
    return NextResponse.json(role, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ce rôle existe déjà dans cette catégorie." }, { status: 400 });
  }
}