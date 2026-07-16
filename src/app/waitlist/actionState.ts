export type WaitlistActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const emptyWaitlistState: WaitlistActionState = { status: "idle", message: null, fieldErrors: {} };
