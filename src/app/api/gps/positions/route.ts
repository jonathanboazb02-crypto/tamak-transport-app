import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutLire, Categorie } from "@/lib/rbac";
import { obtenirEtats } from "@/lib/navixy";

export async function GET() {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutLire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const vehicules = await prisma.vehicule.findMany({
    where: { gpsTerminalId: { not: null } },
  });

  if (vehicules.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const idsNumeriques = vehicules.map((v) => Number(v.gpsTerminalId));
    const etats = await obtenirEtats(idsNumeriques);

    const resultat = vehicules.map((v) => {
      const etat = etats[String(v.gpsTerminalId)];
      return {
        vehiculeId: v.id,
        code: v.code,
        matricule: v.matricule,
        lat: etat?.gps?.location?.lat ?? null,
        lng: etat?.gps?.location?.lng ?? null,
        vitesse: etat?.gps?.speed ?? null,
        statutMouvement: etat?.movement_status ?? null,
        derniereMiseAJour: etat?.last_update ?? null,
      };
    });

    return NextResponse.json(resultat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur Navixy" }, { status: 502 });
  }
}