"use client";

import { useEffect, useState } from "react";

type Position = {
  vehiculeId: string;
  code: string;
  matricule: string;
  lat: number | null;
  lng: number | null;
  vitesse: number | null;
  statutMouvement: string | null;
  derniereMiseAJour: string | null;
};

export function PositionsGpsLive() {
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [erreur, setErreur] = useState("");

  async function charger() {
    const res = await fetch("/api/gps/positions");
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.error || "Impossible de récupérer les positions.");
      return;
    }
    setErreur("");
    setPositions(data);
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 30000); // rafraîchit toutes les 30s
    return () => clearInterval(intervalle);
  }, []);

  if (erreur) {
    return <p className="text-sm text-red-600">{erreur}</p>;
  }

  if (positions === null) {
    return <p className="text-sm text-gray-400">Chargement des positions...</p>;
  }

  if (positions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucun véhicule n'est encore relié à un traceur Navixy. Associe un traceur depuis le module
        « Nos véhicules » pour voir les positions ici.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {positions.map((p) => (
        <div key={p.vehiculeId} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
          <div>
            <span className="font-semibold">{p.code}</span> — {p.matricule}
          </div>
          <div className="text-gray-600 text-xs text-right">
            {p.lat && p.lng ? (
              <>
                {p.vitesse ?? 0} km/h — {p.statutMouvement === "moving" ? "En mouvement" : "À l'arrêt"}
                <br />
                Mise à jour : {p.derniereMiseAJour ?? "—"}
              </>
            ) : (
              "Position indisponible"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}