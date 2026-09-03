import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import IncomeChart from "./IncomeChart";
import { DollarSign, Clock, AlertTriangle, FileText, Plus, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

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

      // Group income by Month (e.g., "Jan 2026")
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
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your financial performance and invoices</p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earned Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earned</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">${totalEarned.toFixed(2)}</h2>
              <p className="text-xs text-green-600 font-medium mt-1">Paid invoices</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Outstanding Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outstanding</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">${totalOutstanding.toFixed(2)}</h2>
              <p className="text-xs text-blue-600 font-medium mt-1">Sent invoices awaiting payment</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Overdue Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overdue</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">${totalOverdue.toFixed(2)}</h2>
              <p className="text-xs text-red-600 font-medium mt-1">Invoices past due date</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Income Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Income Over Time</h2>
          <IncomeChart data={chartData} />
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
            <Link
              href="/invoices"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No recent invoices. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-4 py-3">Number</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
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
                      <tr key={inv.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <Link href={`/invoices/${inv.id}`} className="hover:underline text-blue-600">
                            {inv.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{inv.client.name}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              statusColors[derivedStatus] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {derivedStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          ${total.toFixed(2)}
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