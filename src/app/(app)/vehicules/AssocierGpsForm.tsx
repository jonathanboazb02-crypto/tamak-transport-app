"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Traceur = { id: number; label: string };

export function AssocierGpsForm({ vehiculeId, gpsTerminalIdActuel }: { vehiculeId: string; gpsTerminalIdActuel: string | null }) {
  const router = useRouter();
  const [traceurs, setTraceurs] = useState<Traceur[] | null>(null);
  const [valeur, setValeur] = useState(gpsTerminalIdActuel ?? "");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function chargerTraceurs() {
    setChargement(true);
    setErreur("");
    const res = await fetch("/api/gps/tracker-list");
    const data = await res.json();
    setChargement(false);
    if (!res.ok) {
      setErreur(data.error || "Impossible de charger la liste des traceurs Navixy.");
      return;
    }
    setTraceurs(data);
  }

  async function enregistrer() {
    setErreur("");
    const res = await fetch("/api/vehicules/gps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehiculeId, gpsTerminalId: valeur }),
    });
    if (!res.ok) {
      setErreur("Impossible d'enregistrer l'association.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {traceurs ? (
          <select value={valeur} onChange={(e) => setValeur(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="">— Aucun —</option>
            {traceurs.map((t) => (
              <option key={t.id} value={t.id}>{t.label} (#{t.id})</option>
            ))}
          </select>
        ) : (
          <input
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            placeholder="ID traceur Navixy"
            className="border rounded px-2 py-1 text-xs w-32"
          />
        )}
        <button onClick={enregistrer} className="text-xs bg-tamak-navy text-white rounded px-2 py-1">OK</button>
      </div>
      {!traceurs && (
        <button onClick={chargerTraceurs} disabled={chargement} className="text-xs text-tamak-navy underline text-left">
          {chargement ? "Chargement..." : "Voir la liste des traceurs Navixy"}
        </button>
      )}
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
    </div>
  );
}