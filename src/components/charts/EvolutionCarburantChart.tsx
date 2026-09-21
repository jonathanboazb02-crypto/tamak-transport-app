"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function EvolutionCarburantChart({
  donnees,
}: {
  donnees: { mois: string; litres: number; cout: number }[];
}) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5 text-sm text-gray-400 text-center py-12">
        Pas encore assez de données de carburant pour afficher une évolution.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-tamak-navy mb-4">Évolution du carburant (coût et litres par mois)</h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={donnees}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="litres" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="cout" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area yAxisId="litres" type="monotone" dataKey="litres" name="Litres" stroke="#1F3864" fill="#1F3864" fillOpacity={0.15} />
          <Area yAxisId="cout" type="monotone" dataKey="cout" name="Coût (USD)" stroke="#C9962C" fill="#C9962C" fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}