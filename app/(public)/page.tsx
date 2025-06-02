'use client'

import FeaturesSection from "@/components/design/sections/features/features-section";
import WelcomeSection from "../../components/design/sections/welcome-section";
import StatsSection from "@/components/design/sections/statics-section";
import TestimonialsSection from "@/components/design/sections/testimonials/testimonials-section";
import CallToAction from "@/components/design/sections/call-to-action";
import Footer from "@/components/design/sections/footer";

export default function Home() {

  return (
    <>
      <WelcomeSection/>
      <FeaturesSection/>
      <StatsSection/>
       <TestimonialsSection/> 
       <CallToAction/> 
    </>
  );
}
