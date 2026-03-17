"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/slices/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const currentUser = useAppSelector(s => s.user.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const path = usePathname();

  const [menuOpen, setMenuOpen] = useState(false); // ✅ added

  const planColors: Record<string, string> = {
    free: "bg-slate-500/20 text-slate-400",
    bronze: "bg-amber-900/20 text-amber-600",
    silver: "bg-slate-400/20 text-slate-300",
    gold: "bg-yellow-400/20 text-yellow-400",
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0a0a0f] to-[#111118] border-b border-indigo-500/15">

      {/* 🔥 width thoda increase kiya for better responsiveness */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2 text-[#e2e8f0] font-extrabold text-base sm:text-lg no-underline">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm sm:text-lg shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            💼
          </div>
          <span className="truncate">Internship<span className="text-indigo-400">Hub</span></span>
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
        <div className="flex items-center gap-1 sm:gap-2">
          {currentUser ? (
            <>
              {/* Plan badge */}
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wide ${planColors[currentUser.plan] || planColors.free}`}>
                {currentUser.plan}
              </span>

              {/* Name */}
              <span className="hidden sm:block text-sm font-semibold text-[#e2e8f0] truncate max-w-[100px]">
                {currentUser.name}
              </span>

              {/* Logout */}
              <button
                onClick={() => { dispatch(logout()); router.push("/"); }}
                className="hidden sm:block text-[#f87171] bg-red-500/10 border border-red-500/20 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-red-500/20"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/" className="hidden sm:block bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-px transition-all no-underline">
              Get Started →
            </Link>
          )}

          {/* Mobile nav icons */}
          {currentUser && (
            <div className="flex md:hidden items-center gap-2 ml-1">
              <Link href="/dashboard" className="text-slate-400 hover:text-[#e2e8f0] text-base">🏠</Link>
              <Link href="/plans" className="text-slate-400 hover:text-[#e2e8f0] text-base">⭐</Link>

              {/* ✅ Hamburger added */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white text-lg ml-1"
              >
                ☰
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu (NEW) */}
      {menuOpen && currentUser && (
        <div className="md:hidden bg-[#111118] border-t border-indigo-500/15 px-4 py-3 space-y-3">
          <Link href="/dashboard" className="block text-slate-300 py-2 rounded-lg hover:bg-indigo-500/10">
            🏠 Dashboard
          </Link>

          <Link href="/plans" className="block text-slate-300 py-2 rounded-lg hover:bg-indigo-500/10">
            ⭐ Plans
          </Link>

          <div className="border-t border-gray-700 pt-2">
            <p className="text-sm text-white">{currentUser.name}</p>

            <button
              onClick={() => { dispatch(logout()); router.push("/"); }}
              className="mt-2 w-full text-left text-red-400 py-2 rounded-lg hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}