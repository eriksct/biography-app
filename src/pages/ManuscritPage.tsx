import { useState, useEffect, useRef, useMemo } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { PassageStatus } from '@/lib/types';
import { Plus, FileText, Download, X, BookOpen, CheckCircle, AlertCircle, Circle, PanelLeftOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTagColor } from '@/components/AnnotatedPassageText';
import { ChapterEditor, extractHeadings } from '@/components/ChapterEditor';
export default function ManuscritPage() {
  const { project, addChapter, updateChapter, reorderChapter, markPassageUsed, setPassageStatus } = useProject();
  const [activeChapterId, setActiveChapterId] = useState<string>(project.chapters[0]?.id || '');
  const [showPassagePanel, setShowPassagePanel] = useState(false);
  const [chapterSidebarOpen, setChapterSidebarOpen] = useState(true);
  const [passageFilterThemes, setPassageFilterThemes] = useState<string[]>([]);
  const [passageFilterInterviews, setPassageFilterInterviews] = useState<string[]>([]);
  const [passageFilterStatuses, setPassageFilterStatuses] = useState<PassageStatus[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [dialogInterviewId, setDialogInterviewId] = useState<string | null>(null);
  const [dialogPassageId, setDialogPassageId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (dialogInterviewId && dialogPassageId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [dialogInterviewId, dialogPassageId]);

  const activeChapter = project.chapters.find(c => c.id === activeChapterId);

  // Extract headings per chapter for TOC
  const chapterHeadings = useMemo(() => {
    const map: Record<string, { id: string; text: string }[]> = {};
    project.chapters.forEach(c => {
      map[c.id] = extractHeadings(c.content);
    });
    return map;
  }, [project.chapters]);

  // All passages across interviews (filterable)
  const filteredPassages = project.interviews.flatMap(interview =>
    interview.passages
      .map(p => ({ ...p, interviewId: interview.id, interviewNumber: interview.number }))
  ).filter(p => {
    if (passageFilterStatuses.length > 0 && !passageFilterStatuses.includes(p.status)) return false;
    if (passageFilterThemes.length > 0 && !p.themes.some(t => passageFilterThemes.includes(t))) return false;
    if (passageFilterInterviews.length > 0 && !passageFilterInterviews.includes(p.interviewId)) return false;
    return true;
  });

  useEffect(() => {
    if (dialogInterviewId && dialogPassageId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [dialogInterviewId, dialogPassageId]);

  const handleInsertPassage = (passage: typeof filteredPassages[0]) => {
    if (!activeChapterId || !activeChapter) return;
    const newParagraph = `<p>${passage.text}</p>`;
    const updatedContent = activeChapter.content ? activeChapter.content + newParagraph : newParagraph;
    updateChapter(activeChapterId, { content: updatedContent });
    markPassageUsed(passage.interviewId, passage.id, activeChapterId);
    setShowPassagePanel(false);
  };

  const handleCreateChapter = () => {
    if (newChapterTitle.trim()) {
      addChapter(newChapterTitle.trim());
      setNewChapterTitle('');
      setShowNewChapter(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-screen flex overflow-hidden">
        {/* Chapter sidebar */}
        {chapterSidebarOpen ? (
        <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold">Chapitres</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {project.chapters.map((chapter, chapterIdx) => (
              <div key={chapter.id}>
                <div className="group relative flex items-center">
                  <button
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md font-sans text-sm transition-colors ${
                      activeChapterId === chapter.id
                        ? 'bg-secondary font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {chapter.title}
                  </button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col">
                    {chapterIdx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); reorderChapter(chapter.id, 'up'); }}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {chapterIdx < project.chapters.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); reorderChapter(chapter.id, 'down'); }}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Sub-headings (H2) from chapter content */}
                {(chapterHeadings[chapter.id] || []).map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveChapterId(chapter.id);
                      // Scroll to heading in editor
                      setTimeout(() => {
                        const editorEl = document.querySelector('.ProseMirror');
                        const h2s = editorEl?.querySelectorAll('h2');
                        h2s?.[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="w-full text-left pl-7 pr-3 py-1.5 text-xs font-sans text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-md transition-colors truncate"
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            {showNewChapter ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateChapter()}
                  placeholder="Titre du chapitre…"
                  className="w-full px-3 py-2 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleCreateChapter} className="flex-1 px-3 py-1.5 text-sm font-sans bg-primary text-primary-foreground rounded-md">
                    Créer
                  </button>
                  <button onClick={() => setShowNewChapter(false)} className="px-3 py-1.5 text-sm font-sans text-muted-foreground">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewChapter(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-sans text-primary hover:bg-secondary rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouveau chapitre
              </button>
            )}
          </div>
        </div>
        ) : (
          <div className="w-10 border-r border-border bg-card flex flex-col items-center py-3 flex-shrink-0">
            <button onClick={() => setChapterSidebarOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-sans rounded-md hover:opacity-90 transition-opacity text-secondary-foreground bg-secondary">
              <Download className="w-4 h-4" />
              Exporter en Word
            </button>
            <button
              onClick={() => setShowPassagePanel(!showPassagePanel)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-sans rounded-md transition-colors bg-primary text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              Passages d'entretiens
            </button>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-10">
              {activeChapter ? (
                <>
                  <h1 className="text-3xl font-serif font-semibold mb-6">{activeChapter.title}</h1>
                  <ChapterEditor
                    content={activeChapter.content}
                    onUpdate={(html) => updateChapter(activeChapterId, { content: html })}
                    placeholder="Écrivez ici…"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-sans">Sélectionnez ou créez un chapitre pour commencer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Passage insertion panel */}
        {showPassagePanel && (
          <div className="w-96 border-l border-border bg-card flex flex-col flex-shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-sans font-semibold text-sm">Passages disponibles</h3>
              <button onClick={() => setShowPassagePanel(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-border space-y-2">
              {/* Statut */}
              <div>
                <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Statut</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {([
                    { value: 'non-integre' as PassageStatus, label: 'Non intégré' },
                    { value: 'details-manquants' as PassageStatus, label: 'Détails manquants' },
                    { value: 'integre' as PassageStatus, label: 'Intégré' },
                  ]).map(s => {
                    const active = passageFilterStatuses.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        onClick={() => setPassageFilterStatuses(prev => active ? prev.filter(v => v !== s.value) : [...prev, s.value])}
                        className={`px-2 py-0.5 text-xs font-sans rounded-full transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-border'}`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Thème */}
              <div>
                <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Thème</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.allThemes.map(t => {
                    const active = passageFilterThemes.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => setPassageFilterThemes(prev => active ? prev.filter(v => v !== t) : [...prev, t])}
                        className={`px-2 py-0.5 text-xs font-sans rounded-full transition-colors ${active ? getTagColor(t, project.allThemes) + ' ring-2 ring-primary/50' : getTagColor(t, project.allThemes)}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Entretien */}
              <div>
                <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Entretien</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.interviews.map(i => {
                    const active = passageFilterInterviews.includes(i.id);
                    return (
                      <button
                        key={i.id}
                        onClick={() => setPassageFilterInterviews(prev => active ? prev.filter(v => v !== i.id) : [...prev, i.id])}
                        className={`px-2 py-0.5 text-xs font-sans rounded-full transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-border'}`}
                      >
                        Entretien n°{i.number}
                      </button>
                    );
                  })}
                </div>
              </div>
              {(passageFilterStatuses.length > 0 || passageFilterThemes.length > 0 || passageFilterInterviews.length > 0) && (
                <button
                  onClick={() => { setPassageFilterStatuses([]); setPassageFilterThemes([]); setPassageFilterInterviews([]); }}
                  className="px-2 py-0.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕ Réinitialiser
                </button>
              )}
            </div>

            {/* Passage list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredPassages.length === 0 ? (
                <p className="text-sm font-sans text-muted-foreground text-center py-8">
                  Aucun passage disponible.
                </p>
              ) : (
                filteredPassages.map(passage => {
                  const StatusIcon = passage.status === 'integre' ? CheckCircle : passage.status === 'details-manquants' ? AlertCircle : Circle;
                  const statusColor = passage.status === 'integre' ? 'text-accent' : passage.status === 'details-manquants' ? 'text-amber-500' : 'text-muted-foreground';
                  return (
                    <div
                      key={`${passage.interviewId}-${passage.id}`}
                      className={`p-4 rounded-lg border border-border transition-colors ${passage.status === 'integre' ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                        <span className="text-xs font-sans text-muted-foreground">
                          Entretien n°{passage.interviewNumber}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{passage.timestamp}</span>
                      </div>
                      <p
                        onClick={() => { setDialogInterviewId(passage.interviewId); setDialogPassageId(passage.id); }}
                        className="font-serif text-sm leading-relaxed line-clamp-4 mb-3 cursor-pointer hover:text-primary transition-colors"
                      >{passage.text}</p>
                      <div className="flex gap-1 mb-3">
                        {passage.themes.map(t => (
                          <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-sans ${getTagColor(t, project.allThemes)}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={passage.status}
                          onChange={e => {
                            e.stopPropagation();
                            setPassageStatus(passage.interviewId, passage.id, e.target.value as PassageStatus);
                          }}
                          className="flex-1 px-2 py-1.5 text-xs font-sans bg-secondary text-secondary-foreground rounded-md border-none cursor-pointer"
                        >
                          <option value="non-integre">Non intégré</option>
                          <option value="details-manquants">Détails manquants</option>
                          <option value="integre">Intégré</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interview transcript dialog */}
      <Dialog open={!!dialogInterviewId} onOpenChange={(open) => { if (!open) { setDialogInterviewId(null); setDialogPassageId(null); } }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          {(() => {
            const interview = project.interviews.find(i => i.id === dialogInterviewId);
            if (!interview) return null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">
                    Entretien n°{interview.number}
                  </DialogTitle>
                  <p className="text-sm font-sans text-muted-foreground">
                    {new Date(interview.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {interview.duration}
                  </p>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                  {interview.passages.map(passage => {
                    const isHighlighted = passage.id === dialogPassageId;
                    const StatusIcon = passage.status === 'integre' ? CheckCircle : passage.status === 'details-manquants' ? AlertCircle : Circle;
                    const statusColor = passage.status === 'integre' ? 'text-accent' : passage.status === 'details-manquants' ? 'text-amber-500' : 'text-muted-foreground';
                    const statusLabel = passage.status === 'integre' ? 'Intégré' : passage.status === 'details-manquants' ? 'Détails manquants' : '';
                    return (
                      <div
                        key={passage.id}
                        ref={isHighlighted ? highlightRef : undefined}
                        className={`rounded-lg p-5 transition-all ${
                          isHighlighted
                            ? 'bg-primary/10 ring-2 ring-primary/30'
                            : passage.status === 'integre' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-sans text-muted-foreground font-mono">{passage.timestamp}</span>
                          {passage.themes.map(t => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${getTagColor(t, project.allThemes)}`}>
                              {t}
                            </span>
                          ))}
                          {passage.status !== 'non-integre' && (
                            <>
                              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                              <span className={`text-xs font-sans ${statusColor}`}>{statusLabel}</span>
                            </>
                          )}
                        </div>
                        <p className="font-serif text-content leading-relaxed text-foreground">{passage.text}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
