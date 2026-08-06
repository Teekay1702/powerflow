'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCalculations, useCreateCalculation } from '@/hooks/useCalculations';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, Zap, RefreshCw, FileText } from 'lucide-react';

interface ApplianceInput {
  id: string;
  applianceName: string;
  quantity: number;
  powerRating: number;
  startingSurge?: number;
  dailyHours: number;
  peakHours?: number;
  isEssential: boolean;
}

export default function CalculationsPage() {
  useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading, refetch } = useCalculations();
  const { data: customersData } = useCustomers('', 1, 100);
  const createCalculation = useCreateCalculation();

  const [formData, setFormData] = useState({
    name: 'New Load Profile',
    customerId: '',
    propertyType: 'HOUSE' as const,
    appliances: [
      { id: '1', applianceName: '', quantity: 1, powerRating: 0, dailyHours: 4, isEssential: true },
    ] as ApplianceInput[],
  });

  const addAppliance = () => {
    setFormData({
      ...formData,
      appliances: [
        ...formData.appliances,
        { id: Math.random().toString(36).substr(2, 9), applianceName: '', quantity: 1, powerRating: 0, dailyHours: 4, isEssential: true },
      ],
    });
  };

  const removeAppliance = (id: string) => {
    setFormData({
      ...formData,
      appliances: formData.appliances.filter((a) => a.id !== id),
    });
  };

  const updateAppliance = (id: string, field: keyof ApplianceInput, value: any) => {
    setFormData({
      ...formData,
      appliances: formData.appliances.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      customerId: formData.customerId,
      propertyType: formData.propertyType,
      appliances: formData.appliances.map(({ id, ...rest }) => rest),
    };
    try {
      await createCalculation.mutateAsync(payload);
      setIsDialogOpen(false);
      setFormData({
        name: 'New Load Profile',
        customerId: '',
        propertyType: 'HOUSE',
        appliances: [{ id: '1', applianceName: '', quantity: 1, powerRating: 0, dailyHours: 4, isEssential: true }],
      });
    } catch {
      // Error handled by mutation
    }
  };

  const calculations = data?.data ?? [];
  const customers = customersData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Electrical Load Calculator</h1>
          <p className="text-slate-500">Build load profiles to size batteries, solar, and inverters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Calculation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                New Load Profile
              </DialogTitle>
              <DialogDescription>
                Add all electrical appliances for this property. Calculations happen on the backend.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Profile Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(v) => setFormData({ ...formData, customerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(v) => setFormData({ ...formData, propertyType: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOUSE">House</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="OFFICE">Office</SelectItem>
                      <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                      <SelectItem value="HIGH_RISE">High-rise</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Appliances</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAppliance}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Appliance
                  </Button>
                </div>
                {formData.appliances.map((app) => (
                  <div key={app.id} className="grid gap-2 md:grid-cols-7 items-end border rounded-lg p-3 bg-slate-50">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={app.applianceName}
                        onChange={(e) => updateAppliance(app.id, 'applianceName', e.target.value)}
                        placeholder="e.g. Fridge"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={app.quantity}
                        onChange={(e) => updateAppliance(app.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Watts</Label>
                      <Input
                        type="number"
                        value={app.powerRating}
                        onChange={(e) => updateAppliance(app.id, 'powerRating', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Hours/Day</Label>
                      <Input
                        type="number"
                        value={app.dailyHours}
                        onChange={(e) => updateAppliance(app.id, 'dailyHours', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Surge (W)</Label>
                      <Input
                        type="number"
                        value={app.startingSurge || ''}
                        onChange={(e) => updateAppliance(app.id, 'startingSurge', parseFloat(e.target.value) || undefined)}
                        placeholder="Optional"
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                      <input
                        type="checkbox"
                        checked={app.isEssential}
                        onChange={(e) => updateAppliance(app.id, 'isEssential', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label className="text-xs">Essential</Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAppliance(app.id)}
                      disabled={formData.appliances.length === 1}
                      className="text-red-600 h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCalculation.isPending}>
                  <Zap className="h-4 w-4 mr-2" />
                  {createCalculation.isPending ? 'Calculating...' : 'Calculate & Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Load Profiles</CardTitle>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : calculations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <Calculator className="h-8 w-8 mb-2" />
              <p>No calculations yet</p>
              <p className="text-sm">Create your first load profile above</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Connected Load</TableHead>
                  <TableHead>Peak Load</TableHead>
                  <TableHead>Daily kWh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium">{calc.name}</TableCell>
                    <TableCell className="capitalize text-sm">{calc.propertyType.toLowerCase().replace('_', ' ')}</TableCell>
                    <TableCell>{calc.totalConnectedLoad.toLocaleString()} W</TableCell>
                    <TableCell>{calc.peakLoad.toLocaleString()} W</TableCell>
                    <TableCell>{calc.dailyConsumption} kWh</TableCell>
                    <TableCell>
                      <Badge variant={calc.status === 'COMPLETED' ? 'success' : 'secondary'}>
                        {calc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/quotations?loadId=${calc.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Quote
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}