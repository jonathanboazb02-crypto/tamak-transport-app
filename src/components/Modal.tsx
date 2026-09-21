"use client";

export function Modal({ ouvert, onFermer, titre, children }: { ouvert: boolean; onFermer: () => void; titre: string; children: React.ReactNode }) {
  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onFermer}>
      <div
        className="bg-white rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-tamak-navy">{titre}</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}