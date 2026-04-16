import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project, Interview, Chapter, ManuscriptBlock, Passage, ThemeAnnotation } from './types';
import { demoProject } from './demoData';

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

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(demoProject);

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, []);

  const updatePassage = useCallback((interviewId: string, passageId: string, updates: Partial<Passage>) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, passages: i.passages.map(p => p.id === passageId ? { ...p, ...updates } : p) }
          : i
      ),
    }));
  }, []);

  const addChapter = useCallback((title: string) => {
    const id = `chap-${Date.now()}`;
    setProject(prev => ({
      ...prev,
      chapters: [...prev.chapters, { id, title, content: '', blocks: [] }],
    }));
  }, []);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const reorderChapter = useCallback((chapterId: string, direction: 'up' | 'down') => {
    setProject(prev => {
      const idx = prev.chapters.findIndex(c => c.id === chapterId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.chapters.length) return prev;
      const chapters = [...prev.chapters];
      [chapters[idx], chapters[newIdx]] = [chapters[newIdx], chapters[idx]];
      return { ...prev, chapters };
    });
  }, []);

  const moveChapter = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.chapters.length || toIndex >= prev.chapters.length || fromIndex === toIndex) return prev;
      const chapters = [...prev.chapters];
      const [moved] = chapters.splice(fromIndex, 1);
      chapters.splice(toIndex, 0, moved);
      return { ...prev, chapters };
    });
  }, []);

  const addBlockToChapter = useCallback((chapterId: string, block: ManuscriptBlock) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId ? { ...c, blocks: [...c.blocks, block] } : c
      ),
    }));
  }, []);

  const updateBlock = useCallback((chapterId: string, blockId: string, updates: Partial<ManuscriptBlock>) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
          : c
      ),
    }));
  }, []);

  const removeBlock = useCallback((chapterId: string, blockId: string) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
          : c
      ),
    }));
  }, []);

  const markPassageUsed = useCallback((interviewId: string, passageId: string, chapterId: string) => {
    updatePassage(interviewId, passageId, { usedInChapter: chapterId });
  }, [updatePassage]);

  const addPersonToInterview = useCallback((interviewId: string, name: string, relation?: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, persons: [...i.persons, { id: `p-${Date.now()}`, name, relation }] }
          : i
      ),
    }));
  }, []);

  const addPlaceDateToInterview = useCallback((interviewId: string, label: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, placesDates: [...i.placesDates, { id: `pd-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, []);

  const addEventDateToInterview = useCallback((interviewId: string, label: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, eventsDates: [...(i.eventsDates || []), { id: `ed-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, []);

  const addHistoricalEventToInterview = useCallback((interviewId: string, label: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, historicalEvents: [...(i.historicalEvents || []), { id: `he-${Date.now()}`, label }] }
          : i
      ),
    }));
  }, []);

  const addIssueToInterview = useCallback((interviewId: string, issue: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, issues: [...i.issues, issue] }
          : i
      ),
    }));
  }, []);

  const updateInterviewNotes = useCallback((interviewId: string, notes: string) => {
    updateInterview(interviewId, { notes });
  }, [updateInterview]);

  const addTheme = useCallback((theme: string) => {
    setProject(prev => {
      if (prev.allThemes.includes(theme)) return prev;
      return { ...prev, allThemes: [...prev.allThemes, theme] };
    });
  }, []);

  const addThemeAnnotation = useCallback((interviewId: string, passageId: string, start: number, end: number, theme: string) => {
    const annotation: ThemeAnnotation = { id: `ann-${Date.now()}`, start, end, theme };
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? {
              ...i,
              passages: i.passages.map(p =>
                p.id === passageId
                  ? {
                      ...p,
                      themeAnnotations: [...p.themeAnnotations, annotation],
                      themes: p.themes.includes(theme) ? p.themes : [...p.themes, theme],
                    }
                  : p
              ),
            }
          : i
      ),
    }));
  }, []);

  const removeThemeAnnotation = useCallback((interviewId: string, passageId: string, annotationId: string) => {
    setProject(prev => ({
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
  }, []);

  const removePassage = useCallback((interviewId: string, passageId: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, passages: i.passages.filter(p => p.id !== passageId) }
          : i
      ),
    }));
  }, []);

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
