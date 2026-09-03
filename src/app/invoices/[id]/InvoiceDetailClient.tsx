"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Edit2, Share2, Send, Check } from "lucide-react";
import { sendInvoiceEmail } from "@/lib/actions/publicInvoice";

interface InvoiceDetailProps {
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
      logoUrl: string | null;
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

export default function InvoiceDetailClient({ invoice }: InvoiceDetailProps) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const getPublicLink = () => {
    return `${window.location.origin}/pay/${invoice.publicToken}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendInvoice = async () => {
    setSending(true);
    setSentNotice("");

    try {
      const res = await sendInvoiceEmail(invoice.id, window.location.origin);
      navigator.clipboard.writeText(res.shareUrl);
      setSentNotice("Invoice sent! Public link copied to clipboard.");
      setTimeout(() => setSentNotice(""), 4000);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to send invoice");
    } finally {
      setSending(false);
    }
  };

  const getCurrencySymbol = (curr?: string) => {
    switch (curr) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "CAD": return "CA$";
      case "AUD": return "AU$";
      default: return "$";
    }
  };

  const symbol = getCurrencySymbol(invoice.user.currency);

  const subtotal = invoice.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discountAmount = (subtotal * invoice.discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-300",
    SENT: "bg-neutral-800 text-white border-neutral-900",
    PAID: "bg-black text-white font-black",
    OVERDUE: "bg-white text-black border-2 border-black font-black",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/invoices"
          className="inline-flex items-center text-sm font-semibold text-neutral-600 hover:text-black transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-3.5 py-2 border border-neutral-300 text-sm font-bold rounded-xl text-black bg-white hover:bg-neutral-100 transition"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4 text-black" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-1.5 h-4 w-4 text-black" />
                Copy Share Link
              </>
            )}
          </button>

          <button
            onClick={handleSendInvoice}
            disabled={sending}
            className="inline-flex items-center px-3.5 py-2 border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black text-sm font-bold rounded-xl transition disabled:opacity-50"
          >
            <Send className="mr-1.5 h-4 w-4" />
            {sending ? "Sending..." : "Send Invoice"}
          </button>

          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="inline-flex items-center px-3.5 py-2 border border-neutral-300 text-sm font-bold rounded-xl text-black bg-white hover:bg-neutral-100 transition"
          >
            <Edit2 className="mr-1.5 h-4 w-4 text-black" />
            Edit
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {sentNotice && (
        <div className="p-4 bg-black text-white text-sm font-bold rounded-2xl print:hidden flex items-center space-x-2">
          <Check className="h-5 w-5 text-white" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Invoice Document Paper */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-neutral-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-8">
          <div>
            {invoice.user.logoUrl && (
              <img
                src={invoice.user.logoUrl}
                alt="Business Logo"
                className="h-16 max-w-[200px] object-contain mb-4"
              />
            )}
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
                  statusColors[invoice.derivedStatus] || "bg-neutral-100 text-neutral-700"
                }`}
              >
                {invoice.derivedStatus}
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
                <th className="py-3 text-right">Rate ({symbol})</th>
                <th className="py-3 text-right">Amount ({symbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-bold text-black">{item.description}</td>
                  <td className="py-4 text-center text-neutral-600 font-medium">{item.quantity}</td>
                  <td className="py-4 text-right text-neutral-600 font-medium">
                    {symbol}{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 text-right font-black text-black">
                    {symbol}{(item.quantity * item.rate).toFixed(2)}
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
              <span className="font-bold text-black">{symbol}{subtotal.toFixed(2)}</span>
            </div>

            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>+{symbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Discount ({invoice.discount}%)</span>
                <span>-{symbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between border-t-2 border-black pt-3 text-base font-black text-black">
              <span>Total Amount</span>
              <span className="text-black text-lg">{symbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
