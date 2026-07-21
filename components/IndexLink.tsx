export function IndexLink({ n, label, url }: { n: number; label: string; url: string }) {
  return (
    <a className="index-row" href={url} target="_blank" rel="noopener noreferrer">
      <span className="n">{String(n).padStart(2, "0")}</span>
      <span className="label-group">
        <span className="label">{label}</span>
      </span>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
