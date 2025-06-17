import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FamilyMember, HealthRecord } from "@/lib/family-study";

interface HealthRecordTableProps {
  records: HealthRecord[];
  members: FamilyMember[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

export function HealthRecordTable({ records, members, onUpdate, onRemove }: HealthRecordTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No health records added yet. Use the "Add Health Record" button to add records.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Height (cm)</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead>BMI</TableHead>
            <TableHead>BMI Category</TableHead>
            <TableHead>Blood Pressure</TableHead>
            <TableHead>Health Issues</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id}>
              <TableCell>
                <Select
                  value={record.name}
                  onValueChange={(value) => {
                    const member = members.find(m => m.name === value);
                    if (member) {
                      onUpdate(index, 'name', value);
                      onUpdate(index, 'age', member.age);
                      onUpdate(index, 'memberId', member.id);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={record.age || ''}
                  readOnly
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={record.height || ''}
                  onChange={(e) => {
                    const height = parseFloat(e.target.value);
                    onUpdate(index, 'height', height);

                    // Calculate BMI if both height and weight are available
                    if (height > 0 && record.weight) {
                      const heightInMeters = height / 100;
                      const bmi = record.weight / (heightInMeters * heightInMeters);
                      onUpdate(index, 'bmi', bmi);

                      // Determine BMI category
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
                      onUpdate(index, 'bmiCategory', category);
                    }
                  }}
                  min={0}
                  step={0.1}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={record.weight || ''}
                  onChange={(e) => {
                    const weight = parseFloat(e.target.value);
                    onUpdate(index, 'weight', weight);

                    // Calculate BMI if both height and weight are available
                    if (weight > 0 && record.height) {
                      const heightInMeters = record.height / 100;
                      const bmi = weight / (heightInMeters * heightInMeters);
                      onUpdate(index, 'bmi', bmi);

                      // Determine BMI category
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
                      onUpdate(index, 'bmiCategory', category);
                    }
                  }}
                  min={0}
                  step={0.1}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={record.bmi ? record.bmi.toFixed(1) : ''}
                  readOnly
                />
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  record.bmiCategory === 'Normal' ? 'bg-success/10 text-success' :
                  record.bmiCategory === 'Underweight' ? 'bg-warning/10 text-warning' :
                  record.bmiCategory === 'Overweight' ? 'bg-warning/15 text-warning' :
                  record.bmiCategory === 'Obese' ? 'bg-destructive/10 text-destructive' : ''
                }>
                  {record.bmiCategory || '-'}
                </Badge>
              </TableCell>
              <TableCell>
                <Input
                  value={record.bloodPressure || ''}
                  onChange={(e) => onUpdate(index, 'bloodPressure', e.target.value)}
                  placeholder="120/80"
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={record.healthIssues || ''}
                  onChange={(e) => onUpdate(index, 'healthIssues', e.target.value)}
                  rows={2}
                  placeholder="Any health problems"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(record.id)}
                >
                  🗑️ Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
