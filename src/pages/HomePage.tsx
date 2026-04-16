import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Pencil, Trash2, BookOpen, FileText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const { projects, createProject, renameProject, deleteProject } = useApp();
  const navigate = useNavigate();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  const handleCreate = () => {
    const name = createName.trim() || 'Nouvelle biographie';
    const id = createProject(name);
    setCreateOpen(false);
    setCreateName('');
    navigate(`/projet/${id}`);
  };

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameProject(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Biograph</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Mes biographies</h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map(project => (
            <Card
              key={project.id}
              className="group relative cursor-pointer hover:shadow-md transition-shadow min-h-[140px]"
              onClick={() => {
                if (renamingId !== project.id) navigate(`/projet/${project.id}`);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {renamingId === project.id ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitRename();
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        className="font-serif text-base font-semibold h-8 px-2"
                      />
                    ) : (
                      <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
                        {project.name}
                      </h3>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => startRename(project.id, project.name)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground font-sans">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {project.interviews.length} entretien{project.interviews.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {project.chapters.length} chapitre{project.chapters.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create button */}
          <Card
            className="cursor-pointer border-dashed hover:border-primary/50 hover:shadow-sm transition-all"
            onClick={() => { setCreateName(''); setCreateOpen(true); }}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors min-h-[140px]">
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-sm font-sans">Nouvelle biographie</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette biographie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les entretiens et chapitres associés seront perdus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create dialog */}
      <AlertDialog open={createOpen} onOpenChange={open => !open && setCreateOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nouvelle biographie</AlertDialogTitle>
            <AlertDialogDescription>
              Choisissez un titre pour votre biographie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="Ex : Mémoires de Jean Dupont"
            className="font-serif"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate} disabled={!createName.trim()}>
              Créer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
