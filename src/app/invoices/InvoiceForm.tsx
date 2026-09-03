"use client";

import { useState } from "react";
import { createInvoice, updateInvoice, LineItemInput } from "@/lib/actions/invoices";
import { Plus, Trash2, ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface InvoiceFormProps {
  clients: Client[];
  initialData?: {
    id: string;
    clientId: string;
    issueDate: Date;
    dueDate: Date;
    taxRate: number;
    discount: number;
    notes: string | null;
    lineItems: { description: string; quantity: number; rate: number }[];
  };
}

export default function InvoiceForm({ clients, initialData }: InvoiceFormProps) {
  const [clientId, setClientId] = useState(initialData?.clientId || (clients[0]?.id || ""));
  const [issueDate, setIssueDate] = useState(
    initialData
      ? new Date(initialData.issueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    initialData
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate || 0);
  const [discount, setDiscount] = useState<number>(initialData?.discount || 0);
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const [lineItems, setLineItems] = useState<LineItemInput[]>(
    initialData?.lineItems && initialData.lineItems.length > 0
      ? initialData.lineItems
      : [{ description: "", quantity: 1, rate: 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Line item updates
  const handleItemChange = (index: number, field: keyof LineItemInput, value: string | number) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = value as string;
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setLineItems(updated);
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Real-time Math Engine Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      setError("All line items must have a description.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        clientId,
        issueDate,
        dueDate,
        taxRate,
        discount,
        notes,
        lineItems,
      };

      if (initialData) {
        await updateInvoice(initialData.id, payload);
      } else {
        await createInvoice(payload);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving invoice");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link
            href="/invoices"
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              {initialData ? "Edit Invoice" : "Create New Invoice"}
            </h1>
            <p className="text-sm text-neutral-500 font-medium">Fill in the invoice details and line items below</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-sm disabled:opacity-50 transition"
        >
          {loading ? "Saving Invoice..." : initialData ? "Update Invoice" : "Save Invoice"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Select Client *</label>
            {clients.length === 0 ? (
              <p className="text-sm text-red-500 font-medium">
                No clients found.{" "}
                <Link href="/clients" className="underline font-bold text-black">
                  Add a client first
                </Link>
              </p>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Issue Date *</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-black">Line Items</h2>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="w-32">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Rate ($)"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="w-28 text-right font-black text-sm text-black">
                ${(item.quantity * item.rate).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={lineItems.length === 1}
                className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-30 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-bold rounded-xl text-black hover:bg-neutral-100 transition"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Math Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-neutral-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-black">Notes / Payment Terms</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Thank you for your business! Payment due within 14 days."
          />
        </div>

        {/* Real-time Math Summary Card */}
        <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-sm space-y-4">
          <h3 className="font-black text-black flex items-center">
            <Calculator className="h-4 w-4 mr-2 text-black" />
            Summary
          </h3>

          <div className="space-y-3 text-sm border-t border-neutral-200 pt-3">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Tax Rate (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-20 text-right rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Discount (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-20 text-right rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex justify-between text-neutral-500 text-xs">
              <span>Tax Amount</span>
              <span>+${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-neutral-500 text-xs">
              <span>Discount Amount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-black border-t-2 border-black pt-3">
              <span>Total Due</span>
              <span className="text-black text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
