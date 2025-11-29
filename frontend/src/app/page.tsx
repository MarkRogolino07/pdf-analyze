'use client';

import { useDocuments } from '@/lib/hooks';
import Navigation from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading documents...</div>
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
            Error loading documents: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Documents</h1>
          <Link 
            href="/upload" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Document
          </Link>
        </div>

        {!documents || documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No documents uploaded yet.</p>
            <Link 
              href="/upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.docId} className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link href={`/documents/${doc.docId}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Document {doc.docId.slice(0, 8)}...</CardTitle>
                    <CardDescription>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                        doc.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {doc.sections.length} sections available
                    </p>
                    {doc.sections.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2 truncate">
                        First section: {doc.sections[0].extra_info.MainSection}
                      </p>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
