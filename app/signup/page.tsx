"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = { error: "" };

function SignupForm() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("u") ?? "";
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction}>
      <div className="field">
        <label htmlFor="inviteCode">Invite code</label>
        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          placeholder="XXXXX-XXXXX"
          required
          autoComplete="off"
          autoCapitalize="characters"
          style={{ textTransform: "uppercase" }}
        />
        <span className="hint">Stamp is invite-only right now — ask a member or admin for a code.</span>
      </div>
      <div className="field">
        <label htmlFor="username">Handle</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="rhea"
          defaultValue={prefill}
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      </div>
      <div className="field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" type="text" placeholder="Rhea Solano" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
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
      <Turnstile />
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Claim your page</h1>
        <p className="lede">stamp.rip/yourname — yours in under a minute.</p>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
        <p className="switch">
          Already have a page? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
