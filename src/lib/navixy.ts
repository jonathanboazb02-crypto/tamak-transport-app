// Client pour l'API Navixy (plateforme derrière l'application X-Moniteur)
// Documentation : https://developers.navixy.com
//
// Les identifiants (NAVIXY_LOGIN / NAVIXY_PASSWORD) restent côté serveur,
// dans les variables d'environnement — jamais exposés au navigateur.

const BASE_URL = process.env.NAVIXY_API_BASE || "https://api.eu.navixy.com/v2";

let hashCache: { hash: string; obtenuLe: number } | null = null;
const DUREE_VALIDITE_MS = 22 * 60 * 60 * 1000; // ~22h (le hash Navixy dure 24h)

async function authentifier(): Promise<string> {
  const login = process.env.NAVIXY_LOGIN;
  const password = process.env.NAVIXY_PASSWORD;
  if (!login || !password) {
    throw new Error("NAVIXY_LOGIN / NAVIXY_PASSWORD non configurés dans .env");
  }

  const res = await fetch(`${BASE_URL}/user/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!data.success || !data.hash) {
    throw new Error(`Échec de l'authentification Navixy : ${JSON.stringify(data.status ?? data)}`);
  }
  hashCache = { hash: data.hash, obtenuLe: Date.now() };
  return data.hash;
}

async function obtenirHash(): Promise<string> {
  if (hashCache && Date.now() - hashCache.obtenuLe < DUREE_VALIDITE_MS) {
    return hashCache.hash;
  }
  return authentifier();
}

// Liste brute des traceurs Navixy du compte (id + libellé) — sert à faire
// la correspondance avec les véhicules TAMAK (voir module "Nos véhicules").
export async function listerTraceurs() {
  const hash = await obtenirHash();
  const res = await fetch(`${BASE_URL}/tracker/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Impossible de lister les traceurs Navixy : ${JSON.stringify(data.status ?? data)}`);
  }
  return (data.list ?? []).map((t: any) => ({ id: t.id, label: t.label }));
}

// États actuels (position, vitesse, dernière mise à jour) pour une liste
// d'identifiants de traceurs Navixy.
export async function obtenirEtats(trackerIds: number[]) {
  if (trackerIds.length === 0) return {};
  const hash = await obtenirHash();
  const res = await fetch(`${BASE_URL}/tracker/get_states`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash, trackers: trackerIds }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Impossible de récupérer les positions Navixy : ${JSON.stringify(data.status ?? data)}`);
  }
  return data.states ?? {};
}