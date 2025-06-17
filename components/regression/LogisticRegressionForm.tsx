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

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

export function LogisticRegressionForm() {
    const [dataMatrix, setDataMatrix] = useState("");
    const [variableNames, setVariableNames] = useState("");
    const [result, setResult] = useState<LogisticRegressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
        setError(null);
        setResult(null);

        try {
            const { y, X } = parseMatrixInput(dataMatrix);

            if (y.some(val => val !== 0 && val !== 1)) {
                setError("Dependent variable (Y) must be binary (0 or 1).");
                return;
            }

            const regressionResult = logisticRegression(y, X);

            if ("error" in regressionResult) {
                setError(regressionResult.error);
            } else {
                setResult(regressionResult);
            }
        } catch (e: any) {
            setError("Invalid data format. Please check your input.");
        }
    };

    const varNames = ['Intercept', ...variableNames.split(',').map(name => name.trim())];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="dataMatrixLogistic">Data Matrix (Y, X1, X2, ...)</Label>
                <Textarea
                    id="dataMatrixLogistic"
                    value={dataMatrix}
                    onChange={(e) => setDataMatrix(e.target.value)}
                    placeholder={"0, 22, 1\n1, 45, 0\n0, 30, 1"}
                    rows={6}
                />
                 <p className="text-sm text-muted-foreground">
                    Dependent variable (first column) must be binary (0 or 1).
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="variableNamesLogistic">Variable Names (comma-separated for X variables)</Label>
                <Input
                    id="variableNamesLogistic"
                    value={variableNames}
                    onChange={(e) => setVariableNames(e.target.value)}
                    placeholder="e.g., Age, Smoker"
                />
            </div>

            <Button onClick={handleCalculate} className="w-full">Calculate</Button>

            {error && <div className="text-destructive">{error}</div>}

            {result && (
                <Card>
                    <CardHeader><CardTitle>Results</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p><strong>Log-Likelihood:</strong> {result.logLikelihood.toFixed(4)}</p>
                            <p><strong>AIC:</strong> {result.aic.toFixed(4)}</p>
                            <p><strong>Iterations:</strong> {result.iterations}</p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Variable</TableHead>
                                    <TableHead>Coefficient</TableHead>
                                    <TableHead>Std. Error</TableHead>
                                    <TableHead>z-statistic</TableHead>
                                    <TableHead>p-value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.coefficients.map((coef, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{varNames[i] || `X${i}`}</TableCell>
                                        <TableCell>{coef.toFixed(4)}</TableCell>
                                        <TableCell>{result.standardErrors[i].toFixed(4)}</TableCell>
                                        <TableCell>{result.zStats[i].toFixed(4)}</TableCell>
                                        <TableCell>{result.pValues[i].toExponential(4)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
