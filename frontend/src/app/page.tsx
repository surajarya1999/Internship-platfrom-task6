"use client";
import { useState } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { setCurrentUser } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import API_URL from "@/config/api";

export default function EntryPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); setLoading(false); return; }
      dispatch(setCurrentUser(data.user));
      router.push("/dashboard");
    } catch {
      setError("Cannot connect to backend. Make sure backend is running on port 5000.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.18)_0%,transparent_60%)] bg-[#0a0a0f] flex items-center justify-center p-5">
      <div className="bg-[#13131e] border border-indigo-500/15 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

        {/* Icon & Title */}
        <div className="text-5xl text-center mb-3 drop-shadow-[0_0_16px_rgba(99,102,241,0.6)]">💼</div>
        <h1 className="text-3xl font-extrabold text-[#e2e8f0] text-center">
          Internship<span className="text-indigo-400">Hub</span>
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1.5 mb-7">Enter your details to get started</p>

        {/* Name field */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="e.g. Arya Sharma"
            className="w-full bg-white/5 border border-indigo-500/15 rounded-xl px-3.5 py-3 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] placeholder:text-slate-600"
          />
        </div>

        {/* Email field */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="e.g. arya@gmail.com"
            className="w-full bg-white/5 border border-indigo-500/15 rounded-xl px-3.5 py-3 text-sm text-[#e2e8f0] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] placeholder:text-slate-600"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-[#f87171] mb-4">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleStart} disabled={loading}
          className="w-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm py-3 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-px hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {loading ? "Setting up..." : "Get Started →"}
        </button>

        <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed">
          💡 Invoice will be sent to this email after payment.<br />
          Returning user? Enter same email to continue.
        </p>
      </div>
    </div>
  );
}
