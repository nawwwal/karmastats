// Comprehensive field explanations for all statistical parameters
// Used across disease modeling, sample size calculation, regression analysis, and family studies

export interface FieldExplanation {
  title: string;
  content: string;
  examples?: string[];
  validRange?: {
    min?: number | string;
    max?: number | string;
  };
}

// Sample Size Calculations - Common Statistical Parameters
export const sampleSizeExplanations: Record<string, FieldExplanation> = {
  confidenceLevel: {
    title: "Confidence Level",
    content: "The probability that the true population parameter lies within the calculated confidence interval. Higher confidence levels require larger sample sizes but provide more certainty in results.",
    examples: [
      "95% - Standard for most medical research",
      "99% - High-stakes clinical trials",
      "90% - Pilot studies or preliminary research"
    ],
    validRange: { min: "80%", max: "99%" }
  },

  power: {
    title: "Statistical Power (1-β)",
    content: "The probability of correctly detecting a true effect when it exists (avoiding Type II error). Higher power reduces the chance of missing a real difference but requires larger sample sizes.",
    examples: [
      "80% - Minimum acceptable for most studies",
      "90% - Preferred for important clinical trials",
      "95% - Very high confidence studies"
    ],
    validRange: { min: "70%", max: "95%" }
  },

  significanceLevel: {
    title: "Significance Level (α)",
    content: "The maximum probability of rejecting the null hypothesis when it's actually true (Type I error). Lower values provide stronger evidence but require larger sample sizes.",
    examples: [
      "0.05 (5%) - Standard for most medical research",
      "0.01 (1%) - High-stakes clinical decisions",
      "0.10 (10%) - Exploratory or pilot studies"
    ],
    validRange: { min: "0.01", max: "0.10" }
  },

  marginOfError: {
    title: "Margin of Error",
    content: "The maximum expected difference between the sample estimate and the true population value. Smaller margins require larger sample sizes but provide more precise estimates.",
    examples: [
      "±3% - High precision prevalence studies",
      "±5% - Standard epidemiological surveys",
      "±10% - Preliminary or resource-limited studies"
    ],
    validRange: { min: "1%", max: "20%" }
  },

  prevalence: {
    title: "Expected Prevalence",
    content: "The anticipated proportion of individuals in the population who have the condition of interest. This estimate affects the required sample size, with prevalences near 50% requiring the largest samples.",
    examples: [
      "5% - Rare diseases (e.g., Type 1 diabetes)",
      "20% - Common conditions (e.g., hypertension)",
      "50% - Maximum variance scenario"
    ],
    validRange: { min: "1%", max: "99%" }
  },

  dropoutRate: {
    title: "Dropout/Attrition Rate",
    content: "The expected percentage of participants who will not complete the study. The sample size is inflated to account for this loss, ensuring adequate power in the final analysis.",
    examples: [
      "5% - Short-term studies with minimal burden",
      "15% - Standard longitudinal studies",
      "30% - Long-term follow-up studies"
    ],
    validRange: { min: "0%", max: "50%" }
  }
};

// Case-Control and Cohort Studies
export const comparativeStudyExplanations: Record<string, FieldExplanation> = {
  ratio: {
    title: "Control to Case Ratio",
    content: "The number of controls recruited for each case. Higher ratios can increase statistical power but also increase study costs and complexity.",
    examples: [
      "1:1 - Equal numbers, standard approach",
      "2:1 - Common for case-control studies",
      "4:1 - Maximum efficient ratio"
    ],
    validRange: { min: 1, max: 5 }
  },

  p0: {
    title: "Exposure Rate in Controls (p₀)",
    content: "The proportion of control subjects who have been exposed to the risk factor of interest. This represents the baseline or background exposure rate in the population.",
    examples: [
      "0.10 (10%) - Low background exposure",
      "0.30 (30%) - Moderate exposure prevalence",
      "0.60 (60%) - High background exposure"
    ],
    validRange: { min: "0.01", max: "0.99" }
  },

  p1: {
    title: "Exposure Rate in Cases (p₁)",
    content: "The proportion of case subjects who have been exposed to the risk factor. This should be different from p₀ to detect an association between exposure and outcome.",
    examples: [
      "0.20 (20%) - When p₀ = 10%, detecting doubled risk",
      "0.45 (45%) - When p₀ = 30%, detecting 50% increase",
      "0.75 (75%) - When p₀ = 60%, detecting 25% increase"
    ],
    validRange: { min: "0.01", max: "0.99" }
  }
};

