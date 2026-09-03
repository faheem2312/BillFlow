import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for BillFlow...");

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@billflow.com" },
    update: {},
    create: {
      email: "demo@billflow.com",
      passwordHash,
      businessName: "Apex Creative Studio",
      currency: "USD",
      invoicePrefix: "INV",
    },
  });

  console.log(`👤 Created Demo User: ${user.email} (ID: ${user.id})`);

  // 2. Create Demo Clients
  const client1 = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Acme Corporation",
      email: "billing@acme.com",
      company: "Acme Global Inc.",
      address: "100 Innovation Way, Suite 400, San Francisco, CA",
      phone: "+1 (555) 019-2831",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Stark Media Group",
      email: "finance@starkmedia.com",
      company: "Stark Industries",
      address: "10880 Wilshire Blvd, Los Angeles, CA",
      phone: "+1 (555) 014-9922",
    },
  });

  console.log(`👥 Created Demo Clients: ${client1.name}, ${client2.name}`);

  // 3. Create Demo Invoices
  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Invoice 1: PAID
  const invoicePaid = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client1.id,
      number: "INV-0001",
      issueDate: pastDate,
      dueDate: now,
      status: "PAID",
      taxRate: 10,
      discount: 5,
      notes: "Thank you for your business! Payment received via online portal.",
      lineItems: {
        create: [
          { description: "Brand Identity Design & Guidelines", quantity: 1, rate: 1500 },
          { description: "UI/UX Design System Component Library", quantity: 15, rate: 100 },
        ],
      },
    },
  });

  // Invoice 2: SENT (Active with Public Share Token for Demoing)
  const invoiceSent = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client2.id,
      number: "INV-0002",
      issueDate: now,
      dueDate: nextWeek,
      status: "SENT",
      taxRate: 8,
      discount: 0,
      notes: "Net 14 payment terms. Please submit payment via the share link.",
      lineItems: {
        create: [
          { description: "Next.js & Tailwind SaaS Development", quantity: 40, rate: 85 },
          { description: "PostgreSQL Database Architecture & Optimization", quantity: 10, rate: 110 },
        ],
      },
    },
  });

  console.log(`📄 Created Demo Invoices: ${invoicePaid.number} (PAID) and ${invoiceSent.number} (SENT)`);
  console.log(`🔗 Public Share Token for ${invoiceSent.number}: ${invoiceSent.publicToken}`);
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
