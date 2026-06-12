import type { StudioActionState } from "@/app/studio/actionState";

export function StudioFeedback({ state, id }: { state: StudioActionState; id: string }) {
  if (!state.message) return null;

  return (
    <p id={id} role={state.status === "error" ? "alert" : "status"} className="text-sm text-muted">
      {state.message}
    </p>
  );
}
