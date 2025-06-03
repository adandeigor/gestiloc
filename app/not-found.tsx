'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <Image
          src="/svg/404.svg"
          alt="404 Not Found"
          width={220}
          height={220}
          className="mx-auto mb-6"
        />
        <h2 className="text-2xl md:text-3xl text-gray-800 mt-4 mb-6 montserrat-regular">
          Oups ! Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto montserrat-regular">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour continuer.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/80 transition-all duration-300 montserrat-bold"
        >
          <Home className="w-5 h-5" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}