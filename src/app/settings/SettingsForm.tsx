"use client";

import { useState } from "react";
import { updateUserSettings } from "@/lib/actions/settings";
import { Building, DollarSign, Hash, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface SettingsFormProps {
  user: {
    businessName: string | null;
    logoUrl: string | null;
    currency: string;
    invoicePrefix: string;
    email: string;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [logoUrl, setLogoUrl] = useState(user.logoUrl || "");
  const [currency, setCurrency] = useState(user.currency || "USD");
  const [invoicePrefix, setInvoicePrefix] = useState(user.invoicePrefix || "INV");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // If BLOB_READ_WRITE_TOKEN is available, upload to Vercel Blob
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      if (response.ok) {
        const newBlob = await response.json();
        setLogoUrl(newBlob.url);
      } else {
        // Local base64 data URL fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback to base64 encoding if Vercel Blob token is not configured locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoUrl);

    try {
      await updateUserSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account & Invoicing Settings</h1>
        <p className="text-sm text-gray-500">
          Customize your business branding, currency formatting, and invoice numbering prefix.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-200 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span>Settings saved successfully! Future invoices will reflect these changes.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Business Branding Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Building className="h-5 w-5 mr-2 text-blue-600" />
          Business Profile & Logo
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Studio LLC"
          />
          <p className="text-xs text-gray-400 mt-1">Appears as your business header on invoices.</p>
        </div>

        {/* Logo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>

          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain p-1" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                <Upload className="mr-2 h-4 w-4 text-gray-500" />
                {uploading ? "Uploading..." : "Upload Logo (Vercel Blob)"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="block text-xs text-red-600 hover:underline"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Configuration Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
          Invoice Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="AUD">AUD ($ - Australian Dollar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Number Prefix</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <Hash className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="invoicePrefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Example format: <span className="font-mono text-gray-600">{invoicePrefix}-0001</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {loading ? "Saving Settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
