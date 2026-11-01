"""빌드 산출물(public/guides/dyslipidemia.html) 실브라우저 점검: base(v1) vs new(v2)
사용: python3 pw_built.py <base_public_dir> <new_public_dir> <shot_dir>"""
import sys, http.server, threading, functools, socketserver
from playwright.sync_api import sync_playwright

def serve(d, port):
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=d)
    h.log_message = lambda *a: None
    s = socketserver.TCPServer(('127.0.0.1', port), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s

def check(pw, url, tag, shots):
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 420, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url.replace('guides/dyslipidemia.html','index.html')); pg.wait_for_timeout(300)
    pg.goto(url); pg.wait_for_timeout(800)
    r = {}
    r['seo_summary'] = pg.evaluate("(()=>{const d=document.getElementById('seo-summary'); return d? (d.open?'open':'closed'):'none'})()")
    r['summary_stale'] = pg.evaluate("(()=>{const d=document.getElementById('seo-summary'); if(!d) return null; const t=d.textContent; return ['2026년말 도입 예정','급여 협상중','바세파 심혈관 적응증 국내 미반영'].filter(x=>t.includes(x))})()")
    r['related'] = pg.evaluate("document.body.innerHTML.includes('SEO_RELATED_V1')")
    r['canonical'] = pg.evaluate("(document.querySelector('link[rel=canonical]')||{}).href")
    r['desc'] = pg.evaluate("(document.querySelector('meta[name=description]')||{}).content")
    # 뒤로가기 트랩: 플로우 탭 → 결과 → 뒤로가기 시 페이지 이탈 여부
    pg.evaluate("switchTab('flow')"); pg.wait_for_timeout(300)
    pg.evaluate("STATE.flow.ldl=150; STATE.flow.comorbid={cad:true}; updateFlowResult()"); pg.wait_for_timeout(300)
    r['cards'] = pg.evaluate("document.querySelectorAll('#flowResult .card').length")
    has26 = pg.evaluate("!!document.querySelector('#flowResult') && document.querySelector('#flowResult').innerHTML.includes('2026 개정 판정')")
    r['flow2026'] = has26
    # details(위험강화인자/이전 지침) 열고 뒤로가기 → 같은 URL에 남는지
    pg.evaluate("switchTab('library')"); pg.wait_for_timeout(300)
    pg.evaluate("(()=>{const d=[...document.querySelectorAll('#view-library details')][0]; if(d) d.open=true;})()"); pg.wait_for_timeout(800)
    before = pg.url
    pg.go_back(); pg.wait_for_timeout(800)
    r['back_stays'] = ('dyslipidemia' in pg.url)
    r['view_after_back'] = pg.evaluate("(document.querySelector('.pane.on,[id^=view-].on,[id^=view-]:not([hidden])')||{}).id") if 'dyslipidemia' in pg.url else None
    pg.screenshot(path=f'{shots}/built_{tag}.png', full_page=False)
    r['pageerrors'] = errs[:3]; b.close(); return r

base, new, shots = sys.argv[1:4]
s1 = serve(base, 8771); s2 = serve(new, 8772)
with sync_playwright() as pw:
    for tag, port in [('base', 8771), ('new', 8772)]:
        # 이전 페이지(홈)에서 진입해야 뒤로가기 이탈 여부를 판정할 수 있음
        print(tag, check(pw, f'http://127.0.0.1:{port}/guides/dyslipidemia.html', tag, shots))
s1.shutdown(); s2.shutdown()
