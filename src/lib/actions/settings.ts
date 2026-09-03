"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const businessName = (formData.get("businessName") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const currency = (formData.get("currency") as string) || "USD";
  const invoicePrefix = (formData.get("invoicePrefix") as string) || "INV";

  await db.user.update({
    where: { id: userId },
    data: {
      businessName,
      logoUrl,
      currency,
      invoicePrefix,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
}
