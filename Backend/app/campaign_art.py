from xml.sax.saxutils import escape

def build_campaign_svg(headline: str, body: str, blood_group: str) -> str:
    h=escape(headline[:90]); b=escape(body[:240]); bg=escape(blood_group)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b0d1a"/><stop offset="1" stop-color="#9f1239"/></linearGradient></defs>
    <rect width="1080" height="1080" rx="48" fill="url(#g)"/><circle cx="850" cy="190" r="170" fill="#ffffff" opacity=".07"/>
    <text x="80" y="105" fill="#fecdd3" font-family="Arial,sans-serif" font-size="30" font-weight="700">RAKTSAATHI • BLOOD DONATION AWARENESS</text>
    <path d="M540 185 C500 245 430 320 430 385 A110 110 0 0 0 650 385 C650 320 580 245 540 185Z" fill="#fff" opacity=".96"/>
    <text x="540" y="540" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="58" font-weight="700">{h}</text>
    <rect x="360" y="585" width="360" height="92" rx="46" fill="#fff"/><text x="540" y="646" text-anchor="middle" fill="#9f1239" font-family="Arial,sans-serif" font-size="42" font-weight="700">BLOOD GROUP {bg}</text>
    <foreignObject x="105" y="720" width="870" height="180"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:30px;line-height:1.4;color:#fff;text-align:center">{b}</div></foreignObject>
    <text x="540" y="1000" text-anchor="middle" fill="#ffe4e6" font-family="Arial,sans-serif" font-size="24">Please contact an authorized blood service for verified donation information.</text></svg>'''
