// À exécuter une seule fois : npx tsx prisma/seed-tarifs.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARIFS = [
  { codeCourse: "TAM_KIN526", description: "Kinshasa 1-Kin5", tarifCdf: 310563.5, tarifUsd: 136.65 },
  { codeCourse: "TAMABARU14", description: "Kinshasa 1-Barumbu", tarifCdf: 266253.8, tarifUsd: 117.15 },
  { codeCourse: "TAMABOLO26", description: "Beach-Bollore", tarifCdf: 259914.4, tarifUsd: 114.36 },
  { codeCourse: "TAMABUMB14", description: "Kinshasa 1-Bumbu 14/16 paltes", tarifCdf: 253575.0, tarifUsd: 111.57 },
  { codeCourse: "TAMABUMB26", description: "Kinshasa 1-Bumbu", tarifCdf: 303758.8, tarifUsd: 133.65 },
  { codeCourse: "TAMAKALA26", description: "Kinshasa 1-Kalamu", tarifCdf: 276538.8, tarifUsd: 121.68 },
  { codeCourse: "TAMAKIMB26", description: "Kinshasa 1-Kimbanseke", tarifCdf: 351392.8, tarifUsd: 154.61 },
  { codeCourse: "TAMAKINK26", description: "Kinshasa 1-Kinkole", tarifCdf: 547782.9, tarifUsd: 241.02 },
  { codeCourse: "TAMAKISE26", description: "Kinshasa 1-Kisenso", tarifCdf: 324172.8, tarifUsd: 142.64 },
  { codeCourse: "TAMALEMB14", description: "Kinshasa 1-Lemba", tarifCdf: 290148.1, tarifUsd: 127.67 },
  { codeCourse: "TAMALIME26", description: "Kinshasa 1-Limete", tarifCdf: 266253.8, tarifUsd: 117.15 },
  { codeCourse: "TAMAMATE26", description: "Kinshasa 1-Matete", tarifCdf: 310563.5, tarifUsd: 136.65 },
  { codeCourse: "TAMAMITE26", description: "Kinshasa 1-Mitendi", tarifCdf: 547782.9, tarifUsd: 241.02 },
];

async function main() {
  for (const t of TARIFS) {
    await prisma.tarifCourse.upsert({
      where: { codeCourse: t.codeCourse },
      update: { description: t.description, tarifCdf: t.tarifCdf, tarifUsd: t.tarifUsd },
      create: t,
    });
    console.log(`Tarif enregistré : ${t.codeCourse} — ${t.description}`);
  }
  console.log(`\n${TARIFS.length} trajets enregistrés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });