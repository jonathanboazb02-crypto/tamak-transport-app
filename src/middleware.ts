import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { peutLire, Categorie, Module } from "@/lib/rbac";

// Correspondance entre segment d'URL et module (matrice section 5)
const ROUTE_MODULE: Record<string, Module> = {
  accueil: "accueil",
  dashboard: "dashboard",
  vehicules: "vehicules",
  carburant: "carburant",
  courses: "courses",
  equipe: "equipe",
  analyse: "analyse",
  utilisateurs: "utilisateurs",
  parametres: "parametres",
};

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true,
  });

  // --- Diagnostic temporaire : à retirer une fois le problème résolu ---
  console.log("[middleware] secret présent :", !!process.env.NEXTAUTH_SECRET);
  console.log("[middleware] token décodé :", token);
  // ----------------------------------------------------------------------

  // Aucun accès sans compte et sans rôle attribué
  if (!token) {
    const urlConnexion = new URL("/login", req.url);
    urlConnexion.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(urlConnexion);
  }

  const categorie = token.categorie as Categorie | undefined;
  const doitChangerMotDePasse = token.doitChangerMotDePasse as boolean | undefined;
  const pathname = req.nextUrl.pathname;

  // Tant que le mot de passe temporaire n'a pas été changé, on bloque tout le reste
  if (doitChangerMotDePasse && pathname !== "/changer-mot-de-passe") {
    return NextResponse.redirect(new URL("/changer-mot-de-passe", req.url));
  }

  const segment = pathname.split("/")[1];
  const module = ROUTE_MODULE[segment];

  if (module && categorie && !peutLire(categorie, module)) {
    return NextResponse.redirect(new URL("/dashboard?acces=refuse", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/changer-mot-de-passe",
    "/accueil/:path*",
    "/dashboard/:path*",
    "/vehicules/:path*",
    "/carburant/:path*",
    "/courses/:path*",
    "/equipe/:path*",
    "/analyse/:path*",
    "/utilisateurs/:path*",
    "/parametres/:path*",
  ],
};