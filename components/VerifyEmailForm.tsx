"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  verifyEmailAction,
  resendVerificationCodeAction,
  type VerifyEmailState,
} from "@/app/verify-email/actions";

const initialState: VerifyEmailState = { error: "", verified: false };

export function VerifyEmailForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(verifyEmailAction, initialState);
  const [isResending, startResend] = useTransition();
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    if (state.verified) {
      router.push("/dashboard");
    }
  }, [state.verified, router]);

  function handleResend() {
    setResendStatus("");
    startResend(async () => {
      const result = await resendVerificationCodeAction();
      setResendStatus(result.error || (result.sent ? "New code sent." : ""));
    });
  }

  return (
    <>
      <form action={formAction}>
        <div className="field">
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="000000"
            style={{ letterSpacing: "0.3em", textAlign: "center" }}
          />
        </div>
        {state.error ? <p className="field-error">{state.error}</p> : null}
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Verifying…" : "Verify email"}
        </button>
      </form>
      <p className="switch">
        Didn&rsquo;t get it?{" "}
        <button type="button" className="button-ghost button-small" onClick={handleResend} disabled={isResending}>
          {isResending ? "Sending…" : "Resend code"}
        </button>
      </p>
      {resendStatus ? (
        <p className="hint" style={{ marginTop: 8 }}>
          {resendStatus}
        </p>
      ) : null}
    </>
  );
}