// T-Test Parameters
export const tTestExplanations: Record<string, FieldExplanation> = {
  group1Mean: {
    title: "Group 1 Mean",
    content: "The expected average value for the first group being compared. This should be based on previous research, pilot data, or clinical significance thresholds.",
    examples: [
      "125 mmHg - Systolic blood pressure",
      "24.5 kg/m² - Body mass index",
      "7.2% - HbA1c percentage"
    ]
  },

  group2Mean: {
    title: "Group 2 Mean",
    content: "The expected average value for the second group. The difference from Group 1 represents the effect size you want to detect.",
    examples: [
      "130 mmHg - 5 mmHg difference in blood pressure",
      "26.0 kg/m² - 1.5 kg/m² difference in BMI",
      "6.8% - 0.4% difference in HbA1c"
    ]
  },

  pooledSD: {
    title: "Pooled Standard Deviation",
    content: "The estimated common standard deviation for both groups. This represents the natural variability in the measurement and can be estimated from previous studies or pilot data.",
    examples: [
      "15 mmHg - Blood pressure variability",
      "3.5 kg/m² - BMI variability",
      "1.2% - HbA1c variability"
    ],
    validRange: { min: 0.1, max: 1000 }
  },

  allocationRatio: {
    title: "Allocation Ratio",
    content: "The ratio of participants allocated to Group 2 versus Group 1. Equal allocation (1:1) is most efficient, but unequal allocation might be used for practical or ethical reasons.",
    examples: [
      "1.0 - Equal allocation (1:1)",
      "2.0 - Two participants in Group 2 for each in Group 1",
      "0.5 - Half as many in Group 2 compared to Group 1"
    ],
    validRange: { min: 0.5, max: 3.0 }
  },

  meanDifference: {
    title: "Expected Mean Difference",
    content: "The anticipated difference between paired measurements (e.g., before vs after treatment). This represents the minimum clinically meaningful change you want to detect.",
    examples: [
      "5 mmHg - Blood pressure reduction",
      "2.0 kg - Weight loss",
      "15 points - Quality of life scale improvement"
    ]
  },

  sdDifference: {
    title: "Standard Deviation of Differences",
    content: "The variability in the differences between paired measurements. This is often smaller than individual group SDs due to within-subject correlation.",
    examples: [
      "8 mmHg - BP difference variability",
      "1.5 kg - Weight change variability",
      "10 points - QoL score difference variability"
    ],
    validRange: { min: 0.1, max: 1000 }
  },

  correlation: {
    title: "Correlation Coefficient",
    content: "The correlation between paired measurements (baseline and follow-up). Higher correlations reduce the required sample size for paired studies.",
    examples: [
      "0.7 - Strong correlation (blood pressure)",
      "0.5 - Moderate correlation (weight)",
      "0.3 - Weak correlation (subjective measures)"
    ],
    validRange: { min: 0, max: 1 }
  }
};

