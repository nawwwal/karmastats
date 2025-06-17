import { Card, CardContent } from "@/components/ui/card";
import { FamilyMember } from "@/lib/family-study";

interface FamilyStatisticsProps {
  members: FamilyMember[];
}

export function FamilyStatistics({ members }: FamilyStatisticsProps) {
  const maleCount = members.filter(m => m.sex === 'male').length;
  const femaleCount = members.filter(m => m.sex === 'female').length;
  const childrenCount = members.filter(m => m.age < 18).length;
  const adultsCount = members.filter(m => m.age >= 18 && m.age < 60).length;
  const elderlyCount = members.filter(m => m.age >= 60).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{members.length}</div>
          <div className="text-sm">Total Members</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{maleCount}</div>
          <div className="text-sm">Males</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{femaleCount}</div>
          <div className="text-sm">Females</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{childrenCount}</div>
          <div className="text-sm">Children (&lt;18 yrs)</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{adultsCount}</div>
          <div className="text-sm">Adults (18-59 yrs)</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{elderlyCount}</div>
          <div className="text-sm">Elderly (≥60 yrs)</div>
        </CardContent>
      </Card>
    </div>
  );
}