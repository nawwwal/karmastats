'use client';

import { useState } from "react";
import { logisticRegression, LogisticRegressionResult } from "@/lib/regression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Shuffle } from "lucide-react";

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

const sampleDatasets = {
  medicalDiagnosis: {
    name: "Medical Diagnosis (Age, Symptoms → Disease)",
    data: `1, 45, 1, 1
0, 30, 0, 0
1, 55, 1, 0
0, 25, 0, 1
1, 60, 1, 1
0, 35, 0, 0
1, 50, 1, 0
0, 40, 0, 1`,
    variables: "Age, Symptom A, Symptom B"
  },
  marketing: {
    name: "Marketing Response (Income, Age → Purchase)",
    data: `1, 75000, 35
0, 45000, 25
1, 90000, 45
0, 30000, 22
1, 85000, 40
0, 55000, 30
1, 95000, 50
0, 40000, 28`,
    variables: "Income, Age"
  },
  creditApproval: {
    name: "Credit Approval (Income, Credit Score → Approval)",
    data: `1, 80000, 750
0, 35000, 580
1, 95000, 820
0, 25000, 520
1, 70000, 720
0, 40000, 600
1, 100000, 850
0, 30000, 550`,
    variables: "Income, Credit Score"
  }
};

interface LogisticRegressionFormProps {
  onResultsChange?: (results: any) => void;
}

export function LogisticRegressionForm({ onResultsChange }: LogisticRegressionFormProps) {
    const [dataMatrix, setDataMatrix] = useState(sampleDatasets.medicalDiagnosis.data);
    const [variableNames, setVariableNames] = useState(sampleDatasets.medicalDiagnosis.variables);
    const [result, setResult] = useState<LogisticRegressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadSampleData = (datasetKey: string) => {
        const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
        if (dataset) {
            setDataMatrix(dataset.data);
            setVariableNames(dataset.variables);
            setError(null);
            setResult(null);
            onResultsChange?.(null);
        }
    };

    const clearData = () => {
        setDataMatrix("");
        setVariableNames("");
        setError(null);
        setResult(null);
        onResultsChange?.(null);
    };

    const handleCalculate = () => {
        setError(null);
        setResult(null);
        onResultsChange?.(null);

        try {
            const { y, X } = parseMatrixInput(dataMatrix);
            const regressionResult = logisticRegression(y, X);

            if ("error" in regressionResult) {
                setError(regressionResult.error);
            } else {
                setResult(regressionResult);
                onResultsChange?.(regressionResult);
            }
        } catch (e: any) {
            setError("Invalid data format. Please check your input.");
        }
    };

    const varNames = ['Intercept', ...variableNames.split(',').map(name => name.trim())];

    return (
        <div className="space-y-6">
            {/* Sample Data Selector */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Quick Start with Sample Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Choose Sample Dataset</Label>
                            <Select onValueChange={loadSampleData}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sample dataset..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(sampleDatasets).map(([key, dataset]) => (
                                        <SelectItem key={key} value={key}>
                                            {dataset.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button variant="outline" onClick={clearData} className="flex-1">
                                <Shuffle className="h-4 w-4 mr-2" />
                                Clear Data
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Data Input */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="variableNames">Variable Names (comma-separated for X variables)</Label>
                    <Input
                        id="variableNames"
                        value={variableNames}
                        onChange={(e) => setVariableNames(e.target.value)}
                        placeholder="e.g., Age, Income, Education"
                    />
                    <p className="text-xs text-muted-foreground">
                        Names for the independent variables (predictors)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataMatrix">Data Matrix (Y, X1, X2, ... format)</Label>
                    <Textarea
                        id="dataMatrix"
                        value={dataMatrix}
                        onChange={(e) => setDataMatrix(e.target.value)}
                        placeholder="Format: Outcome (0/1), X1, X2, X3...
Example:
1, 45, 75000
0, 30, 45000
1, 55, 90000"
                        rows={8}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Each row: binary outcome (0/1) followed by independent variables
                    </p>
                </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
                Calculate Logistic Regression
            </Button>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="text-destructive flex items-center gap-2">
                            <span className="text-sm font-medium">Error:</span>
                            <span className="text-sm">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
