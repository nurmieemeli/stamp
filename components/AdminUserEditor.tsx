"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserDetailsAction, type AdminUserUpdateState } from "@/app/admin/actions";
import { PALETTES } from "@/lib/palettes";

type InitialUser = {
  username: string;
  email: string;
  displayName: string;
  eyebrow: string;
  bio: string;
  bioSecondary: string;
  trackTitle: string;
  palette: string;
};

export function AdminUserEditor({ initialUser }: { initialUser: InitialUser }) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [displayName, setDisplayName] = useState(initialUser.displayName);
  const [eyebrow, setEyebrow] = useState(initialUser.eyebrow);
  const [bio, setBio] = useState(initialUser.bio);
  const [bioSecondary, setBioSecondary] = useState(initialUser.bioSecondary);
  const [trackTitle, setTrackTitle] = useState(initialUser.trackTitle);
  const [palette, setPalette] = useState(initialUser.palette);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<AdminUserUpdateState>({ error: "", savedUsername: null });

  function handleSave() {
    startTransition(async () => {
      const result = await updateUserDetailsAction({
        username: initialUser.username,
        newUsername: username,
        email,
        displayName,
        eyebrow,
        bio,
        bioSecondary,
        trackTitle,
        palette,
      });
      setStatus(result);
      if (!result.error && result.savedUsername && result.savedUsername !== initialUser.username) {
        router.replace(`/admin/${result.savedUsername}`);
      }
    });
  }

  return (
    <div className="panel">
      <p className="panel-title">Account</p>
      <div className="field">
        <label htmlFor="admin-username">Handle</label>
        <input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <p className="panel-title" style={{ marginTop: 24 }}>
        Profile
      </p>
      <div className="field">
        <label htmlFor="admin-displayName">Display name</label>
        <input id="admin-displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-eyebrow">Role / location</label>
        <input id="admin-eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-bio">Bio</label>
        <textarea id="admin-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-bioSecondary">Bio, line two</label>
        <textarea id="admin-bioSecondary" value={bioSecondary} onChange={(e) => setBioSecondary(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-trackTitle">Now spinning</label>
        <input id="admin-trackTitle" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-palette">Palette</label>
        <select id="admin-palette" value={palette} onChange={(e) => setPalette(e.target.value)}>
          {PALETTES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <button className="button" type="button" onClick={handleSave} disabled={isPending} style={{ marginTop: 8 }}>
        {isPending ? "Saving…" : "Save details"}
      </button>
      {status.error ? <p className="field-error">{status.error}</p> : null}
      {status.savedUsername && !status.error ? <p className="hint" style={{ marginTop: 12 }}>Saved.</p> : null}
    </div>
  );
}
