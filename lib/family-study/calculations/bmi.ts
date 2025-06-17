// BMI calculation utility functions

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
