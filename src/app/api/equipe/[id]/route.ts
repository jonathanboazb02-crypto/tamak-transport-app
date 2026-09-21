import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "equipe")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const employe = await prisma.employe.update({
    where: { id: params.id },
    data: {
      nom: body.nom ?? undefined,
      postNom: body.postNom !== undefined ? (body.postNom || null) : undefined,
      prenom: body.prenom ?? undefined,
      sexe: body.sexe ?? undefined,
      role: body.role ?? undefined,
      categorie: body.categorie ?? undefined,
      email: body.email !== undefined ? (body.email || null) : undefined,
      telephone: body.telephone !== undefined ? (body.telephone || null) : undefined,
      photo: body.photo !== undefined ? (body.photo || null) : undefined,
      numeroPermis: body.numeroPermis !== undefined ? (body.numeroPermis || null) : undefined,
      categoriesPermis: body.categoriesPermis !== undefined ? (body.categoriesPermis || null) : undefined,
      photoPermis: body.photoPermis !== undefined ? (body.photoPermis || null) : undefined,
    },
  });
  return NextResponse.json(employe);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "equipe")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    await prisma.employe.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2003" || e.code === "P2014") {
      return NextResponse.json(
        { error: "Impossible de supprimer : cette personne a encore un compte utilisateur, des courses ou des véhicules qui lui sont rattachés." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}