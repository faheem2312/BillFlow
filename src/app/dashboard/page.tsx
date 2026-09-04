import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import IncomeChart from "./IncomeChart";
import { DollarSign, Clock, AlertTriangle, Plus, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user for logo, businessName, and currency preference
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { logoUrl: true, email: true, businessName: true, currency: true },
  });

  const getCurrencySymbol = (curr?: string) => {
    switch (curr) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "CAD": return "CA$";
      case "AUD": return "AU$";
      default: return "$";
    }
  };

  const symbol = getCurrencySymbol(user?.currency);

  // Fetch all user invoices
  const invoices = await db.invoice.findMany({
    where: { userId },
    include: {
      client: true,
      lineItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  let totalEarned = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;

  // Monthly income map for chart
  const monthlyIncome: Record<string, number> = {};

  // Process metrics & chart data
  invoices.forEach((inv) => {
    const subtotal = inv.lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const taxAmount = (subtotal * inv.taxRate) / 100;
    const discountAmount = (subtotal * inv.discount) / 100;
    const total = subtotal + taxAmount - discountAmount;

    const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < now;

    if (inv.status === "PAID") {
      totalEarned += total;

      // Group income by Month (e.g., "Jan 26")
      const monthYear = new Date(inv.issueDate).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + total;
    } else if (inv.status === "SENT") {
      if (isOverdue) {
        totalOverdue += total;
      } else {
        totalOutstanding += total;
      }
    }
  });

  // Convert monthly income object to array for Recharts
  const chartData = Object.keys(monthlyIncome).map((m) => ({
    month: m,
    income: monthlyIncome[m],
  }));

  // Top 5 recent invoices
  const recentInvoices = invoices.slice(0, 5);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-300",
    SENT: "bg-blue-100 text-blue-800 border-blue-300 font-bold",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    OVERDUE: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar
        userEmail={user?.email || session.user.email || ""}
        businessName={user?.businessName}
        userLogoUrl={user?.logoUrl}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Dashboard</h1>
            <p className="text-sm text-neutral-500 font-medium">Overview of your financial performance and invoices</p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earned Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Earned</p>
              <h2 className="text-3xl font-black text-black mt-1">{symbol}{totalEarned.toFixed(2)}</h2>
              <p className="text-xs text-neutral-600 font-bold mt-1">Paid invoices</p>
            </div>
            <div className="p-3 bg-black text-white rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Outstanding Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Outstanding</p>
              <h2 className="text-3xl font-black text-black mt-1">{symbol}{totalOutstanding.toFixed(2)}</h2>
              <p className="text-xs text-neutral-600 font-bold mt-1">Sent invoices awaiting payment</p>
            </div>
            <div className="p-3 bg-neutral-100 border border-neutral-300 text-black rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Overdue Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Overdue</p>
              <h2 className="text-3xl font-black text-black mt-1">{symbol}{totalOverdue.toFixed(2)}</h2>
              <p className="text-xs text-neutral-600 font-bold mt-1">Invoices past due date</p>
            </div>
            <div className="p-3 bg-neutral-200 text-black rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Income Chart Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-black">Income Over Time</h2>
          <IncomeChart data={chartData} currencySymbol={symbol} />
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-black">Recent Invoices</h2>
            <Link
              href="/invoices"
              className="inline-flex items-center text-sm font-bold text-black hover:underline"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-500 font-medium">
              No recent invoices. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-600 uppercase">
                    <th className="px-4 py-3 text-center">Number</th>
                    <th className="px-4 py-3 text-center">Client</th>
                    <th className="px-4 py-3 text-center">Due Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm">
                  {recentInvoices.map((inv) => {
                    const subtotal = inv.lineItems.reduce(
                      (acc, item) => acc + item.quantity * item.rate,
                      0
                    );
                    const taxAmount = (subtotal * inv.taxRate) / 100;
                    const discountAmount = (subtotal * inv.discount) / 100;
                    const total = subtotal + taxAmount - discountAmount;

                    const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < now;
                    const derivedStatus = isOverdue ? "OVERDUE" : inv.status;

                    return (
                      <tr key={inv.id} className="hover:bg-neutral-50 transition">
                        <td className="px-4 py-3 text-center font-black text-black">
                          <Link href={`/invoices/${inv.id}`} className="hover:underline text-black">
                            {inv.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center text-neutral-700 font-medium">{inv.client.name}</td>
                        <td className="px-4 py-3 text-center text-neutral-500">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              statusColors[derivedStatus] || "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {derivedStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-black">
                          {symbol}{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}