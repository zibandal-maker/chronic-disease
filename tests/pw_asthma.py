"""Playwright Chromium 420x900 — pageerror 0, scrollWidth 420, 뒤로가기(플로우 → 도서관), 스크린샷"""
import sys, asyncio, os
from playwright.async_api import async_playwright
F=os.path.abspath(sys.argv[1]); OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':420,'height':900})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.goto('file://'+F); await pg.wait_for_timeout(600)
        async def sw(): return await pg.evaluate('document.documentElement.scrollWidth')
        res={}
        res['lib_sw']=await sw(); await pg.screenshot(path=OUT+'/1_lib.png')
        await pg.evaluate("document.querySelectorAll('[data-a26=\"lib\"] details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
        res['lib_open_sw']=await sw()
        await pg.evaluate("document.querySelectorAll('[data-a26=\"lib\"] details')[0].scrollIntoView()"); await pg.screenshot(path=OUT+'/2_lib_steps.png')
        await pg.evaluate("document.querySelectorAll('[data-a26=\"lib\"] details')[4].scrollIntoView()"); await pg.screenshot(path=OUT+'/3_lib_bio.png')
        # 탭 클릭으로 플로우 진입 → 뒤로가기
        await pg.click('#tab-flow'); await pg.wait_for_timeout(900)
        res['flow_sw']=await sw(); await pg.screenshot(path=OUT+'/4_flow_inputs.png')
        await pg.go_back(); await pg.wait_for_timeout(700)
        res['back_to_lib']=await pg.evaluate("APP.tab"); 
        await pg.evaluate("ASTHMA26_UI.loadCase('asthma:sim26:c2')"); await pg.wait_for_timeout(500)
        res['c2_sw']=await sw()
        await pg.evaluate("document.querySelector('[data-a26=\"result\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/5_c2_result.png')
        await pg.evaluate("document.querySelectorAll('[data-a26=\"reg\"]')[1].scrollIntoView(); document.querySelectorAll('[data-a26=\"reg\"] details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelectorAll('[data-a26=\"reg\"]')[1].scrollIntoView()"); await pg.screenshot(path=OUT+'/6_c2_reg.png')
        res['c2_open_sw']=await sw()
        await pg.evaluate("ASTHMA26_UI.loadCase('asthma:sim26:c4')"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelector('[data-a26=\"bio\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/7_c4_bio.png')
        res['c4_sw']=await sw()
        await pg.evaluate("ASTHMA26_UI.loadCase('asthma:sim26:c6')"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelector('[data-a26=\"ae\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/8_c6_ae.png')
        res['c6_sw']=await sw()
        await pg.click('#tab-sim'); await pg.wait_for_timeout(400); res['sim_sw']=await sw(); await pg.screenshot(path=OUT+'/9_sim.png')
        await pg.evaluate("simRoute('biologic'); openRcheck('DUPI')"); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT+'/10_modal.png')
        res['modal_sw']=await sw()
        res['backtrap']=await pg.evaluate("!!window.__backTrapInstalled")
        print(res); print('errors',errs); await b.close()
        assert not errs and all(v==420 for k,v in res.items() if k.endswith('_sw')) and res['back_to_lib']=='lib', res
asyncio.run(main())
