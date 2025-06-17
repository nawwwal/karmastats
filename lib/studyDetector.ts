import { z } from 'zod';

// Zod validation schema
export const StudyDetectorSchema = z.object({
  researchText: z.string()
    .min(10, 'Research description must be at least 10 characters')
    .max(5000, 'Research description must not exceed 5000 characters')
    .refine(text => text.trim().length > 0, {
      message: 'Research description cannot be empty or only whitespace'
    }),
});

export type StudyDetectorInput = z.infer<typeof StudyDetectorSchema>;

export interface StudyRecommendation {
  type: string;
  title: string;
  description: string;
  features: string[];
  confidence: number;
  reasoning: string;
  detectedKeywords: string[];
}

interface StudyTypePatterns {
  [key: string]: {
    primary: string[];
    secondary: string[];
    context: string[];
    negative: string[];
  };
}

const studyTypePatterns: StudyTypePatterns = {
    'cross-sectional': {
        primary: ['prevalence', 'proportion', 'frequency', 'distribution', 'snapshot', 'point in time', 'current status', 'burden of disease'],
        secondary: ['survey', 'questionnaire', 'cross-sectional', 'descriptive', 'epidemiological survey'],
        context: ['at a specific time', 'current state', 'existing cases', 'disease burden', 'health status'],
        negative: ['follow-up', 'longitudinal', 'intervention', 'randomized', 'control group']
    },
    'case-control': {
        primary: ['risk factors', 'cause', 'etiology', 'odds ratio', 'exposure', 'cases and controls', 'retrospective'],
        secondary: ['risk assessment', 'causal relationship', 'past exposure', 'case-control', 'matched controls'],
        context: ['compare cases', 'exposed vs unexposed', 'retrospective analysis', 'disease causation'],
        negative: ['prevalence', 'incidence rate', 'randomized', 'intervention']
    },
    'cohort': {
        primary: ['follow-up', 'longitudinal', 'incidence', 'relative risk', 'prospective', 'outcome over time'],
        secondary: ['cohort study', 'time to event', 'survival analysis', 'repeated measures', 'natural history'],
        context: ['over time', 'follow patients', 'development of disease', 'temporal relationship'],
        negative: ['prevalence', 'cross-sectional', 'intervention', 'randomized']
    },
    'clinical-trial': {
        primary: ['treatment', 'intervention', 'randomized', 'efficacy', 'effectiveness', 'trial', 'therapy'],
        secondary: ['clinical trial', 'controlled trial', 'randomization', 'placebo', 'treatment group', 'experimental'],
        context: ['compare treatments', 'intervention effect', 'therapeutic benefit', 'clinical effectiveness'],
        negative: ['observational', 'descriptive', 'prevalence', 'retrospective']
    },
    'diagnostic': {
        primary: ['sensitivity', 'specificity', 'diagnostic test', 'accuracy', 'screening', 'detection'],
        secondary: ['test performance', 'diagnostic accuracy', 'screening tool', 'biomarker', 'predictive value'],
        context: ['test validity', 'diagnostic performance', 'screening program', 'test evaluation'],
        negative: ['treatment', 'intervention', 'follow-up', 'incidence']
    }
};

const keywordWeights = {
    primary: 3.0,
    secondary: 2.0,
    context: 1.5,
    negative: -2.0,
};

