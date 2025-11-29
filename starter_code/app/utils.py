from pydantic import BaseModel
import qdrant_client
import pypdf
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.schema import Document
from llama_index.core import (
    VectorStoreIndex,
    ServiceContext,
    Settings
)
from llama_index.core.query_engine import CitationQueryEngine
from dataclasses import dataclass
import os
import re
import uuid
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()
key = os.environ['OPENAI_API_KEY']

@dataclass
class Input:
    query: str
    file_path: str

@dataclass
class Citation:
    source: str
    text: str

class Output(BaseModel):
    query: str
    response: str
    citations: list[Citation]

class ExtraInfo(BaseModel):
    Section: str
    MainSection: str
    SubsectionNumber: str
class Section(BaseModel):
    id: str
    extra_info: ExtraInfo
    text: str

class SectionsOutput(BaseModel):
    docId: str
    sections: list[Section]

class DocUploadOutput(BaseModel):
    doc_id: str
    message: str

class DocManagerService:
    def __init__(self):
        self.doc_manager = {}
        self.doc_service = DocumentService()
        self.index = QdrantService()
        self.index.connect()

    def add_document(self, file_content: bytes) -> DocUploadOutput:
        docs = self.doc_service.create_documents(file_content)
        doc_id = str(uuid.uuid4())
        self.doc_manager[doc_id] = docs
        self.index.load(docs)
        return DocUploadOutput(doc_id=doc_id, message="Document uploaded successfully")

    def get_sections(self, doc_id):
        docs = self.doc_manager.get(doc_id, [])
        sections = []
        for doc in docs:
            section = {
                "id": doc.id_,
                "extra_info": doc.extra_info,
                "text": doc.text,
            }
            sections.append(section)
        return SectionsOutput(docId=doc_id, sections=sections)
    
    def query(self, query_str: str) -> Output:
        return self.index.query(query_str)

    def get_documents(self) -> list[SectionsOutput]:
        return [self.get_sections(doc_id) for doc_id in self.doc_manager.keys()]

    def get_section_id_by_citation_source(self, citation_source: str) -> str:
        doc_ids = [doc_id for doc_id, docs in self.doc_manager.items() for doc in docs if doc.extra_info["Section"] == citation_source]
        if len(doc_ids) == 0:
            return "No matching section found"
        return doc_ids[0]

class DocumentService:
    @staticmethod
    def _add_spaces_to_text(text: str) -> str:
        text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
        text = re.sub(r"([.,;:!?])([A-Za-z])", r"\1 \2", text)
        text = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", text)
        text = re.sub(r"(\d)([A-Za-z])", r"\1 \2", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def _extract_section_titles(self, full_text: str) -> dict[str, str]:
        section_titles = {}

        for i in range(1, 50):
            pattern = rf"{i}\.\s+([A-Z][a-z]+)\s*{i}\.1\."
            match = re.search(pattern, full_text)
            if match:
                section_titles[str(i)] = match.group(1)

        return section_titles

    def create_documents(self, file_content: bytes) -> list[Document]:
        pdf_file_object = BytesIO(file_content)
        reader = pypdf.PdfReader(pdf_file_object)
        full_text = "".join(
            page.extract_text(extraction_mode="layout") for page in reader.pages
        )

        full_text = re.sub(r"^.*?(?=1\.\s+)", "", full_text, flags=re.DOTALL)
        full_text = re.sub(r"Citations:.*$", "", full_text, flags=re.DOTALL)

        section_titles = self._extract_section_titles(full_text)
        pattern = r"(\d+\.\d+(?:\.\d+)*)\.\s+"
        parts = re.split(pattern, full_text)

        documents = []
        for i in range(1, len(parts) - 1, 2):
            section_num = parts[i]
            text = parts[i + 1].strip()
            text = re.sub(r"\d+\.\s+[A-Z][a-z]+\s*$", "", text).strip()
            text = self._add_spaces_to_text(text)

            if not text:
                continue

            main_section_num = section_num.split(".")[0]
            section_title = section_titles.get(
                main_section_num, f"Section {main_section_num}"
            )

            documents.append(
                Document(
                    metadata={
                        "Section": f"{section_title} {section_num}",
                        "MainSection": section_title,
                        "SubsectionNumber": section_num,
                    },
                    text=text,
                )
            )

        return documents

class QdrantService:
    def __init__(self, k: int = 2):
        self.index = None
        self.k = k

    def connect(self) -> None:
        # Configure global settings for embeddings and LLM
        Settings.embed_model = OpenAIEmbedding()
        Settings.llm = OpenAI(api_key=key, model="gpt-4")

        client = qdrant_client.QdrantClient(location=":memory:")
        vector_store = QdrantVectorStore(client=client, collection_name="laws")
        self.index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

    def load(self, docs: list[Document]) -> None:
        """Load documents into the vector store."""
        self.index.insert_nodes(docs)

    def query(self, query_str: str) -> Output:
        query_engine = CitationQueryEngine.from_args(
            self.index,
            similarity_top_k=self.k,
            citation_chunk_size=512,
        )

        response = query_engine.query(query_str)

        citations = []
        if hasattr(response, "source_nodes"):
            for node in response.source_nodes:
                metadata = node.node.metadata
                source = metadata.get("Section", "Unknown Section")
                text = node.node.text
                citations.append(Citation(source=source, text=text))

        output = Output(
            query=query_str,
            response=str(response),
            citations=citations,
        )

        return output
