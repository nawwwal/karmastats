"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CaseControlForm } from "@/components/sample-size/CaseControlForm";
import { CohortForm } from "@/components/sample-size/CohortForm";

export default function ComparativeStudyPage() {
  return (
    <Tabs defaultValue="case-control" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="case-control">Case-Control Study</TabsTrigger>
        <TabsTrigger value="cohort">Cohort Study</TabsTrigger>
      </TabsList>
      <TabsContent value="case-control">
        <Card>
          <CardHeader>
            <CardTitle>Case-Control Study Sample Size</CardTitle>
            <CardDescription>
              Calculate sample size for case-control studies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaseControlForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="cohort">
        <Card>
          <CardHeader>
            <CardTitle>Cohort Study Sample Size</CardTitle>
            <CardDescription>
                Calculate sample size for cohort studies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CohortForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
