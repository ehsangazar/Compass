import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  GitBranch,
  FileText,
  Moon,
  Sun,
  CircleDot,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api, ChangeSummary, SpecSummary } from '../../api';
import { useTheme } from '../theme-provider';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const PRIMARY = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/changes', label: 'Changes', icon: GitBranch },
  { to: '/specs', label: 'Specs', icon: FileText },
];

function statusIcon(status: ChangeSummary['status']) {
  if (status === 'active') return CircleDot;
  if (status === 'archived') return CheckCircle2;
  return Circle;
}

export function Sidebar() {
  const [changes, setChanges] = useState<ChangeSummary[]>([]);
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const location = useLocation();

  useEffect(() => {
    api.changes().then((r) => setChanges(r.changes)).catch(() => {});
    api.specs().then((r) => setSpecs(r.specs)).catch(() => {});
  }, [location.pathname]);

  const activeChanges = changes.filter((c) => c.status === 'active');
  const archived = changes.filter((c) => c.status === 'archived');

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Compass</span>
          <span className="text-[10px] text-muted-foreground">spec-driven</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {activeChanges.length > 0 && (
          <>
            <SidebarHeading>Active changes</SidebarHeading>
            <ul className="flex flex-col gap-0.5">
              {activeChanges.map((c) => (
                <SidebarChange key={c.name} change={c} />
              ))}
            </ul>
          </>
        )}

        {archived.length > 0 && (
          <>
            <SidebarHeading>Archived ({archived.length})</SidebarHeading>
            <ul className="flex flex-col gap-0.5">
              {archived.slice(0, 8).map((c) => (
                <SidebarChange key={c.name} change={c} />
              ))}
            </ul>
          </>
        )}

        {specs.length > 0 && (
          <>
            <SidebarHeading>Specs</SidebarHeading>
            <ul className="flex flex-col gap-0.5">
              {specs.map((s) => (
                <li key={s.name}>
                  <NavLink
                    to={`/specs/${s.name}`}
                    className={({ isActive }) =>
                      cn(
                        'flex h-7 items-center gap-2 rounded-md px-2 text-xs transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )
                    }
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate">{s.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <Separator />
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function SidebarChange({ change }: { change: ChangeSummary }) {
  const Icon = statusIcon(change.status);
  return (
    <li>
      <NavLink
        to={`/changes/${change.name}`}
        className={({ isActive }) =>
          cn(
            'flex h-7 items-center gap-2 rounded-md px-2 text-xs transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )
        }
      >
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            change.status === 'active' && 'text-warning',
            change.status === 'archived' && 'text-success'
          )}
        />
        <span className="truncate">{change.name}</span>
      </NavLink>
    </li>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;
  const label = theme === 'dark' ? 'Light' : 'Dark';
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-2"
      title={`Switch to ${label.toLowerCase()} theme`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
