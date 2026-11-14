import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  calculateTenderReadinessScore,
  getTenderReadinessGaps,
  TENDER_READINESS_QUESTIONS,
  type ReadinessAnswer,
  type ReadinessAnswers,
} from "@/lib/tender-readiness";

const STORAGE_KEY = "dokumenproyek.tender-readiness.v1";

interface SavedAssessment {
  answers: ReadinessAnswers;
  step: number;
  complete: boolean;
}

function loadAssessment(): SavedAssessment {
  if (typeof window === "undefined") return { answers: {}, step: 0, complete: false };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { answers: {}, step: 0, complete: false };
    const parsed = JSON.parse(saved) as SavedAssessment;
    if (!parsed || typeof parsed.answers !== "object") {
      return { answers: {}, step: 0, complete: false };
    }
    return {
      answers: parsed.answers,
      step: Math.max(0, Math.min(parsed.step || 0, TENDER_READINESS_QUESTIONS.length - 1)),
      complete: Boolean(parsed.complete),
    };
  } catch {
    return { answers: {}, step: 0, complete: false };
  }
}

const answerOptions: Array<{
  value: ReadinessAnswer;
  label: string;
  description: string;
  icon: typeof Check;
}> = [
  { value: "ready", label: "Siap", description: "Sudah tersedia dan sudah dicek", icon: Check },
  { value: "partial", label: "Perlu dicek", description: "Ada, tetapi belum sepenuhnya pasti", icon: ShieldAlert },
  { value: "missing", label: "Belum siap", description: "Belum tersedia atau ada kekurangan", icon: X },
  { value: "not-required", label: "Tidak disyaratkan", description: "Tidak tercantum pada paket ini", icon: ArrowRight },
];

function scoreLabel(score: number | null) {
  if (score === null) {
    return {
      title: "Perlu ditinjau manual",
      description: "Semua dimensi ditandai tidak disyaratkan. Cocokkan kembali dengan dokumen tender.",
      color: "text-slate-200",
      ring: "border-slate-500",
    };
  }
  if (score >= 80) {
    return {
      title: "Fondasi sudah kuat",
      description: "Sebagian besar area kesiapan sudah terpenuhi. Tetap cocokkan jawaban dengan dokumen tender.",
      color: "text-emerald-300",
      ring: "border-emerald-400",
    };
  }
  if (score >= 55) {
    return {
      title: "Ada hal yang perlu disiapkan",
      description: "Tuntaskan beberapa gap utama sebelum memutuskan mengikuti tender.",
      color: "text-amber-300",
      ring: "border-amber-400",
    };
  }
  return {
    title: "Perkuat persiapan terlebih dahulu",
    description: "Beberapa persyaratan penting masih perlu ditinjau atau dilengkapi.",
    color: "text-rose-300",
    ring: "border-rose-400",
  };
}

