"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { redimensionnerImage } from "@/lib/image";

type Option = { id: string; label: string };
type VehiculeData = {
  id: string;
  matricule: string;
  code: string;
  marque: string;
  modele: string;
  capacite: string;
  statut: string;
  chauffeurHabituelId: string;
  photo: string;
};

export function ModifierVehiculeButton({ vehicule, chauffeurs }: { vehicule: VehiculeData; chauffeurs: Option[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState(vehicule);
  const [erreur, setErreur] = useState("");

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const base64 = await redimensionnerImage(fichier, 500);
    setForm({ ...form, photo: base64 });
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch(`/api/vehicules/${vehicule.id}`, {
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
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOuvert(true)} className="text-xs text-tamak-navy border border-tamak-navy rounded-full px-3 py-1">
        Modifier
      </button>

      <Modal ouvert={ouvert} onFermer={() => setOuvert(false)} titre={`Modifier ${vehicule.code}`}>
        <form onSubmit={enregistrer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex items-center gap-3">
            {form.photo ? (
              <img src={form.photo} alt="Aperçu" className="w-24 h-16 object-cover rounded border" />
            ) : (
              <div className="w-24 h-16 bg-gray-100 border rounded flex items-center justify-center text-gray-400 text-xs">Photo</div>
            )}
            <div className="flex flex-col gap-1">
              <input type="file" accept="image/*" onChange={choisirPhoto} className="text-sm" />
              {form.photo && (
                <button type="button" onClick={() => setForm({ ...form, photo: "" })} className="text-xs text-red-600 underline text-left">
                  Retirer la photo
                </button>
              )}
            </div>
          </div>
          <input required placeholder="Matricule" value={form.matricule}
            onChange={(e) => setForm({ ...form, matricule: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Code interne" value={form.code}
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
          <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="ACTIF">Actif</option>
            <option value="EN_ENTRETIEN">En entretien</option>
            <option value="HORS_SERVICE">Hors service</option>
          </select>
          <select value={form.chauffeurHabituelId} onChange={(e) => setForm({ ...form, chauffeurHabituelId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
            <option value="">— Aucun chauffeur habituel —</option>
            {chauffeurs.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer les modifications
          </button>
        </form>
      </Modal>
    </>
  );
}