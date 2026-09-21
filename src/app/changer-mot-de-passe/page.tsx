import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ChangerMotDePasseForm } from "./ChangerMotDePasseForm";
import { Logo } from "@/components/Logo";

export default async function ChangerMotDePassePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-tamak-navy via-[#1F3864] to-[#0F1D38] relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-tamak-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 relative">
        <div className="text-center mb-6">
          <Logo className="h-14 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-tamak-navy">Changement de mot de passe requis</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pour la sécurité de ton compte, choisis un nouveau mot de passe avant de continuer.
          </p>
        </div>
        <ChangerMotDePasseForm />
      </div>
    </main>
  );
}