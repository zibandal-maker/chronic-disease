"""hf v2 Playwright — python tests/pw_hf.py <v2.html> <shotdir>"""
import sys, os
from playwright.sync_api import sync_playwright
F, OUT = os.path.abspath(sys.argv[1]), sys.argv[2]; os.makedirs(OUT, exist_ok=True)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':420,'height':900})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://'+F); pg.wait_for_timeout(800)
    pg.click('#hf26-lib-concept summary'); pg.wait_for_timeout(200)
    pg.screenshot(path=OUT+'/lib.png', full_page=False)
    pg.click('.hf-tabs button[data-sec="sec-flow"]')
    for k,v in [('lvef','30'),('nyha','2'),('hr','78'),('ntprobnp','1800'),('egfr','65'),('potassium','4.4')]:
        if k=='nyha': pg.select_option('#flow_nyha', v)
        else: pg.fill('#flow_'+k, v)
    for c in ['sinus_rhythm','std_therapy','hf_symptom']: pg.click('#flowChips [data-chip="%s"]'%c)
    pg.click('#hf26Input [data-chip26="std_therapy_4wk"]')
    pg.click('#flowRun'); pg.wait_for_timeout(300)
    pg.locator('#hf26Result').scroll_into_view_if_needed(); pg.screenshot(path=OUT+'/flow.png', full_page=False)
    w=pg.evaluate("document.documentElement.scrollWidth"); 
    pg.click('.hf-tabs button[data-sec="sec-sim"]'); pg.click('[data-case26="hf:sim26:c3"]'); pg.wait_for_timeout(200)
    pg.locator('#hf26SimOut').scroll_into_view_if_needed(); pg.screenshot(path=OUT+'/sim.png', full_page=False)
    print('scrollWidth',w,'pageerrors',len(errs), errs[:3])
    b.close()
