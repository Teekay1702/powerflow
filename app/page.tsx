import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            PowerFlow Solutions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Enterprise-grade backup power calculation and quotation platform.
            Solar panels, batteries, inverters, and complete energy systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-slate-500 mt-1">Backend Calculations</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">PDF</div>
            <div className="text-sm text-slate-500 mt-1">Quotation Generation</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">RBAC</div>
            <div className="text-sm text-slate-500 mt-1">Role-Based Access</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Employee Login
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400">
            Built for residential, commercial, and industrial power solutions.
          </p>
        </div>
      </div>
    </main>
  );
}
