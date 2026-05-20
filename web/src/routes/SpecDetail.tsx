import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, SpecDetail as SpecDetailData } from '../api';
import Markdown from '../components/Markdown';

export default function SpecDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<SpecDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setData(null);
    setError(null);
    api.spec(name)
      .then(setData)
      .catch((err) => setError(String(err)));
  }, [name]);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">Loading…</div>;

  return (
    <article>
      <Link to="/specs" className="back">
        ← Specs
      </Link>
      <header className="detail-header">
        <h1>{data.name}</h1>
        <div className="meta">
          <span className="dim">modified {new Date(data.lastModified).toLocaleDateString()}</span>
        </div>
      </header>
      <Markdown source={data.markdown} />
    </article>
  );
}
