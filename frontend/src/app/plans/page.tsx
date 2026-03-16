"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { updateUser } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "@/config/api";

declare global { interface Window { Razorpay: any } }

const PLANS = [
  { id: "free", name: "Free Plan", icon: "🆓", price: 0, limit: 1, btnStyle: "bg-white/5 text-slate-400 border border-indigo-500/15", features: ["1 application/month", "Browse all internships"] },
  { id: "bronze", name: "Bronze Plan", icon: "🥉", price: 100, limit: 3, btnStyle: "bg-amber-900/20 text-amber-600 border border-amber-700/30 hover:bg-amber-900/30", features: ["3 applications/month", "Application tracking"] },
  { id: "silver", name: "Silver Plan", icon: "🥈", price: 300, limit: 5, btnStyle: "bg-slate-400/20 text-slate-300 border border-slate-400/30 hover:bg-slate-400/30", features: ["5 applications/month", "Priority listing", "Early access"], popular: true },
  { id: "gold", name: "Gold Plan", icon: "🥇", price: 1000, limit: "Unlimited", btnStyle: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]", features: ["Unlimited applications", "Top priority", "Dedicated support", "Resume review"], gold: true },
];

const priceColors: Record<string, string> = {
  free: "text-emerald-400", bronze: "text-amber-600", silver: "text-slate-300", gold: "text-yellow-400"
};

export default function PlansPage() {
  const currentUser = useAppSelector(s => s.user.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [istTime, setIstTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) { router.push("/"); return; }
    if (!document.querySelector('script[src*="razorpay"]')) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(s);
    }
    const check = () => {
      const ist = new Date(new Date().getTime() + 5.5 * 3600000);
      const h = ist.getUTCHours(), m = ist.getUTCMinutes();
      setIstTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} IST`);
      setIsOpen(h * 60 + m >= 600 && h * 60 + m < 660);
    };
    check();
    const t = setInterval(check, 15000);
    fetch(`${API_URL}/api/payments/history/${currentUser._id}`)
      .then(r => r.json()).then(d => { if (d.success) setHistory(d.payments); });
    return () => clearInterval(t);
  }, [currentUser]);

  const handleSubscribe = async (planId: string) => {
    if (!currentUser || planId === "free") return;
    setLoadingPlan(planId); setErr(""); setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id, plan: planId }),
      });
      const data = await res.json();
      if (!data.success) { setErr(data.message); setLoadingPlan(null); return; }
      const rzp = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "InternshipHub",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: data.orderId,
        prefill: { name: data.userName, email: data.userEmail },
        theme: { color: "#6366f1" },
        handler: async (response: any) => {
          const vRes = await fetch(`${API_URL}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, paymentDbId: data.paymentDbId }),
          });
          const vData = await vRes.json();
          if (vData.success) {
            dispatch(updateUser(vData.user));
            setMsg(`${vData.message}`);
            fetch(`${API_URL}/api/payments/history/${currentUser._id}`)
              .then(r => r.json()).then(d => { if (d.success) setHistory(d.payments); });
          } else {
            setErr("Payment verification failed. Contact support.");
          }
          setLoadingPlan(null);
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      });
      rzp.open();
    } catch {
      setErr("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e2e8f0]">💼 Subscription Plans</h1>
        <p className="text-base text-slate-400 mt-2">Upgrade to apply for more internships every month</p>
      </div>

      {/* Time window */}
      <div className="bg-yellow-400/10 border border-yellow-400/25 rounded-2xl px-5 py-4 text-center mb-8">
        <p className="text-sm font-bold text-yellow-400 mb-1">⏰ Payment Window: 10:00 AM – 11:00 AM IST Only</p>
        <p className="text-sm text-yellow-400">
          Current time: <strong>{istTime}</strong> &nbsp;·&nbsp;
          Payments: {isOpen
            ? <span className="text-emerald-400 font-bold">✅ Open Now!</span>
            : <span className="text-[#f87171] font-bold">❌ Closed</span>}
        </p>
      </div>

      {msg && <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 text-sm text-emerald-400 mb-4">🎉 {msg}</div>}
      {err && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-[#f87171] mb-4">⚠️ {err}</div>}

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {PLANS.map(p => (
          <div key={p.id} className={`bg-[#13131e] border rounded-2xl p-7 flex flex-col gap-4 transition-all hover:-translate-y-1 relative overflow-hidden ${p.popular ? "border-indigo-500/40 shadow-[0_0_32px_rgba(99,102,241,0.15)]" : p.gold ? "border-yellow-400/30 shadow-[0_0_32px_rgba(251,191,36,0.1)]" : "border-indigo-500/15 hover:border-indigo-500/40"}`}>
            {p.popular && <span className="absolute top-4 right-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>}
            <div className="text-4xl">{p.icon}</div>
            <div>
              <div className="text-xl font-extrabold text-[#e2e8f0]">{p.name}</div>
              <div className={`text-3xl font-extrabold mt-1 ${priceColors[p.id]}`}>
                {p.price === 0 ? "Free" : `₹${p.price}`}
                {p.price > 0 && <span className="text-sm font-medium text-slate-500">/month</span>}
              </div>
            </div>
            <div className="text-sm text-slate-400 py-2.5 border-t border-b border-white/5">
              Apply for <strong>{p.limit} internship{p.limit !== 1 && p.limit !== "Unlimited" ? "s" : ""}</strong> per month
            </div>
            <div className="flex flex-col gap-1.5">
              {p.features.map((f, i) => <div key={i} className="text-sm text-slate-400 flex items-center gap-2">✓ {f}</div>)}
            </div>
            {p.id === "free" ? (
              <div className="text-sm text-slate-500 text-center py-2">
                {currentUser.plan === "free" ? "✅ Your current plan" : "Default plan"}
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(p.id)}
                disabled={loadingPlan === p.id || currentUser.plan === p.id || !isOpen}
                className={`${p.btnStyle} text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {loadingPlan === p.id ? "Processing..." :
                  currentUser.plan === p.id ? "✅ Active Plan" :
                    !isOpen ? "⏰ Opens 10 AM" :
                      `Subscribe — ₹${p.price}/mo`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Current plan card */}
      <div className="bg-[#13131e] border border-indigo-500/15 rounded-2xl p-5 text-center max-w-sm mx-auto mb-8 hover:border-indigo-500/40 transition-all">
        <p className="text-xs text-slate-500 mb-1.5">Your Current Plan</p>
        <p className="text-2xl font-extrabold text-[#e2e8f0] capitalize">{currentUser.plan} Plan</p>
        <p className="text-sm text-slate-400 mt-1.5">Used <strong>{currentUser.applicationsUsed}</strong> applications this month</p>
        <Link href="/dashboard" className="inline-flex bg-white/5 text-slate-400 border border-indigo-500/15 text-xs font-bold px-4 py-2 rounded-xl mt-4 no-underline hover:text-[#e2e8f0] hover:border-indigo-500/40 transition-all">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Payment history */}
      {history.length > 0 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-extrabold text-[#e2e8f0] mb-4">📄 Payment History</h2>
          {history.map(h => (
            <div key={h._id} className="bg-[#13131e] border border-indigo-500/15 rounded-xl px-4 py-3.5 flex items-center justify-between mb-2.5">
              <div>
                <div className="text-sm font-bold text-[#e2e8f0] capitalize">{h.plan} Plan</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">#{h.invoiceNumber} · Invoice sent to {h.userEmail}</div>
              </div>
              <div className="text-base font-extrabold text-emerald-400">₹{h.amount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
