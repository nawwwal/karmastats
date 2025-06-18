'use client';

import { useState } from "react";
import { multipleRegression, MultipleRegressionResult } from "@/lib/regression";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, BarChart3, Shuffle } from "lucide-react";

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

const sampleDatasets = {
  housingPrices: {
    name: "Housing Prices (Area, Bedrooms → Price)",
    data: `250000, 1200, 2
300000, 1500, 3
180000, 900, 1
420000, 2000, 4
380000, 1800, 3
220000, 1000, 2
500000, 2500, 4
320000, 1600, 3`,
    variables: "Area (sq ft), Bedrooms"
  },
  studentGrades: {
    name: "Student Performance (Study Hours, Previous GPA → Final Grade)",
    data: `85, 8, 3.2
92, 12, 3.8
78, 5, 2.9
88, 9, 3.5
95, 15, 3.9
82, 7, 3.1
90, 11, 3.7
76, 4, 2.8`,
    variables: "Study Hours, Previous GPA"
  },
  salesPerformance: {
    name: "Sales Performance (Advertising, Experience → Sales)",
    data: `120000, 5000, 2
180000, 8000, 5
95000, 3000, 1
220000, 12000, 8
160000, 6500, 4
140000, 7000, 3
200000, 10000, 7
110000, 4000, 2`,
    variables: "Advertising Budget, Years Experience"
  }
};

interface MultipleRegressionFormProps {
  onResultsChange?: (results: any) => void;
}

export function MultipleRegressionForm({ onResultsChange }: MultipleRegressionFormProps) {
    const [dataMatrix, setDataMatrix] = useState(sampleDatasets.housingPrices.data);
    const [variableNames, setVariableNames] = useState(sampleDatasets.housingPrices.variables);
    const [result, setResult] = useState<MultipleRegressionResult | null>(null);
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
            const regressionResult = multipleRegression(y, X);

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
                            Select a dataset to explore multiple variable relationships
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
                        onClick={() => document.getElementById('csv-upload-multiple')?.click()}
                    >
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Drop your CSV file here, or click to browse</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Format: Y, X1, X2, X3... (dependent variable first, then independent variables)
                        </p>
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                            <strong>Example:</strong><br/>
                            250000, 1200, 2<br/>
                            300000, 1500, 3<br/>
                            180000, 900, 1
                        </div>
                    </div>
                    <input
                        id="csv-upload-multiple"
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
                    <Label htmlFor="variableNames">Variable Names (comma-separated for X variables)</Label>
                    <Input
                        id="variableNames"
                        value={variableNames}
                        onChange={(e) => setVariableNames(e.target.value)}
                        placeholder="e.g., Area (sq ft), Bedrooms"
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
                        placeholder="Format: Y, X1, X2, X3...
Example:
250000, 1200, 2
300000, 1500, 3
180000, 900, 1"
                        rows={8}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Each row: dependent variable (Y) followed by independent variables (X1, X2, ...)
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
                Calculate Multiple Regression
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
