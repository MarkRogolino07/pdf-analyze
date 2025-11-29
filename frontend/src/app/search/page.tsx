'use client';

import { useState } from 'react';
import { useSearch, useSectionByCitation } from '@/lib/hooks';
import Navigation from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Citation } from '@/lib/types';

interface CitationCardProps {
  citation: Citation;
  index: number;
}

const CitationCard = ({ citation, index }: CitationCardProps) => {
  let { data: documentId } = useSectionByCitation(citation.source);
  if(documentId)
    if (documentId.startsWith('"') && documentId.endsWith('"')) {
      documentId = documentId.slice(1, -1);
}

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citation {index + 1}</CardTitle>
          {documentId && documentId !== "No matching section found" && (
            <Link
              href={`/documents/${documentId}?section=${encodeURIComponent(citation.source)}`}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              View
            </Link>
          )}
        </div>
        <CardDescription className="font-medium">
          {citation.source}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed">
          {citation.text}
        </p>
      </CardContent>
    </Card>
  );
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchResult, isLoading, error } = useSearch(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchQuery('');
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Search Documents</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Query</CardTitle>
            <CardDescription>
              Enter your search query to find relevant information across all documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="search-query">Query</Label>
                <Input
                  id="search-query"
                  type="text"
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={!query.trim() || isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
                {searchQuery && (
                  <Button type="button" onClick={handleClear}>
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600">
                Search failed: {error.message}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && searchQuery && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                Searching documents...
              </div>
            </CardContent>
          </Card>
        )}

        {searchResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Query: "{searchResult.query}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {searchResult.response}
                  </p>
                </div>
              </CardContent>
            </Card>

            {searchResult.citations && searchResult.citations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Citations ({searchResult.citations.length})
                </h2>
                <div className="space-y-4">
                  {searchResult.citations.map((citation, index) => (
                    <CitationCard
                      key={index}
                      citation={citation}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {searchQuery && !isLoading && !error && !searchResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                No results found for "{searchQuery}"
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
