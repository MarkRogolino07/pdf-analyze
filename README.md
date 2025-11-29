# Document Analysis Portal

A full-stack application for uploading, analyzing, and searching PDF documents using AI-powered analysis.

## Features

- **Document Upload**: Upload PDF documents with drag-and-drop support
- **Document Analysis**: Automatic section-by-section analysis of uploaded documents
- **Document Viewer**: Browse documents with a tree view of sections and content display
- **Search**: Search across all documents with AI-powered responses and citations
- **Citation Linking**: Click on citations to navigate directly to the source document section

## Architecture

- **Backend**: Python FastAPI with LlamaIndex, OpenAI, and Qdrant for document processing and search
- **Frontend**: Next.js with TypeScript, TailwindCSS, shadcn/ui, and TanStack React Query
- **Database**: In-memory Qdrant vector database for document embeddings

## Prerequisites

- Docker and Docker Compose
- OpenAI API Key

## Quick Start

1. **Clone and setup environment**:
   ```bash
   cd /path/to/project
   cp .env.example .env
   ```

2. **Configure your OpenAI API key** in the `.env` file:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Development

```bash
cd starter_code
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /documents` - List all uploaded documents
- `POST /documents/upload` - Upload a new PDF document
- `GET /documents/{document_id}` - Get sections for a specific document
- `GET /query` - Search across all documents
- `GET /section_by_citation/{citation_source}` - Get section ID by citation source

## Usage

1. **Upload Documents**: Navigate to the Upload page and select or drag-and-drop a PDF file
2. **View Documents**: The main page shows all uploaded documents with their analysis status
3. **Browse Sections**: Click on a document to view its sections in a tree structure with content display
4. **Search**: Use the Search page to query across all documents and get AI-powered responses with citations
5. **Follow Citations**: Click on citations in search results to navigate to the original document sections

## Technologies Used

### Backend
- FastAPI - Modern Python web framework
- LlamaIndex - Document indexing and retrieval framework
- OpenAI - AI models for analysis and search
- Qdrant - Vector database for embeddings
- PyPDF - PDF text extraction

### Frontend
- Next.js 15 - React framework with App Router
- TypeScript - Type-safe JavaScript
- TailwindCSS - Utility-first CSS framework
- shadcn/ui - Modern UI components
- TanStack React Query - Data fetching and caching

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `FRONTEND_API_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend (default: http://localhost:8000)

## Project Structure

```
├── starter_code/           # Python backend
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   └── utils.py       # Document processing logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # API client and utilities
│   ├── package.json
│   └── Dockerfile.dev
├── docker-compose.yml     # Development environment
└── README.md
```

## Notes

- The application uses in-memory storage, so data will be lost when containers are restarted
- Document analysis happens immediately upon upload
- Search results include up to 5 citations by default
- The UI is designed to be simple and functional with minimal styling as requested
