import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

// Récupère les paramètres, ou crée la ligne par défaut si elle n'existe pas encore
export async function GET() {
  const parametres = await prisma.parametresEntreprise.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(parametres);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;

  // Section 5 du cahier des charges : module "Paramètres" = Direction uniquement
  if (!categorie || !peutEcrire(categorie, "parametres")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parametres = await prisma.parametresEntreprise.upsert({
    where: { id: "singleton" },
    update: {
      nom: body.nom,
      rccm: body.rccm,
      idNat: body.idNat,
      nif: body.nif,
      adresse: body.adresse,
      email: body.email,
      devise: body.devise,
    },
    create: { id: "singleton", ...body },
  });
  return NextResponse.json(parametres);
}