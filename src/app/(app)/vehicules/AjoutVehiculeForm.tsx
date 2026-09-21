"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AjoutVehiculeForm({ peutEcrire }: { peutEcrire: boolean }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({ matricule: "", code: "", marque: "", modele: "", capacite: "" });
  const [erreur, setErreur] = useState("");

  if (!peutEcrire) return null;

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/vehicules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Impossible d'ajouter ce véhicule (matricule/code déjà utilisé ?).");
      return;
    }
    setForm({ matricule: "", code: "", marque: "", modele: "", capacite: "" });
    setOuvert(false);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold"
      >
        {ouvert ? "Annuler" : "+ Ajouter un véhicule"}
      </button>

      {ouvert && (
        <form onSubmit={envoyer} className="mt-4 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Matricule (ex: CD-1234-KIN)" value={form.matricule}
            onChange={(e) => setForm({ ...form, matricule: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Code interne (ex: VH-003)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Marque" value={form.marque}
            onChange={(e) => setForm({ ...form, marque: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Modèle" value={form.modele}
            onChange={(e) => setForm({ ...form, modele: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Capacité (casiers)" value={form.capacite}
            onChange={(e) => setForm({ ...form, capacite: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
