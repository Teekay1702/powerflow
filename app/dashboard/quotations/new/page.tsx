'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Plus,
    Trash2,
    FileText,
    Package,
    Zap,
    Battery,
    Sun,
    Wrench,
    Calculator,
} from 'lucide-react';

interface LineItem {
    id: string;
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface NewQuotationFormData {
    customers: any[];
    calculations: any[];
    products: {
        panels: any[];
        batteries: any[];
        inverters: any[];
        accessories: any[];
    };
}

export default function NewQuotationPage() {
    useAuth();
    const router = useRouter();
    const createQuotation = useCreateQuotation();

    const { data: formData, isLoading } = useQuery<NewQuotationFormData>({
        queryKey: ['quotation-new-form'],
        queryFn: async () => {
            const response = await api.get<any>('/quotations/new');
            return response.data;
        },
    });

    const [customerId, setCustomerId] = useState('');
    const [electricalLoadId, setElectricalLoadId] = useState('');
    const [items, setItems] = useState<LineItem[]>([]);
    const [labourCost, setLabourCost] = useState(0);
    const [installationCost, setInstallationCost] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [notes, setNotes] = useState('');
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productTab, setProductTab] = useState<'panels' | 'batteries' | 'inverters' | 'accessories'>('panels');

    const vatRate = 0.15;

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const taxableAmount = subtotal + labourCost + installationCost - discountAmount;
    const vatAmount = taxableAmount * vatRate;
    const grandTotal = taxableAmount + vatAmount;

    const addItem = (item: LineItem) => {
        setItems((prev) => [...prev, item]);
        setProductDialogOpen(false);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const addCustomItem = () => {
        const id = `custom-${Date.now()}`;
        setItems((prev) => [
            ...prev,
            { id, itemType: 'LABOUR', description: '', quantity: 1, unitPrice: 0 },
        ]);
    };

    const updateItem = (id: string, updates: Partial<LineItem>) => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    };

