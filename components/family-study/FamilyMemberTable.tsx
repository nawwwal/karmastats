import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FamilyMember } from "@/lib/family-study";

interface FamilyMemberTableProps {
  members: FamilyMember[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

export function FamilyMemberTable({ members, onUpdate, onRemove }: FamilyMemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No family members added yet. Use the "Add Family Member" button to add members.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Relation to HOF</TableHead>
            <TableHead>Marital Status</TableHead>
            <TableHead>Education</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Income (₹/month)</TableHead>
            <TableHead>Activity Level</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => (
            <TableRow key={member.id}>
              <TableCell>{member.id}</TableCell>
              <TableCell>
                <Input 
                  value={member.name} 
                  onChange={(e) => onUpdate(index, 'name', e.target.value)} 
                  placeholder="Full Name" 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={member.age || ''} 
                  onChange={(e) => onUpdate(index, 'age', parseInt(e.target.value))} 
                  min={0} 
                  max={120} 
                  placeholder="Age" 
                />
              </TableCell>
              <TableCell>
                <Select 
                  value={member.sex} 
                  onValueChange={(value) => onUpdate(index, 'sex', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select 
                  value={member.relation} 
                  onValueChange={(value) => onUpdate(index, 'relation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self (Head)</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="brother">Brother</SelectItem>
                    <SelectItem value="sister">Sister</SelectItem>
                    <SelectItem value="grandfather">Grandfather</SelectItem>
                    <SelectItem value="grandmother">Grandmother</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select 
                  value={member.marital} 
                  onValueChange={(value) => onUpdate(index, 'marital', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input 
                  value={member.education} 
                  onChange={(e) => onUpdate(index, 'education', e.target.value)} 
                  placeholder="Education Level" 
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={member.occupation} 
                  onChange={(e) => onUpdate(index, 'occupation', e.target.value)} 
                  placeholder="Occupation" 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={member.income || ''} 
                  onChange={(e) => onUpdate(index, 'income', parseFloat(e.target.value))} 
                  min={0} 
                  placeholder="Monthly Income" 
                />
              </TableCell>
              <TableCell>
                <Select 
                  value={member.activity} 
                  onValueChange={(value) => onUpdate(index, 'activity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Heavy Work</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="homemaker">Homemaker</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onRemove(member.id)}
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