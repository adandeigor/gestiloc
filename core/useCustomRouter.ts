// lib/useCustomRouter.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useCustomRouter() {
    const router = useRouter();

    const push = useCallback(
        (href: string, options?: { scroll?: boolean }) => {
            console.log(`Navigating to ${href} with loader`);
            window.dispatchEvent(
                new CustomEvent('startLoading', { detail: { href } })
            );
            router.push(href, options);
        },
        [router]
    );

    return { ...router, push };
}
