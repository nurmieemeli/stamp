"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="lede">Log in to edit your page.</p>
        <form action={formAction}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Turnstile />
          {state.error ? <p className="field-error">{state.error}</p> : null}
          <button className="button" type="submit" disabled={pending}>
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="switch">
          New here? <Link href="/signup">Claim your page</Link>
        </p>
      </div>
    </div>
  );
}
