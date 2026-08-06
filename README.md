# PowerFlow Frontend

Next.js 14 application for the PowerFlow backup power solutions platform. Provides employee dashboards, electrical load calculations, quotation management, customer administration, and manager/admin employee onboarding portals.

## What's Inside

| Feature | Technology |
|---------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui + Radix UI |
| **State** | Zustand (auth) |
| **Data Fetching** | TanStack Query |
| **HTTP Client** | Axios with auto token refresh |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | Radix Toast |
| **Deploy** | Node.js / Vercel / Static export |

---

## Prerequisites

Before you begin, ensure you have installed:

1. **Node.js 20+** — [Download here](https://nodejs.org/)
2. **npm 10+** (comes with Node.js)
3. **The backend API running** — See [`powerflow-backend/README.md`](../powerflow-backend/README.md)

Verify your installations:

```bash
node --version    # Should print v20.x.x or higher
npm --version     # Should print 10.x.x or higher
```

---

## Getting Started

### Step 1: Ensure the backend is running

The frontend requires the backend API. Make sure it's running at `http://localhost:5000`.

```bash
cd ../powerflow-backend
npm run dev
```

### Step 2: Install dependencies

```bash
cd powerflow-frontend
npm install
```

### Step 3: Configure environment

```bash
cp .env.example .env.local
```

Your `.env.local` should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PowerFlow
```

If your backend runs on a different port, update `NEXT_PUBLIC_API_URL` accordingly.

### Step 4: Start the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Step 5: Log in

Use the default admin credentials:

- **Email:** `admin@powerflow.co.za`
- **Password:** `Admin@123456`

---

## Project Structure

```
powerflow-frontend/
├── package.json                  # Dependencies and scripts
├── next.config.js                # Next.js configuration with API proxy
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
├── .env.example                  # Environment variable template
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with QueryProvider
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── login/
│   │   └── page.tsx              # Employee login form
│   ├── forgot-password/
│   │   └── page.tsx              # Request password reset
│   ├── reset-password/
│   │   └── page.tsx              # Reset password with token
│   ├── verify-email/
│   │   └── page.tsx              # Create password from invite
│   └── dashboard/
│       ├── layout.tsx            # Dashboard shell with sidebar
│       ├── page.tsx              # Dashboard home with stats
│       ├── customers/
│       │   └── page.tsx          # Customer management
│       ├── calculations/
│       │   └── page.tsx          # Electrical load calculator
│       ├── quotations/
│       │   └── page.tsx          # Quotation management
│       ├── products/
│       │   └── page.tsx          # Product catalogue (Admin/Manager)
│       ├── settings/
│       │   └── page.tsx          # System settings (Admin/Manager)
│       └── employees/            # Employee portal (Admin/Manager)
│           ├── page.tsx          # Employee list with search
│           └── add/
│               └── page.tsx      # Add new employee form
├── components/
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── use-toast.ts              # Toast notification hook
├── services/
│   └── api.ts                    # Axios client with interceptors
├── store/
│   └── slices/
│       └── authStore.ts          # Zustand auth state with persistence
├── types/
│   └── index.ts                  # TypeScript domain types
├── schemas/
│   └── auth.ts                   # Zod validation schemas
├── lib/
│   └── utils.ts                  # cn() helper, formatters
└── providers/
    └── queryProvider.tsx         # TanStack Query setup
```

---

## Available Scripts

```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Production build
npm run start            # Production server (requires build first)
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier formatting
npm run type-check       # TypeScript type checking (no emit)
```

---

## Key Features

### Authentication Flow

| Step | Page | Description |
|------|------|-------------|
| 1 | `/login` | Employees enter email and password |
| 2 | `/verify-email?token=...` | New employees create password from invitation email |
| 3 | `/forgot-password` | Request a password reset link |
| 4 | `/reset-password?token=...` | Set new password from reset email |
| 5 | Auto | Axios interceptor refreshes expired access tokens silently |
| 6 | Auto | Logout clears tokens and redirects to login |

### Role-Based Navigation

The sidebar adapts based on the user's role:

| Page | Employee | Manager | Admin |
|------|----------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ |
| Calculations | ✅ | ✅ | ✅ |
| Quotations | ✅ | ✅ | ✅ |
| Employees | ❌ | ✅ | ✅ |
| Products | ❌ | ✅ | ✅ |
| Settings | ❌ | ✅ | ✅ |

### Employee Management Portal

**Available to:** Admin and Manager roles only

**Employee List** (`/dashboard/employees`):
- Search employees by name or email
- Status badges: Active, Pending Verification, Suspended, Inactive
- Role icons with color coding
- One-click resend verification email for pending employees
- Real-time list refresh after actions

**Add Employee** (`/dashboard/employees/add`):
- Form fields: First Name, Last Name, Email, Phone, Position, Role, Branch
- Role selection: Employee or Manager (Admins can create any role via API)
- Automatic verification email sent via Resend
- Success confirmation screen with employee details
- Option to add another employee or view all

### Electrical Load Calculator

**Page:** `/dashboard/calculations`

- Dynamic appliance list — add/remove appliances
- Per-appliance fields: name, quantity, power rating (W), surge (W), daily hours, essential/non-essential
- Property type selector: House, Apartment, Townhouse, Business, Office, Warehouse, High-rise, Industrial
- Submits to backend calculation engine
- Displays comprehensive results:
  - Total Connected Load (W)
  - Peak Load (W)
  - Daily / Monthly Consumption (kWh)
  - Surge Requirements (W)
  - Demand Factor

### API Integration

The `api.ts` service handles everything:

```typescript
import { api } from '@/services/api';

// GET with automatic auth header
const { data } = await api.get('/customers?page=1');

// POST
const { data } = await api.post('/calculations', { appliances: [...] });

// The client automatically:
// - Attaches Authorization: Bearer <token>
// - Refreshes expired tokens
// - Redirects to /login on auth failure
```

### State Management

Auth state is persisted in `localStorage` via Zustand:

```typescript
const { user, isAuthenticated, isLoading, logout } = useAuthStore();
```

- `user` — current user object (id, email, name, role, status)
- `isAuthenticated` — boolean auth state
- `isLoading` — initial auth check state
- `logout()` — clears tokens and state

### Notifications

Toast notifications are available throughout the app:

```typescript
import { toast } from '@/hooks/use-toast';

toast({
  title: 'Success',
  description: 'Employee created successfully',
});

toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

---

## Component Patterns

### Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth';

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

// In JSX:
<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('email')} />
  {form.formState.errors.email && (
    <p>{form.formState.errors.email.message}</p>
  )}
</form>
```

### Cards

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

### Tables

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Troubleshooting

### "Cannot find module '@/components/ui/...'"

Make sure your `tsconfig.json` paths are correct and restart the dev server:

```bash
npm run dev
```

### "API requests failing with 401"

The backend must be running and accessible. Check:

```bash
# Test backend health
curl http://localhost:5000/health

# Should return: {"success":true,"data":{"status":"healthy"}}
```

If the backend is on a different port, update `NEXT_PUBLIC_API_URL` in `.env.local`.

### "Port 3000 is already in use"

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or start on a different port
npm run dev -- --port 3001
```

### "Hydration mismatch error"

This can happen with Zustand persistence. The auth store handles this, but if you see errors:

```bash
# Clear localStorage and reload
# Open DevTools → Application → Local Storage → Clear
```

### "Tailwind classes not working"

```bash
# Restart the dev server to pick up Tailwind config changes
npm run dev
```

---

## Browser Support

- Chrome / Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

---

## License

UNLICENSED — Commercial software for PowerFlow Solutions.
