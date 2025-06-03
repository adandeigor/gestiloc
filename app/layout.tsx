import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // Ajout des styles Leaflet
import { Suspense } from "react";
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
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
