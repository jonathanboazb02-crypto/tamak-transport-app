"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = { id: string; nom: string; categorie: string };

const LIBELLES: Record<string, string> = {
  DIRECTION: "Direction",
  GESTION: "Gestion",
  CHAUFFEURS: "Chauffeurs",
  TECHNICIENS: "Techniciens",
};

function LigneRole({ role }: { role: Role }) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [nom, setNom] = useState(role.nom);
  const [erreur, setErreur] = useState("");

  async function enregistrer() {
    setErreur("");
    const res = await fetch(`/api/roles/${role.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error || "Modification impossible.");
      return;
    }
    setEdition(false);
    router.refresh();
  }

  async function supprimer() {
    if (!window.confirm(`Supprimer le rôle « ${role.nom} » du catalogue ? Les personnes qui l'ont déjà ne sont pas affectées.`)) return;
    await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-0">
      {edition ? (
        <>
          <input value={nom} onChange={(e) => setNom(e.target.value)} className="border rounded-lg px-2 py-1 text-sm flex-1" />
          <button onClick={enregistrer} className="text-xs bg-tamak-navy text-white rounded-full px-3 py-1">OK</button>
          <button onClick={() => setEdition(false)} className="text-xs text-gray-500">Annuler</button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{role.nom}</span>
          <button onClick={() => setEdition(true)} className="text-xs text-tamak-navy border border-tamak-navy rounded-full px-3 py-1">Renommer</button>
          <button onClick={supprimer} className="text-xs text-red-600 border border-red-300 rounded-full px-3 py-1">Supprimer</button>
        </>
      )}
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
    </div>
  );
}

function AjoutRole({ categorie }: { categorie: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, categorie }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error || "Impossible d'ajouter ce rôle.");
      return;
    }
    setNom("");
    setOuvert(false);
    router.refresh();
  }

  if (!ouvert) {
    return <button onClick={() => setOuvert(true)} className="text-xs text-tamak-navy underline mt-2">+ Ajouter un rôle</button>;
  }

  return (
    <form onSubmit={envoyer} className="flex items-center gap-2 mt-2">
      <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du rôle"
        className="border rounded-lg px-2 py-1 text-sm flex-1" />
      <button type="submit" className="text-xs bg-tamak-gold text-white rounded-full px-3 py-1">Ajouter</button>
      <button type="button" onClick={() => setOuvert(false)} className="text-xs text-gray-500">Annuler</button>
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
    </form>
  );
}

export function GestionRoles({ roles }: { roles: Role[] }) {
  const categories = ["DIRECTION", "GESTION", "CHAUFFEURS", "TECHNICIENS"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <div key={cat} className="bg-white border rounded-xl p-4">
          <h3 className="font-semibold text-tamak-navy mb-2">{LIBELLES[cat]}</h3>
          {roles.filter((r) => r.categorie === cat).map((r) => <LigneRole key={r.id} role={r} />)}
          <AjoutRole categorie={cat} />
        </div>
      ))}
    </div>
  );
}