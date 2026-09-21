import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function GET() {
  const vehicules = await prisma.vehicule.findMany({
    include: { chauffeurHabituel: true },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(vehicules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const vehicule = await prisma.vehicule.create({
    data: {
      matricule: body.matricule,
      code: body.code,
      marque: body.marque || null,
      modele: body.modele || null,
      capacite: body.capacite ? Number(body.capacite) : null,
      photo: body.photo || null,
    },
  });
  return NextResponse.json(vehicule, { status: 201 });
}