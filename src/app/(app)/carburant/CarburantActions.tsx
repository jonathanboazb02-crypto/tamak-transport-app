"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";

type Option = { id: string; label: string };
type CarburantData = {
  id: string;
  vehiculeId: string;
  dateChargement: string; // yyyy-MM-dd
  dateFin: string; // yyyy-MM-dd ou ""
  quantiteLitres: number;
  prixLitre: number;
  nombreCourses: number;
  observations: string;
};

export function CarburantActions({ enregistrement, vehicules }: { enregistrement: CarburantData; vehicules: Option[] }) {
  const router = useRouter();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ ...enregistrement, quantiteLitres: String(enregistrement.quantiteLitres), prixLitre: String(enregistrement.prixLitre), nombreCourses: String(enregistrement.nombreCourses) });
  const [erreur, setErreur] = useState("");

  const montant = (Number(form.quantiteLitres) || 0) * (Number(form.prixLitre) || 0);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch(`/api/carburant/${enregistrement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Modification impossible.");
      return;
    }
    setModalOuvert(false);
    router.refresh();
  }

  async function supprimer() {
    if (!window.confirm("Supprimer cet enregistrement carburant ? Cette action est irréversible.")) return;
    await fetch(`/api/carburant/${enregistrement.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => setModalOuvert(true)} className="text-xs text-tamak-navy border border-tamak-navy rounded-full px-3 py-1">
        Modifier
      </button>
      <button onClick={supprimer} className="text-xs text-red-600 border border-red-300 rounded-full px-3 py-1">
        Supprimer
      </button>

      <Modal ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} titre="Modifier l'enregistrement carburant">
        <form onSubmit={enregistrer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.vehiculeId} onChange={(e) => setForm({ ...form, vehiculeId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
            {vehicules.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <input required type="date" value={form.dateChargement}
            onChange={(e) => setForm({ ...form, dateChargement: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={form.dateFin}
            onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="0.1" placeholder="Quantité (litres)" value={form.quantiteLitres}
            onChange={(e) => setForm({ ...form, quantiteLitres: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="0.01" placeholder="Prix / litre" value={form.prixLitre}
            onChange={(e) => setForm({ ...form, prixLitre: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Nombre de courses" value={form.nombreCourses}
            onChange={(e) => setForm({ ...form, nombreCourses: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Observations" value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <p className="text-sm text-gray-500 sm:col-span-2">
            Montant total : <span className="font-semibold text-tamak-navy">{montant.toFixed(2)} USD</span>
          </p>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer les modifications
          </button>
        </form>
      </Modal>
    </div>
  );
}