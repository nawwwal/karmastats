'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function FamilyStudyPage() {
  // State variables
  const [activeTab, setActiveTab] = useState('general-info');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [dietaryItems, setDietaryItems] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [immunizationRecords, setImmunizationRecords] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showFamilyStats, setShowFamilyStats] = useState(false);
  const [showFamilyAnalysis, setShowFamilyAnalysis] = useState(false);
  const [showCuResults, setShowCuResults] = useState(false);
  const [showNutritionalAnalysis, setShowNutritionalAnalysis] = useState(false);
  const [showComprehensiveReport, setShowComprehensiveReport] = useState(false);
  const [formData, setFormData] = useState({
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

  // ICMR-NIN 2020 Consumption Unit Factors
  const consumptionUnits = {
    // Age-based CU factors
    infant_0_6m: 0.25,
    infant_6_12m: 0.33,
    child_1_3y: 0.43,
    child_4_6y: 0.54,
    child_7_9y: 0.68,
    adolescent_10_12y_male: 0.84,
    adolescent_10_12y_female: 0.83,
    adolescent_13_18y_male: 0.97,
    adolescent_13_18y_female: 0.93,

    // Adult activity-based CU factors
    adult_sedentary_male: 1.0,
    adult_sedentary_female: 0.83,
    adult_moderate_male: 1.2,
    adult_moderate_female: 1.0,
    adult_heavy_male: 1.6,
    adult_heavy_female: 1.4,

    // Elderly CU factors
    elderly_male: 0.83,
    elderly_female: 0.79,

    // Pregnancy and lactation additional CU
    pregnant_2nd_trimester: 0.29,
    pregnant_3rd_trimester: 0.46,
    lactating_0_6m: 0.59,
    lactating_6_12m: 0.42
  };

  // IFCT 2017 Food Database (Comprehensive subset)
  const foodDatabase = {
    // Cereals and Millets (per 100g)
    "Rice, raw": { energy: 345, protein: 6.8, carbs: 78.2, fat: 0.6, fiber: 0.4 },
    "Rice, cooked": { energy: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.2 },
    "Wheat flour": { energy: 341, protein: 12.1, carbs: 71.2, fat: 1.7, fiber: 2.9 },
    "Wheat, chapati": { energy: 297, protein: 8.7, carbs: 64.0, fat: 1.2, fiber: 2.0 },
    "Jowar": { energy: 349, protein: 10.4, carbs: 72.6, fat: 1.9, fiber: 9.7 },
    "Bajra": { energy: 361, protein: 11.6, carbs: 67.5, fat: 5.0, fiber: 11.5 },
    "Ragi": { energy: 336, protein: 7.3, carbs: 72.0, fat: 1.3, fiber: 11.2 },
    "Maize": { energy: 342, protein: 11.1, carbs: 66.2, fat: 3.9, fiber: 12.2 },

    // Pulses and Legumes (per 100g)
    "Arhar dal (toor)": { energy: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fiber: 5.1 },
    "Moong dal": { energy: 348, protein: 24.0, carbs: 59.9, fat: 1.3, fiber: 4.8 },
    "Masoor dal": { energy: 343, protein: 25.1, carbs: 59.0, fat: 0.7, fiber: 4.6 },
    "Urad dal": { energy: 347, protein: 24.0, carbs: 59.6, fat: 1.4, fiber: 4.5 },
    "Chana dal": { energy: 360, protein: 22.0, carbs: 57.0, fat: 4.5, fiber: 12.8 },
    "Rajma": { energy: 346, protein: 22.9, carbs: 60.6, fat: 1.3, fiber: 25.0 },
    "Black gram, whole": { energy: 341, protein: 24.0, carbs: 58.4, fat: 1.9, fiber: 7.6 },

    // Vegetables (per 100g)
    "Potato": { energy: 97, protein: 2.0, carbs: 22.6, fat: 0.1, fiber: 2.2 },
    "Sweet potato": { energy: 120, protein: 1.2, carbs: 28.2, fat: 0.3, fiber: 3.0 },
    "Onion": { energy: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.1 },
    "Tomato": { energy: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    "Carrot": { energy: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
    "Spinach": { energy: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    "Fenugreek leaves": { energy: 49, protein: 4.4, carbs: 6.0, fat: 0.9, fiber: 1.1 },
    "Cauliflower": { energy: 25, protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.5 },
    "Cabbage": { energy: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
    "Brinjal": { energy: 24, protein: 1.1, carbs: 5.7, fat: 0.2, fiber: 3.0 },
    "Okra": { energy: 33, protein: 2.0, carbs: 7.6, fat: 0.1, fiber: 3.2 },
    "Green beans": { energy: 31, protein: 1.8, carbs: 7.1, fat: 0.2, fiber: 2.7 },

    // Fruits (per 100g)
    "Apple": { energy: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
    "Banana": { energy: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
    "Orange": { energy: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
    "Mango": { energy: 60, protein: 0.6, carbs: 15.0, fat: 0.4, fiber: 1.6 },
    "Papaya": { energy: 43, protein: 0.6, carbs: 10.8, fat: 0.1, fiber: 2.5 },
    "Guava": { energy: 68, protein: 2.6, carbs: 14.3, fat: 0.9, fiber: 5.4 },
    "Pomegranate": { energy: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0 },

    // Animal Products (per 100g)
    "Milk, cow": { energy: 67, protein: 3.2, carbs: 4.8, fat: 4.0, fiber: 0 },
    "Milk, buffalo": { energy: 117, protein: 4.3, carbs: 5.0, fat: 6.5, fiber: 0 },
    "Curd": { energy: 60, protein: 3.1, carbs: 4.4, fat: 4.0, fiber: 0 },
    "Paneer": { energy: 265, protein: 18.3, carbs: 6.1, fat: 20.8, fiber: 0 },
    "Egg, chicken": { energy: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
    "Chicken": { energy: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
    "Mutton": { energy: 194, protein: 18.5, carbs: 0, fat: 13.3, fiber: 0 },
    "Fish, rohu": { energy: 97, protein: 16.6, carbs: 0, fat: 2.2, fiber: 0 },
    "Fish, pomfret": { energy: 96, protein: 18.8, carbs: 0, fat: 1.8, fiber: 0 },

    // Oils and Fats (per 100g)
    "Mustard oil": { energy: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    "Sunflower oil": { energy: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    "Coconut oil": { energy: 900, protein: 0, carbs: 0, fat: 99.8, fiber: 0 },
    "Ghee, cow": { energy: 900, protein: 0, carbs: 0, fat: 99.8, fiber: 0 },
    "Butter": { energy: 717, protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0 },

    // Nuts and Seeds (per 100g)
    "Groundnut": { energy: 567, protein: 25.3, carbs: 16.1, fat: 50.0, fiber: 8.5 },
    "Coconut, fresh": { energy: 354, protein: 3.3, carbs: 15.2, fat: 33.0, fiber: 9.0 },
    "Sesame seeds": { energy: 563, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8 },

    // Sugars (per 100g)
    "Sugar": { energy: 398, protein: 0, carbs: 99.5, fat: 0, fiber: 0 },
    "Jaggery": { energy: 383, protein: 0.4, carbs: 95.0, fat: 0.1, fiber: 0 }
  };

  // SES Classification data (Updated 2024)
  const sesClassifications = {
    prasad: {
      name: "Modified Prasad Classification 2024",
      classes: [
        { min: 10533, class: "Class I (Upper)", color: "success" },
        { min: 5267, max: 10532, class: "Class II (Upper Middle)", color: "info" },
        { min: 3160, max: 5266, class: "Class III (Middle)", color: "warning" },
        { min: 1580, max: 3159, class: "Class IV (Lower Middle)", color: "warning" },
        { min: 0, max: 1579, class: "Class V (Lower)", color: "danger" }
      ]
    },
    kuppuswami: {
      name: "Modified Kuppuswami Scale",
      classes: [
        { min: 52734, class: "Upper (I)", color: "success" },
        { min: 26355, max: 52733, class: "Upper Middle (II)", color: "info" },
        { min: 19759, max: 26354, class: "Lower Middle (III)", color: "warning" },
        { min: 13161, max: 19758, class: "Upper Lower (IV)", color: "warning" },
        { min: 0, max: 13160, class: "Lower (V)", color: "danger" }
      ]
    },
    pareek: {
      name: "Pareek's Classification (Rural)",
      classes: [
        { min: 30000, class: "Upper High", color: "success" },
        { min: 20000, max: 29999, class: "High", color: "info" },
        { min: 15000, max: 19999, class: "Upper Middle", color: "info" },
        { min: 10000, max: 14999, class: "Middle", color: "warning" },
        { min: 5000, max: 9999, class: "Lower Middle", color: "warning" },
        { min: 2500, max: 4999, class: "Poor", color: "danger" },
        { min: 0, max: 2499, class: "Very Poor", color: "danger" }
      ]
    }
  };

  // Handler functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
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

  const calculateSES = () => {
    const primaryIncome = parseFloat(formData.primaryIncome) || 0;
    const otherIncome = parseFloat(formData.otherIncome) || 0;
    const totalIncome = primaryIncome + otherIncome;

    // Calculate family size and per capita income
    const familySize = familyMembers.length || 1;
    const perCapitaIncome = totalIncome / familySize;

    setFormData(prev => ({
      ...prev,
      totalIncome: totalIncome.toString(),
      familySize: familySize.toString(),
      perCapitaIncome: perCapitaIncome.toFixed(2)
    }));

    // Determine SES class
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

    // Auto-update calculations
    calculateSES();
  };

  const removeFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));

    // Update calculations
    calculateSES();
  };

  const calculateFamilySummary = () => {
    if (familyMembers.length === 0) {
      alert('Please add family members first');
      return;
    }

    setShowFamilyStats(true);
    setShowFamilyAnalysis(true);
  };

  const calculateConsumptionUnits = () => {
    if (familyMembers.length === 0) {
      alert('Please add family members first');
      return;
    }

    let totalCU = 0;
    let cuBreakdown: any[] = [];

    familyMembers.forEach(member => {
      let cu = 0;
      let category = '';

      if (member.age < 0.5) {
        cu = consumptionUnits.infant_0_6m;
        category = 'Infant (0-6 months)';
      } else if (member.age < 1) {
        cu = consumptionUnits.infant_6_12m;
        category = 'Infant (6-12 months)';
      } else if (member.age < 4) {
        cu = consumptionUnits.child_1_3y;
        category = 'Child (1-3 years)';
      } else if (member.age < 7) {
        cu = consumptionUnits.child_4_6y;
        category = 'Child (4-6 years)';
      } else if (member.age < 10) {
        cu = consumptionUnits.child_7_9y;
        category = 'Child (7-9 years)';
      } else if (member.age < 13) {
        cu = member.sex === 'male' ? consumptionUnits.adolescent_10_12y_male : consumptionUnits.adolescent_10_12y_female;
        category = 'Adolescent (10-12 years)';
      } else if (member.age < 19) {
        cu = member.sex === 'male' ? consumptionUnits.adolescent_13_18y_male : consumptionUnits.adolescent_13_18y_female;
        category = 'Adolescent (13-18 years)';
      } else if (member.age < 60) {
        // Adult CU based on activity level
        if (member.activity === 'sedentary') {
          cu = member.sex === 'male' ? consumptionUnits.adult_sedentary_male : consumptionUnits.adult_sedentary_female;
          category = 'Adult - Sedentary';
        } else if (member.activity === 'moderate') {
          cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
          category = 'Adult - Moderate Activity';
        } else if (member.activity === 'heavy') {
          cu = member.sex === 'male' ? consumptionUnits.adult_heavy_male : consumptionUnits.adult_heavy_female;
          category = 'Adult - Heavy Work';
        } else {
          // Default to moderate for adults
          cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
          category = 'Adult - Moderate Activity (Default)';
        }
      } else {
        cu = member.sex === 'male' ? consumptionUnits.elderly_male : consumptionUnits.elderly_female;
        category = 'Elderly (≥60 years)';
      }

      totalCU += cu;
      cuBreakdown.push({
        name: member.name,
        age: member.age,
        sex: member.sex,
        category: category,
        cu: cu.toFixed(2)
      });
    });

    setFormData(prev => ({
      ...prev,
      totalFamilyCU: totalCU.toFixed(2),
      averageCUPerPerson: (totalCU / familyMembers.length).toFixed(2)
    }));

    setShowCuResults(true);
  };

  const addHealthRecord = () => {
    const newRecord = { id: healthRecords.length + 1 };
    setHealthRecords([...healthRecords, newRecord]);
  };

  const removeHealthRecord = (id: number) => {
    setHealthRecords(healthRecords.filter(record => record.id !== id));
  };

  const addImmunizationRecord = () => {
    const newRecord = { id: immunizationRecords.length + 1 };
    setImmunizationRecords([...immunizationRecords, newRecord]);
  };

  const removeImmunizationRecord = (id: number) => {
    setImmunizationRecords(immunizationRecords.filter(record => record.id !== id));
  };

  const generateComprehensiveReport = () => {
    if (familyMembers.length === 0) {
      alert('Please add family members first');
      return;
    }

    setShowComprehensiveReport(true);
  };

  // Helper functions
  const calculateDependencyRatio = () => {
    const dependents = familyMembers.filter(m => m.age < 15 || m.age >= 65).length;
    const workingAge = familyMembers.filter(m => m.age >= 15 && m.age < 65).length;
    return workingAge > 0 ? (dependents / workingAge) * 100 : 0;
  };

  const calculateSexRatio = () => {
    const males = familyMembers.filter(m => m.sex === 'male').length;
    const females = familyMembers.filter(m => m.sex === 'female').length;
    return males > 0 ? (females / males) * 1000 : 0;
  };

  const calculateLiteracyRate = () => {
    const literateMembers = familyMembers.filter(m =>
      m.age >= 7 && m.education &&
      m.education.toLowerCase() !== 'illiterate' &&
      m.education.toLowerCase() !== 'none'
    ).length;
    const eligibleMembers = familyMembers.filter(m => m.age >= 7).length;
    return eligibleMembers > 0 ? (literateMembers / eligibleMembers) * 100 : 0;
  };

  const calculateEmploymentRate = () => {
    const employedMembers = familyMembers.filter(m =>
      m.age >= 15 && m.occupation &&
      m.occupation.toLowerCase() !== 'unemployed' &&
      m.occupation.toLowerCase() !== 'student'
    ).length;
    const workingAgeMembers = familyMembers.filter(m => m.age >= 15).length;
    return workingAgeMembers > 0 ? (employedMembers / workingAgeMembers) * 100 : 0;
  };

  const countReproductiveAgeWomen = () => {
    return familyMembers.filter(m => m.sex === 'female' && m.age >= 15 && m.age <= 49).length;
  };

  const countEligibleCouples = () => {
    return familyMembers.filter(m =>
      m.sex === 'female' &&
      m.marital === 'married' &&
      m.age >= 15 && m.age <= 49
    ).length;
  };

  const countUnder5Children = () => {
    return familyMembers.filter(m => m.age < 5).length;
  };

  const countAdolescents = () => {
    return familyMembers.filter(m => m.age >= 10 && m.age <= 19).length;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Update progress steps
    const steps = {
      'general-info': 1,
      'socio-economic': 2,
      'environment': 3,
      'family-members': 4,
      'nutrition': 5,
      'health': 6,
      'analysis': 7
    };

    setCurrentStep(steps[value as keyof typeof steps]);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-primary to-success text-primary-foreground">
          <CardTitle className="heading-1">Professional Family Health Study Assessment</CardTitle>
          <CardDescription className="body-small text-muted-foreground">Based on ICMR-NIN Guidelines 2020 | IFCT 2017 | Community Medicine Standards</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-2">🏛️ ICMR-NIN 2020 Guidelines</h4>
                <p className="body-small text-muted-foreground">Latest Recommended Dietary Allowances with consumption unit calculation based on 2110 kcal reference male sedentary worker</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-2">📊 IFCT 2017 Database</h4>
                <p className="body-small text-muted-foreground">528 Indian foods with comprehensive nutritional analysis across 151 nutrients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-2">⚕️ Medical Standards</h4>
                <p className="body-small text-muted-foreground">WHO, IAP, and national health program compliance with real-time calculations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-2">💾 Data Management</h4>
                <p className="body-small text-muted-foreground">Export capabilities, automatic calculations, and comprehensive reporting system</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  step < currentStep ? 'bg-success' :
                  step === currentStep ? 'bg-primary' : 'bg-muted'
                }`}>
                  {step}
                </div>
                <span className="caption-text mt-1">
                  {step === 1 ? 'General' :
                   step === 2 ? 'Socio-Economic' :
                   step === 3 ? 'Environment' :
                   step === 4 ? 'Family' :
                   step === 5 ? 'Nutrition' :
                   step === 6 ? 'Health' : 'Analysis'}
                </span>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-8">
              <TabsTrigger value="general-info">🏠 General</TabsTrigger>
              <TabsTrigger value="socio-economic">💰 Socio-Economic</TabsTrigger>
              <TabsTrigger value="environment">🌍 Environment</TabsTrigger>
              <TabsTrigger value="family-members">👨‍👩‍👧‍👦 Family</TabsTrigger>
              <TabsTrigger value="nutrition">🍎 Nutrition</TabsTrigger>
              <TabsTrigger value="health">⚕️ Health</TabsTrigger>
              <TabsTrigger value="analysis">📊 Analysis</TabsTrigger>
            </TabsList>

            {/* General Information Tab */}
            <TabsContent value="general-info">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📋</span> General Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="studyDate">Study Date</Label>
                      <Input
                        id="studyDate"
                        name="studyDate"
                        type="date"
                        value={formData.studyDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyId">Family ID</Label>
                      <Input
                        id="familyId"
                        name="familyId"
                        value={formData.familyId}
                        onChange={handleInputChange}
                        placeholder="Auto-generated"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="familyHead">Name of Head of Family</Label>
                    <Input
                      id="familyHead"
                      name="familyHead"
                      value={formData.familyHead}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="address">Complete Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        pattern="[0-9]{6}"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">Area Type</Label>
                      <Select name="area" value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Area Type" />
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

                  <div className="mb-4">
                    <Label>Duration of Stay in Current Area</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label htmlFor="residingYears">Years</Label>
                        <Input
                          id="residingYears"
                          name="residingYears"
                          type="number"
                          value={formData.residingYears}
                          onChange={handleInputChange}
                          min={0}
                          max={100}
                        />
                      </div>
                      <div>
                        <Label htmlFor="residingMonths">Months</Label>
                        <Input
                          id="residingMonths"
                          name="residingMonths"
                          type="number"
                          value={formData.residingMonths}
                          onChange={handleInputChange}
                          min={0}
                          max={11}
                        />
                      </div>
                      <div>
                        <Label htmlFor="residingDays">Days</Label>
                        <Input
                          id="residingDays"
                          name="residingDays"
                          type="number"
                          value={formData.residingDays}
                          onChange={handleInputChange}
                          min={0}
                          max={30}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="native">Native Place</Label>
                      <Input
                        id="native"
                        name="native"
                        value={formData.native}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <Select name="religion" value={formData.religion} onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Religion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hindu">Hindu</SelectItem>
                          <SelectItem value="muslim">Muslim</SelectItem>
                          <SelectItem value="christian">Christian</SelectItem>
                          <SelectItem value="sikh">Sikh</SelectItem>
                          <SelectItem value="jain">Jain</SelectItem>
                          <SelectItem value="buddhist">Buddhist</SelectItem>
                          <SelectItem value="parsi">Parsi</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="caste">Caste/Community</Label>
                    <Input
                      id="caste"
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-4">
                    <Label>Type of Family</Label>
                    <RadioGroup
                      value={formData.familyType}
                      onValueChange={(value) => handleRadioChange('familyType', value)}
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2 border p-2 rounded-md">
                        <RadioGroupItem value="nuclear" id="nuclear" />
                        <Label htmlFor="nuclear">Nuclear Family</Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-2 rounded-md">
                        <RadioGroupItem value="joint" id="joint" />
                        <Label htmlFor="joint">Joint Family</Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-2 rounded-md">
                        <RadioGroupItem value="extended" id="extended" />
                        <Label htmlFor="extended">Extended Family</Label>
                      </div>
                      <div className="flex items-center space-x-2 border p-2 rounded-md">
                        <RadioGroupItem value="three-generation" id="three-gen" />
                        <Label htmlFor="three-gen">Three Generation</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="pedigreeNotes">Family Health History & Pedigree Notes</Label>
                    <Textarea
                      id="pedigreeNotes"
                      name="pedigreeNotes"
                      value={formData.pedigreeNotes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Document any hereditary conditions, chronic diseases, or significant health patterns in the family history"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Socio-Economic Status Tab */}
            <TabsContent value="socio-economic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💰</span> Socio-Economic Status Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Using Modified Prasad Classification 2024 (CPI-IW Base: May 2024 = 139.4)
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="primaryIncome">Primary Income (₹/month)</Label>
                      <Input
                        id="primaryIncome"
                        name="primaryIncome"
                        type="number"
                        value={formData.primaryIncome}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(calculateSES, 100);
                        }}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherIncome">Other Income Sources (₹/month)</Label>
                      <Input
                        id="otherIncome"
                        name="otherIncome"
                        type="number"
                        value={formData.otherIncome}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(calculateSES, 100);
                        }}
                        min={0}
                      />
                    </div>
                  </div>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>💹</span> Income Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label>Total Monthly Income</Label>
                          <Input
                            id="totalIncome"
                            name="totalIncome"
                            value={formData.totalIncome}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Family Size</Label>
                          <Input
                            id="familySize"
                            name="familySize"
                            value={formData.familySize}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Per Capita Income</Label>
                          <Input
                            id="perCapitaIncome"
                            name="perCapitaIncome"
                            value={formData.perCapitaIncome}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <Label>SES Classification</Label>
                        <Select
                          name="sesMethod"
                          value={formData.sesMethod}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, sesMethod: value }));
                            setTimeout(calculateSES, 100);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prasad">Modified Prasad 2024</SelectItem>
                            <SelectItem value="kuppuswami">Kuppuswami Scale</SelectItem>
                            <SelectItem value="pareek">Pareek (Rural)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Alert variant={formData.sesClass.includes('Upper') ? 'default' : formData.sesClass.includes('Lower') ? 'destructive' : 'default'}>
                        <AlertTitle>{formData.sesClass || 'Enter income to calculate SES class'}</AlertTitle>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>💸</span> Monthly Expenditure Pattern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount (₹/month)</TableHead>
                            <TableHead>% of Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['Food', 'Clothing', 'Housing', 'Education', 'Medical', 'Transport', 'Utilities', 'Recreation', 'Other'].map((category) => (
                            <TableRow key={category}>
                              <TableCell>{category}</TableCell>
                              <TableCell>
                                <Input
                                  id={`exp${category}`}
                                  name={`exp${category}`}
                                  type="number"
                                  min={0}
                                />
                              </TableCell>
                              <TableCell>0%</TableCell>
                              <TableCell>
                                <Badge variant="outline">-</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total Expenditure</TableCell>
                            <TableCell>
                              <Input id="expTotal" readOnly />
                            </TableCell>
                            <TableCell>100%</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>🏛️</span> Government Schemes & Social Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <Label>Ration Card Type</Label>
                        <RadioGroup
                          value={formData.rationCard}
                          onValueChange={(value) => handleRadioChange('rationCard', value)}
                          className="flex flex-wrap gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="apl" id="apl" />
                            <Label htmlFor="apl">APL (Above Poverty Line)</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="bpl" id="bpl" />
                            <Label htmlFor="bpl">BPL (Below Poverty Line)</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="antyodaya" id="antyodaya" />
                            <Label htmlFor="antyodaya">Antyodaya</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="none" id="no-ration" />
                            <Label htmlFor="no-ration">None</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label>Enrolled Social Security Schemes</Label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                          {[
                            { id: 'pmjay', value: 'pm-jay', label: 'Ayushman Bharat (PM-JAY)' },
                            { id: 'pmkisan', value: 'pm-kisan', label: 'PM-KISAN' },
                            { id: 'mnrega', value: 'mnrega', label: 'MNREGA' },
                            { id: 'oldage', value: 'old-age-pension', label: 'Old Age Pension' },
                            { id: 'widow', value: 'widow-pension', label: 'Widow Pension' },
                            { id: 'disability', value: 'disability-pension', label: 'Disability Pension' },
                            { id: 'esi', value: 'esi', label: 'ESI' },
                            { id: 'pf', value: 'pf', label: 'Provident Fund' }
                          ].map((scheme) => (
                            <div key={scheme.id} className="flex items-center space-x-2 border p-2 rounded-md">
                              <Checkbox
                                id={scheme.id}
                                checked={formData.socialSchemes.includes(scheme.value)}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange('socialSchemes', scheme.value, checked as boolean)
                                }
                              />
                              <Label htmlFor={scheme.id}>{scheme.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="environment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🌍</span> Environmental Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>🧠</span> Psychological Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="familyHarmony">Family Harmony</Label>
                          <Select
                            name="familyHarmony"
                            value={formData.familyHarmony}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, familyHarmony: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent - Very harmonious</SelectItem>
                              <SelectItem value="good">Good - Generally peaceful</SelectItem>
                              <SelectItem value="fair">Fair - Occasional conflicts</SelectItem>
                              <SelectItem value="poor">Poor - Frequent conflicts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="decisionPattern">Decision Making Pattern</Label>
                          <Select
                            name="decisionPattern"
                            value={formData.decisionPattern}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, decisionPattern: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="democratic">Democratic - Joint decisions</SelectItem>
                              <SelectItem value="patriarchal">Patriarchal - Male dominated</SelectItem>
                              <SelectItem value="matriarchal">Matriarchal - Female dominated</SelectItem>
                              <SelectItem value="individual">Individual - Each decides</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="relativeRelations">Relationship with Relatives</Label>
                          <Select
                            name="relativeRelations"
                            value={formData.relativeRelations}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, relativeRelations: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent - Very close</SelectItem>
                              <SelectItem value="good">Good - Regular contact</SelectItem>
                              <SelectItem value="fair">Fair - Occasional contact</SelectItem>
                              <SelectItem value="poor">Poor - Rare/No contact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="neighborRelations">Neighborhood Relations</Label>
                          <Select
                            name="neighborRelations"
                            value={formData.neighborRelations}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, neighborRelations: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent - Very supportive</SelectItem>
                              <SelectItem value="good">Good - Friendly</SelectItem>
                              <SelectItem value="fair">Fair - Cordial</SelectItem>
                              <SelectItem value="poor">Poor - Isolated/Conflicted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Psychological Overcrowding</Label>
                        <RadioGroup
                          value={formData.psychOvercrowding}
                          onValueChange={(value) => handleRadioChange('psychOvercrowding', value)}
                          className="flex flex-wrap gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="absent" id="psych-absent" />
                            <Label htmlFor="psych-absent">Absent - Adequate personal space</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="mild" id="psych-mild" />
                            <Label htmlFor="psych-mild">Mild - Some privacy issues</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-2 rounded-md">
                            <RadioGroupItem value="severe" id="psych-severe" />
                            <Label htmlFor="psych-severe">Severe - Significant stress</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>🏠</span> Housing and Physical Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="houseOwnership">Ownership Status</Label>
                          <Select
                            name="houseOwnership"
                            value={formData.houseOwnership}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, houseOwnership: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owned">Owned</SelectItem>
                              <SelectItem value="rented">Rented</SelectItem>
                              <SelectItem value="leased">Leased</SelectItem>
                              <SelectItem value="provided">Employer Provided</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="houseType">House Type</Label>
                          <Select
                            name="houseType"
                            value={formData.houseType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, houseType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pucca">Pucca (Permanent)</SelectItem>
                              <SelectItem value="semi-pucca">Semi-pucca</SelectItem>
                              <SelectItem value="kutcha">Kutcha (Temporary)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="numberOfRooms">Number of Rooms</Label>
                          <Input
                            id="numberOfRooms"
                            name="numberOfRooms"
                            type="number"
                            value={formData.numberOfRooms}
                            onChange={handleInputChange}
                            min={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalFloorArea">Total Floor Area (sq ft)</Label>
                          <Input
                            id="totalFloorArea"
                            name="totalFloorArea"
                            type="number"
                            value={formData.totalFloorArea}
                            onChange={handleInputChange}
                            min={0}
                          />
                        </div>
                      </div>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="heading-4 flex items-center gap-2">
                            <span>📏</span> Overcrowding Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Per Capita Floor Area (sq ft)</Label>
                              <Input
                                id="perCapitaFloorArea"
                                name="perCapitaFloorArea"
                                value={formData.perCapitaFloorArea}
                                readOnly
                              />
                            </div>
                            <div>
                              <Label>Persons per Room</Label>
                              <Input
                                id="personsPerRoom"
                                name="personsPerRoom"
                                value={formData.personsPerRoom}
                                readOnly
                              />
                            </div>
                          </div>
                          <Alert>
                            <AlertTitle>Overcrowding Status</AlertTitle>
                            <AlertDescription>
                              Enter room details to calculate overcrowding
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Amenities</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <Label htmlFor="waterSupply">Water Supply</Label>
                            <Select
                              name="waterSupply"
                              value={formData.waterSupply}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, waterSupply: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piped-home">Piped water at home</SelectItem>
                                <SelectItem value="piped-public">Public tap</SelectItem>
                                <SelectItem value="well">Well</SelectItem>
                                <SelectItem value="borewell">Borewell</SelectItem>
                                <SelectItem value="tanker">Tanker supply</SelectItem>
                                <SelectItem value="other">Other source</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="toiletFacility">Toilet Facility</Label>
                            <Select
                              name="toiletFacility"
                              value={formData.toiletFacility}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, toiletFacility: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flush-private">Flush toilet - Private</SelectItem>
                                <SelectItem value="flush-shared">Flush toilet - Shared</SelectItem>
                                <SelectItem value="pit-private">Pit latrine - Private</SelectItem>
                                <SelectItem value="pit-shared">Pit latrine - Shared</SelectItem>
                                <SelectItem value="public">Public toilet</SelectItem>
                                <SelectItem value="open">Open defecation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <Label htmlFor="electricity">Electricity</Label>
                            <Select
                              name="electricity"
                              value={formData.electricity}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, electricity: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24hrs">24 hours supply</SelectItem>
                                <SelectItem value="partial">Partial supply (12-20 hrs)</SelectItem>
                                <SelectItem value="limited">Limited supply (&lt;12 hrs)</SelectItem>
                                <SelectItem value="none">No electricity</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="cookingFuel">Cooking Fuel</Label>
                            <Select
                              name="cookingFuel"
                              value={formData.cookingFuel}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, cookingFuel: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Fuel" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lpg">LPG/PNG</SelectItem>
                                <SelectItem value="electricity">Electricity</SelectItem>
                                <SelectItem value="kerosene">Kerosene</SelectItem>
                                <SelectItem value="wood">Wood/Coal</SelectItem>
                                <SelectItem value="biogas">Biogas</SelectItem>
                                <SelectItem value="cowdung">Cow dung</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ventilation">Ventilation</Label>
                            <Select
                              name="ventilation"
                              value={formData.ventilation}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, ventilation: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="adequate">Adequate - Good air circulation</SelectItem>
                                <SelectItem value="moderate">Moderate - Some circulation</SelectItem>
                                <SelectItem value="poor">Poor - Limited air flow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="lighting">Natural Lighting</Label>
                            <Select
                              name="lighting"
                              value={formData.lighting}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, lighting: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="adequate">Adequate - Well lit</SelectItem>
                                <SelectItem value="moderate">Moderate - Partially lit</SelectItem>
                                <SelectItem value="poor">Poor - Dark rooms</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Family Members Tab */}
            <TabsContent value="family-members">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>👨‍👩‍👧‍👦</span> Family Composition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Add all family members including those temporarily away. Include complete details for accurate nutritional and health assessments.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="secondary"
                    className="mb-6"
                    onClick={addFamilyMember}
                  >
                    ➕ Add Family Member
                  </Button>

                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>S.No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Sex</TableHead>
                          <TableHead>Relation to HOF</TableHead>
                          <TableHead>Marital Status</TableHead>
                          <TableHead>Education</TableHead>
                          <TableHead>Occupation</TableHead>
                          <TableHead>Income (₹/month)</TableHead>
                          <TableHead>Activity Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {familyMembers.map((member, index) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.id}</TableCell>
                            <TableCell>
                              <Input
                                value={member.name}
                                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                                placeholder="Full Name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={member.age}
                                onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value))}
                                min={0}
                                max={120}
                                placeholder="Age"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={member.sex}
                                onValueChange={(value) => updateFamilyMember(index, 'sex', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={member.relation}
                                onValueChange={(value) => updateFamilyMember(index, 'relation', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Relation" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="self">Self (Head)</SelectItem>
                                  <SelectItem value="spouse">Spouse</SelectItem>
                                  <SelectItem value="son">Son</SelectItem>
                                  <SelectItem value="daughter">Daughter</SelectItem>
                                  <SelectItem value="father">Father</SelectItem>
                                  <SelectItem value="mother">Mother</SelectItem>
                                  <SelectItem value="brother">Brother</SelectItem>
                                  <SelectItem value="sister">Sister</SelectItem>
                                  <SelectItem value="grandfather">Grandfather</SelectItem>
                                  <SelectItem value="grandmother">Grandmother</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={member.marital}
                                onValueChange={(value) => updateFamilyMember(index, 'marital', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married">Married</SelectItem>
                                  <SelectItem value="divorced">Divorced</SelectItem>
                                  <SelectItem value="widowed">Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={member.education}
                                onChange={(e) => updateFamilyMember(index, 'education', e.target.value)}
                                placeholder="Education Level"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={member.occupation}
                                onChange={(e) => updateFamilyMember(index, 'occupation', e.target.value)}
                                placeholder="Occupation"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={member.income}
                                onChange={(e) => updateFamilyMember(index, 'income', parseFloat(e.target.value))}
                                min={0}
                                placeholder="Monthly Income"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={member.activity}
                                onValueChange={(value) => updateFamilyMember(index, 'activity', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Activity" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sedentary">Sedentary</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="heavy">Heavy Work</SelectItem>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="homemaker">Homemaker</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeFamilyMember(member.id)}
                              >
                                🗑️ Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Button
                    onClick={calculateFamilySummary}
                    className="mb-6"
                  >
                    📊 Calculate Family Analysis
                  </Button>

                  {showFamilyStats && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.length}</div>
                          <div className="text-sm">Total Members</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.filter(m => m.sex === 'male').length}</div>
                          <div className="text-sm">Males</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.filter(m => m.sex === 'female').length}</div>
                          <div className="text-sm">Females</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.filter(m => m.age < 18).length}</div>
                          <div className="text-sm">Children (&lt;18 yrs)</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.filter(m => m.age >= 18 && m.age < 60).length}</div>
                          <div className="text-sm">Adults (18-59 yrs)</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-primary">{familyMembers.filter(m => m.age >= 60).length}</div>
                          <div className="text-sm">Elderly (≥60 yrs)</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {showFamilyAnalysis && (
                    <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-success">
                          <span>📊</span> Detailed Family Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold text-lg mb-4">📊 Demographic Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div>
                            <Label>Dependency Ratio</Label>
                            <Input value={calculateDependencyRatio().toFixed(2)} readOnly />
                          </div>
                          <div>
                            <Label>Sex Ratio (F per 1000 M)</Label>
                            <Input value={calculateSexRatio().toFixed(0)} readOnly />
                          </div>
                          <div>
                            <Label>Literacy Rate (%)</Label>
                            <Input value={calculateLiteracyRate().toFixed(1)} readOnly />
                          </div>
                          <div>
                            <Label>Employment Rate (%)</Label>
                            <Input value={calculateEmploymentRate().toFixed(1)} readOnly />
                          </div>
                        </div>

                        <h4 className="font-semibold text-lg mb-4">🏥 Health Indicators</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Reproductive Age Women</Label>
                            <Input value={countReproductiveAgeWomen()} readOnly />
                          </div>
                          <div>
                            <Label>Eligible Couples</Label>
                            <Input value={countEligibleCouples()} readOnly />
                          </div>
                          <div>
                            <Label>Under-5 Children</Label>
                            <Input value={countUnder5Children()} readOnly />
                          </div>
                          <div>
                            <Label>Adolescents (10-19 yrs)</Label>
                            <Input value={countAdolescents()} readOnly />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🍎</span> Nutritional Assessment (ICMR-NIN 2020)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Based on ICMR-NIN 2020 Guidelines with IFCT 2017 food database. Reference: Adult sedentary male = 2110 kcal (1 Consumption Unit)
                    </AlertDescription>
                  </Alert>

                  <Card className="mb-6 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2 text-warning">
                        <span>⚖️</span> Consumption Units (CU) Calculator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-card p-4 rounded-md mb-4 border border-warning/20">
                        <p className="mb-2"><strong>Reference:</strong> Adult sedentary male (19-50 years) = 1.0 CU = 2110 kcal</p>
                        <p><strong>Auto-calculation:</strong> CU values will be automatically calculated based on family member data</p>
                      </div>

                      <Button
                        onClick={calculateConsumptionUnits}
                        className="mb-4"
                      >
                        🔄 Calculate Consumption Units
                      </Button>

                      {showCuResults && (
                        <Card className="mb-4">
                          <CardHeader>
                            <CardTitle className="heading-4 flex items-center gap-2">
                              <span>📊</span> Consumption Units Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label>Total Family CU</Label>
                                <Input
                                  id="totalFamilyCU"
                                  name="totalFamilyCU"
                                  value={formData.totalFamilyCU}
                                  readOnly
                                />
                              </div>
                              <div>
                                <Label>Average CU per Person</Label>
                                <Input
                                  id="averageCUPerPerson"
                                  name="averageCUPerPerson"
                                  value={formData.averageCUPerPerson}
                                  readOnly
                                />
                              </div>
                            </div>

                            <h4 className="font-semibold mb-2">Consumption Units Breakdown</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Age</TableHead>
                                  <TableHead>Sex</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>CU Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {familyMembers.map((member) => {
                                  let cu = 0;
                                  let category = '';

                                  if (member.age < 0.5) {
                                    cu = consumptionUnits.infant_0_6m;
                                    category = 'Infant (0-6 months)';
                                  } else if (member.age < 1) {
                                    cu = consumptionUnits.infant_6_12m;
                                    category = 'Infant (6-12 months)';
                                  } else if (member.age < 4) {
                                    cu = consumptionUnits.child_1_3y;
                                    category = 'Child (1-3 years)';
                                  } else if (member.age < 7) {
                                    cu = consumptionUnits.child_4_6y;
                                    category = 'Child (4-6 years)';
                                  } else if (member.age < 10) {
                                    cu = consumptionUnits.child_7_9y;
                                    category = 'Child (7-9 years)';
                                  } else if (member.age < 13) {
                                    cu = member.sex === 'male' ? consumptionUnits.adolescent_10_12y_male : consumptionUnits.adolescent_10_12y_female;
                                    category = 'Adolescent (10-12 years)';
                                  } else if (member.age < 19) {
                                    cu = member.sex === 'male' ? consumptionUnits.adolescent_13_18y_male : consumptionUnits.adolescent_13_18y_female;
                                    category = 'Adolescent (13-18 years)';
                                  } else if (member.age < 60) {
                                    if (member.activity === 'sedentary') {
                                      cu = member.sex === 'male' ? consumptionUnits.adult_sedentary_male : consumptionUnits.adult_sedentary_female;
                                      category = 'Adult - Sedentary';
                                    } else if (member.activity === 'moderate') {
                                      cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
                                      category = 'Adult - Moderate Activity';
                                    } else if (member.activity === 'heavy') {
                                      cu = member.sex === 'male' ? consumptionUnits.adult_heavy_male : consumptionUnits.adult_heavy_female;
                                      category = 'Adult - Heavy Work';
                                    } else {
                                      cu = member.sex === 'male' ? consumptionUnits.adult_moderate_male : consumptionUnits.adult_moderate_female;
                                      category = 'Adult - Moderate Activity (Default)';
                                    }
                                  } else {
                                    cu = member.sex === 'male' ? consumptionUnits.elderly_male : consumptionUnits.elderly_female;
                                    category = 'Elderly (≥60 years)';
                                  }

                                  return (
                                    <TableRow key={member.id}>
                                      <TableCell>{member.name}</TableCell>
                                      <TableCell>{member.age}</TableCell>
                                      <TableCell>{member.sex}</TableCell>
                                      <TableCell>{category}</TableCell>
                                      <TableCell>{cu.toFixed(2)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>🍽️</span> 24-Hour Dietary Recall
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Card className="mb-6 bg-gradient-to-r from-accent/10 to-info/10 border-info/30">
                        <CardHeader>
                          <CardTitle className="heading-4 flex items-center gap-2 text-info">
                            <span>🔍</span> IFCT 2017 Food Database Search
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2">
                              <Label htmlFor="foodSearch">Search Food Item</Label>
                              <Input
                                id="foodSearch"
                                placeholder="Type food name..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="foodQuantity">Quantity (g)</Label>
                              <Input
                                id="foodQuantity"
                                type="number"
                                placeholder="Amount"
                                min={0}
                              />
                            </div>
                            <div>
                              <Label htmlFor="foodMeal">Meal</Label>
                              <Select defaultValue="breakfast">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="breakfast">Breakfast</SelectItem>
                                  <SelectItem value="lunch">Lunch</SelectItem>
                                  <SelectItem value="dinner">Dinner</SelectItem>
                                  <SelectItem value="snack">Snack</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Button variant="secondary">Add Food</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="overflow-x-auto mb-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Meal</TableHead>
                              <TableHead>Food Item</TableHead>
                              <TableHead>Quantity (g)</TableHead>
                              <TableHead>Energy (kcal)</TableHead>
                              <TableHead>Protein (g)</TableHead>
                              <TableHead>Carbs (g)</TableHead>
                              <TableHead>Fat (g)</TableHead>
                              <TableHead>Fiber (g)</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dietaryItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.meal}</TableCell>
                                <TableCell>{item.foodName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.energy}</TableCell>
                                <TableCell>{item.protein}</TableCell>
                                <TableCell>{item.carbs}</TableCell>
                                <TableCell>{item.fat}</TableCell>
                                <TableCell>{item.fiber}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedItems = [...dietaryItems];
                                      updatedItems.splice(index, 1);
                                      setDietaryItems(updatedItems);
                                    }}
                                  >
                                    🗑️
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableRow className="bg-muted font-bold">
                            <TableCell colSpan={3}>Total Daily Intake</TableCell>
                            <TableCell id="totalCalories">0</TableCell>
                            <TableCell id="totalProtein">0</TableCell>
                            <TableCell id="totalCarbs">0</TableCell>
                            <TableCell id="totalFat">0</TableCell>
                            <TableCell id="totalFiber">0</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          <TableRow className="bg-muted/80">
                            <TableCell colSpan={3}>Per CU Daily Intake</TableCell>
                            <TableCell id="perCUCalories">0</TableCell>
                            <TableCell id="perCUProtein">0</TableCell>
                            <TableCell id="perCUCarbs">0</TableCell>
                            <TableCell id="perCUFat">0</TableCell>
                            <TableCell id="perCUFiber">0</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </Table>
                      </div>

                      <Button
                        onClick={() => setShowNutritionalAnalysis(true)}
                        className="mb-6"
                      >
                        📈 Analyze Nutritional Status
                      </Button>

                      {showNutritionalAnalysis && (
                        <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success">
                          <CardHeader>
                            <CardTitle className="heading-4 flex items-center gap-2 text-success">
                              <span>📊</span> Nutritional Status Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <h4 className="font-semibold text-lg mb-4">📊 Nutritional Adequacy Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <div className="text-3xl font-bold text-success">85.2%</div>
                                  <div className="text-sm">Energy Adequacy</div>
                                  <Badge variant="outline" className="bg-success/10 text-success">Adequate</Badge>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <div className="text-3xl font-bold text-success">92.5%</div>
                                  <div className="text-sm">Protein Adequacy</div>
                                  <Badge variant="outline" className="bg-success/10 text-success">Adequate</Badge>
                                </CardContent>
                              </Card>
                            </div>

                            <h4 className="font-semibold text-lg mb-4">📋 Detailed Nutritional Assessment</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nutrient</TableHead>
                                  <TableHead>Per CU Intake</TableHead>
                                  <TableHead>ICMR-NIN RDA</TableHead>
                                  <TableHead>Adequacy (%)</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>Energy (kcal)</TableCell>
                                  <TableCell>1798.5</TableCell>
                                  <TableCell>2110</TableCell>
                                  <TableCell>85.2%</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-success/10 text-success">Adequate</Badge>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Protein (g)</TableCell>
                                  <TableCell>49.9</TableCell>
                                  <TableCell>54.0</TableCell>
                                  <TableCell>92.5%</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-success/10 text-success">Adequate</Badge>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>

                            <h4 className="font-semibold text-lg mt-6 mb-4">🏥 Health Risk Assessment</h4>
                            <Alert variant="default">
                              <AlertTitle>Overall nutritional status is satisfactory</AlertTitle>
                              <AlertDescription>
                                Continue current dietary practices with minor improvements.
                              </AlertDescription>
                            </Alert>

                            <h4 className="font-semibold text-lg mt-6 mb-4">💡 Recommendations</h4>
                            <div className="bg-white p-4 rounded-md border">
                              <ul className="list-disc pl-5 space-y-2">
                                <li>Follow ICMR My Plate guidelines for balanced nutrition</li>
                                <li>Include variety in food choices across all food groups</li>
                                <li>Ensure adequate intake of fruits and vegetables</li>
                                <li>Monitor family nutritional status regularly</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>⚕️</span> Family Health Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="mb-6"
                    onClick={addHealthRecord}
                  >
                    ➕ Add Health Record
                  </Button>

                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Height (cm)</TableHead>
                          <TableHead>Weight (kg)</TableHead>
                          <TableHead>BMI</TableHead>
                          <TableHead>BMI Category</TableHead>
                          <TableHead>Blood Pressure</TableHead>
                          <TableHead>Health Issues</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {healthRecords.map((record, index) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {familyMembers.map(m => (
                                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input readOnly />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} step={0.1} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} step={0.1} />
                            </TableCell>
                            <TableCell>
                              <Input readOnly />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">-</Badge>
                            </TableCell>
                            <TableCell>
                              <Input placeholder="120/80" />
                            </TableCell>
                            <TableCell>
                              <Textarea rows={2} placeholder="Any health problems" />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeHealthRecord(record.id)}
                              >
                                🗑️ Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>💉</span> Immunization Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="secondary"
                        className="mb-6"
                        onClick={addImmunizationRecord}
                      >
                        ➕ Add Immunization Record
                      </Button>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Age</TableHead>
                              <TableHead>BCG</TableHead>
                              <TableHead>OPV/IPV</TableHead>
                              <TableHead>DPT/Pentavalent</TableHead>
                              <TableHead>Hepatitis B</TableHead>
                              <TableHead>MMR/MR</TableHead>
                              <TableHead>COVID-19</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {immunizationRecords.map((record, index) => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {familyMembers.map(m => (
                                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input readOnly />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeImmunizationRecord(record.id)}
                                  >
                                    🗑️ Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-4 flex items-center gap-2">
                        <span>🏥</span> Medical History & Health Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label>Chronic Diseases Present in Family</Label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
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
                            <div key={disease.id} className="flex items-center space-x-2 border p-2 rounded-md">
                              <Checkbox
                                id={disease.id}
                                checked={formData.chronicDiseases.includes(disease.value)}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange('chronicDiseases', disease.value, checked as boolean)
                                }
                              />
                              <Label htmlFor={disease.id}>{disease.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📊</span> Comprehensive Family Health Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="mb-6"
                    onClick={generateComprehensiveReport}
                  >
                    📋 Generate Complete Analysis Report
                  </Button>

                  {showComprehensiveReport && (
                    <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-success">
                          <span>📊</span> Family Health Study Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg mb-2">📋 Family Health Study Report</h3>
                          <p><strong>Date:</strong> {formData.studyDate}</p>
                          <p><strong>Family ID:</strong> {formData.familyId}</p>
                          <p><strong>Head of Family:</strong> {formData.familyHead}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">🏠 General Information</h4>
                          <p><strong>Address:</strong> {formData.address}</p>
                          <p><strong>Area Type:</strong> {formData.area}</p>
                          <p><strong>Religion:</strong> {formData.religion}</p>
                          <p><strong>Family Type:</strong> {formData.familyType}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">💰 Socio-Economic Status</h4>
                          <p><strong>Total Monthly Income:</strong> ₹{formData.totalIncome}</p>
                          <p><strong>Per Capita Income:</strong> ₹{formData.perCapitaIncome}</p>
                          <p><strong>SES Classification:</strong> {formData.sesClass}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">👨‍👩‍👧‍👦 Family Composition</h4>
                          <p><strong>Total Members:</strong> {familyMembers.length}</p>
                          <p><strong>Males:</strong> {familyMembers.filter(m => m.sex === 'male').length}</p>
                          <p><strong>Females:</strong> {familyMembers.filter(m => m.sex === 'female').length}</p>
                          <p><strong>Children (&lt;18 years):</strong> {familyMembers.filter(m => m.age < 18).length}</p>
                          <p><strong>Adults (18-59 years):</strong> {familyMembers.filter(m => m.age >= 18 && m.age < 60).length}</p>
                          <p><strong>Elderly (≥60 years):</strong> {familyMembers.filter(m => m.age >= 60).length}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">🍎 Nutritional Assessment</h4>
                          <p><strong>Total Consumption Units:</strong> {formData.totalFamilyCU}</p>
                          <p><strong>Nutritional Status:</strong> Adequate nutrition</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">🏥 Health Status</h4>
                          <p><strong>Health Records:</strong> {healthRecords.length} members examined</p>
                          <p><strong>Immunization Records:</strong> {immunizationRecords.length} members assessed</p>
                          <p><strong>Chronic Diseases:</strong> {formData.chronicDiseases.join(', ') || 'None reported'}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-2">🏠 Environmental Conditions</h4>
                          <p><strong>House Type:</strong> {formData.houseType}</p>
                          <p><strong>Water Supply:</strong> {formData.waterSupply}</p>
                          <p><strong>Toilet Facility:</strong> {formData.toiletFacility}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-md mb-2">📊 Summary & Recommendations</h4>
                          <Alert className="mb-4">
                            <AlertTitle>Overall Assessment</AlertTitle>
                            <AlertDescription>
                              This {formData.familyType} family shows mixed indicators and would benefit from focused improvements.
                            </AlertDescription>
                          </Alert>
                          <div className="bg-white p-4 rounded-md border">
                            <h5 className="font-semibold mb-2">Key Recommendations:</h5>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>Regular health check-ups and monitoring</li>
                              <li>Follow ICMR dietary guidelines for optimal nutrition</li>
                              <li>Maintain good hygiene and sanitation practices</li>
                              <li>Consider enrolling in applicable government welfare schemes</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-muted p-6 rounded-lg text-center">
                    <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Button variant="secondary">
                        📄 Export to PDF
                      </Button>
                      <Button variant="secondary">
                        📊 Export to Excel
                      </Button>
                      <Button variant="secondary">
                        💾 Export Data (JSON)
                      </Button>
                      <Button variant="default">
                        🖨️ Print Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
