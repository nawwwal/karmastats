"use client";

import { useState } from 'react';
import { analyzeStudy, StudyRecommendation } from "@/lib/studyDetector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyDetectorFormProps {
    onAnalysisComplete: (recommendations: StudyRecommendation[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    isLoading: boolean;
}

export function StudyDetectorForm({ onAnalysisComplete, setIsLoading, isLoading }: StudyDetectorFormProps) {
    const [researchText, setResearchText] = useState("");

    const handleAnalyze = async () => {
        if (!researchText.trim()) return;
        setIsLoading(true);
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        const recommendations = analyzeStudy(researchText);
        onAnalysisComplete(recommendations);
        setIsLoading(false);
        // Scroll to top to show results

    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Describe Your Research</CardTitle>
                <CardDescription>
                    Provide a detailed description of your study objectives, and our AI will suggest the best study design.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={researchText}
                    onChange={(e) => setResearchText(e.target.value)}
                    placeholder="e.g., I want to investigate the prevalence of hypertension in adults..."
                    className="min-h-[150px]"
                />
                <Button onClick={handleAnalyze} disabled={isLoading || !researchText.trim()} className="w-full mt-4">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze and Recommend Study Design"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
