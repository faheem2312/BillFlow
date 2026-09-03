# 🧾 BillFlow — Modern Invoicing SaaS for Freelancers

BillFlow is a full-stack, production-ready invoicing SaaS application built for freelancers and small studios. It replaces Word documents and spreadsheets with automated line-item calculations, secret public share links, dynamic overdue tracking, customizable business branding, and financial analytics.

---

## 🔑 Instant Demo Login Credentials

Try the live application immediately without creating an account:

* **Demo Email**: `demo@billflow.com`
* **Demo Password**: `Password123!`
* **Pre-seeded Public Invoice Link**: Available in dashboard under invoice `#INV-0002`

---

## ✨ Features Built

1. **Authentication & Multi-Tenant Security**: Sign up, login, and logout using Auth.js (NextAuth v5) with bcrypt password hashing and strict `userId` tenant data isolation.
2. **Client Management (CRUD)**: Add, edit, delete, and inspect client profiles (name, email, company, address, phone) with instant loading, empty, and error states.
3. **Dynamic Invoice Builder**: Multi-line item editor with live calculations for subtotal, custom tax rates (%), percentage discounts (%), and grand totals.
4. **Auto-Generated Invoice Numbers**: Custom prefix formatting (`INV-0001`, `BILL-0001`) saved per user preference.
5. **Server-Side Filtering, Search & Sorting**: Search by client or invoice number, filter by status (`DRAFT`, `SENT`, `PAID`, `OVERDUE`) and client ID, and sort by issue date or total amount.
6. **Print & PDF Export**: Print-optimized document view with `@media print` CSS hiding UI controls for clean browser `window.print()` rendering.
7. **No-Login Public Share Link & Mock Payment**: Public route `/pay/[token]` allowing clients to view invoice details and click **"Pay Now"** (simulated payment checkout flipping status to `PAID`).
8. **Email Integration**: Integrated with Resend API for sending invoices directly to client inbox.
9. **Financial Dashboard & Analytics**: Metric cards for **Total Earned**, **Total Outstanding**, and **Total Overdue** alongside interactive Recharts income trend charts.
10. **Business Settings & Branding**: Upload custom logo via Vercel Blob, set currency symbols (`$`, `€`, `£`, `₹`), and configure invoice prefix.
11. **Derived Overdue Status**: Invoices past due date automatically display as `OVERDUE` without manual record mutation.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers, TypeScript)
* **Styling**: Tailwind CSS + `lucide-react` icons
* **Database & ORM**: PostgreSQL (Neon) + Prisma ORM
* **Auth**: Auth.js (NextAuth v5) with Credentials provider + bcryptjs
* **Email**: Resend API
* **Charts**: Recharts
* **Storage**: Vercel Blob (Logo uploads)
* **Deployment**: Vercel

---

## 🚀 Local Development Setup

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/billflow.git
cd billflow
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# PostgreSQL Database Connection String (Neon / Supabase)
DATABASE_URL="postgresql://user:password@ep-cool-db.neon.tech/neondb?sslmode=require"

# Auth.js (NextAuth) Secret Key
AUTH_SECRET="your-super-secret-key-32-chars-minimum"

# Optional: Resend Email API Key
RESEND_API_KEY="re_123456789"

# Optional: Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_123456789"
```

### 3. Push Database Schema & Seed Demo Data
```bash
npx prisma db push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Database Schema Overview (Prisma)

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  businessName   String?
  logoUrl        String?
  currency       String    @default("USD")
  invoicePrefix  String    @default("INV")
  clients        Client[]
  invoices       Invoice[]
  createdAt      DateTime  @default(now())
}

model Client {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  name      String
  email     String
  company   String?
  address   String?
  phone     String?
  invoices  Invoice[]
  createdAt DateTime  @default(now())
}

model Invoice {
  id           String        @id @default(cuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  clientId     String
  client       Client        @relation(fields: [clientId], references: [id])
  number       String
  issueDate    DateTime
  dueDate      DateTime
  status       InvoiceStatus @default(DRAFT)
  taxRate      Float         @default(0)
  discount     Float         @default(0)
  notes        String?
  publicToken  String        @unique @default(cuid())
  lineItems    LineItem[]
  createdAt    DateTime      @default(now())
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
}

model LineItem {
  id          String   @id @default(cuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  description String
  quantity    Float
  rate        Float
}
```

---

## 📜 License
MIT
