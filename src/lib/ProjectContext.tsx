import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project, Interview, Chapter, ManuscriptBlock, Passage, ThemeAnnotation } from './types';
import { demoProject } from './demoData';

interface ProjectContextType {
  project: Project;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  updatePassage: (interviewId: string, passageId: string, updates: Partial<Passage>) => void;
  addChapter: (title: string) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  addBlockToChapter: (chapterId: string, block: ManuscriptBlock) => void;
  updateBlock: (chapterId: string, blockId: string, updates: Partial<ManuscriptBlock>) => void;
  removeBlock: (chapterId: string, blockId: string) => void;
  markPassageUsed: (interviewId: string, passageId: string, chapterId: string) => void;
  setPassageStatus: (interviewId: string, passageId: string, status: import('./types').PassageStatus) => void;
  addPersonToInterview: (interviewId: string, name: string, relation?: string) => void;
  removePersonFromInterview: (interviewId: string, personId: string) => void;
  addPlaceDateToInterview: (interviewId: string, label: string) => void;
  removePlaceDateFromInterview: (interviewId: string, placeDateId: string) => void;
  updateInterviewNotes: (interviewId: string, notes: string) => void;
  updateInterviewIssues: (interviewId: string, issues: string[]) => void;
  updateInterviewSummarySections: (interviewId: string, sections: import('./types').SummarySection[]) => void;
  addTheme: (theme: string) => void;
  addThemeAnnotation: (interviewId: string, passageId: string, start: number, end: number, theme: string) => void;
  removeThemeAnnotation: (interviewId: string, passageId: string, annotationId: string) => void;
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
    updatePassage(interviewId, passageId, { status: 'integre', usedInChapter: chapterId });
  }, [updatePassage]);

  const setPassageStatus = useCallback((interviewId: string, passageId: string, status: import('./types').PassageStatus) => {
    updatePassage(interviewId, passageId, { status, usedInChapter: status === 'integre' ? undefined : undefined });
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

  const removePersonFromInterview = useCallback((interviewId: string, personId: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, persons: i.persons.filter(p => p.id !== personId) }
          : i
      ),
    }));
  }, []);

  const removePlaceDateFromInterview = useCallback((interviewId: string, placeDateId: string) => {
    setProject(prev => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId
          ? { ...i, placesDates: i.placesDates.filter(pd => pd.id !== placeDateId) }
          : i
      ),
    }));
  }, []);

  const updateInterviewNotes = useCallback((interviewId: string, notes: string) => {
    updateInterview(interviewId, { notes });
  }, [updateInterview]);

  const updateInterviewIssues = useCallback((interviewId: string, issues: string[]) => {
    updateInterview(interviewId, { issues });
  }, [updateInterview]);

  const updateInterviewSummarySections = useCallback((interviewId: string, sections: import('./types').SummarySection[]) => {
    updateInterview(interviewId, { summarySections: sections });
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

  return (
    <ProjectContext.Provider value={{
      project,
      updateInterview,
      updatePassage,
      addChapter,
      updateChapter,
      addBlockToChapter,
      updateBlock,
      removeBlock,
      markPassageUsed,
      setPassageStatus,
      addPersonToInterview,
      addPlaceDateToInterview,
      updateInterviewNotes,
      addTheme,
      addThemeAnnotation,
      removeThemeAnnotation,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
