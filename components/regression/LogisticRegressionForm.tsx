'use client';

import { useState } from "react";
import { logisticRegression, LogisticRegressionResult } from "@/backend/regression.logistic";
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
import { BarChart3, Shuffle, Upload } from "lucide-react";

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

const sampleDatasets = {
  medicalDiagnosis: {
    name: "Medical Diagnosis (Age, Blood Pressure → Disease)",
    data: `1, 65, 140
0, 35, 120
1, 70, 160
0, 40, 110
1, 55, 150
0, 45, 125
1, 60, 145
0, 50, 135
1, 75, 170
0, 30, 100
1, 80, 180
0, 25, 95
1, 85, 185
0, 42, 118
1, 72, 165`,
    variables: "Age, Blood Pressure"
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
0, 40000, 28
1, 110000, 55
0, 35000, 24
1, 120000, 60
0, 28000, 21
1, 105000, 52
0, 38000, 26
1, 130000, 65`,
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
0, 30000, 550
1, 120000, 800
0, 32000, 570
1, 90000, 780
0, 28000, 540
1, 110000, 830
0, 45000, 620
1, 135000, 880`,
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
    const [outcomeVariable, setOutcomeVariable] = useState("");

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
                // Scroll to top to show results

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
                        Try Sample Datasets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Select onValueChange={loadSampleData}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a sample dataset to get started..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(sampleDatasets).map(([key, dataset]) => (
                                    <SelectItem key={key} value={key}>
                                        {dataset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Select a dataset to explore binary classification models
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Your Data */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Your Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('csv-upload-logistic')?.click()}
                    >
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Drop your CSV file here, or click to browse</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Format: X1, X2, X3..., Y (features first, binary outcome last: 0 or 1)
                        </p>
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                            <strong>Example:</strong><br/>
                            35, 180, 1<br/>
                            45, 220, 0<br/>
                            28, 160, 1
                        </div>
                    </div>
                    <input
                        id="csv-upload-logistic"
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                    />

                    <div className="mt-4 flex items-center justify-between">
                        <Button variant="outline" onClick={clearData} size="sm">
                            <Shuffle className="h-4 w-4 mr-2" />
                            Clear All Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Data Input */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="variableNames">Variable Names (comma-separated for features)</Label>
                    <Input
                        id="variableNames"
                        value={variableNames}
                        onChange={(e) => setVariableNames(e.target.value)}
                        placeholder="e.g., Age, Blood Pressure"
                    />
                    <p className="text-xs text-muted-foreground">
                        Names for the independent variables (predictors/features)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="outcomeVariable">Outcome Variable Name</Label>
                    <Input
                        id="outcomeVariable"
                        value={outcomeVariable}
                        onChange={(e) => setOutcomeVariable(e.target.value)}
                        placeholder="e.g., Disease Status"
                    />
                    <p className="text-xs text-muted-foreground">
                        Name for the binary outcome variable (0 = no, 1 = yes)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataMatrix">Data Matrix (X1, X2, ..., Y format)</Label>
                    <Textarea
                        id="dataMatrix"
                        value={dataMatrix}
                        onChange={(e) => setDataMatrix(e.target.value)}
                        placeholder="Format: X1, X2, X3..., Y (outcome last)
Example:
35, 180, 1
45, 220, 0
28, 160, 1"
                        rows={8}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Each row: independent variables followed by binary outcome (0 or 1)
                    </p>
                </div>

                <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                        {dataMatrix.trim() && (
                            <span>
                                {dataMatrix.trim().split('\n').length} data points ready
                            </span>
                        )}
                    </div>
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
