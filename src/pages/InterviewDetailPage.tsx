import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { ArrowLeft, Play, Pause, CheckCircle, Plus, AlertCircle, Circle } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AnnotatedPassageText, getTagColor } from '@/components/AnnotatedPassageText';

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, addPersonToInterview, addPlaceDateToInterview, updateInterviewNotes, addTheme, setPassageStatus, addThemeAnnotation, removeThemeAnnotation } = useProject();
  const interview = project.interviews.find(i => i.id === id);
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPerson, setNewPerson] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newTheme, setNewTheme] = useState('');

  // Text selection state
  const [selectionInfo, setSelectionInfo] = useState<{
    passageId: string;
    start: number;
    end: number;
    selectedText: string;
    rect: { top: number; left: number };
  } | null>(null);
  const passagesContainerRef = useRef<HTMLDivElement>(null);

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Find the passage container
    let node: Node | null = range.startContainer;
    let passageEl: HTMLElement | null = null;
    while (node) {
      if (node instanceof HTMLElement && node.dataset.passageId) {
        passageEl = node;
        break;
      }
      node = node.parentNode;
    }
    if (!passageEl) return;

    const passageId = passageEl.dataset.passageId!;
    const passage = interview?.passages.find(p => p.id === passageId);
    if (!passage) return;

    // Calculate character offsets within the passage text
    const fullText = passage.text;
    const selText = selection.toString();
    // Find the selected text position in the passage
    const startIdx = fullText.indexOf(selText);
    if (startIdx === -1) return;

    const rect = range.getBoundingClientRect();

    setSelectionInfo({
      passageId,
      start: startIdx,
      end: startIdx + selText.length,
      selectedText: selText,
      rect: { top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 },
    });
  }, [interview]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelect);
    return () => document.removeEventListener('mouseup', handleTextSelect);
  }, [handleTextSelect]);

  // Close theme menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectionInfo && !(e.target as HTMLElement).closest('[data-theme-popup]')) {
        setSelectionInfo(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionInfo]);

  if (!interview) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground font-sans">Entretien introuvable.</p>
        </div>
      </AppLayout>
    );
  }

  const filteredPassages = activeThemeFilter
    ? interview.passages.filter(p => p.themes.includes(activeThemeFilter))
    : interview.passages;

  const dateFormatted = new Date(interview.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleAddPerson = () => {
    if (newPerson.trim()) {
      addPersonToInterview(interview.id, newPerson.trim());
      setNewPerson('');
    }
  };

  const handleAddPlace = () => {
    if (newPlace.trim()) {
      addPlaceDateToInterview(interview.id, newPlace.trim());
      setNewPlace('');
    }
  };

  const handleAddTheme = () => {
    const trimmed = newTheme.trim();
    if (trimmed) {
      addTheme(trimmed);
      setNewTheme('');
    }
  };

  const handleAssignThemeToSelection = (theme: string) => {
    if (!selectionInfo) return;
    addThemeAnnotation(interview.id, selectionInfo.passageId, selectionInfo.start, selectionInfo.end, theme);
    setSelectionInfo(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-8 py-5 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Entretien n°{interview.number}</h1>
            <p className="text-sm font-sans text-muted-foreground">{dateFormatted} · {interview.duration}</p>
          </div>
        </div>

        {/* Two columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Transcript (60%) */}
          <div className="w-[60%] border-r border-border flex flex-col overflow-hidden">
            {/* Audio player */}
            <div className="border-b border-border px-8 py-4 flex items-center gap-4 flex-shrink-0 bg-card">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary rounded-full" />
              </div>
              <span className="text-xs font-sans text-muted-foreground whitespace-nowrap">0:27:15 / {interview.duration}</span>
              <select className="text-xs font-sans text-muted-foreground bg-transparent border border-border rounded px-2 py-1">
                <option>1x</option>
                <option>0.75x</option>
                <option>1.25x</option>
                <option>1.5x</option>
              </select>
            </div>

            {/* Hint */}
            <div className="px-8 py-2 bg-muted/50 border-b border-border">
              <p className="text-xs font-sans text-muted-foreground italic">
                Sélectionnez du texte pour y associer un thème
              </p>
            </div>

            {/* Passages */}
            <div ref={passagesContainerRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 relative">
              {filteredPassages.map((passage) => {
                const statusLabel = passage.status === 'integre' ? 'Intégré' : passage.status === 'details-manquants' ? 'Détails manquants' : '';
                const StatusIcon = passage.status === 'integre' ? CheckCircle : passage.status === 'details-manquants' ? AlertCircle : Circle;
                const statusColor = passage.status === 'integre' ? 'text-accent' : passage.status === 'details-manquants' ? 'text-amber-500' : 'text-muted-foreground';
                return (
                  <div
                    key={passage.id}
                    className={`group relative rounded-lg p-5 transition-all ${
                      passage.status === 'integre'
                        ? 'opacity-50'
                        : 'hover:bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-sans text-muted-foreground font-mono">{passage.timestamp}</span>
                      {passage.status !== 'non-integre' && (
                        <>
                          <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                          <span className={`text-xs font-sans ${statusColor}`}>{statusLabel}</span>
                        </>
                      )}
                    </div>
                    <p className="font-serif text-base leading-relaxed text-foreground" data-passage-id={passage.id}>
                      <AnnotatedPassageText
                        text={passage.text}
                        annotations={passage.themeAnnotations}
                        allThemes={project.allThemes}
                        onRemoveAnnotation={(annId) => removeThemeAnnotation(interview.id, passage.id, annId)}
                      />
                    </p>

                    {/* Hover actions - status only */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <select
                        value={passage.status}
                        onChange={e => setPassageStatus(interview.id, passage.id, e.target.value as import('@/lib/types').PassageStatus)}
                        className="px-2 py-1.5 text-xs font-sans bg-secondary text-secondary-foreground rounded-md border-none cursor-pointer hover:bg-border transition-colors"
                      >
                        <option value="non-integre">Non intégré</option>
                        <option value="details-manquants">Détails manquants</option>
                        <option value="integre">Intégré</option>
                      </select>
                    </div>
                  </div>
                );
              })}

              {/* Theme assignment popup */}
              {selectionInfo && (
                <div
                  data-theme-popup
                  className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl py-2 min-w-[180px]"
                  style={{
                    top: selectionInfo.rect.top + 8,
                    left: selectionInfo.rect.left,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="px-3 py-1.5 border-b border-border mb-1">
                    <p className="text-xs font-sans text-muted-foreground">Associer un thème :</p>
                  </div>
                  {project.allThemes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleAssignThemeToSelection(theme)}
                      className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-secondary transition-colors"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Annotations (40%) */}
          <div className="w-[40%] overflow-y-auto px-6 py-6 space-y-8">
            {/* Personnes */}
            <section>
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Personnes mentionnées
              </h3>
              <div className="space-y-2">
                {interview.persons.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-card">
                    <span className="font-sans text-sm font-medium">{p.name}</span>
                    {p.relation && <span className="text-xs font-sans text-muted-foreground">{p.relation}</span>}
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPerson}
                    onChange={e => setNewPerson(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPerson()}
                    placeholder="Ajouter une personne…"
                    className="flex-1 px-3 py-2 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button onClick={handleAddPerson} className="p-2 text-primary hover:bg-secondary rounded-md transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Lieux et dates */}
            <section>
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Lieux et dates
              </h3>
              <div className="space-y-2">
                {interview.placesDates.map(pd => (
                  <div key={pd.id} className="py-2 px-3 rounded-md bg-card font-sans text-sm">
                    {pd.label}
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPlace}
                    onChange={e => setNewPlace(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPlace()}
                    placeholder="Ajouter un lieu ou une date…"
                    className="flex-1 px-3 py-2 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button onClick={handleAddPlace} className="p-2 text-primary hover:bg-secondary rounded-md transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Thèmes */}
            <section>
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Thèmes
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.allThemes.map(theme => {
                  const isActive = activeThemeFilter === theme;
                  const count = interview.passages.filter(p => p.themes.includes(theme)).length;
                  return (
                    <button
                      key={theme}
                      onClick={() => count > 0 ? setActiveThemeFilter(isActive ? null : theme) : null}
                      className={`px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : count > 0
                            ? 'bg-secondary text-secondary-foreground hover:bg-border'
                            : 'bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {theme} ({count})
                    </button>
                  );
                })}
                {activeThemeFilter && (
                  <button
                    onClick={() => setActiveThemeFilter(null)}
                    className="px-3 py-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tout afficher
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTheme}
                  onChange={e => setNewTheme(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTheme()}
                  placeholder="Nouveau thème…"
                  className="flex-1 px-3 py-2 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={handleAddTheme} className="p-2 text-primary hover:bg-secondary rounded-md transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Notes personnelles
              </h3>
              <textarea
                value={interview.notes}
                onChange={e => updateInterviewNotes(interview.id, e.target.value)}
                className="w-full h-40 px-4 py-3 font-serif text-sm leading-relaxed bg-card border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Vos observations sur cet entretien…"
              />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
