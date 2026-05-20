import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ChangeSummary } from '../api';
import ProgressBar from '../components/ProgressBar';

export default function ChangesList() {
  const [changes, setChanges] = useState<ChangeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.changes()
      .then((res) => setChanges(res.changes))
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!changes) return <div className="empty">Loading…</div>;

  const groups: { label: string; items: ChangeSummary[] }[] = [
    { label: 'Active', items: changes.filter((c) => c.status === 'active') },
    { label: 'Draft', items: changes.filter((c) => c.status === 'draft') },
    { label: 'Archived', items: changes.filter((c) => c.status === 'archived') },
  ];

  return (
    <div>
      <h1>Changes</h1>
      {groups.map((g) => (
        <section key={g.label} className="section">
          <h2>
            {g.label} ({g.items.length})
          </h2>
          {g.items.length === 0 ? (
            <div className="empty">None.</div>
          ) : (
            <table className="changes-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Progress</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <Link to={`/changes/${c.name}`}>{c.name}</Link>
                    </td>
                    <td>
                      <ProgressBar completed={c.progress.completed} total={c.progress.total} />
                    </td>
                    <td className="dim">{new Date(c.lastModified).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  );
}
