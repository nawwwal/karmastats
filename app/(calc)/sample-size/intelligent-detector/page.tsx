"use client";

import { useState } from 'react';
import { StudyDetectorForm } from '@/components/sample-size/StudyDetectorForm';
import { StudyResults } from '@/components/sample-size/StudyResults';
import { StudyRecommendation } from '@/lib/studyDetector';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Brain } from 'lucide-react';

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

    const renderContent = () => {
        if (recommendations) {
            return <StudyResults recommendations={recommendations} onReset={handleReset} />;
        }

        return (
            <StudyDetectorForm
                onAnalysisComplete={handleAnalysis}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
            />
        );
    };

    return (
        <ToolPageWrapper
            title="Intelligent Study Detector"
            description="Let AI help you choose the right study design and calculate appropriate sample sizes"
            icon={Brain}
            layout="single-column"
            onReset={recommendations ? handleReset : undefined}
        >
            {renderContent()}
        </ToolPageWrapper>
    );
}
