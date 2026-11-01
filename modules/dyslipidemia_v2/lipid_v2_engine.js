/* ===================================================================
   dyslipidemia v2 — ENGINE (가산 전용)
   기존 recommendLipid / riskEngine / classifyDM / countRiskFactors / clinicalEngine /
   treatmentAction / evalPcsk9GateAscvd / tgBand 는 수정하지 않는다.
   =================================================================== */

/* ---- SPEC §10.5(5) 미니문법 파서: has() matched() 비교 && || ! ( ) — eval/Function 금지 ---- */
function lipidWhenTokens(s){
  var t=[], i=0, re=/\s*(\|\||&&|==|!=|>=|<=|[()!<>]|-?\d+(?:\.\d+)?|[A-Za-z_][\w:.\-]*)/y;
  while(i<s.length){ re.lastIndex=i; var m=re.exec(s); if(!m){ if(/\s/.test(s.slice(i))) break; throw new Error("when 구문 오류: "+s.slice(i)); } t.push(m[1]); i=re.lastIndex; }
  return t;
}
function lipidWhenEval(expr, ctx){
  if(expr==null || expr==="") return true;
  var tk=lipidWhenTokens(expr), p=0;
  function peek(){ return tk[p]; } function next(){ return tk[p++]; }
  function val(tok){
    if(/^-?\d/.test(tok)) return parseFloat(tok);
    if(tok==="true") return true; if(tok==="false") return false;
    if(Object.prototype.hasOwnProperty.call(ctx.vars,tok)) return ctx.vars[tok];
    return tok; /* 미정의 식별자 = 문자열 리터럴(예: stratum == moderate) */
  }
  function primary(){
    var tok=next();
    if(tok==="("){ var v=orE(); next(); return v; }
    if(tok==="!") return !primary();
    if((tok==="has"||tok==="matched") && peek()==="("){ next(); var arg=next(); next();
      return tok==="has" ? !!ctx.has(arg) : !!ctx.matched(arg); }
    var a=val(tok);
    var op=peek();
    if(op==="=="||op==="!="||op===">="||op==="<="||op===">"||op==="<"){
      next(); var b=val(next());
      if(op==="==") return a===b; if(op==="!=") return a!==b;
      if(a==null||b==null||typeof a!=="number"||typeof b!=="number") return false;
      if(op===">=") return a>=b; if(op==="<=") return a<=b; if(op===">") return a>b; return a<b;
    }
    return !!a;
  }
  function andE(){ var v=primary(); while(peek()==="&&"){ next(); var r=primary(); v=v&&r; } return v; }
  function orE(){ var v=andE(); while(peek()==="||"){ next(); var r=andE(); v=v||r; } return v; }
  return orE();
}

/* ---- 컨텍스트 구성: 환자 입력 → 미니문법 변수 ---- */
function lipidCtx2026(patient, base){
  var c=patient.comorbid||{}, cd=patient.currentDrugs||[], enh=patient.enh||{};
  function has(k){ return !!c[k]; }
  var ascvd=ASCVD_KEYS_2026.some(has);
  var rf=countRiskFactors(patient).count;
  var hasCls=function(cls){ return typeof hasClass==="function" ? hasClass(cd,cls) : false; };
  var enhList=lipidEnhancers2026(patient, base);
  var v={
    ldl:patient.ldl, hdl:patient.hdlValue!=null?patient.hdlValue:patient.hdl, tg:patient.tg, egfr:patient.egfr, age:patient.age,
    ldl_baseline:patient.baselineLdl, dm:!!patient.dm||has("dm"), t1dm:!!patient.t1dm, dm_years:patient.dmYears,
    rf_count:rf, tod_count:(patient.tod||[]).length, enh_count:enhList.length,
    stratum:STRATUM_SHORT_2026[base.riskStratum], ascvd:ascvd, acc_very_high:!!patient.accVeryHigh,
    on_statin:hasCls("class:statin")||!!patient.onStatin, on_ezetimibe:hasCls("class:ezetimibe")||!!patient.onEzetimibe,
    on_llt:cd.length>0||!!patient.onStatin, statin_intolerant:!!patient.statinIntolerant,
    recurrent_stroke_highrisk:!!c.recurrent_stroke_highrisk, fh:!!patient.fh, fh_suspected:!!patient.fhSuspected||!!patient.fh,
    dialysis:!!patient.dialysis, smoking:!!(patient.rf&&patient.rf.smoking), enh_hiv:!!enh.hiv
  };
  var matchedSet={};
  return { vars:v, has:function(k){ return k==="ckd" ? (has("ckd")||(patient.egfr!=null&&patient.egfr<60)) : has(k); },
           matched:function(id){ return !!matchedSet[id]; }, _matched:matchedSet, enh:enhList };
}

