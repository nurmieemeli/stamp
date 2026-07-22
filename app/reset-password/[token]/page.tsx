"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = { error: "", success: false };

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const boundAction = resetPasswordAction.bind(null, params.token);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Set a new password</h1>
        {state.success ? (
          <>
            <p className="lede">Your password has been updated.</p>
            <p className="switch">
              <Link href="/login">Log in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="lede">Choose a new password for your account. Links expire after one hour.</p>
            <form action={formAction}>
              <div className="field">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <span className="hint">At least 8 characters.</span>
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {state.error ? <p className="field-error">{state.error}</p> : null}
              <button className="button" type="submit" disabled={pending}>
                {pending ? "Saving…" : "Set password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
