import React, { useState, useEffect, useCallback } from "react";
import { bodyMeasurementsService } from "../../lib/bodyMeasurementsService";
import { useAuth } from "../../hooks/useAuth";
import { calculateNavyBodyComposition } from "../../lib/healthMetrics";
import type {
  NavyMeasurements,
  NavyBodyComposition,
} from "../../lib/healthMetrics";

export const BodyCompositionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState<
    Partial<NavyMeasurements> | undefined
  >();
  const [bodyComposition, setBodyComposition] =
    useState<NavyBodyComposition | null>(null);
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
      const [userData, measurementStats] = await Promise.all([
        bodyMeasurementsService.getCurrentUserData(user.id),
        bodyMeasurementsService.getMeasurementStats(user.id),
      ]);

      setCurrentData(userData || undefined);
      setStats(measurementStats);

      // Calculate body composition if we have complete data
      if (
        userData &&
        userData.weight &&
        userData.neck &&
        userData.waist &&
        userData.gender &&
        userData.height
      ) {
        const composition = calculateNavyBodyComposition({
          gender: userData.gender,
          height: userData.height,
          weight: userData.weight,
          neck: userData.neck,
          waist: userData.waist,
          hip: userData.hip,
        });
        setBodyComposition(composition);
      }

      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Error loading user body composition data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, hasLoadedOnce]);

  // Load data when component becomes visible
  useEffect(() => {
    if (user && !hasLoadedOnce) {
      const timer = setTimeout(() => {
        loadUserData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, hasLoadedOnce, loadUserData]);

  // Show loading skeleton
  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">📊</span>
            Body Recomposition Analytics
          </h3>
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-500">Caricamento...</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Analizzando i tuoi dati...</p>
        </div>
      </div>
    );
  }

  // Calculate BMI and classification manually since they might not be in the interface
  const getBMI = () => {
    if (currentData?.weight && currentData?.height) {
      return currentData.weight / Math.pow(currentData.height / 100, 2);
    }
    return 0;
  };

  const getBodyFatClassification = (
    bodyFatPercentage: number,
    gender: string
  ) => {
    if (gender === "male") {
      if (bodyFatPercentage < 6) return "Extremely Low";
      if (bodyFatPercentage < 14) return "Athletic";
      if (bodyFatPercentage < 18) return "Good";
      if (bodyFatPercentage < 25) return "Acceptable";
      return "High";
    } else {
      if (bodyFatPercentage < 16) return "Extremely Low";
      if (bodyFatPercentage < 21) return "Athletic";
      if (bodyFatPercentage < 25) return "Good";
      if (bodyFatPercentage < 32) return "Acceptable";
      return "High";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Body Recomposition Analytics
        </h3>
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
          <span className="text-sm font-medium">US Navy Method</span>
        </div>
      </div>

      {stats && stats.hasCompleteData && bodyComposition ? (
        // Dashboard completa con dati
        <div className="space-y-6">
          {/* Indicatori principali */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {bodyComposition.bodyFatPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-700 font-medium">
                Grasso Corporeo
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {getBodyFatClassification(
                  bodyComposition.bodyFatPercentage,
                  currentData?.gender || "male"
                )}
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {bodyComposition.leanMass.toFixed(1)}kg
              </div>
              <div className="text-xs text-green-700 font-medium">
                Massa Magra
              </div>
              <div className="text-xs text-green-600 mt-1">
                {(
                  (bodyComposition.leanMass / (currentData?.weight || 1)) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {bodyComposition.fatMass.toFixed(1)}kg
              </div>
              <div className="text-xs text-purple-700 font-medium">
                Massa Grassa
              </div>
              <div className="text-xs text-purple-600 mt-1">
                -{bodyComposition.fatMass.toFixed(1)}kg target
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {currentData?.weight?.toFixed(1)}kg
              </div>
              <div className="text-xs text-orange-700 font-medium">
                Peso Attuale
              </div>
              <div className="text-xs text-orange-600 mt-1">
                BMI: {getBMI().toFixed(1)}
              </div>
            </div>
          </div>

          {/* Insights e consigli */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">🎯</span>I Tuoi Insights per la
              Trasformazione
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Target Fat Loss
                    </div>
                    <div className="text-sm text-gray-600">
                      Per raggiungere il 15% di grasso: -
                      {(
                        bodyComposition.fatMass -
                        (currentData?.weight || 0) * 0.15
                      ).toFixed(1)}
                      kg di grasso
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-xl">💪</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Muscle Preservation
                    </div>
                    <div className="text-sm text-gray-600">
                      Mantieni {bodyComposition.leanMass.toFixed(1)}kg di massa
                      magra con allenamento resistance
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-medium text-gray-900">Metabolismo</div>
                    <div className="text-sm text-gray-600">
                      ~{Math.round(bodyComposition.leanMass * 22)} kcal/day da
                      massa magra
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-xl">📈</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      Progress Tracking
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.totalMeasurements} misurazioni • Ogni{" "}
                      {Math.round(stats.averageFrequency)} giorni
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline e progress */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">📅</span>
              Timeline del Tuo Journey
            </h4>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div>
                  <div className="font-medium text-gray-900">
                    Inizio Journey
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.firstMeasurementDate
                      ? new Date(stats.firstMeasurementDate).toLocaleDateString(
                          "it-IT"
                        )
                      : "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Giorni attivi</div>
                  <div className="font-bold text-blue-600">
                    {stats.firstMeasurementDate
                      ? Math.ceil(
                          (new Date().getTime() -
                            new Date(stats.firstMeasurementDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div>
                  <div className="font-medium text-gray-900">
                    Ultima Misurazione
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.latestMeasurementDate
                      ? new Date(
                          stats.latestMeasurementDate
                        ).toLocaleDateString("it-IT")
                      : "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Frequenza</div>
                  <div className="font-bold text-green-600">
                    Ogni {Math.round(stats.averageFrequency)} giorni
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Stato senza dati completi
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🚀</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Inizia la Tua Trasformazione
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            I tuoi dati Navy body fat verranno raccolti durante l'onboarding e
            nei check-in settimanali. Qui vedrai analytics dettagliate sulla tua
            composizione corporea e progressi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-blue-900">Analytics</div>
              <div className="text-blue-700">
                Dashboard intelligenti per il tuo body recomposition
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-green-900">Targeting</div>
              <div className="text-green-700">
                Obiettivi personalizzati per massa magra e grassa
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-purple-900">Progress</div>
              <div className="text-purple-700">
                Tracking avanzato dei cambiamenti nel tempo
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Tip:</strong> Completa i check-in settimanali per
              vedere apparire qui le tue analytics dettagliate!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
