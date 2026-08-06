'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateEmployee } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Mail, CheckCircle } from 'lucide-react';

export default function AddEmployeePage() {
  useAuth(true);
  const router = useRouter();
  const createEmployee = useCreateEmployee();
  const [success, setSuccess] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<{ email: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    surname: '',
    phone: '',
    position: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER',
    branchId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createEmployee.mutateAsync(formData);
      setCreatedEmployee(response.data);
      setSuccess(true);
    } catch {
      // Error handled by mutation toast
    }
  };

  if (success && createdEmployee) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-900">Employee Created Successfully</h2>
            <p className="text-green-700">
              <strong>{createdEmployee.name}</strong> ({createdEmployee.email}) has been invited.
            </p>
            <p className="text-sm text-green-600">
              A verification email has been sent. The employee must click the link to create their password and activate their account.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                onClick={() => {
                  setSuccess(false);
                  setCreatedEmployee(null);
                  setFormData({ email: '', name: '', surname: '', phone: '', position: '', role: 'EMPLOYEE', branchId: '' });
                }}
                variant="outline"
              >
                Add Another Employee
              </Button>
              <Link href="/dashboard/employees">
                <Button>View All Employees</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-500">Create an account and send verification email</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Employee Details
          </CardTitle>
          <CardDescription>
            The employee will receive an email to activate their account and create a password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+27 82 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position / Job Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Sales Consultant"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as 'EMPLOYEE' | 'MANAGER' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch ID (Optional)</Label>
                <Input
                  id="branchId"
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  placeholder="Branch UUID"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/dashboard/employees">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? 'Creating...' : 'Create Employee & Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}