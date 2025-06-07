"use client";

import { useState } from 'react';
import { StudyDetectorForm } from '@/components/sample-size/StudyDetectorForm';
import { StudyResults } from '@/components/sample-size/StudyResults';
import { StudyRecommendation } from '@/lib/studyDetector';

export default function IntelligentDetectorPage() {
    const [recommendations, setRecommendations] = useState<StudyRecommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalysis = (recommendations: StudyRecommendation[]) => {
        setRecommendations(recommendations);
    };

    return (
        <div className="container mx-auto p-4">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Intelligent Study Detector</h1>
                <p className="text-muted-foreground">
                    Let AI help you choose the right study design.
                </p>
            </header>

            <div className="max-w-2xl mx-auto">
                {!recommendations ? (
                    <StudyDetectorForm onAnalysisComplete={handleAnalysis} setIsLoading={setIsLoading} isLoading={isLoading} />
                ) : (
                    <StudyResults recommendations={recommendations} onReset={() => setRecommendations(null)} />
                )}
            </div>
        </div>
    );
}