/* ---- 위험강화인자 판정 (위험군 불변, 일차예방 군에서만 flag) ---- */
function lipidEnhancers2026(patient, base){
  if(RISK_ENHANCER_SCOPE_2026.applies.indexOf(base.riskStratum)<0) return [];
  var e=patient.enh||{}, out=[];
  Object.keys(RISK_ENHANCERS_2026).forEach(function(id){
    var d=RISK_ENHANCERS_2026[id];
    if(d.kind==="bool"){ if(e[d.key]) out.push({id:id, label:d.label}); return; }
    var x=patient[d.key]; if(x==null) return;
    var unit = d.key==="lpa" ? (patient.lpaUnit||"mg/dL") : Object.keys(d.thresholds)[0];
    var th=d.thresholds[unit]; if(th!=null && x>=th) out.push({id:id, label:d.label, value:x, unit:unit, threshold:th});
  });
  return out;
}

/* ---- 2026 후처리 ---- */
function applyLipid2026(patient, base){
  var ctx=lipidCtx2026(patient, base);
  var res={ zone:null, optionalTarget:null, enhancers:ctx.enh, tgBand2026:null, tgRetest:false,
            recs:{ ksla2026:[], acc2026:[] }, conflicts:[], notes:[] };
  /* 1) 표 2-6 구간 */
  if(patient.ldl!=null && RX_ZONE_2026.rows[base.riskStratum]){
    var bi=RX_ZONE_2026.bands.findIndex(function(b){ return (b.lo==null||patient.ldl>=b.lo)&&(b.hi==null||patient.ldl<b.hi); });
    var z=RX_ZONE_2026.rows[base.riskStratum][bi];
    res.zone={ id:RX_ZONE_2026.id, value:z, band:RX_ZONE_2026.bands[bi].label, label:RX_ZONE_2026.enum[z].label };
  }
  /* 2) 선택적 <55 */
  var c=patient.comorbid||{};
  if(base.risk && base.risk.stratumId==="lipid:risk:high"){
    if(base.risk.selective55) res.optionalTarget={ ref:"lipid:tgt:ldl55", rec:"lipid:rec:ksla2026:dm_veryhigh_ldl55_opt" };
    else if((c.ischemic_stroke||c.tia) && c[STROKE_OPT_2026.input]) res.optionalTarget={ ref:STROKE_OPT_2026.target, rec:STROKE_OPT_2026.rec };
  }
  /* 3) TG */
  if(patient.tg!=null){
    var tb=TG_BANDS_2026.bands.find(function(b){ return (b.lo==null||patient.tg>=b.lo)&&(b.hi==null||patient.tg<b.hi); });
    res.tgBand2026=tb?tb.id:null;
    res.tgRetest = (patient.fasting===false && patient.tg>=TG_BANDS_2026.nonfastingRetest);
  }
  /* 4) REC 매칭 → GL별 등급 정렬 */
  Object.keys(REC_2026).forEach(function(id){
    var r=REC_2026[id]; if(r.status!=="active") return;
    var ok=false; try{ ok=lipidWhenEval(r.when, ctx); }catch(e){ ok=false; }
    if(ok){ ctx._matched[id]=true; (r.guideline==="gl:dyslipidemia:ksla-2026"?res.recs.ksla2026:res.recs.acc2026).push(id); }
  });
  var byRank=function(a,b){ return REC_2026[a].grade_rank-REC_2026[b].grade_rank; };
  res.recs.ksla2026.sort(byRank); res.recs.acc2026.sort(byRank);
  /* 5) 상충·노트 */
  Object.keys(CONFLICT_WHEN_2026).forEach(function(cid){ if(CONFLICTS[cid] && lipidWhenEval(CONFLICT_WHEN_2026[cid], ctx)) res.conflicts.push(cid); });
  Object.keys(REIMB_NOTE_WHEN_2026).forEach(function(nid){ if(lipidWhenEval(REIMB_NOTE_WHEN_2026[nid], ctx)) res.notes.push(nid); });
  return res;
}

