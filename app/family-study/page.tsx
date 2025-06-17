'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Home, 
  DollarSign, 
  Utensils, 
  Activity, 
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

// Import family study components
import { FamilyMemberTable } from '@/components/family-study/FamilyMemberTable';
import { FamilyStatistics } from '@/components/family-study/FamilyStatistics';
import { ConsumptionUnitTable } from '@/components/family-study/ConsumptionUnitTable';
import { DietaryTable } from '@/components/family-study/DietaryTable';
import { HealthRecordTable } from '@/components/family-study/HealthRecordTable';
import { ImmunizationTable } from '@/components/family-study/ImmunizationTable';
import { NutritionalAnalysis } from '@/components/family-study/NutritionalAnalysis';

// Import types and utilities
import { 
  FamilyMember, 
  DietaryItem, 
  HealthRecord, 
  ImmunizationRecord,
  calculateBMI,
  calculateConsumptionUnit,
  calculateNutritionalAdequacy,
  getSESClass,
  foodDatabase
} from '@/lib/family-study';

export default function FamilyStudyPage() {
  // State for family members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [nextMemberId, setNextMemberId] = useState(1);
  
  // State for dietary items
  const [dietaryItems, setDietaryItems] = useState<DietaryItem[]>([]);
  
  // State for health records
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [nextHealthId, setNextHealthId] = useState(1);
  
  // State for immunization records
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [nextImmunizationId, setNextImmunizationId] = useState(1);
  
  // State for consumption units
  const [totalCU, setTotalCU] = useState(0);
  const [cuBreakdown, setCuBreakdown] = useState<{name: string; age: number; sex: string; category: string; cu: string}[]>([]);
  
  // State for nutritional analysis
  const [nutritionalAnalysis, setNutritionalAnalysis] = useState<{
    calorieAdequacy: number;
    proteinAdequacy: number;
    perCUCalories: number;
    perCUProtein: number;
  } | null>(null);
  
  // Family member functions
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: nextMemberId,
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
    setNextMemberId(nextMemberId + 1);
  };
  
  const updateFamilyMember = (index: number, field: string, value: any) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setFamilyMembers(updatedMembers);
  };
  
  const removeFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };
  
  // Health record functions
  const addHealthRecord = () => {
    const newRecord: HealthRecord = {
      id: nextHealthId
    };
    
    setHealthRecords([...healthRecords, newRecord]);
    setNextHealthId(nextHealthId + 1);
  };
  
  const updateHealthRecord = (index: number, field: string, value: any) => {
    const updatedRecords = [...healthRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      [field]: value
    };
    setHealthRecords(updatedRecords);
  };
  
  const removeHealthRecord = (id: number) => {
    setHealthRecords(healthRecords.filter(record => record.id !== id));
  };
  
  // Immunization record functions
  const addImmunizationRecord = () => {
    const newRecord: ImmunizationRecord = {
      id: nextImmunizationId
    };
    
    setImmunizationRecords([...immunizationRecords, newRecord]);
    setNextImmunizationId(nextImmunizationId + 1);
  };
  
  const updateImmunizationRecord = (index: number, field: string, value: any) => {
    const updatedRecords = [...immunizationRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      [field]: value
    };
    setImmunizationRecords(updatedRecords);
  };
  
  const removeImmunizationRecord = (id: number) => {
    setImmunizationRecords(immunizationRecords.filter(record => record.id !== id));
  };
  
  // Dietary functions
  const addDietaryItem = (item: DietaryItem) => {
    setDietaryItems([...dietaryItems, item]);
  };
  
  const removeDietaryItem = (index: number) => {
    setDietaryItems(dietaryItems.filter((_, i) => i !== index));
  };
  
  // Calculate consumption units
  const calculateConsumptionUnits = () => {
    if (familyMembers.length === 0) {
      alert('Please add family members first');
      return;
    }
    
    let total = 0;
    let breakdown: {name: string; age: number; sex: string; category: string; cu: string}[] = [];
    
    familyMembers.forEach(member => {
      const { cu, category } = calculateConsumptionUnit(member);
      total += cu;
      breakdown.push({
        name: member.name,
        age: member.age,
        sex: member.sex,
        category,
        cu: cu.toFixed(2)
      });
    });
    
    setTotalCU(total);
    setCuBreakdown(breakdown);
  };
  
  // Calculate nutritional analysis
  const analyzeNutrition = () => {
    if (dietaryItems.length === 0 || totalCU === 0) {
      alert('Please add dietary items and calculate consumption units first');
      return;
    }
    
    // Calculate total nutrients
    let totalEnergy = 0, totalProtein = 0;
    
    dietaryItems.forEach(item => {
      totalEnergy += parseFloat(item.energy.toString());
      totalProtein += parseFloat(item.protein.toString());
    });
    
    // Calculate per CU values
    const perCUCalories = totalEnergy / totalCU;
    const perCUProtein = totalProtein / totalCU;
    
    // Calculate adequacy
    const analysis = calculateNutritionalAdequacy(perCUCalories, perCUProtein);
    
    setNutritionalAnalysis({
      calorieAdequacy: analysis.calorieAdequacy,
      proteinAdequacy: analysis.proteinAdequacy,
      perCUCalories,
      perCUProtein
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Family Health Study</h1>
        <p className="text-muted-foreground">
          Comprehensive family health assessment based on ICMR-NIN 2020 Guidelines
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="socioeconomic">Socioeconomic</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        
        {/* General Information Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyDate">Study Date</Label>
                  <Input id="studyDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyId">Family ID</Label>
                  <Input id="familyId" defaultValue={`FAM-${Date.now().toString().substring(7)}`} readOnly />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="familyHead">Name of Head of Family</Label>
                <Input id="familyHead" placeholder="Enter name of head of family" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea id="address" placeholder="Enter complete address" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area Type</Label>
                  <Select>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select area type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="slum">Slum</SelectItem>
                      <SelectItem value="tribal">Tribal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyType">Family Type</Label>
                  <Select>
                    <SelectTrigger id="familyType">
                      <SelectValue placeholder="Select family type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuclear">Nuclear Family</SelectItem>
                      <SelectItem value="joint">Joint Family</SelectItem>
                      <SelectItem value="extended">Extended Family</SelectItem>
                      <SelectItem value="three-generation">Three Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Family Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addFamilyMember} className="mb-4">
                <Plus className="mr-2 h-4 w-4" /> Add Family Member
              </Button>
              
              <FamilyMemberTable 
                members={familyMembers} 
                onUpdate={updateFamilyMember} 
                onRemove={removeFamilyMember} 
              />
              
              {familyMembers.length > 0 && (
                <div className="mt-6">
                  <FamilyStatistics members={familyMembers} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Socioeconomic Tab */}
        <TabsContent value="socioeconomic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Socioeconomic Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryIncome">Primary Income (₹/month)</Label>
                  <Input id="primaryIncome" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherIncome">Other Income Sources (₹/month)</Label>
                  <Input id="otherIncome" type="number" min="0" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalIncome">Total Monthly Income</Label>
                  <Input id="totalIncome" type="number" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familySize">Family Size</Label>
                  <Input id="familySize" type="number" value={familyMembers.length} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perCapitaIncome">Per Capita Income</Label>
                  <Input id="perCapitaIncome" type="number" readOnly />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sesMethod">SES Classification Method</Label>
                <Select defaultValue="prasad">
                  <SelectTrigger id="sesMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prasad">Modified Prasad 2024</SelectItem>
                    <SelectItem value="kuppuswami">Kuppuswami Scale</SelectItem>
                    <SelectItem value="pareek">Pareek (Rural)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Nutrition Tab */}
        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Nutritional Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Consumption Units (CU) Calculator</h3>
                <Button onClick={calculateConsumptionUnits}>
                  Calculate Consumption Units
                </Button>
                
                {totalCU > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalFamilyCU">Total Family CU</Label>
                        <Input id="totalFamilyCU" value={totalCU.toFixed(2)} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="averageCUPerPerson">Average CU per Person</Label>
                        <Input 
                          id="averageCUPerPerson" 
                          value={(totalCU / familyMembers.length).toFixed(2)} 
                          readOnly 
                        />
                      </div>
                    </div>
                    
                    <ConsumptionUnitTable members={familyMembers} cuBreakdown={cuBreakdown} />
                  </div>
                )}
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">24-Hour Dietary Recall</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="foodSearch">Search Food Item</Label>
                    <Input id="foodSearch" placeholder="Type food name..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foodQuantity">Quantity (g)</Label>
                    <Input id="foodQuantity" type="number" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foodMeal">Meal</Label>
                    <Select defaultValue="breakfast">
                      <SelectTrigger id="foodMeal">
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
                </div>
                
                <Button className="mb-4">Add Food Item</Button>
                
                <DietaryTable 
                  items={dietaryItems} 
                  onRemove={removeDietaryItem} 
                  totalCU={totalCU} 
                />
                
                <Button 
                  onClick={analyzeNutrition} 
                  className="mt-4" 
                  disabled={dietaryItems.length === 0 || totalCU === 0}
                >
                  Analyze Nutritional Status
                </Button>
              </div>
              
              {nutritionalAnalysis && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <NutritionalAnalysis 
                    calorieAdequacy={nutritionalAnalysis.calorieAdequacy}
                    proteinAdequacy={nutritionalAnalysis.proteinAdequacy}
                    perCUCalories={nutritionalAnalysis.perCUCalories}
                    perCUProtein={nutritionalAnalysis.perCUProtein}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Health Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Health Measurements</h3>
                <Button onClick={addHealthRecord} className="mb-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Health Record
                </Button>
                
                <HealthRecordTable 
                  records={healthRecords} 
                  members={familyMembers}
                  onUpdate={updateHealthRecord} 
                  onRemove={removeHealthRecord} 
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Immunization Status</h3>
                <Button onClick={addImmunizationRecord} className="mb-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Immunization Record
                </Button>
                
                <ImmunizationTable 
                  records={immunizationRecords} 
                  members={familyMembers}
                  onUpdate={updateImmunizationRecord} 
                  onRemove={removeImmunizationRecord} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Comprehensive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button>Generate Comprehensive Report</Button>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Export Options</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Export to PDF</Button>
                    <Button variant="outline">Export to Excel</Button>
                    <Button variant="outline">Export Data (JSON)</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Print Options</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Print Full Report</Button>
                    <Button variant="outline">Print Summary</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}