import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DietaryItem } from "@/lib/family-study";

interface DietaryTableProps {
  items: DietaryItem[];
  onRemove: (index: number) => void;
  totalCU: number;
}

export function DietaryTable({ items, onRemove, totalCU }: DietaryTableProps) {
  // Calculate totals
  const totals = items.reduce((acc, item) => {
    acc.energy += parseFloat(item.energy.toString());
    acc.protein += parseFloat(item.protein.toString());
    acc.carbs += parseFloat(item.carbs.toString());
    acc.fat += parseFloat(item.fat.toString());
    acc.fiber += parseFloat(item.fiber.toString());
    return acc;
  }, { energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  // Calculate per CU values
  const perCU = {
    energy: totalCU > 0 ? totals.energy / totalCU : 0,
    protein: totalCU > 0 ? totals.protein / totalCU : 0,
    carbs: totalCU > 0 ? totals.carbs / totalCU : 0,
    fat: totalCU > 0 ? totals.fat / totalCU : 0,
    fiber: totalCU > 0 ? totals.fiber / totalCU : 0,
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No dietary items added yet. Use the food search to add items.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meal</TableHead>
            <TableHead>Food Item</TableHead>
            <TableHead>Quantity (g)</TableHead>
            <TableHead>Energy (kcal)</TableHead>
            <TableHead>Protein (g)</TableHead>
            <TableHead>Carbs (g)</TableHead>
            <TableHead>Fat (g)</TableHead>
            <TableHead>Fiber (g)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="capitalize">{item.meal}</TableCell>
              <TableCell>{item.foodName}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.energy}</TableCell>
              <TableCell>{item.protein}</TableCell>
              <TableCell>{item.carbs}</TableCell>
              <TableCell>{item.fat}</TableCell>
              <TableCell>{item.fiber}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onRemove(index)}
                >
                  🗑️
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted font-bold">
            <TableCell colSpan={3}>Total Daily Intake</TableCell>
            <TableCell>{totals.energy.toFixed(1)}</TableCell>
            <TableCell>{totals.protein.toFixed(1)}</TableCell>
            <TableCell>{totals.carbs.toFixed(1)}</TableCell>
            <TableCell>{totals.fat.toFixed(1)}</TableCell>
            <TableCell>{totals.fiber.toFixed(1)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow className="bg-muted/80">
            <TableCell colSpan={3}>Per CU Daily Intake</TableCell>
            <TableCell>{perCU.energy.toFixed(1)}</TableCell>
            <TableCell>{perCU.protein.toFixed(1)}</TableCell>
            <TableCell>{perCU.carbs.toFixed(1)}</TableCell>
            <TableCell>{perCU.fat.toFixed(1)}</TableCell>
            <TableCell>{perCU.fiber.toFixed(1)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
