"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      title="Sign out"
      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors disabled:opacity-50"
    >
      <LogOut className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}
