import Link from "next/link";
import { auth } from "@/auth";
import {
  FileText,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Send,
  Receipt,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-neutral-200 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center text-white font-black shadow-md">
              <Receipt className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-black">BillFlow</span>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-neutral-700 hover:text-black px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-tight max-w-4xl mx-auto">
            Professional Invoicing <br className="hidden sm:inline" />
            <span className="underline decoration-neutral-400 underline-offset-8">
              Simple. Fast. Minimal.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Ditch Word docs and spreadsheets. Create professional invoices in seconds, share secret payment links, track overdue bills, and get paid faster.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-lg transition text-base"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white border-2 border-black text-black font-bold rounded-xl hover:bg-neutral-100 transition text-base"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Feature Badge Strip */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs font-bold text-neutral-600 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-black" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-black" />
              <span>Public client payment links</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-black" />
              <span>Print & PDF export</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup Card */}
        <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6">
          <div className="bg-black rounded-2xl p-4 sm:p-6 shadow-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-800">
              <div className="h-3 w-3 rounded-full bg-neutral-700"></div>
              <div className="h-3 w-3 rounded-full bg-neutral-700"></div>
              <div className="h-3 w-3 rounded-full bg-neutral-700"></div>
              <span className="text-xs font-mono text-neutral-400 ml-2">app.billflow.com/invoices/INV-0001</span>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 space-y-6 text-left border border-neutral-300">
              <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-black">INVOICE</h3>
                  <p className="text-xs font-mono text-neutral-500">#INV-0001</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-black text-white font-bold text-xs rounded-full">
                    PAID
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-neutral-400 uppercase">Billed To</p>
                  <p className="font-bold text-black text-sm mt-0.5">Acme Corporation</p>
                  <p className="text-neutral-600">billing@acme.com</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-400 uppercase">Amount Paid</p>
                  <p className="font-black text-black text-lg mt-0.5">$2,450.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Grid */}
      <section className="py-20 bg-[#FAFAFA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Why Choose BillFlow</h2>
            <p className="text-3xl font-black text-black mt-2">Everything You Need to Get Paid</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-black">Dynamic Invoice Engine</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Add line items, set custom tax rates, apply percentage discounts, and let our real-time math engine calculate totals automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-black">No-Login Public Share Links</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Send clients a secret, shareable link. They can open, inspect, print, or pay the invoice directly without creating an account.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-black">Financial Analytics Dashboard</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Track total earned, outstanding, and overdue amounts at a glance. Visualize your income trends with interactive Recharts charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Simplify Your Invoicing?</h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm">
            Join freelancers and small studios using BillFlow to manage clients and bill effortlessly.
          </p>
          <div>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3.5 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-neutral-200 transition"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-xs text-neutral-500 pt-8 border-t border-neutral-800">
            © {new Date().getFullYear()} BillFlow Invoicing SaaS. Built for Freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}