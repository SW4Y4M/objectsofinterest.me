"use client";

import { useActionState } from "react";
import { emptyWaitlistState } from "@/app/waitlist/actionState";
import { joinWaitlist } from "@/app/waitlist/actions";

export function WaitlistPanel() {
  const [state, action, pending] = useActionState(joinWaitlist, emptyWaitlistState);
  const emailError = state.fieldErrors.email;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10, color: "#1c1b19" }}>
      <div style={{ position: "absolute", top: 28, left: 32, fontSize: 15, fontWeight: 500 }}>Objects of Interest</div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 32,
          fontSize: 12,
          color: "#6f6a62",
          background: "rgba(248,247,244,0.6)",
          padding: "2px 8px",
          borderRadius: 2
        }}
      >
        drag to explore · scroll to zoom
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 40,
          transform: "translateX(-50%)",
          pointerEvents: "auto",
          width: "min(440px, calc(100vw - 40px))",
          background: "#fffdfa",
          border: "1px solid #ddd7cd",
          boxShadow: "0 18px 44px rgba(28,27,25,0.14)",
          padding: "22px 24px",
          textAlign: "center"
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>Build your objectsofinterest</h1>
        <p style={{ margin: "8px 0 18px", fontSize: 13.5, lineHeight: 1.5, color: "#6f6a62" }}>
          A quiet wall for the objects you want. Join the waitlist.
        </p>
        {state.status === "success" ? (
          <p role="status" style={{ fontSize: 14 }}>
            {state.message}
          </p>
        ) : (
          <form action={action} style={{ display: "flex", gap: 8 }}>
            <label
              htmlFor="waitlist-email"
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
            >
              Email address
            </label>
            <input
              id="waitlist-email"
              name="email"
              type="email"
              placeholder="you@email.com"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "waitlist-email-error" : undefined}
              style={{
                flex: 1,
                border: "1px solid #ddd7cd",
                background: "#f8f7f4",
                padding: "10px 12px",
                fontSize: 14,
                color: "#1c1b19",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={pending}
              style={{
                background: "#1c1b19",
                color: "#f8f7f4",
                border: "none",
                padding: "10px 18px",
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              Join
            </button>
          </form>
        )}
        {emailError ? (
          <p id="waitlist-email-error" style={{ marginTop: 8, fontSize: 12, color: "#6f6a62" }}>
            {emailError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
