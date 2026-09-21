"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redimensionnerImage } from "@/lib/image";

export function PhotoUploader({
  photoActuelle,
  urlApi,
  champ,
  tailleMax = 300,
  rond = false,
  label,
}: {
  photoActuelle: string | null;
  urlApi: string; // ex: /api/equipe/xxxx ou /api/vehicules/xxxx
  champ: "photo" | "photoPermis";
  tailleMax?: number;
  rond?: boolean;
  label: string;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState(photoActuelle);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur("");
    setEnvoi(true);
    try {
      const base64 = await redimensionnerImage(fichier, tailleMax);
      const res = await fetch(urlApi, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [champ]: base64 }),
      });
      if (!res.ok) throw new Error();
      setPhoto(base64);
      router.refresh();
    } catch {
      setErreur("Échec de l'envoi de la photo.");
    } finally {
      setEnvoi(false);
    }
  }

  const classePhoto = rond
    ? "w-24 h-24 rounded-full object-cover border"
    : "w-full sm:w-48 h-32 object-cover rounded-lg border";
  const classePlaceholder = rond
    ? "w-24 h-24 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs"
    : "w-full sm:w-48 h-32 bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400 text-xs";

  return (
    <div>
      {photo ? <img src={photo} alt={label} className={classePhoto} /> : <div className={classePlaceholder}>{label}</div>}
      <label className="mt-2 inline-block text-xs text-tamak-navy underline cursor-pointer">
        {envoi ? "Envoi en cours..." : `Changer — ${label}`}
        <input type="file" accept="image/*" onChange={choisir} className="hidden" disabled={envoi} />
      </label>
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
    </div>
  );
}