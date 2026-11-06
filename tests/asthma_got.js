/* 판정 요약 추출 — 회귀·golden 공용 */
module.exports=function got(w,p){ const a=w.ASTHMA26_ENGINE.applyAsthma2026(JSON.parse(JSON.stringify(p)));
  const reimb={}; a.drugs.forEach(d=>{ reimb[d.id]=d.reimb&&d.reimb.status; });
  return { mode:a.mode, action:a.action, step:[a.step.current,a.step.target], control:a.control.level, ics:a.ics.level,
    regimens:a.regimens.map(r=>r.track+':'+r.txt), reimb, pheno:a.biologics?Object.keys(a.biologics.phenotype).filter(k=>a.biologics.phenotype[k]):null,
    ae:a.ae?a.ae.severity.id:null, conflicts:a.conflicts.map(x=>x.id), flags:a.flags.map(f=>f.id), errata:a.errata, advice:a.advice.map(x=>x.id) }; };
