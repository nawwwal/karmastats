'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, AlertCircle, Save, Printer, Users, FileText } from "lucide-react";
import { consumptionUnits, sesClassifications } from "@/backend/family-study";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';

// Import the loadFoodDatabase function directly
async function loadFoodDatabase() {
  const foodData = await import('@/lib/family-study/data/food-database.json');
  return foodData.default;
}

export default function FamilyStudyPage() {
  // State variables
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [dietaryItems, setDietaryItems] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [immunizationRecords, setImmunizationRecords] = useState<any[]>([]);
  const [foodDatabaseData, setFoodDatabaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [formData, setFormData] = useState({
    studyDate: '', // Will be set after hydration
    familyId: '', // Will be set after hydration
    familyHead: '',
    address: '',
    pincode: '',
    area: '',
    residingYears: '',
    residingMonths: '',
    residingDays: '',
    native: '',
    religion: '',
    caste: '',
    familyType: 'nuclear',
    pedigreeNotes: '',
    primaryIncome: '',
    otherIncome: '',
    totalIncome: '0',
    familySize: '0',
    perCapitaIncome: '0',
    sesMethod: 'prasad',
    sesClass: '',
    rationCard: 'none',
    socialSchemes: [] as string[],
    familyHarmony: '',
    decisionPattern: '',
    relativeRelations: '',
    neighborRelations: '',
    psychOvercrowding: 'absent',
    houseOwnership: '',
    houseType: '',
    numberOfRooms: '',
    totalFloorArea: '',
    perCapitaFloorArea: '0',
    personsPerRoom: '0',
    waterSupply: '',
    toiletFacility: '',
    electricity: '',
    cookingFuel: '',
    ventilation: '',
    lighting: '',
    totalFamilyCU: '0',
    averageCUPerPerson: '0',
    chronicDiseases: [] as string[]
  });

  // Load food database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const foodData = await loadFoodDatabase();
        setFoodDatabaseData(foodData);
      } catch (error) {
        console.error('Failed to load food database:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Set date and ID after hydration to avoid SSR/client mismatch
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      studyDate: new Date().toISOString().split('T')[0],
      familyId: `FAM-${Date.now().toString().substr(-6)}`
    }));
  }, []);

  // Handler functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[name as keyof typeof prev] as string[] || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const markSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const calculateSES = () => {
    const primaryIncome = parseFloat(formData.primaryIncome) || 0;
    const otherIncome = parseFloat(formData.otherIncome) || 0;
    const totalIncome = primaryIncome + otherIncome;
    const familySize = familyMembers.length || 1;
    const perCapitaIncome = totalIncome / familySize;

    setFormData(prev => ({
      ...prev,
      totalIncome: totalIncome.toString(),
      familySize: familySize.toString(),
      perCapitaIncome: perCapitaIncome.toFixed(2)
    }));

    const sesMethod = formData.sesMethod;
    if (totalIncome > 0) {
      const classification = sesClassifications[sesMethod as keyof typeof sesClassifications];
      let selectedClass = null;

      for (const cls of classification.classes) {
        if (perCapitaIncome >= cls.min && (!cls.max || perCapitaIncome <= cls.max)) {
          selectedClass = cls;
          break;
        }
      }

      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          sesClass: `${selectedClass.class} (₹${perCapitaIncome.toFixed(0)} per capita/month)`
        }));
      }
    }
  };

  const addFamilyMember = () => {
    const newMember = {
      id: familyMembers.length + 1,
      name: '',
      age: 0,
      sex: '',
      relation: '',
      marital: '',
      education: '',
      occupation: '',
      income: 0,
      activity: ''
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const updateFamilyMember = (index: number, field: string, value: any) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFamilyMembers(updatedMembers);
    calculateSES();
  };

  const removeFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
    calculateSES();
  };

  const generateReport = () => {
    setShowReport(true);
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PDF export removed for MVP

  const handleReset = () => {
    setFormData({
      studyDate: new Date().toISOString().split('T')[0],
      familyId: `FAM-${Date.now().toString().substr(-6)}`,
      familyHead: '',
      address: '',
      pincode: '',
      area: '',
      residingYears: '',
      residingMonths: '',
      residingDays: '',
      native: '',
      religion: '',
      caste: '',
      familyType: 'nuclear',
      pedigreeNotes: '',
      primaryIncome: '',
      otherIncome: '',
      totalIncome: '0',
      familySize: '0',
      perCapitaIncome: '0',
      sesMethod: 'prasad',
      sesClass: '',
      rationCard: 'none',
      socialSchemes: [],
      familyHarmony: '',
      decisionPattern: '',
      relativeRelations: '',
      neighborRelations: '',
      psychOvercrowding: 'absent',
      houseOwnership: '',
      houseType: '',
      numberOfRooms: '',
      totalFloorArea: '',
      perCapitaFloorArea: '0',
      personsPerRoom: '0',
      waterSupply: '',
      toiletFacility: '',
      electricity: '',
      cookingFuel: '',
      ventilation: '',
      lighting: '',
      totalFamilyCU: '0',
      averageCUPerPerson: '0',
      chronicDiseases: []
    });
    setFamilyMembers([]);
    setDietaryItems([]);
    setHealthRecords([]);
    setImmunizationRecords([]);
    setCompletedSections(new Set());
    setShowReport(false);
  };

  const getCompletionProgress = () => {
    const totalSections = 6;
    return (completedSections.size / totalSections) * 100;
  };

  const SectionIcon = ({ sectionId }: { sectionId: string }) => {
    if (completedSections.has(sectionId)) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const renderResults = () => {
    if (!showReport) return null;

    const totalMembers = familyMembers.length;
    const maleCount = familyMembers.filter(m => m.sex === 'male').length;
    const femaleCount = familyMembers.filter(m => m.sex === 'female').length;
    const childrenCount = familyMembers.filter(m => m.age < 18).length;
    const elderlyCount = familyMembers.filter(m => m.age >= 60).length;
    const perCapitaIncome = parseFloat(formData.perCapitaIncome) || 0;
    const chronicDiseasesCount = formData.chronicDiseases.length;

    const enhancedResults = [
      {
        label: 'Total Family Members',
        value: totalMembers,
        format: 'integer' as const,
        category: 'primary' as const,
        highlight: true,
        interpretation: 'Complete family composition including all residents'
      },
      {
        label: 'Per Capita Monthly Income',
        value: perCapitaIncome,
        format: 'decimal' as const,
        unit: '₹',
        category: 'primary' as const,
        highlight: true,
        interpretation: `${formData.sesClass || 'Income-based classification'}`,
        benchmark: {
          value: 5000,
          label: "Middle income threshold",
          comparison: (perCapitaIncome > 5000 ? 'above' : 'below') as 'above' | 'below'
        }
      },
      {
        label: 'Dependency Ratio',
        value: totalMembers > 0 ? ((childrenCount + elderlyCount) / (totalMembers - childrenCount - elderlyCount) || 1) * 100 : 0,
        format: 'percentage' as const,
        category: 'statistical' as const,
        interpretation: 'Ratio of dependents (children + elderly) to working-age adults'
      },
      {
        label: 'Male Members',
        value: maleCount,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: `${totalMembers > 0 ? ((maleCount / totalMembers) * 100).toFixed(1) : 0}% of family`
      },
      {
        label: 'Female Members',
        value: femaleCount,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: `${totalMembers > 0 ? ((femaleCount / totalMembers) * 100).toFixed(1) : 0}% of family`
      },
      {
        label: 'Children (<18 years)',
        value: childrenCount,
        format: 'integer' as const,
        category: 'success' as const,
        interpretation: 'Individuals requiring pediatric care and education focus'
      },
      {
        label: 'Elderly (≥60 years)',
        value: elderlyCount,
        format: 'integer' as const,
        category: 'warning' as const,
        interpretation: 'Individuals requiring geriatric care and support'
      },
      {
        label: 'Chronic Diseases',
        value: chronicDiseasesCount,
        format: 'integer' as const,
        category: chronicDiseasesCount > 0 ? 'critical' as const : 'success' as const,
        interpretation: chronicDiseasesCount > 0 ? 'Family has chronic disease burden requiring management' : 'No reported chronic diseases'
      }
    ];

    // Prepare visualization data
    const genderDistribution = [
      { label: 'Male', value: maleCount, color: 'hsl(var(--primary))' },
      { label: 'Female', value: femaleCount, color: 'hsl(var(--secondary))' }
    ];

    const ageDistribution = [
      { label: 'Children (<18)', value: childrenCount, color: 'hsl(var(--success))' },
      { label: 'Adults (18-59)', value: totalMembers - childrenCount - elderlyCount, color: 'hsl(var(--primary))' },
      { label: 'Elderly (≥60)', value: elderlyCount, color: 'hsl(var(--warning))' }
    ];

    const socioeconomicData = [
      { label: 'Total Income', value: parseFloat(formData.totalIncome) || 0 },
      { label: 'Per Capita Income', value: perCapitaIncome },
      { label: 'Family Size', value: totalMembers }
    ];

    const interpretationData = {
      effectSize: `Family of ${totalMembers} members with ${formData.sesClass.split(' ')[0] || 'unclassified'} socio-economic status`,
      statisticalSignificance: `Per capita income of ₹${perCapitaIncome} indicates ${perCapitaIncome > 5000 ? 'above average' : 'below average'} economic status`,
      clinicalSignificance: `${chronicDiseasesCount > 0 ? `${chronicDiseasesCount} chronic condition(s) require ongoing medical attention` : 'No reported chronic diseases - good health status'}`,
      recommendations: [
        'Regular health check-ups for all family members, especially elderly and children',
        'Maintain proper hygiene and sanitation practices based on available facilities',
        'Ensure balanced nutrition following ICMR-NIN guidelines',
        'Monitor and manage chronic diseases with healthcare providers',
        'Participate in government health and nutrition schemes',
        'Focus on preventive healthcare and immunization schedules'
      ],
      assumptions: [
        'Income data is current and accurately reported',
        'Health information is self-reported and may need clinical verification',
        'Socio-economic classification follows standard methodologies',
        'Environmental assessment is based on current conditions',
        'Family composition is stable during assessment period'
      ]
    };

  return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title="Family Health Assessment Report"
          subtitle={`Comprehensive analysis for Family ID: ${formData.familyId} assessed on ${formData.studyDate}`}
          results={enhancedResults}
          interpretation={interpretationData}
          visualizations={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedVisualization
                title="Gender Distribution"
                type="pie"
                data={genderDistribution}
                insights={[
                  {
                    key: "Gender ratio",
                    value: `${maleCount}:${femaleCount}`,
                    significance: "medium"
                  },
                  {
                    key: "Dominant gender",
                    value: maleCount > femaleCount ? "Male" : femaleCount > maleCount ? "Female" : "Equal",
                    significance: "low"
                  }
                ]}
              />

              <AdvancedVisualization
                title="Age Group Distribution"
                type="pie"
                data={ageDistribution}
                insights={[
                  {
                    key: "Dependency ratio",
                    value: `${((childrenCount + elderlyCount) / (totalMembers - childrenCount - elderlyCount || 1) * 100).toFixed(1)}%`,
                    significance: "high",
                    trend: (childrenCount + elderlyCount) / (totalMembers - childrenCount - elderlyCount || 1) > 0.5 ? "up" : "down"
                  },
                  {
                    key: "Vulnerable members",
                    value: `${childrenCount + elderlyCount}/${totalMembers}`,
                    significance: "medium"
                  }
                ]}
              />

              <AdvancedVisualization
                title="Socio-Economic Indicators"
                type="comparison"
                data={socioeconomicData}
                insights={[
                  {
                    key: "Economic status",
                    value: formData.sesClass.split(' ')[0] || 'Unclassified',
                    significance: "high"
                  },
                  {
                    key: "Income adequacy",
                    value: perCapitaIncome > 5000 ? "Above average" : "Below average",
                    trend: perCapitaIncome > 5000 ? "up" : "down",
                    significance: "high"
                  }
                ]}
              />

              <AdvancedVisualization
                title="Health Risk Profile"
                type="comparison"
                data={[
                  { label: 'Chronic Diseases', value: chronicDiseasesCount },
                  { label: 'Risk Score', value: (chronicDiseasesCount / totalMembers * 100) || 0 },
                  { label: 'Vulnerable Members', value: childrenCount + elderlyCount }
                ]}
                insights={[
                  {
                    key: "Health status",
                    value: chronicDiseasesCount === 0 ? "Good" : chronicDiseasesCount <= 2 ? "Moderate" : "High Risk",
                    significance: chronicDiseasesCount === 0 ? "low" : "high",
                    trend: chronicDiseasesCount === 0 ? "down" : "up"
                  }
                ]}
              />
            </div>
          }
        />

        {/* Detailed Family Information */}
                <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detailed Family Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Environmental Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Housing</Label>
                <div className="space-y-1">
                  <div className="text-sm"><span className="font-medium">Type:</span> {formData.houseType || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-medium">Ownership:</span> {formData.houseOwnership || 'Not specified'}</div>
          </div>
                </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Utilities</Label>
                <div className="space-y-1">
                  <div className="text-sm"><span className="font-medium">Water:</span> {formData.waterSupply || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-medium">Toilet:</span> {formData.toiletFacility || 'Not specified'}</div>
                  <div className="text-sm"><span className="font-medium">Cooking:</span> {formData.cookingFuel || 'Not specified'}</div>
                </div>
                </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Health Risks</Label>
                <div className="space-y-1">
                  {formData.chronicDiseases.length > 0 ? (
                    formData.chronicDiseases.map((disease, index) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                        {disease.replace('-', ' ')}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No chronic diseases reported</div>
                  )}
                </div>
                </div>
              </div>
                  </CardContent>
                </Card>

        {/* PDF export removed; print still available */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Assessment Report
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Print the family health assessment with all collected data
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-base font-semibold"
                  onClick={() => window.print()}
                >
                  <Printer className="h-5 w-5 mr-3" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInputForm = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div>
                <p className="font-medium">Loading Assessment Tools...</p>
                <p className="text-sm text-muted-foreground">Initializing ICMR-NIN database</p>
                    </div>
                  </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Progress Header */}
                  <Card>
                    <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Assessment Progress</CardTitle>
                  <p className="text-sm text-muted-foreground">Complete all sections for comprehensive analysis</p>
                </div>
                <Badge variant={getCompletionProgress() === 100 ? "default" : "secondary"}>
                  {Math.round(getCompletionProgress())}% Complete
                </Badge>
              </div>
              <Progress value={getCompletionProgress()} className="h-2" />
            </div>
                    </CardHeader>
        </Card>

        {/* Assessment Sections */}
        <Accordion type="multiple" className="space-y-4">

          {/* General Information */}
          <AccordionItem value="general" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="general" />
                <div className="text-left">
                  <div className="font-medium">General Information</div>
                  <div className="text-sm text-muted-foreground">Basic family details and identification</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studyDate">Study Date</Label>
                          <Input
                            id="studyDate"
                            name="studyDate"
                            type="date"
                            value={formData.studyDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="familyId">Family ID</Label>
                          <Input
                            id="familyId"
                            name="familyId"
                            value={formData.familyId}
                            readOnly
                      className="bg-muted"
                          />
                        </div>
                      </div>

                <div>
                  <Label htmlFor="familyHead">Head of Family</Label>
                        <Input
                          id="familyHead"
                          name="familyHead"
                          value={formData.familyHead}
                          onChange={handleInputChange}
                    placeholder="Enter full name"
                        />
                      </div>

                <div>
                        <Label htmlFor="address">Complete Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                    placeholder="Enter complete residential address"
                        />
                      </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            maxLength={6}
                      placeholder="6-digit pincode"
                          />
                        </div>
                        <div>
                          <Label htmlFor="area">Area Type</Label>
                    <Select value={formData.area} onValueChange={(value) => handleSelectChange('area', value)}>
                            <SelectTrigger>
                        <SelectValue placeholder="Select area type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urban">Urban</SelectItem>
                              <SelectItem value="peri-urban">Peri-urban</SelectItem>
                              <SelectItem value="rural">Rural</SelectItem>
                              <SelectItem value="slum">Slum</SelectItem>
                              <SelectItem value="tribal">Tribal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="religion">Religion</Label>
                    <Select value={formData.religion} onValueChange={(value) => handleSelectChange('religion', value)}>
                            <SelectTrigger>
                        <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hindu">Hindu</SelectItem>
                              <SelectItem value="muslim">Muslim</SelectItem>
                              <SelectItem value="christian">Christian</SelectItem>
                              <SelectItem value="sikh">Sikh</SelectItem>
                              <SelectItem value="buddhist">Buddhist</SelectItem>
                        <SelectItem value="jain">Jain</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                  <div>
                    <Label htmlFor="caste">Caste Category</Label>
                    <Select value={formData.caste} onValueChange={(value) => handleSelectChange('caste', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                      </div>

                <div>
                  <Label htmlFor="familyType">Family Type</Label>
                  <Select value={formData.familyType} onValueChange={(value) => handleSelectChange('familyType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuclear">Nuclear</SelectItem>
                      <SelectItem value="joint">Joint</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                    </SelectContent>
                  </Select>
                      </div>

                <div className="pt-4">
                  <Button onClick={() => markSectionComplete('general')} className="w-full">
                    Complete General Information
                  </Button>
                          </div>
                          </div>
            </AccordionContent>
          </AccordionItem>

          {/* Socio-Economic Status */}
          <AccordionItem value="socioeconomic" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="socioeconomic" />
                <div className="text-left">
                  <div className="font-medium">Socio-Economic Status</div>
                  <div className="text-sm text-muted-foreground">Income assessment and SES classification</div>
                      </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryIncome">Primary Income (₹/month)</Label>
                          <Input
                            id="primaryIncome"
                            name="primaryIncome"
                            type="number"
                            value={formData.primaryIncome}
                      onChange={handleInputChange}
                      placeholder="0"
                          />
                        </div>
                        <div>
                    <Label htmlFor="otherIncome">Other Income (₹/month)</Label>
                          <Input
                            id="otherIncome"
                            name="otherIncome"
                            type="number"
                            value={formData.otherIncome}
                      onChange={handleInputChange}
                      placeholder="0"
                          />
                        </div>
                      </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <Label>Total Income</Label>
                    <div className="text-lg font-semibold text-primary">₹{formData.totalIncome}</div>
                  </Card>
                  <Card className="p-4">
                              <Label>Per Capita Income</Label>
                    <div className="text-lg font-semibold text-secondary">₹{formData.perCapitaIncome}</div>
                      </Card>
                          </div>

                <Card className="p-4">
                  <Label>SES Classification</Label>
                  <div className="text-sm font-medium">{formData.sesClass || 'Not calculated'}</div>
                      </Card>

                            <div>
                  <Label htmlFor="rationCard">Ration Card Type</Label>
                  <Select value={formData.rationCard} onValueChange={(value) => handleSelectChange('rationCard', value)}>
                                <SelectTrigger>
                      <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="apl">APL (Above Poverty Line)</SelectItem>
                      <SelectItem value="bpl">BPL (Below Poverty Line)</SelectItem>
                      <SelectItem value="aay">Antyodaya Anna Yojana</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                <div className="pt-4">
                  <Button onClick={() => { calculateSES(); markSectionComplete('socioeconomic'); }} className="w-full">
                    Calculate SES & Complete Section
                  </Button>
                            </div>
                          </div>
            </AccordionContent>
          </AccordionItem>
          {/* Environmental Conditions */}
          <AccordionItem value="environment" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="environment" />
                <div className="text-left">
                  <div className="font-medium">Environmental Conditions</div>
                  <div className="text-sm text-muted-foreground">Housing, utilities, and living conditions</div>
                            </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                    <Label htmlFor="houseType">House Type</Label>
                    <Select value={formData.houseType} onValueChange={(value) => handleSelectChange('houseType', value)}>
                                <SelectTrigger>
                        <SelectValue placeholder="Select house type" />
                                </SelectTrigger>
                                <SelectContent>
                        <SelectItem value="pucca">Pucca (Concrete)</SelectItem>
                        <SelectItem value="semi-pucca">Semi-Pucca</SelectItem>
                        <SelectItem value="kutcha">Kutcha (Temporary)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          <div>
                    <Label htmlFor="houseOwnership">House Ownership</Label>
                    <Select value={formData.houseOwnership} onValueChange={(value) => handleSelectChange('houseOwnership', value)}>
                                <SelectTrigger>
                        <SelectValue placeholder="Select ownership" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="owned">Owned</SelectItem>
                                  <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="employer-provided">Employer Provided</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="waterSupply">Water Supply</Label>
                    <Select value={formData.waterSupply} onValueChange={(value) => handleSelectChange('waterSupply', value)}>
                                  <SelectTrigger>
                        <SelectValue placeholder="Select water source" />
                                  </SelectTrigger>
                                  <SelectContent>
                        <SelectItem value="piped">Piped Water</SelectItem>
                        <SelectItem value="bore-well">Bore Well</SelectItem>
                        <SelectItem value="hand-pump">Hand Pump</SelectItem>
                        <SelectItem value="well">Open Well</SelectItem>
                        <SelectItem value="tanker">Water Tanker</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="toiletFacility">Toilet Facility</Label>
                    <Select value={formData.toiletFacility} onValueChange={(value) => handleSelectChange('toiletFacility', value)}>
                                  <SelectTrigger>
                        <SelectValue placeholder="Select toilet type" />
                                  </SelectTrigger>
                                  <SelectContent>
                        <SelectItem value="individual-flush">Individual Flush</SelectItem>
                        <SelectItem value="individual-pit">Individual Pit</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="open-defecation">Open Defecation</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                              <div>
                                <Label htmlFor="cookingFuel">Cooking Fuel</Label>
                  <Select value={formData.cookingFuel} onValueChange={(value) => handleSelectChange('cookingFuel', value)}>
                                  <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                                  </SelectTrigger>
                                  <SelectContent>
                      <SelectItem value="lpg">LPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                                    <SelectItem value="kerosene">Kerosene</SelectItem>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="coal">Coal</SelectItem>
                      <SelectItem value="crop-residue">Crop Residue</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>

                <div className="pt-4">
                  <Button onClick={() => markSectionComplete('environment')} className="w-full">
                    Complete Environmental Assessment
                  </Button>
                              </div>
                              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Family Members */}
          <AccordionItem value="family" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="family" />
                <div className="text-left">
                  <div className="font-medium">Family Members</div>
                  <div className="text-sm text-muted-foreground">Individual details and demographics</div>
                            </div>
                {familyMembers.length > 0 && (
                  <Badge variant="secondary">{familyMembers.length} members</Badge>
                )}
                          </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Family Members</h4>
                  <Button onClick={addFamilyMember} size="sm">
                    Add Member
                  </Button>
                </div>

                {familyMembers.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No family members added</AlertTitle>
                        <AlertDescription>
                      Click "Add Member" to start adding family member details.
                        </AlertDescription>
                      </Alert>
                ) : (
                  <div className="space-y-4">
                            {familyMembers.map((member, index) => (
                      <Card key={member.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Name</Label>
                                  <Input
                                    value={member.name}
                                    onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                                placeholder="Full name"
                                  />
                            </div>
                            <div>
                              <Label>Age</Label>
                                  <Input
                                    type="number"
                                    value={member.age}
                                onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value) || 0)}
                                min="0"
                                max="120"
                              />
                            </div>
                            <div>
                              <Label>Sex</Label>
                              <Select value={member.sex} onValueChange={(value) => updateFamilyMember(index, 'sex', value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                  </Select>
                            </div>
                            <div>
                              <Label>Relation</Label>
                              <Select value={member.relation} onValueChange={(value) => updateFamilyMember(index, 'relation', value)}>
                                    <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                  <SelectItem value="head">Head</SelectItem>
                                      <SelectItem value="spouse">Spouse</SelectItem>
                                      <SelectItem value="son">Son</SelectItem>
                                      <SelectItem value="daughter">Daughter</SelectItem>
                                      <SelectItem value="father">Father</SelectItem>
                                      <SelectItem value="mother">Mother</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeFamilyMember(member.id)}
                                  >
                              Remove
                                  </Button>
                          </div>
                        </CardContent>
                      </Card>
                            ))}
                      </div>
                )}

                <div className="pt-4">
                      <Button
                    onClick={() => markSectionComplete('family')}
                    className="w-full"
                    disabled={familyMembers.length === 0}
                      >
                    Complete Family Information
                      </Button>
                        </div>
                              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Nutritional Assessment */}
          <AccordionItem value="nutrition" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="nutrition" />
                <div className="text-left">
                  <div className="font-medium">Nutritional Assessment</div>
                  <div className="text-sm text-muted-foreground">Dietary analysis and consumption units</div>
                              </div>
                              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ICMR-NIN 2020 Guidelines</AlertTitle>
                        <AlertDescription>
                    Nutritional assessment based on consumption units and IFCT 2017 food database.
                        </AlertDescription>
                      </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Total Consumption Units</h4>
                      <div className="text-2xl font-bold text-primary">{formData.totalFamilyCU}</div>
                              </CardContent>
                            </Card>
                      <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Average CU per Person</h4>
                      <div className="text-2xl font-bold text-secondary">{formData.averageCUPerPerson}</div>
                            </CardContent>
                          </Card>
                          </div>

                <div className="pt-4">
                  <Button onClick={() => markSectionComplete('nutrition')} className="w-full">
                    Complete Nutritional Assessment
                          </Button>
                                </div>
                                </div>
            </AccordionContent>
          </AccordionItem>

          {/* Health Records */}
          <AccordionItem value="health" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <SectionIcon sectionId="health" />
                <div className="text-left">
                  <div className="font-medium">Health Assessment</div>
                  <div className="text-sm text-muted-foreground">Medical history and health status</div>
                      </div>
                          </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                          <div>
                  <h4 className="font-medium mb-4">Chronic Diseases in Family</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { id: 'diabetes', value: 'diabetes', label: 'Diabetes Mellitus' },
                                { id: 'hypertension', value: 'hypertension', label: 'Hypertension' },
                                { id: 'heart-disease', value: 'heart-disease', label: 'Heart Disease' },
                                { id: 'asthma', value: 'asthma', label: 'Asthma/COPD' },
                                { id: 'arthritis', value: 'arthritis', label: 'Arthritis' },
                                { id: 'thyroid', value: 'thyroid', label: 'Thyroid Disorders' },
                                { id: 'kidney', value: 'kidney', label: 'Kidney Disease' },
                                { id: 'cancer', value: 'cancer', label: 'Cancer' }
                              ].map((disease) => (
                      <div key={disease.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                  <Checkbox
                                    id={disease.id}
                                    checked={formData.chronicDiseases.includes(disease.value)}
                                    onCheckedChange={(checked) =>
                                      handleCheckboxChange('chronicDiseases', disease.value, checked as boolean)
                                    }
                                  />
                        <Label htmlFor={disease.id} className="font-normal">{disease.label}</Label>
                                </div>
                              ))}
                            </div>
                          </div>

                <div className="pt-4">
                  <Button onClick={() => markSectionComplete('health')} className="w-full">
                    Complete Health Assessment
                      </Button>
                            </div>
                            </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Generate Report Button */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium mb-4">Generate Assessment Report</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Complete all sections to generate a comprehensive family health assessment report.
            </p>
            <Button
              onClick={generateReport}
              disabled={completedSections.size < 6}
              size="lg"
              className="w-full md:w-auto"
            >
              Generate Complete Report
                          </Button>
                    </CardContent>
                  </Card>
    </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Family Health Study Assessment"
      description="Comprehensive family health assessment based on ICMR-NIN Guidelines 2020 and Community Medicine standards"
      icon={Users}
      layout="single-column"
      onReset={handleReset}
    >
      <div className="space-y-8">
        {renderInputForm()}
        {renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