const studyTypeDetails = {
    'cross-sectional': {
        title: 'Cross-Sectional Study',
        description: 'Ideal for measuring prevalence, distribution, and associations of health conditions at a specific point in time.',
        features: ['Prevalence estimation', 'Snapshot analysis', 'Cost-effective', 'Quick implementation', 'Population health assessment']
    },
    'case-control': {
        title: 'Case-Control Study',
        description: 'Excellent for investigating risk factors, causes, and associations with disease outcomes in a retrospective manner.',
        features: ['Risk factor analysis', 'Odds ratio calculation', 'Efficient for rare diseases', 'Retrospective design', 'Causal inference']
    },
    'cohort': {
        title: 'Cohort Study',
        description: 'Perfect for studying disease incidence, natural history, and following subjects over time to observe outcomes.',
        features: ['Incidence calculation', 'Temporal relationships', 'Multiple outcomes', 'Strong evidence level', 'Natural history']
    },
    'clinical-trial': {
        title: 'Clinical Trial',
        description: 'The gold standard for evaluating treatment effectiveness, interventions, and therapeutic approaches.',
        features: ['Treatment evaluation', 'Randomized design', 'Causal inference', 'High evidence quality', 'Intervention testing']
    },
    'diagnostic': {
        title: 'Diagnostic Accuracy Study',
        description: 'Designed to evaluate the performance, accuracy, and clinical utility of diagnostic tests or screening tools.',
        features: ['Test validation', 'Sensitivity/Specificity', 'Screening evaluation', 'Biomarker assessment', 'Clinical utility']
    }
};


function generateReasoning(studyType: string, keywords: string[]): string {
    const reasoningTemplates: { [key: string]: string } = {
        'cross-sectional': 'Your research focuses on measuring current status and distribution patterns, making cross-sectional design ideal for prevalence estimation and snapshot analysis.',
        'case-control': 'The emphasis on risk factors and causal relationships suggests a retrospective approach comparing cases with controls would be most effective.',
        'cohort': 'Your study involves following subjects over time to observe outcomes, which aligns perfectly with cohort study methodology.',
        'clinical-trial': 'The focus on intervention evaluation and treatment comparison indicates a randomized controlled trial design would provide the strongest evidence.',
        'diagnostic': 'Your research centers on test performance and diagnostic accuracy, requiring a diagnostic study design to properly evaluate test characteristics.'
    };

    let reasoning = reasoningTemplates[studyType] || 'This study design matches your research objectives and methodology.';

    if (keywords.length > 0) {
        reasoning += ` Key indicators detected: ${keywords.slice(0, 3).join(', ')}.`;
    }

    return reasoning;
}


export function analyzeStudy(text: string): StudyRecommendation[] {
    const normalizedText = text.toLowerCase();

    const studyScores: { [key: string]: number } = {};
    const detectedKeywords: { [key: string]: string[] } = {};

    Object.keys(studyTypePatterns).forEach(studyType => {
        studyScores[studyType] = 0;
        detectedKeywords[studyType] = [];
    });

    Object.entries(studyTypePatterns).forEach(([studyType, patterns]) => {
        Object.entries(patterns).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (normalizedText.includes(keyword)) {
                    const weight = keywordWeights[category as keyof typeof keywordWeights] || 1;
                    studyScores[studyType] += weight;

                    if (weight > 0) {
                        detectedKeywords[studyType].push(keyword);
                    }
                }
            });
        });
    });

    const sortedStudies = Object.entries(studyScores)
        .sort(([,a], [,b]) => b - a)
        .filter(([,score]) => score > 0);

    let recommendations = sortedStudies.map(([studyType, score]) => {
        const baseInfo = studyTypeDetails[studyType as keyof typeof studyTypeDetails];
        const confidence = Math.min(95, Math.max(50, Math.round((score / 10) * 100)));

        return {
            type: studyType,
            title: baseInfo.title,
            description: baseInfo.description,
            features: baseInfo.features,
            confidence: confidence,
            reasoning: generateReasoning(studyType, detectedKeywords[studyType]),
            detectedKeywords: detectedKeywords[studyType],
        };
    });

    if (recommendations.length === 0) {
        recommendations.push({
            type: 'cross-sectional',
            title: 'Cross-Sectional Study',
            description: 'Recommended as a suitable starting point for exploratory research.',
            features: ['Prevalence estimation', 'Snapshot analysis', 'Cost-effective', 'Quick implementation'],
            confidence: 65,
            reasoning: 'Based on general research characteristics, a cross-sectional design provides a practical approach for initial investigation.',
            detectedKeywords: [],
        });
    }

    return recommendations;
}
