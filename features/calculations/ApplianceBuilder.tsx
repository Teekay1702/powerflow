'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export interface ApplianceInput {
  id: string;
  applianceName: string;
  quantity: number;
  powerRating: number;
  startingSurge?: number;
  dailyHours: number;
  peakHours?: number;
  isEssential: boolean;
}

interface ApplianceBuilderProps {
  appliances: ApplianceInput[];
  onChange: (appliances: ApplianceInput[]) => void;
}

export function ApplianceBuilder({ appliances, onChange }: ApplianceBuilderProps) {
  const add = () => {
    onChange([
      ...appliances,
      { id: Math.random().toString(36).substr(2, 9), applianceName: '', quantity: 1, powerRating: 0, dailyHours: 4, isEssential: true },
    ]);
  };

  const remove = (id: string) => {
    if (appliances.length <= 1) return;
    onChange(appliances.filter((a) => a.id !== id));
  };

  const update = (id: string, field: keyof ApplianceInput, value: any) => {
    onChange(appliances.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Appliances</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" />
          Add Appliance
        </Button>
      </div>
      {appliances.map((app) => (
        <div key={app.id} className="grid gap-2 md:grid-cols-7 items-end border rounded-lg p-3 bg-slate-50">
          <div className="md:col-span-2">
            <Label className="text-xs">Name</Label>
            <Input
              value={app.applianceName}
              onChange={(e) => update(app.id, 'applianceName', e.target.value)}
              placeholder="e.g. Fridge"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Qty</Label>
            <Input type="number" value={app.quantity} onChange={(e) => update(app.id, 'quantity', parseInt(e.target.value) || 1)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Watts</Label>
            <Input type="number" value={app.powerRating} onChange={(e) => update(app.id, 'powerRating', parseFloat(e.target.value) || 0)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Hours/Day</Label>
            <Input type="number" value={app.dailyHours} onChange={(e) => update(app.id, 'dailyHours', parseFloat(e.target.value) || 0)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Surge (W)</Label>
            <Input type="number" value={app.startingSurge || ''} onChange={(e) => update(app.id, 'startingSurge', parseFloat(e.target.value) || undefined)} placeholder="Optional" className="h-8" />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <input type="checkbox" checked={app.isEssential} onChange={(e) => update(app.id, 'isEssential', e.target.checked)} className="h-4 w-4" />
            <Label className="text-xs">Essential</Label>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(app.id)} disabled={appliances.length === 1} className="text-red-600 h-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}