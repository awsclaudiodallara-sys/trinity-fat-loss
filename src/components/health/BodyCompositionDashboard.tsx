import React, { useState, useEffect, useCallback } from "react";
import { BodyCompositionTracker } from "./BodyCompositionTracker";
import { bodyMeasurementsService } from "../../lib/bodyMeasurementsService";
import { useAuth } from "../../hooks/useAuth";
import type {
  NavyMeasurements,
  NavyBodyComposition,
} from "../../lib/healthMetrics";

export const BodyCompositionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showTracker, setShowTracker] = useState(false);
  const [loading, setLoading] = useState(false); // Start as false for immediate render
  const [initialData, setInitialData] = useState<
    Partial<NavyMeasurements> | undefined
  >();
  const [stats, setStats] = useState<{
    totalMeasurements: number;
    firstMeasurementDate: string | null;
    latestMeasurementDate: string | null;
    averageFrequency: number;
    hasCompleteData: boolean;
  } | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user || hasLoadedOnce) return;

    try {
      setLoading(true);

      // Load both in parallel for faster loading
      const [currentData, measurementStats] = await Promise.all([
        bodyMeasurementsService.getCurrentUserData(user.id),
        bodyMeasurementsService.getMeasurementStats(user.id),
      ]);

      setInitialData(currentData || undefined);
      setStats(measurementStats);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Error loading user body composition data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, hasLoadedOnce]);

  // Load data when component becomes visible with small delay
  useEffect(() => {
    if (user && !hasLoadedOnce) {
      const timer = setTimeout(() => {
        loadUserData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, hasLoadedOnce, loadUserData]);

  const handleSaveMeasurements = async (
    measurements: NavyMeasurements,
    composition: NavyBodyComposition
  ) => {
    if (!user) return;

    try {
      await bodyMeasurementsService.saveMeasurements(
        user.id,
        measurements,
        composition
      );

      // Reload stats after saving
      await loadUserData();

      // Show success message
      alert("✅ Misurazioni salvate con successo!");

      // Hide tracker
      setShowTracker(false);
    } catch (error) {
      console.error("Error saving measurements:", error);
      alert("❌ Errore nel salvare le misurazioni. Riprova.");
    }
  };

  // Show immediate skeleton only if we're loading and have no data yet
  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">🏊‍♂️</span>
            Composizione Corporea
          </h3>
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-500">Caricamento...</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 text-sm">
            📊 Caricamento dati misurazioni...
          </p>
        </div>

        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-16 bg-blue-50 rounded-xl"></div>
            <div className="h-16 bg-green-50 rounded-xl"></div>
            <div className="h-16 bg-purple-50 rounded-xl"></div>
            <div className="h-16 bg-orange-50 rounded-xl"></div>
          </div>
          <div className="h-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // If we have stats but still loading (refresh), show content with subtle loading indicator
  if (loading && stats) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">🏊‍♂️</span>
            Composizione Corporea
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Aggiornamento...</span>
          </div>
        </div>
        {/* Continue with normal content */}
      </div>
    );
  }

  if (showTracker) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Composizione Corporea
          </h2>
          <button
            onClick={() => setShowTracker(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Torna al Dashboard
          </button>
        </div>

        <BodyCompositionTracker
          initialData={initialData}
          onSave={handleSaveMeasurements}
          showDetailedInstructions={true}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">🏊‍♂️</span>
          Composizione Corporea
        </h3>
        <button
          onClick={() => setShowTracker(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          📏 Nuova Misurazione
        </button>
      </div>

      {stats && stats.totalMeasurements > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalMeasurements}
              </div>
              <div className="text-xs text-blue-700">Misurazioni</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-lg font-bold text-green-600">
                {stats.averageFrequency > 0
                  ? `${Math.round(stats.averageFrequency)}`
                  : "N/A"}
              </div>
              <div className="text-xs text-green-700">Giorni tra misure</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-lg font-bold text-purple-600">
                {stats.hasCompleteData ? "✅" : "❌"}
              </div>
              <div className="text-xs text-purple-700">Dati Completi</div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-sm font-bold text-orange-600">
                {stats.latestMeasurementDate
                  ? new Date(stats.latestMeasurementDate).toLocaleDateString(
                      "it-IT"
                    )
                  : "Mai"}
              </div>
              <div className="text-xs text-orange-700">Ultima misurazione</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              📈 Il tuo Progresso
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {stats.hasCompleteData ? (
                <>
                  <p>
                    ✅ Hai dati completi per l'analisi della composizione
                    corporea
                  </p>
                  <p>
                    📊 Tracking attivo dal{" "}
                    {stats.firstMeasurementDate
                      ? new Date(stats.firstMeasurementDate).toLocaleDateString(
                          "it-IT"
                        )
                      : "N/A"}
                  </p>
                  {stats.averageFrequency > 0 && (
                    <p>
                      ⏱️ Frequenza media: ogni{" "}
                      {Math.round(stats.averageFrequency)} giorni
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>📏 Aggiungi misurazioni complete per l'analisi Navy</p>
                  <p>
                    💡 Servono: peso, altezza, collo, vita
                    {initialData?.gender === "female" ? ", fianchi" : ""}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowTracker(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              📊 Analizza Composizione Corporea
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏊‍♂️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Inizia il Tracking della Composizione Corporea
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Usa il metodo US Navy per calcolare accuratamente la tua percentuale
            di grasso corporeo, massa magra e massa grassa senza strumenti
            costosi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-blue-900">Precisione</div>
              <div className="text-blue-700">
                Metodo scientificamente validato della Marina USA
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">📏</div>
              <div className="font-semibold text-green-900">Semplice</div>
              <div className="text-green-700">
                Solo metro da sarta e bilancia necessari
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-purple-900">Progress</div>
              <div className="text-purple-700">
                Tracking nel tempo per vedere i cambiamenti
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowTracker(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg"
          >
            🚀 Inizia Prima Misurazione
          </button>
        </div>
      )}
    </div>
  );
};
