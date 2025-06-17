// Nutritional adequacy calculation based on ICMR-NIN 2020 recommendations

export function calculateNutritionalAdequacy(perCUCalories: number, perCUProtein: number): {
  calorieAdequacy: number,
  proteinAdequacy: number,
  overallStatus: string
} {
  // ICMR-NIN 2020 recommendations per consumption unit
  const recommendedCaloriesPerCU = 2000; // kcal per day
  const recommendedProteinPerCU = 60; // grams per day

  const calorieAdequacy = (perCUCalories / recommendedCaloriesPerCU) * 100;
  const proteinAdequacy = (perCUProtein / recommendedProteinPerCU) * 100;

  let overallStatus: string;
  const avgAdequacy = (calorieAdequacy + proteinAdequacy) / 2;

  if (avgAdequacy >= 100) {
    overallStatus = 'Adequate';
  } else if (avgAdequacy >= 80) {
    overallStatus = 'Moderately Adequate';
  } else if (avgAdequacy >= 60) {
    overallStatus = 'Inadequate';
  } else {
    overallStatus = 'Severely Inadequate';
  }

  return {
    calorieAdequacy,
    proteinAdequacy,
    overallStatus
  };
}