// Survival Analysis Parameters
export const survivalExplanations: Record<string, FieldExplanation> = {
  hazardRatio: {
    title: "Hazard Ratio",
    content: "The ratio of hazard rates between treatment groups. Values >1 indicate increased risk in the treatment group, while values <1 indicate reduced risk (protective effect).",
    examples: [
      "0.7 - 30% reduction in hazard (treatment benefit)",
      "1.0 - No difference between groups",
      "1.5 - 50% increase in hazard (treatment harm)"
    ],
    validRange: { min: 0.1, max: 5.0 }
  },

  medianSurvival1: {
    title: "Control Group Median Survival",
    content: "The expected median survival time in the control group. This is the time by which 50% of control subjects will experience the event.",
    examples: [
      "12 months - Cancer survival studies",
      "5 years - Cardiovascular outcomes",
      "24 months - Progressive diseases"
    ]
  },

  medianSurvival2: {
    title: "Treatment Group Median Survival",
    content: "The expected median survival time in the treatment group. This should reflect the improvement expected from the intervention.",
    examples: [
      "18 months - 50% improvement over control",
      "7.5 years - 50% improvement in CVD",
      "36 months - 50% improvement in progression"
    ]
  },

  accrualPeriod: {
    title: "Accrual Period",
    content: "The time period over which participants will be recruited into the study. Longer accrual allows for uniform recruitment but extends study duration.",
    examples: [
      "12 months - Single-center studies",
      "24 months - Multi-center studies",
      "36 months - Large international trials"
    ],
    validRange: { min: 1, max: 60 }
  },

  followUpPeriod: {
    title: "Follow-up Period",
    content: "The minimum time each participant will be followed after recruitment ends. Determines the minimum study duration and affects the number of events observed.",
    examples: [
      "12 months - Short-term outcomes",
      "36 months - Medium-term follow-up",
      "60 months - Long-term outcomes"
    ],
    validRange: { min: 1, max: 120 }
  },

  rSquared: {
    title: "R² for Primary Covariate",
    content: "The proportion of variance in survival explained by the primary covariate of interest. Higher values indicate stronger predictive ability.",
    examples: [
      "0.1 - Weak predictor (10% variance explained)",
      "0.3 - Moderate predictor (30% variance)",
      "0.5 - Strong predictor (50% variance)"
    ],
    validRange: { min: 0, max: 0.99 }
  },

  overallEventRate: {
    title: "Overall Event Rate",
    content: "The proportion of all participants expected to experience the primary event by the end of the study. Higher event rates provide more statistical power.",
    examples: [
      "0.3 (30%) - Moderate event rate",
      "0.5 (50%) - High event rate",
      "0.7 (70%) - Very high event rate"
    ],
    validRange: { min: 0.1, max: 0.9 }
  }
};

// Diagnostic Test Parameters
export const diagnosticExplanations: Record<string, FieldExplanation> = {
  sensitivity: {
    title: "Sensitivity",
    content: "The proportion of truly diseased individuals correctly identified by the test (true positive rate). Higher sensitivity means fewer false negatives.",
    examples: [
      "0.95 (95%) - Excellent screening test",
      "0.85 (85%) - Good diagnostic test",
      "0.70 (70%) - Moderate sensitivity"
    ],
    validRange: { min: 0.1, max: 1.0 }
  },

  specificity: {
    title: "Specificity",
    content: "The proportion of truly non-diseased individuals correctly identified by the test (true negative rate). Higher specificity means fewer false positives.",
    examples: [
      "0.98 (98%) - Excellent confirmatory test",
      "0.90 (90%) - Good diagnostic test",
      "0.75 (75%) - Moderate specificity"
    ],
    validRange: { min: 0.1, max: 1.0 }
  },

  diseasePrevalence: {
    title: "Disease Prevalence",
    content: "The proportion of individuals in the study population who actually have the disease. This affects the positive and negative predictive values of the test.",
    examples: [
      "5% - Rare disease screening",
      "20% - Common condition in clinic",
      "50% - High-risk population"
    ],
    validRange: { min: "0.1%", max: "90%" }
  },

  expectedAUC: {
    title: "Expected AUC",
    content: "The expected area under the ROC curve for the diagnostic test. Values closer to 1.0 indicate better discriminatory ability.",
    examples: [
      "0.9 - Excellent diagnostic accuracy",
      "0.8 - Good diagnostic accuracy",
      "0.7 - Fair diagnostic accuracy"
    ],
    validRange: { min: 0.5, max: 1.0 }
  },

  nullAUC: {
    title: "Null Hypothesis AUC",
    content: "The AUC value under the null hypothesis (typically 0.5 for no discriminatory ability, or a clinically meaningful threshold).",
    examples: [
      "0.5 - No diagnostic ability (random)",
      "0.6 - Minimal acceptable performance",
      "0.7 - Clinical significance threshold"
    ],
    validRange: { min: 0.5, max: 0.9 }
  }
};

