import Link from "next/link";

const OPTIONS = [
  { valeur: "today", label: "Aujourd'hui" },
  { valeur: "7days", label: "7 derniers jours" },
  { valeur: "week", label: "Cette semaine" },
  { valeur: "month", label: "Ce mois" },
  { valeur: "all", label: "Tout" },
];

export function SelecteurPeriode({ periode, debut, fin }: { periode: string; debut?: string; fin?: string }) {
  return (
    <div className="bg-white rounded-xl border p-3 flex flex-wrap items-center gap-2">
      {OPTIONS.map((o) => (
        <Link
          key={o.valeur}
          href={`/analyse?periode=${o.valeur}`}
          className={`text-sm px-3 py-1.5 rounded-full transition ${
            periode === o.valeur
              ? "bg-tamak-navy text-white font-semibold"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {o.label}
        </Link>
      ))}

      <form className="flex items-center gap-2 ml-auto" method="get">
        <input type="hidden" name="periode" value="custom" />
        <input type="date" name="debut" defaultValue={debut} required
          className="border rounded-lg px-2 py-1.5 text-sm" />
        <span className="text-gray-400 text-sm">→</span>
        <input type="date" name="fin" defaultValue={fin} required
          className="border rounded-lg px-2 py-1.5 text-sm" />
        <button type="submit"
          className={`text-sm px-3 py-1.5 rounded-full transition ${
            periode === "custom" ? "bg-tamak-navy text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
          }`}>
          Période
        </button>
      </form>
    </div>
  );
}