import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
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

export default withAuth(
  function middleware(req) {
    const categorie = req.nextauth.token?.categorie as Categorie | undefined;
    const doitChangerMotDePasse = req.nextauth.token?.doitChangerMotDePasse as boolean | undefined;
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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // aucun accès sans compte et sans rôle attribué
    },
  }
);

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