import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getClients } from "@/lib/actions/clients";
import Navbar from "@/components/Navbar";
import InvoiceForm from "../InvoiceForm";

export default async function NewInvoicePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, clients] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true, logoUrl: true, email: true },
    }),
    getClients(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userEmail={user?.email || session.user.email || ""} userLogoUrl={user?.logoUrl} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <InvoiceForm clients={clients} userCurrency={user?.currency || "USD"} />
      </main>
    </div>
  );
}
