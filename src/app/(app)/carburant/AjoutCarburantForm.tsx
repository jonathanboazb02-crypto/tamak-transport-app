"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export function AjoutCarburantForm({ peutEcrire, vehicules }: { peutEcrire: boolean; vehicules: Option[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    vehiculeId: vehicules[0]?.id ?? "",
    dateChargement: "",
    dateFin: "",
    quantiteLitres: "100",
    prixLitre: "1.3",
    nombreCourses: "",
    observations: "",
  });

  if (!peutEcrire) return null;

  const montant = (Number(form.quantiteLitres) || 0) * (Number(form.prixLitre) || 0);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/carburant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Impossible d'enregistrer cette entrée.");
      return;
    }
    setOuvert(false);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button onClick={() => setOuvert(!ouvert)} className="bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold">
        {ouvert ? "Annuler" : "+ Nouvel enregistrement carburant"}
      </button>

      {ouvert && (
        <form onSubmit={envoyer} className="mt-4 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.vehiculeId}
            onChange={(e) => setForm({ ...form, vehiculeId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
            {vehicules.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <input required type="date" placeholder="Date de chargement" value={form.dateChargement}
            onChange={(e) => setForm({ ...form, dateChargement: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" placeholder="Date de fin" value={form.dateFin}
            onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="0.1" placeholder="Quantité (litres)" value={form.quantiteLitres}
            onChange={(e) => setForm({ ...form, quantiteLitres: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="0.01" placeholder="Prix / litre (USD)" value={form.prixLitre}
            onChange={(e) => setForm({ ...form, prixLitre: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Nombre de courses" value={form.nombreCourses}
            onChange={(e) => setForm({ ...form, nombreCourses: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Observations" value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <p className="text-sm text-gray-500 sm:col-span-2">
            Montant total calculé automatiquement : <span className="font-semibold text-tamak-navy">{montant.toFixed(2)} USD</span>
          </p>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}