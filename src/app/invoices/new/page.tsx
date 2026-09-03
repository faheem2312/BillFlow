import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClients } from "@/lib/actions/clients";
import Navbar from "@/components/Navbar";
import InvoiceForm from "../InvoiceForm";

export default async function NewInvoicePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <InvoiceForm clients={clients} />
      </main>
    </div>
  );
}
