import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { Plus, FileText, Download, X, BookOpen, PanelLeftOpen, GripVertical, ArrowLeft, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTagColor, AnnotatedPassageText } from '@/components/AnnotatedPassageText';
import { ChapterEditor, extractHeadings } from '@/components/ChapterEditor';
export default function ManuscritPage() {
  const { project, addChapter, updateChapter, reorderChapter, moveChapter, markPassageUsed, addTheme, addThemeAnnotation, removeThemeAnnotation } = useProject();
  const [activeChapterId, setActiveChapterId] = useState<string>(project.chapters[0]?.id || '');
  const [showPassagePanel, setShowPassagePanel] = useState(false);
  const [chapterSidebarOpen, setChapterSidebarOpen] = useState(true);
  const [passageFilterThemes, setPassageFilterThemes] = useState<string[]>([]);
  const [passageFilterInterviews, setPassageFilterInterviews] = useState<string[]>([]);
  
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [dialogInterviewId, setDialogInterviewId] = useState<string | null>(null);
  const [dialogPassageId, setDialogPassageId] = useState<string | null>(null);
  const [dialogSelectionInfo, setDialogSelectionInfo] = useState<{
    passageId: string;
    start: number;
    end: number;
    selectedText: string;
    rect: { top: number; left: number };
  } | null>(null);
  const [dialogNewTheme, setDialogNewTheme] = useState('');
  const highlightRef = useRef<HTMLDivElement>(null);
  const [panelTab, setPanelTab] = useState<'entretiens' | 'themes'>('entretiens');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [draggedChapterIdx, setDraggedChapterIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [newThemeManuscrit, setNewThemeManuscrit] = useState('');
  const [selectionInfo, setSelectionInfo] = useState<{
    passageId: string;
    start: number;
    end: number;
    selectedText: string;
    rect: { top: number; left: number };
  } | null>(null);

  const handleTextSelectManuscrit = useCallback(() => {
    if (!selectedInterviewId) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    let node: Node | null = range.startContainer;
    let passageEl: HTMLElement | null = null;
    while (node) {
      if (node instanceof HTMLElement && node.dataset.passageId) { passageEl = node; break; }
      node = node.parentNode;
    }
    if (!passageEl) return;
    const passageId = passageEl.dataset.passageId!;
    const interview = project.interviews.find(i => i.id === selectedInterviewId);
    const passage = interview?.passages.find(p => p.id === passageId);
    if (!passage) return;
    const selText = selection.toString();
    const startIdx = passage.text.indexOf(selText);
    if (startIdx === -1) return;
    const rect = range.getBoundingClientRect();
    setSelectionInfo({
      passageId, start: startIdx, end: startIdx + selText.length, selectedText: selText,
      rect: { top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 },
    });
  }, [selectedInterviewId, project.interviews]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelectManuscrit);
    return () => document.removeEventListener('mouseup', handleTextSelectManuscrit);
  }, [handleTextSelectManuscrit]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectionInfo && !(e.target as HTMLElement).closest('[data-theme-popup-manuscrit]')) {
        setSelectionInfo(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionInfo]);

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
            <h2 className="font-serif text-lg font-semibold">Sommaire</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {project.chapters.map((chapter, chapterIdx) => (
              <div
                key={chapter.id}
                draggable
                onDragStart={() => setDraggedChapterIdx(chapterIdx)}
                onDragEnd={() => { 
                  if (draggedChapterIdx !== null && dragOverIdx !== null) {
                    moveChapter(draggedChapterIdx, dragOverIdx);
                  }
                  setDraggedChapterIdx(null); 
                  setDragOverIdx(null); 
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(chapterIdx); }}
                onDragLeave={() => setDragOverIdx(null)}
                className={`group transition-opacity ${draggedChapterIdx === chapterIdx ? 'opacity-40' : ''}`}
              >
                <div className={`relative flex items-center rounded-md transition-colors ${dragOverIdx === chapterIdx && draggedChapterIdx !== chapterIdx ? 'ring-2 ring-primary/40' : ''}`}>
                  <div className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
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
                  <h1
                    className="text-3xl font-serif font-semibold mb-6 outline-none focus:ring-0"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newTitle = e.currentTarget.textContent?.trim() || activeChapter.title;
                      if (newTitle !== activeChapter.title) {
                        updateChapter(activeChapterId, { title: newTitle });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  >
                    {activeChapter.title}
                  </h1>
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
            {/* Header with tabs */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex gap-1 bg-secondary rounded-md p-0.5">
                <button
                  onClick={() => { setPanelTab('entretiens'); setSelectedInterviewId(null); }}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-colors ${panelTab === 'entretiens' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Entretiens
                </button>
                <button
                  onClick={() => setPanelTab('themes')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-colors ${panelTab === 'themes' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Étiquettes
                </button>
              </div>
              <button onClick={() => setShowPassagePanel(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab: Entretiens */}
            {panelTab === 'entretiens' && (
              <div className="flex-1 overflow-y-auto">
                {selectedInterviewId ? (() => {
                  const interview = project.interviews.find(i => i.id === selectedInterviewId);
                  if (!interview) return null;
                  return (
                    <div className="flex flex-col h-full">
                      <div className="px-4 py-3 border-b border-border">
                        <button
                          onClick={() => setSelectedInterviewId(null)}
                          className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Retour
                        </button>
                        <h4 className="font-sans font-semibold text-sm">Entretien n°{interview.number}</h4>
                        <p className="text-xs font-sans text-muted-foreground">
                          {new Date(interview.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {interview.duration}
                        </p>
                        {/* Audio player */}
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-primary rounded-full" />
                          </div>
                          <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">{interview.duration}</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                        {interview.passages.map(passage => {
                          return (
                            <div
                              key={passage.id}
                              className="p-3 rounded-lg border border-border transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-muted-foreground">{passage.timestamp}</span>
                              </div>
                              <p className="font-serif text-sm leading-relaxed mb-2" data-passage-id={passage.id}>
                                <AnnotatedPassageText
                                  text={passage.text}
                                  annotations={passage.themeAnnotations}
                                  allThemes={project.allThemes}
                                  onRemoveAnnotation={(annId: string) => removeThemeAnnotation(interview.id, passage.id, annId)}
                                />
                              </p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {passage.themes.map(t => (
                                  <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-sans ${getTagColor(t, project.allThemes)}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                              {activeChapter && (
                                <button
                                  onClick={() => handleInsertPassage({ ...passage, interviewId: interview.id, interviewNumber: interview.number })}
                                  className="text-xs font-sans text-primary hover:underline"
                                >
                                  + Insérer dans le chapitre
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Theme assignment popup */}
                        {selectionInfo && (
                          <div
                            data-theme-popup-manuscrit
                            className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl py-2 min-w-[180px]"
                            style={{
                              top: selectionInfo.rect.top + 8,
                              left: selectionInfo.rect.left,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <div className="px-3 py-1.5 border-b border-border mb-1">
                              <p className="text-xs font-sans text-muted-foreground">Associer une étiquette :</p>
                            </div>
                            {project.allThemes.map((theme: string) => (
                              <button
                                key={theme}
                                onClick={() => {
                                  addThemeAnnotation(interview.id, selectionInfo.passageId, selectionInfo.start, selectionInfo.end, theme);
                                  setSelectionInfo(null);
                                  window.getSelection()?.removeAllRanges();
                                }}
                                className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-secondary transition-colors"
                              >
                                {theme}
                              </button>
                            ))}
                            <div className="border-t border-border mt-1 px-3 pt-2 flex gap-1">
                              <input
                                type="text"
                                value={newThemeManuscrit}
                                onChange={(e) => setNewThemeManuscrit(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newThemeManuscrit.trim()) {
                                    addTheme(newThemeManuscrit.trim());
                                    addThemeAnnotation(interview.id, selectionInfo.passageId, selectionInfo.start, selectionInfo.end, newThemeManuscrit.trim());
                                    setNewThemeManuscrit('');
                                    setSelectionInfo(null);
                                    window.getSelection()?.removeAllRanges();
                                  }
                                }}
                                placeholder="Créer une étiquette..."
                                className="flex-1 px-2 py-1 text-xs font-sans bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <button
                                onClick={() => {
                                  if (newThemeManuscrit.trim()) {
                                    addTheme(newThemeManuscrit.trim());
                                    addThemeAnnotation(interview.id, selectionInfo.passageId, selectionInfo.start, selectionInfo.end, newThemeManuscrit.trim());
                                    setNewThemeManuscrit('');
                                    setSelectionInfo(null);
                                    window.getSelection()?.removeAllRanges();
                                  }
                                }}
                                className="p-1 text-primary hover:bg-secondary rounded transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="p-4 space-y-2">
                    {project.interviews.map(interview => (
                      <button
                        key={interview.id}
                        onClick={() => setSelectedInterviewId(interview.id)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div className="font-sans font-medium text-sm">Entretien n°{interview.number}</div>
                        <p className="text-xs font-sans text-muted-foreground mt-0.5">
                          {new Date(interview.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {interview.duration} · {interview.passages.length} passages
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Étiquettes */}
            {panelTab === 'themes' && (
              <>
                {/* Filters */}
                <div className="px-4 py-3 border-b border-border space-y-2">
                  <div>
                    <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Étiquette</span>
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
                  {(passageFilterThemes.length > 0 || passageFilterInterviews.length > 0) && (
                    <button
                      onClick={() => { setPassageFilterThemes([]); setPassageFilterInterviews([]); }}
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
                      return (
                        <div
                          key={`${passage.interviewId}-${passage.id}`}
                          className="p-4 rounded-lg border border-border transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-sans text-muted-foreground">
                              Entretien n°{passage.interviewNumber}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">{passage.timestamp}</span>
                          </div>
                          <p
                            onClick={() => { setDialogInterviewId(passage.interviewId); setDialogPassageId(passage.id); }}
                            className="font-serif text-sm leading-relaxed line-clamp-4 mb-3 cursor-pointer hover:text-primary transition-colors"
                          >
                            <AnnotatedPassageText text={passage.text} annotations={passage.themeAnnotations} allThemes={project.allThemes} />
                          </p>
                          <div className="flex gap-1 mb-3">
                            {passage.themes.map(t => (
                              <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-sans ${getTagColor(t, project.allThemes)}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
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
                    return (
                      <div
                        key={passage.id}
                        ref={isHighlighted ? highlightRef : undefined}
                        className={`rounded-lg p-5 transition-all ${
                          isHighlighted ? 'bg-primary/10 ring-2 ring-primary/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-sans text-muted-foreground font-mono">{passage.timestamp}</span>
                          {passage.themes.map(t => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${getTagColor(t, project.allThemes)}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="font-serif text-content leading-relaxed text-foreground">
                          <AnnotatedPassageText text={passage.text} annotations={passage.themeAnnotations} allThemes={project.allThemes} />
                        </p>
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
