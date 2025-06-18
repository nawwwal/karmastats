"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ToolPageWrapper } from "@/components/ui/tool-page-wrapper";
import {
  Palette,
  Database,
  Calculator,
  Globe,
  Shield,
  Download,
  Trash2,
  Info,
  CheckCircle
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    autoSave: true,
    showTooltips: true,
    scientificNotation: false,
    decimalPlaces: 4,
    confidenceLevel: 95,
    saveCalculations: true,
    dataRetention: "30days",
    exportFormat: "csv",
    language: "en"
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("karmastat-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSaveStatus("saving");
    localStorage.setItem("karmastat-settings", JSON.stringify(newSettings));
    setTimeout(() => setSaveStatus("saved"), 500);
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const clearAllData = () => {
    localStorage.clear();
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "karmastat-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const renderContent = () => (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance and interface preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tooltips">Show Tooltips</Label>
              <p className="text-xs text-muted-foreground">
                Display helpful explanations on hover
              </p>
            </div>
            <Switch
              id="tooltips"
              checked={settings.showTooltips}
              onCheckedChange={(value) => updateSetting("showTooltips", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistical Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Statistical Calculations
          </CardTitle>
          <CardDescription>
            Configure default values and display preferences for calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decimal-places">Decimal Places</Label>
              <Input
                id="decimal-places"
                type="number"
                min="1"
                max="10"
                value={settings.decimalPlaces}
                onChange={(e) => updateSetting("decimalPlaces", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of decimal places to display in results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence-level">Default Confidence Level (%)</Label>
              <Select
                value={settings.confidenceLevel.toString()}
                onValueChange={(value) => updateSetting("confidenceLevel", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default confidence level for statistical tests
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="scientific-notation">Scientific Notation</Label>
              <p className="text-xs text-muted-foreground">
                Display very large or small numbers in scientific notation
              </p>
            </div>
            <Switch
              id="scientific-notation"
              checked={settings.scientificNotation}
              onCheckedChange={(value) => updateSetting("scientificNotation", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Control how your data is stored and managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save Input Data</Label>
              <p className="text-xs text-muted-foreground">
                Automatically save form inputs as you type
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(value) => updateSetting("autoSave", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-calculations">Save Calculation History</Label>
              <p className="text-xs text-muted-foreground">
                Keep a history of your calculations and results
              </p>
            </div>
            <Switch
              id="save-calculations"
              checked={settings.saveCalculations}
              onCheckedChange={(value) => updateSetting("saveCalculations", value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention Period</Label>
              <Select
                value={settings.dataRetention}
                onValueChange={(value) => updateSetting("dataRetention", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 days</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="90days">90 days</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="never">Never delete</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How long to keep your saved data
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Default Export Format</Label>
              <Select
                value={settings.exportFormat}
                onValueChange={(value) => updateSetting("exportFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Preferred format for exporting results
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Your data security and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Local Data Storage</h4>
                <p className="text-sm text-muted-foreground">
                  All your data is stored locally in your browser. We do not collect, transmit,
                  or store any of your calculation data on external servers. Your data remains
                  completely private and under your control.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSetting("language", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Interface language (coming soon)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Actions
          </CardTitle>
          <CardDescription>
            Manage your stored data and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportSettings} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button onClick={clearAllData} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> Clearing all data will permanently delete your saved
              calculations, preferences, and any stored form data. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (saveStatus === "idle") return null;

    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">
                {saveStatus === "saving" ? "Saving..." : "Settings Saved"}
              </div>
              <div className="text-sm text-green-700">
                Your preferences have been updated successfully
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ToolPageWrapper
      title="Settings"
      description="Configure your preferences and manage your data"
      category="Application Settings"
      resultsSection={renderResults()}
    >
      {renderContent()}
    </ToolPageWrapper>
  );
}
