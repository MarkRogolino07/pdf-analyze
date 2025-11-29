import { SectionsOutput, DocUploadOutput, QueryOutput, DocumentWithStatus } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private async fetchWithError(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  }

  async getDocuments(): Promise<DocumentWithStatus[]> {
    const response = await this.fetchWithError(`${BASE_URL}/documents`);
    const sections: SectionsOutput[] = await response.json();
    
    // For now, we'll assume all documents are completed since the backend doesn't track status
    // In a real implementation, you might want to add status tracking to the backend
    return sections.map(section => ({
      ...section,
      status: 'completed' as const
    }));
  }

  async getDocumentSections(documentId: string): Promise<SectionsOutput> {
    const response = await this.fetchWithError(`${BASE_URL}/documents/${documentId}`);
    return response.json();
  }

  async uploadDocument(file: File): Promise<DocUploadOutput> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return response.json();
  }

  async getSectionIdByCitationSource(citationSource: string): Promise<string> {
    const response = await this.fetchWithError(`${BASE_URL}/section_by_citation/${encodeURIComponent(citationSource)}`);
    return response.text();
  }

  async query(queryString: string): Promise<QueryOutput> {
    const response = await this.fetchWithError(`${BASE_URL}/query?q=${encodeURIComponent(queryString)}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
