import React from "react";

interface AchievementFiltersProps {
  categories: string[];
  rarities: string[];
  selectedCategory: string;
  selectedRarity: string;
  onCategoryChange: (category: string) => void;
  onRarityChange: (rarity: string) => void;
}

export const AchievementFilters: React.FC<AchievementFiltersProps> = ({
  categories,
  rarities,
  selectedCategory,
  selectedRarity,
  onCategoryChange,
  onRarityChange,
}) => {
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    onCategoryChange(value);
  };

  const handleRarityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onRarityChange(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            🎯 Filtri Achievement
          </h3>
          <p className="text-sm text-gray-600">
            Personalizza la visualizzazione dei tuoi achievement
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📁 Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="
                block w-full px-4 py-3 
                border border-gray-300 rounded-lg 
                shadow-sm focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm font-medium bg-white
                min-w-[180px]
              "
            >
              <option value="all">🔍 Tutte le categorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  📂{" "}
                  {category
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💎 Rarità
            </label>
            <select
              value={selectedRarity}
              onChange={handleRarityChange}
              className="
                block w-full px-4 py-3 
                border border-gray-300 rounded-lg 
                shadow-sm focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm font-medium bg-white
                min-w-[180px]
              "
            >
              <option value="all">✨ Tutte le rarità</option>
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity === "legendary" && "👑 Leggendario"}
                  {rarity === "epic" && "💎 Epico"}
                  {rarity === "rare" && "⭐ Raro"}
                  {rarity === "common" && "🎯 Comune"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
