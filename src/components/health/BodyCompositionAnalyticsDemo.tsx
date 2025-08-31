import React, { useState } from "react";
// import { AchievementsAnalytics } from "../gamification/AchievementsAnalytics";

// Mock data per dimostrare le analytics
const mockBodyCompositionHistory = [
  {
    date: "2025-08-01",
    bodyFat: 25.5,
    leanMass: 65.2,
    fatMass: 22.3,
    weight: 87.5,
  },
  {
    date: "2025-08-08",
    bodyFat: 24.8,
    leanMass: 65.8,
    fatMass: 21.7,
    weight: 87.5,
  },
  {
    date: "2025-08-15",
    bodyFat: 24.1,
    leanMass: 66.4,
    fatMass: 21.1,
    weight: 87.5,
  },
  {
    date: "2025-08-22",
    bodyFat: 23.6,
    leanMass: 66.9,
    fatMass: 20.6,
    weight: 87.5,
  },
  {
    date: "2025-08-28",
    bodyFat: 23.2,
    leanMass: 67.3,
    fatMass: 20.2,
    weight: 87.5,
  },
];

const mockMeasurements = [
  { date: "2025-08-01", neck: 38.5, waist: 92.0, hip: 98.0, weight: 87.5 },
  { date: "2025-08-08", neck: 38.3, waist: 91.2, hip: 97.5, weight: 87.5 },
  { date: "2025-08-15", neck: 38.1, waist: 90.5, hip: 97.0, weight: 87.5 },
  { date: "2025-08-22", neck: 37.9, waist: 89.8, hip: 96.5, weight: 87.5 },
  { date: "2025-08-28", neck: 37.7, waist: 89.0, hip: 96.0, weight: 87.5 },
];

export const BodyCompositionAnalyticsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "predictions" | "goals" | "achievements"
  >("overview");

  // Calcoli per insights
  const latestData =
    mockBodyCompositionHistory[mockBodyCompositionHistory.length - 1];
  const firstData = mockBodyCompositionHistory[0];
  const bodyFatLoss = firstData.bodyFat - latestData.bodyFat;
  const leanMassGain = latestData.leanMass - firstData.leanMass;
  const fatMassLoss = firstData.fatMass - latestData.fatMass;

  // Simple SVG Line Chart Component
  const LineChart = ({
    data,
    color,
    label,
  }: {
    data: number[];
    color: string;
    label: string;
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 300;
    const height = 120;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{label}</h4>
        <svg width={width} height={height} className="border rounded">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return <circle key={index} cx={x} cy={y} r="3" fill={color} />;
          })}
        </svg>
        <div className="text-xs text-gray-500 mt-1">
          Ultimo: {data[data.length - 1].toFixed(1)} | Trend:{" "}
          {data[data.length - 1] > data[0] ? "📈" : "📉"}
        </div>
      </div>
    );
  };

  // Progress Ring Component
  const ProgressRing = ({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = "#3B82F6",
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-lg font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-2">
          🚀 Trinity Body Recomposition Analytics
        </h1>
        <p className="text-blue-100">
          Dashboard avanzata per il tracking della trasformazione corporea
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "overview", label: "📊 Overview", icon: "📊" },
          { key: "trends", label: "📈 Trends", icon: "📈" },
          { key: "predictions", label: "🔮 Predictions", icon: "🔮" },
          { key: "goals", label: "🎯 Goals", icon: "🎯" },
          { key: "achievements", label: "🏆 Achievements", icon: "🏆" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(
                tab.key as
                  | "overview"
                  | "trends"
                  | "predictions"
                  | "goals"
                  | "achievements"
              )
            }
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎯</span>
                <ProgressRing percentage={76.8} size={60} color="#3B82F6" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {latestData.bodyFat.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700">Body Fat</div>
              <div className="text-xs text-blue-600 mt-1">
                Target: 15% (-{(latestData.bodyFat - 15).toFixed(1)}%)
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💪</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    +{leanMassGain.toFixed(1)}kg
                  </div>
                  <div className="text-xs text-green-600">Gained</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {latestData.leanMass.toFixed(1)}kg
              </div>
              <div className="text-sm text-green-700">Lean Mass</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    -{fatMassLoss.toFixed(1)}kg
                  </div>
                  <div className="text-xs text-red-600">Lost</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {latestData.fatMass.toFixed(1)}kg
              </div>
              <div className="text-sm text-red-700">Fat Mass</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⚖️</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    ±0.0kg
                  </div>
                  <div className="text-xs text-purple-600">Stable</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {latestData.weight.toFixed(1)}kg
              </div>
              <div className="text-sm text-purple-700">Weight</div>
            </div>
          </div>

          {/* Body Composition Visualization */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🧬</span>
              Composizione Corporea Attuale
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Body Composition Pie */}
              <div className="text-center">
                <div className="relative inline-block">
                  <ProgressRing
                    percentage={(latestData.leanMass / latestData.weight) * 100}
                    size={200}
                    strokeWidth={20}
                    color="#10B981"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {latestData.weight.toFixed(1)}kg
                      </div>
                      <div className="text-sm text-gray-600">Peso Totale</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Massa Magra: {latestData.leanMass.toFixed(1)}kg</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Massa Grassa: {latestData.fatMass.toFixed(1)}kg</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Body Fat Reduction Progress</span>
                    <span>
                      {((bodyFatLoss / (firstData.bodyFat - 15)) * 100).toFixed(
                        0
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (bodyFatLoss / (firstData.bodyFat - 15)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Target: 15% body fat (-
                    {(latestData.bodyFat - 15).toFixed(1)}% to go)
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Muscle Preservation</span>
                    <span>💪 Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full w-full"></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    +{leanMassGain.toFixed(1)}kg lean mass gained (target:
                    maintain/gain)
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat Loss Efficiency</span>
                    <span>🔥 High</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-3 rounded-full w-5/6"></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    -{fatMassLoss.toFixed(1)}kg fat lost while gaining muscle
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🧠</span>
                <h4 className="font-semibold text-indigo-900">AI Insights</h4>
              </div>
              <p className="text-sm text-indigo-800 mb-3">
                Il tuo corpo sta rispondendo eccellentemente al programma. La
                perdita di grasso con guadagno muscolare indica un protocollo
                ottimale.
              </p>
              <div className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                Recomposition Rate: A+
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">⚡</span>
                <h4 className="font-semibold text-green-900">Metabolismo</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                La tua massa magra di {latestData.leanMass.toFixed(1)}kg brucia
                ~{Math.round(latestData.leanMass * 22)} kcal/giorno a riposo.
              </p>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Metabolic Health: Excellent
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎯</span>
                <h4 className="font-semibold text-orange-900">
                  Next Milestone
                </h4>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                A questo ritmo raggiungerai il 20% di body fat in ~3 settimane
                mantenendo la massa muscolare.
              </p>
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                ETA: 3 weeks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="text-2xl mr-3">📈</span>
              Andamento Composizione Corporea (4 settimane)
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <LineChart
                data={mockBodyCompositionHistory.map((d) => d.bodyFat)}
                color="#EF4444"
                label="Body Fat Percentage (%)"
              />
              <LineChart
                data={mockBodyCompositionHistory.map((d) => d.leanMass)}
                color="#10B981"
                label="Lean Mass (kg)"
              />
              <LineChart
                data={mockBodyCompositionHistory.map((d) => d.fatMass)}
                color="#F59E0B"
                label="Fat Mass (kg)"
              />
              <LineChart
                data={mockMeasurements.map((d) => d.waist)}
                color="#8B5CF6"
                label="Waist Circumference (cm)"
              />
            </div>

            {/* Trend Analysis */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                📊 Analisi Trends
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-red-600">Body Fat Trend</div>
                  <div className="text-red-800">
                    -{bodyFatLoss.toFixed(1)}% in 4 settimane
                  </div>
                  <div className="text-xs text-gray-600">
                    ~-0.58% per settimana
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-green-600">
                    Lean Mass Trend
                  </div>
                  <div className="text-green-800">
                    +{leanMassGain.toFixed(1)}kg in 4 settimane
                  </div>
                  <div className="text-xs text-gray-600">
                    ~+0.52kg per settimana
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-purple-600">Waist Trend</div>
                  <div className="text-purple-800">-3.0cm in 4 settimane</div>
                  <div className="text-xs text-gray-600">
                    ~-0.75cm per settimana
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="text-2xl mr-3">🔮</span>
              Proiezioni AI-Powered (prossimi 3 mesi)
            </h3>

            {/* Timeline Predictions */}
            <div className="space-y-4">
              {[
                {
                  weeks: 2,
                  bodyFat: 22.6,
                  leanMass: 67.8,
                  confidence: 95,
                  milestone: "Body fat sotto 23%",
                },
                {
                  weeks: 4,
                  bodyFat: 21.8,
                  leanMass: 68.5,
                  confidence: 88,
                  milestone: "Definizione muscolare visibile",
                },
                {
                  weeks: 8,
                  bodyFat: 20.2,
                  leanMass: 69.8,
                  confidence: 75,
                  milestone: "Body fat target 20%",
                },
                {
                  weeks: 12,
                  bodyFat: 18.5,
                  leanMass: 71.0,
                  confidence: 65,
                  milestone: "Fisico atletico definitivo",
                },
              ].map((pred, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      📅 Settimana {pred.weeks} (
                      {new Date(
                        Date.now() + pred.weeks * 7 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("it-IT")}
                      )
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {pred.confidence}%
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-red-600 font-medium">
                        Body Fat: {pred.bodyFat}%
                      </span>
                      <div className="text-xs text-gray-600">
                        ({latestData.bodyFat > pred.bodyFat ? "-" : "+"}
                        {Math.abs(latestData.bodyFat - pred.bodyFat).toFixed(1)}
                        % vs oggi)
                      </div>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">
                        Lean Mass: {pred.leanMass}kg
                      </span>
                      <div className="text-xs text-gray-600">
                        (+{(pred.leanMass - latestData.leanMass).toFixed(1)}kg
                        vs oggi)
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">
                        🎯 {pred.milestone}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${pred.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prediction Factors */}
            <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3">
                ⚠️ Fattori che Influenzano le Previsioni
              </h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <div>• Consistenza nell'alimentazione e allenamento</div>
                <div>• Qualità del sonno e gestione dello stress</div>
                <div>• Aderenza ai check-in settimanali Trinity</div>
                <div>• Possibili plateau metabolici dopo 6-8 settimane</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              Obiettivi e Milestones
            </h3>

            {/* Goal Categories */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Primary Goals */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  🥇 Obiettivi Primari
                </h4>
                <div className="space-y-3">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-900">
                        Body Fat Target: 15%
                      </span>
                      <span className="text-sm text-red-600">
                        {(
                          ((firstData.bodyFat - latestData.bodyFat) /
                            (firstData.bodyFat - 15)) *
                          100
                        ).toFixed(0)}
                        % complete
                      </span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((firstData.bodyFat - latestData.bodyFat) /
                              (firstData.bodyFat - 15)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-red-700 mt-1">
                      Attuale: {latestData.bodyFat.toFixed(1)}% | Rimanente: -
                      {(latestData.bodyFat - 15).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-900">
                        Muscle Maintenance: &gt;65kg
                      </span>
                      <span className="text-sm text-green-600">
                        ✅ Superato
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Attuale: {latestData.leanMass.toFixed(1)}kg | Bonus: +
                      {(latestData.leanMass - 65).toFixed(1)}kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Goals */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  🥈 Obiettivi Secondari
                </h4>
                <div className="space-y-3">
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-purple-900">
                        Waist: &lt;90cm
                      </span>
                      <span className="text-sm text-purple-600">
                        98% complete
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full w-full"></div>
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Attuale: 89.0cm | Target raggiunto! 🎉
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-900">
                        Body Fat &lt;20%
                      </span>
                      <span className="text-sm text-blue-600">
                        67% complete
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-2/3"></div>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      ETA: ~6 settimane | -3.2% rimanenti
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                🏆 Achievement Unlocked
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: "🔥",
                    title: "Fat Burner",
                    desc: "-2kg fat in 4 weeks",
                    unlocked: true,
                  },
                  {
                    icon: "💪",
                    title: "Muscle Builder",
                    desc: "+2kg lean mass",
                    unlocked: true,
                  },
                  {
                    icon: "🎯",
                    title: "Precision",
                    desc: "Body recomposition",
                    unlocked: true,
                  },
                  {
                    icon: "⚡",
                    title: "Consistency",
                    desc: "4 weeks streak",
                    unlocked: true,
                  },
                  {
                    icon: "🏃",
                    title: "Athletic",
                    desc: "<20% body fat",
                    unlocked: false,
                  },
                  {
                    icon: "🦾",
                    title: "Strong",
                    desc: ">70kg lean mass",
                    unlocked: false,
                  },
                  {
                    icon: "👑",
                    title: "Champion",
                    desc: "15% body fat",
                    unlocked: false,
                  },
                  {
                    icon: "🏆",
                    title: "Legend",
                    desc: "12 months journey",
                    unlocked: false,
                  },
                ].map((badge, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-center ${
                      badge.unlocked
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div
                      className={`text-sm font-medium ${
                        badge.unlocked ? "text-yellow-900" : "text-gray-600"
                      }`}
                    >
                      {badge.title}
                    </div>
                    <div
                      className={`text-xs ${
                        badge.unlocked ? "text-yellow-700" : "text-gray-500"
                      }`}
                    >
                      {badge.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          {/* <AchievementsAnalytics /> */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">🚧 Achievement Analytics in via di sviluppo</p>
          </div>

          {/* Mock Integration Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-900">
              <span className="text-2xl mr-3">🚀</span>
              Body Composition Achievement Integration
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Achievement Progress Simulation */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  Current Progress Tracking
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">🥊</span>
                      <span className="text-sm font-medium">Fat Fighter</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      ✅ UNLOCKED
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">⚡</span>
                      <span className="text-sm font-medium">
                        Lean Machine (20% BF)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-600 font-bold">
                        97% Complete
                      </div>
                      <div className="text-xs text-gray-600">-0.8% to go</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">💪</span>
                      <span className="text-sm font-medium">
                        Strength Seeker (65kg)
                      </span>
                    </div>
                    <span className="text-blue-600 font-bold">✅ UNLOCKED</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">🧬</span>
                      <span className="text-sm font-medium">
                        Body Alchemist
                      </span>
                    </div>
                    <span className="text-purple-600 font-bold">
                      ✅ UNLOCKED
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Body Composition Achievements */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  Next Body Comp Goals
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🏆</span>
                        <span className="text-sm font-medium">
                          Athletic Physique
                        </span>
                      </div>
                      <span className="text-green-600 font-bold">+200 pts</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Reach 15% body fat or lower
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ETA: ~6 weeks
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🦾</span>
                        <span className="text-sm font-medium">
                          Power Builder
                        </span>
                      </div>
                      <span className="text-orange-600 font-bold">
                        +200 pts
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Reach 70kg lean mass
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ETA: ~4 weeks
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🎯</span>
                        <span className="text-sm font-medium">
                          Trim Triumph
                        </span>
                      </div>
                      <span className="text-blue-600 font-bold">+100 pts</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Reduce waist to 90cm or less
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✅ Already achieved!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Info */}
            <div className="mt-6 bg-indigo-100 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Sistema di Integrazione Automatica
              </h4>
              <div className="text-sm text-indigo-800 space-y-1">
                <div>
                  • Achievements automaticamente sbloccati in base ai progressi
                  body composition
                </div>
                <div>• Notifiche real-time per nuovi achievement raggiunti</div>
                <div>
                  • Sistema di punti integrato con gamification generale Trinity
                </div>
                <div>
                  • Achievement trio per motivazione di gruppo su trasformazioni
                  fisiche
                </div>
                <div>
                  • Previsioni AI per stimare quando sbloccare achievement
                  futuri
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
