import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function GET() {
  const employes = await prisma.employe.findMany({ orderBy: [{ categorie: "asc" }, { nom: "asc" }] });
  return NextResponse.json(employes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "equipe")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const employe = await prisma.employe.create({
    data: {
      nom: body.nom,
      postNom: body.postNom || null,
      prenom: body.prenom,
      sexe: body.sexe,
      role: body.role,
      categorie: body.categorie,
      email: body.email || null,
      telephone: body.telephone || null,
      photo: body.photo || null,
      numeroPermis: body.numeroPermis || null,
      categoriesPermis: body.categoriesPermis || null,
      photoPermis: body.photoPermis || null,
    },
  });
  return NextResponse.json(employe, { status: 201 });
}