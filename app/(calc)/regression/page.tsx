"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinearRegressionForm } from "@/components/regression/LinearRegressionForm";
import { MultipleRegressionForm } from "@/components/regression/MultipleRegressionForm";
import { PolynomialRegressionForm } from "@/components/regression/PolynomialRegressionForm";
import { LogisticRegressionForm } from "@/components/regression/LogisticRegressionForm";

export default function RegressionPage() {
  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Regression Analysis</h1>
        <p className="text-muted-foreground">
          Explore relationships between variables.
        </p>
      </header>

      <Tabs defaultValue="linear" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="linear">Simple Linear</TabsTrigger>
          <TabsTrigger value="multiple">Multiple</TabsTrigger>
          <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
          <TabsTrigger value="logistic">Logistic</TabsTrigger>
        </TabsList>
        <TabsContent value="linear">
          <Card>
            <CardHeader>
              <CardTitle>Simple Linear Regression</CardTitle>
              <CardDescription>
                Analyze the relationship between one independent variable (X)
                and one dependent variable (Y).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinearRegressionForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Regression</CardTitle>
              <CardDescription>
                Analyze the relationship between multiple independent variables
                (X₁, X₂, ...) and one dependent variable (Y).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultipleRegressionForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="polynomial">
          <Card>
            <CardHeader>
              <CardTitle>Polynomial Regression</CardTitle>
              <CardDescription>
                Model a non-linear relationship between the independent
                variable x and the dependent variable y.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolynomialRegressionForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logistic">
          <Card>
            <CardHeader>
              <CardTitle>Logistic Regression</CardTitle>
              <CardDescription>
                Predict a binary outcome (e.g., yes/no, 1/0) from a set of
                independent variables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogisticRegressionForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
