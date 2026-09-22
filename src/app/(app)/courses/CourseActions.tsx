"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";

type Option = { id: string; label: string; chauffeurHabituelId?: string };
type Tarif = { codeCourse: string; description: string; tarifCdf: number; tarifUsd: number };
type CourseData = {
  id: string;
  codeCourse: string;
  description: string;
  tarifCdf: string;
  tarifUsd: string;
  date: string; // yyyy-MM-dd
  heure: string;
  statutChargement: string;
  vehiculeId: string;
  chauffeurId: string;
  signatureSuperviseur: boolean;
};

export function CourseActions({ course, vehicules, chauffeurs }: { course: CourseData; vehicules: Option[]; chauffeurs: Option[] }) {
  const router = useRouter();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(course);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (modalOuvert && tarifs.length === 0) {
      fetch("/api/tarifs-courses").then((r) => r.json()).then(setTarifs);
    }
  }, [modalOuvert, tarifs.length]);

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

  function choisirVehicule(vehiculeId: string) {
    const vehicule = vehicules.find((v) => v.id === vehiculeId);
    setForm({
      ...form,
      vehiculeId,
      chauffeurId: vehicule?.chauffeurHabituelId || form.chauffeurId,
    });
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error || "Modification impossible.");
      return;
    }
    setModalOuvert(false);
    router.refresh();
  }

  async function supprimer() {
    if (!window.confirm(`Supprimer la course ${course.codeCourse} ? Cette action est irréversible.`)) return;
    await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
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

      <Modal ouvert={modalOuvert} onFermer={() => setModalOuvert(false)} titre={`Modifier la course ${course.codeCourse}`}>
        <form onSubmit={enregistrer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.codeCourse} onChange={(e) => choisirTrajet(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2 font-medium">
            {tarifs.length === 0 && <option value={form.codeCourse}>{form.codeCourse} — {form.description}</option>}
            {tarifs.map((t) => (
              <option key={t.codeCourse} value={t.codeCourse}>{t.codeCourse} — {t.description}</option>
            ))}
          </select>

          <input readOnly value={form.description}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2 bg-gray-50 text-gray-600" />

          <p className="text-sm text-gray-500 sm:col-span-2">
            Tarif du trajet : <span className="font-semibold text-tamak-navy">
              {Number(form.tarifCdf || 0).toLocaleString("fr-FR")} CDF — {Number(form.tarifUsd || 0).toFixed(2)} USD
            </span>
          </p>

          <input required type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={form.heure}
            onChange={(e) => setForm({ ...form, heure: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
          <select value={form.statutChargement} onChange={(e) => setForm({ ...form, statutChargement: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="PLEIN">Plein</option>
            <option value="VIDE">Vide</option>
          </select>
          <select value={form.vehiculeId} onChange={(e) => choisirVehicule(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm">
            {vehicules.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <select value={form.chauffeurId} onChange={(e) => setForm({ ...form, chauffeurId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
            {chauffeurs.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.signatureSuperviseur}
              onChange={(e) => setForm({ ...form, signatureSuperviseur: e.target.checked })} />
            Signée par le superviseur
          </label>
          {erreur && <p className="text-red-600 text-sm sm:col-span-2">{erreur}</p>}
          <button type="submit" className="sm:col-span-2 bg-tamak-gold text-white rounded-lg py-2 text-sm font-semibold">
            Enregistrer les modifications
          </button>
        </form>
      </Modal>
    </div>
  );
}