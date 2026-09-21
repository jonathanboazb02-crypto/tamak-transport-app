"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ComparatifVehiculesChart({
  donnees,
}: {
  donnees: { vehicule: string; courses: number; litres: number; cout: number }[];
}) {
  if (donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5 text-sm text-gray-400 text-center py-12">
        Aucun véhicule à comparer pour le moment.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-tamak-navy mb-4">Comparatif par véhicule</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={donnees}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="vehicule" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="courses" name="Courses réalisées" fill="#1F3864" />
          <Bar dataKey="litres" name="Litres consommés" fill="#C9962C" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}