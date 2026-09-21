"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redimensionnerImage } from "@/lib/image";

export function AjoutEmployeForm({ peutEcrire, rolesParCategorie }: { peutEcrire: boolean; rolesParCategorie: Record<string, string[]> }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [apercu, setApercu] = useState<string | null>(null);
  const [apercuPermis, setApercuPermis] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: "", postNom: "", prenom: "", sexe: "M", categorie: "CHAUFFEURS",
    role: rolesParCategorie.CHAUFFEURS?.[0] ?? "", email: "", telephone: "", photo: "",
    numeroPermis: "", categoriesPermis: "", photoPermis: "",
  });

  if (!peutEcrire) return null;

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const base64 = await redimensionnerImage(fichier, 200);
    setForm({ ...form, photo: base64 });
    setApercu(base64);
  }

  async function choisirPhotoPermis(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const base64 = await redimensionnerImage(fichier, 500);
    setForm({ ...form, photoPermis: base64 });
    setApercuPermis(base64);
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/equipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Impossible d'ajouter ce membre de l'équipe.");
      return;
    }
    setOuvert(false);
    setApercu(null);
    setApercuPermis(null);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button onClick={() => setOuvert(!ouvert)} className="bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold">
        {ouvert ? "Annuler" : "+ Ajouter un membre de l'équipe"}
      </button>

      {ouvert && (
        <form onSubmit={envoyer} className="mt-4 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex items-center gap-3">
            {apercu ? (
              <img src={apercu} alt="Aperçu" className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">Photo</div>
            )}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Photo du visage</label>
              <input type="file" accept="image/*" onChange={choisirPhoto} className="text-sm" />
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
          </select>
          <input type="email" placeholder="E-mail (Gmail)" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Numéro de téléphone" value={form.telephone}
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
                {apercuPermis && <img src={apercuPermis} alt="Permis" className="w-32 rounded border" />}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Photo du permis (recto)</label>
                  <input type="file" accept="image/*" onChange={choisirPhotoPermis} className="text-sm" />
                </div>
              </div>
            </>
          )}

          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}