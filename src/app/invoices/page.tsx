import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, FileText, Search, Eye } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    clientId?: string;
    sort?: string;
  }> | {
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
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const search = resolvedSearchParams?.search || "";
  const statusFilter = resolvedSearchParams?.status || "";
  const clientIdFilter = resolvedSearchParams?.clientId || "";
  const sort = resolvedSearchParams?.sort || "newest";

  // Build Prisma where clause
  const where: any = { userId };

  if (clientIdFilter) {
    where.clientId = clientIdFilter;
  }

  if (search.trim()) {
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

  // Fetch user currency preference, clients, and invoices concurrently using Promise.all
  const [user, clients, rawInvoices] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { currency: true, logoUrl: true, businessName: true },
    }),
    db.client.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
    db.invoice.findMany({
      where,
      include: {
        client: true,
        lineItems: true,
      },
      orderBy:
        sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
    }),
  ]);

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
    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-300",
    SENT: "bg-blue-100 text-blue-800 border-blue-300 font-bold",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    OVERDUE: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar
        userEmail={session.user.email || ""}
        businessName={user?.businessName}
        userLogoUrl={user?.logoUrl}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Invoices</h1>
            <p className="text-sm text-neutral-500 font-medium">
              Create, track, and manage all your client invoices
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </div>

        {/* Server Search & Filter Bar */}
        <form method="GET" className="bg-white p-4 rounded-2xl border-2 border-neutral-200 shadow-sm gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search number or client..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full py-2 px-3 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full py-2 px-3 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Invoice Table / Empty State */}
        {invoices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-neutral-200 shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-bold text-black">No invoices found</h3>
            <p className="mt-1 text-sm text-neutral-500 font-medium">
              {search || statusFilter || clientIdFilter
                ? "Try adjusting your search or filters."
                : "Get started by creating your first invoice."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  <th className="px-6 py-3 text-center">Number</th>
                  <th className="px-6 py-3 text-center">Client</th>
                  <th className="px-6 py-3 text-center">Issue Date</th>
                  <th className="px-6 py-3 text-center">Due Date</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Amount</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4 text-center font-black text-black">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline text-black">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-700 font-semibold">{inv.client.name}</td>
                    <td className="px-6 py-4 text-center text-neutral-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          statusColors[inv.derivedStatus] || "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {inv.derivedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-black">
                      {symbol}{inv.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition"
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