// Cross-sectional Study Parameters
export const crossSectionalExplanations: Record<string, FieldExplanation> = {
  populationSize: {
    title: "Population Size",
    content: "The total size of the population from which the sample will be drawn. Used for finite population correction when the sample represents a substantial portion of the population.",
    examples: [
      "10,000 - Small community study",
      "100,000 - District-level survey",
      "1,000,000+ - National survey (infinite population)"
    ]
  },

  designEffect: {
    title: "Design Effect (DEFF)",
    content: "The factor by which the sample size must be increased due to complex sampling design (clustering, stratification). Accounts for reduced efficiency compared to simple random sampling.",
    examples: [
      "1.0 - Simple random sampling",
      "1.5 - Moderate clustering effect",
      "2.0 - Strong clustering effect"
    ],
    validRange: { min: 1.0, max: 5.0 }
  },

  nonResponseRate: {
    title: "Non-Response Rate",
    content: "The expected percentage of selected individuals who will not participate in the study. The sample size is inflated to account for this non-participation.",
    examples: [
      "10% - High participation studies",
      "25% - Typical survey response",
      "40% - Challenging populations"
    ],
    validRange: { min: "0%", max: "60%" }
  },

  clusteringEffect: {
    title: "Intracluster Correlation (ICC)",
    content: "The correlation of outcomes within clusters (e.g., households, clinics). Higher values indicate more similarity within clusters and require larger sample sizes.",
    examples: [
      "0.01 - Weak clustering (individual behaviors)",
      "0.05 - Moderate clustering (household effects)",
      "0.20 - Strong clustering (clinic/school effects)"
    ],
    validRange: { min: 0, max: 0.5 }
  }
};

// Clinical Trial Parameters
export const clinicalTrialExplanations: Record<string, FieldExplanation> = {
  superiorityMargin: {
    title: "Superiority Margin",
    content: "The minimum difference that would be considered clinically meaningful when testing if the new treatment is superior to the control.",
    examples: [
      "5 mmHg - Blood pressure reduction",
      "10% - Response rate improvement",
      "0.5% - HbA1c reduction"
    ]
  },

  nonInferiorityMargin: {
    title: "Non-Inferiority Margin",
    content: "The maximum acceptable difference by which the new treatment can be worse than the control while still being considered non-inferior.",
    examples: [
      "3 mmHg - BP non-inferiority margin",
      "5% - Response rate non-inferiority",
      "0.3% - HbA1c non-inferiority"
    ]
  },

  equivalenceMargin: {
    title: "Equivalence Margin",
    content: "The maximum acceptable difference in either direction for the treatments to be considered equivalent (bioequivalence studies).",
    examples: [
      "±0.2 log units - Bioequivalence study",
      "±10% - Pharmacokinetic equivalence",
      "±5% - Clinical equivalence"
    ]
  },

  controlResponse: {
    title: "Control Group Response Rate",
    content: "The expected response rate or outcome measure in the control/standard treatment group, based on historical data or literature.",
    examples: [
      "60% - Response rate to standard therapy",
      "25% - Adverse event rate",
      "40% - Cure rate with current treatment"
    ],
    validRange: { min: "5%", max: "95%" }
  },

  treatmentResponse: {
    title: "Treatment Group Response Rate",
    content: "The expected response rate in the experimental treatment group, representing the improvement or change expected from the new intervention.",
    examples: [
      "75% - 15% improvement over control",
      "15% - 10% reduction in adverse events",
      "55% - 15% improvement in cure rate"
    ],
    validRange: { min: "5%", max: "95%" }
  }
};

