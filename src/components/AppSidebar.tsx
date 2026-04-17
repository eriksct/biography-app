import { useState } from 'react';
import { BookOpen, FileText, PanelLeftClose, PanelLeftOpen, Home } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
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

        <div className="mt-auto flex flex-col items-center gap-2">
          <Link to="/" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Accueil">
            <Home className="w-4 h-4" />
          </Link>
          <UserMenu collapsed />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-1 text-xs font-sans uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mx-0">
          <Home className="w-[15px] h-[20px]" />
          &nbsp;ACCUEIL
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          title="Replier le menu"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 py-4">
        <h2 className="font-serif text-lg font-semibold text-sidebar-foreground leading-tight">
          {project.name}
        </h2>
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
        <UserMenu />
      </div>
    </aside>
  );
}
