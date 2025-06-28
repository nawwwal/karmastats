import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FamilyMember, ImmunizationRecord } from "@/lib/family-study";

interface ImmunizationTableProps {
  records: ImmunizationRecord[];
  members: FamilyMember[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

export function ImmunizationTable({ records, members, onUpdate, onRemove }: ImmunizationTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No immunization records added yet. Use the "Add Immunization Record" button to add records.
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
            <TableHead>BCG</TableHead>
            <TableHead>OPV/IPV</TableHead>
            <TableHead>DPT/Pentavalent</TableHead>
            <TableHead>Hepatitis B</TableHead>
            <TableHead>MMR/MR</TableHead>
            <TableHead>COVID-19</TableHead>
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
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.bcg} 
                  onCheckedChange={(checked) => onUpdate(index, 'bcg', checked)} 
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.opv} 
                  onCheckedChange={(checked) => onUpdate(index, 'opv', checked)} 
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.dpt} 
                  onCheckedChange={(checked) => onUpdate(index, 'dpt', checked)} 
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.hepB} 
                  onCheckedChange={(checked) => onUpdate(index, 'hepB', checked)} 
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.mmr} 
                  onCheckedChange={(checked) => onUpdate(index, 'mmr', checked)} 
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={record.covid} 
                  onCheckedChange={(checked) => onUpdate(index, 'covid', checked)} 
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
