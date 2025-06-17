// Family Study Library - Modular Structure
// Re-exports all family study functionality

// Schemas and types
export * from './schemas';
export * from './types';

// Data sources
export { consumptionUnits } from './data/consumption-units';
export { sesClassifications } from './data/ses-classifications';

// Calculation functions
export { calculateBMI } from './calculations/bmi';
export { calculateConsumptionUnit } from './calculations/consumption-units';
export { calculateNutritionalAdequacy } from './calculations/nutritional-adequacy';
export { getSESClass } from './calculations/ses-calculator';

// Food database lazy loader
export async function loadFoodDatabase() {
  const module = await import('./data/food-database.json');
  return module.default;
}

// Legacy compatibility - maintain original exports structure
export const foodDatabase = {
  // Lazy load only when needed
  get: async () => loadFoodDatabase()
};
