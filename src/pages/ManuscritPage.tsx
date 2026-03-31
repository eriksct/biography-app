import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { ManuscriptBlock, PassageStatus } from '@/lib/types';
import { Plus, FileText, Download, X, BookOpen, CheckCircle, AlertCircle, Circle } from 'lucide-react';

export default function ManuscritPage() {
  const { project, addChapter, updateBlock, addBlockToChapter, removeBlock, markPassageUsed, setPassageStatus } = useProject();
  const [activeChapterId, setActiveChapterId] = useState<string>(project.chapters[0]?.id || '');
  const [showPassagePanel, setShowPassagePanel] = useState(false);
  const [passageFilterTheme, setPassageFilterTheme] = useState<string | null>(null);
  const [passageFilterInterview, setPassageFilterInterview] = useState<string | null>(null);
  const [passageFilterStatus, setPassageFilterStatus] = useState<PassageStatus | 'all'>('all');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewChapter, setShowNewChapter] = useState(false);

  const activeChapter = project.chapters.find(c => c.id === activeChapterId);

  // All passages across interviews (filterable)
  const filteredPassages = project.interviews.flatMap(interview =>
    interview.passages
      .map(p => ({ ...p, interviewId: interview.id, interviewNumber: interview.number }))
  ).filter(p => {
    if (passageFilterStatus !== 'all' && p.status !== passageFilterStatus) return false;
    if (passageFilterTheme && !p.themes.includes(passageFilterTheme)) return false;
    if (passageFilterInterview && p.interviewId !== passageFilterInterview) return false;
    return true;
  });

  const handleAddTextBlock = () => {
    if (!activeChapterId) return;
    const block: ManuscriptBlock = {
      id: `block-${Date.now()}`,
      type: 'text',
      content: '',
    };
    addBlockToChapter(activeChapterId, block);
  };

  const handleInsertPassage = (passage: typeof unusedPassages[0]) => {
    if (!activeChapterId) return;
    const block: ManuscriptBlock = {
      id: `block-${Date.now()}`,
      type: 'passage',
      content: passage.text,
      passageId: passage.id,
      interviewId: passage.interviewId,
      interviewNumber: passage.interviewNumber,
    };
    addBlockToChapter(activeChapterId, block);
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
        <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold">Chapitres</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {project.chapters.map(chapter => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={`w-full text-left px-3 py-3 rounded-md font-sans text-sm transition-colors ${
                  activeChapterId === chapter.id
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {chapter.title}
              </button>
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

        {/* Main editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPassagePanel(!showPassagePanel)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-sans bg-secondary text-secondary-foreground rounded-md hover:bg-border transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Insérer un passage
              </button>
              <button
                onClick={handleAddTextBlock}
                className="flex items-center gap-2 px-4 py-2 text-sm font-sans text-muted-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter du texte
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-sans bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" />
              Exporter en .docx
            </button>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-10">
              {activeChapter ? (
                <>
                  <h1 className="text-3xl font-serif font-semibold mb-10">{activeChapter.title}</h1>
                  <div className="space-y-6">
                    {activeChapter.blocks.map(block => (
                      <div key={block.id} className="group relative">
                        {block.type === 'passage' ? (
                          <div className="bg-passage-inserted-bg border-l-4 border-primary/30 rounded-r-lg p-5 relative">
                            <p className="font-serif text-content leading-relaxed italic">{block.content}</p>
                            <p className="text-xs font-sans text-muted-foreground mt-3">
                              — Entretien n°{block.interviewNumber}
                            </p>
                            <button
                              onClick={() => removeBlock(activeChapterId, block.id)}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <textarea
                              value={block.content}
                              onChange={e => updateBlock(activeChapterId, block.id, { content: e.target.value })}
                              className="w-full font-serif text-content leading-relaxed bg-transparent resize-none focus:outline-none min-h-[80px]"
                              placeholder="Écrivez ici…"
                              rows={Math.max(3, block.content.split('\n').length + 1)}
                            />
                            <button
                              onClick={() => removeBlock(activeChapterId, block.id)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {activeChapter.blocks.length === 0 && (
                      <p className="text-center text-muted-foreground font-sans py-20">
                        Ce chapitre est vide. Ajoutez du texte ou insérez un passage d'entretien.
                      </p>
                    )}
                  </div>
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
            <div className="p-4 border-b border-border space-y-3">
              <div>
                <label className="text-xs font-sans text-muted-foreground mb-1 block">Par thème</label>
                <select
                  value={passageFilterTheme || ''}
                  onChange={e => setPassageFilterTheme(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm font-sans bg-background border border-input rounded-md"
                >
                  <option value="">Tous les thèmes</option>
                  {project.allThemes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-sans text-muted-foreground mb-1 block">Par entretien</label>
                <select
                  value={passageFilterInterview || ''}
                  onChange={e => setPassageFilterInterview(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm font-sans bg-background border border-input rounded-md"
                >
                  <option value="">Tous les entretiens</option>
                  {project.interviews.map(i => (
                    <option key={i.id} value={i.id}>Entretien n°{i.number}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passage list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {unusedPassages.length === 0 ? (
                <p className="text-sm font-sans text-muted-foreground text-center py-8">
                  Aucun passage disponible.
                </p>
              ) : (
                unusedPassages.map(passage => (
                  <button
                    key={passage.id}
                    onClick={() => handleInsertPassage(passage)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans text-muted-foreground">
                        Entretien n°{passage.interviewNumber}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{passage.timestamp}</span>
                    </div>
                    <p className="font-serif text-sm leading-relaxed line-clamp-4">{passage.text}</p>
                    <div className="flex gap-1 mt-2">
                      {passage.themes.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs font-sans bg-secondary text-secondary-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
