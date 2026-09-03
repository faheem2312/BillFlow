import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import InvoiceDetailClient from "./InvoiceDetailClient";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const invoice = await db.invoice.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      client: true,
      lineItems: true,
      user: {
        select: {
          businessName: true,
          logoUrl: true,
          email: true,
          currency: true,
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Derive overdue status
  const isOverdue = invoice.status === "SENT" && new Date(invoice.dueDate) < new Date();
  const derivedStatus = isOverdue ? "OVERDUE" : invoice.status;

  const serializableInvoice = {
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    derivedStatus,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <Navbar userEmail={session.user.email || ""} />
      </div>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0">
        <InvoiceDetailClient invoice={serializableInvoice} />
      </main>
    </div>
  );
}
