// Family Study Types and Utilities
import { z } from 'zod';

// Zod validation schemas
export const FamilyMemberSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  age: z.number().int().min(0).max(120, 'Age must be between 0 and 120 years'),
  sex: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Sex must be Male, Female, or Other' })
  }),
  relation: z.string().min(1, 'Relation is required').max(50, 'Relation must be less than 50 characters'),
  marital: z.enum(['Single', 'Married', 'Divorced', 'Widowed', 'Separated'], {
    errorMap: () => ({ message: 'Invalid marital status' })
  }),
  education: z.string().min(1, 'Education is required').max(100, 'Education must be less than 100 characters'),
  occupation: z.string().min(1, 'Occupation is required').max(100, 'Occupation must be less than 100 characters'),
  income: z.number().min(0, 'Income must be non-negative'),
  activity: z.enum(['Sedentary', 'Moderate', 'Heavy'], {
    errorMap: () => ({ message: 'Activity must be Sedentary, Moderate, or Heavy' })
  }),
});

export const DietaryItemSchema = z.object({
  meal: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks'], {
    errorMap: () => ({ message: 'Meal must be Breakfast, Lunch, Dinner, or Snacks' })
  }),
  foodName: z.string().min(1, 'Food name is required').max(100, 'Food name must be less than 100 characters'),
  quantity: z.number().positive('Quantity must be positive'),
  energy: z.number().min(0, 'Energy must be non-negative'),
  protein: z.number().min(0, 'Protein must be non-negative'),
  carbs: z.number().min(0, 'Carbohydrates must be non-negative'),
  fat: z.number().min(0, 'Fat must be non-negative'),
  fiber: z.number().min(0, 'Fiber must be non-negative'),
});

export const HealthRecordSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  memberId: z.number().int().positive('Member ID must be a positive integer').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  age: z.number().int().min(0).max(120, 'Age must be between 0 and 120 years').optional(),
  height: z.number().min(30).max(300, 'Height must be between 30 and 300 cm').optional(),
  weight: z.number().min(1).max(500, 'Weight must be between 1 and 500 kg').optional(),
  bmi: z.number().min(5).max(80, 'BMI must be between 5 and 80').optional(),
  bmiCategory: z.string().max(50, 'BMI category must be less than 50 characters').optional(),
  bloodPressure: z.string().max(20, 'Blood pressure must be less than 20 characters').optional(),
  healthIssues: z.string().max(500, 'Health issues must be less than 500 characters').optional(),
});

export const ImmunizationRecordSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  memberId: z.number().int().positive('Member ID must be a positive integer').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  age: z.number().int().min(0).max(120, 'Age must be between 0 and 120 years').optional(),
  bcg: z.boolean().optional(),
  opv: z.boolean().optional(),
  dpt: z.boolean().optional(),
  hepB: z.boolean().optional(),
  mmr: z.boolean().optional(),
  covid: z.boolean().optional(),
});

export type FamilyMemberInput = z.infer<typeof FamilyMemberSchema>;
export type DietaryItemInput = z.infer<typeof DietaryItemSchema>;
export type HealthRecordInput = z.infer<typeof HealthRecordSchema>;
export type ImmunizationRecordInput = z.infer<typeof ImmunizationRecordSchema>;

export interface FamilyMember {
  id: number;
  name: string;
  age: number;
  sex: string;
  relation: string;
  marital: string;
  education: string;
  occupation: string;
  income: number;
  activity: string;
}

