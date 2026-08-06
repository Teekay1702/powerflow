'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/slices/authStore';
// Toaster is rendered in root layout
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  Settings,
  LogOut,
  Sun,
  Battery,
  Zap,
  Shield,
  UserPlus,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/calculations', label: 'Calculations', icon: Calculator },
    { href: '/dashboard/quotations', label: 'Quotations', icon: FileText },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
    navItems.push(
      { href: '/dashboard/employees', label: 'Employees', icon: UserPlus },
      { href: '/dashboard/products', label: 'Products', icon: Zap },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings }
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold">PowerFlow</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Backup Power Solutions</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-white">{user?.name} {user?.surname}</p>
            <div className="flex items-center gap-1 mt-1">
              {user?.role === 'ADMIN' && <Shield className="h-3 w-3 text-amber-400" />}
              <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              Welcome back, {user?.name || 'User'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Battery className="h-4 w-4" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}