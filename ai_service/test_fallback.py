import urllib.request
import urllib.parse
import re

def test_fallback():
    query = "https://www.linkedin.com/jobs/view/4416185791"
    url = "https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(
        url, 
        data=data,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            print("Length of HTML:", len(html))
            # Find any tables/rows/links
            # Let's clean tags and print text lines
            lines = [l.strip() for l in re.sub(r'<[^>]+>', '\n', html).split('\n') if l.strip()]
            for line in lines[:80]:
                print(line)
    except Exception as e:
        print("Error:", str(e))

test_fallback()
