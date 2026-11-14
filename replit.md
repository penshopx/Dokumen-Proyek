# DokumenProyek.com - Platform Konstruksi Terintegrasi

## Overview
DokumenProyek.com dikelola oleh **Gustafta** dan bekerja dengan beberapa mitra. PT Sarana Kompetensi Indonesia (SKI) adalah salah satu mitra kerja, bukan pengelola platform. Situs ini menyajikan layanan legalitas, perizinan, sertifikasi, tender, dan dokumen proyek, serta alur AI yang memerlukan akun.

## Project Goals
- Platform jasa dokumen & konsultasi usaha #1 Indonesia — multi-sektor
- Model keagenan 3-Tier: Pusat (L1) + Master Agent/Regional (L2) + Fasilitator Lapangan (L3)
- OpenClaw multi-agent AI: Orchestrator + 11 Specialist Agents + RAG regulasi Indonesia
- 4 Jenis lisensi agen: Referral, Service, Master Agent, Strategic Institutional Partner
- 3 Pilar sertifikasi: Badan Usaha + Kompetensi Kerja + Manajemen Usaha
- Bundling paket: Startup Contractor, Tender Ready, ISO & Compliance, Supply Chain Ready
- chat.dokumenproyek.com sebagai sentra draft dokumen berbasis LLM (6 GPTs + 8 mini apps)
- Ekosistem terintegrasi: jasa dokumen + edukasi kompetensi (flywheel growth)

## Business Model
- **Layanan Inti**: Legalitas, Perizinan, SBU, SKK, ISO/SMK3, Tender, Proyek
- **Segmentasi Sektor**: Konstruksi (prioritas), Ketenagalistrikan, EBT, Mineral & Tambang, Lingkungan, Engineering Services
- **Model Keagenan 3-Tier**: Pusat L1 (processing + QA + AI) → Master Agent L2 (regional network) → Fasilitator L3 (lapangan)
- **4 Jenis Lisensi**: Referral Agent | Service Agent | Master Agent/Regional Operator | Strategic Institutional Partner
- **Monetisasi**: Fee layanan + Subscription/retainer + Lisensi agen + Enterprise partnership + Renewal management
- **OpenClaw AI**: diferensiator kompetitif — 11 agen spesialis termasuk Document Review, Sales & Intake, Document Generator

## Current State
- Landing page layanan publik, halaman layanan dan regulasi, halaman produk AI, serta alat kesiapan tender.
- Login memakai OTP email/WhatsApp dan Google OAuth bila kredensial tersedia; rute `/login` adalah URL utama. `/auth` dipertahankan sebagai alias lama.
- TenderaClaw dan SBUClaw memakai empat tahap pipeline. Tahap, input, hasil, dan riwayat disimpan per pengguna di PostgreSQL melalui `/api/pipeline-sessions`.
- API pipeline memvalidasi jenis dan tahap, memeriksa kepemilikan sesi, dan membatasi riwayat ke 10 sesi terbaru per jenis.
- UI pipeline menampilkan kegagalan sinkronisasi serta menyediakan pengiriman ulang tanpa menjalankan ulang analisis AI.
- Fitur AI eksternal di-host oleh Gustafta; halaman lokal yang memakai iframe harus memberi tahu pengguna bila konten tidak dapat dimuat.
- Nyatakan Gustafta sebagai pengelola platform. PT SKI adalah salah satu dari beberapa mitra kerja.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL dengan Drizzle ORM (`shared/schema.ts` sebagai sumber skema)
- **Authentication**: sesi Express dan Passport, OTP email/WhatsApp, serta Google OAuth opsional; Replit OIDC hanya kompatibilitas lama.

## Build, Data & Release Workflow
- Preview memakai workflow `Start application` dengan `npm run dev` pada port 5000.
- Pemeriksaan lokal: `npm run check`, `npm test`, `npm run test:e2e`, dan `npm run build`.
- Deploy menjalankan `npm run build`, lalu `npm run start` dari `dist/index.cjs`.
- Skema Drizzle di `shared/schema.ts` adalah sumber kebenaran. `npm run db:push` dan skrip post-merge hanya menyelaraskan database development.
- Untuk Replit PostgreSQL terkelola, perubahan skema production diterapkan lewat Publish UI; jangan menjalankan DDL production dari proses build atau startup.

## Project Architecture
```
client/
└── src/
    ├── App.tsx                 # Route and lazy page loading
    ├── pages/                  # Public services, AI tools, login, utilities
    ├── components/             # Shared UI, navigation and service embeds
    ├── hooks/                  # Auth, contact and UI hooks
    └── lib/
        ├── pipeline-api.ts     # Shared TenderaClaw/SBUClaw persistence client
        └── queryClient.ts
server/
├── index.ts                    # Express server and workflow startup
├── routes.ts                   # Authenticated API and pipeline endpoints
├── storage.ts                  # Drizzle persistence
├── db.ts                       # PostgreSQL connection
└── auth/                       # Email/WhatsApp OTP and Google OAuth
shared/
├── schema.ts                   # Drizzle source of truth
└── models/auth.ts              # User and session models
```

## Database Schema
- **users** - User accounts for OTP, Google OAuth, and legacy OIDC sessions
- **sessions** - Session storage
- **user_profiles** - Extended user info with stakeholder type
- **contact_messages** - Contact form submissions
- **modules** - Platform modules/features
- **user_roles** - Stakeholder types display
- **benefits** - Platform benefits
- **hero_content** - Landing page hero section
- **cta_content** - Call-to-action section
- **opportunities** - Tender/project opportunities
- **products** - Marketplace products
- **pipeline_sessions** - TenderaClaw and SBUClaw workflow state per user
- **auth_otp_challenges / app_rate_limit_buckets** - OTP verification and shared rate-limit state

## Stakeholder Types
1. **Kontraktor** - Construction contractors
2. **Konsultan** - Consultants
3. **Vendor** - Equipment/material vendors
4. **Supplier** - Material suppliers
5. **Tenaga Kerja** - Construction workers
6. **Masyarakat** - Service users

## Modules
1. Kompeten & Latih - Training and certification
2. Tuman (Tenaga Kerja) - Worker matching
3. RancangBangun - Design and build services
4. Pasok (Marketplace) - Material marketplace
5. Tender - Tender document generator
6. Perizinan & Legalitas - Licensing and permits
7. Kendali Proyek - Project monitoring
8. Penilai Ahli - Expert consultation
9. Alat - Equipment rental
10. Financial - Financial management
11. Safety Ready - K3/Safety compliance
12. Ekonomi Sirkular - Circular economy

## Documentation Note
Use the current route map in `client/src/App.tsx`, `shared/schema.ts`, and the workflow commands above as the source of truth. Earlier implementation notes were removed because they no longer matched the active app.

## External Integrations
- **AI Chat**: https://chat.dokumenproyek.com - AI assistant for tender documents, project analysis, construction consultation
  - Features: Voice Transcription, Image Generation, Deep Research, Product Photoshoot

## User Preferences
- Language: Indonesian (Bahasa Indonesia)
- Platform focus: Construction industry
