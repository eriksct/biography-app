import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project } from './types';
import { demoProject } from './demoData';

interface AppContextType {
  projects: Project[];
  createProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updater: (p: Project) => Project) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([demoProject]);

  const createProject = useCallback((name: string) => {
    const id = `project-${Date.now()}`;
    const newProject: Project = {
      id,
      name,
      interviews: [],
      chapters: [],
      allThemes: [],
    };
    setProjects(prev => [...prev, newProject]);
    return id;
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const updateProject = useCallback((id: string, updater: (p: Project) => Project) => {
    setProjects(prev => prev.map(p => p.id === id ? updater(p) : p));
  }, []);

  return (
    <AppContext.Provider value={{ projects, createProject, renameProject, deleteProject, getProject, updateProject }}>
      {children}
    </AppContext.Provider>
  );
};
