"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Devise = "CDF" | "USD";

type DeviseContextValeur = {
  devise: Devise;
  tauxChangeCdf: number;
  basculer: () => void;
};

const DeviseContext = createContext<DeviseContextValeur | null>(null);

export function DeviseProvider({ tauxChangeCdf, children }: { tauxChangeCdf: number; children: React.ReactNode }) {
  const [devise, setDevise] = useState<Devise>("CDF");

  useEffect(() => {
    const enregistree = localStorage.getItem("tamak-devise");
    if (enregistree === "CDF" || enregistree === "USD") setDevise(enregistree);
  }, []);

  function basculer() {
    setDevise((actuelle) => {
      const nouvelle = actuelle === "CDF" ? "USD" : "CDF";
      localStorage.setItem("tamak-devise", nouvelle);
      return nouvelle;
    });
  }

  return (
    <DeviseContext.Provider value={{ devise, tauxChangeCdf, basculer }}>
      {children}
    </DeviseContext.Provider>
  );
}

export function useDevise() {
  const contexte = useContext(DeviseContext);
  if (!contexte) throw new Error("useDevise doit être utilisé à l'intérieur de <DeviseProvider>");
  return contexte;
}

// Convertit un montant stocké en USD vers la devise actuellement choisie, formaté pour l'affichage.
export function formaterMontant(valeurUsd: number, devise: Devise, tauxChangeCdf: number): string {
  if (devise === "CDF") {
    const valeurCdf = valeurUsd * tauxChangeCdf;
    return `${valeurCdf.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} Fc`;
  }
  return `${valeurUsd.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}