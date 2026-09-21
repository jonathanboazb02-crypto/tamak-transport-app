import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "parametres")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  try {
    const role = await prisma.role.update({ where: { id: params.id }, data: { nom: body.nom } });
    return NextResponse.json(role);
  } catch {
    return NextResponse.json({ error: "Ce nom de rôle existe déjà dans cette catégorie." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "parametres")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.role.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}