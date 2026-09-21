import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Categorie } from "@/lib/rbac";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const categorie = (session.user?.categorie ?? "CHAUFFEURS") as Categorie;

  return (
    <div className="md:flex">
      <Sidebar categorie={categorie} />
      <div className="flex-1 min-h-screen flex flex-col">
        <Topbar nom={session.user?.name ?? ""} role={session.user?.role ?? ""} />
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
