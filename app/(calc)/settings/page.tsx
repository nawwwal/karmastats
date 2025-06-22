"use client";

import React from 'react';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ToolPageWrapper
      title="Settings"
      description="Configure application preferences and options"
      icon={Settings}
      layout="single-column"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings panel coming soon. This will include preferences for themes, data export formats, and calculation defaults.
          </p>
        </CardContent>
      </Card>
    </ToolPageWrapper>
  );
}
