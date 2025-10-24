import { apiFetch } from "@/lib/http";

export type ProvisioningStatusCode = "Pending" | "Active" | "Failed";

export type ProvisioningStatusResponse = {
  status: ProvisioningStatusCode;
  lastUpdated?: string | null;
  lastErrorCode?: string | null;
};

export async function fetchProvisioningStatus(signal?: AbortSignal): Promise<ProvisioningStatusResponse> {
  const response = await apiFetch("/provisioning/status", {
    method: "GET",
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(`provisioning_status_${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const payload = (await response.json().catch(() => ({}))) as Partial<ProvisioningStatusResponse>;
  const status = typeof payload.status === "string" ? payload.status : "Pending";
  return {
    status: status as ProvisioningStatusCode,
    lastUpdated: payload.lastUpdated ?? null,
    lastErrorCode: payload.lastErrorCode ?? null,
  };
}

export async function requestProvisioningRetry(): Promise<void> {
  const response = await apiFetch("/provisioning/retry", {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(`provisioning_retry_${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
}
