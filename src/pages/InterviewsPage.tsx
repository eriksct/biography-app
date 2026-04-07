import { useState, useMemo } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Mic, FileText, CheckCircle, Plus, Search, X } from 'lucide-react';
import { InterviewStatus, Interview, Passage } from '@/lib/types';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RecordingDialog } from '@/components/RecordingDialog';

const statusConfig: Record<InterviewStatus, { icon: React.ElementType; label: string; className: string }> = {
  recording: { icon: Mic, label: 'En cours', className: 'text-primary' },
  transcribed: { icon: FileText, label: 'Transcrit', className: 'text-muted-foreground' },
  processed: { icon: CheckCircle, label: 'Traité', className: 'text-accent' },
};

interface SearchResult {
  interview: Interview;
  matchingPassages: Passage[];
  matchingThemes: string[];
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function InterviewsPage() {
  const { project } = useProject();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recordingOpen, setRecordingOpen] = useState(false);

  const handleRecordingComplete = (duration: string, title: string) => {
    console.log('Recording completed:', title, duration);
  };

  const isSearching = query.trim().length > 0;
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!isSearching) return [];

    return project.interviews
      .map((interview) => {
        const matchingPassages = interview.passages.filter((p) =>
          p.text.toLowerCase().includes(normalizedQuery)
        );
        const matchingThemes = interview.themes.filter((t) =>
          t.toLowerCase().includes(normalizedQuery)
        );
        // Also match themes from passage annotations
        const passageThemeMatches = interview.passages.filter((p) =>
          p.themes.some((t) => t.toLowerCase().includes(normalizedQuery))
        );
        const allMatchingPassages = [
          ...new Map(
            [...matchingPassages, ...passageThemeMatches].map((p) => [p.id, p])
          ).values(),
        ];

        if (allMatchingPassages.length === 0 && matchingThemes.length === 0) return null;

        return { interview, matchingPassages: allMatchingPassages, matchingThemes };
      })
      .filter(Boolean) as SearchResult[];
  }, [project.interviews, normalizedQuery, isSearching]);

  const sortedInterviews = useMemo(
    () =>
      [...project.interviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [project.interviews]
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif font-semibold">Mes entretiens</h1>
          <Button onClick={() => setRecordingOpen(true)}>
            <Plus className="w-4 h-4" />
            Nouvel entretien
          </Button>
        </div>

        <RecordingDialog
          open={recordingOpen}
          onOpenChange={setRecordingOpen}
          onRecordingComplete={handleRecordingComplete}
        />

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par thème ou mot-clé dans les passages…"
            className="pl-10 pr-10 font-sans"
          />
          {isSearching && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results */}
        {isSearching ? (
          <div className="space-y-6">
            {searchResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 font-sans">
                Aucun résultat pour « {query.trim()} »
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground font-sans mb-4">
                  {searchResults.reduce((acc, r) => acc + r.matchingPassages.length, 0)} passage(s)
                  dans {searchResults.length} entretien(s)
                </p>
                {searchResults.map(({ interview, matchingPassages, matchingThemes }) => (
                  <div key={interview.id} className="border border-border rounded-lg overflow-hidden">
                    {/* Interview header */}
                    <button
                      onClick={() => navigate(`/entretien/${interview.id}`)}
                      className="w-full text-left bg-card hover:bg-secondary/50 p-4 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-serif font-semibold text-muted-foreground">
                          {String(interview.number).padStart(2, '0')}
                        </span>
                        <span className="font-sans text-content font-medium text-foreground">
                          Entretien n°{interview.number}
                        </span>
                      </div>
                      {matchingThemes.length > 0 && (
                        <div className="flex gap-1.5">
                          {matchingThemes.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-primary/10 text-primary"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>

                    {/* Matching passages */}
                    {matchingPassages.length > 0 && (
                      <div className="divide-y divide-border">
                        {matchingPassages.map((passage) => (
                          <div
                            key={passage.id}
                            className="px-4 py-3 bg-background hover:bg-secondary/30 transition-colors cursor-pointer"
                            onClick={() => navigate(`/entretien/${interview.id}`)}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-[11px] text-muted-foreground font-mono mt-0.5 shrink-0">
                                {passage.timestamp}
                              </span>
                              <p className="text-sm font-sans text-foreground leading-relaxed line-clamp-2">
                                {highlightText(passage.text, query.trim())}
                              </p>
                            </div>
                            {passage.themes.length > 0 && (
                              <div className="flex gap-1.5 mt-2 ml-16">
                                {passage.themes.map((t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-secondary text-secondary-foreground"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          /* Normal interview list */
          <div className="space-y-4">
            {sortedInterviews.map((interview) => {
              const status = statusConfig[interview.status];
              const StatusIcon = status.icon;
              const dateFormatted = new Date(interview.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <button
                  key={interview.id}
                  onClick={() => navigate(`/entretien/${interview.id}`)}
                  className="w-full text-left bg-card hover:bg-secondary/50 border border-border rounded-lg p-6 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-serif font-semibold text-muted-foreground">
                        {String(interview.number).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-sans text-content font-medium text-foreground">
                          Entretien n°{interview.number}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground mt-1">
                          {dateFormatted} · {interview.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  {interview.themes.length > 0 && (
                    <div className="flex gap-2 mt-4 ml-14">
                      {interview.themes.map((theme) => (
                        <span
                          key={theme}
                          className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-secondary text-secondary-foreground"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
