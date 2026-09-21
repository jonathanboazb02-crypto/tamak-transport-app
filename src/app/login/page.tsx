import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/Logo";

export default function LoginPage({ searchParams }: { searchParams: { motdepasse?: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-tamak-navy via-[#1F3864] to-[#0F1D38] relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-tamak-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 relative">
        <div className="text-center mb-6">
          <Logo className="h-16 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-tamak-navy">ÉTABLISSEMENT TAMAK</h1>
          <p className="text-sm text-gray-500 mt-1">Application de suivi et de gestion du transport</p>
        </div>
        {searchParams.motdepasse === "change" && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4 text-center">
            Mot de passe changé avec succès. Connecte-toi avec ton nouveau mot de passe.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}