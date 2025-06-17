// TypeScript interface definitions for family study components

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
