import { BookOpen, CalendarClock, ShieldCheck } from "lucide-react";
import {
  KEPDIRJEN_281,
  KEPDIRJEN_281_DOMAIN_POINTS,
  type Kepdirjen281Domain,
} from "@shared/regulatoryFacts";

interface Kepdirjen281ContextProps {
  domain: Kepdirjen281Domain;
  compact?: boolean;
}

export function Kepdirjen281Context({ domain, compact = false }: Kepdirjen281ContextProps) {
  return (
    <section className={`rounded-2xl border border-blue-200 bg-blue-50/80 ${compact ? "p-4" : "p-5 md:p-6"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-blue-950">{KEPDIRJEN_281.sourceLabel}</h2>
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">RUJUKAN 2026</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-blue-800">
            {KEPDIRJEN_281.title}. Pelaksana {KEPDIRJEN_281.legalBasis} dalam kerangka {KEPDIRJEN_281.framework}.
            {" "}{KEPDIRJEN_281.supersedes} telah dicabut.
          </p>
          <ul className="mt-3 grid gap-2 text-xs text-slate-700 md:grid-cols-3">
            {KEPDIRJEN_281_DOMAIN_POINTS[domain].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-700">
            <CalendarClock className="h-3.5 w-3.5" />
            Masa penyesuaian LSBU paling lambat {KEPDIRJEN_281.transitionDeadline}; status operasional tetap perlu diverifikasi pada sumber resmi.
          </p>
        </div>
      </div>
    </section>
  );
}