import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinearRegressionTab } from "./LinearRegressionTab";
import { MultipleRegressionTab } from "./MultipleRegressionTab";

export function RegressionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Regression Analysis</h1>
        <p className="text-muted-foreground">
          Perform linear and multiple regression analysis with visualization.
        </p>
      </div>
      <Card className="p-6">
        <Tabs defaultValue="linear" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linear">Simple Linear Regression</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Regression</TabsTrigger>
          </TabsList>
          <TabsContent value="linear">
            <LinearRegressionTab />
          </TabsContent>
          <TabsContent value="multiple">
            <MultipleRegressionTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
