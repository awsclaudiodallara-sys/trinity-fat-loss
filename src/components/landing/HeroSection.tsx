import React from "react";
import { UserMenu } from "../common/UserMenu";

// ✅ Interface per le props che il componente riceverà
interface HeroSectionProps {
  onStartOnboarding: () => void;
}

// ✅ Il componente ora riceve e usa la prop onStartOnboarding
export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOnboarding,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu variant="dark" />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Trinity Logo Visual - Compatto su mobile */}
        <div className="mb-4 md:mb-8 pt-4 md:pt-8 pb-2 md:pb-4 flex justify-center items-center space-x-2 md:space-x-4 text-4xl md:text-5xl lg:text-6xl">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>
            🏃‍♂️
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
            👥
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
            🏃‍♀️
          </span>
        </div>

        {/* Science Badge - Più compatto su mobile */}
        <div className="mb-4 md:mb-6 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium">
          <span className="mr-2">🧠</span>
          <span className="hidden sm:inline">
            Basato su 15+ Studi Harvard • Stanford • Domini University
          </span>
          <span className="sm:hidden">Scienza-Based • 70% Successo</span>
        </div>

        {/* Main Headline - Più compatto su mobile */}
        <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-6 leading-tight">
          <span className="block">Il Primo Sistema Fitness con</span>
          <span className="block mt-1 md:mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
            70% di Successo
          </span>
          <span className="block mt-1 md:mt-2 text-lg md:text-3xl lg:text-5xl xl:text-6xl">
            Garantito dalla Scienza
          </span>
        </h1>

        {/* CTA Principale Mobile-First - PRIORITARIO */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={onStartOnboarding}
            className="text-lg md:text-xl font-bold bg-white text-blue-600 px-8 md:px-12 py-3 md:py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            🚀 Inizia la Tua Trasformazione
          </button>
          <p className="text-xs md:text-sm mt-2 opacity-90">
            Gratis • Trio garantito in 48h
          </p>
        </div>

        {/* Tagline Compatta - solo su desktop */}
        <div className="hidden md:block mb-6">
          <p className="text-lg md:text-xl opacity-90 font-medium max-w-3xl mx-auto leading-relaxed">
            Insieme è meglio: <strong>raggiungi i tuoi obiettivi</strong> con il
            supporto di due compagni.
          </p>
        </div>

        {/* Science Stats - Compatte su mobile */}
        <div className="mb-6 md:mb-10 grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 max-w-xs md:max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-2xl p-2 md:p-4 border border-white/20">
            <div className="text-lg md:text-3xl font-bold text-yellow-400">
              70%
            </div>
            <div className="text-xs md:text-sm">Più Successo</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-2xl p-2 md:p-4 border border-white/20">
            <div className="text-lg md:text-3xl font-bold text-green-400">
              46%
            </div>
            <div className="text-xs md:text-sm">Mantenimento</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-2xl p-2 md:p-4 border border-white/20">
            <div className="text-lg md:text-3xl font-bold text-purple-400">
              95%
            </div>
            <div className="text-xs md:text-sm">Trio Success</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-12 space-y-4">
          <p className="text-lg font-semibold">
            Unisciti a 12,000+ persone che perdono peso insieme in gruppo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>🧠</span>
              <span>3 meccanismi psicologici attivati</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>📊</span>
              <span>695+ sessioni analizzate</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>🎯</span>
              <span>83% non molla primi 2 mesi</span>
            </div>
          </div>
        </div>

        {/* Download Buttons - Solo 2 pulsanti principali */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={onStartOnboarding}
            className="trinity-button-primary text-lg px-8 py-4 min-w-[220px] bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            💪 Trova il Tuo Trio
          </button>
          <button
            onClick={onStartOnboarding}
            className="trinity-button-primary text-lg px-8 py-4 min-w-[220px] bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            🌐 Inizia Gratis
          </button>
        </div>

        {/* Scientific CTA - AGGIORNATO CON NAVIGAZIONE ✅ */}
        <div className="mb-8">
          <button
            onClick={onStartOnboarding}
            className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            🧠 Unisciti al 70% che Raggiunge Davvero i Propri Obiettivi
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Gratis per iniziare</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Trio garantito in 48h</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Nessun impegno iniziale</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔬</span>
            <span>Metodo scientificamente provato</span>
          </div>
        </div>
      </div>
    </section>
  );
};
