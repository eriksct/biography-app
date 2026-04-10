export type InterviewStatus = 'recording' | 'transcribed' | 'processed';

export interface ThemeAnnotation {
  id: string;
  start: number;
  end: number;
  theme: string;
}

export interface Passage {
  id: string;
  text: string;
  timestamp: string; // e.g. "00:03:21"
  themes: string[];
  themeAnnotations: ThemeAnnotation[];
  usedInChapter?: string;
}

export interface Person {
  id: string;
  name: string;
  relation?: string;
}

export interface PlaceDate {
  id: string;
  label: string;
}

export interface SummarySection {
  title: string;
  content: string;
}

export interface Interview {
  id: string;
  number: number;
  title?: string;
  date: string;
  duration: string;
  status: InterviewStatus;
  passages: Passage[];
  persons: Person[];
  placesDates: PlaceDate[];
  themes: string[];
  notes: string;
  issues: string[];
  summary: string;
  summarySections: SummarySection[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  blocks: ManuscriptBlock[];
}

export interface ManuscriptBlock {
  id: string;
  type: 'text' | 'passage';
  content: string;
  passageId?: string;
  interviewId?: string;
  interviewNumber?: number;
}

export interface Project {
  id: string;
  name: string;
  interviews: Interview[];
  chapters: Chapter[];
  allThemes: string[];
}
