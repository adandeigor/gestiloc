// gestionnaire/components/SidebarNavigation.tsx
'use client';

import { useState, useEffect } from 'react';
import { navigationList } from '../utils/data';
import { IconHomeFilled } from '@tabler/icons-react';
import { Menu, X, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomRouter } from '@/core/useCustomRouter';
import { toast } from 'sonner';
import  getCookie from '@/core/getCookie';
import { httpClient } from '@/core/httpClient';

export const SidebarNavigation = () => {
  const pathname = usePathname();
  const router = useCustomRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const logout = async () => {
    try {
      const userId = getCookie('userId');
      if (!userId) {
        throw new Error('No user ID found');
      }
       await httpClient.post(`/api/user/${userId}/logout`, null)
      deleteCookie('userId');
      deleteCookie('jwt');
      router.push('/auth/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        <p className="text-md font-bold text-[#D1495B]">{`Erreur lors de la déconnexion : ${errorMessage}`}</p>
      );
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prefetch navigation routes
  useEffect(() => {
    navigationList.forEach((item) => {
      router.prefetch(item.path);
    });
  }, [router]);

  // Synchronize loader with navigation events
  useEffect(() => {
    const handleNavigationStart = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('startLoading', { detail: { href: window.location.pathname } }));
      }
    };

    const handleNavigationEnd = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('completeLoading'));
      }
    };

    // Use Next.js navigation events
    if (typeof window !== 'undefined' && 'navigation' in window) {
      const nav = window.navigation as EventTarget;
      nav.addEventListener('navigate', handleNavigationStart);
      nav.addEventListener('navigatesuccess', handleNavigationEnd);
      nav.addEventListener('navigateerror', handleNavigationEnd);
      return () => {
        nav.removeEventListener('navigate', handleNavigationStart);
        nav.removeEventListener('navigatesuccess', handleNavigationEnd);
        nav.removeEventListener('navigateerror', handleNavigationEnd);
      };
    }
  }, []);

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#1A2C38] shadow sticky top-0 z-50 flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <IconHomeFilled className="text-[#9FC131] w-6 h-6" />
          <span className="text-2xl font-semibold text-[#F5F5F5]">Gestiloc</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-[#F5F5F5] hover:bg-[#F9A03F]/20"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <motion.div
        className="hidden md:flex fixed top-0 left-0 h-full bg-[#1A2C38] shadow-lg z-50 flex-col items-center pt-6"
        animate={{ width: isExpanded ? 200 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Link href="/" className="flex items-center gap-2 mb-8 px-4">
          <IconHomeFilled className="text-[#9FC131] w-8 h-8" />
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-[#F5F5F5]"
            >
              Gestiloc
            </motion.span>
          )}
        </Link>

        <TooltipProvider>
          <nav className="flex flex-col gap-2 w-full px-2 flex-1">
            {navigationList.map((item, index) => (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.path
                        ? 'bg-[#F9A03F]/20 text-[#F9A03F]'
                        : 'text-[#F5F5F5] hover:bg-[#F9A03F]/10 hover:text-[#F9A03F]'
                    }`}
                    onClick={() => router.push(item.path)}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <item.icon className="w-6 h-6" />
                    </motion.div>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" className="text-white  font-semibold text-sm">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpand}
          className="text-[#F5F5F5] hover:bg-[#F9A03F]/20 mt-4"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <Menu className="w-6 h-6" />
          </motion.div>
        </Button>

        <div className="mt-auto mb-4 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                  <AvatarFallback className="bg-[#F5F5F5] text-[#2C2C2C]">M</AvatarFallback>
                </Avatar>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-[#F5F5F5] text-[#2C2C2C]"
              align="end"
              side={isExpanded ? 'right' : 'bottom'}
            >
              <DropdownMenuLabel className="text-[#2C2C2C]">Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/gestionnaire/profil" className="text-[#2C2C2C] hover:text-[#F9A03F]">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/gestionnaire/parametres" className="text-[#2C2C2C] hover:text-[#F9A03F]">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  onClick={logout}
                  className="w-full text-left text-[#2C2C2C] hover:text-[#F9A03F]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="md:hidden fixed top-0 left-0 h-full w-64 bg-[#1A2C38] shadow-lg z-50 flex flex-col pt-6"
          >
            <Link href="/" className="flex items-center gap-2 mb-8 px-4">
              <IconHomeFilled className="text-[#9FC131] w-8 h-8" />
              <span className="text-xl font-semibold text-[#F5F5F5]">Gestiloc</span>
            </Link>

            <nav className="flex flex-col gap-2 px-4 flex-1">
              {navigationList.map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.path
                      ? 'bg-[#F9A03F]/20 text-[#F9A03F]'
                      : 'text-[#F5F5F5] hover:bg-[#F9A03F]/10 hover:text-[#F9A03F]'
                  }`}
                  onClick={() => router.push(item.path)}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto mb-4 px-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                      <AvatarFallback className="bg-[#F5F5F5] text-[#2C2C2C]">M</AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-[#F5F5F5] text-[#2C2C2C]"
                  align="end"
                  side="right"
                >
                  <DropdownMenuLabel className="text-[#2C2C2C]">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/gestionnaire/profil" className="text-[#2C2C2C] hover:text-[#F9A03F]">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/gestionnaire/parametres" className="text-[#2C2C2C] hover:text-[#F9A03F]">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={logout}
                      className="w-full text-left text-[#2C2C2C] hover:text-[#F9A03F]"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black z-40"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
};