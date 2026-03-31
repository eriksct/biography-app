import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/lib/ProjectContext';
import { AppLayout } from '@/components/AppLayout';
import { ArrowLeft, Play, Pause, CheckCircle, Plus, Tag } from 'lucide-react';
import { useState } from 'react';

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, updatePassage, addPersonToInterview, addPlaceDateToInterview, updateInterviewNotes, addTheme } = useProject();
  const interview = project.interviews.find(i => i.id === id);
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPerson, setNewPerson] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [showThemeMenu, setShowThemeMenu] = useState<string | null>(null);
  const [newTheme, setNewTheme] = useState('');

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

  const handleAssignTheme = (passageId: string, theme: string) => {
    const passage = interview.passages.find(p => p.id === passageId);
    if (passage && !passage.themes.includes(theme)) {
      updatePassage(interview.id, passageId, { themes: [...passage.themes, theme] });
    }
    setShowThemeMenu(null);
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

            {/* Passages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {filteredPassages.map((passage) => (
                <div
                  key={passage.id}
                  className={`group relative rounded-lg p-5 transition-all ${
                    passage.used
                      ? 'opacity-50'
                      : 'hover:bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-sans text-muted-foreground font-mono">{passage.timestamp}</span>
                    {passage.themes.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-secondary text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                    {passage.used && (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <p className="font-serif text-content leading-relaxed text-foreground">{passage.text}</p>

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowThemeMenu(showThemeMenu === passage.id ? null : passage.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans bg-secondary hover:bg-border text-secondary-foreground rounded-md transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        Thème
                      </button>
                      {showThemeMenu === passage.id && (
                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-10 min-w-[140px]">
                          {project.allThemes.map(theme => (
                            <button
                              key={theme}
                              onClick={() => handleAssignTheme(passage.id, theme)}
                              className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-secondary transition-colors"
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!passage.used && (
                      <button
                        onClick={() => updatePassage(interview.id, passage.id, { used: true })}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans bg-secondary hover:bg-border text-secondary-foreground rounded-md transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Utilisé
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                    <span className="font-sans text-content-sm font-medium">{p.name}</span>
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
                  <div key={pd.id} className="py-2 px-3 rounded-md bg-card font-sans text-content-sm">
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
                  if (count === 0) return null;
                  return (
                    <button
                      key={theme}
                      onClick={() => setActiveThemeFilter(isActive ? null : theme)}
                      className={`px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-border'
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
            </section>

            {/* Notes */}
            <section>
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Notes personnelles
              </h3>
              <textarea
                value={interview.notes}
                onChange={e => updateInterviewNotes(interview.id, e.target.value)}
                className="w-full h-40 px-4 py-3 font-serif text-content-sm leading-relaxed bg-card border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Vos observations sur cet entretien…"
              />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
