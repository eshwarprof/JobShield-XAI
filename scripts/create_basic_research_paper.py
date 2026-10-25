from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'deliverables'
OUT.mkdir(exist_ok=True)
OUTFILE = OUT / 'Explainable_Fake_Job_Advertisement_Detection_Research_Paper.docx'

def border(cell):
    tcPr = cell._tc.get_or_add_tcPr(); borders = OxmlElement('w:tcBorders')
    for side in ('top','left','bottom','right'):
        e=OxmlElement('w:'+side); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'4'); e.set(qn('w:color'),'000000'); borders.append(e)
    tcPr.append(borders)

def table(doc, headers, rows):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'
    for c,x in zip(t.rows[0].cells,headers):
        c.text=x; c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in c.paragraphs[0].runs: r.bold=True
    trPr=t.rows[0]._tr.get_or_add_trPr(); header=OxmlElement('w:tblHeader'); header.set(qn('w:val'),'true'); trPr.append(header)
    for row in rows:
        cells=t.add_row().cells
        for c,x in zip(cells,row): c.text=x; c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for row in t.rows:
        for c in row.cells:
            border(c)
            for p in c.paragraphs:
                p.paragraph_format.space_after=Pt(2); p.paragraph_format.space_before=Pt(2)
                for r in p.runs: r.font.name='Times New Roman'; r.font.size=Pt(9.5)
    return t

def p(doc,text):
    x=doc.add_paragraph(text); x.paragraph_format.line_spacing=1.15; x.paragraph_format.space_after=Pt(6); return x
def h(doc,text,level=1):
    x=doc.add_heading(text,level); x.paragraph_format.space_before=Pt(9); x.paragraph_format.space_after=Pt(4); return x
def cap(doc,text):
    x=doc.add_paragraph(text); x.alignment=WD_ALIGN_PARAGRAPH.CENTER
    for r in x.runs: r.italic=True; r.font.size=Pt(9)
def bullets(doc,items):
    for item in items: doc.add_paragraph(item,style='List Bullet')
def page_field(p):
    p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('Page ')
    for typ,text in [('begin',None),(None,'PAGE'),('end',None)]:
        e=OxmlElement('w:fldChar' if typ else 'w:instrText')
        if typ: e.set(qn('w:fldCharType'),typ)
        else: e.set(qn('xml:space'),'preserve'); e.text=text
        r._r.append(e)