// Disease Modeling Parameters
export const diseaseModelExplanations: Record<string, FieldExplanation> = {
  populationSize: {
    title: "Population Size",
    content: "The total number of individuals in the population being modeled. Larger populations provide more stable epidemic patterns but require more computational resources.",
    examples: [
      "100,000 - Small city",
      "1,000,000 - Large metropolitan area",
      "10,000,000 - State or province level"
    ],
    validRange: { min: 1000, max: 100000000 }
  },

  initialCases: {
    title: "Initial Infected Cases",
    content: "The number of infected individuals at the start of the simulation. This represents the 'seed' infections that will drive the initial epidemic spread.",
    examples: [
      "1-5 - Single introduction event",
      "10-50 - Multiple introductions",
      "100+ - Already established transmission"
    ],
    validRange: { min: 1, max: 10000 }
  },

  transmissionRate: {
    title: "Transmission Rate (β)",
    content: "The rate at which susceptible individuals become infected when exposed to infectious individuals. Related to the basic reproduction number (R₀).",
    examples: [
      "0.2 - Low transmissibility (seasonal flu)",
      "0.5 - Moderate transmissibility (COVID-19)",
      "1.0 - High transmissibility (measles)"
    ],
    validRange: { min: 0.01, max: 2.0 }
  },

  incubationPeriod: {
    title: "Incubation Period",
    content: "The average time from infection to becoming infectious (for SEIR models) or symptomatic. Affects the timing and shape of the epidemic curve.",
    examples: [
      "2 days - Influenza",
      "5 days - COVID-19",
      "14 days - Measles"
    ],
    validRange: { min: 1, max: 30 }
  },

  recoveryRate: {
    title: "Recovery Rate (γ)",
    content: "The rate at which infected individuals recover and become immune. This is typically 1/(infectious period).",
    examples: [
      "0.33 - 3-day infectious period",
      "0.1 - 10-day infectious period",
      "0.07 - 14-day infectious period"
    ],
    validRange: { min: 0.01, max: 1.0 }
  },

  mortalityRate: {
    title: "Case Fatality Rate (μ)",
    content: "The proportion of infected individuals who die from the disease. This varies significantly by age, health status, and healthcare capacity.",
    examples: [
      "0.001 (0.1%) - Low fatality (seasonal flu)",
      "0.02 (2%) - Moderate fatality (COVID-19)",
      "0.05 (5%) - High fatality (severe pandemic)"
    ],
    validRange: { min: 0, max: 0.1 }
  },

  simulationDays: {
    title: "Simulation Duration",
    content: "The number of days to run the epidemic simulation. Should be long enough to capture the full epidemic curve including peak and decline phases.",
    examples: [
      "180 days - Short-term outbreak",
      "365 days - Annual epidemic",
      "730 days - Multi-year analysis"
    ],
    validRange: { min: 30, max: 1095 }
  },

  seasonality: {
    title: "Seasonal Variation",
    content: "The magnitude of seasonal variation in transmission rates. Many respiratory diseases show increased transmission in cooler months.",
    examples: [
      "0.1 (10%) - Mild seasonal effect",
      "0.3 (30%) - Moderate seasonal effect",
      "0.5 (50%) - Strong seasonal effect"
    ],
    validRange: { min: 0, max: 0.8 }
  },

  socialDistancing: {
    title: "Social Distancing Effectiveness",
    content: "The reduction in transmission rate due to social distancing measures. Represents the combined effect of all non-pharmaceutical interventions.",
    examples: [
      "0.2 (20%) - Mild interventions",
      "0.5 (50%) - Moderate lockdown",
      "0.8 (80%) - Strict lockdown"
    ],
    validRange: { min: 0, max: 0.9 }
  },

  maskEffectiveness: {
    title: "Mask Effectiveness",
    content: "The reduction in transmission rate due to mask wearing. Effectiveness depends on mask type, compliance, and proper usage.",
    examples: [
      "0.1 (10%) - Cloth masks, poor compliance",
      "0.3 (30%) - Surgical masks, good compliance",
      "0.6 (60%) - N95 masks, excellent compliance"
    ],
    validRange: { min: 0, max: 0.8 }
  },

  vaccinationRate: {
    title: "Daily Vaccination Rate",
    content: "The proportion of susceptible individuals vaccinated per day. Higher rates lead to faster achievement of herd immunity.",
    examples: [
      "0.001 (0.1%) - Slow rollout",
      "0.005 (0.5%) - Moderate pace",
      "0.02 (2%) - Rapid mass vaccination"
    ],
    validRange: { min: 0, max: 0.05 }
  },

  vaccineEffectiveness: {
    title: "Vaccine Effectiveness",
    content: "The proportion of vaccinated individuals who develop immunity. Real-world effectiveness may be lower than clinical trial efficacy.",
    examples: [
      "0.7 (70%) - Moderate effectiveness",
      "0.9 (90%) - High effectiveness",
      "0.95 (95%) - Excellent effectiveness"
    ],
    validRange: { min: 0.3, max: 0.99 }
  }
};

