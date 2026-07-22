export function DeviceFrame({ initial, avatarUrl }: { initial: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <div className="device-frame" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- avatarUrl can be a blob: preview URL, which next/image can't optimize */}
        <img src={avatarUrl} alt="" />
      </div>
    );
  }

  return (
    <div className="device-frame" aria-hidden="true">
      {initial}
    </div>
  );
}
