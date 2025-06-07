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
