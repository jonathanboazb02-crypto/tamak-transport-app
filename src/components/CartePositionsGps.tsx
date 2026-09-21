"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correctif nécessaire : les icônes par défaut de Leaflet ne se chargent pas
// correctement avec les bundlers comme Next.js — on les pointe manuellement.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const KINSHASA: [number, number] = [-4.3276, 15.3136];

export function CartePositionsGps() {
  const [positions, setPositions] = useState<Position[]>([]);

  async function charger() {
    const res = await fetch("/api/gps/positions");
    if (!res.ok) return;
    const data = await res.json();
    setPositions(data);
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 30000);
    return () => clearInterval(intervalle);
  }, []);

  const positionsValides = positions.filter((p) => p.lat && p.lng);
  const centre: [number, number] =
    positionsValides.length > 0 ? [positionsValides[0].lat!, positionsValides[0].lng!] : KINSHASA;

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: 350 }}>
      <MapContainer center={centre} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positionsValides.map((p) => (
          <Marker key={p.vehiculeId} position={[p.lat!, p.lng!]}>
            <Popup>
              <b>{p.code}</b> — {p.matricule}
              <br />
              {p.vitesse ?? 0} km/h — {p.statutMouvement === "moving" ? "En mouvement" : "À l'arrêt"}
              <br />
              Mise à jour : {p.derniereMiseAJour ?? "—"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}