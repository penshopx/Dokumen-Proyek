export type PipelineType = "tendera" | "sbu";

export interface PipelineSession {
  id: number;
  userId: string;
  pipelineType: PipelineType;
  title: string;
  stage: number;
  inputData: string;
  results: string;
  draftType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineSessionPayload {
  title: string;
  stage: number;
  inputData: string;
  results: string;
  draftType?: string | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body && typeof body.message === "string" && body.message) ||
      (body && typeof body.error === "string" && body.error) ||
      `Permintaan gagal (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function listPipelineSessions(type: PipelineType) {
  return request<PipelineSession[]>(`/api/pipeline-sessions?type=${type}`);
}

export function savePipelineSession(
  type: PipelineType,
  payload: PipelineSessionPayload,
  sessionId: number | null,
) {
  const isUpdate = sessionId !== null;
  return request<PipelineSession>(
    isUpdate ? `/api/pipeline-sessions/${sessionId}` : "/api/pipeline-sessions",
    {
      method: isUpdate ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isUpdate ? payload : { pipelineType: type, ...payload }),
    },
  );
}

export function deletePipelineSession(sessionId: number) {
  return request<void>(`/api/pipeline-sessions/${sessionId}`, {
    method: "DELETE",
  });
}
