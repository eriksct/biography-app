export type InterviewStatus = 'recording' | 'transcribed' | 'processed';

export type PassageStatus = 'non-integre' | 'details-manquants' | 'integre';

export interface Passage {
  id: string;
  text: string;
  timestamp: string; // e.g. "00:03:21"
  themes: string[];
  status: PassageStatus;
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

export interface Interview {
  id: string;
  number: number;
  date: string;
  duration: string;
  status: InterviewStatus;
  passages: Passage[];
  persons: Person[];
  placesDates: PlaceDate[];
  themes: string[];
  notes: string;
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
