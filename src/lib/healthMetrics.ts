/**
 * Health metrics utilities using height data and US Navy body fat method
 */

export interface BMIResult {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  categoryLabel: string;
  emoji: string;
}

export interface NavyBodyComposition {
  bodyFatPercentage: number;
  fatMass: number; // kg
  leanMass: number; // kg
  category: "essential" | "athletic" | "fitness" | "average" | "obese";
  categoryLabel: string;
  emoji: string;
}

export interface NavyMeasurements {
  weight: number; // kg
  height: number; // cm
  neck: number; // cm
  waist: number; // cm
  hip?: number; // cm (only for females)
  gender: "male" | "female";
}

/**
 * Calculate BMI (Body Mass Index)
 * @param weight Weight in kg
 * @param height Height in cm
 * @returns BMI result with category and label
 */
export const calculateBMI = (weight: number, height: number): BMIResult => {
  if (weight <= 0 || height <= 0) {
    throw new Error("Weight and height must be positive numbers");
  }

  // Convert height from cm to meters
  const heightInMeters = height / 100;

  // Calculate BMI
  const bmi = weight / (heightInMeters * heightInMeters);

  // Determine category
  let category: BMIResult["category"];
  let categoryLabel: string;
  let emoji: string;

  if (bmi < 18.5) {
    category = "underweight";
    categoryLabel = "Sottopeso";
    emoji = "📉";
  } else if (bmi < 25) {
    category = "normal";
    categoryLabel = "Normale";
    emoji = "✅";
  } else if (bmi < 30) {
    category = "overweight";
    categoryLabel = "Sovrappeso";
    emoji = "⚠️";
  } else {
    category = "obese";
    categoryLabel = "Obesità";
    emoji = "🚨";
  }

  return {
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    category,
    categoryLabel,
    emoji,
  };
};

/**
 * Calculate ideal weight range based on height
 * @param height Height in cm
 * @returns Object with min and max ideal weight
 */
export const calculateIdealWeightRange = (height: number) => {
  if (height <= 0) {
    throw new Error("Height must be a positive number");
  }

  const heightInMeters = height / 100;

  // Using BMI 18.5-24.9 as ideal range
  const minWeight = 18.5 * (heightInMeters * heightInMeters);
  const maxWeight = 24.9 * (heightInMeters * heightInMeters);

  return {
    min: Math.round(minWeight * 10) / 10,
    max: Math.round(maxWeight * 10) / 10,
  };
};

/**
 * Calculate body composition using US Navy method
 * This is the most accurate method without expensive equipment
 * @param measurements User measurements including neck, waist, hip circumferences
 * @returns Complete body composition analysis
 */
export const calculateNavyBodyComposition = (
  measurements: NavyMeasurements
): NavyBodyComposition => {
  const { weight, height, neck, waist, hip, gender } = measurements;

  // Validate inputs
  if (weight <= 0 || height <= 0 || neck <= 0 || waist <= 0) {
    throw new Error("All measurements must be positive numbers");
  }

  if (gender === "female" && (!hip || hip <= 0)) {
    throw new Error("Hip measurement is required for females");
  }

  // Convert height to inches for Navy formula
  const heightInches = height / 2.54;

  let bodyFatPercentage: number;

  if (gender === "male") {
    // US Navy formula for males: % Body Fat = 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
    const logAbdomenMinusNeck = Math.log10(waist - neck);
    const logHeight = Math.log10(heightInches);

    bodyFatPercentage =
      86.01 * logAbdomenMinusNeck - 70.041 * logHeight + 36.76;
  } else {
    // US Navy formula for females: % Body Fat = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    const logWaistPlusHipMinusNeck = Math.log10(waist + (hip || 0) - neck);
    const logHeight = Math.log10(heightInches);

    bodyFatPercentage =
      163.205 * logWaistPlusHipMinusNeck - 97.684 * logHeight - 78.387;
  }

  // Ensure reasonable bounds
  bodyFatPercentage = Math.max(2, Math.min(50, bodyFatPercentage));

  // Calculate fat mass and lean mass
  const fatMass = (bodyFatPercentage / 100) * weight;
  const leanMass = weight - fatMass;

  // Determine category based on gender and body fat percentage
  let category: NavyBodyComposition["category"];
  let categoryLabel: string;
  let emoji: string;

  if (gender === "male") {
    if (bodyFatPercentage < 6) {
      category = "essential";
      categoryLabel = "Grasso Essenziale";
      emoji = "🔥";
    } else if (bodyFatPercentage < 14) {
      category = "athletic";
      categoryLabel = "Atletico";
      emoji = "💪";
    } else if (bodyFatPercentage < 18) {
      category = "fitness";
      categoryLabel = "Fitness";
      emoji = "✅";
    } else if (bodyFatPercentage < 25) {
      category = "average";
      categoryLabel = "Nella Media";
      emoji = "📊";
    } else {
      category = "obese";
      categoryLabel = "Elevato";
      emoji = "⚠️";
    }
  } else {
    if (bodyFatPercentage < 16) {
      category = "essential";
      categoryLabel = "Grasso Essenziale";
      emoji = "🔥";
    } else if (bodyFatPercentage < 20) {
      category = "athletic";
      categoryLabel = "Atletico";
      emoji = "💪";
    } else if (bodyFatPercentage < 25) {
      category = "fitness";
      categoryLabel = "Fitness";
      emoji = "✅";
    } else if (bodyFatPercentage < 32) {
      category = "average";
      categoryLabel = "Nella Media";
      emoji = "📊";
    } else {
      category = "obese";
      categoryLabel = "Elevato";
      emoji = "⚠️";
    }
  }

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    fatMass: Math.round(fatMass * 10) / 10,
    leanMass: Math.round(leanMass * 10) / 10,
    category,
    categoryLabel,
    emoji,
  };
};

