/* hf 회귀 하네스 — node tests/regress_hf.js <v1.html> <v2.html> <golden.json>
   ① v1 HF_ENGINE.recommend / HF.recommend 출력: v1·v2 파일 동일  ② v2 applyHf2026 기대값  ③ 정문 계약  ④ 엔진 수치 리터럴 0 */
const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const [,,V1,V2,GOLD]=process.argv; const G=JSON.parse(fs.readFileSync(GOLD,'utf8'));
function load(f){ const vc=new VirtualConsole(), errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
  const d=new JSDOM(fs.readFileSync(f,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'}); return {w:d.window,errs}; }
const A=load(V1), B=load(V2);
setTimeout(()=>{
  let fail=0; const out=[];
  const inc=(arr,xs)=>xs.every(x=>arr.includes(x));
  for(const g of G){
    const er=[];
    const v1p={}; for(const k in g.p){ v1p[k]=g.p[k]; }
    const r1=JSON.stringify(A.w.HF_ENGINE.recommend(v1p)), r2=JSON.stringify(B.w.HF_ENGINE.recommend(v1p));
    const h1=JSON.stringify(A.w.HF.recommend(v1p)), h2=JSON.stringify(B.w.HF.recommend(v1p));
    if(r1!==r2||h1!==h2) er.push('v1 엔진 출력 불일치');
    const E=B.w.HF26_ENGINE, e=g.expect;
    if(g.reimbOnly){ const vars=E.context(g.p); const rv=E.reimbVerdict26(g.reimbOnly,vars); if(rv.status!==e.status) er.push('reimb '+rv.status); }
    else {
      const a=E.applyHf2026(g.p), ids=a.drugs.map(d=>d.id), st={}; a.drugs.forEach(d=>st[d.id]=d.reimb.status);
      if(e.pheno!==undefined&&a.phenotype26!==e.pheno) er.push('pheno '+a.phenotype26);
      if(e.kshf&&a.kshf!==e.kshf) er.push('kshf '+a.kshf);
      if(e.drugsInclude&&!inc(ids,e.drugsInclude)) er.push('drugsInclude '+e.drugsInclude.filter(x=>!ids.includes(x)));
      if(e.drugsExclude&&e.drugsExclude.some(x=>ids.includes(x))) er.push('drugsExclude '+e.drugsExclude.filter(x=>ids.includes(x)));
      if(e.reimb) for(const k in e.reimb){ if(st[k]!==e.reimb[k]) er.push('reimb '+k+'='+st[k]); }
      if(e.conflicts&&JSON.stringify(a.conflicts.slice().sort())!==JSON.stringify(e.conflicts.slice().sort())) er.push('conflicts '+a.conflicts);
      if(e.conflictsInclude&&!inc(a.conflicts,e.conflictsInclude)) er.push('conflictsInclude');
      if(e.conflictsExclude&&e.conflictsExclude.some(x=>a.conflicts.includes(x))) er.push('conflictsExclude');
      const fl=a.flags.map(f=>f.id);
      if(e.flagsInclude&&!inc(fl,e.flagsInclude)) er.push('flagsInclude '+e.flagsInclude.filter(x=>!fl.includes(x)));
      if(e.flagsExclude&&e.flagsExclude.some(x=>fl.includes(x))) er.push('flagsExclude');
      if(e.recsInclude&&!inc(a.recs,e.recsInclude)) er.push('recsInclude '+e.recsInclude.filter(x=>!a.recs.includes(x)));
      if(e.avoidInclude&&!inc(a.avoid.map(x=>x.id),e.avoidInclude)) er.push('avoid');
      if(e.unavailable&&!inc(a.unavailable.map(x=>x.id),e.unavailable)) er.push('unavailable');
      if(e.errataInclude&&!inc(a.errata,e.errataInclude)) er.push('errata '+a.errata);
      if(e.drugCount!==undefined&&a.drugs.length!==e.drugCount) er.push('drugCount '+a.drugs.length);
      if(e.firstFour&&JSON.stringify(a.drugs.slice(0,4).map(d=>d.grade))!==JSON.stringify(e.firstFour)) er.push('order');
      if(e.drugSafety) for(const k in e.drugSafety){ const d=a.drugs.find(x=>x.id===k); if(!d||!inc(d.safety.map(s=>s.id),e.drugSafety[k])) er.push('drugSafety '+k); }
      const f=B.w.APP.recommend(g.p); if(!Array.isArray(f.drugs)||!Array.isArray(f.targets)||!Array.isArray(f.flags)) er.push('정문 계약');
    }
    out.push(g.id+' '+(er.length?'✗ '+er.join(' | '):'✓')); if(er.length) fail++;
  }
  // 엔진 리터럴 검사 (0·1 제외 숫자 금지)
  const eng=fs.readFileSync(require('path').join(__dirname,'..','hf_v2_engine.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'').replace(/"(?:[^"\\]|\\.)*"/g,'""');
  const lits=(eng.match(/[^\w.]\d+(\.\d+)?/g)||[]).map(x=>x.slice(1)).filter(x=>x!=='0'&&x!=='1');
  out.push('엔진 수치 리터럴 '+(lits.length?'✗ '+lits.join(','):'✓ 0')); if(lits.length) fail++;
  const real=B.errs.concat(A.errs).filter(x=>!/Not implemented|Could not parse CSS/i.test(x)); if(real.length){ out.push('page errors: '+real.slice(0,3)); fail++; }
  console.log(out.join('\n')); console.log(fail?'FAIL '+fail:'ALL PASS'); process.exit(fail?1:0);
},600);
