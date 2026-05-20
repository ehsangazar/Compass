import { Link, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import Overview from './routes/Overview';
import ChangesList from './routes/ChangesList';
import ChangeDetail from './routes/ChangeDetail';
import SpecsList from './routes/SpecsList';
import SpecDetail from './routes/SpecDetail';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/changes" element={<ChangesList />} />
        <Route path="/changes/:name" element={<ChangeDetail />} />
        <Route path="/specs" element={<SpecsList />} />
        <Route path="/specs/:name" element={<SpecDetail />} />
        <Route
          path="*"
          element={
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              Not found. <Link className="text-primary underline-offset-2 hover:underline" to="/">Back to overview</Link>.
            </div>
          }
        />
      </Routes>
    </AppShell>
  );
}
