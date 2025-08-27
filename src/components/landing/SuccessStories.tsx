import React from "react";

// ✅ Interface per le props che il componente riceverà
interface SuccessStoriesProps {
  onStartOnboarding: () => void;
}

// ✅ Il componente ora riceve e usa la prop onStartOnboarding
export const SuccessStories: React.FC<SuccessStoriesProps> = ({
  onStartOnboarding,
}) => {
  // Success Stories Data
  const successStories = [
    {
      id: 1,
      name: "Sarah M.",
      age: 32,
      weightLost: "12kg",
      timeframe: "3 months",
      location: "London, UK",
      quote:
        "Lost 12kg with Maria and Paolo supporting me daily! Having two accountability partners made all the difference.",
      beforePhoto: "/images/sarah-before.jpg",
      afterPhoto: "/images/sarah-after.jpg",
      trioMembers: ["Maria", "Paolo"],
    },
    {
      id: 2,
      name: "Marco R.",
      age: 28,
      weightLost: "8kg",
      timeframe: "2 months",
      location: "Milan, IT",
      quote:
        "Best fitness experience ever - couldn't have done it alone. My trio kept me motivated through tough days.",
      beforePhoto: "/images/marco-before.jpg",
      afterPhoto: "/images/marco-after.jpg",
      trioMembers: ["Anna", "David"],
    },
    {
      id: 3,
      name: "Elena C.",
      age: 35,
      weightLost: "15kg",
      timeframe: "4 months",
      location: "Barcelona, ES",
      quote:
        "Finally found people who understand my struggles. The daily support was incredible.",
      beforePhoto: "/images/elena-before.jpg",
      afterPhoto: "/images/elena-after.jpg",
      trioMembers: ["Sophie", "Carlos"],
    },
    {
      id: 4,
      name: "James K.",
      age: 41,
      weightLost: "10kg",
      timeframe: "3 months",
      location: "Dublin, IE",
      quote:
        "The accountability was game-changing. Never felt alone in my journey.",
      beforePhoto: "/images/james-before.jpg",
      afterPhoto: "/images/james-after.jpg",
      trioMembers: ["Lisa", "Tom"],
    },
    {
      id: 5,
      name: "Lisa W.",
      age: 29,
      weightLost: "7kg",
      timeframe: "2.5 months",
      location: "Amsterdam, NL",
      quote:
        "My trio celebrated every small win with me. That motivation was everything!",
      beforePhoto: "/images/lisa-before.jpg",
      afterPhoto: "/images/lisa-after.jpg",
      trioMembers: ["Mike", "Emma"],
    },
    {
      id: 6,
      name: "Carlos V.",
      age: 36,
      weightLost: "11kg",
      timeframe: "3.5 months",
      location: "Madrid, ES",
      quote:
        "The science-backed approach with social support works. Results speak for themselves.",
      beforePhoto: "/images/carlos-before.jpg",
      afterPhoto: "/images/carlos-after.jpg",
      trioMembers: ["Ana", "Pedro"],
    },
  ];

  const stats = [
    { number: "12,000+", label: "Active Users" },
    { number: "94%", label: "Complete 90-Day Journey" },
    { number: "11.2kg", label: "Average Weight Loss" },
    { number: "92%", label: "Find Trio in 48h" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🌟 Real Transformations
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Meet people who've discovered the power of trio accountability.
            Their stories could be <strong>your story</strong>.
          </p>

          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-2xl"
              >
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {successStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Before/After Photos */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Before</span>
                    </div>
                    <div className="text-xs text-gray-400">Day 1</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-2xl">→</div>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-200 rounded-full mb-2 flex items-center justify-center">
                      <span className="text-xs text-green-700">After</span>
                    </div>
                    <div className="text-xs text-gray-400">Day 90</div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  -{story.weightLost}
                </div>
                <div className="text-sm text-gray-500">
                  in {story.timeframe}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">{story.name}</h3>
                <p className="text-sm text-gray-600">
                  {story.age} years • {story.location}
                </p>
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-gray-700 text-center mb-4 italic leading-relaxed">
                "{story.quote}"
              </blockquote>

              {/* Trio Info */}
              <div className="text-center text-xs text-blue-600">
                <span className="font-medium">Trio:</span>{" "}
                {story.trioMembers.join(" • ")}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">💪</div>
            <blockquote className="text-2xl md:text-3xl font-medium mb-6 leading-relaxed">
              "I tried every diet and workout plan for years. Nothing stuck
              until I found my trio. Having Sarah and Marco cheering me on every
              day made it feel effortless."
            </blockquote>
            <div className="flex justify-center items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">👩‍💼</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-xl">Elena Martinez</div>
                <div className="text-blue-200">
                  Lost 15kg in 4 months • Barcelona
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Metrics */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            The Numbers Don't Lie
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">70%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Higher Success Rate
              </div>
              <div className="text-gray-600 text-sm">
                Compared to going it alone, trio accountability delivers 70%
                better results
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">46%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Better Long-Term Results
              </div>
              <div className="text-gray-600 text-sm">
                Trinity users maintain their weight loss 46% better than
                individual dieters
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">83%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Don't Quit First 60 Days
              </div>
              <div className="text-gray-600 text-sm">
                The critical period where most people fail - trio support
                changes everything
              </div>
            </div>
          </div>
        </div>

        {/* Video Testimonials Placeholder */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            📹 Hear Their Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((video) => (
              <div
                key={video}
                className="bg-gray-100 rounded-2xl p-6 aspect-video flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">▶️</div>
                  <div className="text-sm text-gray-600">
                    Video Testimonial #{video}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - AGGIORNATO CON NAVIGAZIONE ✅ */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Your Success Story Starts Here
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands who've transformed their lives with Trinity Fat Loss
            trio accountability
          </p>
          <button
            onClick={onStartOnboarding}
            className="trinity-button-primary text-xl px-12 py-4 mb-4"
          >
            🎯 Start My Transformation Journey
          </button>
          <div className="text-sm text-gray-500">
            ✅ Free to start • ✅ Find your trio in 48h • ✅ Join 12,000+
            successful transformations
          </div>

          {/* Additional Social Proof */}
          <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.8/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Best Fitness App 2024</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔬</span>
              <span>Scientifically Proven</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