def build():
    d=Document(); s=d.sections[0]; s.top_margin=Inches(.8); s.bottom_margin=Inches(.8); s.left_margin=Inches(.85); s.right_margin=Inches(.85)
    normal=d.styles['Normal']; normal.font.name='Times New Roman'; normal.font.size=Pt(11); normal._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman')
    for st,size in [('Title',16),('Heading 1',13),('Heading 2',11)]:
        z=d.styles[st]; z.font.name='Times New Roman'; z.font.size=Pt(size); z.font.bold=True
    page_field(s.footer.paragraphs[0])
    title=d.add_paragraph(style='Title'); title.alignment=WD_ALIGN_PARAGRAPH.CENTER; title.add_run('Explainable Fake Job Advertisement Detection Framework')
    sub=d.add_paragraph('A BERT Based Recruitment Fraud Screening and Decision Support System'); sub.alignment=WD_ALIGN_PARAGRAPH.CENTER
    auth=d.add_paragraph('Project Team'); auth.alignment=WD_ALIGN_PARAGRAPH.CENTER
    h(d,'Abstract')
    p(d,'Fake job advertisements often resemble genuine recruitment posts, which makes simple keyword filtering unreliable. This paper describes a completed system for checking suspicious job advertisements and presenting the result in a form that a job seeker can understand. The system accepts plain text, job links, PDF files, and images. It cleans the extracted content, applies a fine tuned BERT classifier, checks a set of explicit warning conditions, and returns a risk category with explanations and practical verification advice. The classifier was trained and tested with EMSCAD, a public dataset containing 17,880 job advertisements. A stratified split was used so that the small number of fraudulent records remained represented in every partition. On 2,682 held out records, the classifier achieved 98.73% accuracy, 90.68% precision, 82.31% recall, 0.8629 F1 score, and 0.9829 ROC AUC. These figures show that the model separates the two classes well on this dataset, but they also show that some fraudulent posts are still missed. The paper does not present the rule layer as a second trained model. Instead, it uses transparent checks for items such as fee requests, free email domains, missing company information, and pressure wording. The main contribution is a practical, inspectable workflow around the classifier rather than a claim of a new state of the art model.')
    p(d,'Keywords: fake job detection, online recruitment fraud, BERT, explainable AI, SHAP, LIME, trust score, EMSCAD')
    h(d,'1 Introduction'); h(d,'1.1 Background',2)
    p(d,'Job seekers increasingly encounter vacancies through online platforms and forwarded messages. This convenience is also used by people who advertise non-existent jobs, request registration fees, or collect personal information. A model can help to screen a large number of advertisements, but a fraud label is not enough for a person deciding whether to share documents or send money.')
    h(d,'1.2 Problem Motivation',2); p(d,'The project was motivated by a simple practical question: what should a user do after a system says that a job post is risky? The answer should be based on visible signs, not only on a probability score. For that reason, the implementation combines classification with rule based checks, explanations, and verification suggestions.')
    h(d,'1.3 Research Gap',2); p(d,'Earlier work on EMSCAD has shown that machine learning can detect many fraudulent advertisements. The remaining gap addressed here is operational. Many studies report classifier scores, while a deployed user needs an explanation, a view of the warning signs, and a reasonable next action. The framework brings these pieces together in one application.')
    h(d,'1.4 Research Questions',2); bullets(d,['RQ1: What held out classification performance is obtained by the implemented BERT model on EMSCAD?','RQ2: How can model output and explicit warning signals be presented as one auditable recruitment safety assessment?','RQ3: Which limitations remain when evidence is limited to EMSCAD and software tests?'])
    h(d,'1.5 Contributions',2); bullets(d,['A working multi-input application for text, URL, PDF, and image submissions.','A BERT based classifier evaluated on a held out EMSCAD test set.','A transparent trust, risk, severity, and recommendation layer.','Local LIME and global cached SHAP explanation views for the dashboard.'])
    h(d,'1.6 Paper Organization',2); p(d,'The next section summarizes relevant research. Sections 3 and 4 describe the problem and the system. Sections 5 and 6 cover the experiment and results. The last sections discuss the findings, limitations, and future work.')
    h(d,'2 Related Work'); h(d,'2.1 Textual and Metadata Based Job Fraud Detection',2)
    p(d,'Vidros et al. released EMSCAD and described online recruitment fraud as a classification problem based on real job advertisements [1]. Their dataset made it possible to compare later methods on a common collection. Ensemble models and neural models have both been tested on this task [2], [3].')
    h(d,'2.2 Contextual Language Model Analysis',2); p(d,'BERT learns bidirectional language representations before being fine tuned for a task [5]. Fraud BERT applied this idea to recruitment fraud and reported strong results on EMSCAD [4]. The present project uses the same general model family, but its purpose is not limited to producing a class label.')
    h(d,'2.3 Hybrid Multi Input Detection',2); p(d,'A real user may submit a copied advertisement, a link, a scan, or a screenshot. The system therefore treats extraction as part of the detection process. All supported input types are converted into text and sent through the same later stages. The project does not claim a separate accuracy score for each input type.')
    h(d,'2.4 Explainable AI in Cybersecurity',2); p(d,'LIME explains an individual prediction using a local interpretable approximation [6]. SHAP provides a feature attribution framework based on Shapley values [7]. In this work they are used as aids for inspection. They do not prove that a prediction is correct.')
    h(d,'2.5 Rule Based Security Investigation',2); p(d,'Rule based checks are useful when the result must be explained to a non-specialist. The project keeps its rules separate from the learned model. Each penalty and flag has a named condition, which makes the score easier to inspect and test.')
    h(d,'2.6 Comparative Analysis',2)
    table(d,['Study','Approach','What it provides','What this project adds'],[['Vidros et al. [1]','Dataset and ML study','Public benchmark','User-facing audit flow'],['ORFDetector [2]','Ensemble learning','Fraud classification','Explanations and guidance'],['ANN study [3]','Neural network','Fraud classification','Multi-input processing'],['Fraud BERT [4]','Fine tuned BERT','Context-aware classification','Rule evidence and dashboard']]); cap(d,'Table 1. Simple comparison of relevant work.')
    h(d,'2.7 Research Gap',2); p(d,'The gap is not that earlier work failed to classify job advertisements. The gap is the lack of a single, understandable path from raw input to a recommendation. This framework addresses that gap by joining classifier output, explicit evidence, explanations, and suggested checks.')
    h(d,'3 Problem Formulation'); h(d,'3.1 Problem Definition',2); p(d,'For an advertisement a, the system produces a fraud probability, a trust score, a risk category, severity flags, explanation features, and guidance. The goal is to help the user decide whether normal caution is enough or further verification is needed.')
    h(d,'3.2 Investigation Model',2); p(d,'The investigation has two parts. BERT reads the cleaned advertisement and estimates how likely it is to be fraudulent. A rule layer scans the original fields for specific signs. The two parts remain visible in the final result instead of being hidden inside one score.')
    h(d,'3.3 Evidence Representation',2); p(d,'The stored evidence includes cleaned text, prediction data, detected conditions, trust and severity values, ranked explanation words, and company verification fields when available. This record is saved with the analysis so it can be viewed again by the user.')
    h(d,'3.4 Research Questions',2); p(d,'The first question is answered by the held out classifier experiment. The second is answered by the implemented pipeline and its tests. The third is answered by the stated boundaries of the project; it is not answered by invented deployment or user-study results.')
    h(d,'4 Explainable Fake Job Detection Framework'); h(d,'4.1 System Overview',2)
    p(d,'The application has a React front end, a Node Express backend, a Python FastAPI service, and MongoDB. The front end collects input and shows results. The backend handles authentication, validation, uploads, and storage. The AI service performs extraction, scoring, and explanation generation.')
    h(d,'4.2 Input and URL Preprocessing',2); p(d,'URLs are validated before scraping. The scraper tries structured job data first and then uses HTML fallback. PDF text is extracted with PyMuPDF, with OCR fallback for scanned pages. Images are read with OCR. The text cleaning stage removes HTML, URLs, email addresses, phone numbers, emojis, and common boilerplate before BERT tokenization.')
    h(d,'4.3 Static Learned Analysis',2); p(d,'The classifier is bert-base-uncased with two output classes. Inputs are limited to 512 tokens. The serving threshold is 0.65, selected using validation data. The model returns the fraud probability and a binary prediction label.')
    h(d,'4.4 File and URL Content Analysis',2); p(d,'This system extracts and analyzes content. It is not a browser sandbox and it does not execute web pages or inspect malware behaviour. PDF, image, and URL handling should therefore be understood as input acquisition, not dynamic security analysis.')
    h(d,'4.5 Decision Support Engine',2); p(d,'The rule engine checks for fee requests, personal email domains, absent company details, unverified contact channels, implausible salary claims, WhatsApp-only contact, missing location, and spam-like wording. The trust score starts at 100 and decreases when relevant conditions are found. Severity is computed separately from a set of higher harm flags.')
    h(d,'4.6 Low Risk Handling',2); p(d,'A Low risk result receives ordinary verification advice. Higher risk levels show more direct warnings and additional suggested checks. This prevents low-risk screens from being shown with unnecessarily alarming text.')
    h(d,'4.7 Company Verification Component',2); p(d,'The company verification module attempts to recover company and recruiter information from the submitted content and compare available domains. It is an extra source of context, not a proof that an employer is genuine.')
    h(d,'4.8 Evidence Fusion',2); p(d,'For risk classification, the system combines 60% of the BERT probability with 40% normalized distrust. A monotonic tier rule then assigns Low, Medium, High, or Critical risk. Severity remains separate because the probable harm of an advertisement is not identical to its predicted fraud probability.')
    h(d,'4.9 Explainability Module',2); p(d,'LIME is generated for the current advertisement. SHAP is computed ahead of time and cached for the current model version. This avoids the cost of recomputing the same global analysis for every request.')
    h(d,'4.10 Evidence Integrity and Storage',2); p(d,'The backend saves completed analyses in MongoDB. It stores the source type, extracted text, scores, flags, explanations, and recommendations. Model versions are stored separately so that a previous trained model can be restored if needed.')
    h(d,'5 Experimental Methodology'); h(d,'5.1 Dataset',2); p(d,'The experiment uses EMSCAD. It contains 17,880 advertisements: 17,014 legitimate and 866 fraudulent [1]. The fraud class is only 4.84% of the data, so accuracy alone would give a misleading picture.')
    h(d,'5.2 Data Preparation',2); p(d,'The data was split into 70% training, 15% validation, and 15% testing partitions using stratification and random state 42. Text fields were cleaned and combined in a fixed order. The held out test partition contains 2,682 records.')
    h(d,'5.3 Feature Engineering',2); p(d,'BERT receives WordPiece tokens rather than manually selected TF-IDF features. The rule layer uses explicit features drawn from the posting, such as a fee phrase or a free email domain.')
    h(d,'5.4 Baseline Models',2); p(d,'Fraud BERT is the reference reported in the project documents. It reports 99% accuracy and 0.93 F1 on EMSCAD [4]. It was not rerun under identical conditions in this repository, so this paper treats it as a literature reference, not a controlled comparison.')
    h(d,'5.5 Framework Configuration',2); p(d,'Training uses inverse-frequency weighted cross-entropy. The configured maximum is four epochs with learning rate 2e-5, weight decay 0.01, warmup ratio 0.1, effective batch size 16, seed 42, validation after every epoch, and early stopping based on validation F1.')
    h(d,'5.6 Experimental Scenarios',2); p(d,'The numerical experiment is the held out text-classification test. Separate automated tests cover API routes, extraction, scoring rules, and dashboard components. Those functional tests are not reported as predictive performance experiments.')
    h(d,'5.7 Evaluation Metrics',2); p(d,'Accuracy, precision, recall, F1, ROC AUC, and a confusion matrix are calculated with the same 0.65 threshold used by the service.')
    h(d,'5.8 Hardware and Software Environment',2); p(d,'The system uses Python, FastAPI, PyTorch, Transformers, SHAP, LIME, React, Node Express, MongoDB, and Docker. The source material does not record the exact machine used for the reported training run. Hardware claims are therefore omitted.')
    h(d,'5.9 Reproducibility',2); p(d,'The code fixes the split seed, records hyperparameters, versions model artefacts, and includes tests. Exact reproduction still depends on matching data, package versions, and training conditions.')
    h(d,'6 Results'); h(d,'6.1 Static ML Performance',2)
    p(d,'The test results come from 2,682 records not used during training or validation-based model selection. At the 0.65 threshold, the model correctly identified 2,541 legitimate records and 107 fraudulent records. It produced 11 false positives and 23 false negatives.')
    table(d,['Metric','Value'],[['Accuracy','0.9873'],['Precision','0.9068'],['Recall','0.8231'],['F1 score','0.8629'],['ROC AUC','0.9829']]); cap(d,'Table 2. Held out classifier results.')
    table(d,['Actual class','Predicted legitimate','Predicted fraudulent'],[['Legitimate','2,541','11'],['Fraudulent','23','107']]); cap(d,'Table 3. Confusion matrix for the held out test set.')
    h(d,'6.2 File and URL Analysis Findings',2); p(d,'The project includes tests for URL validation and scraping, PDF extraction, OCR, and API routes. It does not include a separate accuracy or extraction-quality experiment for these input paths. No numerical result is claimed for them.')
    h(d,'6.3 Evidence Fusion Performance',2); p(d,'The fusion and category rules are deterministic and covered by tests. There is no separate calibration or classification study of the fusion rule. Its role is to make the risk decision visible and consistent.')
    h(d,'6.4 Comparative Evaluation',2); p(d,'The current accuracy is close to the Fraud BERT value quoted in the project material. The F1 score is lower than the cited 0.93 value. Because the runs are not matched experiments, the comparison should not be read as a ranking claim.')
    h(d,'6.5 Ablation Study',2); p(d,'RESULT NOT AVAILABLE IN PROJECT MATERIALS. The project does not include an ablation experiment that removes one component at a time. The independent contribution of the rule layer, company verification, and explanation methods to the reported classifier metrics is therefore unknown.')
    h(d,'6.6 Explainability Analysis',2); p(d,'LIME and SHAP outputs are produced by the application and covered by unit or integration tests. The project does not contain a quantitative fidelity, stability, or user-comprehension study. The explanation views should be treated as decision aids rather than validated causal evidence.')
    h(d,'6.7 Investigation Performance',2); p(d,'RESULT NOT AVAILABLE IN PROJECT MATERIALS. The project notes that live LIME can be slow on CPU-only deployment, but it does not publish a latency, throughput, or memory benchmark.')
    h(d,'6.8 Case Study',2); p(d,'The repository includes end-to-end tests using legitimate and fraudulent faculty-posting examples that are separate from EMSCAD. The tests verify that the expected pipeline outputs are returned. They are software tests, not a real-world user evaluation.')
    h(d,'7 Discussion'); h(d,'7.1 Interpretation of Findings',2); p(d,'The held out result shows strong separation on EMSCAD. The recall figure matters because 23 fraudulent records were classified as legitimate. A recruitment-safety tool should not hide that trade-off behind an overall accuracy figure.')
    h(d,'7.2 Comparison with Existing Approaches',2); p(d,'The distinguishing part of this work is the way the system is assembled. A user receives a classifier result, named rule evidence, an explanation view, and practical advice in one place. The work does not claim that it outperforms Fraud BERT on F1.')
    h(d,'7.3 Error Analysis',2); p(d,'The confusion matrix gives the number of errors but not their detailed causes. Long text truncation, unusual wording, missing context, dataset label quality, and changing scam language are plausible reasons, but they were not tested in the project and cannot be presented as findings.')
    h(d,'7.4 Practical Implications',2); p(d,'The framework can help users slow down before applying to a suspicious vacancy. It should prompt verification, not automatically accuse an employer or replace human judgement.')
    h(d,'7.5 Limitations',2); bullets(d,['EMSCAD contains old, English-language data and may not represent current or regional scams.','Only one held out split is reported; external and time-based validation are absent.','The classifier misses some fraudulent posts and the reported F1 is below the cited Fraud BERT value.','Rules are inspectable but heuristic; they are not a market salary database or a certified company-validation service.','The project has no user study, fairness audit, or formal system-performance benchmark.'])
    h(d,'8 Conclusion and Future Work'); h(d,'8.1 Conclusion',2); p(d,'This paper documented a completed fake-job detection application built around BERT and transparent supporting checks. The measured classifier result is strong on the supplied EMSCAD split, while the recall result and lack of external evaluation set clear limits on the claim. The most useful contribution is an auditable path from a submitted advertisement to visible evidence and safer next steps.')
    h(d,'8.2 Future Work',2); p(d,'Future work should test newer and multilingual data, study false negatives in detail, select thresholds using explicit harm costs, and measure the quality of explanations with users. A browser extension and platform integration could be useful, but they require careful privacy, security, and latency evaluation.')
    h(d,'Acknowledgments'); p(d,'The authors acknowledge the creators of EMSCAD and the open-source communities whose tools were used in the project.')
    h(d,'Declarations'); h(d,'Funding',2); p(d,'No external funding is reported in the project materials.'); h(d,'Conflict of Interest',2); p(d,'No conflict of interest is reported in the project materials.'); h(d,'Data Availability',2); p(d,'EMSCAD is a public research dataset described in [1].'); h(d,'Code Availability',2); p(d,'The implementation, tests, and documentation are contained in the accompanying project repository.'); h(d,'Ethics',2); p(d,'The system is intended as a safety aid. It should not be used as a final employment decision or as conclusive proof of misconduct.')
    h(d,'References')
    refs=['[1] G. Vidros, C. Kolias, G. Kambourakis, and L. Akoglu, “Automatic Detection of Online Recruitment Frauds: Characteristics, Methods, and a Public Dataset,” Future Internet, vol. 9, no. 1, art. 6, 2017, doi: 10.3390/fi9010006.','[2] S. Mahbub, M. A. R. Akbar, and M. S. Rahman, “ORFDetector: Ensemble Learning Based Online Recruitment Fraud Detection,” IC3, 2019, doi: 10.1109/IC3.2019.8844879.','[3] M. Abdullah, M. T. Uddin, S. A. M. H. S. Rahman, and M. M. Islam, “Online Recruitment Fraud Detection using ANN,” PICICT, 2021, doi: 10.1109/PICICT53635.2021.00015.','[4] K. Taneja, J. Vashishtha, and S. Ratnoo, “Fraud-BERT: Transformer Based Context Aware Online Recruitment Fraud Detection,” Discover Computing, 2025, doi: 10.1007/s10791-025-09502-8.','[5] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding,” NAACL-HLT, 2019, pp. 4171–4186, doi: 10.18653/v1/N19-1423.','[6] M. T. Ribeiro, S. Singh, and C. Guestrin, “Why Should I Trust You?: Explaining the Predictions of Any Classifier,” KDD, 2016, pp. 1135–1144, doi: 10.1145/2939672.2939778.','[7] S. M. Lundberg and S.-I. Lee, “A Unified Approach to Interpreting Model Predictions,” NeurIPS, 2017.']
    for x in refs: p(d,x)
    h(d,'Supplementary Material'); p(d,'Supporting material includes the source code, tests, API documentation, model evaluation report, exploratory data analysis report, presentation material, and Docker configuration.')
    d.save(OUTFILE); print(OUTFILE)
if __name__=='__main__': build()
