export interface Career { id: number; name: string; }
export interface Subject { id: number; careerId: number; name: string; }
export interface Topic { id: number; subjectId: number; name: string; }

export interface AcademicResourceSource {
  id: number;
  title: string;
  description: string | null;
  url: string;
}

export interface MentorMessageResponse { 
  answer: string; 
  context: { topic: string; level: string; };
  sources: AcademicResourceSource[];
  extensionType?: 'text' | 'code_snippet' | 'concept_card';
  extensionData?: any; 
}
