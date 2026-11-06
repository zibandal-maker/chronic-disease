"""Playwright Chromium 420x900 — pageerror 0, scrollWidth, 스크린샷"""
import sys, asyncio, os
from playwright.async_api import async_playwright
F=os.path.abspath(sys.argv[1]); OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':420,'height':900})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.goto('file://'+F); await pg.wait_for_timeout(500)
        async def sw(): return await pg.evaluate('document.documentElement.scrollWidth')
        res={}
        res['lib_sw']=await sw(); await pg.screenshot(path=OUT+'/1_lib.png')
        await pg.evaluate("document.querySelectorAll('[data-copd26=\"lib\"] details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
        res['lib_open_sw']=await sw(); await pg.screenshot(path=OUT+'/2_lib_open.png',full_page=False)
        el=await pg.query_selector('[data-copd26="lib"] details:nth-of-type(5)')
        if el: await el.scroll_into_view_if_needed(); await pg.screenshot(path=OUT+'/3_lib_reimb.png')
        await pg.evaluate("COPD26_UI.loadCase('copd:sim26:c3')"); await pg.wait_for_timeout(400)
        res['flow_sw']=await sw()
        await pg.evaluate("document.querySelector('[data-copd26=\"result\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/4_flow_result.png')
        await pg.evaluate("document.querySelector('[data-copd26=\"reimb\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/5_flow_reimb.png')
        await pg.evaluate("COPD26_UI.loadCase('copd:sim26:c6')"); await pg.wait_for_timeout(400)
        await pg.evaluate("document.querySelector('[data-copd26=\"ae\"]').scrollIntoView()"); await pg.screenshot(path=OUT+'/6_flow_ae.png')
        res['flow6_sw']=await sw()
        await pg.evaluate("switchTab('sim'); COPD26_UI.simCase('copd:sim26:c4')"); await pg.wait_for_timeout(300)
        res['sim_sw']=await sw(); await pg.screenshot(path=OUT+'/7_sim.png')
        # 모바일 뒤로가기 트랩: details 열림이 팝업으로 잡히지 않는지
        res['backtrap']=await pg.evaluate("!!window.__backTrapInstalled")
        print(res); print('errors',errs); await b.close()
        assert not errs and all(v==420 for k,v in res.items() if k.endswith('_sw')), res
asyncio.run(main())
