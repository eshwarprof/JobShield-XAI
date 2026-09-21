import urllib.request
import urllib.parse
import re
import logging

logger = logging.getLogger("ai_service.company_search")

FREE_DOMAINS = {
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 
    'icloud.com', 'mail.com', 'zoho.com', 'protonmail.com', 'yandex.com', 
    'gmx.com', 'aol.com', 'rediffmail.com'
}

def extract_company_details_py(text: str) -> dict:
    """Extract email, website, company name, recruiter details, and phone from text."""
    # Clean up sign-in form elements and login boilerplate from the text
    cleaned_for_search = re.sub(
        r'\b(?:email or phone|password|sign in|join now|forgot password|show|hide|user agreement|privacy policy|cookie policy|agreement|policy|sign in with|new to linkedin)\b', 
        ' ', 
        text, 
        flags=re.IGNORECASE
    )
    cleaned_for_search = re.sub(r'\s+', ' ', cleaned_for_search).strip()

    # 1. Email extraction
    email_regex = re.compile(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})')
    email_match = email_regex.search(cleaned_for_search)
    email = email_match.group(0) if email_match else None
    email_domain = email_match.group(2).lower() if email_match else None
    is_email_personal = email_domain in FREE_DOMAINS if email_domain else False

    # 2. Website/domain extraction
    url_regex = re.compile(r'(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})')
    domain = None
    for match in url_regex.finditer(cleaned_for_search):
        d = match.group(1).lower()
        if d not in FREE_DOMAINS and d not in {
            'linkedin.com', 'naukri.com', 'google.com', 'yahoo.com', 'facebook.com', 
            'instagram.com', 'twitter.com', 'github.com', 'indeed.com', 'glassdoor.com'
        }:
            domain = d
            break
            
    if not domain and email_domain and not is_email_personal:
        domain = email_domain

    # 3. Company Name extraction
    company_name = ""
    company_patterns = [
        re.compile(r'(?:company|employer|organization)\s*:\s*([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'(?:hiring|recruit|work|intern|position|opportunity|job|engineer|developer|role)\s+at\s+([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'looking\s+for\s+.*\s+at\s+([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'sincerely\s*,\s*([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'([a-zA-Z0-9\s\-&]{3,60})\s+(?:hiring|is hiring|is looking for)\b', re.IGNORECASE)
    ]
    for pattern in company_patterns:
        match = pattern.search(cleaned_for_search)
        if match and match.group(1):
            candidate_company = match.group(1).strip()
            # Clean trailing recruiter/contact labels
            candidate_company = re.sub(r'\s+(?:job poster|hiring manager|recruiter|contact|posted by|hr).*$', '', candidate_company, flags=re.IGNORECASE).strip()
            if candidate_company:
                company_name = candidate_company
                break

    if not company_name and domain:
        parts = domain.split('.')
        company_name = parts[0].capitalize()

    # 4. Recruiter / Hiring Person Name extraction
    recruiter_name = None
    recruiter_patterns = [
        re.compile(r'(?:hiring manager|recruiter|contact person|hr representative|posted by|job poster|poster|contact|hr manager|talent acquisition|hiring team|recruitment lead|talent partner|sourcer|posted by:?)\s*:\s*([a-zA-Z\s.]{3,40})', re.IGNORECASE),
        re.compile(r'(?:reach out to|contact|email|message|connect with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})', re.IGNORECASE),
        re.compile(r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*,?\s*(?:-\s*)?(?:technical recruiter|recruiter|hr manager|talent acquisition|hiring manager|talent partner)', re.IGNORECASE),
        re.compile(r'sincerely\s*,\s*([A-Z][a-z]+\s+[A-Z][a-z]+)', re.IGNORECASE)
    ]
    for pattern in recruiter_patterns:
        match = pattern.search(cleaned_for_search)
        if match and match.group(1):
            possible_name = match.group(1).strip()
            # Ensure it's not a generic label
            if not any(x in possible_name.lower() for x in ['team', 'department', 'company', 'hiring', 'manager', 'group', 'services']):
                recruiter_name = possible_name
                break

    # Fallback: Infer recruiter name from email prefix if no explicit label found
    if not recruiter_name and email:
        prefix = email.split('@')[0]
        prefix_clean = re.sub(r'\d+', '', prefix).strip('._-')
        parts = re.split(r'[._-]', prefix_clean)
        generic_keywords = {
            'hr', 'careers', 'jobs', 'support', 'contact', 'info', 'apply', 
            'recruitment', 'hiring', 'admin', 'help', 'sales', 'team', 'office'
        }
        if len(parts) >= 2 and not any(p.lower() in generic_keywords for p in parts):
            recruiter_name = " ".join(p.capitalize() for p in parts if len(p) >= 2)
        elif len(parts) == 1 and len(parts[0]) >= 3 and parts[0].lower() not in generic_keywords:
            recruiter_name = parts[0].capitalize()

    # 5. Phone / WhatsApp extraction
    phone_regex = re.compile(r'(?:phone|mobile|tel|whatsapp|call|contact)\s*:\s*([+\d\s\-\(\)]{8,20})', re.IGNORECASE)
    phone_match = phone_regex.search(cleaned_for_search)
    recruiter_phone = phone_match.group(1).strip() if phone_match else None
    if not recruiter_phone:
        raw_phone_match = re.search(r'\+?\d{1,4}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}', text)
        if raw_phone_match:
            recruiter_phone = raw_phone_match.group(0).strip()

    return {
        "company_name": company_name or "Unknown Company",
        "domain": domain,
        "email": email,
        "email_domain": email_domain,
        "is_email_personal": is_email_personal,
        "recruiter_name": recruiter_name,
        "recruiter_phone": recruiter_phone
    }

def search_ddg_links(query: str) -> list[str]:
    """Execute search on DuckDuckGo Lite and return direct result links."""
    url = "https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(
        url, 
        data=data,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href=["\'](https?://[^"\']+)["\']', html)
            filtered = []
            for link in links:
                parsed = urllib.parse.urlparse(link)
                domain = parsed.netloc.lower()
                if not any(x in domain for x in ['duckduckgo.com', 'w3.org']):
                    filtered.append(link)
            return filtered
    except Exception as e:
        logger.error(f"DuckDuckGo Lite search failed for query '{query}': {e}")
        return []

def fetch_wikipedia_summary(company_name: str) -> str | None:
    """Search Wikipedia for the company and fetch its introduction/summary."""
    try:
        results = search_ddg_links(f"{company_name} wikipedia")
        wiki_url = None
        for link in results:
            if 'en.wikipedia.org/wiki/' in link:
                wiki_url = link
                break
        
        if not wiki_url:
            return None
            
        parsed = urllib.parse.urlparse(wiki_url)
        path = parsed.path.strip("/")
        if not path.startswith("wiki/"):
            return None
        title = path.replace("wiki/", "", 1)
        if not title:
            return None
            
        quoted_title = urllib.parse.quote(title)
        api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quoted_title}"
        req = urllib.request.Request(
            api_url,
            headers={'User-Agent': 'JobShieldBot/1.0 (contact@jobshield.xai)'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            import json
            data = json.loads(response.read().decode('utf-8'))
            extract = data.get("extract")
            if extract:
                return extract
    except Exception as e:
        logger.error(f"Error fetching Wikipedia summary for '{company_name}': {e}")
    return None

def fetch_ddg_overview(company_name: str) -> str | None:
    """Fetch search snippets from DuckDuckGo to synthesize a small summary."""
    try:
        url = "https://lite.duckduckgo.com/lite/"
        data = urllib.parse.urlencode({'q': f"{company_name} company profile overview established"}).encode('utf-8')
        req = urllib.request.Request(
            url, 
            data=data,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
            snippets = re.findall(r'<td class=["\']result-snippet["\']>(.*?)<\/td>', html, re.DOTALL)
            if snippets:
                cleaned = []
                for s in snippets[:3]:
                    text = re.sub(r'<[^>]+>', '', s)
                    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').strip()
                    if text:
                        cleaned.append(text)
                if cleaned:
                    return " ".join(cleaned)
    except Exception as e:
        logger.error(f"Error fetching DDG snippets for '{company_name}': {e}")
    return None

def verify_company_details(text: str) -> dict:
    """Verifies company and recruiter details online using search heuristics."""
    details = extract_company_details_py(text)
    company_name = details["company_name"]
    email = details["email"]
    email_domain = details["email_domain"]
    is_email_personal = details["is_email_personal"]
    recruiter_name = details["recruiter_name"]
    recruiter_phone = details["recruiter_phone"]
    
    if company_name == "Unknown Company":
        return {
            "searched": False,
            "companyName": company_name,
            "officialWebsite": None,
            "linkedinPage": None,
            "summary": None,
            "recruiterName": recruiter_name,
            "recruiterEmail": email,
            "recruiterPhone": recruiter_phone,
            "recruiterDomain": email_domain,
            "isDomainMatch": False,
            "recruiterVerificationStatus": "Unverified - No Company Name Extracted",
            "recruiterSearchUrl": None,
            "error": "No company name could be extracted from the posting text."
        }

    logger.info(f"Initiating web search audit for company: {company_name}")
    
    official_website = None
    linkedin_page = None

    # Search 1: Search for official website
    web_results = search_ddg_links(f"{company_name} official website")
    for link in web_results:
        # Filter out obvious directories/social profiles
        parsed = urllib.parse.urlparse(link)
        domain_name = parsed.netloc.lower()
        if not any(x in domain_name for x in ['linkedin.com', 'naukri.com', 'indeed.com', 'glassdoor.com', 'wikipedia.org', 'facebook.com', 'twitter.com']):
            official_website = link
            break

    # Search 2: Search for LinkedIn company profile
    linkedin_results = search_ddg_links(f"{company_name} linkedin company page")
    for link in linkedin_results:
        if 'linkedin.com/company/' in link:
            linkedin_page = link
            break

    # Fallback LinkedIn search query representation if exact page not found
    if not linkedin_page:
        linkedin_page = f"https://www.linkedin.com/company/{company_name.lower().replace(' ', '-')}"

    # Extract official domain from official website if found
    official_domain = details["domain"]
    if official_website:
        try:
            parsed_official = urllib.parse.urlparse(official_website)
            official_domain = parsed_official.netloc.lower().replace('www.', '')
        except Exception:
            pass

    # Domain Match & Recruiter Verification Logic
    is_domain_match = True
    recruiter_status = "Corporate Recruiter Verified"

    if is_email_personal:
        is_domain_match = False
        recruiter_status = "Unverified (Personal Email Address)"
    elif email_domain and official_domain:
        clean_email_dom = email_domain.replace('www.', '')
        clean_off_dom = official_domain.replace('www.', '')
        if clean_email_dom == clean_off_dom or clean_off_dom.endswith('.' + clean_email_dom) or clean_email_dom.endswith('.' + clean_off_dom):
            is_domain_match = True
            recruiter_status = "Verified Direct Corporate Recruiter"
        else:
            is_domain_match = False
            recruiter_status = "Domain Mismatch (Third-Party / Suspicious)"
    elif email_domain and not is_email_personal:
        is_domain_match = True
        recruiter_status = "Corporate Domain Recruiter"
    elif not email:
        is_domain_match = False
    # Active HR / Poster discovery search if no recruiter name was directly in the post
    if not recruiter_name and company_name != "Unknown Company":
        hr_links = search_ddg_links(f'"{company_name}" recruiter OR HR OR "hiring manager" site:linkedin.com/in')
        if hr_links:
            first_hr_link = hr_links[0]
            parsed_hr = urllib.parse.urlparse(first_hr_link)
            handle = parsed_hr.path.strip('/').replace('in/', '')
            clean_handle = re.sub(r'-\d+$', '', handle).replace('-', ' ')
            if len(clean_handle) >= 3 and not any(x in clean_handle.lower() for x in ['search', 'jobs', 'company']):
                recruiter_name = clean_handle.title() + " (Discovered HR Profile)"

    # Recruiter LinkedIn search URL
    if recruiter_name:
        clean_search_name = recruiter_name.replace(" (Discovered HR Profile)", "")
        query_str = urllib.parse.quote(f"{clean_search_name} {company_name} linkedin")
        recruiter_search_url = f"https://www.google.com/search?q={query_str}"
    else:
        query_str = urllib.parse.quote(f"{company_name} recruiter HR team linkedin")
        recruiter_search_url = f"https://www.google.com/search?q={query_str}"

    # Fetch summary/overview
    summary = fetch_wikipedia_summary(company_name)
    if not summary:
        summary = fetch_ddg_overview(company_name)
    if not summary:
        summary = f"{company_name} is a company associated with this job posting. Please refer to their official website or LinkedIn page for more details."

    return {
        "searched": True,
        "companyName": company_name,
        "officialWebsite": official_website,
        "linkedinPage": linkedin_page,
        "summary": summary,
        "recruiterName": recruiter_name,
        "recruiterEmail": email,
        "recruiterPhone": recruiter_phone,
        "recruiterDomain": email_domain,
        "isDomainMatch": is_domain_match,
        "recruiterVerificationStatus": recruiter_status,
        "recruiterSearchUrl": recruiter_search_url,
        "error": None
    }

