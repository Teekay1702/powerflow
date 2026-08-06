'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Battery, Zap, Puzzle, Search } from 'lucide-react';

export default function ProductsPage() {
  useAuth(true);
  const [activeTab, setActiveTab] = useState('panels');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useProducts(activeTab as any, search);
  const products = data?.data ?? [];

  const tabs = [
    { id: 'panels', label: 'Solar Panels', icon: Sun },
    { id: 'batteries', label: 'Batteries', icon: Battery },
    { id: 'inverters', label: 'Inverters', icon: Zap },
    { id: 'accessories', label: 'Accessories', icon: Puzzle },
  ];

  const getProductFields = (type: string, product: any) => {
    switch (type) {
      case 'panels':
        return (
          <>
            <TableCell>{product.wattage}W</TableCell>
            <TableCell>{product.efficiency}%</TableCell>
            <TableCell>{product.voltage}V</TableCell>
          </>
        );
      case 'batteries':
        return (
          <>
            <TableCell>{product.capacityAh}Ah</TableCell>
            <TableCell>{product.voltage}V</TableCell>
            <TableCell className="capitalize">{(product.chemistry || 'UNKNOWN').toLowerCase().replace(/_/g, ' ')}</TableCell>
          </>
        );
      case 'inverters':
        return (
          <>
            <TableCell>{product.capacityVa}VA</TableCell>
            <TableCell>{product.voltage}V</TableCell>
            <TableCell className="capitalize">{(product.inverterType || 'UNKNOWN').toLowerCase().replace(/_/g, ' ')}</TableCell>
          </>
        );
      default:
        return (
          <>
            <TableCell>{(product.category || 'UNKNOWN')}</TableCell>
            <TableCell>{(product.unit || 'UNKNOWN')}</TableCell>
            <TableCell>-</TableCell>
          </>
        );
    }
  };

  const getSpecHeaders = (type: string) => {
    switch (type) {
      case 'panels': return ['Wattage', 'Efficiency', 'Voltage'];
      case 'batteries': return ['Capacity', 'Voltage', 'Chemistry'];
      case 'inverters': return ['Capacity', 'Voltage', 'Type'];
      default: return ['Category', 'Unit', '-'];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage solar panels, batteries, inverters, and accessories</p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch(''); }}>
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={`Search ${tab.label.toLowerCase()}...`}
                    className="pl-9 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                    <tab.icon className="h-8 w-8 mb-2" />
                    <p>No {tab.label.toLowerCase()} in catalogue</p>
                    {search && <p className="text-sm">Try a different search term</p>}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Model</TableHead>
                        {getSpecHeaders(tab.id).map((h) => (
                          <TableHead key={h}>{h}</TableHead>
                        ))}
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                          <TableCell className="font-medium">{product.brand}</TableCell>
                          <TableCell>{product.model}</TableCell>
                          {getProductFields(tab.id, product)}
                          <TableCell>R {Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>{product.stockQuantity}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? 'success' : 'secondary'}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}