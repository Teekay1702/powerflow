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
import { Plus, Calculator, Zap, RefreshCw, FileText, Eye } from 'lucide-react';
import { ApplianceBuilder, type ApplianceRow } from '@/features/calculations/ApplianceBuilder';
import { toast } from '@/hooks/use-toast';

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
    ] as ApplianceRow[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalid = formData.appliances.some(
      (a) => !a.applianceName.trim() || a.powerRating <= 0
    );
    if (hasInvalid) {
      toast({
        title: 'Missing appliance details',
        description: 'Every appliance needs a name and a wattage. Use "Set Appliance" to pick from the catalogue.',
        variant: 'destructive',
      });
      return;
    }

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

              <ApplianceBuilder
                appliances={formData.appliances}
                onChange={(appliances) => setFormData({ ...formData, appliances })}
              />

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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/calculations/${calc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/quotations/new?loadId=${calc.id}`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Quote
                          </Button>
                        </Link>
                      </div>
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
