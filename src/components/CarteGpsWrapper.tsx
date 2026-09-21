"use client";

import dynamic from "next/dynamic";

const CartePositionsGps = dynamic(
  () => import("./CartePositionsGps").then((mod) => mod.CartePositionsGps),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center text-sm text-gray-400 border rounded-xl">Chargement de la carte...</div> }
);

export function CarteGpsWrapper() {
  return <CartePositionsGps />;
}