export interface DietaryItem {
  meal: string;
  foodName: string;
  quantity: number;
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface HealthRecord {
  id: number;
  memberId?: number;
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  bmiCategory?: string;
  bloodPressure?: string;
  healthIssues?: string;
}

export interface ImmunizationRecord {
  id: number;
  memberId?: number;
  name?: string;
  age?: number;
  bcg?: boolean;
  opv?: boolean;
  dpt?: boolean;
  hepB?: boolean;
  mmr?: boolean;
  covid?: boolean;
}

// ICMR-NIN 2020 Consumption Unit Factors
export const consumptionUnits = {
  // Age-based CU factors
  infant_0_6m: 0.25,
  infant_6_12m: 0.33,
  child_1_3y: 0.43,
  child_4_6y: 0.54,
  child_7_9y: 0.68,
  adolescent_10_12y_male: 0.84,
  adolescent_10_12y_female: 0.83,
  adolescent_13_18y_male: 0.97,
  adolescent_13_18y_female: 0.93,

  // Adult activity-based CU factors
  adult_sedentary_male: 1.0,
  adult_sedentary_female: 0.83,
  adult_moderate_male: 1.2,
  adult_moderate_female: 1.0,
  adult_heavy_male: 1.6,
  adult_heavy_female: 1.4,

  // Elderly CU factors
  elderly_male: 0.83,
  elderly_female: 0.79,

  // Pregnancy and lactation additional CU
  pregnant_2nd_trimester: 0.29,
  pregnant_3rd_trimester: 0.46,
  lactating_0_6m: 0.59,
  lactating_6_12m: 0.42
};

// SES Classification data (Updated 2024)
export const sesClassifications = {
  prasad: {
    name: "Modified Prasad Classification 2024",
    classes: [
      { min: 10533, class: "Class I (Upper)", color: "success" },
      { min: 5267, max: 10532, class: "Class II (Upper Middle)", color: "info" },
      { min: 3160, max: 5266, class: "Class III (Middle)", color: "warning" },
      { min: 1580, max: 3159, class: "Class IV (Lower Middle)", color: "warning" },
      { min: 0, max: 1579, class: "Class V (Lower)", color: "danger" }
    ]
  },
  kuppuswami: {
    name: "Modified Kuppuswami Scale",
    classes: [
      { min: 52734, class: "Upper (I)", color: "success" },
      { min: 26355, max: 52733, class: "Upper Middle (II)", color: "info" },
      { min: 19759, max: 26354, class: "Lower Middle (III)", color: "warning" },
      { min: 13161, max: 19758, class: "Upper Lower (IV)", color: "warning" },
      { min: 0, max: 13160, class: "Lower (V)", color: "danger" }
    ]
  },
  pareek: {
    name: "Pareek's Classification (Rural)",
    classes: [
      { min: 30000, class: "Upper High", color: "success" },
      { min: 20000, max: 29999, class: "High", color: "info" },
      { min: 15000, max: 19999, class: "Upper Middle", color: "info" },
      { min: 10000, max: 14999, class: "Middle", color: "warning" },
      { min: 5000, max: 9999, class: "Lower Middle", color: "warning" },
      { min: 2500, max: 4999, class: "Poor", color: "danger" },
      { min: 0, max: 2499, class: "Very Poor", color: "danger" }
    ]
  }
};

// IFCT 2017 Food Database (Comprehensive subset)
export const foodDatabase = {
  // Cereals and Millets (per 100g)
  "Rice, raw": { energy: 345, protein: 6.8, carbs: 78.2, fat: 0.6, fiber: 0.4 },
  "Rice, cooked": { energy: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.2 },
  "Wheat flour": { energy: 341, protein: 12.1, carbs: 71.2, fat: 1.7, fiber: 2.9 },
  "Wheat, chapati": { energy: 297, protein: 8.7, carbs: 64.0, fat: 1.2, fiber: 2.0 },
  "Jowar": { energy: 349, protein: 10.4, carbs: 72.6, fat: 1.9, fiber: 9.7 },
  "Bajra": { energy: 361, protein: 11.6, carbs: 67.5, fat: 5.0, fiber: 11.5 },
  "Ragi": { energy: 336, protein: 7.3, carbs: 72.0, fat: 1.3, fiber: 11.2 },
  "Maize": { energy: 342, protein: 11.1, carbs: 66.2, fat: 3.9, fiber: 12.2 },

  // Pulses and Legumes (per 100g)
  "Arhar dal (toor)": { energy: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fiber: 5.1 },
  "Moong dal": { energy: 348, protein: 24.0, carbs: 59.9, fat: 1.3, fiber: 4.8 },
  "Masoor dal": { energy: 343, protein: 25.1, carbs: 59.0, fat: 0.7, fiber: 4.6 },
  "Urad dal": { energy: 347, protein: 24.0, carbs: 59.6, fat: 1.4, fiber: 4.5 },
  "Chana dal": { energy: 360, protein: 22.0, carbs: 57.0, fat: 4.5, fiber: 12.8 },
  "Rajma": { energy: 346, protein: 22.9, carbs: 60.6, fat: 1.3, fiber: 25.0 },
  "Black gram, whole": { energy: 341, protein: 24.0, carbs: 58.4, fat: 1.9, fiber: 7.6 },

  // Vegetables (per 100g)
  "Potato": { energy: 97, protein: 2.0, carbs: 22.6, fat: 0.1, fiber: 2.2 },
  "Sweet potato": { energy: 120, protein: 1.2, carbs: 28.2, fat: 0.3, fiber: 3.0 },
  "Onion": { energy: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.1 },
  "Tomato": { energy: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  "Carrot": { energy: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  "Spinach": { energy: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  "Fenugreek leaves": { energy: 49, protein: 4.4, carbs: 6.0, fat: 0.9, fiber: 1.1 },
  "Cauliflower": { energy: 25, protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.5 },
  "Cabbage": { energy: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  "Brinjal": { energy: 24, protein: 1.1, carbs: 5.7, fat: 0.2, fiber: 3.0 },
  "Okra": { energy: 33, protein: 2.0, carbs: 7.6, fat: 0.1, fiber: 3.2 },
  "Green beans": { energy: 31, protein: 1.8, carbs: 7.1, fat: 0.2, fiber: 2.7 },

  // Fruits (per 100g)
  "Apple": { energy: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  "Banana": { energy: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  "Orange": { energy: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  "Mango": { energy: 60, protein: 0.6, carbs: 15.0, fat: 0.4, fiber: 1.6 },
  "Papaya": { energy: 43, protein: 0.6, carbs: 10.8, fat: 0.1, fiber: 2.5 },
  "Guava": { energy: 68, protein: 2.6, carbs: 14.3, fat: 0.9, fiber: 5.4 },
  "Pomegranate": { energy: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0 },

  // Animal Products (per 100g)
  "Milk, cow": { energy: 67, protein: 3.2, carbs: 4.8, fat: 4.0, fiber: 0 },
  "Milk, buffalo": { energy: 117, protein: 4.3, carbs: 5.0, fat: 6.5, fiber: 0 },
  "Curd": { energy: 60, protein: 3.1, carbs: 4.4, fat: 4.0, fiber: 0 },
  "Paneer": { energy: 265, protein: 18.3, carbs: 6.1, fat: 20.8, fiber: 0 },
  "Egg, chicken": { energy: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
  "Chicken": { energy: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  "Mutton": { energy: 194, protein: 18.5, carbs: 0, fat: 13.3, fiber: 0 },
  "Fish, rohu": { energy: 97, protein: 16.6, carbs: 0, fat: 2.2, fiber: 0 },
  "Fish, pomfret": { energy: 96, protein: 18.8, carbs: 0, fat: 1.8, fiber: 0 },

  // Oils and Fats (per 100g)
  "Mustard oil": { energy: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  "Sunflower oil": { energy: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  "Coconut oil": { energy: 900, protein: 0, carbs: 0, fat: 99.8, fiber: 0 },
  "Ghee, cow": { energy: 900, protein: 0, carbs: 0, fat: 99.8, fiber: 0 },
  "Butter": { energy: 717, protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0 },

  // Nuts and Seeds (per 100g)
  "Groundnut": { energy: 567, protein: 25.3, carbs: 16.1, fat: 50.0, fiber: 8.5 },
  "Coconut, fresh": { energy: 354, protein: 3.3, carbs: 15.2, fat: 33.0, fiber: 9.0 },
  "Sesame seeds": { energy: 563, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8 },

  // Sugars (per 100g)
  "Sugar": { energy: 398, protein: 0, carbs: 99.5, fat: 0, fiber: 0 },
  "Jaggery": { energy: 383, protein: 0.4, carbs: 95.0, fat: 0.1, fiber: 0 }
};

// Helper functions
export function calculateBMI(height: number, weight: number): { bmi: number, category: string } {
  if (height <= 0 || weight <= 0) {
    return { bmi: 0, category: '-' };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category;
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return { bmi, category };
}

export function calculateConsumptionUnit(member: FamilyMember): { cu: number, category: string } {
  let cu = 0;
  let category = '';

  if (member.age < 0.5) {
    cu = consumptionUnits.infant_0_6m;
    category = 'Infant (0-6 months)';
  } else if (member.age < 1) {
    cu = consumptionUnits.infant_6_12m;
    category = 'Infant (6-12 months)';
  } else if (member.age < 4) {
    cu = consumptionUnits.child_1_3y;
    category = 'Child (1-3 years)';
  } else if (member.age < 7) {
    cu = consumptionUnits.child_4_6y;
    category = 'Child (4-6 years)';
  } else if (member.age < 10) {
    cu = consumptionUnits.child_7_9y;
    category = 'Child (7-9 years)';
  } else if (member.age < 13) {
    cu = member.sex === 'male' ? consumptionUnits.adolescent_10_12y_male : consumptionUnits.adolescent_10_12y_female;
    category = 'Adolescent (10-12 years)';
  } else if (member.age < 19) {
    cu = member.sex === 'male' ? consumptionUnits.adolescent_13_18y_male : consumptionUnits.adolescent_13_18y_female;
    category = 'Adolescent (13-18 years)';
  } else if (member.age < 60) {
    // Adult CU based on activity level
    if (member.activity === 'sedentary') {
      cu = member.sex === 'male' ? consumptionUnits.adult_sedentary_male : consumptionUnits.adult_sedentary_female;
      category = 'Adult - Sedentary';
    } else if (member.activity === 'moderate') {
      cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
      category = 'Adult - Moderate Activity';
    } else if (member.activity === 'heavy') {
      cu = member.sex === 'male' ? consumptionUnits.adult_heavy_male : consumptionUnits.adult_heavy_female;
      category = 'Adult - Heavy Work';
    } else {
      // Default to moderate for adults
      cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
      category = 'Adult - Moderate Activity (Default)';
    }
  } else {
    cu = member.sex === 'male' ? consumptionUnits.elderly_male : consumptionUnits.elderly_female;
    category = 'Elderly (≥60 years)';
  }

  return { cu, category };
}

export function calculateNutritionalAdequacy(perCUCalories: number, perCUProtein: number): {
  calorieAdequacy: number,
  proteinAdequacy: number,
  overallStatus: string
} {
  // ICMR-NIN 2020 Recommendations per CU
  const recommendedCalories = 2110; // kcal per CU
  const recommendedProtein = 0.83 * 65; // 54g protein per CU (0.83g/kg for 65kg reference male)

  // Calculate adequacy percentages
  const calorieAdequacy = (perCUCalories / recommendedCalories) * 100;
  const proteinAdequacy = (perCUProtein / recommendedProtein) * 100;

  let overallStatus;
  const avgAdequacy = (calorieAdequacy + proteinAdequacy) / 2;

  if (avgAdequacy >= 85) {
    overallStatus = 'Adequate nutrition';
  } else if (avgAdequacy >= 70) {
    overallStatus = 'Borderline nutrition - needs improvement';
  } else {
    overallStatus = 'Poor nutrition - requires immediate intervention';
  }

  return { calorieAdequacy, proteinAdequacy, overallStatus };
}

export function getSESClass(perCapitaIncome: number, method: string): {
  class: string,
  color: string
} {
  const classification = sesClassifications[method as keyof typeof sesClassifications];

  for (const cls of classification.classes) {
    if (perCapitaIncome >= cls.min && (!cls.max || perCapitaIncome <= cls.max)) {
      return {
        class: cls.class,
        color: cls.color
      };
    }
  }

  return {
    class: 'Not classified',
    color: 'warning'
  };
}
