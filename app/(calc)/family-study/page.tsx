import { Card } from "@/components/ui/card";

export default function FamilyStudyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Family Study</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This module is coming soon!
        </p>
        <span className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
          🚧 Under Construction 🚧
        </span>
      </Card>
    </div>
  );
}
