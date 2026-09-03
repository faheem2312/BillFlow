"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm border-2 border-neutral-200">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-black text-white font-black text-2xl flex items-center justify-center shadow-md">
            B
          </div>
          <h2 className="text-2xl font-black text-black">Sign in to BillFlow</h2>
          <p className="text-xs text-neutral-500 font-medium">Welcome back! Please enter your details</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-black hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}