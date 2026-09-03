"use client";

import { useState } from "react";
import { markInvoiceAsPaid } from "@/lib/actions/publicInvoice";
import { CheckCircle2, CreditCard, ShieldCheck, Printer } from "lucide-react";

interface PayInvoiceClientProps {
  invoice: {
    id: string;
    number: string;
    issueDate: string;
    dueDate: string;
    status: string;
    derivedStatus: string;
    taxRate: number;
    discount: number;
    notes: string | null;
    publicToken: string;
    user: {
      businessName: string | null;
      email: string;
      currency: string;
    };
    client: {
      name: string;
      email: string;
      company: string | null;
      address: string | null;
      phone: string | null;
    };
    lineItems: {
      id: string;
      description: string;
      quantity: number;
      rate: number;
    }[];
  };
}

export default function PayInvoiceClient({ invoice }: PayInvoiceClientProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(invoice.derivedStatus === "PAID");
  const [error, setError] = useState("");

  const subtotal = invoice.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discountAmount = (subtotal * invoice.discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const handleSimulatedPayment = async () => {
    setLoading(true);
    setError("");

    try {
      await markInvoiceAsPaid(invoice.publicToken);
      setPaid(true);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-300",
    SENT: "bg-neutral-800 text-white border-neutral-900",
    PAID: "bg-black text-white font-black",
    OVERDUE: "bg-white text-black border-2 border-black font-black",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Status Alert */}
      <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-8 w-8 text-black flex-shrink-0" />
          <div>
            <h2 className="font-bold text-black">
              Invoice from {invoice.user.businessName || invoice.user.email}
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Review details below and complete payment via test checkout
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border-2 border-black text-sm font-bold rounded-xl text-black hover:bg-neutral-100 transition flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>

          {paid ? (
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2.5 rounded-xl font-black text-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span>Paid in Full</span>
            </div>
          ) : (
            <button
              onClick={handleSimulatedPayment}
              disabled={loading}
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center disabled:opacity-50"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {loading ? "Processing Payment..." : `Pay Now ($${total.toFixed(2)})`}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-2xl border border-red-200 print:hidden">
          {error}
        </div>
      )}

      {/* Invoice Document Paper */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-neutral-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">INVOICE</h1>
            <p className="text-sm font-mono text-neutral-500 mt-1">#{invoice.number}</p>
          </div>

          <div className="text-right">
            <h2 className="text-lg font-bold text-black">
              {invoice.user.businessName || invoice.user.email}
            </h2>
            <p className="text-sm text-neutral-500">{invoice.user.email}</p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  statusColors[paid ? "PAID" : invoice.derivedStatus] || "bg-neutral-100 text-neutral-700"
                }`}
              >
                {paid ? "PAID" : invoice.derivedStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Client & Dates Info */}
        <div className="grid grid-cols-2 gap-8 my-8 text-sm">
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-black text-base">{invoice.client.name}</p>
            {invoice.client.company && (
              <p className="text-neutral-700 font-medium">{invoice.client.company}</p>
            )}
            {invoice.client.email && <p className="text-neutral-500">{invoice.client.email}</p>}
            {invoice.client.phone && <p className="text-neutral-500">{invoice.client.phone}</p>}
            {invoice.client.address && (
              <p className="text-neutral-500 whitespace-pre-line mt-1">{invoice.client.address}</p>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Issue Date
              </span>
              <span className="font-semibold text-black">
                {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Due Date
              </span>
              <span className="font-semibold text-black">
                {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="my-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-300 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-bold text-black">{item.description}</td>
                  <td className="py-4 text-center text-neutral-600 font-medium">{item.quantity}</td>
                  <td className="py-4 text-right text-neutral-600 font-medium">${item.rate.toFixed(2)}</td>
                  <td className="py-4 text-right font-black text-black">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-between items-start border-t border-neutral-200 pt-6">
          <div className="w-1/2 pr-4">
            {invoice.notes && (
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Notes / Payment Terms
                </h4>
                <p className="text-xs text-neutral-600 whitespace-pre-line font-medium">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="w-1/2 max-w-xs space-y-2 text-sm text-right">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
            </div>

            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>+${taxAmount.toFixed(2)}</span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Discount ({invoice.discount}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between border-t-2 border-black pt-3 text-base font-black text-black">
              <span>Total Amount</span>
              <span className="text-black text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
