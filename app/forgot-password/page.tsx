"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = { error: "", submitted: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Reset your password</h1>
        {state.submitted ? (
          <>
            <p className="lede">
              If an account exists for that email, we&rsquo;ve sent a link to reset the password. It expires in
              one hour.
            </p>
            <p className="switch">
              <Link href="/login">Back to log in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="lede">Enter the email on your account and we&rsquo;ll send you a reset link.</p>
            <form action={formAction}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <Turnstile />
              {state.error ? <p className="field-error">{state.error}</p> : null}
              <button className="button" type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="switch">
              <Link href="/login">Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
