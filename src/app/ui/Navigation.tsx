"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../actions/auth";

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-slate-900 px-4 text-white md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-sm font-semibold">
          Healthcare Panel Fraud Detection
        </span>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-navigation"
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col bg-slate-900 text-white transition-transform duration-200 md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Heading */}
        <div className="flex items-start justify-between border-b border-slate-700 px-6 py-6">
          <h1 className="text-lg font-bold leading-tight">
            Healthcare Panel
            <br />
            Fraud Detection
          </h1>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            className="rounded p-1 text-2xl text-slate-300 hover:text-white md:hidden"
          >
            ×
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
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
            onClick={() => setMenuOpen(false)}
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
    </>
  );
}
