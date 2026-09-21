"use client";

import { useRouter } from "next/navigation";

export function ToggleCompteButton({ id, actif }: { id: string; actif: boolean }) {
  const router = useRouter();

  async function basculer() {
    await fetch("/api/utilisateurs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actif: !actif }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={basculer}
      className={`text-xs font-semibold rounded-full px-3 py-1 ${
        actif ? "bg-red-50 text-red-700 border border-red-300" : "bg-green-50 text-green-700 border border-green-300"
      }`}
    >
      {actif ? "Désactiver" : "Réactiver"}
    </button>
  );
}