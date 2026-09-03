"use client";

import Link from "next/link";
import { Printer, ArrowLeft, Edit2, Share2 } from "lucide-react";

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
  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discountAmount = (subtotal * invoice.discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    SENT: "bg-blue-100 text-blue-700 border-blue-200",
    PAID: "bg-green-100 text-green-700 border-green-200",
    OVERDUE: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar - Hidden when printing */}
      <div className="flex justify-between items-center print:hidden">
        <Link
          href="/invoices"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">INVOICE</h1>
            <p className="text-sm font-mono text-gray-500 mt-1">#{invoice.number}</p>
          </div>

          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900">
              {invoice.user.businessName || invoice.user.email}
            </h2>
            <p className="text-sm text-gray-500">{invoice.user.email}</p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  statusColors[invoice.derivedStatus] || "bg-gray-100 text-gray-700"
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
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-gray-900 text-base">{invoice.client.name}</p>
            {invoice.client.company && (
              <p className="text-gray-600 font-medium">{invoice.client.company}</p>
            )}
            {invoice.client.email && <p className="text-gray-500">{invoice.client.email}</p>}
            {invoice.client.phone && <p className="text-gray-500">{invoice.client.phone}</p>}
            {invoice.client.address && (
              <p className="text-gray-500 whitespace-pre-line mt-1">{invoice.client.address}</p>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Issue Date
              </span>
              <span className="font-semibold text-gray-900">
                {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Due Date
              </span>
              <span className="font-semibold text-gray-900">
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
              <tr className="border-b border-gray-300 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-medium text-gray-900">{item.description}</td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">${item.rate.toFixed(2)}</td>
                  <td className="py-4 text-right font-semibold text-gray-900">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-between items-start border-t border-gray-200 pt-6">
          <div className="w-1/2 pr-4">
            {invoice.notes && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Notes / Payment Terms
                </h4>
                <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="w-1/2 max-w-xs space-y-2 text-sm text-right">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>

            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-gray-600 text-xs">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>+${taxAmount.toFixed(2)}</span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-gray-600 text-xs">
                <span>Discount ({invoice.discount}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-900 pt-3 text-base font-bold text-gray-900">
              <span>Total Amount</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
