"use client";

import React, { useState } from 'react';
import { analyzeStudy, StudyRecommendation } from "@/lib/studyDetector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Brain, FileUp, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyDetectorFormProps {
    onAnalysisComplete: (recommendations: StudyRecommendation[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    isLoading: boolean;
}

export function StudyDetectorForm({ onAnalysisComplete, setIsLoading, isLoading }: StudyDetectorFormProps) {
    const [researchText, setResearchText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!researchText.trim()) {
            setError("Please provide a description of your research before analyzing.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // Simulate processing time for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            const recommendations = analyzeStudy(researchText);
            onAnalysisComplete(recommendations);
        } catch (err: any) {
            setError(`Analysis failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // PDF import removed for MVP

    return (
        <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="space-y-8 pt-8">
                {error && (
                    <Alert className="border-destructive/20 bg-destructive/10 text-left">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertTitle className="text-destructive font-bold text-left">Analysis Error</AlertTitle>
                        <AlertDescription className="text-destructive text-left">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* PDF upload removed */}

                {/* Research Description Form */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Describe Your Research
                        </CardTitle>
                        <CardDescription>
                            Provide a detailed description of your study objectives, population, and research questions.
                            Our AI will analyze your text and suggest the most appropriate study design.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="research-text" className="text-sm font-medium">
                                Research Description *
                            </label>
                            <Textarea
                                id="research-text"
                                value={researchText}
                                onChange={(e) => {
                                    setResearchText(e.target.value);
                                    if (error) setError(null); // Clear error when user starts typing
                                }}
                                placeholder="Example: I want to investigate the prevalence of hypertension in adults aged 40-65 years in urban areas. I'm particularly interested in understanding how lifestyle factors like diet, exercise, and stress levels influence blood pressure. I have access to a population registry and can recruit participants from multiple clinics..."
                                className="min-h-[200px] text-base leading-relaxed"
                                maxLength={2000}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                    Include: study objectives, target population, variables of interest, and available resources
                                </span>
                                <span>{researchText.length}/2000 characters</span>
                            </div>
                        </div>

                        {/* Example Prompts */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Quick Examples:</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    "I want to study the effectiveness of a new treatment compared to standard care",
                                    "I need to determine the prevalence of a condition in a specific population",
                                    "I want to investigate risk factors for a disease over time",
                                    "I need to evaluate the accuracy of a new diagnostic test"
                                ].map((example, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setResearchText(example)}
                                        className="text-left text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-primary/20"
                                    >
                                        "{example}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analyze Button */}
                <div className="flex justify-center pt-6">
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || !researchText.trim()}
                        size="lg"
                        className="px-12 py-4 text-lg font-semibold h-14"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Analyzing Your Research...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-3 h-5 w-5" />
                                Analyze & Recommend Study Design
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
