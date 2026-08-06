'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useEmailQuotation } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Download, Send, CheckCircle, Clock, XCircle, User } from 'lucide-react';

export default function QuotationDetailPage() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const emailMutation = useEmailQuotation();

  const { data, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await api.get<any>(`/quotations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const quotation = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="secondary">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="success">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      case 'CONVERTED': return <Badge variant="info">Converted to Invoice</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Quotation not found</p>
        <Button onClick={() => router.push('/dashboard/quotations')} className="mt-4">
          Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/quotations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{quotation.quotationNumber}</h1>
            <p className="text-sm text-slate-500">
              Created {new Date(quotation.createdAt).toLocaleDateString('en-ZA')} by {quotation.createdBy?.name} {quotation.createdBy?.surname}
            </p>
          </div>
        </div>
        {getStatusBadge(quotation.status)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-400" />
            <div>
              <p className="font-medium">{quotation.customer?.name}</p>
              <p className="text-sm text-slate-500">{quotation.customer?.customerNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {quotation.items?.length > 0 ? (
            <div className="space-y-3">
              {quotation.items.map((item: any, i: number) => (
                <div key={item.id || i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.itemType} × {item.quantity}</p>
                  </div>
                  <p className="font-medium text-sm">R {Number(item.totalPrice).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>R {Number(quotation.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Labour</span><span>R {Number(quotation.labourCost).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Installation</span><span>R {Number(quotation.installationCost).toFixed(2)}</span></div>
                {Number(quotation.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>-R {Number(quotation.discountAmount).toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">VAT ({(Number(quotation.vatRate) * 100).toFixed(0)}%)</span><span>R {Number(quotation.vatAmount).toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R {Number(quotation.grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No items in this quotation</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Valid Until</span>
            <span>{new Date(quotation.validityDate).toLocaleDateString('en-ZA')}</span>
          </div>
          <div>
            <span className="text-slate-500">Payment Terms</span>
            <p className="mt-1">{quotation.paymentTerms}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {quotation.pdfUrl && (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => emailMutation.mutate(id)}
          disabled={emailMutation.isPending}
        >
          <Send className="h-4 w-4 mr-2" />
          {emailMutation.isPending ? 'Sending...' : 'Email Customer'}
        </Button>
      </div>
    </div>
  );
}