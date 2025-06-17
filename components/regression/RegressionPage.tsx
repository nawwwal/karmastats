"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinearRegressionTab } from './LinearRegressionTab';
import { MultipleRegressionTab } from './MultipleRegressionTab';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function RegressionPage() {
  const [activeTab, setActiveTab] = useState('linear');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regression Analysis</h1>
        <p className="text-muted-foreground">
          Perform linear, polynomial, and logistic regression to model relationships between variables
        </p>
      </div>

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linear">Linear & Polynomial</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Regression</TabsTrigger>
          </TabsList>

          <TabsContent value="linear" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Linear & Polynomial Regression</CardTitle>
                <CardDescription>
                  Simple linear regression and polynomial regression for single predictor variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <LinearRegressionTab />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiple" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multiple Regression</CardTitle>
                <CardDescription>
                  Multiple linear regression and logistic regression for multiple predictor variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <MultipleRegressionTab />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}
