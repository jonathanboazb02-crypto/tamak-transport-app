"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    const delai = setTimeout(() => window.print(), 400);
    return () => clearTimeout(delai);
  }, []);

  return (
    <button
      onClick={() => window.print()}
      className="no-print bg-tamak-navy text-white rounded-lg px-4 py-2 text-sm font-semibold mb-4"
    >
      Imprimer / Exporter en PDF
    </button>
  );
}