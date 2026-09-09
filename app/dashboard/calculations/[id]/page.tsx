'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useSystemRecommendation } from '@/hooks/useSystemRecommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Zap, Battery, Sun, FileText, Calculator, Sparkles, Package } from 'lucide-react';
import type { RecommendedProduct, SystemRecommendation } from '@/types';
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
  const queryClient = useQueryClient();

  const { data: recommendationData, isLoading: recLoading } = useSystemRecommendation(id);
  const recommendation: SystemRecommendation | undefined = recommendationData?.data;

  // Once the recommendation has been generated (and persisted), refresh the
  // load profile so the batch Battery / Solar / Inverter cards reflect it too.
  useEffect(() => {
    if (recommendation) {
      queryClient.invalidateQueries({ queryKey: ['calculation', id] });
    }
  }, [recommendation, id, queryClient]);

  // Flatten all recommended products into one ordered list for the summary.
  const recProducts: RecommendedProduct[] = recommendation
    ? [
      ...recommendation.products.panels,
      ...recommendation.products.batteries,
      ...recommendation.products.inverters,
      ...recommendation.products.accessories,
    ]
    : [];

  const getItemLabel = (type: string) => {
    switch (type) {
      case 'PANEL': return 'Solar Panels';
      case 'BATTERY': return 'Batteries';
      case 'INVERTER': return 'Inverters';
      case 'ACCESSORY': return 'Accessories';
      default: return type;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'PANEL': return <Sun className="h-4 w-4 text-amber-500" />;
      case 'BATTERY': return <Battery className="h-4 w-4 text-green-600" />;
      case 'INVERTER': return <Zap className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-slate-500" />;
    }
  };

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

      {/* Recommended Minimum System */}
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Recommended Minimum System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !recommendation ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
              <Sparkles className="h-6 w-6 mb-2" />
              <p className="text-sm">Recommendation unavailable. Ensure products are in the catalogue.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => router.push(`/dashboard/quotations/new?loadId=${id}`)}
              >
                Build a quotation manually
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <div className="rounded-lg bg-white p-3 border">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Daily usage</p>
                  <p className="text-lg font-bold text-slate-900">{recommendation.sizing.battery.requiredCapacityKwh} kWh</p>
                  <p className="text-[11px] text-slate-400">min. battery capacity</p>
                </div>
                <div className="rounded-lg bg-white p-3 border">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Backup</p>
                  <p className="text-lg font-bold text-slate-900">4 hr</p>
                  <p className="text-[11px] text-slate-400">{recommendation.sizing.battery.numberOfBatteries} × battery</p>
                </div>
                <div className="rounded-lg bg-white p-3 border">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Panels</p>
                  <p className="text-lg font-bold text-slate-900">{recommendation.sizing.solar.numberOfPanels}</p>
                  <p className="text-[11px] text-slate-400">{recommendation.sizing.solar.totalRequiredCapacityKw} kW</p>
                </div>
                <div className="rounded-lg bg-white p-3 border">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Inverter</p>
                  <p className="text-lg font-bold text-slate-900">{recommendation.sizing.inverter.totalInverterCapacity.toLocaleString()} VA</p>
                  <p className="text-[11px] text-slate-400">{recommendation.sizing.inverter.hybridRecommended ? 'Hybrid' : 'Standard'}</p>
                </div>
              </div>

              {/* Recommended products */}
              <div className="rounded-lg border bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Unit</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {recProducts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No matching products in the catalogue. Add products in the Product Catalogue first.
                  </div>
                ) : (
                  recProducts.map((p) => (
                    <div key={`${p.productId}-${p.itemType}`} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t text-sm">
                      <div className="col-span-6 flex items-center gap-2">
                        {getItemIcon(p.itemType)}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{p.description}</p>
                          <p className="text-xs text-slate-500">{getItemLabel(p.itemType)}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-slate-900">{p.quantity}</div>
                      <div className="col-span-2 text-right text-slate-600">R {Number(p.unitPrice).toFixed(2)}</div>
                      <div className="col-span-2 text-right font-semibold text-slate-900">R {Number(p.totalPrice).toFixed(2)}</div>
                    </div>
                  ))
                )}
                {recProducts.length > 0 && (
                  <div className="flex justify-between items-center px-4 py-3 border-t bg-slate-50 text-sm">
                    <span className="text-slate-600">Estimated equipment cost</span>
                    <span className="text-lg font-bold text-slate-900">R {Number(recommendation.totalEquipmentCost).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {recommendation.notes.length > 0 && (
                <div className="rounded-lg bg-slate-50 border p-3">
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                    {recommendation.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push(`/dashboard/quotations/new?loadId=${id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Build a Quotation from this System
                </Button>
              </div>
            </>
          )}
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