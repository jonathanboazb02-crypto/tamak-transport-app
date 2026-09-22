import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "TAMAK Transport — Application de suivi",
  description: "Suivi des véhicules, des courses, du carburant et de l'équipe — Établissement TAMAK Transport",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F3864",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem('tamak-mode-sombre') === '1') { document.documentElement.classList.add('mode-sombre'); } } catch (e) {}`,
          }}
        />
      </head>
      <body className="bg-tamak-light text-tamak-dark antialiased">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}