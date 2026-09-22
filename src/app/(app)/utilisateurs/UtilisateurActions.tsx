"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";

type Utilisateur = {
  id: string;
  email: string;
  role: string;
  categorie: string;
  actif: boolean;
};

export function UtilisateurActions({ utilisateur }: { utilisateur: Utilisateur }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({
    email: utilisateur.email,
    role: utilisateur.role,
    categorie: utilisateur.categorie,
    actif: utilisateur.actif,
    nouveauMotDePasse: "",
  });
  const [erreur, setErreur] = useState("");

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch(`/api/utilisateurs/${utilisateur.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error || "Modification impossible.");
      return;
    }
    setOuvert(false);
    setForm({ ...form, nouveauMotDePasse: "" });
    router.refresh();
  }

  async function supprimer() {
    if (!window.confirm(`Supprimer définitivement le compte ${utilisateur.email} ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/utilisateurs/${utilisateur.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Suppression impossible.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => setOuvert(true)} className="text-xs text-tamak-navy border border-tamak-navy rounded-full px-3 py-1">
        Modifier
      </button>
      <button onClick={supprimer} className="text-xs text-red-600 border border-red-300 rounded-full px-3 py-1">
        Supprimer
      </button>

      <Modal ouvert={ouvert} onFermer={() => setOuvert(false)} titre={`Modifier le compte ${utilisateur.email}`}>
        <form onSubmit={enregistrer} className="grid grid-cols-1 gap-3">
          <label className="text-sm">
            E-mail de connexion
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            Catégorie
            <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
              <option value="DIRECTION">Direction</option>
              <option value="GESTION">Gestion</option>
              <option value="CHAUFFEURS">Chauffeurs</option>
              <option value="TECHNICIENS">Techniciens</option>
            </select>
          </label>
          <label className="text-sm">
            Rôle (libellé)
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
            Compte actif
          </label>

          <div className="border-t pt-3 mt-1">
            <label className="text-sm">
              Nouveau mot de passe <span className="text-gray-400">(laisser vide pour ne pas le changer)</span>
              <input type="text" value={form.nouveauMotDePasse}
                onChange={(e) => setForm({ ...form, nouveauMotDePasse: e.target.value })}
                placeholder="8 caractères minimum"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </label>
            <p className="text-xs text-gray-400 mt-1">
              La personne devra le confirmer (le changer) à sa prochaine connexion.
            </p>
          </div>

          {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
          <button type="submit" className="bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer les modifications
          </button>
        </form>
      </Modal>
    </div>
  );
}