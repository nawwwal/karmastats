import { z } from 'zod';

// Zod validation schemas
export const DiseaseModelParamsSchema = z.object({
  populationSize: z.number().int().positive('Population size must be a positive integer'),
  initialCases: z.number().int().positive('Initial cases must be a positive integer'),
  transmissionRate: z.number().min(0).max(10, 'Transmission rate must be between 0 and 10'),
  incubationPeriod: z.number().positive('Incubation period must be positive'),
  recoveryRate: z.number().min(0).max(1, 'Recovery rate must be between 0 and 1'),
  mortalityRate: z.number().min(0).max(1, 'Mortality rate must be between 0 and 1'),
  simulationDays: z.number().int().min(1).max(3650, 'Simulation days must be between 1 and 3650'),
  seasonality: z.number().min(0).max(1, 'Seasonality must be between 0 and 1'),
});

export const InterventionParamsSchema = z.object({
  socialDistancing: z.number().min(0).max(1, 'Social distancing effectiveness must be between 0 and 1'),
  maskEffectiveness: z.number().min(0).max(1, 'Mask effectiveness must be between 0 and 1'),
  vaccinationRate: z.number().min(0).max(1, 'Vaccination rate must be between 0 and 1'),
  vaccineEffectiveness: z.number().min(0).max(1, 'Vaccine effectiveness must be between 0 and 1'),
});

export type DiseaseModelInput = z.infer<typeof DiseaseModelParamsSchema>;
export type InterventionInput = z.infer<typeof InterventionParamsSchema>;

export interface DiseaseModelParams {
  populationSize: number;
  initialCases: number;
  transmissionRate: number; // beta
  incubationPeriod: number; // days
  recoveryRate: number; // gamma
  mortalityRate: number; // mu
  simulationDays: number;
  seasonality: number; // 0-1
}

export interface InterventionParams {
  socialDistancing: number; // 0-1 scale
  maskEffectiveness: number; // 0-1 scale
  vaccinationRate: number; // daily % of susceptible
  vaccineEffectiveness: number; // 0-1 scale
}

export interface DiseaseModelResult {
  susceptible: number[];
  exposed: number[];
  infected: number[];
  recovered: number[];
  deceased: number[];
  vaccinated: number[];
  peakInfection: number;
  peakDay: number;
  totalCases: number;
  totalDeaths: number;
  r0: number;
}

export class DiseaseModel {
  private params: DiseaseModelParams;
  private interventions: InterventionParams;
  private dt: number = 1; // Time step in days

  constructor(params: DiseaseModelParams, interventions: InterventionParams) {
    this.params = params;
    this.interventions = interventions;
  }

  calculate(): DiseaseModelResult {
    const {
      populationSize,
      initialCases,
      transmissionRate,
      incubationPeriod,
      recoveryRate,
      mortalityRate,
      simulationDays,
      seasonality,
    } = this.params;

    const {
      socialDistancing,
      maskEffectiveness,
      vaccinationRate,
      vaccineEffectiveness,
    } = this.interventions;

    const sigma = 1 / incubationPeriod; // Progression rate from E to I
    const gamma = recoveryRate; // Recovery rate

    // Adjust transmission rate for interventions
    const adjustedTransmissionRate =
      transmissionRate * (1 - socialDistancing) * (1 - maskEffectiveness);

    const s: number[] = [populationSize - initialCases];
    const e: number[] = [0];
    const i: number[] = [initialCases];
    const r: number[] = [0];
    const d: number[] = [0];
    const v: number[] = [0];

    let peakInfection = initialCases;
    let peakDay = 0;

    for (let day = 0; day < simulationDays - 1; day++) {
      // Seasonal forcing on transmission
      const seasonalFactor = 1 + seasonality * Math.sin((2 * Math.PI * day) / 365);
      const beta = adjustedTransmissionRate * seasonalFactor;

      // Flows
      const newVaccinated = s[day] * vaccinationRate * vaccineEffectiveness;
      const newExposed = (beta * s[day] * i[day]) / populationSize;
      const newInfected = sigma * e[day];
      const newRecovered = gamma * i[day] * (1 - mortalityRate);
      const newDeceased = gamma * i[day] * mortalityRate;

      // Update compartments
      s[day + 1] = s[day] - newExposed - newVaccinated;
      e[day + 1] = e[day] + newExposed - newInfected;
      i[day + 1] = i[day] + newInfected - newRecovered - newDeceased;
      r[day + 1] = r[day] + newRecovered;
      d[day + 1] = d[day] + newDeceased;
      v[day + 1] = v[day] + newVaccinated;

      if (i[day + 1] > peakInfection) {
        peakInfection = i[day + 1];
        peakDay = day + 1;
      }
    }

    const r0 = (adjustedTransmissionRate / (gamma + mortalityRate)) * (s[0] / populationSize);
    const final_s = s[simulationDays - 1];
    const final_v = v[simulationDays - 1];

    const totalCases = populationSize - final_s - final_v;

    return {
      susceptible: s,
      exposed: e,
      infected: i,
      recovered: r,
      deceased: d,
      vaccinated: v,
      peakInfection,
      peakDay,
      totalCases: totalCases,
      totalDeaths: d[simulationDays - 1],
      r0,
    };
  }
}
