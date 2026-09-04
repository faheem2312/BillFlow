# 🧾 BillFlow — Modern Invoicing SaaS for Freelancers

> **BillFlow** is a full-stack, production-grade invoicing SaaS platform engineered for freelancers and boutique studios. It eliminates Word templates and manual spreadsheets with automated line-item calculations, shareable no-login payment portals, real-time overdue tracking, dynamic currency conversions, and financial analytics.

Built as part of the **Full Stack Intern (AI)** technical assessment.

---

## 🌐 Quick Links & Demo Access

* **🚀 Live Deployed Website**: [https://billflow-brown.vercel.app](https://billflow-brown.vercel.app)
* **📁 GitHub Repository**: [https://github.com/faheem2312/BillFlow](https://github.com/faheem2312/BillFlow)
* **📹 5-Minute Video Walkthrough**: [Link to Loom / Google Drive Video] *(Add your Loom recording URL here)*

### 🔑 Pre-Seeded Demo Credentials
You can immediately test the live application without registering:

| Attribute | Demo Value |
|---|---|
| **Email** | `demo@billflow.com` |
| **Password** | `Password123!` |
| **Pre-seeded Clients** | **8 Clients** (Acme Corp, Stark Media, Cyberdyne, Wayne Enterprises, etc.) |
| **Pre-seeded Invoices** | **20 Invoices** across all 4 statuses (`PAID`, `SENT`, `DRAFT`, `OVERDUE`) |
| **Sample Public Payment Link** | `/pay/cmtlo79m4000q707u7nzbqbz4` (Invoice `#INV-0002`) |

---

## ✨ Features Built

### 1. 🔐 Authentication & Multi-Tenant Isolation
* Complete sign up, login, and session persistence powered by **Auth.js (NextAuth v5)**.
* Passwords securely hashed with **bcryptjs** (salt rounds: 10).
* Strict multi-tenant isolation: database queries enforce `userId: session.user.id` so users never see other tenants' data.

### 2. 👥 Client Management (Full CRUD)
* Add, edit, delete, and list client profiles (Name, Email, Company, Address, Phone).
* Responsive modal interface with optimistic updates, empty states, and delete confirmation safeguards.

### 3. 📄 Invoice Creation & Auto-Calculated Math
* Dynamic line-item builder with arbitrary rows (description, quantity, unit rate).
* Instant client-side calculation for **subtotal**, **custom tax rate (%)**, **discount rate (%)**, and **total amount due**.
* Auto-incrementing invoice numbers with customizable prefix (`INV-0001`, `BILL-0001`).

### 4. 📅 Strict Accounting Compliance & Date Validation
* **Rule**: `Due Date` must always be on or after `Issue Date` ($\text{DueDate} \ge \text{IssueDate}$).
* Browser calendars disable and gray-out dates prior to the chosen `Issue Date` via HTML5 `min` constraints.
* Client-side & server-side validation rejects invalid past due dates.
* Auto-adjusting date picker: advancing the issue date automatically pushes the due date forward.

### 5. 🔍 Server-Side Search, Filtering & Sorting
* Built on Server Components with URL `searchParams`.
* **Search**: Instant search matching invoice numbers, client names, and companies.
* **Status Filter**: Filter by `DRAFT`, `SENT`, `PAID`, or `OVERDUE`.
* **Client Filter**: Filter invoices for any specific client.
* **Sorting**: Sort by Newest, Oldest, Highest Amount, or Lowest Amount.

### 6. 🖨️ Clean Invoice View, Print & PDF Export
* Formal, invoice layout with business header, client details, line items table, and notes.
* Print-optimized CSS (`@media print`) that strips UI navigation and buttons for 1-click **Print / Save as PDF**.

### 7. 🔗 No-Login Public Payment Portal & Simulation
* Secure public URL generated via unique cryptographic token (`/pay/[token]`).
* Clients can view their invoice on desktop or mobile **without creating an account**.
* One-click **"Pay Now"** simulated payment checkout that immediately flips invoice status to `PAID`.

### 8. 📊 Financial Analytics Dashboard
* **Real-time KPI metric cards**: Total Earned, Outstanding, and Overdue amounts.
* **Income Over Time Chart**: Interactive bar chart built with **Recharts** aggregating paid monthly earnings.
* **Recent Invoices Table**: Centered, high-contrast invoice overview with status indicators.

### 9. 🎨 Settings & Business Customization
* Customize Business Name, upload custom business logo, set invoice prefix, and select primary currency.
* Settings reflect instantly across the Navbar, Invoice Builder, Invoice Views, and public payment links.

### 10. 🔴 Automated Overdue Status Tracking
* Status dynamically transitions to **`OVERDUE`** on every render if `status === 'SENT'` and `today > dueDate`. Zero manual marking or background workers required.

---

## 🌟 Bonus Features Added

* **💱 Real-Time FX Exchange Rate Conversion Engine**: Zero-latency server-side cached FX engine (`src/lib/currency.ts`) using `open.er-api.com` supporting `USD ($)`, `EUR (€)`, `GBP (£)`, `INR (₹)`, `CAD (CA$)`, and `AUD (AU$)`.
* **💊 Minimalist Floating Pill Navbar**: Centered capsule navigation inspired by modern linear/fintech UI, complete with dynamic business avatar, business name display, and mobile drawer.
* **⚡ Database Connection Pool Protection**: Parallelized Prisma queries (`Promise.all`) with `connect_timeout=30` and `pool_timeout=30` to prevent Neon serverless connection exhaustion (`P2024`).
* **🖋️ Premium Typography System**: Configured **Plus Jakarta Sans** paired with **JetBrains Mono** via `next/font/google` for ultra-clean readability.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, `lucide-react`, Custom CSS Print Styles |
| **Typography** | Plus Jakarta Sans & JetBrains Mono (`next/font/google`) |
| **Backend** | Next.js Server Actions & Route Handlers |
| **Database & ORM**| PostgreSQL (Neon Serverless) + Prisma ORM |
| **Authentication** | Auth.js (NextAuth v5) + `bcryptjs` |
| **Charts** | Recharts |
| **Storage** | Vercel Blob / Base64 fallback |
| **Hosting** | Vercel |

---

## 🚀 Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/faheem2312/BillFlow.git
cd billflow
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# PostgreSQL connection string (Neon / Supabase / Local Postgres)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require&connect_timeout=30&pool_timeout=30"

# Auth.js secret key (generate with: npx auth secret or openssl rand -hex 32)
AUTH_SECRET="your-32-character-secret-key-here"
AUTH_TRUST_HOST="true"

# Optional: Resend API Key for live email sending
RESEND_API_KEY="re_your_api_key_here"

# Optional: Vercel Blob token for cloud logo storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_your_token_here"
```

> **Note**: No real secrets or sensitive credentials are committed to version control.

### 3. Setup Database & Seed Demo Data
```bash
# Push schema to database
npx prisma db push

# Seed 8 clients and 20 realistic invoices
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
billflow/
├── prisma/
│   ├── migrations/         # PostgreSQL migration files (initial baseline)
│   ├── schema.prisma       # Prisma database models (User, Client, Invoice, LineItem)
│   └── seed.ts             # Database seeder (8 clients & 20 invoices)
├── public/
│   ├── logo.png            # BillFlow vector brand logo
│   └── favicon.ico         # App tab favicon
├── src/
│   ├── app/
│   │   ├── api/            # Route handlers (auth, file upload)
│   │   ├── clients/        # Client management CRUD interface
│   │   ├── dashboard/      # Financial metrics & Recharts analytics
│   │   ├── invoices/       # Invoices list, creation, editing, and details
│   │   ├── pay/[token]/    # Public share payment portal (no-login required)
│   │   ├── settings/       # Business profile, currency, logo, and prefix
│   │   ├── layout.tsx      # Root layout with Plus Jakarta Sans font & metadata
│   │   └── page.tsx        # Public marketing landing page
│   ├── components/
│   │   └── Navbar.tsx      # Floating capsule navbar with avatar & business name
│   └── lib/
│       ├── actions/        # Server Actions (invoices, clients, settings, publicInvoice)
│       ├── currency.ts     # Real-time cached FX exchange rate utility
│       └── prisma.ts       # Prisma client singleton instance
```

---

## 📜 License
MIT License. Built for the Full Stack Intern (AI) Technical Assessment.
