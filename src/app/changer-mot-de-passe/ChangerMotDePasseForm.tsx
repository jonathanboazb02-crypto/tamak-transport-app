"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function ChangerMotDePasseForm() {
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMotDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setChargement(true);
    const res = await fetch("/api/utilisateurs/changer-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nouveauMotDePasse }),
    });
    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error || "Impossible de changer le mot de passe.");
      return;
    }

    // On reconnecte l'utilisateur pour que la session reflète le nouveau statut
    signOut({ callbackUrl: "/login?motdepasse=change" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          required
          value={nouveauMotDePasse}
          onChange={(e) => setNouveauMotDePasse(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tamak-navy"
          placeholder="8 caractères minimum"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tamak-navy"
          placeholder="••••••••"
        />
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button
        type="submit"
        disabled={chargement}
        className="w-full rounded-lg bg-tamak-navy text-white font-semibold py-3 hover:opacity-90 transition disabled:opacity-50"
      >
        {chargement ? "Enregistrement..." : "Valider le nouveau mot de passe"}
      </button>
    </form>
  );
}