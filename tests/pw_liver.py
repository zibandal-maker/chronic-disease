"""liver v2 실브라우저 점검: python3 pw_liver.py <v2.html> <shot_dir>"""
import sys
from playwright.sync_api import sync_playwright
src, shots = sys.argv[1], sys.argv[2]
with sync_playwright() as pw:
    b=pw.chromium.launch(); pg=b.new_page(viewport={'width':420,'height':900}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://'+src); pg.wait_for_timeout(600)
    pg.screenshot(path=shots+'/lib.png')
    pg.click('#hbv-nav button[data-tab="flow"]')
    pg.click('#hbv-tab-flow .opts[data-k="hbeag"] button[data-v="pos"]'); pg.click('#hbv-tab-flow .opts[data-k="cirr"] button[data-v="none"]')
    pg.fill('#in-dna','300000000'); pg.fill('#in-alt','22')
    pg.click('#hbv26Input .opts[data-k26="sex"] button[data-v="male"]'); pg.fill('#hbv26-in-age','32')
    pg.click('#runBtn'); pg.wait_for_timeout(300)
    pg.locator('#result').scroll_into_view_if_needed(); pg.screenshot(path=shots+'/flow.png')
    chipbg=pg.evaluate("(()=>{const c=document.querySelector('#result .gchip');return c?getComputedStyle(c).backgroundColor:null})()")
    # 도서관 카드 클릭 → 시트 오픈
    pg.click('#hbv-nav button[data-tab="lib"]'); pg.click('#hbv26-lib .card.sheetmode .head'); pg.wait_for_timeout(400)
    sheet=pg.evaluate("(()=>{const s=[...document.querySelectorAll('*')].find(e=>/sheet/i.test(e.className||'')&&getComputedStyle(e).position==='fixed'&&e.offsetHeight>200);return s?s.className:null})()")
    pg.screenshot(path=shots+'/sheet.png')
    print({'pageerrors':errs[:3],'chip_bg':chipbg,'sheet':sheet})
    b.close()