/**
 * Get ideal body fat ranges by gender and age
 * @param gender User gender
 * @param age User age
 * @returns Ideal body fat percentage ranges
 */
export const getIdealBodyFatRange = (
  gender: "male" | "female",
  age: number
) => {
  const ranges = {
    male: {
      "20-29": { min: 7, max: 17 },
      "30-39": { min: 12, max: 21 },
      "40-49": { min: 14, max: 23 },
      "50-59": { min: 16, max: 25 },
      "60+": { min: 17, max: 25 },
    },
    female: {
      "20-29": { min: 16, max: 24 },
      "30-39": { min: 17, max: 25 },
      "40-49": { min: 19, max: 28 },
      "50-59": { min: 22, max: 31 },
      "60+": { min: 22, max: 33 },
    },
  };

  let ageGroup: string;
  if (age < 30) ageGroup = "20-29";
  else if (age < 40) ageGroup = "30-39";
  else if (age < 50) ageGroup = "40-49";
  else if (age < 60) ageGroup = "50-59";
  else ageGroup = "60+";

  return ranges[gender][ageGroup as keyof typeof ranges.male];
};

/**
 * Calculate measurement accuracy score
 * @param measurements User measurements
 * @returns Score from 0-100 indicating measurement reliability
 */
export const calculateMeasurementAccuracy = (
  measurements: NavyMeasurements
): {
  score: number;
  feedback: string[];
  warnings: string[];
} => {
  const feedback: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  const { weight, height, neck, waist, hip, gender } = measurements;

  // Check for reasonable proportions
  const waistToNeckRatio = waist / neck;
  if (waistToNeckRatio < 1.1 || waistToNeckRatio > 3.0) {
    score -= 20;
    warnings.push("Rapporto vita/collo inusuale - verifica le misurazioni");
  }

  if (gender === "female" && hip) {
    const waistToHipRatio = waist / hip;
    if (waistToHipRatio < 0.6 || waistToHipRatio > 1.2) {
      score -= 15;
      warnings.push("Rapporto vita/fianchi inusuale - verifica le misurazioni");
    }
  }

  // Check BMI consistency
  const bmi = calculateBMI(weight, height).bmi;
  const expectedWaist = bmi > 25 ? height * 0.5 : height * 0.45;
  const waistDifference = Math.abs(waist - expectedWaist) / expectedWaist;

  if (waistDifference > 0.3) {
    score -= 10;
    feedback.push("Circonferenza vita potrebbe non essere coerente con IMC");
  }

  // Provide measurement tips
  if (score >= 90) {
    feedback.push("✅ Misurazioni sembrano accurate");
  } else if (score >= 75) {
    feedback.push("⚠️ Misurazioni accettabili ma ricontrollare");
  } else {
    feedback.push("❌ Misurazioni potrebbero essere imprecise");
  }

  feedback.push("💡 Misura sempre nello stesso momento della giornata");
  feedback.push("💡 Assicurati che il metro sia parallelo al pavimento");

  return {
    score: Math.max(0, score),
    feedback,
    warnings,
  };
};

/**
 * Calculate daily calorie needs (BMR + activity level)
 * @param weight Weight in kg
 * @param height Height in cm
 * @param age Age in years
 * @param gender 'male' or 'female'
 * @param activityLevel Activity multiplier (1.2-1.9)
 * @returns Daily calorie needs
 */
export const calculateDailyCaloricNeeds = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: number = 1.5 // Moderate activity
): number => {
  // Mifflin-St Jeor Equation
  let bmr: number;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const dailyCalories = bmr * activityLevel;

  return Math.round(dailyCalories);
};

/**
 * Get comprehensive health insights including Navy body composition
 * @param bmiResult BMI calculation result
 * @param navyComposition Navy body composition (optional)
 * @param age User age
 * @param gender User gender
 * @returns Comprehensive health insights and recommendations
 */
