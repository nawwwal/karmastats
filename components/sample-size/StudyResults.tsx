"use client";

import { StudyRecommendation } from "@/lib/studyDetector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudyResultsProps {
    recommendations: StudyRecommendation[];
    onReset: () => void;
}

export function StudyResults({ recommendations, onReset }: StudyResultsProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Our Recommendations</h2>
            </div>
            {recommendations.map((study, index) => (
                <Card key={study.type} className={index === 0 ? "border-primary" : ""}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{study.title}</CardTitle>
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                                {study.confidence}% Match
                            </Badge>
                        </div>
                        <CardDescription>{study.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Key Features:</h4>
                            <div className="flex flex-wrap gap-2">
                                {study.features.map(feature => (
                                    <Badge key={feature} variant="outline">{feature}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Why we recommend this:</h4>
                            <p className="text-sm text-muted-foreground">{study.reasoning}</p>
                        </div>
                        {study.detectedKeywords.length > 0 && (
                             <div>
                                <h4 className="font-semibold mb-2">Detected Keywords:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {study.detectedKeywords.map(keyword => (
                                        <Badge key={keyword} variant="secondary">{keyword}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            <Button onClick={onReset} className="w-full">Start New Analysis</Button>
        </div>
    );
}
