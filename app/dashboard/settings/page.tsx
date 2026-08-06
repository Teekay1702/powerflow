'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Calculator, DollarSign, Percent, Sun, Battery, Zap } from 'lucide-react';

export default function SettingsPage() {
  useAuth(true);

  const settingGroups = [
    {
      title: 'Pricing & Tax',
      icon: DollarSign,
      description: 'VAT rates, markup percentages, and pricing rules',
      settings: [
        { key: 'VAT_RATE', value: '15%', description: 'Value Added Tax rate' },
        { key: 'MARKUP_PERCENTAGE', value: '25%', description: 'Default markup on products' },
        { key: 'DEFAULT_CURRENCY', value: 'ZAR', description: 'Default currency code' },
      ],
    },
    {
      title: 'Labour & Installation',
      icon: Zap,
      description: 'Hourly rates and flat fees for installations',
      settings: [
        { key: 'LABOUR_RATE_HOURLY', value: 'R 450.00', description: 'Hourly labour rate' },
        { key: 'INSTALLATION_FLAT_RATE', value: 'R 2,500.00', description: 'Flat installation fee' },
      ],
    },
    {
      title: 'Battery Calculations',
      icon: Battery,
      description: 'Depth of discharge and efficiency settings by chemistry',
      settings: [
        { key: 'BATTERY_DOD_LITHIUM', value: '90%', description: 'Lithium DoD' },
        { key: 'BATTERY_DOD_LEAD_ACID', value: '50%', description: 'Lead Acid DoD' },
        { key: 'BATTERY_DOD_GEL', value: '60%', description: 'Gel DoD' },
        { key: 'BATTERY_DOD_AGM', value: '60%', description: 'AGM DoD' },
        { key: 'BATTERY_EFFICIENCY', value: '95%', description: 'Round-trip efficiency' },
        { key: 'BATTERY_AGING_FACTOR', value: '85%', description: 'Aging derating' },
      ],
    },
    {
      title: 'Solar Calculations',
      icon: Sun,
      description: 'Irradiance, losses, and oversizing factors',
      settings: [
        { key: 'PEAK_SUN_HOURS', value: '5.5', description: 'Average peak sun hours/day' },
        { key: 'SHADING_LOSS_FACTOR', value: '95%', description: 'Shading retention' },
        { key: 'CABLE_LOSS_FACTOR', value: '98%', description: 'Cable efficiency' },
        { key: 'INVERTER_EFFICIENCY', value: '97%', description: 'Inverter efficiency' },
        { key: 'OVERSIZING_FACTOR', value: '1.2x', description: 'Array oversizing' },
      ],
    },
    {
      title: 'Safety Margins',
      icon: Percent,
      description: 'System-wide safety and derating margins',
      settings: [
        { key: 'SAFETY_MARGIN_PERCENTAGE', value: '20%', description: 'General safety margin' },
        { key: 'TEMPERATURE_LOSS_FACTOR', value: '95%', description: 'Temperature derating' },
        { key: 'SYSTEM_LOSS_FACTOR', value: '90%', description: 'Overall system losses' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">
          Configure calculation parameters, pricing, and business rules. Changes affect all future calculations and quotations.
        </p>
      </div>

      <div className="grid gap-6">
        {settingGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <group.icon className="h-5 w-5 text-blue-600" />
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between rounded-lg border p-3 bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-mono text-slate-400">{setting.key}</p>
                      <p className="text-sm font-medium text-slate-700">{setting.value}</p>
                      <p className="text-xs text-slate-500">{setting.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Settings Management</p>
              <p className="text-sm text-amber-700 mt-1">
                Full settings editing with validation and audit logging is available via the API.
                Contact your system administrator to modify these values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}