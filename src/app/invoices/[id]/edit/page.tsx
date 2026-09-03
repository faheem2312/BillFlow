import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getClients } from "@/lib/actions/clients";
import Navbar from "@/components/Navbar";
import InvoiceForm from "../../InvoiceForm";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const invoice = await db.invoice.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      lineItems: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <InvoiceForm
          clients={clients}
          initialData={{
            id: invoice.id,
            clientId: invoice.clientId,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            taxRate: invoice.taxRate,
            discount: invoice.discount,
            notes: invoice.notes,
            lineItems: invoice.lineItems.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              rate: i.rate,
            })),
          }}
        />
      </main>
    </div>
  );
}
