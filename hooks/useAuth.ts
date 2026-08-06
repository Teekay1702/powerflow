import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/slices/authStore';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/verify-email'];
const MANAGER_PATHS = ['/dashboard/employees', '/dashboard/products', '/dashboard/settings'];

export function useAuth(requireManager = false) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

    // Not authenticated and on protected route
    if (!isAuthenticated && !isPublic) {
      router.push('/login');
      return;
    }

    // Authenticated but on login page
    if (isAuthenticated && isPublic) {
      router.push('/dashboard');
      return;
    }

    // Manager-only routes
    if (requireManager && user?.role === 'EMPLOYEE') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router, user, requireManager]);

  return { user, isAuthenticated, isLoading };
}