/* ---- 헌장 §4 정문 계약 ---- */
function recommend(patient){
  var base=recommendLipid(patient);
  var a=applyLipid2026(patient, base);
  var targets=[], drugs=[], flags=[];
  var tgt=STRATUM_TARGET_2026[base.riskStratum];
  var mainRec = (a.recs.ksla2026.filter(function(id){ return REC_2026[id].recommend.indexOf(tgt)>=0; })[0])||null;
  if(tgt){
    targets.push({ lab:"lab:ldl_c", op:"<", ref:tgt, rec:mainRec });
    targets.push({ lab:"lab:non_hdl_c", op:"<", ref:tgt, rec:"lipid:rec:ksla2026:nonhdl_secondary" });
  }
  if(base.risk && base.risk.codrop50) targets.push({ lab:"lab:ldl_c", op:"reduction>=", ref:"lipid:tgt:codrop50", rec:mainRec });
  if(a.optionalTarget) targets.push({ lab:"lab:ldl_c", op:"<", ref:a.optionalTarget.ref, rec:a.optionalTarget.rec, optional:true, grade:"IIa B" });

  var cd=patient.currentDrugs||[];
  var hasCls=function(cls){ return typeof hasClass==="function" ? hasClass(cd,cls) : false; };
  var need=(base.clinical && base.clinical.needReduction>0);
  drugs.push({ id:"class:statin", step:1, state:(hasCls("class:statin")||patient.onStatin)?"done":"todo", rec:"lipid:rec:ksla2026:statin_first", grade_norm:"A" });
  if(need) drugs.push({ id:"drug:ezetimibe", step:2, state:(hasCls("class:ezetimibe")||patient.onEzetimibe)?"done":"todo",
    rec:(a.recs.ksla2026.indexOf("lipid:rec:ksla2026:cad_nonstatin_early")>=0?"lipid:rec:ksla2026:cad_nonstatin_early":"lipid:rec:ksla2026:dm_eze_add") });
  if(need && (base.riskStratum==="lipid:risk:veryhigh"||base.riskStratum==="lipid:risk:high"))
    drugs.push({ id:"class:pcsk9i", step:3, state:(hasCls("class:pcsk9i")||hasCls("class:sirna_pcsk9"))?"done":"todo",
      rec:"lipid:rec:ksla2026:ascvd_pcsk9", reimb:(base.gate?(base.gate.pass?"pass":"fail"):"pending") });
  if(patient.statinIntolerant) drugs.push({ id:"drug:bempedoic_acid", step:"alt", state:"option",
    rec:(a.recs.ksla2026.indexOf("lipid:rec:ksla2026:cad_intol_bempedoic")>=0?"lipid:rec:ksla2026:cad_intol_bempedoic":"lipid:rec:ksla2026:intol_nonstatin"), conflict:"lipid:conflict:bempedoic_unlisted" });
  ["lipid:rec:ksla2026:ipe","lipid:rec:ksla2026:dm_ipe"].forEach(function(id){
    if(a.recs.ksla2026.indexOf(id)>=0 && !drugs.some(function(d){ return d.id==="drug:icosapent_ethyl"; }))
      drugs.push({ id:"drug:icosapent_ethyl", step:"tg", state:"option", rec:id, conflict:"lipid:conflict:ipe" });
  });

  if(a.zone) flags.push({ type:"rx_zone", ref:a.zone.id, value:a.zone.value, band:a.zone.band });
  if(a.optionalTarget) flags.push({ type:"optional_target", ref:a.optionalTarget.ref, rec:a.optionalTarget.rec });
  a.enhancers.forEach(function(e){ flags.push({ type:"risk_enhancer", ref:e.id, rec:RISK_ENHANCER_SCOPE_2026.rec[base.riskStratum] }); });
  if(a.tgRetest) flags.push({ type:"tg_retest", ref:"lipid:tgband:2026", value:TG_BANDS_2026.nonfastingRetest });
  a.conflicts.forEach(function(cid){ flags.push({ type:"conflict", ref:cid }); });
  a.notes.forEach(function(nid){ flags.push({ type:"reimb_note", ref:nid }); });
  (base.flags||[]).forEach(function(t){ flags.push({ type:"legacy", text:t }); });
  return { drugs:drugs, targets:targets, flags:flags };
}

var APP = { recommend:recommend, REGISTRY_VERSION:LIPID_V2_META.registry,
  localMap:{ "lipid:risk:*":"guide-local stratum", "lipid:tgt:*":"TARGETS_2026→RISK_STRATA", "drug:*":"global", "class:*":"global", "lab:*":"global" } };
