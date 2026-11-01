/* liver HBV 회귀 하네스 — node tests/regress_liver.js <v1.html> <v2.html> <golden.json>
   ① v1 HBV ENGINE(클로저)을 소스에서 vm으로 추출 → v1·v2 파일 출력 동일성
   ② v2 HBV26.applyHbv2026 기대값(스펙 §9-2)
   ③ v2 급여 재구현 == v1 rbTreat (expected diff: golden.expect.v1_rb_diff)  */
const fs=require('fs'), vm=require('vm'), {JSDOM,VirtualConsole}=require('jsdom');
const [,,V1,V2,GOLD]=process.argv;
function v1Engine(file){
  const s=fs.readFileSync(file,'utf8'), a=s.indexOf('var HBV = {};'), b=s.indexOf('var state={hbeag');
  if(a<0||b<0||b<a) throw new Error('HBV 모듈 경계 탐색 실패: '+file);
  const ctx={}; vm.createContext(ctx); vm.runInContext(s.slice(a,b),ctx); return ctx;
}
const e1=v1Engine(V1), e2=v1Engine(V2);
const G=JSON.parse(fs.readFileSync(GOLD,'utf8'));
const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
const dom=new JSDOM(fs.readFileSync(V2,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'});
const w=dom.window;
setTimeout(()=>{
  let fail=0; const out=[];
  for(const g of G){
    const p=g.p, v1p={hbeag:p.hbeag,dna:p.dna_undetected==='yes'?0:p.dna,alt:p.alt,cirr:p.cirr,egfr:p.egfr==null?null:p.egfr,hcc:p.hcc||'no',preg:p.preg||'no',bone:p.bone||'no',resist:p.resist||'no',immuno:p.immuno||'no'};
    const r1=JSON.stringify(vm.runInContext('recommend('+JSON.stringify(v1p)+')',e1)), r2=JSON.stringify(vm.runInContext('recommend('+JSON.stringify(v1p)+')',e2));
    const same=r1===r2; const rb1=JSON.parse(r1).indication.rbTreat;
    const a=w.HBV26.applyHbv2026(p), e=g.expect, er=[];
    if(!same) er.push('v1 엔진 출력 불일치');
    if(e.phase!==undefined&&a.phase!==e.phase) er.push('phase '+a.phase);
    if(e.decision&&a.decision!==e.decision) er.push('decision '+a.decision);
    if(e.txRec&&a.txRec!==e.txRec) er.push('txRec '+a.txRec);
    if(e.tx&&a.reimb.tx.status!==e.tx) er.push('tx '+a.reimb.tx.status);
    if(e.conflicts&&JSON.stringify([...a.conflicts].sort())!==JSON.stringify([...e.conflicts].sort())) er.push('conf '+a.conflicts);
    if(e.drugs&&JSON.stringify(a.drugs.map(d=>d.id))!==JSON.stringify(e.drugs)) er.push('drugs '+a.drugs.map(d=>d.id));
    if(e.gates&&!e.gates.every(x=>a.gates.some(y=>y.gate===x))) er.push('gates');
    if(e.errata&&JSON.stringify(a.errata)!==JSON.stringify(e.errata)) er.push('errata '+a.errata);
    if(e.vertical&&(!a.reimb.vertical||a.reimb.vertical.status!==e.vertical)) er.push('vertical');
    if(e.proph&&(!a.reimb.proph||a.reimb.proph.status!==e.proph)) er.push('proph');
    if(e.recsInclude&&!e.recsInclude.every(x=>a.recs.includes(x))) er.push('recs');
    const rb2=a.reimb.tx.status==='ok', rbDiff=rb1!==rb2;
    if(rbDiff!==!!e.v1_rb_diff) er.push('급여 v1/v2 '+(rbDiff?'불일치(미선언)':'일치(선언된 diff 없음)')+' v1='+rb1+' v2='+a.reimb.tx.status);
    const fr=w.APP.recommend(p); if(!Array.isArray(fr.drugs)||!Array.isArray(fr.targets)||!Array.isArray(fr.flags)) er.push('정문 계약 형태');
    out.push(g.id+' '+(er.length?'✗ '+er.join(' | '):'✓')+' v1same='+same+' rb v1='+rb1+'/v2='+a.reimb.tx.status+(rbDiff?' (expected diff)':''));
    if(er.length) fail++;
  }
  const real=errs.filter(x=>!/scrollTo|not implemented|Could not parse CSS/i.test(x));
  if(real.length){ out.push('page errors: '+real.slice(0,3).join(' / ')); fail++; }
  console.log(out.join('\n')); console.log(fail?'FAIL '+fail:'ALL PASS'); process.exit(fail?1:0);
},300);
