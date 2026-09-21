import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutLire, Categorie } from "@/lib/rbac";

export async function GET() {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutLire(categorie, "courses")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const tarifs = await prisma.tarifCourse.findMany({ orderBy: { codeCourse: "asc" } });
  return NextResponse.json(tarifs);
}