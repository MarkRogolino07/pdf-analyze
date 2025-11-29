from fastapi import FastAPI, Query, APIRouter, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.utils import DocManagerService, SectionsOutput, DocUploadOutput, Output
import os

app = FastAPI()
doc_manager_service = DocManagerService()

frontend_api_url = os.environ.get("FRONTEND_API_URL", "http://localhost:3000") 

origins = [
    frontend_api_url,
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="", tags=["query"])

@router.get("/documents", response_model=list[SectionsOutput])
async def get_documents() -> list[SectionsOutput]:
    return doc_manager_service.get_documents()

@router.get("/documents/{document_id}", response_model=SectionsOutput)
async def get_document_sections(document_id: str) -> SectionsOutput:
    return doc_manager_service.get_sections(document_id)

@router.post("/documents/upload", response_model=DocUploadOutput)
async def upload_documents(file: UploadFile = File(...)) -> DocUploadOutput:
    file_content = await file.read()
    return doc_manager_service.add_document(file_content)

@router.get("/section_by_citation/{citation_source}", response_model=str)
async def get_section_id_by_citation_source(citation_source: str) -> str:
    return doc_manager_service.get_section_id_by_citation_source(citation_source)

@router.get("/query", response_model=Output)
async def query_documents(
    q: str = Query(..., description="Query string to search for", min_length=1),
) -> Output:
    return doc_manager_service.query(q)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)