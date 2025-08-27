import React from "react";

// ✅ Interface per le props che il componente riceverà
interface ScienceSectionProps {
  onStartOnboarding: () => void;
}

// ✅ Il componente ora riceve e usa la prop onStartOnboarding
export const ScienceSection: React.FC<ScienceSectionProps> = ({
  onStartOnboarding,
}) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🧠 La Scienza del Trio
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Basato su <strong>15+ studi peer-reviewed</strong> di Harvard,
            Stanford e Domini University. Non è motivazione, è{" "}
            <strong>neuroscienza applicata</strong>.
          </p>
          <div className="text-sm text-blue-600 font-medium">
            📈 Analizzate oltre 695 sessioni di allenamento • 🔬 Ricerca
            verificata
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-5xl font-bold text-green-600 mb-2">70%</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              Più Successo
            </div>
            <div className="text-gray-600 text-sm">
              Con accountability partner vs. obiettivi individuali
            </div>
            <div className="mt-4 text-xs text-blue-600 font-medium">
              📚 Studio Domini University
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-5xl font-bold text-blue-600 mb-2">46%</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              Mantenimento
            </div>
            <div className="text-gray-600 text-sm">
              Più efficace nel mantenere i risultati a lungo termine
            </div>
            <div className="mt-4 text-xs text-blue-600 font-medium">
              📚 Ricerca Zeel Health
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-5xl font-bold text-purple-600 mb-2">3x</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              Motivazione
            </div>
            <div className="text-gray-600 text-sm">
              Più motivazione intrinseca con supporto di gruppo
            </div>
            <div className="mt-4 text-xs text-blue-600 font-medium">
              📚 Studio IRIS Publishers
            </div>
          </div>
        </div>

        {/* Psychology Mechanisms */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧠 3 Meccanismi Psicologici Scientificamente Provati
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔥</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Social Commitment</h4>
              <p className="text-gray-600 text-sm">
                Il tuo cervello tratta gli obiettivi condivisi come{" "}
                <strong>"debiti sociali"</strong> da onorare. Impossibile
                ignorarli.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Identity Formation</h4>
              <p className="text-gray-600 text-sm">
                Il trio ti trasforma da{" "}
                <em>"persona che dovrebbe allenarsi"</em> a
                <strong>"persona fitness"</strong> in 30 giorni.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Dopamine Loops</h4>
              <p className="text-gray-600 text-sm">
                Ogni celebrazione con il trio rilascia <strong>dopamina</strong>
                , rendendo l'esercizio naturalmente <strong>addictivo</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Psychological Needs */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">
            🎯 I 3 Bisogni Psicologici Fondamentali
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h4 className="text-xl font-semibold mb-3">Autonomia</h4>
              <p className="text-blue-100">
                <strong>Libertà di scegliere</strong> quando e come allenarti,
                con il supporto di cui hai bisogno
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-semibold mb-3">Competenza</h4>
              <p className="text-blue-100">
                <strong>Vedi i tuoi progressi</strong> ogni giorno e celebra
                ogni vittoria con il tuo trio
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold mb-3">Relazione</h4>
              <p className="text-blue-100">
                <strong>Non sei più solo:</strong> 2 persone reali ti supportano
                ogni giorno verso i tuoi obiettivi
              </p>
            </div>
          </div>
        </div>

        {/* Failure vs Success */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                La Realtà degli Obiettivi Fitness
              </h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-xl">😞</span>
                  </div>
                  <div>
                    <div className="text-red-400 text-2xl font-bold">95%</div>
                    <div className="text-gray-300">Fallisce da solo</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div>
                    <div className="text-green-400 text-2xl font-bold">70%</div>
                    <div className="text-gray-300">
                      Ha successo con Trinity Fat Loss
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-2xl font-bold mb-4">Il Risultato?</h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                <strong>70% più successo</strong> rispetto agli obiettivi
                individuali e<strong>46% maggior mantenimento</strong> a lungo
                termine.
              </p>
              <div className="mt-6 text-sm text-blue-400">
                Non è magia. È scienza.
              </div>
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">💪</div>
            <div className="text-2xl font-bold text-purple-600">3-5h</div>
            <div className="text-sm text-gray-600">
              Più allenamento/settimana
            </div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-2xl font-bold text-green-600">60%</div>
            <div className="text-sm text-gray-600">Miglioramento umore</div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-600">83%</div>
            <div className="text-sm text-gray-600">
              Non mollare primi 2 mesi
            </div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600">5x</div>
            <div className="text-sm text-gray-600">
              Tipologie supporto sociale
            </div>
          </div>
        </div>

        {/* CTA - AGGIORNATO CON NAVIGAZIONE ✅ */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            <strong>L'unica fitness app</strong> con basi scientifiche così
            solide per l'accountability sociale
          </p>
          <button
            onClick={onStartOnboarding}
            className="trinity-button-primary text-xl px-12 py-4 mb-4"
          >
            🧠 Inizia la Tua Trasformazione Scientifica
          </button>
          <div className="text-sm text-gray-500">
            ✅ Gratis per iniziare • ✅ Trio garantito in 48h • ✅ Basato su 15+
            studi scientifici
          </div>
        </div>
      </div>
    </section>
  );
};
