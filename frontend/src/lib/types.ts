// Types matching the backend Pydantic models

export interface ExtraInfo {
  Section: string;
  MainSection: string;
  SubsectionNumber: string;
}

export interface Section {
  id: string;
  extra_info: ExtraInfo;
  text: string;
}

export interface SectionsOutput {
  docId: string;
  sections: Section[];
}

export interface DocUploadOutput {
  doc_id: string;
  message: string;
}

export interface Citation {
  source: string;
  text: string;
}

export interface QueryOutput {
  query: string;
  response: string;
  citations: Citation[];
}

export interface DocumentWithStatus extends SectionsOutput {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
