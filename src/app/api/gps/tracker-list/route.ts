import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutEcrire, Categorie } from "@/lib/rbac";
import { listerTraceurs } from "@/lib/navixy";

export async function GET() {
  const session = await getServerSession(authOptions);
  const categorie = session?.user?.categorie as Categorie | undefined;
  if (!categorie || !peutEcrire(categorie, "vehicules")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const traceurs = await listerTraceurs();
    return NextResponse.json(traceurs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur Navixy" }, { status: 502 });
  }
}