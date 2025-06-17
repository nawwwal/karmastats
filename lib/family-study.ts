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
