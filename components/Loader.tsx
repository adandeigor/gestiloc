// components/Loader.tsx
'use client';

import { motion } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useLoadingStore } from '@/core/loader';

export default function Loader() {
  const { isLoading, loaderType, setLoading, completeLoading } = useLoadingStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  // Start loading with progress simulation
  const startLoading = useCallback(
    (path: string) => {
      setLoading(path);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      return interval;
    },
    [setLoading]
  );

  // Complete loading to 100% and hide
  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      completeLoading();
      setProgress(0);
    }, 300); // Brief delay to show 100%
  }, [completeLoading]);

  // Handle pathname and searchParams changes (server-side or initial load)
  useEffect(() => {
    const interval = startLoading(pathname);

    // Track resource loading (e.g., images)
    const images = document.getElementsByTagName('img');
    let imagesLoaded = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      // No images, complete after window.load or timeout
      const handleLoad = () => finishLoading();
      window.addEventListener('load', handleLoad);
      setTimeout(finishLoading, 5000); // Fallback timeout
      return () => {
        clearInterval(interval);
        window.removeEventListener('load', handleLoad);
      };
    }

    // Handle image loading
    const handleImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        finishLoading();
      }
    };

    Array.from(images).forEach((img) => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad); // Count failed images
      }
    });

    // Fallback timeout
    const timeout = setTimeout(finishLoading, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      Array.from(images).forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, [pathname, searchParams, startLoading, finishLoading]);

  // Handle client-side navigations (router.push)
  useEffect(() => {
    const handleStartLoading = (event: Event) => {
      const { href } = (event as CustomEvent).detail;
      const interval = startLoading(href);
      setTimeout(() => {
        clearInterval(interval);
        finishLoading();
      }, 500); // Adjust for navigation duration
    };

    window.addEventListener('startLoading', handleStartLoading);
    return () => window.removeEventListener('startLoading', handleStartLoading);
  }, [startLoading, finishLoading]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopstate = () => {
      const interval = startLoading(window.location.pathname);
      setTimeout(() => {
        clearInterval(interval);
        finishLoading();
      }, 500);
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [startLoading, finishLoading]);

  if (!isLoading || !loaderType) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
      <motion.div
        className={`h-full ${
          loaderType === 'public'
            ? 'bg-white'
            : loaderType === 'admin'
            ? 'bg-blue-500'
            : loaderType === 'gestionnaire'
            ? 'bg-green-500'
            : 'bg-yellow-500'
        }`}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3}}
      />
    </div>
  );
}