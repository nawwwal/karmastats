import { consumptionUnits } from '../data/consumption-units';
import type { FamilyMember } from '../types';

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
    cu = member.sex === 'Male'
      ? consumptionUnits.adolescent_10_12y_male
      : consumptionUnits.adolescent_10_12y_female;
    category = 'Adolescent (10-12 years)';
  } else if (member.age < 19) {
    cu = member.sex === 'Male'
      ? consumptionUnits.adolescent_13_18y_male
      : consumptionUnits.adolescent_13_18y_female;
    category = 'Adolescent (13-18 years)';
  } else if (member.age < 60) {
    // Adult activity-based CU
    if (member.activity === 'Sedentary') {
      cu = member.sex === 'Male'
        ? consumptionUnits.adult_sedentary_male
        : consumptionUnits.adult_sedentary_female;
    } else if (member.activity === 'Moderate') {
      cu = member.sex === 'Male'
        ? consumptionUnits.adult_moderate_male
        : consumptionUnits.adult_moderate_female;
    } else if (member.activity === 'Heavy') {
      cu = member.sex === 'Male'
        ? consumptionUnits.adult_heavy_male
        : consumptionUnits.adult_heavy_female;
    }
    category = 'Adult (19-59 years)';
  } else {
    // Elderly
    cu = member.sex === 'Male'
      ? consumptionUnits.elderly_male
      : consumptionUnits.elderly_female;
    category = 'Elderly (60+ years)';
  }

  return { cu, category };
}
