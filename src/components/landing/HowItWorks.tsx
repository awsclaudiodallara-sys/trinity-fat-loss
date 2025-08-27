import React from "react";

// ✅ Interface per le props che il componente riceverà
interface HowItWorksProps {
  onStartOnboarding: () => void;
}

// ✅ Il componente ora riceve e usa la prop onStartOnboarding
export const HowItWorks: React.FC<HowItWorksProps> = ({
  onStartOnboarding,
}) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🎯 How Trinity Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your transformation journey in 5 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
          {/* Step 1 - MATCH */}
          <div className="text-center">
            <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              1
            </div>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">MATCH</h3>
            <p className="text-gray-600 text-sm">
              Get paired with 2 compatible partners based on your goals, age,
              and language
            </p>
          </div>

          {/* Step 2 - SUPPORT */}
          <div className="text-center">
            <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              2
            </div>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              SUPPORT
            </h3>
            <p className="text-gray-600 text-sm">
              Daily chat motivation from your trio keeps you accountable and
              motivated
            </p>
          </div>

          {/* Step 3 - CONNECT */}
          <div className="text-center">
            <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              3
            </div>
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              CONNECT
            </h3>
            <p className="text-gray-600 text-sm">
              Weekly 20-min video calls for problem-solving and deeper
              connection
            </p>
          </div>

          {/* Step 4 - TRACK */}
          <div className="text-center">
            <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              4
            </div>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">TRACK</h3>
            <p className="text-gray-600 text-sm">
              7 daily + 4 weekly tasks together. Progress tracking made simple
              and social
            </p>
          </div>

          {/* Step 5 - TRANSFORM */}
          <div className="text-center">
            <div className="bg-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              5
            </div>
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              TRANSFORM
            </h3>
            <p className="text-gray-600 text-sm">
              90-day journey with real accountability leads to lasting
              transformation
            </p>
          </div>
        </div>

        {/* Process Visualization */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🔬 Why This Works: The Science
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <h4 className="text-lg font-semibold mb-3">
                Social Accountability
              </h4>
              <p className="text-gray-600 text-sm">
                Your brain treats shared goals as "social debts" that must be
                honored
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="text-lg font-semibold mb-3">Identity Shift</h4>
              <p className="text-gray-600 text-sm">
                From "person trying to get fit" to "fitness person" through
                group identity
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="text-lg font-semibold mb-3">Dopamine Loops</h4>
              <p className="text-gray-600 text-sm">
                Celebrating with others creates addictive positive feedback
                cycles
              </p>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">70%</div>
            <div className="text-sm text-gray-600">Higher Success Rate</div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">46%</div>
            <div className="text-sm text-gray-600">Better Maintenance</div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">3-5h</div>
            <div className="text-sm text-gray-600">More Exercise/Week</div>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">83%</div>
            <div className="text-sm text-gray-600">
              Don't Quit First 2 Months
            </div>
          </div>
        </div>

        {/* CTA Section - AGGIORNATO CON NAVIGAZIONE ✅ */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Transformation?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands who've discovered the power of trio accountability
          </p>
          <button
            onClick={onStartOnboarding}
            className="trinity-button-primary text-lg px-10 py-4"
          >
            🚀 Find My Perfect Trio
          </button>
          <div className="mt-4 text-sm text-gray-500">
            ✅ Free to start • ✅ Matching in 48h • ✅ Scientifically proven
          </div>
        </div>
      </div>
    </section>
  );
};
