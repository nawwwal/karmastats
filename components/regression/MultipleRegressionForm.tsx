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

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

export function MultipleRegressionForm() {
    const [dataMatrix, setDataMatrix] = useState("");
    const [variableNames, setVariableNames] = useState("");
    const [result, setResult] = useState<MultipleRegressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
        setError(null);
        setResult(null);

        try {
            const { y, X } = parseMatrixInput(dataMatrix);
            const regressionResult = multipleRegression(y, X);

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
                <Label htmlFor="dataMatrix">Data Matrix (Y, X1, X2, ...)</Label>
                <Textarea
                    id="dataMatrix"
                    value={dataMatrix}
                    onChange={(e) => setDataMatrix(e.target.value)}
                    placeholder={"10, 1, 5\n15, 2, 6\n20, 3, 7"}
                    rows={6}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="variableNames">Variable Names (comma-separated for X variables)</Label>
                <Input
                    id="variableNames"
                    value={variableNames}
                    onChange={(e) => setVariableNames(e.target.value)}
                    placeholder="e.g., Age, BMI"
                />
            </div>

            <Button onClick={handleCalculate} className="w-full">Calculate</Button>

            {error && <div className="text-red-500">{error}</div>}

            {result && (
                <Card>
                    <CardHeader><CardTitle>Results</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p><strong>R-squared:</strong> {result.rSquared.toFixed(4)}</p>
                            <p><strong>Adjusted R-squared:</strong> {result.adjustedRSquared.toFixed(4)}</p>
                            <p><strong>F-statistic:</strong> {result.F.toFixed(4)} (p-value: {result.fPValue.toExponential(4)})</p>
                            <p><strong>Observations:</strong> {result.n}</p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Variable</TableHead>
                                    <TableHead>Coefficient</TableHead>
                                    <TableHead>Std. Error</TableHead>
                                    <TableHead>t-statistic</TableHead>
                                    <TableHead>p-value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.coefficients.map((coef, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{varNames[i] || `X${i}`}</TableCell>
                                        <TableCell>{coef.toFixed(4)}</TableCell>
                                        <TableCell>{result.stdErrors[i].toFixed(4)}</TableCell>
                                        <TableCell>{result.tStats[i].toFixed(4)}</TableCell>
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
