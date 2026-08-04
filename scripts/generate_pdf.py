import sys
import os
import subprocess

# Ensure reportlab is installed
try:
    import reportlab
except ImportError:
    print("reportlab not found. Installing via pip...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
    import reportlab

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# -------------------------------------------------------------
# CONSTANTS & CONFIGURATION
# -------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

# File Paths
STRUCT_PDF_PATH = os.path.join(DOCS_DIR, "folder_structure_explanation.pdf")
PPTX_PATH = os.path.join(BASE_DIR, "explainable_fake_job_detection_presentation.pptx")
PPTX_PDF_PATH = os.path.join(BASE_DIR, "explainable_fake_job_detection_presentation.pdf")

# Colors
COLOR_PRIMARY = colors.HexColor("#0F172A")    # Deep Slate
COLOR_SECONDARY = colors.HexColor("#1E293B")  # Slate Blue
COLOR_ACCENT = colors.HexColor("#3B82F6")     # Blue
COLOR_TEXT = colors.HexColor("#334155")       # Charcoal
COLOR_LIGHT_BG = colors.HexColor("#F8FAFC")   # Off-white

# -------------------------------------------------------------
# STEP 1: GENERATE FOLDER STRUCTURE DOCUMENTATION PDF
# -------------------------------------------------------------
def build_structure_pdf():
    print("Building folder structure documentation PDF...")
    doc = SimpleDocTemplate(
        STRUCT_PDF_PATH,
        pagesize=letter,
        leftMargin=54, rightMargin=54,
        topMargin=54, bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=COLOR_PRIMARY,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=COLOR_ACCENT,
        spaceAfter=20
    )
    
    h1_style = ParagraphStyle(
        'Heading1Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=10
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=COLOR_TEXT,
        spaceAfter=8
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=COLOR_TEXT
    )

    table_cell_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=COLOR_SECONDARY
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("Explainable Fake Job Detection Framework", title_style))
    story.append(Paragraph("Repository Structure & Blueprint Guide", subtitle_style))
    story.append(Spacer(1, 10))

    # Introduction
    intro_text = (
        "This document details the architectural folder structure of the project. "
        "The project is structured as a three-tier architecture: a React frontend client, "
        "a Node.js/Express orchestration backend gateway, and a Python FastAPI AI computation service, "
        "persisted by a MongoDB database. This guide details where specific functions run "
        "and where the files are located."
    )
    story.append(Paragraph(intro_text, body_style))
    story.append(Spacer(1, 10))

    # --- SECTION 1: AI SERVICE ---
    story.append(Paragraph("1. Python FastAPI AI Service (ai_service/)", h1_style))
    story.append(Paragraph(
        "Located inside the <code>ai_service/</code> directory, this Python environment runs "
        "pre-processing cleanups, BERT tokenization, binary ML predictions, heuristic scores, "
        "and explains predictions locally utilizing LIME and SHAP models.",
        body_style
    ))

    # AI Service Table
    ai_data = [
        [Paragraph("File / Subfolder", table_header_style), Paragraph("Function & Execution Details", table_header_style)],
        [Paragraph("app.py", table_cell_bold_style), Paragraph("Configures the FastAPI HTTP app. Initiates routing hooks like `/analyze/text`, `/analyze/url`, `/analyze/pdf`, `/analyze/image`.", table_cell_style)],
        [Paragraph("pipeline.py", table_cell_bold_style), Paragraph("Contains <code>run_analysis_pipeline()</code> which orchestrates the complete analysis flow (Ingestion -> Preprocessing -> BERT classification -> Trust Score -> Severity Score -> Risk Tiers -> LIME/SHAP).", table_cell_style)],
        [Paragraph("bert_model/", table_cell_bold_style), Paragraph("Houses fine-tuning and inference logic. Loads the fine-tuned BERT-base-uncased classifier weights and evaluates fraud probabilities via <code>predict_fraud_probability()</code>.", table_cell_style)],
        [Paragraph("preprocessing/", table_cell_bold_style), Paragraph("Strips HTML symbols, removes emojis, normalizes whitespaces, and runs WordPiece tokenization prior to ML classification.", table_cell_style)],
        [Paragraph("signals/", table_cell_bold_style), Paragraph("Heuristic extraction script <code>detectors.py</code> scans for 10 deterministic flags like fee requests or free email handlers.", table_cell_style)],
        [Paragraph("trust_engine/", table_cell_bold_style), Paragraph("Calculates a 0–100 Trust Score via <code>compute_trust_score()</code> using negative adjustments for heuristic warning triggers.", table_cell_style)],
        [Paragraph("severity_engine/", table_cell_bold_style), Paragraph("Computes a 0–100 Severity Score via <code>compute_severity_score()</code> to assess candidate damage risks (e.g. wire transfer requests).", table_cell_style)],
        [Paragraph("risk_engine/", table_cell_bold_style), Paragraph("Performs 4-tier risk classification via <code>categorize_risk()</code> mapping the composite BERT probability grid against the Trust Score.", table_cell_style)],
        [Paragraph("xai/", table_cell_bold_style), Paragraph("Manages explainability. Loads precomputed SHAP values for global dataset patterns and runs LIME local models live per instance request.", table_cell_style)],
        [Paragraph("input_processing/", table_cell_bold_style), Paragraph("Extracts text from various input channels: uses PyMuPDF for documents, EasyOCR for screenshots, and JSON-LD scrapers for job page URLs.", table_cell_style)]
    ]

    t_ai = Table(ai_data, colWidths=[120, 380])
    t_ai.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_LIGHT_BG])
    ]))
    story.append(t_ai)
    story.append(Spacer(1, 15))

    # --- SECTION 2: EXPRESS BACKEND ---
    story.append(Paragraph("2. Express Orchestration Backend Gateway (backend/)", h1_style))
    story.append(Paragraph(
        "Written in JavaScript (Node.js/Express), this layer acts as the public gatekeeper, managing user sessions, "
        "enforcing rate limits, validating files, proxying requests to the FastAPI backend, and logging outcomes to MongoDB.",
        body_style
    ))

    be_data = [
        [Paragraph("File / Subfolder", table_header_style), Paragraph("Function & Execution Details", table_header_style)],
        [Paragraph("app.js / server.js", table_cell_bold_style), Paragraph("Initializes database connections, configures CORS, binds middleware routers, and opens the listener port (5000).", table_cell_style)],
        [Paragraph("routes/", table_cell_bold_style), Paragraph("Maps HTTP pathways. Organizes user authorization end routes, history listing routes, and upload endpoints.", table_cell_style)],
        [Paragraph("controllers/", table_cell_bold_style), Paragraph("Houses handlers: <code>analysisController.js</code> receives files, pushes payloads to FastAPI client, and logs outcomes in MongoDB via <code>persistAnalysis()</code>. <code>authController.js</code> handles logins/session JWTs.", table_cell_style)],
        [Paragraph("models/", table_cell_bold_style), Paragraph("Configures MongoDB schemas: `User.js` saves passwords and profiles; `Analysis.js` stores the complete AI evaluation scorecard (scores, text, attributions, recommendations).", table_cell_style)],
        [Paragraph("middleware/", table_cell_bold_style), Paragraph("Binds security handlers: validates JWT sessions, applies rate limits, and uses Multer to validate and buffer PDF or image uploads.", table_cell_style)],
        [Paragraph("utils/aiServiceClient.js", table_cell_bold_style), Paragraph("An Axios HTTP wrapper that handles communications and transfers raw parameters between Node.js and the FastAPI server.", table_cell_style)]
    ]

    t_be = Table(be_data, colWidths=[120, 380])
    t_be.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_LIGHT_BG])
    ]))
    story.append(t_be)
    story.append(Spacer(1, 15))

    # --- SECTION 3: REACT FRONTEND ---
    story.append(Paragraph("3. React Frontend Dashboard Client (frontend/)", h1_style))
    story.append(Paragraph(
        "Written in TypeScript / React and styled with Tailwind CSS, this layer renders the user interface "
        "and handles multi-input upload submission interfaces.",
        body_style
    ))

    fe_data = [
        [Paragraph("File / Subfolder", table_header_style), Paragraph("Function & Execution Details", table_header_style)],
        [Paragraph("App.tsx", table_cell_bold_style), Paragraph("Declares the frontend routing paths, rendering landing panels, analysis components, scan histories, and profiles.", table_cell_style)],
        [Paragraph("src/pages/", table_cell_bold_style), Paragraph("Main screen components. <code>AnalysisPage.tsx</code> renders text/URL inputs, file selectors, and scorecards. <code>HistoryPage.tsx</code> lists past scans.", table_cell_style)],
        [Paragraph("src/components/", table_cell_bold_style), Paragraph("Reusable widgets. <code>LimeHighlight.tsx</code> highlights words in red or green based on local weights. <code>ShapChart.tsx</code> charts global feature weights.", table_cell_style)],
        [Paragraph("src/api/", table_cell_bold_style), Paragraph("Houses API utilities to handle requests and capture responses from the Express gateway endpoint.", table_cell_style)]
    ]

    t_fe = Table(fe_data, colWidths=[120, 380])
    t_fe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_LIGHT_BG])
    ]))
    story.append(t_fe)

    doc.build(story)
    print(f"Structure PDF built successfully at: {STRUCT_PDF_PATH}")

