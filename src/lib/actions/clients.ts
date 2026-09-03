"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getClients() {
  const userId = await getAuthenticatedUserId();
  return await db.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(formData: FormData) {
  const userId = await getAuthenticatedUserId();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = (formData.get("company") as string) || null;
  const address = (formData.get("address") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  await db.client.create({
    data: {
      userId,
      name,
      email,
      company,
      address,
      phone,
    },
  });

  revalidatePath("/clients");
}

export async function updateClient(clientId: string, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = (formData.get("company") as string) || null;
  const address = (formData.get("address") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  // Verify ownership before update
  const existing = await db.client.findFirst({
    where: { id: clientId, userId },
  });

  if (!existing) {
    throw new Error("Client not found or unauthorized");
  }

  await db.client.update({
    where: { id: clientId },
    data: { name, email, company, address, phone },
  });

  revalidatePath("/clients");
}

export async function deleteClient(clientId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership before delete
  const existing = await db.client.findFirst({
    where: { id: clientId, userId },
  });

  if (!existing) {
    throw new Error("Client not found or unauthorized");
  }

  await db.client.delete({
    where: { id: clientId },
  });

  revalidatePath("/clients");
}