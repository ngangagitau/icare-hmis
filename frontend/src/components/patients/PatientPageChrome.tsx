import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PatientPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}

const metricTones = {
  cyan: {
    border: "hover:border-cyan-500/40",
    background: "from-card to-cyan-50/30",
    stripe: "from-cyan-500 to-blue-500",
    icon: "bg-cyan-500/10 text-cyan-600",
    value: "text-cyan-700",
  },
  rose: {
    border: "hover:border-rose-500/40",
    background: "from-card to-rose-50/30",
    stripe: "from-rose-500 to-amber-500",
    icon: "bg-rose-500/10 text-rose-600",
    value: "text-rose-700",
  },
  amber: {
    border: "hover:border-amber-500/40",
    background: "from-card to-amber-50/30",
    stripe: "from-amber-500 to-orange-500",
    icon: "bg-amber-500/10 text-amber-600",
    value: "text-amber-700",
  },
  emerald: {
    border: "hover:border-emerald-500/40",
    background: "from-card to-emerald-50/30",
    stripe: "from-emerald-500 to-teal-500",
    icon: "bg-emerald-500/10 text-emerald-600",
    value: "text-emerald-700",
  },
  blue: {
    border: "hover:border-blue-500/40",
    background: "from-card to-blue-50/30",
    stripe: "from-blue-500 to-indigo-500",
    icon: "bg-blue-500/10 text-blue-600",
    value: "text-blue-700",
  },
} as const;

type MetricTone = keyof typeof metricTones;

interface PatientMetricCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: MetricTone;
}

export function PatientPageHeader({ eyebrow, title, description, icon: Icon, children }: PatientPageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-indigo-800/40 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 text-white shadow-xl md:p-6">
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 sm:flex">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{eyebrow}</p>
            <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">{description}</p>
          </div>
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </section>
  );
}

export function PatientMetricCard({ label, value, note, icon: Icon, tone }: PatientMetricCardProps) {
  const colors = metricTones[tone];

  return (
    <Card className={`group relative overflow-hidden border-border/80 bg-gradient-to-br ${colors.background} shadow-card transition-all duration-300 hover:shadow-elevated ${colors.border}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors.stripe}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-2 text-3xl font-extrabold text-foreground font-heading ${colors.value}`}>{value}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${colors.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}