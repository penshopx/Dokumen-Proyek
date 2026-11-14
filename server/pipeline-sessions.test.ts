// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import type { Express } from "express";

const OWNER_ID = "pipeline-owner";
const OTHER_ID = "pipeline-other";

const ownedSession = {
  id: 7,
  userId: OWNER_ID,
  pipelineType: "tendera",
  title: "Tender Gedung",
  stage: 1,
  inputData: "{}",
  results: "{}",
  draftType: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

vi.mock("./storage", () => ({
  storage: {
    getHeroContent: vi.fn().mockResolvedValue({ id: 1 }),
    getModules: vi.fn().mockResolvedValue([{}]),
    getUserRoles: vi.fn().mockResolvedValue([{}]),
    getBenefits: vi.fn().mockResolvedValue([{}]),
    getCtaContent: vi.fn().mockResolvedValue({ id: 1 }),
    updateHeroBackgroundImage: vi.fn().mockResolvedValue(undefined),
    getPipelineSessionsByUser: vi.fn().mockResolvedValue([ownedSession]),
    getPipelineSession: vi.fn().mockResolvedValue(ownedSession),
    createPipelineSession: vi.fn().mockResolvedValue(ownedSession),
    updatePipelineSession: vi.fn().mockResolvedValue(ownedSession),
    deletePipelineSession: vi.fn().mockResolvedValue(true),
    prunePipelineSessions: vi.fn().mockResolvedValue(undefined),
  },
}));

let currentUserId = OTHER_ID;
vi.mock("./replit_integrations/auth", () => ({
  isAuthenticated: (req: any, _res: any, next: () => void) => {
    req.user = { id: currentUserId };
    next();
  },
}));

vi.mock("./db", () => ({
  db: {},
  pool: { end: vi.fn() },
}));

let app: Express;

beforeAll(async () => {
  const { createServer } = await import("http");
  const { registerRoutes } = await import("./routes");
  app = express();
  app.use(express.json());
  await registerRoutes(createServer(app), app);
});

describe("pipeline session API validation and synchronization", () => {
  it("rejects unsupported pipeline types", async () => {
    const response = await request(app)
      .post("/api/pipeline-sessions")
      .send({ pipelineType: "other", title: "Invalid" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/pipeline/i);
  });

  it("rejects stages outside the four-step pipeline", async () => {
    const response = await request(app)
      .post("/api/pipeline-sessions")
      .send({ pipelineType: "sbu", title: "SBU", stage: 4 });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/0–3/);
  });

  it("does not report a successful save as failed if old-session pruning fails", async () => {
    const { storage } = await import("./storage");
    vi.mocked(storage.prunePipelineSessions).mockRejectedValueOnce(new Error("prune unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/pipeline-sessions")
      .send({ pipelineType: "tendera", title: "Tender Gedung", stage: 1 });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(7);
    errorSpy.mockRestore();
  });

  it("enforces session ownership before updates", async () => {
    currentUserId = OTHER_ID;
    const response = await request(app)
      .patch("/api/pipeline-sessions/7")
      .send({ title: "Tidak berhak" });

    expect(response.status).toBe(403);
  });

  it("rejects an invalid stage when updating an owned session", async () => {
    currentUserId = OWNER_ID;
    const response = await request(app)
      .patch("/api/pipeline-sessions/7")
      .send({ stage: -1 });

    expect(response.status).toBe(400);
  });
});
