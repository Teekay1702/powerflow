'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Home, Building2, Factory, Users, ArrowRight } from 'lucide-react';
import type { Customer } from '@/types';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESIDENTIAL': return <Home className="h-4 w-4 text-blue-500" />;
      case 'COMMERCIAL': return <Building2 className="h-4 w-4 text-green-500" />;
      case 'INDUSTRIAL': return <Factory className="h-4 w-4 text-amber-500" />;
      default: return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTypeIcon(customer.type)}
                <span className="text-xs capitalize">{customer.type.toLowerCase()}</span>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {customer.name}
              {customer.companyName && (
                <p className="text-xs text-slate-500">{customer.companyName}</p>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">{customer.phone}</div>
              {customer.email && <div className="text-xs text-slate-500">{customer.email}</div>}
            </TableCell>
            <TableCell className="capitalize text-sm">{customer.propertyType.toLowerCase().replace('_', ' ')}</TableCell>
            <TableCell>
              <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/customers/${customer.id}`}>
                <span className="text-sm text-blue-600 hover:underline flex items-center justify-end gap-1">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}