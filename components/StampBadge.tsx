export function StampBadge({ label, rotate = 0 }: { label: string; rotate?: number }) {
  return (
    <span className="stamp" style={{ "--r": `${rotate}deg` } as React.CSSProperties}>
      {label}
    </span>
  );
}
