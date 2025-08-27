import React from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { SuccessStories } from "../components/landing/SuccessStories";
import { DownloadCTA } from "../components/landing/DownloadCTA";
import { ScienceSection } from "../components/landing/ScienceSection";

interface LandingPageProps {
  onStartOnboarding: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section con gradient background */}
      <HeroSection onStartOnboarding={onStartOnboarding} />

      {/* Sezione Scientifica - Credibilità e prove */}
      <ScienceSection onStartOnboarding={onStartOnboarding} />

      {/* Come funziona Trinity - Processo step by step */}
      <HowItWorks onStartOnboarding={onStartOnboarding} />

      {/* Success Stories testimonials - Social proof */}
      <SuccessStories onStartOnboarding={onStartOnboarding} />

      {/* Call to Action finale - Conversione */}
      <DownloadCTA onStartOnboarding={onStartOnboarding} />
    </div>
  );
};
