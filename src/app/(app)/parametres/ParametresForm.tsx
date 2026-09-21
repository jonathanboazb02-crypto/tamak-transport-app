"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Parametres = {
  nom: string;
  rccm: string;
  idNat: string;
  nif: string;
  adresse: string;
  email: string;
  devise: string;
};

export function ParametresForm({ parametres }: { parametres: Parametres }) {
  const router = useRouter();
  const [form, setForm] = useState(parametres);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnregistre(false);
    const res = await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Impossible d'enregistrer les paramètres.");
      return;
    }
    setEnregistre(true);
    router.refresh();
  }

  return (
    <form onSubmit={envoyer} className="bg-white rounded-xl border p-5 space-y-4">
      <div>
        <h2 className="font-semibold mb-3">Informations de l'entreprise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            Nom de l'entreprise
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            E-mail de contact
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm sm:col-span-2">
            Adresse
            <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            RCCM
            <input value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            Identification nationale
            <input value={form.idNat} onChange={(e) => setForm({ ...form, idNat: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            NIF
            <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Devise du suivi carburant</h2>
        <select value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="USD">USD</option>
          <option value="CDF">CDF</option>
        </select>
      </div>

      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      {enregistre && <p className="text-green-700 text-sm">Paramètres enregistrés.</p>}

      <button type="submit" className="bg-tamak-gold text-white rounded-lg px-4 py-2 text-sm font-semibold">
        Enregistrer les paramètres
      </button>
    </form>
  );
}