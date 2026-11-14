export default function Loading() {
  return (
    <div className="adm-page adm-loading" role="status" aria-label="Loading page">
      <span className="adm-sr-only">Loading page…</span>
      <div aria-hidden="true">
        <div className="adm-skeleton adm-skeleton--title" />
        <div className="adm-skeleton adm-skeleton--subtitle" />
        <div className="adm-stats adm-loading-stats">
          {[0, 1, 2].map(i => <div className="adm-card adm-loading-tile" key={i}><div className="adm-skeleton adm-skeleton--short" /><div className="adm-skeleton adm-skeleton--value" /><div className="adm-skeleton adm-skeleton--medium" /></div>)}
        </div>
        <div className="adm-card adm-loading-panel">
          <div className="adm-skeleton adm-skeleton--medium" />
          {[0, 1, 2, 3].map(i => <div className="adm-loading-row" key={i}><div className="adm-skeleton adm-skeleton--short" /><div className="adm-skeleton" /></div>)}
        </div>
      </div>
    </div>
  );
}
