import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const vehiculeId = req.nextUrl.searchParams.get("vehiculeId");
  const enregistrements = await prisma.carburant.findMany({
    where: vehiculeId ? { vehiculeId } : undefined,
    include: { vehicule: true, chauffeur: true },
    orderBy: { dateChargement: "desc" },
  });
  return NextResponse.json(enregistrements);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "carburant")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const quantite = Number(body.quantiteLitres);
  const prix = Number(body.prixLitre);

  const enregistrement = await prisma.carburant.create({
    data: {
      vehiculeId: body.vehiculeId,
      chauffeurId: body.chauffeurId || null,
      dateChargement: new Date(body.dateChargement),
      dateFin: body.dateFin ? new Date(body.dateFin) : null,
      quantiteLitres: quantite,
      prixLitre: prix,
      montantTotal: quantite * prix,
      nombreCourses: Number(body.nombreCourses) || 0,
      observations: body.observations || null,
    },
  });
  return NextResponse.json(enregistrement, { status: 201 });
}
