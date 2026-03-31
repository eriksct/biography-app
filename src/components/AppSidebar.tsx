import { BookOpen, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useProject } from '@/lib/ProjectContext';

export function AppSidebar() {
  const { project } = useProject();

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border">
        <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1">Projet</p>
        <h2 className="font-serif text-lg font-semibold text-sidebar-foreground leading-tight">
          {project.name}
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/"
          end
          className="flex items-center gap-3 px-4 py-3 rounded-md text-content-sm font-sans text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent font-medium text-primary"
        >
          <FileText className="w-5 h-5 flex-shrink-0" />
          <span>Entretiens</span>
        </NavLink>
        <NavLink
          to="/manuscrit"
          className="flex items-center gap-3 px-4 py-3 rounded-md text-content-sm font-sans text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent font-medium text-primary"
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          <span>Manuscrit</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground font-sans">Biograph</p>
      </div>
    </aside>
  );
}
