import { PrismaClient, InvoiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for BillFlow (8 Clients & 20 Invoices)...");

  // 1. Create/Ensure Demo User
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@billflow.com" },
    update: {
      passwordHash,
      businessName: "Apex Creative Studio",
      currency: "USD",
      invoicePrefix: "INV",
    },
    create: {
      email: "demo@billflow.com",
      passwordHash,
      businessName: "Apex Creative Studio",
      currency: "USD",
      invoicePrefix: "INV",
    },
  });

  // Clean existing demo user's data for a fresh seed
  await prisma.lineItem.deleteMany({
    where: { invoice: { userId: user.id } },
  });
  await prisma.invoice.deleteMany({
    where: { userId: user.id },
  });
  await prisma.client.deleteMany({
    where: { userId: user.id },
  });

  console.log(`👤 Demo User ready: ${user.email}`);

  // 2. Create 8 Clients
  const clientData = [
    {
      name: "Acme Corporation",
      email: "billing@acme.com",
      company: "Acme Global Inc.",
      address: "100 Innovation Way, Suite 400, San Francisco, CA",
      phone: "+1 (555) 019-2831",
    },
    {
      name: "Stark Media Group",
      email: "finance@starkmedia.com",
      company: "Stark Industries",
      address: "10880 Wilshire Blvd, Los Angeles, CA",
      phone: "+1 (555) 014-9922",
    },
    {
      name: "Cyberdyne Systems",
      email: "accounts@cyberdyne.io",
      company: "Cyberdyne Corp",
      address: "18144 El Camino Real, Sunnyvale, CA",
      phone: "+1 (555) 392-1044",
    },
    {
      name: "Wayne Enterprises",
      email: "ap@wayneenterprises.com",
      company: "Wayne Global",
      address: "1007 Mountain Drive, Gotham City, NY",
      phone: "+1 (555) 882-9901",
    },
    {
      name: "Umbrella Corp",
      email: "invoices@umbrella.org",
      company: "Umbrella Health & Bio",
      address: "500 Raccoon Street, Chicago, IL",
      phone: "+1 (555) 712-4099",
    },
    {
      name: "Hooli Tech",
      email: "billing@hooli.com",
      company: "Hooli Inc.",
      address: "105 Palo Alto Ave, Palo Alto, CA",
      phone: "+1 (555) 441-8902",
    },
    {
      name: "Oscorp Industries",
      email: "finance@oscorp.com",
      company: "Oscorp BioTech",
      address: "520 Madison Ave, New York, NY",
      phone: "+1 (555) 603-1288",
    },
    {
      name: "Pied Piper",
      email: "admin@piedpiper.com",
      company: "Pied Piper Compression",
      address: "21 Silver Terrace, San Jose, CA",
      phone: "+1 (555) 233-9011",
    },
  ];

  const clients = [];
  for (const c of clientData) {
    const created = await prisma.client.create({
      data: { ...c, userId: user.id },
    });
    clients.push(created);
  }

  console.log(`👥 Created ${clients.length} Demo Clients.`);

  // 3. Create 20 Invoices
  const statuses: InvoiceStatus[] = ["PAID", "PAID", "SENT", "SENT", "DRAFT", "PAID", "PAID", "SENT", "DRAFT", "PAID"];

  const sampleItems = [
    [
      { description: "Brand Identity Design & Guidelines", quantity: 1, rate: 2500 },
      { description: "Vector Logo Suite", quantity: 1, rate: 800 },
    ],
    [
      { description: "Next.js App Development", quantity: 40, rate: 95 },
      { description: "Database Schema Migration", quantity: 10, rate: 120 },
    ],
    [
      { description: "UI/UX Figma Design Kit", quantity: 1, rate: 1800 },
      { description: "Design System Documentation", quantity: 5, rate: 150 },
    ],
    [
      { description: "Monthly SEO & Analytics Retainer", quantity: 1, rate: 1200 },
      { description: "Content Optimization Audit", quantity: 1, rate: 450 },
    ],
    [
      { description: "Mobile App Wireframing", quantity: 20, rate: 85 },
      { description: "Interactive Prototype", quantity: 1, rate: 950 },
    ],
  ];

  const now = new Date();
  const invoicesCreated = [];

  for (let i = 1; i <= 20; i++) {
    const num = `INV-${String(i).padStart(4, "0")}`;
    const client = clients[(i - 1) % clients.length];
    const items = sampleItems[(i - 1) % sampleItems.length];

    // Issue date is in the past (e.g. 10 to 90 days ago)
    const issueDaysAgo = 90 - (i * 4);
    const issueDate = new Date(now.getTime() - issueDaysAgo * 24 * 60 * 60 * 1000);

    let status: InvoiceStatus = statuses[(i - 1) % statuses.length];
    let dueDate: Date;

    if (i === 3 || i === 8 || i === 14) {
      // Overdue: Issued 45 days ago, due 15 days ago (issueDate <= dueDate < now)
      status = "SENT";
      dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    } else if (status === "PAID") {
      dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    } else {
      dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const inv = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: client.id,
        number: num,
        issueDate,
        dueDate,
        status,
        taxRate: i % 2 === 0 ? 10 : 5,
        discount: i % 3 === 0 ? 5 : 0,
        notes: `Standard net 14 payment terms for ${client.name}. Thank you for your business!`,
        lineItems: {
          create: items,
        },
      },
    });

    invoicesCreated.push(inv);
  }

  console.log(`📄 Created ${invoicesCreated.length} Demo Invoices.`);
  console.log(`🔗 Sample Public Token for ${invoicesCreated[1].number}: ${invoicesCreated[1].publicToken}`);
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
