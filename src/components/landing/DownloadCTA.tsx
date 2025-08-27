import React from "react";

// ✅ Interface per le props che il componente riceverà
interface DownloadCTAProps {
  onStartOnboarding: () => void;
}

// ✅ Il componente ora riceve e usa la prop onStartOnboarding
export const DownloadCTA: React.FC<DownloadCTAProps> = ({
  onStartOnboarding,
}) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Main Headline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          🎯 Ready to Transform?
        </h2>

        <p className="text-xl md:text-2xl mb-12 opacity-90">
          Join thousands already transforming with trio accountability
        </p>

        {/* Download Buttons - AGGIORNATI CON NAVIGAZIONE ✅ */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <button onClick={onStartOnboarding} className="app-store-button">
            <div className="text-2xl">🚀</div>
            <div className="text-left">
              <div className="text-xs opacity-75">Inizia Subito</div>
              <div className="text-lg font-semibold">Trinity Fat Loss</div>
            </div>
          </button>

          <button onClick={onStartOnboarding} className="app-store-button">
            <div className="text-2xl">💪</div>
            <div className="text-left">
              <div className="text-xs opacity-75">Trova il Tuo</div>
              <div className="text-lg font-semibold">Trio Perfetto</div>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid mb-8">
          <div className="stat-item">
            <div className="stat-number">12K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">94%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.8★</div>
            <div className="stat-label">App Rating</div>
          </div>
        </div>

        {/* Web Alternative - AGGIORNATO CON NAVIGAZIONE ✅ */}
        <div className="border-t border-white border-opacity-20 pt-8 mb-8">
          <p className="text-lg mb-4 opacity-90">
            Or start your transformation journey now
          </p>
          <button
            onClick={onStartOnboarding}
            className="trinity-button-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-xl px-12 py-4"
          >
            🌐 Inizia la Trasformazione Ora
          </button>
        </div>

        {/* Final Call to Action - AGGIORNATO */}
        <div className="mt-12">
          <p className="text-lg font-medium opacity-90">
            ✨ Il tuo trio ti aspetta
          </p>
          <p className="text-sm opacity-75 mt-2">
            Gratis per iniziare • Matching garantito in 48h • 70% di successo
            scientifico
          </p>
        </div>
      </div>
    </section>
  );
};
