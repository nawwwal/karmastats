'use client';

'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardModel } from "./StandardModel";
import { AdvancedModel } from "./AdvancedModel";

export function DiseaseMathPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="heading-1 mb-2">Infectious Disease Modeling</h1>
        <p className="text-muted-foreground">
          Model and simulate disease spread using advanced mathematical models
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Model</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Model</TabsTrigger>
          </TabsList>
          <TabsContent value="standard">
            <StandardModel />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedModel />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
