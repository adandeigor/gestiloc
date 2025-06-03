import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import "leaflet/dist/leaflet.css"; // Ajout des styles Leaflet
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="">
        {children}
        <Toaster duration={5000} position="top-right" />
      </body>
    </html>
  );
}
