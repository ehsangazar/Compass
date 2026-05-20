import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ChangeSummary, Overview as OverviewData, SpecSummary } from '../api';
import ProgressBar from '../components/ProgressBar';

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [changes, setChanges] = useState<ChangeSummary[]>([]);
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.overview(), api.changes(), api.specs()])
      .then(([overview, changesRes, specsRes]) => {
        setData(overview);
        setChanges(changesRes.changes);
        setSpecs(specsRes.specs);
      })
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">Loading…</div>;

  const active = changes.filter((c) => c.status === 'active');
  const archived = changes.filter((c) => c.status === 'archived');
  const draft = changes.filter((c) => c.status === 'draft');

  return (
    <div className="overview">
      <div className="stats">
        <Stat label="Active" value={data.counts.activeChanges} />
        <Stat label="Archived" value={data.counts.archivedChanges} />
        <Stat label="Draft" value={data.counts.draftChanges} />
        <Stat label="Specs" value={data.counts.specs} />
      </div>

      <Section title={`Active changes (${active.length})`}>
        {active.length === 0 ? (
          <div className="empty">No active changes.</div>
        ) : (
          <ul className="card-list">
            {active.map((c) => (
              <li key={c.name} className="card">
                <Link to={`/changes/${c.name}`} className="card-title">
                  {c.name}
                </Link>
                <ProgressBar completed={c.progress.completed} total={c.progress.total} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {draft.length > 0 && (
        <Section title={`Draft (${draft.length})`}>
          <ul className="card-list">
            {draft.map((c) => (
              <li key={c.name} className="card">
                <Link to={`/changes/${c.name}`} className="card-title">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Archived (${archived.length})`}>
        {archived.length === 0 ? (
          <div className="empty">No archived changes yet.</div>
        ) : (
          <ul className="card-list">
            {archived.slice(0, 10).map((c) => (
              <li key={c.name} className="card archived">
                <Link to={`/changes/${c.name}`} className="card-title">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Specs (${specs.length})`}>
        {specs.length === 0 ? (
          <div className="empty">No specs yet.</div>
        ) : (
          <ul className="card-list">
            {specs.map((s) => (
              <li key={s.name} className="card">
                <Link to={`/specs/${s.name}`} className="card-title">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
