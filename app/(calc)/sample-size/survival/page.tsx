"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogRankForm } from "@/components/sample-size/LogRankForm";
import { CoxRegressionForm } from "@/components/sample-size/CoxRegressionForm";
import { OneArmSurvivalForm } from "@/components/sample-size/OneArmSurvivalForm";

export default function SurvivalAnalysisPage() {
  return (
    <Tabs defaultValue="log-rank" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="log-rank">Log-Rank Test</TabsTrigger>
        <TabsTrigger value="cox">Cox Regression</TabsTrigger>
        <TabsTrigger value="one-arm">One-Arm Survival</TabsTrigger>
      </TabsList>
      <TabsContent value="log-rank">
        <Card>
          <CardHeader>
            <CardTitle>Log-Rank Test Sample Size</CardTitle>
            <CardDescription>
              For comparing survival distributions between two independent groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogRankForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="cox">
        <Card>
          <CardHeader>
            <CardTitle>Cox Proportional Hazards Sample Size</CardTitle>
            <CardDescription>
                For survival analysis with covariate adjustment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoxRegressionForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="one-arm">
        <Card>
          <CardHeader>
            <CardTitle>One-Arm Survival Study Sample Size</CardTitle>
            <CardDescription>
                For single-arm studies comparing against historical controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OneArmSurvivalForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
