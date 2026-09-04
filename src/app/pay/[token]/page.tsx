import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import PayInvoiceClient from "./PayInvoiceClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { token } = await params;
  const invoice = await db.invoice.findUnique({
    where: { publicToken: token },
    include: {
      client: true,
      lineItems: true,
      user: {
        select: {
          businessName: true,
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
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <PayInvoiceClient invoice={serializableInvoice} />
    </div>
  );
}
