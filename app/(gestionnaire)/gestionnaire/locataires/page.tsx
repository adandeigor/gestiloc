'use client';
import dynamic from 'next/dynamic';

const LocataireBoardPage = dynamic(() => import('./LocataireBoardPageClient'), {
    ssr: false,
});

export default function Page() {
    return <LocataireBoardPage />;
}
