"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ProfileView } from "@/components/ProfileView";
import {
  saveProfileAction,
  uploadAvatarAction,
  removeAvatarAction,
  type SaveProfilePayload,
  type SaveState,
  type AvatarState,
} from "@/app/dashboard/actions";
import { PLATFORMS, getPlatform, getPlatformLabel, resolveLinkUrl, displayUrl } from "@/lib/platforms";
import { PALETTES, DEFAULT_PALETTE } from "@/lib/palettes";
import type { ProfileData } from "@/lib/types";

const MAX_AVATAR_BYTES = 8 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type EditableLink = { id: string; platform: string; value: string };

type InitialProfile = {
  displayName: string;
  eyebrow: string;
  bio: string;
  bioSecondary: string;
  trackTitle: string;
  avatarUrl: string;
  palette: string;
  viewCount: number;
  links: EditableLink[];
  badges: { key: string; label: string }[];
};

let linkIdCounter = 0;
function newLinkId() {
  linkIdCounter += 1;
  return `new-${linkIdCounter}`;
}

export function DashboardEditor({
  username,
  joinYear,
  initialProfile,
}: {
  username: string;
  joinYear: number;
  initialProfile: InitialProfile;
}) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [eyebrow, setEyebrow] = useState(initialProfile.eyebrow);
  const [bio, setBio] = useState(initialProfile.bio);
  const [bioSecondary, setBioSecondary] = useState(initialProfile.bioSecondary);
  const [trackTitle, setTrackTitle] = useState(initialProfile.trackTitle);
  const [links, setLinks] = useState<EditableLink[]>(initialProfile.links);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [paletteKey, setPaletteKey] = useState(initialProfile.palette || DEFAULT_PALETTE);
  const [avatarStatus, setAvatarStatus] = useState<AvatarState>({ error: "", avatarUrl: null });
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveState>({ error: "", savedAt: null });

  const previewProfile: ProfileData = useMemo(
    () => ({
      username,
      displayName: displayName || username,
      eyebrow,
      bio,
      bioSecondary,
      trackTitle,
      avatarUrl: avatarPreview ?? avatarUrl,
      paletteKey,
      viewCount: initialProfile.viewCount,
      joinYear,
      badges: initialProfile.badges,
      links: links
        .filter((l) => l.value.trim())
        .map((l) => {
          const url = resolveLinkUrl(l.platform, l.value);
          return { id: l.id, label: getPlatformLabel(l.platform), sub: displayUrl(url), url };
        }),
    }),
    [
      username,
      displayName,
      eyebrow,
      bio,
      bioSecondary,
      trackTitle,
      avatarPreview,
      avatarUrl,
      paletteKey,
      links,
      joinYear,
      initialProfile.viewCount,
      initialProfile.badges,
    ],
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarStatus({ error: "Use a JPG, PNG, or WEBP image.", avatarUrl: null });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarStatus({ error: "Image must be smaller than 8MB.", avatarUrl: null });
      e.target.value = "";
      return;
    }

    setAvatarStatus({ error: "", avatarUrl: null });
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const formData = new FormData();
    formData.append("avatar", file);
    startAvatarTransition(async () => {
      const result = await uploadAvatarAction(formData);
      setAvatarStatus(result);
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview(null);
      if (!result.error && result.avatarUrl !== null) {
        setAvatarUrl(result.avatarUrl);
      }
    });
    e.target.value = "";
  }

  function handleRemoveAvatar() {
    startAvatarTransition(async () => {
      const result = await removeAvatarAction();
      setAvatarStatus(result);
      if (!result.error && result.avatarUrl !== null) {
        setAvatarUrl(result.avatarUrl);
      }
    });
  }

  function updateLink(id: string, patch: Partial<EditableLink>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [...prev, { id: newLinkId(), platform: PLATFORMS[0].key, value: "" }]);
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function handleSave() {
    const payload: SaveProfilePayload = {
      displayName,
      eyebrow,
      bio,
      bioSecondary,
      trackTitle,
      palette: paletteKey,
      links: links.map((l) => ({ platform: l.platform, value: l.value })),
    };
    startTransition(async () => {
      const result = await saveProfileAction(payload);
      setStatus(result);
    });
  }

  const currentAvatarSrc = avatarPreview ?? (avatarUrl || null);

  return (
    <div className="dashboard-shell">
      <div>
        <div className="panel">
          <p className="panel-title">Photo</p>
          <div className="avatar-row">
            <div className={`avatar-preview${currentAvatarSrc ? "" : " avatar-preview-empty"}`}>
              {currentAvatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL
                <img src={currentAvatarSrc} alt="" />
              ) : (
                <span>{(displayName || username).charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="avatar-actions">
              <div className="avatar-buttons">
                <button
                  type="button"
                  className="button-ghost button-small"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isAvatarPending}
                >
                  {isAvatarPending ? "Uploading…" : currentAvatarSrc ? "Replace photo" : "Upload photo"}
                </button>
                {avatarUrl ? (
                  <button
                    type="button"
                    className="button-ghost button-small"
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarPending}
                  >
                    Remove
                  </button>
                ) : null}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  hidden
                />
              </div>
              <p className="hint">JPG, PNG, or WEBP. Up to 8MB — cropped to a square.</p>
              {avatarStatus.error ? <p className="field-error">{avatarStatus.error}</p> : null}
            </div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Palette</p>
          <div className="palette-picker">
            <div className="palette-swatches">
              {PALETTES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="palette-swatch"
                  aria-label={p.label}
                  aria-pressed={p.key === paletteKey}
                  onClick={() => setPaletteKey(p.key)}
                >
                  <span className="fill" style={{ background: p.tokens.accent }} />
                </button>
              ))}
            </div>
            <span className="palette-label">{PALETTES.find((p) => p.key === paletteKey)?.label}</span>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Identity</p>
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="eyebrow">Role / location</label>
            <input
              id="eyebrow"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Sound Archivist — Bristol, UK"
            />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="bioSecondary">Bio, line two (optional)</label>
            <textarea
              id="bioSecondary"
              value={bioSecondary}
              onChange={(e) => setBioSecondary(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="trackTitle">Now spinning (optional)</label>
            <input
              id="trackTitle"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Coastal Static — Side A, Tape 14"
            />
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Links</p>
          {links.map((link) => {
            const platform = getPlatform(link.platform) ?? PLATFORMS[0];
            const fieldLabel =
              platform.mode === "email" ? "Email" : platform.mode === "url" ? "URL" : "Handle";
            return (
              <div className="link-editor-row" key={link.id}>
                <div className="field field-tight">
                  <label>Platform</label>
                  <select
                    value={link.platform}
                    onChange={(e) => updateLink(link.id, { platform: e.target.value })}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field field-tight">
                  <label>{fieldLabel}</label>
                  {platform.mode === "handle" ? (
                    <div className="handle-input">
                      {platform.handlePrefix ? <span className="affix">{platform.handlePrefix}</span> : null}
                      <input
                        value={link.value}
                        onChange={(e) => updateLink(link.id, { value: e.target.value })}
                        placeholder={platform.placeholder}
                      />
                      {platform.handleSuffix ? <span className="affix">{platform.handleSuffix}</span> : null}
                    </div>
                  ) : (
                    <input
                      value={link.value}
                      onChange={(e) => updateLink(link.id, { value: e.target.value })}
                      placeholder={platform.placeholder}
                    />
                  )}
                </div>
                <button type="button" className="button-ghost button-small" onClick={() => removeLink(link.id)}>
                  Remove
                </button>
              </div>
            );
          })}
          <button type="button" className="button-ghost button-small" style={{ marginTop: 16 }} onClick={addLink}>
            + Add link
          </button>
        </div>

        <div className="panel">
          <p className="panel-title">Badges</p>
          <p className="hint">
            {initialProfile.badges.length > 0
              ? initialProfile.badges.map((b) => b.label).join(" · ")
              : "No badges yet."}
          </p>
          <p className="hint" style={{ marginTop: 8 }}>
            Badges are granted by the Stamp team — you can&rsquo;t add these yourself.
          </p>
        </div>

        <button className="button" type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {status.error ? <p className="field-error">{status.error}</p> : null}
        {status.savedAt && !status.error ? <p className="hint" style={{ marginTop: 12 }}>Saved.</p> : null}
      </div>

      <div className="preview-frame">
        <p className="preview-label">Live preview</p>
        <ProfileView profile={previewProfile} />
      </div>
    </div>
  );
}
