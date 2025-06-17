import { sesClassifications } from '../data/ses-classifications';

export function getSESClass(perCapitaIncome: number, method: string): {
  class: string,
  color: string
} {
  const classification = sesClassifications[method as keyof typeof sesClassifications];

  if (!classification) {
    return { class: 'Unknown', color: 'secondary' };
  }

  for (const range of classification.classes) {
    if (range.max !== undefined) {
      // Has both min and max
      if (perCapitaIncome >= range.min && perCapitaIncome <= range.max) {
        return { class: range.class, color: range.color };
      }
    } else {
      // Only has min (top range)
      if (perCapitaIncome >= range.min) {
        return { class: range.class, color: range.color };
      }
    }
  }

  return { class: 'Unknown', color: 'secondary' };
}
