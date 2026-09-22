"use client";

import { useEffect, useState } from "react";

export function ToggleModeSombre() {
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    setSombre(document.documentElement.classList.contains("mode-sombre"));
  }, []);

  function basculer() {
    const nouveauMode = !sombre;
    setSombre(nouveauMode);
    document.documentElement.classList.toggle("mode-sombre", nouveauMode);
    localStorage.setItem("tamak-mode-sombre", nouveauMode ? "1" : "0");
  }

  return (
    <button
      onClick={basculer}
      aria-label="Basculer le mode sombre"
      className="text-sm border border-tamak-navy/30 rounded-lg px-3 py-1.5 hover:bg-tamak-navy hover:text-white transition-all"
      title={sombre ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {sombre ? "☀️" : "🌙"}
    </button>
  );
}