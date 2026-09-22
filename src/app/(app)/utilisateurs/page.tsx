import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { CreerCompteForm } from "./CreerCompteForm";
import { UtilisateurActions } from "./UtilisateurActions";
import { format } from "date-fns";

// L'accès à cette page est déjà filtré par le middleware (section 5 : Utilisateurs = Direction uniquement)
export default async function UtilisateursPage() {
  const [utilisateurs, employesSansCompte] = await Promise.all([
    prisma.utilisateur.findMany({ include: { employe: true }, orderBy: { createdAt: "desc" } }),
    prisma.employe.findMany({ where: { utilisateur: null, actif: true }, orderBy: { nom: "asc" } }),
  ]);

  const lignes = utilisateurs.map((u) => [
    u.employe ? `${u.employe.prenom} ${u.employe.nom}` : "— (aucun membre lié)",
    u.email,
    u.role,
    u.categorie,
    u.actif ? "Actif" : "Désactivé",
    u.derniereConnexion ? format(u.derniereConnexion, "dd/MM/yyyy HH:mm") : "Jamais connecté",
    <UtilisateurActions
      key={u.id}
      utilisateur={{ id: u.id, email: u.email, role: u.role, categorie: u.categorie, actif: u.actif }}
    />,
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-tamak-navy">Utilisateurs</h1>
      <p className="text-sm text-gray-500">
        Gestion des comptes d'accès à l'application. Aucun utilisateur ne peut se connecter sans un rôle attribué.
        Section réservée à la Direction.
      </p>

      <CreerCompteForm
        employesSansCompte={employesSansCompte.map((e) => ({
          id: e.id,
          label: `${e.prenom} ${e.nom} — ${e.role}`,
        }))}
      />

      <DataTable
        colonnes={["Employé", "E-mail", "Rôle", "Catégorie", "Statut", "Dernière connexion", "Action"]}
        lignes={lignes}
      />
    </div>
  );
}