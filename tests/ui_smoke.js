const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'});
const w=dom.window; const ev=c=>w.eval(c); const out=[]; let fail=0;
function ok(name,cond){ out.push((cond?'✓ ':'✗ ')+name); if(!cond) fail++; }
setTimeout(()=>{
 try{
  ev("switchTab('library')"); const lib=w.document.getElementById('view-library').innerHTML;
  ok('도서관 2026 카드', lib.includes('2026 개정 반영')); ok('이전 지침 보기 토글', lib.includes('이전 지침 보기')); ok('출처 2026 맨앞', ev("SOURCES[0].label").includes('2026'));
  ev("switchTab('flow')"); ok('2026 입력 카드', !!w.document.getElementById('v26Input'));
  ev("STATE.flow.ldl=115; STATE.flow.hdl=105; STATE.flow.rf={age:true,htn:true}; STATE.flow.v26={lpa:60,lpaUnit:'mg/dL'}; updateFlowResult()");
  const fr=w.document.getElementById('flowResult').innerHTML;
  ok('2026 판정 카드', fr.includes('2026 개정 판정')); ok('위험강화인자 표시', fr.includes('위험강화인자 1개')); ok('HDL>100 상충', fr.includes('상한 없음')); ok('처치단계 2026 표기', fr.includes('2026 표 2-6'));
  ev("STATE.flow.comorbid={cad:true}; STATE.flow.v26={statinIntolerant:true}; STATE.flow.ldl=90; STATE.flow.hdl=null; updateFlowResult()");
  const fr2=w.document.getElementById('flowResult').innerHTML;
  ok('벰페도익산 비급여 상충', fr2.includes('넥스레톨')); ok('등급 칩', /badge b-clin"[^>]*>I A/.test(fr2));
  ev("switchTab('sim'); pickSim('s_entry',4)"); ok('시뮬 2026 분기', w.document.getElementById('view-sim').innerHTML.includes('2026. 어떤 케이스'));
  ok('APP 정문', ev("typeof APP.recommend==='function' && APP.REGISTRY_VERSION")==='lipid-v2-2026.11');
  ok('DRUG_DB 갱신', ev("DRUG_DB['drug:bempedoic_acid'].brand")==='넥스레톨');
  ok('superseded pearl 제거', ev("Object.keys(DRUG_UPDATES_2026).every(function(id){ return (DRUG_UPDATES_2026[id].pearlsSupersede||[]).every(function(x){ return DRUG_DB[id].pearls.indexOf(x.old)<0; }); })")===true);
  const ns=fs.readFileSync(process.argv[2],'utf8'); const nsb=ns.slice(ns.indexOf('<noscript'), ns.indexOf('</noscript>'));
  ok('SEO 정적층 2026 정합', !nsb.includes('2026년말 도입 예정') && !nsb.includes('급여 협상중') && ns.slice(0,ns.indexOf('</head>')).includes('진료지침 2026'));
 }catch(e){ out.push('EXC '+e.message); fail++; }
 const real=errs.filter(e=>!/scrollTo|not implemented|Could not parse CSS/i.test(e)); ok('page errors 0 ('+real.length+')', real.length===0); real.slice(0,3).forEach(e=>out.push('  '+e.slice(0,200)));
 console.log(out.join('\n')); console.log(fail?'UI FAIL '+fail:'UI ALL PASS'); process.exit(fail?1:0);
},300);
