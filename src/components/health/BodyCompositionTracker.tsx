import React, { useState } from "react";
import {
  calculateNavyBodyComposition,
  calculateBMI,
  getHealthInsights,
  calculateMeasurementAccuracy,
} from "../../lib/healthMetrics";
import type {
  NavyMeasurements,
  NavyBodyComposition,
  BMIResult,
} from "../../lib/healthMetrics";

interface BodyCompositionTrackerProps {
  initialData?: Partial<NavyMeasurements>;
  onSave?: (
    measurements: NavyMeasurements,
    composition: NavyBodyComposition
  ) => void;
  showDetailedInstructions?: boolean;
}

export const BodyCompositionTracker: React.FC<BodyCompositionTrackerProps> = ({
  initialData,
  onSave,
  showDetailedInstructions = true,
}) => {
  const [measurements, setMeasurements] = useState<NavyMeasurements>({
    weight: initialData?.weight || 70,
    height: initialData?.height || 170,
    neck: initialData?.neck || 35,
    waist: initialData?.waist || 80,
    hip:
      initialData?.hip || (initialData?.gender === "female" ? 90 : undefined),
    gender: initialData?.gender || "male",
  });

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    navy: NavyBodyComposition;
    bmi: BMIResult;
    accuracy: {
      score: number;
      feedback: string[];
      warnings: string[];
    };
    insights: {
      insights: string[];
      recommendations: string[];
      bodyComposition?: {
        fatMass: string;
        leanMass: string;
        category: string;
        comparison: string;
      };
    };
  } | null>(null);

  const updateMeasurement = (
    field: keyof NavyMeasurements,
    value: number | string
  ) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateResults = () => {
    try {
      const navyComposition = calculateNavyBodyComposition(measurements);
      const bmiResult = calculateBMI(measurements.weight, measurements.height);
      const accuracy = calculateMeasurementAccuracy(measurements);
      const insights = getHealthInsights(
        bmiResult,
        30,
        measurements.gender,
        navyComposition
      ); // Assuming age 30 for now

      const calculatedResults = {
        navy: navyComposition,
        bmi: bmiResult,
        accuracy,
        insights,
      };

      setResults(calculatedResults);
      setShowResults(true);

      if (onSave) {
        onSave(measurements, navyComposition);
      }
    } catch (error) {
      alert(
        `Errore nel calcolo: ${
          error instanceof Error ? error.message : "Errore sconosciuto"
        }`
      );
    }
  };

  const isValid = () => {
    return (
      measurements.weight > 0 &&
      measurements.height > 0 &&
      measurements.neck > 0 &&
      measurements.waist > 0 &&
      (measurements.gender === "male" ||
        (measurements.hip && measurements.hip > 0))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🏊‍♂️ Analisi Composizione Corporea
        </h2>
        <p className="text-lg text-gray-600">
          Metodo US Navy - Il più accurato senza strumenti professionali
        </p>
      </div>

      {showDetailedInstructions && (
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            📏 Come Misurare Correttamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🏷️ Collo:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Misura sotto il pomo d'Adamo</li>
                <li>• Metro aderente ma non stretto</li>
                <li>• Testa dritta, sguardo avanti</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📐 Vita:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Punto più stretto del busto</li>
                <li>• Senza trattenere il respiro</li>
                <li>• Metro parallelo al pavimento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                🍑 Fianchi (Solo Donne):
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Punto più largo dei fianchi</li>
                <li>• Include i glutei nella misura</li>
                <li>• Piedi uniti, peso distribuito</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">⚖️ Peso:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Al mattino, a digiuno</li>
                <li>• Dopo aver usato il bagno</li>
                <li>• Stessa bilancia sempre</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            📝 Inserisci le tue misure
          </h3>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Sesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => updateMeasurement("gender", gender)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    measurements.gender === gender
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {gender === "male" ? "👨 Uomo" : "👩 Donna"}
                </button>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚖️ Peso (kg)
            </label>
            <input
              type="number"
              value={measurements.weight}
              onChange={(e) =>
                updateMeasurement("weight", parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📏 Altezza (cm)
            </label>
            <input
              type="number"
              value={measurements.height}
              onChange={(e) =>
                updateMeasurement("height", parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="140"
              max="220"
              step="0.5"
            />
          </div>

          {/* Neck */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Circonferenza Collo (cm)
            </label>
            <input
              type="number"
              value={measurements.neck}
              onChange={(e) =>
                updateMeasurement("neck", parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="25"
              max="60"
              step="0.5"
            />
          </div>

          {/* Waist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📐 Circonferenza Vita (cm)
            </label>
            <input
              type="number"
              value={measurements.waist}
              onChange={(e) =>
                updateMeasurement("waist", parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="50"
              max="200"
              step="0.5"
            />
          </div>

          {/* Hip (females only) */}
          {measurements.gender === "female" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🍑 Circonferenza Fianchi (cm)
              </label>
              <input
                type="number"
                value={measurements.hip || ""}
                onChange={(e) =>
                  updateMeasurement("hip", parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="70"
                max="200"
                step="0.5"
              />
            </div>
          )}

          <button
            onClick={calculateResults}
            disabled={!isValid()}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-105 transition-all duration-300"
          >
            🧮 Calcola Composizione Corporea
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            📊 I tuoi risultati
          </h3>

          {!showResults ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📈</div>
              <p>Inserisci le misure per vedere i risultati</p>
            </div>
          ) : (
            results && (
              <div className="space-y-6">
                {/* Navy Body Composition */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">{results.navy.emoji}</span>
                    Composizione Corporea (Metodo Navy)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {results.navy.bodyFatPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Grasso Corporeo
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.navy.categoryLabel}
                      </div>
                      <div className="text-sm text-gray-600">Categoria</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-red-500">
                        {results.navy.fatMass} kg
                      </div>
                      <div className="text-xs text-gray-600">Massa Grassa</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-green-500">
                        {results.navy.leanMass} kg
                      </div>
                      <div className="text-xs text-gray-600">Massa Magra</div>
                    </div>
                  </div>
                </div>

                {/* BMI */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">{results.bmi.emoji}</span>
                    Indice di Massa Corporea
                  </h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-2">
                      {results.bmi.bmi}
                    </div>
                    <div className="text-lg text-gray-600">
                      {results.bmi.categoryLabel}
                    </div>
                  </div>
                </div>

                {/* Accuracy Score */}
                <div className="bg-yellow-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 Accuratezza Misurazioni
                  </h4>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.accuracy.score}/100
                    </div>
                  </div>
                  {results.accuracy.warnings.length > 0 && (
                    <div className="space-y-2">
                      {results.accuracy.warnings.map(
                        (warning: string, index: number) => (
                          <div
                            key={index}
                            className="text-sm text-yellow-700 bg-yellow-100 rounded-lg p-2"
                          >
                            ⚠️ {warning}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {results.accuracy.feedback.map(
                      (tip: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {tip}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Health Insights */}
                <div className="bg-green-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    💡 Analisi e Raccomandazioni
                  </h4>
                  <div className="space-y-3">
                    {results.insights.insights.map(
                      (insight: string, index: number) => (
                        <div
                          key={index}
                          className="text-sm text-green-700 bg-green-100 rounded-lg p-3"
                        >
                          {insight}
                        </div>
                      )
                    )}
                  </div>
                  {results.insights.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-green-800 mb-2">
                        Raccomandazioni:
                      </h5>
                      <div className="space-y-2">
                        {results.insights.recommendations.map(
                          (rec: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-green-600 flex items-start"
                            >
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
