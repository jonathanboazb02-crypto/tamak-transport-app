"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { redimensionnerImage } from "@/lib/image";

type EmployeData = {
  id: string;
  nom: string;
  postNom: string;
  prenom: string;
  sexe: string;
  role: string;
  categorie: string;
  email: string;
  telephone: string;
  photo: string;
  numeroPermis: string;
  categoriesPermis: string;
  photoPermis: string;
};

export function EmployeActions({ employe, rolesParCategorie }: { employe: EmployeData; rolesParCategorie: Record<string, string[]> }) {
  const router = useRouter();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(employe);
  const [erreur, setErreur] = useState("");

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const base64 = await redimensionnerImage(fichier, 200);
    setForm({ ...form, photo: base64 });
  }

  async function choisirPhotoPermis(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const base64 = await redimensionnerImage(fichier, 500);
    setForm({ ...form, photoPermis: base64 });
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch(`/api/equipe/${employe.id}`, {
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
    if (!window.confirm(`Supprimer ${employe.prenom} ${employe.nom} de l'équipe ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/equipe/${employe.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Suppression impossible.");
      return;
    }
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

      <Modal ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} titre={`Modifier ${employe.prenom} ${employe.nom}`}>
        <form onSubmit={enregistrer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex items-center gap-3">
            {form.photo ? (
              <img src={form.photo} alt="Aperçu" className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">Photo</div>
            )}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Photo du visage</label>
              <input type="file" accept="image/*" onChange={choisirPhoto} className="text-sm" />
              {form.photo && (
                <button type="button" onClick={() => setForm({ ...form, photo: "" })} className="text-xs text-red-600 underline block mt-1">
                  Retirer la photo
                </button>
              )}
            </div>
          </div>
          <input required placeholder="Nom" value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Post-nom" value={form.postNom}
            onChange={(e) => setForm({ ...form, postNom: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Prénom" value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          <select value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value, role: rolesParCategorie[e.target.value]?.[0] ?? "" })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="DIRECTION">Direction</option>
            <option value="GESTION">Gestion</option>
            <option value="CHAUFFEURS">Chauffeurs</option>
            <option value="TECHNICIENS">Techniciens</option>
          </select>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            {(rolesParCategorie[form.categorie] ?? []).map((r) => <option key={r} value={r}>{r}</option>)}
            {!rolesParCategorie[form.categorie]?.includes(form.role) && <option value={form.role}>{form.role}</option>}
          </select>
          <input type="email" placeholder="E-mail" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Téléphone" value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />

          {form.categorie === "CHAUFFEURS" && (
            <>
              <div className="sm:col-span-2 border-t pt-3 mt-1">
                <p className="text-sm font-semibold text-tamak-navy mb-2">Permis de conduire</p>
              </div>
              <input placeholder="Numéro du permis" value={form.numeroPermis}
                onChange={(e) => setForm({ ...form, numeroPermis: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Catégories (ex: B, C1, C, BE, CE)" value={form.categoriesPermis}
                onChange={(e) => setForm({ ...form, categoriesPermis: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm" />
              <div className="sm:col-span-2 flex items-center gap-3">
                {form.photoPermis && <img src={form.photoPermis} alt="Permis" className="w-32 rounded border" />}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Photo du permis (recto)</label>
                  <input type="file" accept="image/*" onChange={choisirPhotoPermis} className="text-sm" />
                  {form.photoPermis && (
                    <button type="button" onClick={() => setForm({ ...form, photoPermis: "" })} className="text-xs text-red-600 underline block mt-1">
                      Retirer la photo
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer les modifications
          </button>
        </form>
      </Modal>
    </div>
  );
}