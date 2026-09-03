import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Users, FileText, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-sm text-gray-500">Manage your clients and send invoices with ease.</p>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm"
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Clients
          </Link>
        </div>
      </main>
    </div>
  );
}