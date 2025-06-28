import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FamilyMember } from "@/lib/family-study";

interface ConsumptionUnitTableProps {
  members: FamilyMember[];
  cuBreakdown: {
    name: string;
    age: number;
    sex: string;
    category: string;
    cu: string;
  }[];
}

export function ConsumptionUnitTable({ members, cuBreakdown }: ConsumptionUnitTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No family members added yet. Please add family members first.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Sex</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>CU Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cuBreakdown.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.age}</TableCell>
            <TableCell className="capitalize">{item.sex}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.cu}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