# -------------------------------------------------------------
# STEP 2: CONVERT PPTX PRESENTATION TO PDF VIA POWERPOINT COM
# -------------------------------------------------------------
def convert_pptx_to_pdf():
    print(f"Attempting to convert PPTX ({PPTX_PATH}) to PDF ({PPTX_PDF_PATH})...")
    
    if not os.path.exists(PPTX_PATH):
        print(f"Warning: PowerPoint presentation file not found at {PPTX_PATH}. Skipping conversion.")
        return

    # PowerShell script to open PowerPoint and convert
    ps_cmd = f"""
    try {{
        $ppt_app = New-Object -ComObject PowerPoint.Application
        $presentation = $ppt_app.Presentations.Open("{PPTX_PATH}", $true, $true, $false)
        $presentation.SaveAs("{PPTX_PDF_PATH}", 32)
        $presentation.Close()
        $ppt_app.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt_app) | Out-Null
        Write-Output "PowerPoint COM conversion completed successfully."
    }} catch {{
        Write-Warning "PowerPoint COM conversion failed: $_"
        exit 1
    }}
    """
    
    try:
        # Run PowerShell command
        result = subprocess.run(
            ["powershell", "-Command", ps_cmd],
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error: COM Conversion failed.")
        print(e.stderr)
        print("Note: PPTX to PDF conversion requires Microsoft PowerPoint to be installed on this Windows host.")

# -------------------------------------------------------------
# MAIN EXECUTION
# -------------------------------------------------------------
if __name__ == "__main__":
    build_structure_pdf()
    convert_pptx_to_pdf()
