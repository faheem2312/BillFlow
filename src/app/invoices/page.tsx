import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, FileText, Search, Eye, Filter } from "lucide-react";

interface PageProps {
  searchParams: {
    search?: string;
    status?: string;
    clientId?: string;
    sort?: string;
  };
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const clientIdFilter = searchParams.clientId || "";
  const sort = searchParams.sort || "newest";

  // Build Prisma where clause
  const where: any = { userId };

  if (clientIdFilter) {
    where.clientId = clientIdFilter;
  }

  if (search) {
    where.OR = [
      { number: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
      { client: { company: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Handle stored status filtering
  if (statusFilter && statusFilter !== "OVERDUE") {
    where.status = statusFilter;
  }

  // Fetch clients for dropdown filter
  const clients = await db.client.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  // Fetch invoices with line items and client details
  const rawInvoices = await db.invoice.findMany({
    where,
    include: {
      client: true,
      lineItems: true,
    },
    orderBy:
      sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" },
  });

  // Process derived overdue status and total amounts on server
  const now = new Date();
  let invoices = rawInvoices.map((inv) => {
    const subtotal = inv.lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const taxAmount = (subtotal * inv.taxRate) / 100;
    const discountAmount = (subtotal * inv.discount) / 100;
    const total = subtotal + taxAmount - discountAmount;

    const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < now;
    const derivedStatus = isOverdue ? "OVERDUE" : inv.status;

    return {
      ...inv,
      total,
      derivedStatus,
    };
  });

  // Apply derived OVERDUE status filter if selected
  if (statusFilter === "OVERDUE") {
    invoices = invoices.filter((inv) => inv.derivedStatus === "OVERDUE");
  }

  // Apply amount-based sorting if selected
  if (sort === "highest") {
    invoices.sort((a, b) => b.total - a.total);
  } else if (sort === "lowest") {
    invoices.sort((a, b) => a.total - b.total);
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500">
              Create, track, and manage all your client invoices
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </div>

        {/* Server Search & Filter Bar */}
        <form method="GET" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search number or client..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <select
              name="clientId"
              defaultValue={clientIdFilter}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sort}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>

            <button
              type="submit"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Invoice Table / Empty State */}
        {invoices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter || clientIdFilter
                ? "Try adjusting your search or filters."
                : "Get started by creating your first invoice."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Number</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline text-blue-600">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{inv.client.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusColors[inv.derivedStatus] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.derivedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${inv.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
