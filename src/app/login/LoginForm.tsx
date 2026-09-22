"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [voir, setVoir] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const resultat = await signIn("credentials", {
      email,
      motDePasse,
      redirect: false,
    });

    setChargement(false);

    if (resultat?.error) {
      setErreur("Identifiants incorrects ou compte inactif.");
      return;
    }
    router.push("/accueil");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Adresse e-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tamak-navy"
          placeholder="prenom.nom@tamak-transport.cd"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mot de passe</label>
        <div className="relative">
          <input
            type={voir ? "text" : "password"}
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-tamak-navy"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setVoir(!voir)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tamak-navy text-xs font-medium"
            tabIndex={-1}
          >
            {voir ? "Masquer" : "Voir"}
          </button>
        </div>
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button
        type="submit"
        disabled={chargement}
        className="w-full rounded-lg bg-tamak-navy text-white font-semibold py-3 hover:opacity-90 transition disabled:opacity-50"
      >
        {chargement ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}