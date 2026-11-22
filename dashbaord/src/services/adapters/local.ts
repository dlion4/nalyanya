import type { Workflow, LedgerEntry } from "@/types/workspace";
export type SimulationRequest = {
  kind: Exclude<Workflow, "event-create">;
  title: string;
  amount: number;
  branch: string;
  member?: string;
  purpose?: string;
  note?: string;
};
export async function simulate(
  request: SimulationRequest,
): Promise<LedgerEntry> {
  await new Promise((resolve) => setTimeout(resolve, 420));
  const delta =
    request.kind === "deposit" || request.kind === "contribute"
      ? request.amount
      : request.kind === "withdraw"
        ? -request.amount
        : 0;
  return {
    ...request,
    id: `NY-SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    date: new Date().toISOString(),
    delta,
  };
}
