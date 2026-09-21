import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  try {
    const vehicule = await prisma.vehicule.update({
      where: { id: params.id },
      data: {
        matricule: body.matricule ?? undefined,
        code: body.code ?? undefined,
        marque: body.marque !== undefined ? (body.marque || null) : undefined,
        modele: body.modele !== undefined ? (body.modele || null) : undefined,
        capacite: body.capacite !== undefined ? (body.capacite ? Number(body.capacite) : null) : undefined,
        statut: body.statut ?? undefined,
        chauffeurHabituelId: body.chauffeurHabituelId !== undefined ? (body.chauffeurHabituelId || null) : undefined,
        photo: body.photo !== undefined ? (body.photo || null) : undefined,
      },
    });
    return NextResponse.json(vehicule);
  } catch {
    return NextResponse.json({ error: "Modification impossible (matricule ou code déjà utilisé ?)." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    await prisma.vehicule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    // Erreur de contrainte : des courses ou des enregistrements carburant existent encore pour ce véhicule
    if (e.code === "P2003" || e.code === "P2014") {
      return NextResponse.json(
        { error: "Impossible de supprimer ce véhicule : des courses ou des enregistrements carburant lui sont encore rattachés." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}