export const getHealthInsights = (
  bmiResult: BMIResult,
  age: number,
  gender: "male" | "female",
  navyComposition?: NavyBodyComposition
): {
  insights: string[];
  recommendations: string[];
  bodyComposition?: {
    fatMass: string;
    leanMass: string;
    category: string;
    comparison: string;
  };
} => {
  const insights: string[] = [];
  const recommendations: string[] = [];

  insights.push(`Il tuo IMC è ${bmiResult.bmi} (${bmiResult.categoryLabel})`);

  // Add Navy body composition insights if available
  if (navyComposition) {
    insights.push(
      `${navyComposition.emoji} Grasso corporeo: ${navyComposition.bodyFatPercentage}% (${navyComposition.categoryLabel})`
    );
    insights.push(`💪 Massa magra: ${navyComposition.leanMass} kg`);
    insights.push(`📊 Massa grassa: ${navyComposition.fatMass} kg`);

    // Compare with ideal range
    const idealRange = getIdealBodyFatRange(gender, age);
    let comparison: string;

    if (navyComposition.bodyFatPercentage < idealRange.min) {
      comparison = `Sotto il range ideale (${idealRange.min}-${idealRange.max}%)`;
      recommendations.push(
        "Considera di aumentare leggermente la massa grassa per la salute"
      );
    } else if (navyComposition.bodyFatPercentage > idealRange.max) {
      comparison = `Sopra il range ideale (${idealRange.min}-${idealRange.max}%)`;
      recommendations.push("Concentrati sulla riduzione del grasso corporeo");
    } else {
      comparison = `Nel range ideale (${idealRange.min}-${idealRange.max}%)`;
      recommendations.push("Mantieni la tua attuale composizione corporea");
    }

    insights.push(`🎯 ${comparison}`);
  }

  // BMI-based recommendations
  switch (bmiResult.category) {
    case "underweight":
      insights.push("Potresti beneficiare di un aumento di peso graduale");
      recommendations.push(
        "Considera una dieta ricca di nutrienti e calorie salutari"
      );
      recommendations.push(
        "Focus su esercizi di forza per aumentare la massa muscolare"
      );
      if (!navyComposition)
        recommendations.push(
          "💡 Misura la composizione corporea per dati più precisi"
        );
      break;

    case "normal":
      insights.push("Il tuo peso è nella norma per la tua altezza");
      recommendations.push(
        "Mantieni uno stile di vita attivo e una dieta equilibrata"
      );
      if (navyComposition && navyComposition.category === "athletic") {
        recommendations.push("Eccellente composizione corporea! Continua così");
      }
      break;

    case "overweight":
      insights.push(
        "Un leggero calo di peso potrebbe migliorare la tua salute"
      );
      if (navyComposition) {
        if (
          navyComposition.category === "athletic" ||
          navyComposition.category === "fitness"
        ) {
          insights.push(
            "⚠️ IMC elevato ma composizione corporea buona - probabilmente massa muscolare"
          );
          recommendations.push(
            'Il tuo "sovrappeso" potrebbe essere massa muscolare'
          );
        } else {
          recommendations.push(
            "Deficit calorico moderato (300-500 cal/giorno)"
          );
          recommendations.push(
            "Combina cardio e pesi per preservare massa magra"
          );
        }
      } else {
        recommendations.push(
          "Considera un deficit calorico moderato (300-500 cal/giorno)"
        );
        recommendations.push(
          "💡 Misura la composizione corporea per distinguere muscolo da grasso"
        );
      }
      break;

    case "obese":
      insights.push(
        "La perdita di peso è fortemente raccomandata per la tua salute"
      );
      recommendations.push(
        "Consulta un medico prima di iniziare qualsiasi programma"
      );
      if (navyComposition) {
        recommendations.push(
          `Obiettivo: ridurre ${Math.round(
            ((navyComposition.bodyFatPercentage -
              getIdealBodyFatRange(gender, age).max) *
              navyComposition.fatMass) /
              navyComposition.bodyFatPercentage
          )} kg di grasso`
        );
      }
      recommendations.push(
        "Deficit calorico controllato con supporto professionale"
      );
      break;
  }

  // Age and gender specific insights
  if (age > 40) {
    insights.push(
      "Dopo i 40 anni, mantenere la massa muscolare diventa cruciale"
    );
    recommendations.push(
      "Includi esercizi di resistenza 2-3 volte a settimana"
    );
    if (navyComposition) {
      recommendations.push(
        `Proteine: ~${Math.round(
          navyComposition.leanMass * 1.6
        )}g al giorno per preservare massa magra`
      );
    }
  }

  if (gender === "female" && age > 30) {
    recommendations.push(
      "Monitora i cambiamenti ormonali che possono influire sulla composizione corporea"
    );
  }

  // Body composition details for return
  const bodyComposition = navyComposition
    ? {
        fatMass: `${navyComposition.fatMass} kg`,
        leanMass: `${navyComposition.leanMass} kg`,
        category: navyComposition.categoryLabel,
        comparison: navyComposition
          ? `${navyComposition.bodyFatPercentage}% vs ideale ${
              getIdealBodyFatRange(gender, age).min
            }-${getIdealBodyFatRange(gender, age).max}%`
          : "",
      }
    : undefined;

  return { insights, recommendations, bodyComposition };
};
