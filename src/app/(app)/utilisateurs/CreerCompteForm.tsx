"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export function CreerCompteForm({ employesSansCompte }: { employesSansCompte: Option[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState<{ email: string; motDePasseTemporaire: string } | null>(null);
  const [form, setForm] = useState({ employeId: employesSansCompte[0]?.id ?? "", email: "" });

  if (employesSansCompte.length === 0 && !resultat) {
    return (
      <p className="text-sm text-gray-500 mb-4">
        Tous les membres de l'équipe ont déjà un compte. Ajoute d'abord une personne dans le module « Équipe »
        pour pouvoir lui créer un accès.
      </p>
    );
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/utilisateurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.error || "Impossible de créer ce compte.");
      return;
    }
    setResultat(data);
    router.refresh();
  }

  return (
    <div className="mb-4">
      {!resultat && (
        <button onClick={() => setOuvert(!ouvert)} className="bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold">
          {ouvert ? "Annuler" : "+ Créer un compte utilisateur"}
        </button>
      )}

      {resultat && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4">
          <p className="font-semibold text-green-800 mb-2">Compte créé avec succès.</p>
          <p className="text-sm text-gray-700">
            Communique ces identifiants à la personne concernée — ils ne seront plus affichés ensuite :
          </p>
          <p className="mt-2 text-sm font-mono bg-white border rounded-lg px-3 py-2 inline-block">
            {resultat.email} / {resultat.motDePasseTemporaire}
          </p>
          <div className="mt-3">
            <button
              onClick={() => { setResultat(null); setOuvert(false); }}
              className="text-sm text-tamak-navy underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {ouvert && !resultat && (
        <form onSubmit={envoyer} className="mt-4 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.employeId}
            onChange={(e) => setForm({ ...form, employeId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
            {employesSansCompte.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <input required type="email" placeholder="E-mail de connexion" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <p className="text-xs text-gray-500 sm:col-span-2">
            Un mot de passe temporaire sera généré automatiquement et affiché une seule fois après validation.
          </p>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Créer le compte
          </button>
        </form>
      )}
    </div>
  );
}