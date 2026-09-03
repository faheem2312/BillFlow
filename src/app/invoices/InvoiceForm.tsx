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
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Invoice" : "Create New Invoice"}
            </h1>
            <p className="text-sm text-gray-500">Fill in the invoice details and line items below</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {loading ? "Saving Invoice..." : initialData ? "Update Invoice" : "Save Invoice"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client *</label>
            {clients.length === 0 ? (
              <p className="text-sm text-red-500">
                No clients found.{" "}
                <Link href="/clients" className="underline font-semibold">
                  Add a client first
                </Link>
              </p>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Line Items</h2>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="w-28 text-right font-medium text-sm text-gray-700">
                ${(item.quantity * item.rate).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={lineItems.length === 1}
                className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Math Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <label className="block text-sm font-medium text-gray-700">Notes / Payment Terms</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Thank you for your business! Payment due within 14 days."
          />
        </div>

        {/* Real-time Math Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Calculator className="h-4 w-4 mr-2 text-blue-600" />
            Summary
          </h3>

          <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax Rate (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-20 text-right rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-20 text-right rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between text-gray-600 text-xs">
              <span>Tax Amount</span>
              <span>+${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 text-xs">
              <span>Discount Amount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total Due</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
