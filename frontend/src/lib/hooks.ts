import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { DocumentWithStatus, SectionsOutput, QueryOutput } from './types';

export const useDocuments = () => {
  return useQuery<DocumentWithStatus[], Error>({
    queryKey: ['documents'],
    queryFn: () => apiClient.getDocuments(),
  });
};

export const useDocumentSections = (documentId: string) => {
  return useQuery<SectionsOutput, Error>({
    queryKey: ['documents', documentId],
    queryFn: () => apiClient.getDocumentSections(documentId),
    enabled: !!documentId,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadDocument(file),
    onSuccess: () => {
      // Invalidate and refetch documents list after successful upload
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useSearch = (queryString: string) => {
  return useQuery<QueryOutput, Error>({
    queryKey: ['query', queryString],
    queryFn: () => apiClient.query(queryString),
    enabled: !!queryString.trim(),
  });
};

export const useSectionByCitation = (citationSource: string) => {
  return useQuery<string, Error>({
    queryKey: ['section-by-citation', citationSource],
    queryFn: () => apiClient.getSectionIdByCitationSource(citationSource),
    enabled: !!citationSource,
  });
};
