import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, SpecSummary } from '../api';

export default function SpecsList() {
  const [specs, setSpecs] = useState<SpecSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.specs()
      .then((res) => setSpecs(res.specs))
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!specs) return <div className="empty">Loading…</div>;

  return (
    <div>
      <h1>Specs</h1>
      {specs.length === 0 ? (
        <div className="empty">No specs yet.</div>
      ) : (
        <ul className="card-list">
          {specs.map((s) => (
            <li key={s.name} className="card">
              <Link to={`/specs/${s.name}`} className="card-title">
                {s.name}
              </Link>
              <span className="dim">{new Date(s.lastModified).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
