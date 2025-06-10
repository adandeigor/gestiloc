'use client';

import FeaturesSection from '@/components/design/sections/features/features-section';
import WelcomeSection from '../../components/design/sections/welcome-section';
import StatsSection from '@/components/design/sections/statics-section';
import TestimonialsSection from '@/components/design/sections/testimonials/testimonials-section';
import CallToAction from '@/components/design/sections/call-to-action';
import { Suspense } from 'react';

export default function Home() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
                </div>
            }
        >
            <WelcomeSection />
            <FeaturesSection />
            <StatsSection />
            <TestimonialsSection />
            <CallToAction />
        </Suspense>
    );
}
