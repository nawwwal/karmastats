'use client';

'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardModel } from "./StandardModel";
import { AdvancedModel } from "./AdvancedModel";

export function DiseaseMathPage() {
  const [activeTab, setActiveTab] = useState('standard');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Infectious Disease Modeling</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced compartmental models for analyzing the spread of infectious diseases,
          including vaccination strategies and intervention measures.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="standard">Standard SEIR</TabsTrigger>
            <TabsTrigger value="advanced">Advanced SEIRDV</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard SEIR Model</CardTitle>
              <CardDescription>
                Basic susceptible-exposed-infected-recovered model for disease spread analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StandardModel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEIRDV Model</CardTitle>
              <CardDescription>
                Extended model including deaths and vaccination compartments with intervention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedModel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
