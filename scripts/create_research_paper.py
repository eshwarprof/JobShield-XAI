from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables"
OUT.mkdir(exist_ok=True)
DOCX = OUT / "Explainable_Fake_Job_Advertisement_Detection_Research_Paper.docx"
ARCH = OUT / "architecture_figure.png"
METRICS = OUT / "metrics_figure.png"

NAVY = "17365D"
PALE = "EAF0F7"
GRAY = "D9D9D9"

def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tcPr.append(shd)

def set_cell_border(cell, color=GRAY):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    borders = tcPr.first_child_found_in('w:tcBorders')
    if borders is None:
        borders = OxmlElement('w:tcBorders')
        tcPr.append(borders)
    for edge in ('top','left','bottom','right','insideH','insideV'):
        tag = 'w:' + edge
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn('w:val'), 'single')
        element.set(qn('w:sz'), '4')
        element.set(qn('w:color'), color)

def set_repeat_table_header(row):
    trPr = row._tr.get_or_add_trPr()
    elem = OxmlElement('w:tblHeader')
    elem.set(qn('w:val'), 'true')
    trPr.append(elem)

def style_table(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    for r, row in enumerate(table.rows):
        for cell in row.cells:
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_border(cell)
            for p in cell.paragraphs:
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.space_before = Pt(3)
                for run in p.runs:
                    run.font.name = 'Arial'
                    run.font.size = Pt(9)
            if r == 0:
                set_cell_shading(cell, NAVY)
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255,255,255)
            elif r % 2 == 0:
                set_cell_shading(cell, PALE)
    set_repeat_table_header(table.rows[0])

def add_caption(doc, text, kind):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(f"{kind}. {text}")
    r.italic = True
    r.font.size = Pt(9)

def add_para(doc, text, bold_lead=None):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    if bold_lead and text.startswith(bold_lead):
        p.add_run(bold_lead).bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)
    return p

def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.add_run(text)

def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.space_before = Pt(10 if level == 1 else 7)
    p.paragraph_format.space_after = Pt(5)
    return p

