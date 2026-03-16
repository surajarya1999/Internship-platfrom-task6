"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { updateUser } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "@/config/api";

const PLAN_LIMITS: Record<string, number> = { free: 1, bronze: 3, silver: 5, gold: 999999 };

interface Internship { _id: string; title: string; company: string; role: string; location: string; duration: string; stipend: string; description: string; tags: string[]; }
interface Application { _id: string; internshipTitle: string; company: string; role: string; status: string; createdAt: string; }

const statusStyles: Record<string, string> = {
  applied: "bg-indigo-500/15 text-indigo-400",
  reviewing: "bg-yellow-400/10 text-yellow-400",
  accepted: "bg-emerald-400/10 text-emerald-400",
  rejected: "bg-red-500/10 text-[#f87171]",
};

export default function DashboardPage() {
  const currentUser = useAppSelector(s => s.user.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!currentUser) { router.push("/"); return; }
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [iRes, aRes] = await Promise.all([
        fetch(`${API_URL}/api/internships`),
        fetch(`${API_URL}/api/internships/applications/${currentUser!._id}`),
      ]);
      const iData = await iRes.json();
      const aData = await aRes.json();
      if (iData.success) setInternships(iData.internships);
      if (aData.success) setApplications(aData.applications);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleApply = async (internshipId: string) => {
    if (!currentUser) return;
    setApplying(internshipId); setMsg(""); setErr("");
    try {
      const res = await fetch(`${API_URL}/api/internships/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id, internshipId }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ ${data.message}`);
        dispatch(updateUser(data.user));
        setApplications(prev => [data.application, ...prev]);
      } else {
        setErr(data.message);
      }
    } catch { setErr("Something went wrong."); }
    setApplying(null);
  };

  if (!currentUser) return null;

  const limit = PLAN_LIMITS[currentUser.plan] || 1;
  const remaining = limit === 999999 ? "∞" : Math.max(0, limit - currentUser.applicationsUsed);
  const appliedSet = new Set(applications.map(a => a.internshipTitle + a.company));

  const planColor = currentUser.plan === "gold" ? "text-yellow-400" : currentUser.plan === "silver" ? "text-slate-300" : currentUser.plan === "bronze" ? "text-amber-600" : "text-emerald-400";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}&backgroundColor=6366f1`}
          alt={currentUser.name}
          className="w-16 h-16 rounded-full border-[3px] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        />
        <div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#e2e8f0]">Welcome, {currentUser.name}! 👋</div>
          <div className="text-sm text-slate-500 mt-0.5">{currentUser.email}</div>
        </div>
      </div>

      {msg && <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 text-sm text-emerald-400 mb-4">{msg}</div>}
      {err && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-[#f87171] mb-4 flex flex-wrap items-center gap-3">
          ⚠️ {err}
          {(err.includes("upgrade") || err.includes("Upgrade")) && (
            <Link href="/plans" className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg no-underline">Upgrade Plan →</Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          { label: "Current Plan", value: <span className={`capitalize ${planColor}`}>{currentUser.plan}</span>, sub: <Link href="/plans" className="text-indigo-400 no-underline">Upgrade →</Link> },
          { label: "Used This Month", value: currentUser.applicationsUsed, sub: "applications" },
          { label: "Remaining", value: <span className="text-emerald-400">{remaining}</span>, sub: `of ${limit === 999999 ? "unlimited" : limit}` },
          { label: "Total Applied", value: applications.length, sub: "all time" },
        ].map((s, i) => (
          <div key={i} className="bg-[#13131e] border border-indigo-500/15 rounded-2xl p-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-2xl font-extrabold text-[#e2e8f0]">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Internships */}
      <div className="mb-10">
        <h2 className="text-lg font-extrabold text-[#e2e8f0] mb-4">🔍 Available Internships</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Loading internships...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {internships.map(i => {
              const applied = appliedSet.has(i.title + i.company);
              return (
                <div key={i._id} className="bg-[#13131e] border border-indigo-500/15 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:border-indigo-500/40 hover:-translate-y-0.5">
                  <div>
                    <div className="text-sm text-indigo-400 font-semibold">{i.company}</div>
                    <div className="text-base font-bold text-[#e2e8f0] mt-0.5">{i.title}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[`📍 ${i.location}`, `⏱ ${i.duration}`, `💰 ${i.stipend}`].map(t => (
                      <span key={t} className="text-[11px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/6">{t}</span>
                    ))}
                  </div>
                  {i.description && <p className="text-xs text-slate-500 leading-relaxed">{i.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {i.tags.map(t => <span key={t} className="text-[11px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">{t}</span>)}
                  </div>
                  <button
                    onClick={() => handleApply(i._id)}
                    disabled={applying === i._id || applied || remaining === 0}
                    className={`text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${applied ? "bg-white/5 text-slate-400 border border-indigo-500/15" : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-px"}`}
                  >
                    {applying === i._id ? "Applying..." : applied ? "✅ Applied" : "Apply Now"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-lg font-extrabold text-[#e2e8f0] mb-4">📋 My Applications ({applications.length})</h2>
        {applications.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">No applications yet. Apply to internships above!</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {applications.map(a => (
              <div key={a._id} className="bg-[#13131e] border border-indigo-500/15 rounded-xl px-4 py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#e2e8f0]">{a.internshipTitle}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.company} · {a.role}</div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyles[a.status] || statusStyles.applied}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
