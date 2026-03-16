"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/slices/userSlice";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const currentUser = useAppSelector(s => s.user.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const path = usePathname();

  const planColors: Record<string, string> = {
    free: "bg-slate-500/20 text-slate-400",
    bronze: "bg-amber-900/20 text-amber-600",
    silver: "bg-slate-400/20 text-slate-300",
    gold: "bg-yellow-400/20 text-yellow-400",
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0a0a0f] to-[#111118] border-b border-indigo-500/15">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2 text-[#e2e8f0] font-extrabold text-lg no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            💼
          </div>
          <span>Internship<span className="text-indigo-400">Hub</span></span>
        </Link>

        {/* Nav Links - hidden on mobile */}
        {currentUser && (
          <div className="hidden md:flex gap-1">
            <Link href="/dashboard" className={`text-slate-400 no-underline text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${path === "/dashboard" ? "text-[#e2e8f0] border-indigo-500/15 bg-indigo-500/8" : "border-transparent hover:text-[#e2e8f0] hover:border-indigo-500/15 hover:bg-indigo-500/8"}`}>
              🏠 Dashboard
            </Link>
            <Link href="/plans" className={`text-slate-400 no-underline text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${path === "/plans" ? "text-[#e2e8f0] border-indigo-500/15 bg-indigo-500/8" : "border-transparent hover:text-[#e2e8f0] hover:border-indigo-500/15 hover:bg-indigo-500/8"}`}>
              ⭐ Plans
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${planColors[currentUser.plan] || planColors.free}`}>
                {currentUser.plan}
              </span>
              <span className="hidden sm:block text-sm font-semibold text-[#e2e8f0]">{currentUser.name}</span>
              <button
                onClick={() => { dispatch(logout()); router.push("/"); }}
                className="text-[#f87171] bg-red-500/10 border border-red-500/20 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-red-500/20"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/" className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-px transition-all no-underline">
              Get Started →
            </Link>
          )}

          {/* Mobile nav icons */}
          {currentUser && (
            <div className="flex md:hidden items-center gap-2 ml-1">
              <Link href="/dashboard" className="text-slate-400 hover:text-[#e2e8f0] text-base">🏠</Link>
              <Link href="/plans" className="text-slate-400 hover:text-[#e2e8f0] text-base">⭐</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
