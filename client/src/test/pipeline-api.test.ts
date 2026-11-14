import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deletePipelineSession,
  listPipelineSessions,
  savePipelineSession,
} from "@/lib/pipeline-api";

const savedSession = {
  id: 42,
  userId: "user-1",
  pipelineType: "tendera" as const,
  title: "Jembatan Kota",
  stage: 2,
  inputData: "{}",
  results: "{}",
  draftType: "metode_pelaksanaan",
  createdAt: "2026-11-15T00:00:00.000Z",
  updatedAt: "2026-11-15T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pipeline API synchronization", () => {
  it("surfaces server failures instead of treating a failed list as empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: "Database unavailable" }),
    }));

    await expect(listPipelineSessions("tendera")).rejects.toThrow("Database unavailable");
  });

  it("creates a session and returns its server-assigned id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => savedSession,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await savePipelineSession("tendera", {
      title: "Jembatan Kota",
      stage: 2,
      inputData: "{}",
      results: "{}",
      draftType: "metode_pelaksanaan",
    }, null);

    expect(result.id).toBe(42);
    expect(fetchMock).toHaveBeenCalledWith("/api/pipeline-sessions", expect.objectContaining({
      method: "POST",
      credentials: "include",
    }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      pipelineType: "tendera",
      title: "Jembatan Kota",
      stage: 2,
    });
  });

  it("rejects a forbidden update so the UI can offer a retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: "Tidak diizinkan" }),
    }));

    await expect(savePipelineSession("sbu", {
      title: "Perusahaan Contoh",
      stage: 1,
      inputData: "{}",
      results: "{}",
    }, 10)).rejects.toThrow("Tidak diizinkan");
  });

  it("treats a successful 204 delete as completion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(deletePipelineSession(42)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/pipeline-sessions/42", expect.objectContaining({
      method: "DELETE",
      credentials: "include",
    }));
  });
});
