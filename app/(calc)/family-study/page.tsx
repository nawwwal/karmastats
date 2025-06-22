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
import { CheckCircle, Circle, AlertCircle, Download, Save, Printer } from "lucide-react";
import { consumptionUnits, sesClassifications } from "@/lib/family-study";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';

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
      return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const renderResults = () => {
    if (!showReport) return null;

  return (
                <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Family Health Assessment Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{familyMembers.length}</div>
                <div className="text-sm text-muted-foreground">Family Members</div>
                  </CardContent>
                </Card>
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">₹{formData.perCapitaIncome}</div>
                <div className="text-sm text-muted-foreground">Per Capita Income</div>
                  </CardContent>
                </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent-foreground">{formData.sesClass.split(' ')[0] || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">SES Class</div>
                  </CardContent>
                </Card>
          </div>

          {/* Family Composition */}
                <Card>
            <CardHeader>
              <CardTitle className="text-lg">Family Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Males:</span> {familyMembers.filter(m => m.sex === 'male').length}
                </div>
                <div>
                  <span className="font-medium">Females:</span> {familyMembers.filter(m => m.sex === 'female').length}
                </div>
                <div>
                  <span className="font-medium">Children (&lt;18):</span> {familyMembers.filter(m => m.age < 18).length}
                </div>
                <div>
                  <span className="font-medium">Elderly (≥60):</span> {familyMembers.filter(m => m.age >= 60).length}
                </div>
              </div>
                  </CardContent>
                </Card>

          {/* Export Options */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Data
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
              </div>
        </CardContent>
      </Card>
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
      onReset={handleReset}
      backHref="/family-study"
      backLabel="Family Study"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {renderInputForm()}
        </div>
        <div>
          {renderResults()}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
