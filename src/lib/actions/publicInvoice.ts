"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function markInvoiceAsPaid(publicToken: string) {
  const invoice = await db.invoice.findUnique({
    where: { publicToken },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await db.invoice.update({
    where: { id: invoice.id },
    data: { status: "PAID" },
  });

  revalidatePath(`/pay/${publicToken}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function markInvoiceAsSent(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existing = await db.invoice.findFirst({
    where: { id: invoiceId, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Invoice not found or unauthorized");
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: { status: "SENT" },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function sendInvoiceEmail(invoiceId: string, origin: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, userId: session.user.id },
    include: {
      client: true,
      user: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found or unauthorized");
  }

  const shareUrl = `${origin}/pay/${invoice.publicToken}`;

  // If RESEND_API_KEY is present in environment, attempt real email send
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "BillFlow <onboarding@resend.dev>",
        to: [invoice.client.email],
        subject: `Invoice ${invoice.number} from ${invoice.user.businessName || invoice.user.email}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Invoice ${invoice.number}</h2>
            <p>Hi ${invoice.client.name},</p>
            <p>You have received a new invoice from <strong>${invoice.user.businessName || invoice.user.email}</strong>.</p>
            <p><a href="${shareUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View & Pay Invoice</a></p>
            <p>Or open link: <a href="${shareUrl}">${shareUrl}</a></p>
          </div>
        `,
      });
    } catch (err) {
      console.warn("Resend email failed, fallback to marking as sent:", err);
    }
  }

  // Update invoice status to SENT
  await db.invoice.update({
    where: { id: invoiceId },
    data: { status: "SENT" },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return { shareUrl };
}
