import { Logo } from "./Logo";

export function EnteteFiche({ titre }: { titre: string }) {
  return (
    <div className="text-center mb-6 border-b-2 border-tamak-dark pb-4">
      <Logo className="h-14 mx-auto mb-2" />
      <h1 className="text-xl font-bold">ÉTABLISSEMENT TAMAK</h1>
      <p className="text-xs text-gray-600">
        CD/KIN/RCCM 14 A – 7808 – Id.nat.01-93 -N94301-S NIF: A0700219X
      </p>
      <p className="text-xs text-gray-600">Av. Landu 172, Commune de Bumbu – Kinshasa / Rd. Congo</p>
      <p className="text-xs text-gray-600 mb-3">Mail : distributeurtamak@gmail.com</p>
      <div className="inline-block bg-tamak-dark text-white px-6 py-1.5 text-sm font-bold tracking-widest">
        {titre}
      </div>
    </div>
  );
}