export default function TenderReadiness() {
  const saved = useMemo(loadAssessment, []);
  const [answers, setAnswers] = useState<ReadinessAnswers>(saved.answers);
  const [step, setStep] = useState(saved.step);
  const [complete, setComplete] = useState(saved.complete);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step, complete }));
  }, [answers, step, complete]);

  const question = TENDER_READINESS_QUESTIONS[step];
  const currentAnswer = answers[question.id];
  const score = calculateTenderReadinessScore(answers);
  const gaps = getTenderReadinessGaps(answers);
  const status = scoreLabel(score);
  const progress = complete ? 100 : Math.round((step / TENDER_READINESS_QUESTIONS.length) * 100);

  function selectAnswer(answer: ReadinessAnswer) {
    setAnswers((current) => ({ ...current, [question.id]: answer }));
    setCopyError("");
  }

  function nextStep() {
    if (!currentAnswer) return;
    if (step === TENDER_READINESS_QUESTIONS.length - 1) {
      setComplete(true);
      return;
    }
    setStep((current) => Math.min(current + 1, TENDER_READINESS_QUESTIONS.length - 1));
  }

  function previousStep() {
    if (step > 0) setStep((current) => current - 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setComplete(false);
    setCopied(false);
    setCopyError("");
    localStorage.removeItem(STORAGE_KEY);
  }

  const report = useMemo(() => {
    const lines = [
      "Cek Kesiapan Tender — DokumenProyek.com",
      `Skor indikatif: ${score === null ? "belum dapat dihitung" : `${score}/100`}`,
      status.title,
      "",
      ...(gaps.length
        ? ["Area yang perlu ditinjau:", ...gaps.slice(0, 4).map((gap) => `• ${gap.title}: ${gap.recommendation}`)]
        : ["Belum ada gap dari jawaban yang diberikan. Tetap validasi dengan dokumen tender."]),
      "",
      "Hasil ini adalah simulasi awal, bukan jaminan lolos atau keputusan kelayakan resmi.",
    ];
    return lines.join("\n");
  }, [score, status.title, gaps]);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError("Clipboard tidak tersedia di browser ini. Gunakan tombol WhatsApp untuk membagikan ringkasan.");
    }
  }

  const whatsappUrl = `https://wa.me/6282299417818?text=${encodeURIComponent(
    `Halo, saya sudah mencoba Cek Kesiapan Tender DokumenProyek.com.\n\n${report}`,
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#071a31] via-slate-950 to-blue-950 px-4 pt-32 pb-14 sm:py-20">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#8ecbff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/15">
              <ClipboardCheck className="h-6 w-6 text-sky-300" />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <Sparkles className="h-3.5 w-3.5" /> Simulasi gratis · 7 dimensi
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Seberapa siap perusahaan Anda mengikuti tender?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Cek SBU, personel, pengalaman, keuangan, kapasitas, jadwal, dan strategi persyaratan.
              Dapatkan skor indikatif serta langkah berikutnya dalam beberapa menit.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Hasil adalah alat bantu persiapan, bukan jaminan lolos atau keputusan kelayakan resmi.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-between gap-4 text-xs text-slate-400">
              <Link href="/" className="inline-flex items-center gap-2 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Beranda
              </Link>
              {!complete && (
                <span>Dimensi {step + 1} dari {TENDER_READINESS_QUESTIONS.length}</span>
              )}
            </div>

            <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-800" aria-label={`Progres ${progress}%`}>
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {!complete ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-blue-950/20 sm:p-9">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                  {question.title}
                </div>
                <h2 className="mb-7 text-xl font-bold leading-relaxed text-white sm:text-2xl">
                  {question.prompt}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {answerOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = currentAnswer === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => selectAnswer(option.value)}
                        className={`flex min-h-[82px] items-center gap-4 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-sky-400 bg-sky-500/15 ring-2 ring-sky-400/20"
                            : "border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-800/80"
                        }`}
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-sky-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-bold text-white">{option.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-400">{option.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                  <Button variant="ghost" onClick={previousStep} disabled={step === 0} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
                  </Button>
                  <Button onClick={nextStep} disabled={!currentAnswer} className="bg-blue-600 font-bold text-white hover:bg-blue-500 disabled:opacity-40">
                    {step === TENDER_READINESS_QUESTIONS.length - 1 ? "Lihat hasil" : "Lanjut"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-4 text-center text-[11px] text-slate-500">
                  Jawaban tersimpan otomatis di perangkat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/20 sm:p-9">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 bg-slate-950 ${status.ring}`}>
                      <span className="text-4xl font-extrabold text-white">{score === null ? "—" : score}</span>
                      <span className="text-xs text-slate-400">dari 100</span>
                    </div>
                    <h2 className={`text-2xl font-extrabold ${status.color}`}>{status.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{status.description}</p>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                      <ShieldAlert className="h-5 w-5 text-amber-300" />
                      Prioritas tindak lanjut
                    </h3>
                    {gaps.length ? (
                      <div className="space-y-3">
                        {gaps.slice(0, 4).map((gap) => (
                          <div key={gap.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-semibold text-white">{gap.title}</div>
                              <p className="mt-1 text-sm leading-5 text-slate-400">{gap.recommendation}</p>
                            </div>
                            <Link href={gap.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200">
                              Lihat panduan <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
                        Tidak ada gap dari jawaban yang diberikan. Tetap cocokkan seluruh persyaratan dengan dokumen tender yang berlaku.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 rounded-2xl border border-sky-400/15 bg-sky-400/5 p-4 text-xs leading-5 text-slate-300">
                    Skor membandingkan bobot dimensi yang berlaku untuk paket ini. Jawaban “Tidak disyaratkan” tidak masuk penyebut skor.
                    Nilai akhir tetap perlu ditinjau terhadap dokumen pemilihan dan aturan pengadaan yang berlaku.
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-emerald-600 font-bold text-white hover:bg-emerald-500">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Konsultasikan hasil
                    </Button>
                  </a>
                  <Button variant="outline" onClick={copyReport} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white">
                    {copied ? <Check className="mr-2 h-4 w-4 text-emerald-300" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Ringkasan disalin" : "Salin ringkasan"}
                  </Button>
                  <Button variant="ghost" onClick={restart} className="text-slate-400 hover:bg-slate-800 hover:text-white">
                    <RotateCcw className="mr-2 h-4 w-4" /> Ulangi
                  </Button>
                </div>
                {copyError && <p role="alert" className="text-center text-sm text-amber-300">{copyError}</p>}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
