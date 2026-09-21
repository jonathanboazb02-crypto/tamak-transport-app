import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { vehiculeId, gpsTerminalId } = await req.json();
  const vehicule = await prisma.vehicule.update({
    where: { id: vehiculeId },
    data: { gpsTerminalId: gpsTerminalId || null },
  });
  return NextResponse.json(vehicule);
}