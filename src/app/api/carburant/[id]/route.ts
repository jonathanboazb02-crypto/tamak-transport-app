import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "carburant")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const quantite = Number(body.quantiteLitres);
  const prix = Number(body.prixLitre);

  const enregistrement = await prisma.carburant.update({
    where: { id: params.id },
    data: {
      vehiculeId: body.vehiculeId,
      dateChargement: new Date(body.dateChargement),
      dateFin: body.dateFin ? new Date(body.dateFin) : null,
      quantiteLitres: quantite,
      prixLitre: prix,
      montantTotal: quantite * prix,
      nombreCourses: Number(body.nombreCourses) || 0,
      observations: body.observations || null,
    },
  });
  return NextResponse.json(enregistrement);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "carburant")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.carburant.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}