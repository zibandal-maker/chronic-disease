/* ===================================================================
   hf v2 ENGINE — applyHf2026 · reimbVerdict26 · recommend (정문)
   DATA(HF26)·v1(HF_DATA, HF_ENGINE)·WhenDSL에만 의존. 임상 수치 리터럴 없음(TH·DOSE 참조).
   v1 엔진은 호출만(읽기 전용) — 결과는 legacy로 반환.
   =================================================================== */
var HF26_ENGINE = (function(D, V1D, V1E, W){
"use strict";
var RS = D.REC_SYSTEMS["recsys:esc"];

function num(x){ if(x===null||x===undefined||x==="") return null; var n=Number(x); return isFinite(n)?n:null; }
function truthy(x){ return x===true||x==="true"||x===1||x==="1"; }

/* ---------- 컨텍스트 ---------- */
function context(p){
  p=p||{}; var v={}, k;
  for(k in D.TH){ if(Object.prototype.hasOwnProperty.call(D.TH,k)) v["TH."+k]=D.TH[k]; }
  D.V1_INPUT_KEYS.num.forEach(function(key){ var n=num(p[key]); if(n!==null) v[key]=n; });
  D.V1_INPUT_KEYS.bool.forEach(function(key){ v[key]=truthy(p[key]); });
  D.INPUTS.forEach(function(it){
    if(it.type==="number"){ var n=num(p[it.k]); if(n!==null) v[it.k]=n; }
    else if(it.type==="chip"){ v[it.k]=truthy(p[it.k]); }
    else if(it.type==="select"){ if(p[it.k]) v[it.k]=String(p[it.k]); }
  });
  var TH=D.TH;
  v.has_lvef = v.lvef!==undefined;
  v.pheno26 = !v.has_lvef ? "none" : (v.lvef < TH.ref_lt ? "ref" : "pef");
  v.kshf = (v.has_lvef && V1E && V1E.classifyPhenotype) ? V1E.classifyPhenotype({lvef:v.lvef}) : null;
  v.band4149 = v.has_lvef && v.lvef > TH.kshf_ref_le && v.lvef < TH.ref_lt;
  v.impef = v.has_lvef && v.prior_lvef!==undefined && (v.lvef - v.prior_lvef) >= TH.impef_delta && v.lvef > TH.impef_floor;
  v.symptomatic = (v.nyha!==undefined && v.nyha >= TH.nyha_sym_ge) || v.hf_symptom;
  v.inpatient = v.setting==="inpatient";
  v.preclinical = v.stage==="A" || v.stage==="B";
  var f=v.ferritin, t=v.tsat;
  v.iron_def = (f!==undefined && f < TH.id_ferritin_lt) || (f!==undefined && t!==undefined && f < TH.id_ferritin_hi && t < TH.id_tsat_lt);
  return v;
}
function ev(expr, vars, matchedSet){
  return W.eval(expr, { vars:vars, has:function(x){ return !!vars[x]; }, matched:function(x){ return !!(matchedSet&&matchedSet[x]); } });
}
function tpl(msg){ return String(msg).replace(/\{TH\.(\w+)\}/g, function(_,k){ return D.TH[k]; }); }

/* ---------- 약물 조회 ---------- */
function members(cid){
  if(cid.indexOf("drug:")===0) return [cid];
  var base=(V1D.CLASSES[cid]&&V1D.CLASSES[cid].members) || (D.CLASS_ADD[cid]&&D.CLASS_ADD[cid].members) || [];
  return base.concat(D.CLASS_EXTEND[cid]||[]);
}
function drugInfo(did){
  var a=V1D.DRUGS[did]||D.DRUG_ADD[did]; if(!a) return null;
  var o={}, k; for(k in a) o[k]=a[k];
  var s=D.DRUG_STATUS[did]; if(s) for(k in s) o[k]=s[k];
  if(o.kr_available===undefined) o.kr_available=true;
  if(!o.cls){ o.cls=null; }
  return o;
}
function classLabel(cid){ var c=V1D.CLASSES[cid]||D.CLASS_ADD[cid]; return c?c.label:cid; }

/* ---------- 정렬 ---------- */
function gradeOf(r){ return RS.grade[r.grade]; }
function rankKey(r){ var g=gradeOf(r); return [g.rank, RS.loe_rank[r.loe], D.TIERS[r.tier].order]; }
function cmp(a,b){ var x=rankKey(a), y=rankKey(b); for(var i=0;i<x.length;i++){ if(x[i]!==y[i]) return x[i]-y[i]; } return 0; }
function isContra(r){ return gradeOf(r).norm==="X"; }

/* ---------- 급여 ---------- */
function evalGate(node, vars, out){
  if(node.op){
    var kids=node.conds.map(function(c){ return evalGate(c, vars, out); });
    var pass = node.op==="AND" ? kids.every(function(x){return x.pass;}) : kids.some(function(x){return x.pass;});
    return { op:node.op, label:node.label||null, pass:pass, children:kids };
  }
  var ok=!!ev(node.when, vars);
  if(!ok) out.push(node.txt);
  return { leaf:true, txt:node.txt, pass:ok };
}
function ruleFor(did){
  for(var id in D.REIMB_2026){ if(D.REIMB_2026[id].drugs.indexOf(did)>=0) return D.REIMB_2026[id]; }
  return null;
}
function reimbVerdict26(did, vars){
  var info=drugInfo(did), r=ruleFor(did);
  if(info && info.kr_available===false) return { drug:did, status:"na", rule:null, missing:[], notes:[info.kr_note||""], tree:null };
  if(!r) return { drug:did, status:"general", rule:null, missing:[], notes:[], tree:null };
  var res={ drug:did, rule:r.id, notice:r.notice||null, title:r.title, missing:[], notes:(r.notes||[]).slice(), tree:null, errata:D.REIMB_ERRATA[r.id]||[] };
  if(r.fixed){ res.status=r.fixed; }
  else {
    res.tree=evalGate(r.gate, vars, res.missing);
    if(res.tree.pass) res.status="ok";
    else if(r.selective && ev(r.selective.when, vars)){ res.status="selective"; res.notes.unshift(r.selective.txt); }
    else res.status=r.fail_status||"unmet";
  }
  if(res.status!=="ok" && res.status!=="selective" && r.fallback && ev(r.fallback.when, vars)){ res.status=r.fallback.status; res.notes.unshift(r.fallback.note); }
  return res;
}

/* ---------- 용량 ---------- */
function doseFor(did, vars){
  var d=D.DOSE_2026[did]; if(!d) return null;
  var o={ start:d.start, target:d.target, note:d.note||null, src:d.src||D.DOSE_SRC };
  if(d.rule){ for(var i=0;i<d.rule.length;i++){ if(ev(d.rule[i].when, vars)){ o.start=d.rule[i].start; o.target=d.rule[i].target; o.ruleHit=true; break; } } }
  return o;
}

/* ---------- 핵심 ---------- */
function applyHf2026(p){
  var vars=context(p);
  var recs=D.REC_2026.filter(function(r){ return r.scope==="rx" && ev(r.when, vars); }).sort(cmp);
  var byDrug={}, order=[], avoid={}, avoidOrder=[], matched={}, unavailable=[];
  recs.forEach(function(r){
    (r.drugs||[]).forEach(function(cid){
      if(r.drug_when && r.drug_when[cid] && !ev(r.drug_when[cid], vars)) return;
      members(cid).forEach(function(did){
        var info=drugInfo(did); if(!info) return;
        if(isContra(r)){ if(!avoid[did]){ avoid[did]={ id:did, label:info.label_ko, rec:r.id, grade:r.grade, loe:r.loe, text:r.text }; avoidOrder.push(did); } return; }
        matched[cid]=true; matched[did]=true;
        if(!byDrug[did]){ byDrug[did]={ id:did, label:info.label_ko, label_en:info.label_en, cls:info.cls||cid, clsLabel:classLabel(info.cls||cid),
          rec:r.id, grade:r.grade, grade_norm:gradeOf(r).norm, loe:r.loe, tier:r.tier, recs:[], kr_available:info.kr_available, kr_note:info.kr_note||null, brand:info.brand26||info.brand||null };
          order.push(did); }
        if(byDrug[did].recs.indexOf(r.id)<0) byDrug[did].recs.push(r.id);
      });
    });
  });
  var drugs=[];
  order.forEach(function(did){
    var d=byDrug[did]; if(avoid[did]) return;
    if(!d.kr_available){ unavailable.push(d); return; }
    d.reimb=reimbVerdict26(did, vars);
    d.dose=doseFor(did, vars);
    d.safety=D.SAFETY.filter(function(s){ return s.applies && (s.applies.indexOf(did)>=0 || s.applies.indexOf(d.cls)>=0) && ev(s.when, vars); })
      .map(function(s){ return { id:s.id, lv:s.lv, msg:tpl(s.msg) }; });
    drugs.push(d);
  });
  /* matched는 최종 처방 후보(금기·미허가 제외) 기준으로 재계산 */
  matched={}; drugs.forEach(function(d){ matched[d.id]=true; matched[d.cls]=true; });
  var flags=D.SAFETY.filter(function(s){ return !s.applies && ev(s.when, vars, matched); })
    .concat(D.SAFETY.filter(function(s){ return s.applies && ev(s.when, vars) && s.applies.some(function(a){ return matched[a]; }); }))
    .map(function(s){ return { id:s.id, lv:s.lv, msg:tpl(s.msg) }; });
  var conflicts=D.CONFLICTS.filter(function(c){ return ev(c.when, vars); }).map(function(c){ return c.id; });
  var errata={};
  drugs.forEach(function(d){ var s=D.DRUG_STATUS[d.id]; if(s&&s.err) errata[s.err]=true; (d.reimb.errata||[]).forEach(function(e){ errata[e]=true; }); });
  unavailable.forEach(function(d){ var s=D.DRUG_STATUS[d.id]; if(s&&s.err) errata[s.err]=true; });
  var targets=drugs.filter(function(d){ return d.dose; }).map(function(d){ return { k:"dose", drug:d.id, label:d.label, start:d.dose.start, target:d.dose.target, note:d.dose.note }; });
  var kp=vars.kshf&&V1D.PHENOTYPES[vars.kshf];
  return { vars:vars, phenotype26:vars.pheno26, kshf:vars.kshf, kshfLabel:kp?kp.label+' ('+kp.lvef+')':null, band4149:vars.band4149, impef:vars.impef,
    recs:recs.map(function(r){ return r.id; }), drugs:drugs, avoid:avoidOrder.map(function(x){ return avoid[x]; }), unavailable:unavailable,
    targets:targets, flags:flags, conflicts:conflicts, errata:Object.keys(errata).sort() };
}

/* 정문: recommend(patient) → {drugs[], targets[], flags[]} (+확장) */
function recommend(p){
  var a=applyHf2026(p);
  var legacy=null; try{ legacy=V1E.recommend(p||{}); }catch(e){ legacy=null; }
  return { drugs:a.drugs, targets:a.targets,
    flags:a.flags.concat(a.conflicts.map(function(id){ return { id:id, lv:"conflict", msg:id }; })),
    phenotype26:a.phenotype26, kshf:a.kshf, kshfLabel:a.kshfLabel, recs:a.recs, avoid:a.avoid, unavailable:a.unavailable,
    conflicts:a.conflicts, errata:a.errata, legacy:legacy };
}

return { context:context, applyHf2026:applyHf2026, reimbVerdict26:reimbVerdict26, recommend:recommend, members:members, drugInfo:drugInfo, doseFor:doseFor, tpl:tpl, evalWhen:ev };
})(HF26, HF_DATA, HF_ENGINE, WhenDSL);

/* 정문 노출 (v1 HF 객체는 그대로) */
var APP = {
  recommend: function(p){ return HF26_ENGINE.recommend(p); },
  modules: { hf: { v1: (typeof HF!=="undefined"?HF:null), v2: HF26_ENGINE, data: HF26 } },
  REGISTRY_VERSION: "hf-v2-2026.11",
  localMap: HF26.LOCAL_MAP
};
