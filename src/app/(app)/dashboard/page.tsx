import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { PositionsGpsLive } from "@/components/PositionsGpsLive";
import { CarteGpsWrapper } from "@/components/CarteGpsWrapper";
import { startOfMonth } from "date-fns";

export default async function DashboardPage() {
  const debutMois = startOfMonth(new Date());

  const [vehiculesActifs, coursesDuMois, carburantDuMois] = await Promise.all([
    prisma.vehicule.count({ where: { statut: "ACTIF" } }),
    prisma.course.count({ where: { date: { gte: debutMois } } }),
    prisma.carburant.aggregate({
      where: { dateChargement: { gte: debutMois } },
      _sum: { montantTotal: true, quantiteLitres: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-tamak-navy">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Véhicules actifs" value={vehiculesActifs} />
        <StatCard label="Courses ce mois" value={coursesDuMois} />
        <StatCard label="Carburant ce mois" value={(carburantDuMois._sum.quantiteLitres ?? 0).toFixed(0)} suffix="L" />
        <StatCard label="Coût carburant ce mois" value={(carburantDuMois._sum.montantTotal ?? 0).toFixed(2)} suffix="USD" />
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-tamak-navy">Suivi des véhicules (GPS Navixy / X-Moniteur)</h2>
        <CarteGpsWrapper />
        <PositionsGpsLive />
      </div>
    </div>
  );
}