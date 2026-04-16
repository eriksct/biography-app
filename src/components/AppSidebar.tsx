import { useState } from 'react';
import { BookOpen, FileText, PanelLeftClose, PanelLeftOpen, Home } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useProject } from '@/lib/ProjectContext';
import { useParams, Link } from 'react-router-dom';

export function AppSidebar() {
  const { project } = useProject();
  const { projectId } = useParams<{ projectId: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const base = `/projet/${projectId}`;

  if (collapsed) {
    return (
      <aside className="w-14 min-h-screen border-r border-border bg-sidebar flex flex-col items-center py-4 flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          title="Ouvrir le menu"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        <nav className="flex-1 flex flex-col items-center gap-2">
          <NavLink
            to={base}
            end
            className="p-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-primary"
            title="Entretiens"
          >
            <FileText className="w-5 h-5" />
          </NavLink>
          <NavLink
            to={`${base}/manuscrit`}
            className="p-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-primary"
            title="Rédaction"
          >
            <BookOpen className="w-5 h-5" />
          </NavLink>
        </nav>

        <div className="mt-auto">
          <Link to="/" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Accueil">
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-border flex items-start justify-between">
        <Link to="/" className="group flex-1 min-w-0">
          <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
            <Home className="w-3 h-3" />
            Projet
          </p>
          <h2 className="font-serif text-lg font-semibold text-sidebar-foreground leading-tight group-hover:text-primary transition-colors">
            {project.name}
          </h2>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="mt-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
          title="Replier le menu"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to={base}
          end
          className="flex items-center gap-3 px-4 py-3 rounded-md text-content-sm font-sans text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent font-medium text-primary"
        >
          <FileText className="w-5 h-5 flex-shrink-0" />
          <span>Entretiens</span>
        </NavLink>
        <NavLink
          to={`${base}/manuscrit`}
          className="flex items-center gap-3 px-4 py-3 rounded-md text-content-sm font-sans text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent font-medium text-primary"
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          <span>Rédaction</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground font-sans">Biograph</p>
      </div>
    </aside>
  );
}
