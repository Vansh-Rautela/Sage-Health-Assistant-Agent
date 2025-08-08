import pdfplumber
# --- THE FIX: Changed relative imports to absolute from the project root ---
from src.utils.validators import validate_pdf_content
from src.config.app_config import MAX_PDF_PAGES
# --- END OF FIX ---

def extract_text_from_pdf(pdf_file):
    """Extract and validate text from a PDF file stream."""
    try:
        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            if len(pdf.pages) > MAX_PDF_PAGES:
                return f"PDF exceeds maximum page limit of {MAX_PDF_PAGES}"
            for page in pdf.pages:
                extracted = page.extract_text()
                if not extracted:
                    return "Could not extract text from PDF. Please ensure it's not a scanned document."
                text += extracted + "\n"
        
        is_valid, error = validate_pdf_content(text)
        if not is_valid:
            return error
            
        return text
    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"