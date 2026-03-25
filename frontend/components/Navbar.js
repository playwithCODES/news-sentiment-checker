"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white shadow-sm dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          News Sentiment Checker
        </Link>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-100 px-4 py-2 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/history"
            className="rounded-lg bg-slate-100 px-4 py-2 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
          >
            History
          </Link>

          <Link
            href="/profile"
            className="rounded-lg bg-slate-100 px-4 py-2 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
          >
            Profile
          </Link>

          <button
            onClick={toggleTheme}
            className="bg-slate-700 text-white hover:bg-slate-800"
          >
            {darkMode ? "Light" : "Dark"} Mode
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
