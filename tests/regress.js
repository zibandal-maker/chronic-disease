/* 회귀 하네스: (1) v1·v2 recommendLipid 동일성 (2) v2 recommend()/applyLipid2026 기대값 */
const fs=require('fs'), {JSDOM, VirtualConsole}=require('jsdom');
const [,,v1p,v2p,goldp]=process.argv;
function load(p){ const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));
  const dom=new JSDOM(fs.readFileSync(p,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://local.test/'});
  return {w:dom.window, errs}; }
const A=load(v1p), B=load(v2p); const G=JSON.parse(fs.readFileSync(goldp,'utf8'));
const ev=(w,code)=>w.eval(code);
let fail=0; const log=[];
const realErr=e=>!/scrollTo|not implemented|Could not parse CSS/i.test(e);
log.push('pageErrors v1='+A.errs.filter(realErr).length+' v2='+B.errs.filter(realErr).length);
B.errs.filter(realErr).forEach(e=>log.push('  v2err: '+e.slice(0,160)));
for(const g of G){
  const pj=JSON.stringify(g.p);
  const r1=JSON.stringify(ev(A.w,'recommendLipid('+pj+')')), r2=JSON.stringify(ev(B.w,'recommendLipid('+pj+')'));
  const same=(r1===r2); const D=g.expect.recommendLipid_diff;
  if(D){ const get=(o,p)=>p.split('.').reduce((x,k)=>x&&x[k],o); const a1=get(JSON.parse(r1),D.path), a2=get(JSON.parse(r2),D.path);
    if(same||a1!==D.v1||a2!==D.v2){ fail++; log.push(g.id+' ✗ expected diff '+D.path+' v1='+a1+' v2='+a2); } }
  else if(!same){ fail++; log.push(g.id+' ✗ recommendLipid v1≠v2'); }
  const out=JSON.parse(JSON.stringify(ev(B.w,'recommend('+pj+')')));
  const base=JSON.parse(r2); const a=JSON.parse(JSON.stringify(ev(B.w,'applyLipid2026('+pj+',recommendLipid('+pj+'))')));
  const e=g.expect, errs=[];
  if(e.stratum && base.riskStratum!==e.stratum) errs.push('stratum '+base.riskStratum);
  if(e.zone && (!a.zone||a.zone.value!==e.zone)) errs.push('zone '+(a.zone&&a.zone.value));
  if(e.v1_action && (!base.treatment||base.treatment.action!==e.v1_action)) errs.push('v1_action '+(base.treatment&&base.treatment.action));
  const trefs=out.targets.filter(t=>!t.optional).map(t=>t.ref);
  (e.targets||[]).forEach(t=>{ if(!trefs.includes(t)) errs.push('target '+t); });
  if(e.optional && !out.targets.some(t=>t.optional&&t.ref===e.optional)) errs.push('optional '+e.optional);
  const recs=a.recs.ksla2026.concat(a.recs.acc2026);
  (e.recs||[]).forEach(r=>{ if(!recs.includes(r)) errs.push('rec '+r); });
  (e.no_recs||[]).forEach(r=>{ if(recs.includes(r)) errs.push('unexpected rec '+r); });
  (e.enh||[]).forEach(x=>{ if(!a.enhancers.some(h=>h.id===x)) errs.push('enh '+x); });
  (e.conflicts||[]).forEach(c=>{ if(!a.conflicts.includes(c)) errs.push('conflict '+c); });
  (e.no_conflicts||[]).forEach(c=>{ if(a.conflicts.includes(c)) errs.push('unexpected conflict '+c); });
  (e.flags||[]).forEach(f=>{ if(!out.flags.some(x=>x.type===f)) errs.push('flag '+f); });
  (e.drugs||[]).forEach(d=>{ if(!out.drugs.some(x=>x.id===d)) errs.push('drug '+d); });
  if(!Array.isArray(out.drugs)||!Array.isArray(out.targets)||!Array.isArray(out.flags)) errs.push('contract shape');
  if(errs.length){ fail++; log.push(g.id+' ✗ '+errs.join(' | ')); }
  else log.push(g.id+' ✓ same='+same+' zone='+(a.zone&&a.zone.value)+' recs='+recs.length+' conf='+a.conflicts.length);
}
console.log(log.join('\n')); console.log(fail?('FAIL '+fail):'ALL PASS'); process.exit(fail?1:0);
