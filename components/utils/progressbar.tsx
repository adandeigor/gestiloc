'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import NProgress from 'nprogress';

const ProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
};

export default ProgressBar;