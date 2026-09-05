from pypdf import PdfReader
import io

def parse_pdf_document(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            extracted_pages.append(f"--- PAGE {i + 1} ---\n{text}")
        return "\n".join(extracted_pages)
    except Exception as e:
        return f"PDF Text Parsing Notice: {str(e)}"