    const handleSubmit = async () => {
        if (!customerId) {
            toast({ title: 'Customer required', description: 'Please select a customer.', variant: 'destructive' });
            return;
        }
        if (items.length === 0) {
            toast({ title: 'Items required', description: 'Add at least one line item.', variant: 'destructive' });
            return;
        }

        const payload = {
            customerId,
            electricalLoadId: electricalLoadId || undefined,
            items: items.map((item) => ({
                itemType: item.itemType,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            labourCost,
            installationCost,
            discountPercentage,
            notes: notes || undefined,
        };

        createQuotation.mutate(payload, {
            onSuccess: (data: any) => {
                if (data?.data?.id) {
                    router.push(`/dashboard/quotations/${data.data.id}`);
                } else {
                    router.push('/dashboard/quotations');
                }
            },
        });
    };

    const getProductIcon = (type: string) => {
        switch (type) {
            case 'PANEL': return <Sun className="h-4 w-4" />;
            case 'BATTERY': return <Battery className="h-4 w-4" />;
            case 'INVERTER': return <Zap className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-4xl">
                <Skeleton className="h-8 w-48" />
                <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
            </div>
        );
    }

    const customers = formData?.customers ?? [];
    const calculations = formData?.calculations ?? [];
    const products = formData?.products ?? { panels: [], batteries: [], inverters: [], accessories: [] };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/quotations')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">New Quotation</h1>
                        <p className="text-sm text-slate-500">Build a new quotation for your customer</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={createQuotation.isPending}>
                    <FileText className="h-4 w-4 mr-2" />
                    {createQuotation.isPending ? 'Creating...' : 'Create Quotation'}
                </Button>
            </div>

            {/* Customer & Calculation */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer & Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer *</Label>
                            <Select value={customerId} onValueChange={setCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} ({c.customerNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Linked Calculation (optional)</Label>
                            <Select value={electricalLoadId} onValueChange={setElectricalLoadId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a load calculation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {calculations.map((calc: any) => (
                                        <SelectItem key={calc.id} value={calc.id}>
                                            {calc.name} — {calc.totalConnectedLoad}W
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Line Items</CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Package className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add Product from Catalogue</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {(['panels', 'batteries', 'inverters', 'accessories'] as const).map((tab) => (
                                            <Button
                                                key={tab}
                                                variant={productTab === tab ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setProductTab(tab)}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {products[productTab]?.length === 0 && (
                                            <p className="text-sm text-slate-500">No products available</p>
                                        )}
                                        {products[productTab]?.map((p: any) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                                onClick={() =>
                                                    addItem({
                                                        id: `${p.id}-${Date.now()}`,
                                                        itemType: productTab === 'panels' ? 'PANEL' : productTab === 'batteries' ? 'BATTERY' : productTab === 'inverters' ? 'INVERTER' : 'ACCESSORY',
                                                        description: `${p.brand || p.name} ${p.model || ''}`,
                                                        quantity: 1,
                                                        unitPrice: Number(p.price),
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getProductIcon(productTab === 'panels' ? 'PANEL' : productTab === 'batteries' ? 'BATTERY' : productTab === 'inverters' ? 'INVERTER' : 'ACCESSORY')}
                                                    <div>
                                                        <p className="font-medium text-sm">{p.brand || p.name} {p.model || ''}</p>
                                                        <p className="text-xs text-slate-500">{p.sku}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-sm">R {Number(p.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={addCustomItem}>
                            <Wrench className="h-4 w-4 mr-2" />
                            Add Custom
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-500 border-2 border-dashed rounded-lg">
                            <Package className="h-8 w-8 mb-2" />
                            <p>No items added yet</p>
                            <p className="text-sm">Add products from the catalogue or custom line items</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-3 items-start p-3 border rounded-lg bg-slate-50">
                                    <div className="col-span-3">
                                        <Label className="text-xs">Type</Label>
                                        <Select
                                            value={item.itemType}
                                            onValueChange={(v) => updateItem(item.id, { itemType: v })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PANEL">Panel</SelectItem>
                                                <SelectItem value="BATTERY">Battery</SelectItem>
                                                <SelectItem value="INVERTER">Inverter</SelectItem>
                                                <SelectItem value="ACCESSORY">Accessory</SelectItem>
                                                <SelectItem value="LABOUR">Labour</SelectItem>
                                                <SelectItem value="INSTALLATION">Installation</SelectItem>
                                                <SelectItem value="CABLE">Cable</SelectItem>
                                                <SelectItem value="BREAKER">Breaker</SelectItem>
                                                <SelectItem value="MOUNTING_KIT">Mounting Kit</SelectItem>
                                                <SelectItem value="FUSE">Fuse</SelectItem>
                                                <SelectItem value="DB_BOARD">DB Board</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-4">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs">Unit Price</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end pt-5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="col-span-12 text-right text-sm font-medium">
                                        R {(item.quantity * item.unitPrice).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Costs & Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Labour Cost (R)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={labourCost}
                                onChange={(e) => setLabourCost(Math.max(0, Number(e.target.value)))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Installation Cost (R)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={installationCost}
                                onChange={(e) => setInstallationCost(Math.max(0, Number(e.target.value)))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Discount (%)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <textarea
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Any special notes for this quotation..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span>R {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Labour</span>
                            <span>R {labourCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Installation</span>
                            <span>R {installationCost.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({discountPercentage}%)</span>
                                <span>-R {discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">VAT ({(vatRate * 100).toFixed(0)}%)</span>
                            <span>R {vatAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>R {grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="pt-2">
                            <Button className="w-full" onClick={handleSubmit} disabled={createQuotation.isPending}>
                                <FileText className="h-4 w-4 mr-2" />
                                {createQuotation.isPending ? 'Creating Quotation...' : 'Create Quotation'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
