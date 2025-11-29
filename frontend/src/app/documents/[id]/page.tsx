'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useDocumentSections } from '@/lib/hooks';
import Navigation from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '@/lib/types';

// Simple Tree Component (since shadcn tree wasn't available)
interface TreeNodeProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSectionSelect: (section: Section) => void;
}

const TreeNode = ({ sections, selectedSectionId, onSectionSelect }: TreeNodeProps) => {
  // Group sections by main section
  const groupedSections = sections.reduce((acc, section) => {
    const mainSection = section.extra_info.MainSection;
    if (!acc[mainSection]) {
      acc[mainSection] = [];
    }
    acc[mainSection].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  return (
    <div className="space-y-2">
      {Object.entries(groupedSections).map(([mainSection, sectionList]) => (
        <div key={mainSection}>
          <div className="font-medium text-gray-900 mb-1 px-2 py-1">
            {mainSection}
          </div>
          <div className="ml-4 space-y-1">
            {sectionList.map((section) => (
              <div
                key={section.id}
                className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors ${
                  selectedSectionId === section.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSectionSelect(section)}
              >
                {section.extra_info.SubsectionNumber}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DocumentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = params.id as string;
  const sectionParam = searchParams.get('section');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  const { data: document, isLoading, error } = useDocumentSections(documentId);

  // Handle section selection from URL parameter or auto-select first section
  useEffect(() => {
    if (!document?.sections) return;
    
    if (sectionParam) {
      // Find section by citation source (Section field in extra_info)
      const targetSection = document.sections.find(
        section => section.extra_info.Section === sectionParam
      );
      if (targetSection) {
        setSelectedSection(targetSection);
        return;
      }
    }
    
    // Auto-select first section if no section is selected and no URL param
    if (!selectedSection && document.sections.length > 0) {
      setSelectedSection(document.sections[0]);
    }
  }, [document, sectionParam, selectedSection]);

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading document...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading document: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Document not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold">Document {documentId.slice(0, 8)}...</h1>
          <span className="ml-4 text-gray-600">
            {document.sections.length} sections
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {document.sections.length > 0 ? (
                  <TreeNode
                    sections={document.sections}
                    selectedSectionId={selectedSection?.id || null}
                    onSectionSelect={setSelectedSection}
                  />
                ) : (
                  <p className="text-gray-500">No sections available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-9">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedSection ? (
                    <>
                      {selectedSection.extra_info.MainSection}{' '}
                      <span className="text-gray-500">
                        ({selectedSection.extra_info.SubsectionNumber})
                      </span>
                    </>
                  ) : (
                    'Select a section'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {selectedSection ? (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedSection.text}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Select a section from the left to view its content
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
