'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users, Clock, UserPlus } from 'lucide-react';

interface StatsData {
  totalQuotations: number;
  totalCustomers: number;
  pendingApprovals: number;
  totalEmployees: number;
  totalManagers: number;
}

interface StatsCardsProps {
  data?: StatsData;
  isLoading: boolean;
  isManager: boolean;
}

export function StatsCards({ data, isLoading, isManager }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Quotations',
      value: data?.totalQuotations ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Customers',
      value: data?.totalCustomers ?? 0,
      description: 'Active accounts',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Approvals',
      value: data?.pendingApprovals ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      alert: (data?.pendingApprovals ?? 0) > 0,
    },
    ...(isManager ? [{
      title: 'Team Members',
      value: (data?.totalEmployees ?? 0) + (data?.totalManagers ?? 0),
      description: `${data?.totalEmployees ?? 0} employees, ${data?.totalManagers ?? 0} managers`,
      icon: UserPlus,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    }] : []),
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={stat.alert ? 'border-amber-300' : undefined}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-md p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                {'description' in stat && <p className="text-xs text-slate-500">{stat.description}</p>}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}