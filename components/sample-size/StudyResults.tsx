"use client";

import { StudyRecommendation } from "@/lib/studyDetector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface StudyResultsProps {
    recommendations: StudyRecommendation[];
    onReset: () => void;
}

export function StudyResults({ recommendations, onReset }: StudyResultsProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Our Recommendations</h2>

            <div className="grid gap-4">
                {recommendations.map((study, index) => (
                    <Card key={index} className={`border-l-4 ${
                        study.status === 'recommended'
                            ? 'border-l-green-500'
                            : study.status === 'alternative'
                            ? 'border-l-yellow-500'
                            : 'border-l-red-500'
                    }`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {study.status === 'recommended' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    {study.status === 'alternative' && <Clock className="h-5 w-5 text-yellow-500" />}
                                    {study.status === 'not-recommended' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                    {study.type}
                                </CardTitle>
                                <Badge variant={
                                    study.status === 'recommended'
                                        ? 'default'
                                        : study.status === 'alternative'
                                        ? 'secondary'
                                        : 'destructive'
                                }>
                                    {study.confidence}% confidence
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{study.reasoning}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button onClick={onReset} className="w-full">Start New Analysis</Button>
        </div>
    );
}
