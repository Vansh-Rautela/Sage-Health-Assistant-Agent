import pdfplumber
import streamlit as st
from config.app_config import MAX_UPLOAD_SIZE_MB
import mimetypes

def validate_file_type(file):
    """Validate that the file is actually a PDF."""
    try:
        if not file.name.lower().endswith('.pdf'):
            return False, "Invalid file type. Please upload a PDF file."
        return True, None
    except Exception as e:
        return False, f"Error validating file type: {str(e)}"

def validate_pdf_size(file):
    """Validate PDF file size against configured limit."""
    if file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:  # Convert MB to bytes
        return False, f"File size exceeds {MAX_UPLOAD_SIZE_MB}MB limit"
    return True, None

def validate_medical_report(text):
    """Validate if the PDF content appears to be a medical report."""
    # Common medical report indicators
    medical_terms = [
        'blood', 'test', 'report', 'laboratory', 'lab', 'patient', 'specimen',
        'reference range', 'analysis', 'results', 'medical', 'diagnostic',
        'hemoglobin', 'wbc', 'rbc', 'platelet', 'glucose', 'creatinine'
    ]
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Count how many medical terms appear in the text
    term_matches = sum(1 for term in medical_terms if term in text_lower)
    
    # Require at least 3 medical terms to consider it a valid report
    if term_matches < 3:
        return False, "The uploaded file doesn't appear to be a medical report. Please upload a valid medical report."
    
    return True, None

def extract_text_from_pdf(pdf_file):
    try:
        # Validate file type first
        is_valid_type, error = validate_file_type(pdf_file)
        if not is_valid_type:
            return error
            
        # Validate file size
        is_valid_size, error = validate_pdf_size(pdf_file)
        if not is_valid_size:
            return error

        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            if len(pdf.pages) > 50:
                return "PDF exceeds maximum page limit of 50"
                
            for page in pdf.pages:
                extracted = page.extract_text()
                if not extracted:
                    return "Could not extract text from PDF. Please ensure it's not a scanned document."
                text += extracted + "\n"
                
        if len(text.strip()) < 50:
            return "Extracted text is too short. Please ensure the PDF contains valid text."
            
        # Validate if it's a medical report
        is_medical, error = validate_medical_report(text)
        if not is_medical:
            return error
            
        return text
    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"
