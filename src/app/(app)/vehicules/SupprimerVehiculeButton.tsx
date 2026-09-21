"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SupprimerVehiculeButton({ id, code }: { id: string; code: string }) {
  const router = useRouter();
  const [erreur, setErreur] = useState("");

  async function supprimer() {
    const confirme = window.confirm(
      `Supprimer définitivement le véhicule ${code} ? Cette action est irréversible.`
    );
    if (!confirme) return;

    setErreur("");
    const res = await fetch(`/api/vehicules/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.error || "Suppression impossible.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button onClick={supprimer} className="text-xs text-red-600 border border-red-300 rounded-full px-3 py-1 hover:bg-red-50">
        Supprimer
      </button>
      {erreur && <p className="text-xs text-red-600 mt-1 max-w-[180px]">{erreur}</p>}
    </div>
  );
}