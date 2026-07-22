export function IndexLink({
  n,
  label,
  sub,
  url,
}: {
  n: number;
  label: string;
  sub?: string;
  url: string;
}) {
  return (
    <a className="index-row" href={url} target="_blank" rel="noopener noreferrer">
      <span className="n">{String(n).padStart(2, "0")}</span>
      <span className="label-group">
        <span className="label">{label}</span>
        {sub ? <span className="sub">{sub}</span> : null}
      </span>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
