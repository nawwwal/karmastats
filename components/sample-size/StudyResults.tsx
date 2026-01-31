"use client";

import React from 'react';
import { StudyRecommendation } from "@/backend/sample-size.intelligent-detector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedResultsDisplay } from "@/components/ui/enhanced-results-display";
import { AdvancedVisualization } from "@/components/ui/advanced-visualization";
import { CheckCircle, AlertCircle, Clock, Brain, RotateCcw, Target, TrendingUp, Users } from "lucide-react";

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

    const getStudyIcon = (studyType: string) => {
        const type = studyType.toLowerCase();
        if (type.includes('clinical') || type.includes('trial')) return Target;
        if (type.includes('cohort') || type.includes('longitudinal')) return TrendingUp;
        if (type.includes('cross') || type.includes('prevalence')) return Users;
        if (type.includes('case') || type.includes('control')) return Users;
        return Brain;
    };

    // PDF export removed for MVP

    // Prepare data for enhanced results display
    const enhancedResults = recommendations.map((rec, index) => ({
        label: rec.title,
        value: rec.confidence,
        format: "percentage" as const,
        category: index === 0 ? "primary" as const :
                 index === 1 ? "secondary" as const : "statistical" as const,
        highlight: index === 0,
        interpretation: rec.reasoning,
        unit: "% confidence"
    }));

    // Visualization data
    const confidenceData = recommendations.map(rec => ({
        label: rec.title.replace(/\s+/g, '\n'), // Line breaks for better display
        value: rec.confidence,
        color: rec.confidence >= 80 ? "hsl(var(--success))" :
               rec.confidence >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"
    }));

    const featureAnalysis = recommendations.reduce((acc, rec) => {
        rec.features.forEach(feature => {
            acc[feature] = (acc[feature] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const featureData = Object.entries(featureAnalysis)
        .map(([feature, count]) => ({ label: feature, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 features

    const interpretationData = {
        effectSize: `Top recommendation: ${recommendations[0]?.title} (${recommendations[0]?.confidence}% confidence)`,
        statisticalSignificance: `${recommendations.length} study designs evaluated`,
        clinicalSignificance: "AI-powered analysis provides personalized study design recommendations",
        recommendations: [
            "Consider the recommended study design as your primary approach",
            "Review alternative designs for comparison and validation",
            "Ensure your chosen design aligns with available resources",
            "Validate assumptions with statistical consultation if needed",
            "Plan for appropriate sample size based on the selected design"
        ],
        assumptions: [
            "AI recommendations based on pattern matching from research literature",
            "Confidence scores reflect design-objective alignment",
            "Multiple designs may be appropriate for complex research questions",
            "Final design choice should consider practical constraints"
        ]
    };

    return (
        <div className="space-y-8">
            <EnhancedResultsDisplay
                title="Study Design Recommendations"
                subtitle="AI-powered analysis of your research objectives"
                results={enhancedResults}
                interpretation={interpretationData}
                visualizations={
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AdvancedVisualization
                            title="Confidence Scores"
                            type="comparison"
                            data={confidenceData}
                            insights={[
                                {
                                    key: "Best match",
                                    value: `${recommendations[0]?.confidence}%`,
                                    significance: "high"
                                },
                                {
                                    key: "Designs analyzed",
                                    value: recommendations.length.toString(),
                                    significance: "medium"
                                }
                            ]}
                        />

                        {featureData.length > 0 && (
                            <AdvancedVisualization
                                title="Common Study Features"
                                type="pie"
                                data={featureData}
                                insights={[
                                    {
                                        key: "Most common",
                                        value: featureData[0]?.label || "N/A",
                                        significance: "medium"
                                    }
                                ]}
                            />
                        )}
                    </div>
                }
            />

            {/* Detailed Recommendations */}
        <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight">Detailed Recommendations</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((study, index) => {
                    const status = getStudyStatus(study.confidence, index);
                        const StudyIcon = getStudyIcon(study.title);

                    return (
                            <Card
                                key={index}
                                className={`border-l-4 ring-1 ring-offset-2 ring-offset-background ${
                            status === 'recommended'
                                        ? 'border-l-success bg-success/5 ring-success/10'
                                : status === 'alternative'
                                        ? 'border-l-warning bg-warning/5 ring-warning/10'
                                        : 'border-l-destructive bg-destructive/5 ring-destructive/10'
                                } shadow-lg`}
                            >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                status === 'recommended' ? 'bg-success/10' :
                                                status === 'alternative' ? 'bg-warning/10' : 'bg-destructive/10'
                                            }`}>
                                                <StudyIcon className={`h-5 w-5 ${
                                                    status === 'recommended' ? 'text-success' :
                                                    status === 'alternative' ? 'text-warning' : 'text-destructive'
                                                }`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {status === 'recommended' && <CheckCircle className="h-4 w-4 text-success" />}
                                                    {status === 'alternative' && <Clock className="h-4 w-4 text-warning" />}
                                                    {status === 'not-recommended' && <AlertCircle className="h-4 w-4 text-destructive" />}
                                                    <span className="text-lg">{study.title}</span>
                                                </div>
                                                {index === 0 && status === 'recommended' && (
                                                    <span className="text-sm text-success font-medium">Recommended Choice</span>
                                                )}
                                            </div>
                                    </CardTitle>
                                    <Badge variant={
                                        status === 'recommended'
                                            ? 'default'
                                            : status === 'alternative'
                                            ? 'secondary'
                                            : 'destructive'
                                        } className="font-semibold">
                                        {study.confidence}% confidence
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-base leading-relaxed">{study.description}</p>

                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <h5 className="font-semibold text-sm mb-2">Why this design?</h5>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{study.reasoning}</p>
                                        </div>

                                {study.features.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold text-sm mb-3">Key Features:</h5>
                                                <div className="flex flex-wrap gap-2">
                                            {study.features.map((feature, featureIndex) => (
                                                        <Badge
                                                            key={featureIndex}
                                                            variant="outline"
                                                            className="text-xs px-3 py-1"
                                                        >
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                    </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {/* PDF export removed */}

                <div className="flex justify-center sm:justify-end">
                    <Button
                        onClick={onReset}
                        variant="outline"
                        size="lg"
                        className="px-8 py-3 text-base font-semibold"
                    >
                        <RotateCcw className="h-5 w-5 mr-3" />
                        Start New Analysis
                    </Button>
                </div>
            </div>
        </div>
    );
}
