import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // Ajout des styles Leaflet
import { Suspense } from "react";
import { Montserrat, Lato } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Gestiloc",
  description: "Gérer vos locations en toute simplicité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${lato.variable}`}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-b-accent"></div>
            </div>
          }
        >
          {children}
          <Toaster duration={5000} position="top-right" />
        </Suspense>
      </body>
    </html>
  );
}
