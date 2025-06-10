import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import 'leaflet/dist/leaflet.css'; // Ajout des styles Leaflet
import { Suspense } from 'react';
import { Montserrat, Lato, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
});
const lato = Lato({
    subsets: ['latin'],
    variable: '--font-lato',
    weight: ['400', '700'],
});
const popins = Poppins({
    subsets: ['latin'],
    variable: '--font-poppins',
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    title: 'Gestiloc',
    description: 'Gérer vos locations en toute simplicité',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body
                className={`${montserrat.variable} ${lato.variable} ${popins.variable}`}
            >
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-screen">
                            <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-b-accent"></div>
                        </div>
                    }
                >
                    {children}
                    <Analytics />
                    <Toaster duration={5000} position="top-right" />
                </Suspense>
            </body>
        </html>
    );
}
