export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  category?: 'common';
}

export interface SavedPrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface CaseblinkPrompt {
  id: string;
  label: string;
  prompt: string;
}

export type ReferenceCategory = 
  | 'applicant-resume'
  | 'identity-biographic'
  | 'personal-statement'
  | 'employer-documents';

export interface Reference {
  id: string;
  name: string;
  type: 'case-document' | 'strategy-doc';
  category: ReferenceCategory;
}

// Mock data for testing
export const mockQuickActions: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Summarize',
    prompt: 'Summarize the selected text in a clear and concise manner.',
    category: 'common'
  },
  {
    id: 'qa-2',
    label: 'Expand',
    prompt: 'Expand on the selected text with more detail and context.',
    category: 'common'
  },
  {
    id: 'qa-3',
    label: 'Simplify',
    prompt: 'Simplify the selected text to make it more accessible.',
    category: 'common'
  },
  {
    id: 'qa-4',
    label: 'Rewrite',
    prompt: 'Rewrite the selected text to improve clarity and flow.'
  },
  {
    id: 'qa-5',
    label: 'Analyze',
    prompt: 'Analyze the selected text and provide key insights.'
  }
];

export const mockSavedPrompts: SavedPrompt[] = [
  {
    id: 'sp-1',
    label: 'Legal Analysis',
    prompt: 'Provide a detailed legal analysis of the selected text, identifying key legal principles and precedents.'
  },
  {
    id: 'sp-2',
    label: 'Case Comparison',
    prompt: 'Compare the selected text with similar cases and highlight differences.'
  },
  {
    id: 'sp-3',
    label: 'Risk Assessment',
    prompt: 'Assess the legal risks and implications of the selected text.'
  }
];

export const mockCaseblinkPrompts: CaseblinkPrompt[] = [
  {
    id: 'cp-1',
    label: 'Generate Case Brief',
    prompt: 'Generate a comprehensive case brief based on the selected text.'
  },
  {
    id: 'cp-2',
    label: 'Extract Key Facts',
    prompt: 'Extract and organize the key facts from the selected text.'
  },
  {
    id: 'cp-3',
    label: 'Identify Legal Issues',
    prompt: 'Identify and list all legal issues present in the selected text.'
  },
  {
    id: 'cp-4',
    label: 'Draft Argument',
    prompt: 'Draft a persuasive legal argument based on the selected text.'
  }
];

export const mockReferences: Reference[] = [
  // Applicant Resume
  {
    id: 'ref-1',
    name: 'John Doe - Resume 2024',
    type: 'case-document',
    category: 'applicant-resume'
  },
  {
    id: 'ref-2',
    name: 'Jane Smith - CV',
    type: 'case-document',
    category: 'applicant-resume'
  },
  // Identity and Biographic Documents
  {
    id: 'ref-3',
    name: 'Passport - John Doe',
    type: 'case-document',
    category: 'identity-biographic'
  },
  {
    id: 'ref-4',
    name: 'Birth Certificate',
    type: 'case-document',
    category: 'identity-biographic'
  },
  {
    id: 'ref-5',
    name: 'Driver License',
    type: 'case-document',
    category: 'identity-biographic'
  },
  // Personal Statement
  {
    id: 'ref-6',
    name: 'Personal Statement - John Doe',
    type: 'case-document',
    category: 'personal-statement'
  },
  {
    id: 'ref-7',
    name: 'Statement of Purpose',
    type: 'case-document',
    category: 'personal-statement'
  },
  // Employer Documents
  {
    id: 'ref-8',
    name: 'Employment Letter - Tech Corp',
    type: 'case-document',
    category: 'employer-documents'
  },
  {
    id: 'ref-9',
    name: 'Pay Stubs - Q1 2024',
    type: 'case-document',
    category: 'employer-documents'
  },
  {
    id: 'ref-10',
    name: 'Reference Letter - Manager',
    type: 'case-document',
    category: 'employer-documents'
  }
];
