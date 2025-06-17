// ICMR-NIN 2020 Consumption Unit Factors
// Reference: Indian Council of Medical Research - National Institute of Nutrition

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
} as const;
