"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function DashboardPoller({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          router.refresh();
          setTimeout(() => setIsRefreshing(false), 500);
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setSecondsLeft(7);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Queue Stream</span>
          <span className="text-slate-600">·</span>
          <span>Syncing in {secondsLeft}s</span>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Now</span>
        </button>
      </div>

      {children}
    </div>
  );
}
