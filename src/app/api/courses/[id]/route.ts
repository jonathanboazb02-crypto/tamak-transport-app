import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "courses")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  try {
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        codeCourse: body.codeCourse,
        description: body.description,
        date: new Date(body.date),
        heure: body.heure || null,
        statutChargement: body.statutChargement,
        vehiculeId: body.vehiculeId,
        chauffeurId: body.chauffeurId,
        signatureSuperviseur: body.signatureSuperviseur,
        tarifCdf: body.tarifCdf ? Number(body.tarifCdf) : null,
        tarifUsd: body.tarifUsd ? Number(body.tarifUsd) : null,
      },
    });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "Modification impossible." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "courses")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}