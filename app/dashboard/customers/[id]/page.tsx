'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, Phone, Mail, MapPin, FileText, Home, Building2, Factory } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get<any>(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const customer = data;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESIDENTIAL': return <Home className="h-5 w-5 text-blue-500" />;
      case 'COMMERCIAL': return <Building2 className="h-5 w-5 text-green-500" />;
      case 'INDUSTRIAL': return <Factory className="h-5 w-5 text-amber-500" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Customer not found</p>
        <Button onClick={() => router.push('/dashboard/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          {getTypeIcon(customer.type)}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.customerNumber}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Type</p>
              <Badge variant="outline" className="capitalize mt-1">{customer.type.toLowerCase()}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Property Type</p>
              <p className="font-medium capitalize">{customer.propertyType.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>

          {customer.companyName && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-slate-500">Company</p>
                <p className="font-medium">{customer.companyName}</p>
              </div>
            </>
          )}

          {customer.gpsCoordinates && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">GPS Coordinates</p>
                  <p className="font-medium">{customer.gpsCoordinates}</p>
                </div>
              </div>
            </>
          )}

          {customer.addresses && customer.addresses.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-slate-500 mb-2">Addresses</p>
                {customer.addresses.map((addr: any) => (
                  <div key={addr.id} className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span>{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</span>
                    {addr.isPrimary && <Badge variant="success" className="text-xs">Primary</Badge>}
                  </div>
                ))}
              </div>
            </>
          )}

          {customer.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-slate-500">Notes</p>
                <p className="text-sm text-slate-700">{customer.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/dashboard/quotations?customerId=${id}`}>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Quotations
          </Button>
        </Link>
        <Link href={`/dashboard/calculations?customerId=${id}`}>
          <Button variant="outline">
            View Calculations
          </Button>
        </Link>
      </div>
    </div>
  );
}