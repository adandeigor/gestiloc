'use client';

import { Menu } from 'lucide-react';
import ThemedButton from '../button';
import Sidebar from './sidebar';
import ReactCountryFlag from 'react-country-flag';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import getCookie from '@/core/getCookie';
import { useCustomRouter } from '@/core/useCustomRouter';

interface NavigationBarreProps {
  children: React.ReactNode;
}

const languages = [
  { code: "fr", label: "Français", flag: "FR" },
  { code: "en", label: "English", flag: "US" },
];

const NavigationBarre = ({ children }: NavigationBarreProps) => {
  const router = useCustomRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState("fr");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Détecter si l'écran est mobile au chargement
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setIsSidebarOpen(!isMobile);
    // Vérifie si le user est connecté (présence du JWT)
    const jwt = getCookie('jwt')
    const user = getCookie('userId')
    if (jwt && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    // Pour réagir au logout/login dans d'autres onglets
    const handleStorageChange = () => {
      const jwt = getCookie('jwt')
      const user = getCookie('userId')
      if (jwt && user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLangChange = (code: string) => {
    setLang(code);
    // Ajoute ici la logique i18n si besoin
  };

  return (
    <>
      <header className="bg-primary backdrop-blur-md text-white py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between  gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle sidebar"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-6 h-6 transform transition-transform duration-300 cursor-pointer" />
            </button>
            <Link
              href="/"
              className="text-4xl montserrat-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              Gestiloc
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Dropdown de langue */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/10 transition-colors">
                  <ReactCountryFlag
                    countryCode={languages.find(l => l.code === lang)?.flag || "FR"}
                    svg
                    style={{ width: "24px", height: "16px" }}
                  />
                  <span className="hidden md:inline">{languages.find(l => l.code === lang)?.label}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    className="flex items-center gap-2"
                  >
                    <ReactCountryFlag countryCode={l.flag} svg style={{ width: "24px", height: "16px" }} />
                    <span>{l.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Boutons selon l'état de connexion */}
            {!isAuthenticated ? (
              <>
                <ThemedButton
                  outline={true}
                  variant="accent"
                  className="montserrat-bold hover:scale-105 transition-transform duration-200 hidden md:block cursor-pointer hover:bg-accent/10"
                  onClick={() => router.push('/auth/register')}
                >
                  Inscription
                </ThemedButton>
                <ThemedButton
                  variant="accent"
                  className="montserrat-bold border-none text-white hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => router.push('/auth/login')}
                >
                  Connexion
                </ThemedButton>
              </>
            ) : (
              <ThemedButton
                variant="accent"
                className="montserrat-bold border-none text-white cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => router.push('/gestionnaire/dashboard')}
              >
                Dashboard
              </ThemedButton>
            )}
          </div>
        </div>
      </header>
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-grow overflow-hidden">
        <div>{children}</div>
      </main>
    </>
  );
};

export default NavigationBarre;