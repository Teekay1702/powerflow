'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/slices/authStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Clock,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const mainStats = [
    {
      title: 'Total Quotations',
      value: stats?.totalQuotations ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers ?? 0,
      description: 'Active accounts',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      alert: (stats?.pendingApprovals ?? 0) > 0,
    },
    {
      title: 'Team Members',
      value: (stats?.totalEmployees ?? 0) + (stats?.totalManagers ?? 0),
      description: `${stats?.totalEmployees ?? 0} employees, ${stats?.totalManagers ?? 0} managers`,
      icon: UserPlus,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      managerOnly: true,
    },
  ];

  const quickActions = [
    {
      title: 'New Calculation',
      description: 'Create a load profile and size a system',
      href: '/dashboard/calculations',
      icon: Zap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'New Customer',
      description: 'Register a residential or commercial customer',
      href: '/dashboard/customers',
      icon: Users,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'New Quotation',
      description: 'Generate a professional PDF quote',
      href: '/dashboard/quotations',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
    },
    ...(isManager
      ? [
          {
            title: 'Add Employee',
            description: 'Onboard a new team member',
            href: '/dashboard/employees/add',
            icon: UserPlus,
            color: 'bg-amber-50 text-amber-600',
          },
        ]
      : []),
  ];

  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-slate-500">
            Here is what is happening with your power solutions today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user?.role === 'ADMIN' ? 'destructive' : user?.role === 'MANAGER' ? 'secondary' : 'default'}>
            <Shield className="h-3 w-3 mr-1" />
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats
          .filter((s) => !s.managerOnly || isManager)
          .map((stat) => (
            <Card key={stat.title} className={stat.alert ? 'border-amber-300' : undefined}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-md p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.description && (
                      <p className="text-xs text-slate-500">{stat.description}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group block rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Quotations awaiting manager approval</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (stats?.pendingApprovals ?? 0) > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700">
                  {stats?.pendingApprovals} quotation(s) need your attention
                </p>
                <Link href="/dashboard/quotations">
                  <span className="text-sm text-blue-600 hover:underline">View quotations →</span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No pending approvals. All caught up!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
            <CardDescription>Platform health and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">API Status</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Authentication</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Your Role</span>
              <Badge variant="outline">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}