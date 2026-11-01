/* liver HBV v2 UI 스모크 — node tests/ui_smoke_liver.js <v2.html> */
const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'});
const w=dom.window, d=w.document; const out=[]; let fail=0;
function ok(n,c){ out.push((c?'✓ ':'✗ ')+n); if(!c) fail++; }
function click(el){ el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
setTimeout(()=>{
 try{
  const root=d.getElementById('disease-hbv');
  ok('헤더 v2 relabel', root.querySelector('header .ver').textContent.includes('KASL 2026'));
  ok('2026 입력 카드', !!d.getElementById('hbv26Input') && d.querySelectorAll('#hbv26Input .opts[data-k26]').length>=10);
  ok('도서관 2026 카드 7장', d.querySelectorAll('#hbv26-lib .card').length===7);
  ok('권고 전수 89', d.getElementById('hbv26-lib').innerHTML.includes('권고 전수 (89건'));
  ok('v1 카드 이전 지침 칩', [...root.querySelectorAll('#hbv-tab-lib .hbv26-old')].length>=2);
  ok('시뮬 2026 증례 5', d.querySelectorAll('#hbv26-sim .card').length===5);
  ok('푸터 2026 출처', d.getElementById('hbv-footer').innerHTML.includes('2026 개정 출처'));
  // 플로우: v1 입력 + 2026 입력 → 실행
  click(root.querySelector('#hbv-tab-flow .opts[data-k="hbeag"] button[data-v="neg"]'));
  click(root.querySelector('#hbv-tab-flow .opts[data-k="cirr"] button[data-v="none"]'));
  root.querySelector('#in-dna').value='8000'; root.querySelector('#in-alt').value='25';
  click(root.querySelector('#hbv26Input .opts[data-k26="sex"] button[data-v="male"]'));
  root.querySelector('#hbv26-in-age').value='45';
  click(root.querySelector('#runBtn'));
  const res=root.querySelector('#result').innerHTML;
  ok('2026 판정 카드', res.includes('KASL 2026 판정'));
  ok('중등도 → 치료 권고', res.includes('HBeAg 음성 중등도 바이러스혈증') && res.includes('치료 권고'));
  ok('상충 표시', res.includes('지침 ⟷ 급여 상충'));
  ok('이전 지침 접힘(v1 결과 보존)', !!root.querySelector('#result details.hbv26-legacy') && root.querySelector('#result details.hbv26-legacy').innerHTML.includes('치료 판정'));
  ok('v1 pill relabel', res.includes('2026 반영') && !res.includes('2026 개정 예정'));
  ok('약제 카드 + 등급칩', res.includes('2026 약제') && /gchip A1/.test(res));
  // 대상성 간경변 DNA 500 → E5 주석
  click(root.querySelector('#hbv-tab-flow .opts[data-k="cirr"] button[data-v="comp"]'));
  root.querySelector('#in-dna').value='500';
  click(root.querySelector('#runBtn'));
  const res2=root.querySelector('#result').innerHTML;
  ok('대상성 DNA 500 → 급여 인정 + E5', res2.includes('급여 인정') && res2.includes('E5'));
  // 초기화
  click(root.querySelector('#resetBtn'));
  ok('초기화', root.querySelectorAll('#hbv26Input button.sel').length===0 && root.querySelector('#hbv26-in-age').value==='');
  // 시뮬 판정기 병기
  const sim=root.querySelector('#hbv-tab-sim');
  [['hbeag','neg'],['dna','lo'],['alt','lo'],['liver','comp']].forEach(([k,v])=>click(sim.querySelector('.opts[data-rk="'+k+'"] button[data-v="'+v+'"]')));
  setTimeout(()=>{
    const rv=sim.querySelector('#reimbVerdict').innerHTML;
    ok('판정기 2026 병기', rv.includes('KASL 2026'));
    ok('판정기 E5 정정 안내', rv.includes('E5'));
    // 다른 질환 토글 무영향
    click(d.querySelector('#diseaseToggle button[data-disease="mash"]'));
    ok('MASH 토글 정상', d.getElementById('disease-mash').classList.contains('on'));
    ok('APP 정문', typeof w.APP.recommend==='function' && w.APP.REGISTRY_VERSION==='liver-hbv-v2-2026.11');
    const real=errs.filter(e=>!/scrollTo|not implemented|Could not parse CSS/i.test(e)); ok('page errors 0 ('+real.length+')', real.length===0); real.slice(0,3).forEach(e=>out.push('  '+e.slice(0,200)));
    console.log(out.join('\n')); console.log(fail?'UI FAIL '+fail:'UI ALL PASS'); process.exit(fail?1:0);
  },50);
 }catch(e){ console.log(out.join('\n')); console.log('EXC '+e.stack); process.exit(1); }
},300);
