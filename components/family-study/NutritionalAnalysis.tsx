import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NutritionalAnalysisProps {
  calorieAdequacy: number;
  proteinAdequacy: number;
  perCUCalories: number;
  perCUProtein: number;
}

export function NutritionalAnalysis({
  calorieAdequacy,
  proteinAdequacy,
  perCUCalories,
  perCUProtein
}: NutritionalAnalysisProps) {
  // Helper functions
  const getAdequacyColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'text-success';
    if (percentage >= 70 && percentage < 90) return 'text-warning';
    if (percentage > 110 && percentage <= 130) return 'text-info';
    return 'text-destructive';
  };

  const getAdequacyStatus = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'bg-success/10 text-success';
    if (percentage >= 70 && percentage < 90) return 'bg-warning/10 text-warning';
    if (percentage > 110 && percentage <= 130) return 'bg-info/10 text-info';
    return 'bg-destructive/10 text-destructive';
  };

  const getAdequacyText = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'Adequate';
    if (percentage >= 70 && percentage < 90) return 'Borderline';
    if (percentage > 110 && percentage <= 130) return 'Excess';
    return 'Deficient';
  };

  const getOverallNutritionalVariant = (calorie: number, protein: number): 'default' | 'destructive' => {
    const avgAdequacy = (calorie + protein) / 2;
    if (avgAdequacy >= 85) return 'default';
    if (avgAdequacy >= 70) return 'default';
    return 'destructive';
  };

  const getOverallNutritionalMessage = (calorie: number, protein: number) => {
    const avgAdequacy = (calorie + protein) / 2;
    if (avgAdequacy >= 85) return 'Overall nutritional status is satisfactory. Continue current dietary practices with minor improvements.';
    if (avgAdequacy >= 70) return 'Nutritional status is borderline. Requires dietary modifications to prevent malnutrition.';
    return 'Poor nutritional status detected. Immediate dietary intervention and medical consultation recommended.';
  };

  const generateNutritionalRecommendations = (calorie: number, protein: number) => {
    let recommendations = [];

    if (calorie < 70) {
      recommendations.push('• Increase overall food intake to meet energy requirements');
      recommendations.push('• Include energy-dense foods like nuts, oils, and cereals');
    } else if (calorie > 130) {
      recommendations.push('• Reduce portion sizes to prevent excess caloric intake');
      recommendations.push('• Focus on nutrient-dense, low-calorie foods');
    }

    if (protein < 70) {
      recommendations.push('• Increase protein-rich foods like pulses, dairy, eggs, and meat');
      recommendations.push('• Include protein in every major meal');
    } else if (protein > 130) {
      recommendations.push('• Balance protein intake with other macronutrients');
    }

    recommendations.push('• Follow ICMR My Plate guidelines for balanced nutrition');
    recommendations.push('• Include variety in food choices across all food groups');
    recommendations.push('• Ensure adequate intake of fruits and vegetables');
    recommendations.push('• Monitor family nutritional status regularly');

    return recommendations;
  };

  // ICMR-NIN 2020 Recommendations per CU
  const recommendedCalories = 2110; // kcal per CU
  const recommendedProtein = 0.83 * 65; // 54g protein per CU (0.83g/kg for 65kg reference male)

  return (
    <>
      <h4 className="font-semibold text-lg mb-4">📊 Nutritional Adequacy Analysis</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${getAdequacyColor(calorieAdequacy)}`}>
              {calorieAdequacy.toFixed(1)}%
            </div>
            <div className="text-sm">Energy Adequacy</div>
            <Badge variant="outline" className={`mt-2 ${getAdequacyStatus(calorieAdequacy)}`}>
              {getAdequacyText(calorieAdequacy)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${getAdequacyColor(proteinAdequacy)}`}>
              {proteinAdequacy.toFixed(1)}%
            </div>
            <div className="text-sm">Protein Adequacy</div>
            <Badge variant="outline" className={`mt-2 ${getAdequacyStatus(proteinAdequacy)}`}>
              {getAdequacyText(proteinAdequacy)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <h4 className="font-semibold text-lg mb-4">📋 Detailed Nutritional Assessment</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nutrient</TableHead>
            <TableHead>Per CU Intake</TableHead>
            <TableHead>ICMR-NIN RDA</TableHead>
            <TableHead>Adequacy (%)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Energy (kcal)</TableCell>
            <TableCell>{perCUCalories.toFixed(1)}</TableCell>
            <TableCell>{recommendedCalories}</TableCell>
            <TableCell>{calorieAdequacy.toFixed(1)}%</TableCell>
            <TableCell>
              <Badge variant="outline" className={getAdequacyStatus(calorieAdequacy)}>
                {getAdequacyText(calorieAdequacy)}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Protein (g)</TableCell>
            <TableCell>{perCUProtein.toFixed(1)}</TableCell>
            <TableCell>{recommendedProtein.toFixed(1)}</TableCell>
            <TableCell>{proteinAdequacy.toFixed(1)}%</TableCell>
            <TableCell>
              <Badge variant="outline" className={getAdequacyStatus(proteinAdequacy)}>
                {getAdequacyText(proteinAdequacy)}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h4 className="font-semibold text-lg mt-6 mb-4">🏥 Health Risk Assessment</h4>
      <Alert variant={getOverallNutritionalVariant(calorieAdequacy, proteinAdequacy)}>
        <AlertTitle>Nutritional Status</AlertTitle>
        <AlertDescription>
          {getOverallNutritionalMessage(calorieAdequacy, proteinAdequacy)}
        </AlertDescription>
      </Alert>

      <h4 className="font-semibold text-lg mt-6 mb-4">💡 Recommendations</h4>
      <div className="bg-card p-4 rounded-md border">
        <ul className="space-y-2">
          {generateNutritionalRecommendations(calorieAdequacy, proteinAdequacy).map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
