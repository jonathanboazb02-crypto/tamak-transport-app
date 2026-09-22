import { StatCard } from "./StatCard";
import { MontantDevise } from "./MontantDevise";

// Variante de StatCard pour les montants monétaires : affiche la valeur convertie
// et formatée dans la devise actuellement choisie (CDF ou USD), au lieu d'un texte figé.
export function StatCardDevise({ label, valeurUsd }: { label: string; valeurUsd: number }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.06)] p-5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.1)] transition-shadow">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tamak-navy to-tamak-gold" />
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-tamak-navy mt-1.5">
        <MontantDevise valeurUsd={valeurUsd} />
      </p>
    </div>
  );
}