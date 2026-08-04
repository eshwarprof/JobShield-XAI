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
    """Extract email, website, and company name heuristics from unstructured text."""
    # Clean up sign-in form elements and login boilerplate from the text
    text = re.sub(
        r'\b(?:email or phone|password|sign in|join now|forgot password|show|hide|user agreement|privacy policy|cookie policy|agreement|policy|sign in with|new to linkedin)\b', 
        ' ', 
        text, 
        flags=re.IGNORECASE
    )
    text = re.sub(r'\s+', ' ', text).strip()

    # 1. Email extraction
    email_regex = re.compile(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})')
    email_match = email_regex.search(text)
    email = email_match.group(0) if email_match else None
    email_domain = email_match.group(2).lower() if email_match else None
    is_email_personal = email_domain in FREE_DOMAINS if email_domain else False

    # 2. Website/domain extraction
    url_regex = re.compile(r'(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})')
    domain = None
    for match in url_regex.finditer(text):
        d = match.group(1).lower()
        if d not in FREE_DOMAINS and d not in {
            'linkedin.com', 'naukri.com', 'google.com', 'yahoo.com', 'facebook.com', 
            'instagram.com', 'twitter.com', 'github.com', 'indeed.com', 'glassdoor.com'
        }:
            domain = d
            break
            
    if not domain and email_domain and not is_email_personal:
        domain = email_domain

    company_name = ""
    company_patterns = [
        re.compile(r'(?:company|employer|organization)\s*:\s*([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'(?:hiring|recruit|work|intern|position|opportunity|job|engineer|developer|role)\s+at\s+([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'looking\s+for\s+.*\s+at\s+([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'sincerely\s*,\s*([a-zA-Z0-9\s\-&]{3,60})', re.IGNORECASE),
        re.compile(r'([a-zA-Z0-9\s\-&]{3,60})\s+(?:hiring|is hiring|is looking for)\b', re.IGNORECASE)
    ]
    for pattern in company_patterns:
        match = pattern.search(text)
        if match and match.group(1):
            company_name = match.group(1).strip()
            break

    if not company_name and domain:
        parts = domain.split('.')
        company_name = parts[0].capitalize()

    return {
        "company_name": company_name or "Unknown Company",
        "domain": domain,
        "email": email,
        "email_domain": email_domain
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
    """Verifies company details online using search heuristics."""
    details = extract_company_details_py(text)
    company_name = details["company_name"]
    
    if company_name == "Unknown Company":
        return {
            "searched": False,
            "companyName": company_name,
            "officialWebsite": None,
            "linkedinPage": None,
            "summary": None,
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
        "error": None
    }
