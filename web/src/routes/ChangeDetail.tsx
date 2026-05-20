import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ChangeDetail as ChangeDetailData } from '../api';
import Markdown from '../components/Markdown';
import ProgressBar from '../components/ProgressBar';

const ARTIFACTS = ['proposal', 'design', 'specs', 'tasks'] as const;
type Artifact = (typeof ARTIFACTS)[number];

export default function ChangeDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<ChangeDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Artifact>('proposal');

  useEffect(() => {
    if (!name) return;
    setData(null);
    setError(null);
    api.change(name)
      .then(setData)
      .catch((err) => setError(String(err)));
  }, [name]);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">Loading…</div>;

  const current =
    tab === 'specs' ? null : data.artifacts.find((a) => a.artifact === tab) ?? null;

  return (
    <article>
      <Link to="/changes" className="back">
        ← Changes
      </Link>
      <header className="detail-header">
        <h1>{data.name}</h1>
        <div className="meta">
          <span className={`badge badge-${data.status}`}>{data.status}</span>
          {data.archivedAs && <span className="dim">archived as {data.archivedAs}</span>}
        </div>
        {data.description && <p className="lead">{data.description}</p>}
        <ProgressBar completed={data.progress.completed} total={data.progress.total} />
      </header>

      <div className="tabs" role="tablist">
        {ARTIFACTS.map((a) => {
          const present =
            a === 'specs'
              ? data.specFiles.length > 0
              : data.artifacts.find((x) => x.artifact === a)?.exists;
          return (
            <button
              key={a}
              role="tab"
              aria-selected={tab === a}
              className={`tab ${tab === a ? 'active' : ''} ${present ? '' : 'absent'}`}
              onClick={() => setTab(a)}
            >
              {a}
              {!present && <span className="dot" aria-hidden> · empty</span>}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {tab === 'specs' ? (
          data.specFiles.length === 0 ? (
            <div className="empty">No spec files in this change.</div>
          ) : (
            data.specFiles.map((s) => (
              <section key={s.name} className="spec-block">
                <h3>{s.name}</h3>
                <Markdown source={s.markdown} />
              </section>
            ))
          )
        ) : current && current.exists ? (
          <Markdown source={current.markdown} />
        ) : (
          <div className="empty">
            No <code>{tab}.md</code> in this change.
          </div>
        )}
      </div>
    </article>
  );
}
