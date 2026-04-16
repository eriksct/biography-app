import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { ArrowLeft, Play, Pause, Plus, MapPin, User, Pencil, Check, Download, FileText, Music, Calendar, ScrollText, Target, BookOpen, X, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AnnotatedPassageText, getTagColor } from '@/components/AnnotatedPassageText';

type Tab = 'transcript' | 'summary';

export default function InterviewDetailPage() {
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const navigate = useNavigate();
  const { project, addPersonToInterview, addPlaceDateToInterview, addEventDateToInterview, addHistoricalEventToInterview, addIssueToInterview, updateInterviewNotes, addTheme, addThemeAnnotation, removeThemeAnnotation, updatePassage, updateInterview, removePassage } = useProject();
  const interview = project.interviews.find(i => i.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  const [editingPassageId, setEditingPassageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

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
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Walk up from both start and end containers to find the passage element
    let node: Node | null = range.startContainer;
    let passageEl: HTMLElement | null = null;
    while (node) {
      if (node instanceof HTMLElement && node.dataset.passageId) {
        passageEl = node;
        break;
      }
      node = node.parentNode;
    }
    if (!passageEl) {
      // Also try from end container
      node = range.endContainer;
      while (node) {
        if (node instanceof HTMLElement && node.dataset.passageId) {
          passageEl = node;
          break;
        }
        node = node.parentNode;
      }
    }
    if (!passageEl) return;

    const passageId = passageEl.dataset.passageId!;
    const passage = interview?.passages.find(p => p.id === passageId);
    if (!passage) return;

    // Compute character offset, skipping annotation control elements
    const isInsideControls = (n: Node): boolean => {
      let el: Node | null = n;
      while (el && el !== passageEl) {
        if (el instanceof HTMLElement && el.hasAttribute('data-annotation-controls')) return true;
        el = el.parentNode;
      }
      return false;
    };
    const computeOffset = (container: Node, offset: number): number => {
      const walker = document.createTreeWalker(passageEl!, NodeFilter.SHOW_TEXT);
      let charCount = 0;
      let currentNode: Node | null;
      while ((currentNode = walker.nextNode())) {
        if (isInsideControls(currentNode)) continue;
        if (currentNode === container) return charCount + offset;
        charCount += (currentNode.textContent?.length || 0);
      }
      return charCount + offset;
    };

    const startIdx = computeOffset(range.startContainer, range.startOffset);
    const endIdx = computeOffset(range.endContainer, range.endOffset);
    if (startIdx >= endIdx || startIdx < 0 || endIdx > passage.text.length) return;

    const rect = range.getBoundingClientRect();
    setSelectionInfo({
      passageId,
      start: startIdx,
      end: endIdx,
      selectedText: passage.text.slice(startIdx, endIdx),
      rect: { top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 },
    });
  }, [interview]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelect);
    return () => document.removeEventListener('mouseup', handleTextSelect);
  }, [handleTextSelect]);

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

  const downloadTranscriptAsDocx = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    const title = interview.title || `Entretien n°${interview.number}`;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 32, font: 'Arial' })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `${dateFormatted} · ${interview.duration}`, size: 20, color: '888888', font: 'Arial' })],
            spacing: { after: 400 },
          }),
          ...interview.passages.map(p =>
            new Paragraph({
              children: [
                new TextRun({ text: `[${p.timestamp}] `, color: '999999', size: 20, font: 'Arial' }),
                new TextRun({ text: p.text, size: 22, font: 'Arial' }),
              ],
              spacing: { after: 200 },
            })
          ),
        ],
      }],
    });
    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæ\s-]/g, '')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAudioMp3 = () => {
    // Placeholder — in a real app this would download the actual audio file
    const title = interview.title || `Entretien n°${interview.number}`;
    console.log(`Download audio for: ${title}`);
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-8 py-5 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => navigate(`/projet/${projectId}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => {
                  if (titleValue.trim()) updateInterview(interview.id, { title: titleValue.trim() });
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.currentTarget.blur(); }
                  if (e.key === 'Escape') { setEditingTitle(false); }
                }}
                className="text-2xl font-serif font-semibold bg-transparent border-b border-border focus:border-foreground outline-none w-full py-0"
              />
            ) : (
              <h1
                className="text-2xl font-serif font-semibold group cursor-text flex items-center gap-2"
                onClick={() => {
                  setTitleValue(interview.title || `Entretien n°${interview.number}`);
                  setEditingTitle(true);
                  setTimeout(() => titleInputRef.current?.focus(), 0);
                }}
              >
                {interview.title || `Entretien n°${interview.number}`}
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
            <p className="text-sm font-sans text-muted-foreground">{dateFormatted} · {interview.duration}</p>
          </div>

          {/* Download menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2 shrink-0">
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onClick={downloadTranscriptAsDocx} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="font-sans text-sm">Transcript (.docx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAudioMp3} className="gap-2 cursor-pointer">
                <Music className="w-4 h-4" />
                <span className="font-sans text-sm">Audio (.mp3)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-8 flex-shrink-0">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Analyse
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'transcript' ? (
          <TranscriptTab
            interview={interview}
            project={project}
            filteredPassages={filteredPassages}
            activeThemeFilter={activeThemeFilter}
            setActiveThemeFilter={setActiveThemeFilter}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            newTheme={newTheme}
            setNewTheme={setNewTheme}
            handleAddTheme={handleAddTheme}
            selectionInfo={selectionInfo}
            handleAssignThemeToSelection={handleAssignThemeToSelection}
            
            removeThemeAnnotation={removeThemeAnnotation}
            updateInterviewNotes={updateInterviewNotes}
            passagesContainerRef={passagesContainerRef}
            editingPassageId={editingPassageId}
            setEditingPassageId={setEditingPassageId}
            editingText={editingText}
            setEditingText={setEditingText}
            updatePassage={updatePassage}
            removePassage={removePassage}
          />
        ) : (
          <SummaryTab
            interview={interview}
            addPersonToInterview={addPersonToInterview}
            addPlaceDateToInterview={addPlaceDateToInterview}
            addEventDateToInterview={addEventDateToInterview}
            addHistoricalEventToInterview={addHistoricalEventToInterview}
            addIssueToInterview={addIssueToInterview}
            updateInterview={updateInterview}
          />
        )}
      </div>
    </AppLayout>
  );
}

/* ─── Helpers ─── */
function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function formatSeconds(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ─── Transcript Tab ─── */
function TranscriptTab({
  interview,
  project,
  filteredPassages,
  activeThemeFilter,
  setActiveThemeFilter,
  isPlaying,
  setIsPlaying,
  newTheme,
  setNewTheme,
  handleAddTheme,
  selectionInfo,
  handleAssignThemeToSelection,
  
  removeThemeAnnotation,
  updateInterviewNotes,
  passagesContainerRef,
  editingPassageId,
  setEditingPassageId,
  editingText,
  setEditingText,
  updatePassage,
  removePassage,
}: any) {
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = parseTimestamp(interview.duration);
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Find which passage is "active" based on currentTime
  const activePassageId = (() => {
    let active: string | null = null;
    for (const p of interview.passages) {
      if (parseTimestamp(p.timestamp) <= currentTime) active = p.id;
      else break;
    }
    return active;
  })();

  const seekToPassage = (timestamp: string) => {
    const secs = parseTimestamp(timestamp);
    setCurrentTime(secs);
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Transcript */}
      <div className="w-[60%] border-r border-border flex flex-col overflow-hidden">
        {/* Audio player */}
        <div className="border-b border-border px-8 py-4 flex items-center gap-4 flex-shrink-0 bg-card">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div
            className="flex-1 h-2 bg-secondary rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setCurrentTime(Math.round(ratio * totalDuration));
            }}
          >
            <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-sans text-muted-foreground whitespace-nowrap">{formatSeconds(currentTime)} / {interview.duration}</span>
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
            Sélectionnez du texte pour y associer une étiquette
          </p>
        </div>

        {/* Passages */}
        <div ref={passagesContainerRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 relative">
          {interview.status === 'recording' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="font-sans text-lg text-foreground animate-pulse">Transcription en cours…</span>
              </div>
              <p className="font-sans text-sm text-muted-foreground text-center max-w-sm">
                L'entretien est en cours de transcription. Le texte apparaîtra ici automatiquement.
              </p>
              <div className="flex gap-1 mt-4">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          {filteredPassages.map((passage: any) => {
            return (
              <div
                key={passage.id}
                className={`group group/passage relative rounded-lg p-5 transition-all hover:bg-card ${activePassageId === passage.id ? 'bg-card border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => seekToPassage(passage.timestamp)}
                    className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground font-mono hover:text-primary transition-colors"
                    title="Écouter à partir d'ici"
                  >
                    {passage.timestamp}
                    <Play className="w-3 h-3 opacity-0 group-hover/passage:opacity-100 transition-opacity" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover/passage:opacity-100 transition-opacity ml-auto p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[140px]">
                      <DropdownMenuItem onClick={() => { setEditingPassageId(passage.id); setEditingText(passage.text); }}>
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (interview && window.confirm('Supprimer ce passage ?')) removePassage(interview.id, passage.id); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-4">
                  {editingPassageId === passage.id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        className="w-full font-serif text-base leading-relaxed text-foreground bg-background border border-input rounded-md p-3 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPassageId(null)}
                          className="px-3 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => { updatePassage(interview!.id, passage.id, { text: editingText }); setEditingPassageId(null); }}
                          className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Valider
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-serif text-base leading-relaxed text-foreground flex-1" data-passage-id={passage.id}>
                      <AnnotatedPassageText
                        text={passage.text}
                        annotations={passage.themeAnnotations}
                        allThemes={project.allThemes}
                        onRemoveAnnotation={(annId: string) => removeThemeAnnotation(interview!.id, passage.id, annId)}
                      />
                    </p>
                  )}
                  {passage.themeAnnotations && passage.themeAnnotations.length > 0 && (
                    <div className="flex flex-col gap-1 flex-shrink-0 pt-0.5">
                      {[...new Set(passage.themeAnnotations.map((a: any) => a.theme))].map((theme: string) => (
                        <span
                          key={theme}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium whitespace-nowrap ${getTagColor(theme, project.allThemes)}`}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Theme assignment popup */}
          {selectionInfo && (() => {
            const popupHeight = (project.allThemes.length + 1) * 36 + 40;
            const spaceBelow = window.innerHeight - selectionInfo.rect.bottom;
            const flipUp = spaceBelow < popupHeight && selectionInfo.rect.top > popupHeight;
            return (
            <div
              data-theme-popup
              className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl py-2 min-w-[180px] max-h-[60vh] overflow-y-auto"
              style={{
                ...(flipUp
                  ? { bottom: window.innerHeight - selectionInfo.rect.top + 8 }
                  : { top: selectionInfo.rect.bottom + 8 }),
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

      {/* Right: Themes, filters, notes */}
      <div className="w-[40%] overflow-y-auto px-6 py-6 space-y-8">
        {/* Étiquettes (filters) */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Étiquettes
          </h3>
          <p className="font-sans text-xs text-muted-foreground mb-3">
            Ajouter une étiquette (un thème, une date, un détail...) à des passages du texte
          </p>
          <div className="flex flex-wrap gap-2">
            {project.allThemes.map((theme: string) => {
              const isActive = activeThemeFilter === theme;
              const count = interview.passages.filter((p: any) => p.themes.includes(theme)).length;
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
              onChange={(e: any) => setNewTheme(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleAddTheme()}
              placeholder="Créer une étiquette..."
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
            onChange={(e: any) => updateInterviewNotes(interview.id, e.target.value)}
            className="w-full h-40 px-4 py-3 font-serif text-sm leading-relaxed bg-card border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Vos observations sur cet entretien…"
          />
        </section>
      </div>
    </div>
  );
}

/* ─── Collapsible Add Input ─── */
function AddInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); setOpen(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 mt-2 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Ajouter
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') { setValue(''); setOpen(false); }
        }}
        autoFocus
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button onClick={handleAdd} className="p-1.5 text-primary hover:bg-secondary rounded-md transition-colors">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => { setValue(''); setOpen(false); }} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-md transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Editable Item ─── */
function EditableItem({ value, onSave, onDelete, subtitle }: { value: string; onSave: (v: string) => void; onDelete: () => void; subtitle?: string }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') { setEditValue(value); setEditing(false); }
          }}
          autoFocus
          className="flex-1 px-3 py-2 text-sm font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={handleSave} className="p-2 text-primary hover:bg-secondary rounded-md transition-colors">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => { setEditValue(value); setEditing(false); }} className="p-2 text-muted-foreground hover:bg-secondary rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between py-2 px-3 rounded-md bg-card">
      <div className="flex-1 min-w-0">
        <span className="font-sans text-sm font-medium">{value}</span>
        {subtitle && <span className="text-xs font-sans text-muted-foreground ml-2">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Summary Tab ─── */
function SummaryTab({
  interview,
  addPersonToInterview,
  addPlaceDateToInterview,
  addEventDateToInterview,
  addHistoricalEventToInterview,
  addIssueToInterview,
  updateInterview,
}: any) {
  const handleAddPerson = (v: string) => addPersonToInterview(interview.id, v);
  const handleAddPlace = (v: string) => addPlaceDateToInterview(interview.id, v);
  const handleAddEvent = (v: string) => addEventDateToInterview(interview.id, v);
  const handleAddHistorical = (v: string) => addHistoricalEventToInterview(interview.id, v);
  const handleAddIssue = (v: string) => addIssueToInterview(interview.id, v);

  // Edit/delete helpers
  const editPerson = (idx: number, name: string) => { const persons = [...interview.persons]; persons[idx] = { ...persons[idx], name }; updateInterview(interview.id, { persons }); };
  const deletePerson = (idx: number) => updateInterview(interview.id, { persons: interview.persons.filter((_: any, i: number) => i !== idx) });
  const editPlace = (idx: number, label: string) => { const placesDates = [...interview.placesDates]; placesDates[idx] = { ...placesDates[idx], label }; updateInterview(interview.id, { placesDates }); };
  const deletePlace = (idx: number) => updateInterview(interview.id, { placesDates: interview.placesDates.filter((_: any, i: number) => i !== idx) });
  const editEvent = (idx: number, label: string) => { const eventsDates = [...(interview.eventsDates || [])]; eventsDates[idx] = { ...eventsDates[idx], label }; updateInterview(interview.id, { eventsDates }); };
  const deleteEvent = (idx: number) => updateInterview(interview.id, { eventsDates: (interview.eventsDates || []).filter((_: any, i: number) => i !== idx) });
  const editHistorical = (idx: number, label: string) => { const historicalEvents = [...(interview.historicalEvents || [])]; historicalEvents[idx] = { ...historicalEvents[idx], label }; updateInterview(interview.id, { historicalEvents }); };
  const deleteHistorical = (idx: number) => updateInterview(interview.id, { historicalEvents: (interview.historicalEvents || []).filter((_: any, i: number) => i !== idx) });
  const editIssue = (idx: number, value: string) => { const issues = [...interview.issues]; issues[idx] = value; updateInterview(interview.id, { issues }); };
  const deleteIssue = (idx: number) => updateInterview(interview.id, { issues: interview.issues.filter((_: any, i: number) => i !== idx) });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
        <div className="grid grid-cols-2 gap-8">
          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Personnes mentionnées
            </h3>
            <div className="space-y-2">
              {interview.persons.map((p: any, i: number) => (
                <EditableItem key={p.id} value={p.name} subtitle={p.relation} onSave={(v) => editPerson(i, v)} onDelete={() => deletePerson(i)} />
              ))}
              <AddInput placeholder="Nom de la personne…" onAdd={handleAddPerson} />
            </div>
          </section>

          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Lieux
            </h3>
            <div className="space-y-2">
              {interview.placesDates.map((pd: any, i: number) => (
                <EditableItem key={pd.id} value={pd.label} onSave={(v) => editPlace(i, v)} onDelete={() => deletePlace(i)} />
              ))}
              <AddInput placeholder="Nom du lieu…" onAdd={handleAddPlace} />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Évènements & Dates
            </h3>
            <div className="space-y-2">
              {interview.eventsDates?.map((ed: any, i: number) => (
                <EditableItem key={ed.id} value={ed.label} onSave={(v) => editEvent(i, v)} onDelete={() => deleteEvent(i)} />
              ))}
              <AddInput placeholder="Évènement ou date…" onAdd={handleAddEvent} />
            </div>
          </section>

          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <ScrollText className="w-4 h-4" /> Évènements historiques
            </h3>
            <div className="space-y-2">
              {interview.historicalEvents?.map((he: any, i: number) => (
                <EditableItem key={he.id} value={he.label} onSave={(v) => editHistorical(i, v)} onDelete={() => deleteHistorical(i)} />
              ))}
              <AddInput placeholder="Évènement historique…" onAdd={handleAddHistorical} />
            </div>
          </section>
        </div>

        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" /> Enjeux
          </h3>
          <div className="space-y-2">
            {interview.issues.map((issue: string, i: number) => (
              <EditableItem key={i} value={issue} onSave={(v) => editIssue(i, v)} onDelete={() => deleteIssue(i)} />
            ))}
            <AddInput placeholder="Nouvel enjeu…" onAdd={handleAddIssue} />
          </div>
        </section>

        {/* Résumé */}
        {interview.summarySections && interview.summarySections.length > 0 && (
          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Résumé
            </h3>
            <div className="space-y-6">
              {interview.summarySections.map((section: any, i: number) => (
                <div key={i}>
                  <h4 className="text-lg font-serif font-semibold mb-2">{section.title}</h4>
                  <p className="font-sans text-sm leading-relaxed text-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