def make_figures():
    font = ImageFont.truetype('arial.ttf', 28)
    small = ImageFont.truetype('arial.ttf', 20)
    bold = ImageFont.truetype('arialbd.ttf', 24)
    im = Image.new('RGB', (2200, 720), 'white')
    draw = ImageDraw.Draw(im)
    boxes = [
        (50, 110, 380, 290, 'User and React\nDashboard'),
        (570, 110, 900, 290, 'Node Express\nGateway'),
        (1090, 110, 1490, 290, 'FastAPI AI\nService'),
        (1680, 110, 2130, 290, 'BERT and XAI\nArtifacts'),
        (570, 470, 900, 650, 'MongoDB\nAnalyses'),
    ]
    for x1,y1,x2,y2,label in boxes:
        draw.rounded_rectangle((x1,y1,x2,y2),radius=12,fill='#EAF0F7',outline='#17365D',width=4)
        draw.multiline_text(((x1+x2)//2,(y1+y2)//2),label,font=bold,fill='#17365D',anchor='mm',align='center',spacing=5)
    arrows=[((430,200),(570,200)),((900,200),(1090,200)),((1490,200),(1680,200)),((735,290),(735,470))]
    for a,b in arrows:
        draw.line((a,b),fill='#17365D',width=5)
        x,y=b
        if a[0] == b[0]:
            draw.polygon([(x,y),(x-9,y-16),(x+9,y-16)],fill='#17365D')
        else:
            draw.polygon([(x,y),(x-16,y-9),(x-16,y+9)],fill='#17365D')
    draw.text((1340,355),'preprocess -> BERT -> signals -> trust/risk/severity -> LIME/SHAP',font=small,fill='#333333',anchor='mm')
    im.save(ARCH)
    labels=['Accuracy','Precision','Recall','F1','ROC AUC']
    values=[98.73,90.68,82.31,86.29,98.29]
    im=Image.new('RGB',(1500,760),'white'); draw=ImageDraw.Draw(im)
    draw.text((750,35),'Held Out Test Performance (n = 2,682)',font=bold,fill='#111111',anchor='ma')
    left,bottom,top=130,650,105
    draw.line((left,top,left,bottom),fill='#333333',width=3); draw.line((left,bottom,1430,bottom),fill='#333333',width=3)
    for v in range(0,101,20):
        y=bottom-(bottom-top)*v/105; draw.line((left,y,1430,y),fill='#E0E0E0',width=2); draw.text((108,y),str(v),font=small,fill='#333333',anchor='rm')
    colors=['#1F4E79','#4F81BD','#A5BBD2','#4F81BD','#1F4E79']
    for i,(lab,val,col) in enumerate(zip(labels,values,colors)):
        x=240+i*240; h=(bottom-top)*val/105
        draw.rectangle((x,bottom-h,x+130,bottom),fill=col)
        draw.text((x+65,bottom-h-28),f'{val:.2f}',font=small,fill='#111111',anchor='ma')
        draw.text((x+65,bottom+20),lab,font=small,fill='#111111',anchor='ma')
    draw.text((35,375),'Percent',font=small,fill='#333333',anchor='mm')
    im.save(METRICS)

def page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run=paragraph.add_run('Page ')
    fldChar1=OxmlElement('w:fldChar'); fldChar1.set(qn('w:fldCharType'),'begin')
    instrText=OxmlElement('w:instrText'); instrText.set(qn('xml:space'),'preserve'); instrText.text='PAGE'
    fldChar2=OxmlElement('w:fldChar'); fldChar2.set(qn('w:fldCharType'),'end')
    run._r.append(fldChar1); run._r.append(instrText); run._r.append(fldChar2)

def build():
    make_figures()
    doc=Document()
    sec=doc.sections[0]
    sec.top_margin=Inches(.75); sec.bottom_margin=Inches(.75); sec.left_margin=Inches(.8); sec.right_margin=Inches(.8)
    normal=doc.styles['Normal']; normal.font.name='Arial'; normal.font.size=Pt(10.5); normal._element.rPr.rFonts.set(qn('w:eastAsia'),'Arial')
    for name,size in [('Title',18),('Heading 1',14),('Heading 2',12)]:
        s=doc.styles[name]; s.font.name='Arial'; s.font.size=Pt(size); s.font.bold=True; s.font.color.rgb=RGBColor(0,0,0)
    footer=sec.footer.paragraphs[0]; footer.text='Explainable Fake Job Advertisement Detection Framework | '
    page_number(footer)

    p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.add_run('Explainable Fake Job Advertisement Detection Framework')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('A Trust Aware Auditable Decision Support System for Recruitment Fraud').italic=True
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Project Team').bold=True
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Research Paper').italic=True
    doc.add_paragraph('')
    add_heading(doc,'Abstract',1)
    add_para(doc,'Online recruitment fraud exposes job seekers to financial loss, identity theft, and misleading career opportunities. Although supervised classifiers can identify suspicious advertisements, a binary label alone gives a user little basis for deciding whether and how to proceed. This paper presents an explainable fake job advertisement detection framework that combines a fine tuned BERT base uncased classifier with deterministic trust, risk, severity, and decision support components. The system accepts pasted text, job URLs, PDF notices, and images; all inputs converge into a common processing pipeline. It uses the Employment Scam Aegean Dataset (EMSCAD), containing 17,880 labelled advertisements, and a stratified 70/15/15 train validation test split. On 2,682 held out examples, the deployed classifier obtained 98.73% accuracy, 90.68% precision, 82.31% recall, 0.8629 F1 score, and 0.9829 ROC AUC at a 0.65 decision threshold. LIME provides local word level explanations and a cached SHAP analysis provides global feature evidence, while transparent rules convert observable warning signals into user oriented recommendations. The results demonstrate strong discrimination on EMSCAD, while also showing that recall and F1 remain below the cited Fraud BERT benchmark. The contribution is therefore an auditable decision support layer around a competitive classifier, rather than a claim of a new state of the art classifier.')
    add_para(doc,'Keywords: online recruitment fraud, fake job detection, BERT, explainable artificial intelligence, LIME, SHAP, trust scoring, EMSCAD.')

    add_heading(doc,'1 Introduction',1)
    add_heading(doc,'1.1 Background',2)
    add_para(doc,'Online recruitment systems reduce friction between employers and applicants, but their reach also creates opportunities for fraud. A fraudulent posting can imitate ordinary recruitment language while requesting money, personal information, or contact through unverifiable channels. The task is consequently not only a text classification problem. A useful system must help a job seeker understand the warning signs, assess their practical consequence, and take a proportionate next step.')
    add_heading(doc,'1.2 Problem Motivation',2)
    add_para(doc,'The practical motivation is to reduce the gap between a model output and a job seeker action. A probability by itself does not reveal whether a posting contains a fee request, an unverifiable contact channel, or an absent company profile. The system therefore treats detection as a safety investigation: it combines learned textual evidence with transparent signals and returns an actionable recommendation.')
    add_heading(doc,'1.3 Research Gap',2)
    add_para(doc,'EMSCAD established a public benchmark for online recruitment fraud and documents a highly imbalanced collection of 17,014 legitimate and 866 fraudulent advertisements [1]. Earlier work includes ensemble learning and neural models for binary detection [2], [3]. More recently, Fraud BERT applied transfer learning with BERT to context aware recruitment fraud detection [4]. These studies establish the value of supervised prediction, but the base Fraud BERT workflow ends with classification performance. In contrast, a deployed decision aid must present reasons and actionable verification guidance, particularly because a false negative can expose a user to harm and a false positive can discourage a legitimate application. This project addresses that operational gap by integrating post hoc explanations with deterministic, inspectable audit rules in one user facing pipeline.')
    add_heading(doc,'1.4 Research Questions',2)
    add_bullet(doc,'RQ1: How accurately can a fine tuned BERT base uncased classifier identify fraudulent advertisements in a held out EMSCAD split?')
    add_bullet(doc,'RQ2: How can deterministic warning signals, risk categories, and explanation methods be integrated into an auditable recruitment safety workflow?')
    add_bullet(doc,'RQ3: What limitations remain when the system is evaluated only on EMSCAD and without a separate user study or external deployment benchmark?')
    add_heading(doc,'1.5 Contributions',2)
    add_bullet(doc,'A multi input implementation for text, URL, PDF, and image submissions, with a shared downstream analysis path.')
    add_bullet(doc,'A fine tuned BERT classifier evaluated on a stratified held out EMSCAD test set.')
    add_bullet(doc,'A transparent trust, risk, severity, and recommendation layer driven by named signals rather than a second opaque model.')
    add_bullet(doc,'A dashboard oriented explanation design that combines request specific LIME evidence with cached global SHAP evidence.')
    add_heading(doc,'1.6 Paper Organization',2)
    add_para(doc,'Section 2 reviews the relevant literature. Section 3 describes the proposed system. Section 4 documents the experimental setup. Sections 5 and 6 present and interpret the results. Sections 7 and 8 discuss limitations and future work, followed by the conclusion.')

    add_heading(doc,'2 Related Work',1)
    add_heading(doc,'2.1 Textual and Metadata Based Job Fraud Detection',2)
    add_para(doc,'Vidros et al. introduced the EMSCAD benchmark and characterized recruitment fraud as a classification problem over real job advertisements [1]. Ensemble and neural approaches subsequently reported strong benchmark performance, including ORFDetector [2] and an ANN based system [3]. These methods show that structured and textual cues can discriminate advertisements, but they do not by themselves specify how a user should inspect a high risk result.')
    add_heading(doc,'2.2 Contextual Language Model Analysis',2)
    add_para(doc,'BERT uses deep bidirectional pretraining and can be fine tuned for downstream language tasks with a task specific output layer [5]. Fraud BERT applies that approach to EMSCAD and reports high classifier performance while recognizing deployment constraints such as computational cost, sequence length, and interpretability [4]. The present work adopts BERT base uncased as its classifier but makes the deployment layer explicit.')
    add_heading(doc,'2.3 Hybrid Multi Input Detection',2)
    add_para(doc,'A deployment system receives more than benchmark rows. The implemented framework accepts text, a URL, a PDF, and an image. These channels are normalized into the same downstream BERT and rule based workflow; the project does not claim a separate benchmark for each modality.')
    add_heading(doc,'2.4 Explainable AI in Recruitment Cybersecurity',2)
    add_para(doc,'LIME explains an individual prediction by fitting an interpretable local surrogate around the instance [6]. SHAP supplies an additive feature attribution framework grounded in Shapley values [7]. Neither is treated here as proof that a model is correct. They are presented as complementary explanatory views: local evidence for one submitted advertisement and a global summary of the model behavior observed in a representative sample.')
    add_heading(doc,'2.5 Rule Based Security Investigation',2)
    add_para(doc,'Rule based investigation remains valuable where a user needs to see why a risk score changed. The project therefore uses named detection conditions and centralized penalties instead of training a second opaque trust model. This is an implementation choice for auditability, not a claim that heuristic rules replace classifier evaluation.')
    add_heading(doc,'2.6 Comparative Analysis',2)
    table=doc.add_table(rows=1,cols=5); hdr=['Study','Method','Data','Main contribution','Limitation relevant here']
    for c,t in zip(table.rows[0].cells,hdr): c.text=t
    rows=[
        ['Vidros et al. [1]','ML benchmark study','EMSCAD','Public dataset and fraud characteristics','No user-facing explainability workflow'],
        ['Mahbub et al. [2]','Ensemble learning','EMSCAD','ORFDetector classification','Binary detection focus'],
        ['Abdullah et al. [3]','ANN','EMSCAD','Neural fraud classifier','No audit or decision support layer'],
        ['Taneja et al. [4]','Fine tuned BERT','EMSCAD','Context aware transformer detection','Interpretability identified as an integration challenge'],
        ['This work','BERT plus XAI and rules','EMSCAD plus live inputs','Auditable risk and guidance workflow','No external deployment benchmark or user study']]
    for row in rows:
        cells=table.add_row().cells
        for c,t in zip(cells,row): c.text=t
    style_table(table); add_caption(doc,'Literature comparison and the project specific gap.','Table 1')
    add_heading(doc,'2.7 Research Gap',2)
    add_para(doc,'The literature and the source project together identify a focused gap: classification accuracy alone does not provide an auditable, multi-input, user-facing decision process. This work fills that integration gap by joining model inference, deterministic evidence, explanation views, and verification advice. It does not claim that the individual explanation methods or the BERT architecture are novel.')

    add_heading(doc,'3 Problem Formulation',1)
    add_heading(doc,'3.1 Problem Definition',2)
    add_para(doc,'Given a job advertisement supplied as text or extracted from a URL, PDF, or image, the system must estimate recruitment fraud risk and provide evidence that supports a safe user response. The required output is not simply a class label: it includes a fraud probability, trust score, risk category, severity flags, explanation features, and decision support text.')
    add_heading(doc,'3.2 Investigation Model',2)
    add_para(doc,'The investigation model has two complementary paths. A learned BERT model processes cleaned text and estimates fraud probability. A deterministic path evaluates named warning conditions. Their outputs are kept identifiable, then combined for risk categorization and advice.')
    add_heading(doc,'3.3 Evidence Representation',2)
    add_para(doc,'Evidence is represented as cleaned text, the BERT prediction, boolean detector outputs, point based trust and severity values, ranked explanation features, and company verification fields when available. This representation supports persistence and dashboard rendering through the backend API.')
    add_heading(doc,'3.4 Research Questions',2)
    add_para(doc,'The formulation operationalizes RQ1 through held out classification metrics, RQ2 through traceable pipeline outputs and tests, and RQ3 through explicit limitations. No separate experimental result is claimed for unmeasured modalities, evidence fusion, user comprehension, or real world investigation time.')

    add_heading(doc,'4 Explainable Fake Job Detection Framework',1)
    add_heading(doc,'4.1 System Overview',2)
    add_para(doc,'The framework has three tiers. A React client collects submissions and displays the analysis dashboard. A Node Express backend owns authentication, validation, file handling, rate limiting, and persistence. A Python FastAPI service performs extraction, classification, signal detection, scoring, and explanation generation. MongoDB stores analyses, whereas the versioned BERT artifact and SHAP cache are stored on disk. Figure 1 summarizes the actual service boundaries.')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(ARCH),width=Inches(6.75)); add_caption(doc,'Actual three tier architecture and AI processing path.','Figure 1')
    add_heading(doc,'4.2 Input and URL Preprocessing',2)
    add_para(doc,'Raw text is accepted directly. URL analysis validates the URL and attempts structured JSON LD extraction before generic HTML fallback. PDFs are processed with PyMuPDF and can use OCR fallback for scanned pages. Images are processed through EasyOCR by default. Text is normalized by stripping HTML, URLs, email addresses, phone numbers, emojis, and selected boilerplate; it is lowercased and concatenated in a fixed EMSCAD field order. The resulting sequence is tokenized with the BERT WordPiece tokenizer, padded or truncated to 512 tokens.')
    add_heading(doc,'4.3 Static Learned Analysis',2)
    add_para(doc,'The classifier is BERT base uncased with a two class output head. It produces a fraud probability and applies a production decision threshold of 0.65 to derive the binary label. In parallel, ten deterministic detectors identify conditions including registration fees, personal email domains, missing company information, unrealistic salary wording, WhatsApp only contact, missing location, and urgent or spam wording. Trust begins at 100 and deducts configured penalties; severity accumulates points for high harm signals. The final risk category is a monotonic combination of the classifier probability and trust score. The served risk probability is a weighted blend: 60% BERT probability and 40% distrust, where distrust is one minus the trust score normalized to the interval from zero to one.')
    add_heading(doc,'4.4 File and URL Content Analysis',2)
    add_para(doc,'Unlike a dynamic browser sandbox, this project performs URL scraping, PDF extraction, and image OCR before common downstream processing. It does not execute websites or claim behavioral malware analysis. This boundary is important when interpreting the system as a recruitment fraud detector rather than a general URL security scanner.')
    add_heading(doc,'4.5 Decision Support Engine',2)
    add_heading(doc,'4.6 Low Risk Handling',2)
    add_para(doc,'For Low risk results, the engine issues normal verification guidance and suppresses alarmist warning text. For other categories, it exposes severity tied warnings and a set of verification actions. This policy prevents a low risk category from being presented alongside contradictory high alarm messages.')
    add_heading(doc,'4.7 Company Verification Component',2)
    add_para(doc,'The implemented company verification component attempts to identify company details, official web presence, recruiter information, and domain correspondence from the submitted content. It is a supplemental lookup based feature, not a certified corporate identity service, and its network dependent output is not reported as an experimental metric.')
    add_heading(doc,'4.8 Evidence Fusion',2)
    add_para(doc,'The served risk probability is calculated from 60% of the BERT fraud probability and 40% of normalized distrust. The risk category then combines probability and trust tiers monotonically. Severity remains separate because the likely harm of a posting is not assumed to be identical to its predicted fraud probability.')
    add_heading(doc,'4.9 Explainability Module',2)
    add_para(doc,'For each request, LIME generates a local explanation from the cleaned input. SHAP is precomputed and cached per trained model version to provide a global explanation without adding the same cost to every request. The decision support component maps risk and severity flags to plain language warnings and verification suggestions. This design intentionally keeps the rule engines separate from the learned classifier so that every penalty and recommendation can be traced to a named detector and threshold.')
    add_heading(doc,'4.10 Evidence Integrity and Storage',2)
    add_para(doc,'The Node Express backend stores each analysis in MongoDB with its input type, extracted text, model and rule outputs, explanations, warnings, and recommendations. Authentication and ownership checks govern account linked records; model artifacts are versioned independently to support rollback.')
    table=doc.add_table(rows=1,cols=3)
    for c,t in zip(table.rows[0].cells,['Component','Implementation','Output to user']):c.text=t
    for row in [
        ['Classifier','Fine tuned bert base uncased','Fraud probability and label'],
        ['Trust engine','Eight penalty conditions, bounded 0 to 100','Trust score and band'],
        ['Risk engine','Probability trust tier combination','Low, Medium, High, or Critical'],
        ['Severity engine','Six high harm point conditions','Severity score and flags'],
        ['XAI','LIME local and cached SHAP global','Ranked word influence views'],
        ['Decision support','Risk and severity driven rules','Recommendation, warnings, verification steps']]:
        cells=table.add_row().cells
        for c,t in zip(cells,row):c.text=t
    style_table(table); add_caption(doc,'Functional components of the implemented decision support pipeline.','Table 2')

    add_heading(doc,'5 Experimental Methodology',1)
    add_heading(doc,'5.1 Dataset',2)
    add_para(doc,'The experiment uses EMSCAD, a dataset of 17,880 advertisements: 17,014 legitimate and 866 fraudulent [1]. The project performs a stratified 70% training, 15% validation, and 15% test split using random state 42. This preserves the small fraudulent class across partitions. The held out test split contains 2,682 examples, consistent with the 15% allocation. The dataset has a 4.84% fraudulent class rate, making accuracy alone insufficient for evaluating the system.')
    add_heading(doc,'5.2 Data Preparation',2)
    add_para(doc,'Dataset records are stratified before splitting. For model input, selected text fields are cleaned, concatenated in a fixed order, and tokenized to a maximum sequence length of 512. Missing structured fields are omitted from the classifier text but may activate relevant rule detectors.')
    add_heading(doc,'5.3 Feature Engineering',2)
    add_para(doc,'The learned path uses BERT WordPiece input tokens rather than manually engineered TF IDF features. The deterministic path derives explicit features from regular expressions and simple conditions, such as a fee request, a free email domain, or missing company information.')
    add_heading(doc,'5.4 Baseline Models',2)
    add_para(doc,'The project documentation identifies Fraud BERT as its external reference and records its reported 99% accuracy and 0.93 F1 on EMSCAD [4]. This is a literature comparison rather than a reimplementation under identical conditions. No additional baseline was rerun in the repository materials.')
    add_heading(doc,'5.5 Framework Configuration',2)
    add_para(doc,'Training uses inverse frequency weighted cross entropy to counter the class imbalance. The configured run uses up to four epochs, learning rate 2e-5, weight decay 0.01, linear warmup ratio 0.1, maximum gradient norm 1.0, per device train batch size 8, gradient accumulation of 2 for an effective batch size of 16, and seed 42. Validation occurs every epoch; the best model is selected by validation F1 with early stopping patience of two epochs. Mixed precision is enabled only when CUDA is available. The repository does not report the exact hardware, runtime, or model parameter count for the evaluated run, so those values are not claimed here.')
    add_heading(doc,'5.6 Experimental Scenarios',2)
    add_para(doc,'The measured scenario is held out text classification on EMSCAD. The repository also contains automated route, extraction, rule engine, and integration tests for multi-input operation. Those tests establish functional behavior, not comparative predictive performance across inputs.')
    add_heading(doc,'5.7 Evaluation Metrics',2)
    add_para(doc,'The reported classifier evaluation uses the production threshold of 0.65, selected on the validation data, rather than an unexamined 0.5 cutoff. Accuracy, precision, recall, F1, ROC AUC, and a confusion matrix are calculated on the held out test set. The paper compares the outcome cautiously with the project cited Fraud BERT benchmark [4]. It does not make a controlled head to head claim because the two runs may differ in preprocessing, split realization, hardware, and tuning.')
    add_heading(doc,'5.8 Hardware and Software Environment',2)
    add_para(doc,'The software stack includes Python, FastAPI, PyTorch, Transformers, SHAP, LIME, React, Node Express, MongoDB, Docker, and the listed extraction libraries. The repository specifies CUDA dependent mixed precision when available, but it does not record the exact hardware configuration used for the reported evaluation. Hardware specifications are therefore not fabricated.')
    add_heading(doc,'5.9 Reproducibility',2)
    add_para(doc,'The repository fixes the split random state at 42, stores hyperparameters in code, versions model artifacts, and includes unit and integration tests. Reproducing the exact model result still requires the same data source, dependency versions, trained artifact conditions, and computational environment.')

    add_heading(doc,'6 Results',1)
    add_heading(doc,'6.1 Static ML Performance',2)
    add_para(doc,'Table 3 and Figure 2 present the actual held out classifier results recorded by the project. The model correctly classified 2,541 legitimate postings and 107 fraudulent postings. It produced 11 false positives and 23 false negatives. The high ROC AUC indicates strong ranking discrimination on this split. The lower recall relative to precision shows that the deployed threshold favors avoiding false fraud alarms at the cost of missing some fraudulent advertisements.')
    table=doc.add_table(rows=1,cols=3)
    for c,t in zip(table.rows[0].cells,['Metric','Held out result','Interpretation']):c.text=t
    for row in [
        ['Accuracy','0.9873','Overall proportion correctly classified'],
        ['Precision','0.9068','Most fraud flags were correct on the test split'],
        ['Recall','0.8231','23 of 130 fraudulent test cases were missed'],
        ['F1 score','0.8629','Balances precision and recall'],
        ['ROC AUC','0.9829','Strong probability ranking separation']]:
        cells=table.add_row().cells
        for c,t in zip(cells,row):c.text=t
    style_table(table); add_caption(doc,'Held out test metrics at the production threshold of 0.65.','Table 3')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(METRICS),width=Inches(6.15)); add_caption(doc,'Held out classifier metrics reported by the project.','Figure 2')
    add_heading(doc,'6.2 File and URL Analysis Findings',2)
    add_para(doc,'Functional tests cover URL validation and scraping, PDF extraction, OCR, and FastAPI routes. The project does not report a modality specific accuracy, extraction quality score, or dynamic website behavior result, so no numerical claim is made for these paths.')
    add_heading(doc,'6.3 Evidence Fusion Performance',2)
    add_para(doc,'The risk fusion function is implemented and tested for deterministic tier coverage. It has no separately reported calibration, precision, recall, or ablation experiment; its contribution is an auditable decision rule rather than an independently benchmarked predictor.')
    add_heading(doc,'6.4 Comparative Evaluation',2)
    add_para(doc,'The reported F1 is below the 0.93 Fraud BERT reference, while accuracy is close to the reported 99% value. The comparison should be interpreted descriptively, not as proof of superiority or inferiority under matched experimental conditions.')
    add_heading(doc,'6.5 Ablation Study',2)
    add_para(doc,'[RESULT NOT AVAILABLE IN PROJECT MATERIALS] The repository contains no controlled ablation that removes the trust, severity, explanation, or company verification components. This paper therefore does not infer their individual contribution to classifier metrics.')
    add_heading(doc,'6.6 Explainability Analysis',2)
    add_para(doc,'LIME and SHAP outputs are generated and tested as part of the system. The project reports an implementation mitigation for rare noisy SHAP tokens through minimum occurrence filtering, but it does not provide a quantitative explanation fidelity or stability study.')
    add_heading(doc,'6.7 Investigation Performance',2)
    add_para(doc,'[RESULT NOT AVAILABLE IN PROJECT MATERIALS] The repository notes that CPU only inference with live LIME may be slow, but does not publish a formal latency, throughput, or investigation time benchmark.')
    add_heading(doc,'6.8 Case Study',2)
    add_para(doc,'The integration tests include held out style legitimate and fraudulent KMIT faculty posting examples and verify prediction, trust, risk, and explanation output paths. They are functional test cases rather than a qualitative user study, so the paper does not extrapolate them to deployment effectiveness.')
    table=doc.add_table(rows=1,cols=3)
    for c,t in zip(table.rows[0].cells,['Actual class','Predicted legitimate','Predicted fraudulent']):c.text=t
    for row in [['Legitimate','2,541','11'],['Fraudulent','23','107']]:
        cells=table.add_row().cells
        for c,t in zip(cells,row):c.text=t
    style_table(table); add_caption(doc,'Confusion matrix on 2,682 held out EMSCAD examples.','Table 4')
    add_para(doc,'The repository records Fraud BERT as reporting 99% accuracy and 0.93 F1 on EMSCAD [4]. The current implementation is therefore close in accuracy but below that reported F1 reference. This distinction is important: the project documentation correctly records that it does not meet or exceed the stated baseline criterion. No accuracy, latency, or usability metric is reported for URL, PDF, image, trust, severity, or decision support components; these components are verified through automated and integration tests rather than a separate performance experiment.')

    add_heading(doc,'7 Discussion',1)
    add_heading(doc,'7.1 Interpretation of Findings',2)
    add_para(doc,'The observed test results support the claim that a BERT based classifier can separate many legitimate and fraudulent EMSCAD postings. Precision above 90% is useful for limiting unnecessary fraud warnings, while the recall result identifies a meaningful remaining failure mode. In a recruitment safety context, a missed scam can be more consequential than an extra verification step, so future threshold selection should be informed by a clearly defined user risk policy rather than F1 alone.')
    add_heading(doc,'7.2 Comparison with Existing Approaches',2)
    add_para(doc,'The project differs from the cited classifier focused approaches by packaging classification with multi-input ingestion, named rule evidence, explanation panels, and decision support. The reported held out F1 does not exceed the cited Fraud BERT reference; the defensible contribution is system integration and inspectability, not a new best classifier score.')
    add_heading(doc,'7.3 Error Analysis',2)
    add_para(doc,'The confusion matrix records 23 false negatives and 11 false positives. The project materials do not include per-record error categories, so causes such as missing context, label noise, text truncation, or novel scam phrasing remain hypotheses rather than established findings.')
    add_heading(doc,'7.4 Practical Implications',2)
    add_para(doc,'The framework can act as a verification aid for job seekers and administrators. It should be used to prompt safer checks rather than to automatically reject employers, because model and rule outputs can be wrong and current live recruitment conditions may differ from the benchmark data.')
    add_heading(doc,'7.5 Limitations',2)

    add_bullet(doc,'EMSCAD covers postings from 2012 to 2014 and is heavily imbalanced; it may not reflect current scam tactics, languages, regions, or job platforms [1].')
    add_bullet(doc,'The evaluation is a single held out split. It does not report cross validation, temporal validation, external platform validation, or statistical confidence intervals.')
    add_bullet(doc,'The reported F1 and recall do not meet the project cited Fraud BERT reference, and the classifier is limited to 512 tokens.')
    add_bullet(doc,'The trust and severity rules are transparent but heuristic. For example, the unrealistic salary rule is not linked to an external salary benchmark, and unstructured inputs limit direct assessment of missing location fields.')
    add_bullet(doc,'LIME and SHAP are explanatory aids, not guarantees of causal reasoning or correctness. The project does not report explanation fidelity, stability, or user comprehension experiments.')
    add_bullet(doc,'No measured latency, throughput, resource consumption, fairness analysis, or real world user study is available in the provided materials.')

    add_heading(doc,'8 Conclusion and Future Work',1)
    add_heading(doc,'8.1 Conclusion',2)
    add_para(doc,'This paper presented an explainable fake job advertisement detection framework that combines BERT classification with deterministic trust, risk, severity, and decision support mechanisms. The completed implementation accepts multiple input formats, persists analyses through a three tier web architecture, and exposes both local and global explanation views. On the recorded held out EMSCAD test set, the classifier achieved 98.73% accuracy, 0.8629 F1, and 0.9829 ROC AUC. These results support strong within dataset discrimination but also establish a clear need to improve fraud recall and validate the system beyond EMSCAD.')
    add_heading(doc,'8.2 Future Work',2)
    add_para(doc,'The most direct next research step is to improve minority class recall using a validation governed cost sensitive objective, focal loss, or threshold selection tied to the harm of missed fraud. An external, temporally newer, and multilingual evaluation set is necessary before making general deployment claims. Rule detectors could be validated against recruiter and platform evidence, while explanation quality should be assessed with stability and user comprehension protocols. The documented roadmap also includes a browser extension, continual or federated learning, and direct recruitment platform integration; each should be evaluated separately for privacy, latency, and operational safety.')

    add_heading(doc,'Acknowledgments',1)
    add_para(doc,'The authors acknowledge the maintainers of the EMSCAD dataset and the open source research communities supporting the software components used in this project.')
    add_heading(doc,'Declarations',1)
    add_heading(doc,'Funding',2); add_para(doc,'No external funding is reported in the project materials.')
    add_heading(doc,'Conflict of Interest',2); add_para(doc,'The authors declare no conflict of interest based on the available project materials.')
    add_heading(doc,'Data Availability',2); add_para(doc,'EMSCAD is publicly documented by Vidros et al. [1] and is referenced in the project repository. The dataset is used for academic training and evaluation.')
    add_heading(doc,'Code Availability',2); add_para(doc,'The implementation and its tests are contained in the accompanying project repository.')
    add_heading(doc,'Ethics',2); add_para(doc,'The system analyzes publicly available job advertisement content. It should not be used as an automated hiring decision maker or as conclusive evidence of employer misconduct.')

    add_heading(doc,'References',1)
    refs=[
        '[1] G. Vidros, C. Kolias, G. Kambourakis, and L. Akoglu, "Automatic Detection of Online Recruitment Frauds Characteristics Methods and a Public Dataset," Future Internet, vol. 9, no. 1, art. 6, 2017, doi: 10.3390/fi9010006.',
        '[2] S. Mahbub, M. A. R. Akbar, and M. S. Rahman, "ORFDetector Ensemble Learning Based Online Recruitment Fraud Detection," in 2019 Twelfth International Conference on Contemporary Computing, 2019, doi: 10.1109/IC3.2019.8844879.',
        '[3] M. Abdullah, M. T. Uddin, S. A. M. H. S. Rahman, and M. M. Islam, "Online Recruitment Fraud Detection using ANN," in 2021 Palestinian International Conference on Information and Communication Technology, 2021, doi: 10.1109/PICICT53635.2021.00015.',
        '[4] K. Taneja, J. Vashishtha, and S. Ratnoo, "Fraud BERT transformer based context aware online recruitment fraud detection," Discover Computing, 2025, doi: 10.1007/s10791-025-09502-8.',
        '[5] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, "BERT Pre-training of Deep Bidirectional Transformers for Language Understanding," in NAACL HLT, 2019, pp. 4171-4186, doi: 10.18653/v1/N19-1423.',
        '[6] M. T. Ribeiro, S. Singh, and C. Guestrin, "Why Should I Trust You Explaining the Predictions of Any Classifier," in KDD, 2016, pp. 1135-1144, doi: 10.1145/2939672.2939778.',
        '[7] S. M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," in Advances in Neural Information Processing Systems 30, 2017.'
    ]
    for ref in refs:
        p=doc.add_paragraph(ref); p.paragraph_format.left_indent=Inches(.2); p.paragraph_format.first_line_indent=Inches(-.2); p.paragraph_format.space_after=Pt(4); p.paragraph_format.line_spacing=1.05
    add_heading(doc,'Supplementary Material',1)
    add_para(doc,'Supplementary project materials include the implementation source, unit and integration tests, system documentation, model evaluation report, exploratory data analysis report, presentation materials, and Docker deployment configuration.')
    doc.save(DOCX)
    print(DOCX)

if __name__=='__main__': build()
