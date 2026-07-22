"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Turnstile } from "@/components/Turnstile";
import { signupAction, type SignupState } from "@/app/signup/actions";

const initialState: SignupState = { error: "" };

export function SignupForm() {
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
          placeholder="yourname"
          defaultValue={prefill}
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      </div>
      <div className="field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" type="text" placeholder="Your name" autoComplete="name" />
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
