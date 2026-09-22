"use client";

import { useDevise, formaterMontant } from "./DeviseProvider";

// Affiche un montant stocké en USD, automatiquement converti et formaté
// selon la devise actuellement choisie par l'utilisateur (CDF ou USD).
export function MontantDevise({ valeurUsd, className }: { valeurUsd: number; className?: string }) {
  const { devise, tauxChangeCdf } = useDevise();
  return <span className={className}>{formaterMontant(valeurUsd, devise, tauxChangeCdf)}</span>;
}