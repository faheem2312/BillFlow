import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getClients } from "@/lib/actions/clients";
import Navbar from "@/components/Navbar";
import InvoiceForm from "../../InvoiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, invoice, clients] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true, logoUrl: true, email: true, businessName: true },
    }),
    db.invoice.findFirst({
      where: { id, userId: session.user.id },
      include: {
        lineItems: true,
      },
    }),
    getClients(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar
        userEmail={user?.email || session.user.email || ""}
        businessName={user?.businessName}
        userLogoUrl={user?.logoUrl}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <InvoiceForm
          clients={clients}
          userCurrency={user?.currency || "USD"}
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
