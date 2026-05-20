import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Overview from './routes/Overview';
import ChangesList from './routes/ChangesList';
import ChangeDetail from './routes/ChangeDetail';
import SpecsList from './routes/SpecsList';
import SpecDetail from './routes/SpecDetail';

export default function App() {
  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">
          Compass
        </Link>
        <nav>
          <NavLink to="/changes" className={({ isActive }) => (isActive ? 'active' : '')}>
            Changes
          </NavLink>
          <NavLink to="/specs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Specs
          </NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/changes" element={<ChangesList />} />
          <Route path="/changes/:name" element={<ChangeDetail />} />
          <Route path="/specs" element={<SpecsList />} />
          <Route path="/specs/:name" element={<SpecDetail />} />
          <Route
            path="*"
            element={
              <div className="empty">
                Not found. <Link to="/">Back to overview</Link>.
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
