export interface Career {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  careerId: number;
  name: string;
}

export interface Topic {
  id: number;
  subjectId: number;
  name: string;
}

export interface StudentDto {
  id: number;
  name: string;
  careerId: number;
}

export interface MentorSource {
  id: number | string;
  title: string;
  description: string;
  url: string;
}

export type Source = MentorSource;

export interface MentorMessageRequest {
  studentId: number;
  subjectId: number;
  topicId: number;
  message: string;
  sessionId?: string | number;
}

export type SendMentorMessageBackendPayload = MentorMessageRequest;

export interface MentorMessageResponse {
  answer: string;
  sources?: MentorSource[];
  sessionId?: number | string;
  context?: {
    topic: string;
    level: string;
  };
  extensionType?: 'text' | 'code_snippet' | 'concept_card';
  extensionData?: unknown;
}

export * from './index';
