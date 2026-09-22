"use client";

import { useDevise } from "./DeviseProvider";

export function ToggleDevise() {
  const { devise, basculer } = useDevise();
  return (
    <button
      onClick={basculer}
      title="Changer la devise d'affichage"
      className="text-sm border border-tamak-navy/30 rounded-lg px-3 py-1.5 hover:bg-tamak-navy hover:text-white transition-all font-medium"
    >
      {devise === "CDF" ? "Fc" : "$"} ⇄
    </button>
  );
}