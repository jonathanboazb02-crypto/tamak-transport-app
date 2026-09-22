import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Categorie } from "@/lib/rbac";
import { DeviseProvider } from "@/components/DeviseProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const categorie = (session.user?.categorie ?? "CHAUFFEURS") as Categorie;

  const parametres = await prisma.parametresEntreprise.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <DeviseProvider tauxChangeCdf={parametres.tauxChangeCdf}>
      <div className="md:flex">
        <Sidebar categorie={categorie} />
        <div className="flex-1 min-h-screen flex flex-col">
          <Topbar nom={session.user?.name ?? ""} role={session.user?.role ?? ""} />
          <main className="p-4 md:p-8 flex-1">{children}</main>
        </div>
      </div>
    </DeviseProvider>
  );
}