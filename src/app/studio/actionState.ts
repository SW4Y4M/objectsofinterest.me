import type { ZodError } from "zod";

export type StudioActionStatus = "idle" | "success" | "error";

export type StudioActionState = {
  status: StudioActionStatus;
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const emptyStudioActionState: StudioActionState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

export function toFieldErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((fieldErrors, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
    return fieldErrors;
  }, {});
}