// Regression Analysis Parameters
export const regressionExplanations: Record<string, FieldExplanation> = {
  xValues: {
    title: "Independent Variable (X)",
    content: "The predictor or explanatory variable. In medical research, this often represents exposure, treatment, or risk factors that may influence the outcome.",
    examples: [
      "Age, height, dose - Continuous variables",
      "Study hours, income, temperature",
      "Time, concentration, pressure"
    ]
  },

  yValues: {
    title: "Dependent Variable (Y)",
    content: "The outcome or response variable that you want to predict or explain. This should be continuous for linear regression.",
    examples: [
      "Blood pressure, weight, test score",
      "Disease biomarker levels",
      "Quality of life scores, reaction time"
    ]
  },

  xLabel: {
    title: "X-Axis Label",
    content: "Descriptive label for the independent variable including units of measurement. This will appear on the regression plot.",
    examples: [
      "Age (years)",
      "Drug Dose (mg)",
      "BMI (kg/m²)"
    ]
  },

  yLabel: {
    title: "Y-Axis Label",
    content: "Descriptive label for the dependent variable including units of measurement. This will appear on the regression plot.",
    examples: [
      "Systolic BP (mmHg)",
      "Weight Loss (kg)",
      "Test Score (points)"
    ]
  }
};

// Family Study Parameters
export const familyStudyExplanations: Record<string, FieldExplanation> = {
  name: {
    title: "Family Member Name",
    content: "Full name of the family member. This helps identify individuals in the family structure and maintain data consistency.",
    examples: [
      "John Smith - Head of family",
      "Mary Smith - Spouse",
      "Sarah Smith - Daughter"
    ]
  },

  age: {
    title: "Age in Years",
    content: "Current age of the family member. Used for age-specific nutritional requirements, BMI calculations, and demographic analysis.",
    examples: [
      "0-2 years - Infants",
      "6-18 years - School age children",
      "19-64 years - Adults",
      "65+ years - Elderly"
    ],
    validRange: { min: 0, max: 120 }
  },

  relation: {
    title: "Relationship to Head of Family",
    content: "The family relationship of this member to the head of household. Important for understanding family structure and dependencies.",
    examples: [
      "Self - Head of household",
      "Spouse - Married partner",
      "Son/Daughter - Children",
      "Father/Mother - Parents"
    ]
  },

  education: {
    title: "Education Level",
    content: "Highest level of education completed. Correlates with health awareness, income potential, and dietary choices.",
    examples: [
      "Primary school (1-8 years)",
      "Secondary school (9-12 years)",
      "Graduate/Post-graduate",
      "Illiterate"
    ]
  },

  occupation: {
    title: "Primary Occupation",
    content: "Current job or primary activity. Affects income, physical activity level, and potential occupational health risks.",
    examples: [
      "Farmer - Agricultural work",
      "Teacher - Professional work",
      "Student - Educational pursuit",
      "Homemaker - Household management"
    ]
  },

  income: {
    title: "Monthly Income (₹)",
    content: "Individual monthly income in Indian Rupees. Used for socioeconomic status calculation and affordability analysis of nutritional recommendations.",
    examples: [
      "₹0 - Dependents (children, elderly)",
      "₹15,000 - Minimum wage worker",
      "₹50,000 - Professional/skilled worker",
      "₹100,000+ - High-income professional"
    ],
    validRange: { min: 0, max: 1000000 }
  },

  activity: {
    title: "Physical Activity Level",
    content: "Primary activity level determining caloric needs. Based on occupational demands and lifestyle patterns.",
    examples: [
      "Sedentary - Office work, minimal activity",
      "Moderate - Light physical work",
      "Heavy - Manual labor, construction",
      "Student - School-based activities"
    ]
  }
};

// Export all explanations
export const fieldExplanations = {
  sampleSize: sampleSizeExplanations,
  comparativeStudy: comparativeStudyExplanations,
  tTest: tTestExplanations,
  survival: survivalExplanations,
  diagnostic: diagnosticExplanations,
  crossSectional: crossSectionalExplanations,
  clinicalTrial: clinicalTrialExplanations,
  diseaseModel: diseaseModelExplanations,
  regression: regressionExplanations,
  familyStudy: familyStudyExplanations
};

// Helper function to get explanation for a field
export function getFieldExplanation(category: keyof typeof fieldExplanations, fieldName: string): FieldExplanation | null {
  const categoryExplanations = fieldExplanations[category];
  return categoryExplanations[fieldName] || null;
}
