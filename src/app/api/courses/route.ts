import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { chauffeur: true, vehicule: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "courses")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      codeCourse: body.codeCourse,
      description: body.description,
      date: new Date(body.date),
      heure: body.heure,
      statutChargement: body.statutChargement,
      chauffeurId: body.chauffeurId,
      vehiculeId: body.vehiculeId,
      tarifCdf: body.tarifCdf ? Number(body.tarifCdf) : null,
      tarifUsd: body.tarifUsd ? Number(body.tarifUsd) : null,
    },
  });
  return NextResponse.json(course, { status: 201 });
}