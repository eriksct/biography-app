import React, { createContext, useContext, useCallback } from 'react';
import { Project, Interview, Chapter, ManuscriptBlock, Passage, ThemeAnnotation } from './types';
import { useApp } from './AppContext';

interface ProjectContextType {
  project: Project;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  updatePassage: (interviewId: string, passageId: string, updates: Partial<Passage>) => void;
  addChapter: (title: string) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  reorderChapter: (chapterId: string, direction: 'up' | 'down') => void;
  moveChapter: (fromIndex: number, toIndex: number) => void;
  addBlockToChapter: (chapterId: string, block: ManuscriptBlock) => void;
  updateBlock: (chapterId: string, blockId: string, updates: Partial<ManuscriptBlock>) => void;
  removeBlock: (chapterId: string, blockId: string) => void;
  markPassageUsed: (interviewId: string, passageId: string, chapterId: string) => void;
  addPersonToInterview: (interviewId: string, name: string, relation?: string) => void;
  addPlaceDateToInterview: (interviewId: string, label: string) => void;
  addEventDateToInterview: (interviewId: string, label: string) => void;
  addHistoricalEventToInterview: (interviewId: string, label: string) => void;
  addIssueToInterview: (interviewId: string, issue: string) => void;
  updateInterviewNotes: (interviewId: string, notes: string) => void;
  addTheme: (theme: string) => void;
  addThemeAnnotation: (interviewId: string, passageId: string, start: number, end: number, theme: string) => void;
  removeThemeAnnotation: (interviewId: string, passageId: string, annotationId: string) => void;
  removePassage: (interviewId: string, passageId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};

export const ProjectProvider: React.FC<{ projectId: string; children: React.ReactNode }> = ({ projectId, children }) => {
  const { getProject, updateProject } = useApp();
  const project = getProject(projectId);

  const update = useCallback((updater: (p: Project) => Project) => {
    updateProject(projectId, updater);
  }, [projectId, updateProject]);

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, [update]);

  const updatePassage = useCallback((interviewId: string, passageId: string, updates: Partial<Passage>) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, passages: i.passages.map(p => p.id === passageId ? { ...p, ...updates } : p) }
          : i
      ),
    }));
  }, [update]);

  const addChapter = useCallback((title: string) => {
    const id = `chap-${Date.now()}`;
    update(prev => ({
      ...prev,
      chapters: [...prev.chapters, { id, title, content: '', blocks: [] }],
    }));
  }, [update]);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    update(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, [update]);

  const reorderChapter = useCallback((chapterId: string, direction: 'up' | 'down') => {
    update(prev => {
      const idx = prev.chapters.findIndex(c => c.id === chapterId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.chapters.length) return prev;
      const chapters = [...prev.chapters];
      [chapters[idx], chapters[newIdx]] = [chapters[newIdx], chapters[idx]];
      return { ...prev, chapters };
    });
  }, [update]);

  const moveChapter = useCallback((fromIndex: number, toIndex: number) => {
    update(prev => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.chapters.length || toIndex >= prev.chapters.length || fromIndex === toIndex) return prev;
      const chapters = [...prev.chapters];
      const [moved] = chapters.splice(fromIndex, 1);
      chapters.splice(toIndex, 0, moved);
      return { ...prev, chapters };
    });
  }, [update]);

  const addBlockToChapter = useCallback((chapterId: string, block: ManuscriptBlock) => {
    update(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId ? { ...c, blocks: [...c.blocks, block] } : c
      ),
    }));
  }, [update]);

  const updateBlock = useCallback((chapterId: string, blockId: string, updates: Partial<ManuscriptBlock>) => {
    update(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
          : c
      ),
    }));
  }, [update]);

  const removeBlock = useCallback((chapterId: string, blockId: string) => {
    update(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
          : c
      ),
    }));
  }, [update]);

  const markPassageUsed = useCallback((interviewId: string, passageId: string, chapterId: string) => {
    updatePassage(interviewId, passageId, { usedInChapter: chapterId });
  }, [updatePassage]);

  const addPersonToInterview = useCallback((interviewId: string, name: string, relation?: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, persons: [...i.persons, { id: `p-${Date.now()}`, name, relation }] }
          : i
      ),
    }));
  }, [update]);

  const addPlaceDateToInterview = useCallback((interviewId: string, label: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, placesDates: [...i.placesDates, { id: `pd-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, [update]);

  const addEventDateToInterview = useCallback((interviewId: string, label: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, eventsDates: [...(i.eventsDates || []), { id: `ed-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, [update]);

  const addHistoricalEventToInterview = useCallback((interviewId: string, label: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, historicalEvents: [...(i.historicalEvents || []), { id: `he-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, [update]);

  const addIssueToInterview = useCallback((interviewId: string, issue: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, issues: [...i.issues, issue] }
          : i
      ),
    }));
  }, [update]);

  const updateInterviewNotes = useCallback((interviewId: string, notes: string) => {
    updateInterview(interviewId, { notes });
  }, [updateInterview]);

  const addTheme = useCallback((theme: string) => {
    update(prev => {
      if (prev.allThemes.includes(theme)) return prev;
      return { ...prev, allThemes: [...prev.allThemes, theme] };
    });
  }, [update]);

  const addThemeAnnotation = useCallback((interviewId: string, passageId: string, start: number, end: number, theme: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? {
              ...i,
              passages: i.passages.map(p => {
                if (p.id !== passageId) return p;
                const overlapping = p.themeAnnotations.filter(
                  a => a.theme === theme && a.start <= end && a.end >= start
                );
                const others = p.themeAnnotations.filter(
                  a => !(a.theme === theme && a.start <= end && a.end >= start)
                );
                const mergedStart = Math.min(start, ...overlapping.map(a => a.start));
                const mergedEnd = Math.max(end, ...overlapping.map(a => a.end));
                const merged: ThemeAnnotation = {
                  id: overlapping.length > 0 ? overlapping[0].id : `ann-${Date.now()}`,
                  start: mergedStart,
                  end: mergedEnd,
                  theme,
                };
                const newAnnotations = [...others, merged];
                return {
                  ...p,
                  themeAnnotations: newAnnotations,
                  themes: p.themes.includes(theme) ? p.themes : [...p.themes, theme],
                };
              }),
            }
          : i
      ),
    }));
  }, [update]);

  const removeThemeAnnotation = useCallback((interviewId: string, passageId: string, annotationId: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? {
              ...i,
              passages: i.passages.map(p => {
                if (p.id !== passageId) return p;
                const newAnnotations = p.themeAnnotations.filter(a => a.id !== annotationId);
                const remainingThemes = [...new Set(newAnnotations.map(a => a.theme))];
                return { ...p, themeAnnotations: newAnnotations, themes: remainingThemes };
              }),
            }
          : i
      ),
    }));
  }, [update]);

  const removePassage = useCallback((interviewId: string, passageId: string) => {
    update(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, passages: i.passages.filter(p => p.id !== passageId) }
          : i
      ),
    }));
  }, [update]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-sans">Projet introuvable.</p>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={{
      project,
      updateInterview,
      updatePassage,
      addChapter,
      updateChapter,
      reorderChapter,
      moveChapter,
      addBlockToChapter,
      updateBlock,
      removeBlock,
      markPassageUsed,
      addPersonToInterview,
      addPlaceDateToInterview,
      addEventDateToInterview,
      addHistoricalEventToInterview,
      addIssueToInterview,
      updateInterviewNotes,
      addTheme,
      addThemeAnnotation,
      removeThemeAnnotation,
      removePassage,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
