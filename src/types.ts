export interface MockQuestion {
  question: string;
  type: string;
  suggestedApproach: string;
}

export interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  optimizationStructure: string[];
  optimizationWording: string[];
  optimizationSkills: string[];
  mockQuestions: MockQuestion[];
  suggestedJobTitles: string[];
}

export interface ResumeDoc {
  id: string;
  userId: string;
  resumeText: string;
  jobTarget: string;
  createdAt: string; // ISO string format
  score: number;
  title: string;
  analysis: ResumeAnalysis;
}

export interface UserInvoice {
  id: string;
  userId: string;
  invoiceNo: string;
  amount: string;
  date: string;
  email: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  isPremium: boolean;
}
