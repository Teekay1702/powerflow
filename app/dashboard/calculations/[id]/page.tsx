'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Zap, Battery, Sun, FileText, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CalculationDetailPage() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['calculation', id],
    queryFn: async () => {
      const response = await api.get<any>(`/calculations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const calculateBattery = useMutation({
    mutationFn: () => api.post(`/calculations/${id}/battery`, { chemistry: 'LITHIUM_ION', backupHours: 4 }),
    onSuccess: () => toast({ title: 'Battery sizing complete' }),
    onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.error?.message, variant: 'destructive' }),
  });

  const calculateSolar = useMutation({
    mutationFn: () => api.post(`/calculations/${id}/solar`),
    onSuccess: () => toast({ title: 'Solar sizing complete' }),
    onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.error?.message, variant: 'destructive' }),
  });

  const calculateInverter = useMutation({
    mutationFn: () => api.post(`/calculations/${id}/inverter`),
    onSuccess: () => toast({ title: 'Inverter sizing complete' }),
    onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.error?.message, variant: 'destructive' }),
  });

  const calc = data;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!calc) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Calculation not found</p>
        <Button onClick={() => router.push('/dashboard/calculations')} className="mt-4">
          Back to Calculations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/calculations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{calc.name}</h1>
            <p className="text-sm text-slate-500 capitalize">{calc.propertyType.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        <Badge variant={calc.status === 'COMPLETED' ? 'success' : 'secondary'}>{calc.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Load Profile Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Connected</p>
              <p className="text-xl font-bold">{calc.totalConnectedLoad?.toLocaleString()} W</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Peak Load</p>
              <p className="text-xl font-bold">{calc.peakLoad?.toLocaleString()} W</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Daily Consumption</p>
              <p className="text-xl font-bold">{calc.dailyConsumption} kWh</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Monthly</p>
              <p className="text-lg font-semibold">{calc.monthlyConsumption} kWh</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Surge</p>
              <p className="text-lg font-semibold">{calc.surgeRequirements?.toLocaleString()} W</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Demand Factor</p>
              <p className="text-lg font-semibold">{calc.demandFactor}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appliances</CardTitle>
        </CardHeader>
        <CardContent>
          {calc.appliances?.length > 0 ? (
            <div className="space-y-2">
              {calc.appliances.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{app.applianceName}</span>
                    <span className="text-slate-500">×{app.quantity}</span>
                    {!app.isEssential && <Badge variant="secondary" className="text-xs">Non-essential</Badge>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{app.totalPower} W</p>
                    <p className="text-xs text-slate-500">{app.dailyHours} hrs/day</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No appliances recorded</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Battery className="h-4 w-4 text-green-600" />
              Battery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calc.batterySizingResults?.length > 0 ? (
              <div className="text-sm space-y-1">
                <p><span className="text-slate-500">Capacity:</span> {calc.batterySizingResults[0].requiredCapacityKwh} kWh</p>
                <p><span className="text-slate-500">Batteries:</span> {calc.batterySizingResults[0].numberOfBatteries}</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => calculateBattery.mutate()} disabled={calculateBattery.isPending}>
                {calculateBattery.isPending ? 'Calculating...' : 'Calculate'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-4 w-4 text-amber-500" />
              Solar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calc.solarSizingResults?.length > 0 ? (
              <div className="text-sm space-y-1">
                <p><span className="text-slate-500">Capacity:</span> {calc.solarSizingResults[0].totalRequiredCapacityKw} kW</p>
                <p><span className="text-slate-500">Panels:</span> {calc.solarSizingResults[0].numberOfPanels}</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => calculateSolar.mutate()} disabled={calculateSolar.isPending}>
                {calculateSolar.isPending ? 'Calculating...' : 'Calculate'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-blue-600" />
              Inverter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calc.inverterSizingResults?.length > 0 ? (
              <div className="text-sm space-y-1">
                <p><span className="text-slate-500">Capacity:</span> {calc.inverterSizingResults[0].totalInverterCapacity} VA</p>
                <p><span className="text-slate-500">Hybrid:</span> {calc.inverterSizingResults[0].hybridRecommended ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => calculateInverter.mutate()} disabled={calculateInverter.isPending}>
                {calculateInverter.isPending ? 'Calculating...' : 'Calculate'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => router.push(`/dashboard/quotations/new?loadId=${id}`)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>
    </div>
  );
}