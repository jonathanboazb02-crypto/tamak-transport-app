"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string; chauffeurHabituelId?: string };
type Tarif = { codeCourse: string; description: string; tarifCdf: number; tarifUsd: number };

export function AjoutCourseForm({
  peutEcrire,
  vehicules,
  chauffeurs,
}: {
  peutEcrire: boolean;
  vehicules: Option[];
  chauffeurs: Option[];
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [form, setForm] = useState({
    codeCourse: "",
    description: "",
    tarifCdf: "",
    tarifUsd: "",
    date: "",
    heure: "",
    statutChargement: "PLEIN",
    vehiculeId: vehicules[0]?.id ?? "",
    chauffeurId: vehicules[0]?.chauffeurHabituelId || chauffeurs[0]?.id || "",
  });

  useEffect(() => {
    if (ouvert && tarifs.length === 0) {
      fetch("/api/tarifs-courses")
        .then((r) => r.json())
        .then((data: Tarif[]) => {
          setTarifs(data);
          if (data[0]) {
            setForm((f) => ({
              ...f,
              codeCourse: data[0].codeCourse,
              description: data[0].description,
              tarifCdf: String(data[0].tarifCdf),
              tarifUsd: String(data[0].tarifUsd),
            }));
          }
        });
    }
  }, [ouvert, tarifs.length]);

  if (!peutEcrire) return null;

  function choisirTrajet(codeCourse: string) {
    const tarif = tarifs.find((t) => t.codeCourse === codeCourse);
    if (!tarif) return;
    setForm({
      ...form,
      codeCourse: tarif.codeCourse,
      description: tarif.description,
      tarifCdf: String(tarif.tarifCdf),
      tarifUsd: String(tarif.tarifUsd),
    });
  }

  // Sélectionne automatiquement le chauffeur habituel du véhicule choisi,
  // tout en laissant la possibilité de le changer manuellement ensuite.
  function choisirVehicule(vehiculeId: string) {
    const vehicule = vehicules.find((v) => v.id === vehiculeId);
    setForm({
      ...form,
      vehiculeId,
      chauffeurId: vehicule?.chauffeurHabituelId || form.chauffeurId,
    });
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setErreur("Impossible d'enregistrer cette course.");
      return;
    }
    setOuvert(false);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button onClick={() => setOuvert(!ouvert)} className="bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold">
        {ouvert ? "Annuler" : "+ Nouvelle course"}
      </button>

      {ouvert && (
        <form onSubmit={envoyer} className="mt-4 bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.codeCourse} onChange={(e) => choisirTrajet(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2 font-medium">
            {tarifs.map((t) => (
              <option key={t.codeCourse} value={t.codeCourse}>{t.codeCourse} — {t.description}</option>
            ))}
          </select>

          <input readOnly placeholder="Description" value={form.description}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2 bg-gray-50 text-gray-600" />

          <p className="text-sm text-gray-500 sm:col-span-2">
            Tarif du trajet : <span className="font-semibold text-tamak-navy">
              {Number(form.tarifCdf || 0).toLocaleString("fr-FR")} CDF — {Number(form.tarifUsd || 0).toFixed(2)} USD
            </span>
          </p>

          <input required type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="time" value={form.heure}
            onChange={(e) => setForm({ ...form, heure: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <select value={form.statutChargement}
            onChange={(e) => setForm({ ...form, statutChargement: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="PLEIN">Plein</option>
            <option value="VIDE">Vide</option>
          </select>
          <select value={form.vehiculeId}
            onChange={(e) => choisirVehicule(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm">
            {vehicules.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <div className="sm:col-span-2">
            <select value={form.chauffeurId}
              onChange={(e) => setForm({ ...form, chauffeurId: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full">
              {chauffeurs.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Pré-rempli avec le chauffeur habituel du véhicule — modifiable si besoin.</p>
          </div>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer la course
          </button>
        </form>
      )}
    </div>
  );
}