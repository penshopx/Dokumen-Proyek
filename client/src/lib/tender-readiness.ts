export type ReadinessAnswer = "ready" | "partial" | "missing" | "not-required";

export interface ReadinessQuestion {
  id: string;
  title: string;
  prompt: string;
  weight: number;
  recommendation: string;
  href: string;
}

export const TENDER_READINESS_QUESTIONS: ReadinessQuestion[] = [
  {
    id: "sbu",
    title: "SBU dan klasifikasi",
    prompt: "SBU aktif dan klasifikasinya sesuai dengan persyaratan paket tender?",
    weight: 20,
    recommendation: "Cocokkan klasifikasi dan kualifikasi SBU dengan dokumen tender.",
    href: "/sbu",
  },
  {
    id: "skk",
    title: "Personel dan SKK",
    prompt: "Personel inti tersedia dan SKK-nya aktif sesuai kebutuhan tender?",
    weight: 15,
    recommendation: "Periksa masa berlaku SKK serta kecocokan personel yang diminta.",
    href: "/skk",
  },
  {
    id: "experience",
    title: "Pengalaman pekerjaan",
    prompt: "Bukti pengalaman pekerjaan sejenis dan nilai kontraknya sudah terdokumentasi?",
    weight: 15,
    recommendation: "Rapikan kontrak, berita acara, dan bukti pengalaman pekerjaan sejenis.",
    href: "/proyek",
  },
  {
    id: "finance",
    title: "Kapasitas keuangan",
    prompt: "Arus kas dan kemampuan keuangan cukup untuk memenuhi kebutuhan awal proyek?",
    weight: 15,
    recommendation: "Tinjau kebutuhan modal kerja, arus kas, dan dukungan pembiayaan.",
    href: "/keuangan-pajak",
  },
  {
    id: "capacity",
    title: "Kapasitas sumber daya",
    prompt: "Tim, peralatan, dan sumber daya utama tersedia selama masa pekerjaan?",
    weight: 10,
    recommendation: "Pastikan jadwal personel, alat, dan sumber daya tidak bentrok.",
    href: "/equipment",
  },
  {
    id: "timeline",
    title: "Kesesuaian jadwal",
    prompt: "Jadwal paket sesuai dengan kapasitas tim dan pekerjaan lain yang berjalan?",
    weight: 10,
    recommendation: "Bandingkan jadwal tender dengan beban proyek yang sedang berjalan.",
    href: "/proyek",
  },
  {
    id: "competition",
    title: "Persyaratan dan strategi",
    prompt: "Persyaratan administrasi/teknis sudah ditinjau dan strategi penawaran disiapkan?",
    weight: 15,
    recommendation: "Buat matriks kepatuhan dan tinjau strategi sebelum mengirim penawaran.",
    href: "/tendera-claw",
  },
];

export type ReadinessAnswers = Partial<Record<string, ReadinessAnswer>>;

export interface ReadinessGap extends ReadinessQuestion {
  answer: ReadinessAnswer;
  pointsAtRisk: number;
}

export function calculateTenderReadinessScore(
  answers: ReadinessAnswers,
): number | null {
  const applicable = TENDER_READINESS_QUESTIONS.filter(
    (question) => answers[question.id] && answers[question.id] !== "not-required",
  );
  const totalWeight = applicable.reduce((sum, question) => sum + question.weight, 0);

  if (totalWeight === 0) return null;

  const earned = applicable.reduce((sum, question) => {
    const answer = answers[question.id];
    const multiplier = answer === "ready" ? 1 : answer === "partial" ? 0.5 : 0;
    return sum + question.weight * multiplier;
  }, 0);

  return Math.round((earned / totalWeight) * 100);
}

export function getTenderReadinessGaps(
  answers: ReadinessAnswers,
): ReadinessGap[] {
  return TENDER_READINESS_QUESTIONS
    .flatMap((question) => {
      const answer = answers[question.id];
      if (!answer || answer === "ready" || answer === "not-required") return [];

      return [{
        ...question,
        answer,
        pointsAtRisk: question.weight * (answer === "missing" ? 1 : 0.5),
      }];
    })
    .sort((a, b) => b.pointsAtRisk - a.pointsAtRisk);
}
