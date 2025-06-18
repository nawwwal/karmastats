"use client";

import { useState } from 'react';
import { StudyDetectorForm } from '@/components/sample-size/StudyDetectorForm';
import { StudyResults } from '@/components/sample-size/StudyResults';
import { StudyRecommendation } from '@/lib/studyDetector';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';

export default function IntelligentDetectorPage() {
    const [recommendations, setRecommendations] = useState<StudyRecommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalysis = (recommendations: StudyRecommendation[]) => {
        setRecommendations(recommendations);
    };

    const handleReset = () => {
        setRecommendations(null);
        setIsLoading(false);
    };

    const renderResults = () => {
        if (!recommendations) return null;
        return <StudyResults recommendations={recommendations} onReset={handleReset} />;
    };

    return (
        <ToolPageWrapper
            title="Intelligent Study Detector"
            description="Let AI help you choose the right study design and calculate appropriate sample sizes"
            category="Sample Size Calculator"
            onReset={recommendations ? handleReset : undefined}
            resultsSection={renderResults()}
        >
            {!recommendations ? (
                <StudyDetectorForm
                    onAnalysisComplete={handleAnalysis}
                    setIsLoading={setIsLoading}
                    isLoading={isLoading}
                />
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Your analysis is complete! Review the results on the right.</p>
                </div>
            )}
        </ToolPageWrapper>
    );
}
