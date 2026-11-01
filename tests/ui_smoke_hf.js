/* hf v2 UI 스모크 — node tests/ui_smoke_hf.js <v1.html> <v2.html> */
const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const [,,V1,V2]=process.argv;
const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
const src=fs.readFileSync(V2,'utf8'), v1=fs.readFileSync(V1,'utf8');
const dom=new JSDOM(src,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'});
const w=dom.window,d=w.document; const out=[]; let fail=0;
function ok(n,c){ out.push((c?'✓ ':'✗ ')+n); if(!c) fail++; }
function click(el){ el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
setTimeout(()=>{ try{
  // 정적층: v1 JS 영역 무수정
  const cut=s=>{ const a=s.indexOf('</head>'), b=s.indexOf('<noscript>'); return s.slice(a,b); };
  ok('v1 head~noscript 사이(JS 코드) 바이트 동일', cut(v1)===cut(src));
  const tail1=v1.slice(v1.indexOf('</noscript>')), tail2=src.slice(src.indexOf('</noscript>'));
  ok('noscript 이후 = v1 + 가산 script 1개', tail2.replace(/<script>\n\/\* ===== hf v2[\s\S]*?<\/script>\n(?=<\/body>)/,'')===tail1);
  const ns=src.slice(src.indexOf('<noscript>'),src.indexOf('</noscript>'));
  ok('SEO noscript: 이바브라딘 HR≥75 · 고시 2023-23', ns.includes('HR≥75') && ns.includes('제2023-23호') && !ns.includes('HR≥70 + BB'));
  ok('SEO noscript: 철분 Hb ≤10 · 베리시구앗 급여 · 파티로머 미허가', ns.includes('Hb ≤10') && ns.includes('제2023-165호') && ns.includes('Patiromer (국내 미허가)'));
  ok('SEO noscript: ESC 2026 개념 섹션', ns.includes('id="concept-esc2026"'));
  ok('SEO head: keywords·lastReviewed', /name="keywords"[^>]*ESC 2026/.test(src) && src.includes('"lastReviewed": "2026-11-01"'));
  // 헤더
  ok('헤더 relabel ESC 2026', d.querySelector('.hf-hd .gl').textContent.includes('ESC 2026 반영') && !!d.getElementById('hf26Ver'));
  // 도서관
  ok('도서관 2026 카드 9장', d.querySelectorAll('#hf26-lib details.hf26-libcard').length===9);
  ok('권고 전수 표', d.getElementById('hf26-lib-recs').innerHTML.includes('총 '+w.HF26.REC_2026.length+'건'));
  ok('v1 허브 유지 + 이전 지침 안내', !!d.getElementById('libHub') && !!d.querySelector('#hf26-lib .hf26-old'));
  // 플로우
  ok('2026 입력 카드', !!d.getElementById('hf26Input') && d.querySelectorAll('#hf26Input [data-chip26]').length===w.HF26.INPUTS.filter(i=>i.type==='chip').length);
  const set=(k,v)=>{ const el=d.getElementById('flow_'+k); el.value=v; };
  set('lvef','45'); set('nyha','2'); set('ntprobnp','900'); set('hr','68');
  click(d.querySelector('#flowChips [data-chip="hf_symptom"]')); click(d.querySelector('#flowChips [data-chip="std_therapy"]')); click(d.querySelector('#flowChips [data-chip="sinus_rhythm"]'));
  click(d.querySelector('#hf26Input [data-chip26="congestion"]'));
  ok('칩 토글', d.querySelector('#hf26Input [data-chip26="congestion"]').classList.contains('sel'));
  click(d.getElementById('flowRun'));
  const res=d.getElementById('flowResult').innerHTML;
  ok('2026 판정 카드', !!d.getElementById('hf26Result') && res.includes('ESC 2026: HFrEF'));
  ok('KSHF 병기 HFmrEF', res.includes('KSHF 2022: HFmrEF'));
  ok('상충 ARNI 41–49', res.includes('지침 ⟷ 급여 상충') && res.includes('LVEF ≤40%만'));
  ok('이전 지침 접힘(v1 결과 보존)', !!d.querySelector('#flowResult details.hf26-legacy') && d.querySelector('#flowResult details.hf26-legacy').innerHTML.includes('ph-banner'));
  ok('급여 게이트 트리', res.includes('hf26-gate') && res.includes('급여 조건 미충족'));
  ok('고리이뇨제(울혈 칩 반영)', res.includes('푸로세미드'));
  // 시뮬
  ok('시뮬 2026 증례 6', d.querySelectorAll('[data-case26]').length===6);
  click(d.querySelector('[data-case26="hf:sim26:c6"]'));
  const so=d.getElementById('hf26SimOut').innerHTML;
  ok('임신 증례 → 금기 목록', so.includes('금기·권고하지 않음') && so.includes('사쿠비트릴'));
  click(d.querySelector('[data-case26="hf:sim26:c4"]'));
  ok('AF 증례 → 베리시구앗 급여 충족', d.getElementById('hf26SimOut').innerHTML.includes('베리시구앗') && d.getElementById('hf26SimOut').innerHTML.includes('급여 충족'));
  ok('v1 실시간 시뮬 유지', !!d.getElementById('simResult') && !!d.getElementById('h2fpefBox'));
  // 푸터·정문
  ok('푸터 2026 출처', !!d.getElementById('hf26-src') && d.getElementById('hf26-src').innerHTML.includes('ehag100'));
  ok('APP 정문', typeof w.APP.recommend==='function' && w.APP.REGISTRY_VERSION==='hf-v2-2026.11' && typeof w.HF.recommend==='function');
  // 탭 전환
  click(d.querySelector('.hf-tabs button[data-sec="sec-sim"]')); ok('v1 탭 전환', d.getElementById('sec-sim').classList.contains('on'));
  const real=errs.filter(e=>!/Not implemented|Could not parse CSS/i.test(e)); ok('page errors 0 ('+real.length+')', real.length===0); real.slice(0,3).forEach(e=>out.push('  '+e.slice(0,200)));
 }catch(e){ out.push('EXC '+e.stack); fail++; }
 console.log(out.join('\n')); console.log(fail?'UI FAIL '+fail:'UI ALL PASS'); process.exit(fail?1:0);
},600);
