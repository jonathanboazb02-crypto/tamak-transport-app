import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { nouveauMotDePasse } = await req.json();
  if (!nouveauMotDePasse || nouveauMotDePasse.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }

  const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({
    where: { id: session.user.id },
    data: { motDePasse: motDePasseHash, doitChangerMotDePasse: false },
  });

  return NextResponse.json({ success: true });
}