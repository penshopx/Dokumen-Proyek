import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const OSSRBAPage = lazy(() => import("@/pages/OSSRBAPage"));
const SBUPage = lazy(() => import("@/pages/SBUPage"));
const SKKPage = lazy(() => import("@/pages/SKKPage"));
const ISOSMKPage = lazy(() => import("@/pages/ISOSMKPage"));
const LegalitasPage = lazy(() => import("@/pages/LegalitasPage"));
const ProyekPage = lazy(() => import("@/pages/ProyekPage"));
const MiniAppsPage = lazy(() => import("@/pages/MiniAppsPage"));
const DocGeneratorPage = lazy(() => import("@/pages/DocGeneratorPage"));
const AIDokumen = lazy(() => import("@/pages/AIDokumen"));
const KlinikKonsultasi = lazy(() => import("@/pages/KlinikKonsultasi"));
const BrainProject = lazy(() => import("@/pages/BrainProject"));
const EkosistemKompetensi = lazy(() => import("@/pages/EkosistemKompetensi"));
const BimtekSKK = lazy(() => import("@/pages/BimtekSKK"));
const TenderaClaw = lazy(() => import("@/pages/TenderaClaw"));
const LexComHukum = lazy(() => import("@/pages/LexComHukum"));
const Workroom = lazy(() => import("@/pages/Workroom"));
const SBUClaw = lazy(() => import("@/pages/SBUClaw"));
const KompetensiHub = lazy(() => import("@/pages/KompetensiHub"));
const ASKOMCoach = lazy(() => import("@/pages/ASKOMCoach"));
const MultiClaw = lazy(() => import("@/pages/MultiClaw"));
const BusinessMemory = lazy(() => import("@/pages/BusinessMemory"));
const NotFound = lazy(() => import("@/pages/not-found"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const JasaDokumenSKI = lazy(() => import("@/pages/JasaDokumenSKI"));
const LayananSKI = lazy(() => import("@/pages/LayananSKI"));
const Toko = lazy(() => import("@/pages/Toko"));
const LKPMPage = lazy(() => import("@/pages/LKPMPage"));
const LKUTPage = lazy(() => import("@/pages/LKUTPage"));
const ISOManajemenPage = lazy(() => import("@/pages/ISOManajemenPage"));
const SMAPPancekPage = lazy(() => import("@/pages/SMAPPancekPage"));
const EksekutifSummaryPage = lazy(() => import("@/pages/EksekutifSummaryPage"));
const KonstruksiAIPage = lazy(() => import("@/pages/KonstruksiAIPage"));
const KeuanganPajakPage = lazy(() => import("@/pages/KeuanganPajakPage"));
const GaiaStorePage = lazy(() => import("@/pages/GaiaStorePage"));
const GaiaSIAPPage = lazy(() => import("@/pages/GaiaSIAPPage"));
const PUBLKUTPage = lazy(() => import("@/pages/PUBLKUTPage"));
const LKUTSimulatorPage = lazy(() => import("@/pages/LKUTSimulatorPage"));
const DocumentVerification = lazy(() => import("@/pages/DocumentVerification"));
const EquipmentRental = lazy(() => import("@/pages/EquipmentRental"));
const AgentHub = lazy(() => import("@/pages/AgentHub"));
const TenderReadiness = lazy(() => import("@/pages/TenderReadiness"));

/**
 * DokumenProyek.com is a public services site with authenticated AI workflows.
 * Human-delivered services use WhatsApp; pipeline sessions require an account.
 * AI products hosted by Gustafta are linked from the relevant showcase pages.
 */
function AppRouter() {
  return (
    <Suspense
      fallback={
        <main
          className="grid min-h-screen place-items-center bg-slate-950 text-slate-300"
          role="status"
          aria-live="polite"
        >
          Memuat halaman…
        </main>
      }
    >
      <Switch>
        {/* ── Landing ── */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        {/* Backward-compatible path used by older service and product links. */}
        <Route path="/auth" component={LoginPage} />

      {/* ── Human-delivered services (core product) ── */}
      <Route path="/sbu" component={SBUPage} />
      <Route path="/skk" component={SKKPage} />
      <Route path="/iso-smk3" component={ISOSMKPage} />
      <Route path="/iso-manajemen" component={ISOManajemenPage} />
      <Route path="/legalitas" component={LegalitasPage} />
      <Route path="/oss-rba" component={OSSRBAPage} />
      <Route path="/lkpm" component={LKPMPage} />
      <Route path="/lkut" component={LKUTPage} />
      <Route path="/smap-pancek" component={SMAPPancekPage} />
      <Route path="/jasa-dokumen" component={JasaDokumenSKI} />
      <Route path="/layanan-ski" component={LayananSKI} />

      {/* ── Toko digital (links out to gustafta.my.id) ── */}
      <Route path="/toko" component={Toko} />
      <Route path="/gaia-store" component={GaiaStorePage} />
      <Route path="/gaia-siap" component={GaiaSIAPPage} />
      <Route path="/pub-lkut" component={PUBLKUTPage} />
      <Route path="/lkut-simulator" component={LKUTSimulatorPage} />

      {/* ── Gustafta AI product showcase (marketing pages) ── */}
      <Route path="/agent-hub" component={AgentHub} />
      <Route path="/cek-kesiapan-tender" component={TenderReadiness} />
      <Route path="/tendera-claw" component={TenderaClaw} />
      <Route path="/sbu-claw" component={SBUClaw} />
      <Route path="/lexcom-hukum" component={LexComHukum} />
      <Route path="/ai-dokumen" component={AIDokumen} />
      <Route path="/konsultasi" component={KlinikKonsultasi} />
      <Route path="/workroom" component={Workroom} />
      <Route path="/kompetensi-hub" component={KompetensiHub} />
      <Route path="/askom-coach" component={ASKOMCoach} />
      <Route path="/bimtek-skk" component={BimtekSKK} />
      <Route path="/multiclaw" component={MultiClaw} />
      <Route path="/business-memory" component={BusinessMemory} />
      <Route path="/brain-project" component={BrainProject} />
      <Route path="/ekosistem-kompetensi" component={EkosistemKompetensi} />

      {/* ── Toolkit & utilities ── */}
      <Route path="/doc-generator" component={DocGeneratorPage} />
      <Route path="/mini-apps" component={MiniAppsPage} />
      <Route path="/verify" component={DocumentVerification} />
      <Route path="/eksekutif-summary" component={EksekutifSummaryPage} />
      <Route path="/konstruksi-ai" component={KonstruksiAIPage} />
      <Route path="/keuangan-pajak" component={KeuanganPajakPage} />
      <Route path="/proyek" component={ProyekPage} />
      <Route path="/equipment" component={EquipmentRental} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppInner() {
  return (
    <>
      <Toaster />
      <AppRouter />
      <FloatingChatButton />
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
