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
    const getStudyStatus = (confidence: number, index: number) => {
        if (index === 0 && confidence >= 80) return 'recommended';
        if (confidence >= 60) return 'alternative';
        return 'not-recommended';
    };

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Our Recommendations</h2>

            <div className="grid gap-4">
                {recommendations.map((study, index) => {
                    const status = getStudyStatus(study.confidence, index);
                    return (
                        <Card key={index} className={`border-l-4 ${
                            status === 'recommended'
                                ? 'border-l-green-500'
                                : status === 'alternative'
                                ? 'border-l-yellow-500'
                                : 'border-l-red-500'
                        }`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {status === 'recommended' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        {status === 'alternative' && <Clock className="h-5 w-5 text-yellow-500" />}
                                        {status === 'not-recommended' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                        {study.title}
                                    </CardTitle>
                                    <Badge variant={
                                        status === 'recommended'
                                            ? 'default'
                                            : status === 'alternative'
                                            ? 'secondary'
                                            : 'destructive'
                                    }>
                                        {study.confidence}% confidence
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">{study.description}</p>
                                <p className="text-sm text-muted-foreground">{study.reasoning}</p>
                                {study.features.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium mb-2">Key Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {study.features.map((feature, featureIndex) => (
                                                <Badge key={featureIndex} variant="outline" className="text-xs">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <Button onClick={onReset} className="w-full">Start New Analysis</Button>
        </div>
    );
}
