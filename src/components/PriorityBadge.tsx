import { PRIORITY_LABELS } from "@/lib/triage";

export function PriorityBadge({ priority }: { priority: number }) {
  const info = PRIORITY_LABELS[priority] || {
    name: `Level ${priority}`,
    badgeClass: "bg-slate-700 text-slate-300 border-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.badgeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {info.name}
    </span>
  );
}
