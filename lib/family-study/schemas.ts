import { z } from 'zod';

// Zod validation schemas for family study components
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

// Type exports
export type FamilyMemberInput = z.infer<typeof FamilyMemberSchema>;
export type DietaryItemInput = z.infer<typeof DietaryItemSchema>;
export type HealthRecordInput = z.infer<typeof HealthRecordSchema>;
export type ImmunizationRecordInput = z.infer<typeof ImmunizationRecordSchema>;
