import { ReactNode } from "react";

export function DataTable({
  colonnes,
  lignes,
}: {
  colonnes: string[];
  lignes: (string | number | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-tamak-navy text-white">
          <tr>
            {colonnes.map((c) => (
              <th key={c} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 && (
            <tr>
              <td colSpan={colonnes.length} className="px-4 py-6 text-center text-gray-400">
                Aucune donnée pour le moment.
              </td>
            </tr>
          )}
          {lignes.map((ligne, i) => (
            <tr key={i} className={i % 2 ? "bg-tamak-light" : ""}>
              {ligne.map((cellule, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap">
                  {cellule}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}