"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthenticatedUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export interface LineItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceInput {
  clientId: string;
  issueDate: string;
  dueDate: string;
  taxRate: number;
  discount: number;
  notes?: string;
  lineItems: LineItemInput[];
}

export async function createInvoice(input: CreateInvoiceInput) {
  const userId = await getAuthenticatedUserId();

  if (!input.clientId) {
    throw new Error("Please select a client");
  }

  if (!input.lineItems || input.lineItems.length === 0) {
    throw new Error("Invoice must have at least one line item");
  }

  // Fetch user settings for invoice prefix
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { invoicePrefix: true },
  });

  const prefix = user?.invoicePrefix || "INV";

  // Calculate next invoice number
  const count = await db.invoice.count({
    where: { userId },
  });

  const nextNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      userId,
      clientId: input.clientId,
      number: nextNumber,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      taxRate: input.taxRate || 0,
      discount: input.discount || 0,
      notes: input.notes || null,
      status: "DRAFT",
      lineItems: {
        create: input.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoice(id: string, input: CreateInvoiceInput) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership
  const existing = await db.invoice.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Invoice not found or unauthorized");
  }

  // Delete existing line items and re-create updated ones
  await db.$transaction([
    db.lineItem.deleteMany({
      where: { invoiceId: id },
    }),
    db.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        taxRate: input.taxRate || 0,
        discount: input.discount || 0,
        notes: input.notes || null,
        lineItems: {
          create: input.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function deleteInvoice(id: string) {
  const userId = await getAuthenticatedUserId();

  const existing = await db.invoice.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Invoice not found or unauthorized");
  }

  await db.invoice.delete({
    where: { id },
  });

  revalidatePath("/invoices");
}
