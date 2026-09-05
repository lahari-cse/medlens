from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractors.document_parser import parse_pdf_document
from extractors.gemini_extractor import extract_with_gemini
import uvicorn
import os

app = FastAPI(
    title="MedLens AI Extraction Service",
    description="Multimodal Document OCR & Structured JSON Extraction Engine for Medical Reports",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "MedLens Python FastAPI AI Engine",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/extract")
async def extract_document(
    file: UploadFile = File(...),
    document_title: str = Form(default="Medical Report")
):
    try:
        contents = await file.read()
        filename = file.filename or "report.pdf"
        
        # Parse PDF text
        if filename.lower().endswith(".pdf"):
            text_content = parse_pdf_document(contents)
        else:
            text_content = f"Image Document Uploaded: {filename}"

        extraction_result = extract_with_gemini(text_content, filename)
        return {"success": True, "filename": filename, "data": extraction_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
