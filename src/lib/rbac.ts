// Contrôle d'accès basé sur les rôles — reflète la matrice de la section 5
// du cahier des charges TAMAK Transport.

export type Categorie = "DIRECTION" | "GESTION" | "CHAUFFEURS" | "TECHNICIENS";

export type Module =
  | "accueil"
  | "dashboard"
  | "vehicules"
  | "carburant"
  | "courses"
  | "equipe"
  | "analyse"
  | "utilisateurs"
  | "parametres";

type Niveau = "aucun" | "lecture" | "ecriture";

const MATRICE: Record<Module, Record<Categorie, Niveau>> = {
  accueil:      { DIRECTION: "lecture",  GESTION: "lecture",  CHAUFFEURS: "lecture",  TECHNICIENS: "lecture" },
  dashboard:    { DIRECTION: "ecriture", GESTION: "lecture",  CHAUFFEURS: "aucun",    TECHNICIENS: "aucun" },
  vehicules:    { DIRECTION: "ecriture", GESTION: "lecture",  CHAUFFEURS: "lecture",  TECHNICIENS: "lecture" },
  carburant:    { DIRECTION: "ecriture", GESTION: "ecriture", CHAUFFEURS: "ecriture", TECHNICIENS: "aucun" },
  courses:      { DIRECTION: "ecriture", GESTION: "ecriture", CHAUFFEURS: "ecriture", TECHNICIENS: "aucun" },
  equipe:       { DIRECTION: "ecriture", GESTION: "lecture",  CHAUFFEURS: "lecture",  TECHNICIENS: "lecture" },
  analyse:      { DIRECTION: "ecriture", GESTION: "aucun",    CHAUFFEURS: "aucun",    TECHNICIENS: "aucun" },
  utilisateurs: { DIRECTION: "ecriture", GESTION: "aucun",    CHAUFFEURS: "aucun",    TECHNICIENS: "aucun" },
  parametres:   { DIRECTION: "ecriture", GESTION: "aucun",    CHAUFFEURS: "aucun",    TECHNICIENS: "aucun" },
};

export function peutLire(categorie: Categorie, module: Module): boolean {
  const niveau = MATRICE[module][categorie];
  return niveau === "lecture" || niveau === "ecriture";
}

export function peutEcrire(categorie: Categorie, module: Module): boolean {
  return MATRICE[module][categorie] === "ecriture";
}