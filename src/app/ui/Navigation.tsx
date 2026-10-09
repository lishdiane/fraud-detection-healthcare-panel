"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../actions/auth";

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Heading */}
      <div className="border-b border-slate-700 px-6 py-6">
        <h1 className="text-lg font-bold leading-tight">
          Healthcare Panel
          <br />
          Fraud Detection
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
        <Link
          href="/dashboard"
          className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
            pathname === "/dashboard"
              ? "bg-blue-500/80 text-white"
              : "text-slate-200 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/csv"
          className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
            pathname === "/csv"
              ? "bg-blue-500/80 text-white"
              : "text-slate-200 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Upload CSV
        </Link>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
