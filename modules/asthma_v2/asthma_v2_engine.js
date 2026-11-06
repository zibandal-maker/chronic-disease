/* ===================================================================
   ASTHMA v2 ENGINE — applyAsthma2026 · reimbVerdict26 · recommend(정문)
   의존: ASTHMA26(DATA) · v1 ASTHMA_DATA / ASTHMA_DRUG_INDEX(읽기 전용) · WhenDSL. 임상 수치 리터럴 없음(TH 참조).
   v1 R-CHECK(rcEvaluate)는 체크리스트 화면용으로 그대로 두고, 환자 입력 기반 급여 판정은 여기서 별도 수행.
   =================================================================== */
var ASTHMA26_ENGINE = (function(D, V1, IDX, W){
"use strict";
var TH = D.TH;
var BOOL_DEFAULTS = ["smoker","pregnant","aerd","allergic_rhinitis","nasal_polyps","adherence_ok","technique_ok","night_waking","g4_day","g4_night","g4_reliever","g4_limit",
  "stable_3m","initial_severe","act_up","act_down","is_followup","low_lung","perennial_sens","bio_eval","ae_on","ae_drowsy","ae_silent","ae_anaphylaxis","ae_talk_words",
  "on_ics","on_laba","on_lama","on_saba","on_ltra","on_theo","on_biologic","on_ics_laba","on_formoterol_ics","on_controller",
  "ics_low","ics_medium","ics_high","ics_medhigh","ics_unknown","control_ng","risk_any","ocs_dep","high_ics_laba","bio_on",
  "sx_lt2m","sx_ge2m","sx_most","sx_daily","mart_shown","lama_shown","lama_reimb_ok","has_fev1","has_eos","has_feno","has_pef","has_age"];
var NUM_DEFAULT_ZERO = ["exac","hosp"];

function num(x){ if(x===null||x===undefined||x==="") return null; var n=Number(x); return isFinite(n)?n:null; }
function truthy(x){ return x===true||x==="true"||x===1||x==="1"; }
function tpl(msg){ return String(msg==null?"":msg).replace(/\{TH\.(\w+)\}/g, function(_,k){ return TH[k]; }); }
function ev(expr, vars){ return W.eval(expr, { vars:vars, has:function(x){ return !!vars[x]; }, matched:function(){ return false; } }); }
function byId(arr, id){ for(var i=0;i<arr.length;i++){ if(arr[i].id===id) return arr[i]; } return null; }

/* ---------- ID 해석 ---------- */
var DRUG_CLS = (function(){ var m={}, k;
  for(k in IDX){ if(Object.prototype.hasOwnProperty.call(IDX,k)) m[IDX[k].id]=IDX[k].cls; }
  for(k in D.DRUG_ADD){ if(!m[k]) m[k]=D.DRUG_ADD[k].cls; }
  for(k in D.BIO_CLASS){ m[k]=D.BIO_CLASS[k]; }
  return m; })();
function drugCls(did){ return DRUG_CLS[did]||null; }
function clsParent(c){ var a=D.CLASS_ADD[c]; return a&&a.parent ? a.parent : null; }
function productById(id){ return byId(D.PRODUCTS, id); }
function productClasses(pr){ var set={}; (pr.ingredients||[]).forEach(function(did){ var c=drugCls(did); if(c){ set[c]=true; var p=clsParent(c); if(p) set[p]=true; } }); return Object.keys(set).sort(); }
function hasCls(pr, c){ return productClasses(pr).indexOf(c)>=0; }
function isFormoterolIcs(pr){ return hasCls(pr,"class:ics") && (pr.ingredients||[]).indexOf("drug:formoterol")>=0; }

/* ---------- 권고 ---------- */
function recById(id){ return byId(D.REC_2026, id); }
function recView(id){ var r=recById(id); if(!r) return null; var gl=D.GUIDELINES[r.guideline], rs=D.REC_SYSTEMS[gl.recsys];
  var g=rs.grade[r.grade], l=r.loe?rs.loe[r.loe]:null;
  return { id:r.id, guideline:r.guideline, gl:gl.short, layer:gl.layer, cite:r.cite, grade:r.grade, grade_ko:g.ko, rank:g.rank,
    loe:r.loe||null, loe_ko:l?l.ko:null, loe_rank:l?l.rank:null, text:tpl(r.text), note:r.note?tpl(r.note):null, kr_unavailable:!!r.kr_unavailable }; }
function cmpRec(a,b){ if(a.rank!==b.rank) return a.rank-b.rank; var la=a.loe_rank==null?Infinity:a.loe_rank, lb=b.loe_rank==null?Infinity:b.loe_rank; return la-lb; }

/* ---------- ICS 용량 단계 ---------- */
function icsRow(key){ return byId(D.ICS_DOSE.map(function(r){ return { id:r.key, r:r }; }), key); }
function autoIcsLevel(prods, puffs){
  var icsProds=prods.filter(function(pr){ return hasCls(pr,"class:ics"); });
  if(!icsProds.length) return { level:"none" };
  if(icsProds.length>1) return { level:null, why:"ICS 함유 제품이 2개 이상 — 용량 단계를 직접 선택" };
  var pr=icsProds[0], ic=pr.ics||{};
  if(!ic.ug) return { level:null, why:pr.label+": 함량이 여러 개 — 용량 단계를 직접 선택" };
  var row=icsRow(ic.key); if(!row) return { level:null, why:pr.label+": 용량표 행 없음" };
  var R=row.r;
  if(R.fixed){ var f=R.fixed[String(ic.ug)]; if(f==="low_med") return { level:null, why:pr.label+": KATRD 표 4-2에서 저·중간용량 공통 함량 — 직접 선택", ambiguous:true }; return { level:f||null, daily:ic.ug, row:R.label }; }
  var n = ic.once ? 1 : puffs; if(n===null) return { level:null, why:"1일 흡입 횟수를 입력하면 자동 산정" };
  var daily=ic.ug*n; var lv = daily<=R.low_max ? "low" : (daily<=R.med_max ? "medium" : "high");
  return { level:lv, daily:daily, row:R.label };
}

/* ---------- 컨텍스트 ---------- */
function context(p){
  p=p||{}; var v={}, k;
  for(k in TH){ if(Object.prototype.hasOwnProperty.call(TH,k)) v["TH."+k]=TH[k]; }
  BOOL_DEFAULTS.forEach(function(b){ v[b]=false; });
  D.INPUTS.concat(D.AE_INPUTS).forEach(function(it){
    if(it.type==="number"){ var n=num(p[it.k]); if(n!==null) v[it.k]=n; }
    else if(it.type==="chip"){ v[it.k]=truthy(p[it.k]); }
    else if(it.type==="select"){ v[it.k] = p[it.k] ? String(p[it.k]) : it.opts[0][0]; }
  });
  NUM_DEFAULT_ZERO.forEach(function(key){ if(v[key]===undefined) v[key]=0; });
  v.has_age=v.age!==undefined; v.has_fev1=v.fev1!==undefined; v.has_eos=v.eos!==undefined; v.has_feno=v.feno!==undefined; v.has_pef=v.pef!==undefined;
  if(v.eos_start===undefined && v.eos!==undefined) v.eos_start=v.eos;
  ["lt2m","ge2m","most","daily"].forEach(function(s){ v["sx_"+s] = p.sx_freq===s; });
  v.sx_given = !!p.sx_freq;
  v.ae_talk_words = v.ae_talk==="words";
  /* 제품 → 계열 */
  var prods=(p.products||[]).map(productById).filter(Boolean);
  prods.forEach(function(pr){ var cs=productClasses(pr);
    if(cs.indexOf("class:ics")>=0) v.on_ics=true; if(cs.indexOf("class:laba")>=0) v.on_laba=true; if(cs.indexOf("class:lama")>=0) v.on_lama=true;
    if(cs.indexOf("class:saba")>=0) v.on_saba=true; if(cs.indexOf("class:ltra")>=0) v.on_ltra=true; if(cs.indexOf("class:methylxanthine")>=0) v.on_theo=true;
    if(pr.kind==="biologic") v.on_biologic=true; if(isFormoterolIcs(pr)) v.on_formoterol_ics=true; });
  v.n_biologic = prods.filter(function(pr){ return pr.kind==="biologic"; }).length;
  v.on_ics_laba = v.on_ics && v.on_laba;
  v.on_controller = v.on_ics || v.on_ltra || v.on_theo || v.on_lama || v.on_biologic;
  /* ICS 단계 */
  var auto=autoIcsLevel(prods, v.ics_puffs_day===undefined?null:v.ics_puffs_day);
  var lvl = v.ics_level==="auto" ? auto.level : v.ics_level;
  if(v.ics_level==="auto" && v.on_ics && !lvl) v.ics_unknown=true;
  v.ics_lv = lvl || (v.on_ics ? "unknown" : "none");
  v.ics_auto = auto;
  v.ics_low = lvl==="low"; v.ics_medium = lvl==="medium"; v.ics_high = lvl==="high"; v.ics_medhigh = v.ics_medium || v.ics_high;
  v.high_ics_laba = v.on_ics_laba && v.ics_high;
  /* 조절·위험 */
  v.g4_n = ["g4_day","g4_night","g4_reliever","g4_limit"].filter(function(x){ return v[x]; }).length;
  v.control = v.g4_n===0 ? "well" : (v.g4_n<=TH.g4_partly_max ? "partly" : "uncontrolled");
  v.control_ng = v.g4_n>0 || v.sx_most || v.sx_daily || v.night_waking;
  if(v.has_fev1 && v.fev1 < TH.fev1_risk_lt) v.low_lung=true;
  v.risk_any = v.exac>=TH.r_exac_1 || v.low_lung || v.smoker || v.hosp>=TH.r_exac_1;
  v.ocs_dep = v.ocs_mg!==undefined && v.ocs_months!==undefined && v.ocs_mg>=TH.r_ocs_mg && v.ocs_months>=TH.r_ocs_months;
  return { vars:v, prods:prods };
}

/* ---------- 급여 ---------- */
/* 미충족 항목은 실패한 가지에서만 수집(통과한 OR 가지의 형제 실패는 제외) */
function evalGate(node, vars){
  if(node.op){
    var kids=node.conds.map(function(c){ return evalGate(c, vars); });
    var pass = node.op==="AND" ? kids.every(function(x){return x.pass;}) : kids.some(function(x){return x.pass;});
    var na = node.op==="AND" && kids.some(function(k){ return k.leaf && k.applies && !k.pass; });
    var pool = node.op==="OR" && kids.some(function(k){ return !k.na; }) ? kids.filter(function(k){ return !k.na; }) : kids;
    var miss=[]; if(!pass) pool.forEach(function(k){ if(!k.pass) miss=miss.concat(k.missing); });
    return { op:node.op, label:node.label?tpl(node.label):null, pass:pass, children:kids, missing:miss, na:na };
  }
  var ok=!!ev(node.when, vars), txt=tpl(node.txt);
  return { leaf:true, txt:txt, pass:ok, applies:!!node.applies, missing:ok?[]:[txt] };
}
function reimbVerdict26(prodId, vars){
  var pr=productById(prodId); if(!pr) return null;
  if(pr.kr_available===false) return { product:prodId, status:"na", rule:null, notice:[], missing:[], notes:[tpl(pr.label_note)], tree:null };
  var r=D.REIMB_2026[pr.reimb]; if(!r) return { product:prodId, status:"general", rule:null, notice:pr.notice||[], missing:[], notes:[], tree:null };
  var scope={}, k; for(k in vars){ if(Object.prototype.hasOwnProperty.call(vars,k)) scope[k]=vars[k]; }
  scope.prod_age_min = pr.age_min_th ? TH[pr.age_min_th] : 0;
  var res={ product:prodId, rule:r.id, title:r.title, notice:(pr.notice&&pr.notice.length?pr.notice:(r.notice||[])), missing:[], notes:(r.notes||[]).map(tpl), tree:null, err:r.err||null };
  if(r.fixed){ res.status=r.fixed; }
  else {
    res.tree=evalGate(r.gate, scope); res.missing=res.tree.missing.filter(function(m, i, arr){ return arr.indexOf(m)===i; });
    if(res.tree.pass){ res.status="ok"; res.missing=[]; }
    else res.status="unmet";
    if(res.status==="unmet" && r.fallback && ev(r.fallback.when, scope)){ res.status=r.fallback.status; res.notes.unshift(tpl(r.fallback.note)); }
  }
  return res;
}

/* ---------- 제품 뷰 ---------- */
function prodView(pr, vars, current){
  var amin = pr.age_min_th ? TH[pr.age_min_th] : null;
  return { id:pr.id, label:pr.label, kind:pr.kind, device:pr.device||null, drugs:(pr.ingredients||[]).slice(), classes:productClasses(pr), tags:(pr.tags||[]).slice(),
    current:!!current, age_ok: amin===null || !vars.has_age || vars.age>=amin, age_min:amin, label_note:pr.label_note?tpl(pr.label_note):null,
    mart:pr.mart?{ label_max:pr.mart.label_max, label_exc:pr.mart.label_exc||null, kr_max:(byId(D.MART.rows, pr.mart.kr_row)||{}).kr_max||null }:null,
    err:pr.err||null, layers:[], recs:[], roles:[], reimb:reimbVerdict26(pr.id, vars) };
}
function productsForTags(tags){ return D.PRODUCTS.filter(function(pr){ return pr.kind!=="biologic" && pr.kr_available!==false && (pr.tags||[]).some(function(t){ return tags.indexOf(t)>=0; }); }); }

/* ---------- 단계 ---------- */
function stepRow(n){ for(var i=0;i<D.STEP_TABLE.length;i++){ if(D.STEP_TABLE[i].step===n) return D.STEP_TABLE[i]; } return null; }
function initialStep(v){ for(var i=0;i<D.INIT_ORDER.length;i++){ var s=stepRow(D.INIT_ORDER[i]); if(ev(s.init_when, v)) return s.step; } return null; }
function currentStep(v){
  if(v.on_formoterol_ics && v.use_mode==="air" && !v.on_lama && !v.on_biologic){ return D.CURRENT_STEP_AIR; }
  for(var i=0;i<D.CURRENT_STEP.length;i++){ if(ev(D.CURRENT_STEP[i].when, v)) return D.CURRENT_STEP[i].step; } return null;
}
function clampStep(n){ var lo=D.STEP_TABLE[0].step, hi=D.STEP_TABLE[D.STEP_TABLE.length-1].step; return Math.max(lo, Math.min(hi, n)); }

/* ---------- 생물학제제 ---------- */
function phenotype(v){
  var allergic = v.perennial_sens && v.ige!==undefined && v.ige>=TH.ige_oma_ge;
  var eosin = v.has_eos && v.eos>=TH.eos_il5_ge;
  var t2 = (v.has_eos && v.eos>=TH.eos_t2_ge) || (v.has_feno && v.feno>=TH.feno_t2_ge) || allergic;
  var t2low = v.has_eos && v.eos<TH.eos_t2_ge && (!v.has_feno || v.feno<TH.feno_t2_ge) && !v.perennial_sens && !v.nasal_polyps;
  return { allergic:allergic, eosinophilic:eosin, t2:t2, t2_low:t2low };
}
var BIO_MATCH = { "class:anti_ige":"allergic", "class:anti_il5":"eosinophilic", "class:anti_il5r":"eosinophilic", "class:il4_13_biologic":"t2", "class:anti_tslp":"any" };

/* ---------- 핵심 ---------- */
function applyAsthma2026(p){
  p=p||{};
  var c=context(p), v=c.vars, cur=c.prods, curIds=cur.map(function(x){ return x.id; });
  var mode = v.ae_on ? "exacerbation" : (!v.on_controller ? "initial" : "followup");
  var stepInit = initialStep(v), stepCur = v.on_controller ? currentStep(v) : null;
  var action=null, target=null, useInit=false;
  if(mode==="initial" || (mode==="exacerbation" && !v.on_controller)){ target=stepInit; useInit=true; action="start"; }
  else {
    var up = v.control_ng || v.exac>=TH.r_exac_1;
    var down = !up && v.stable_3m && stepCur>D.STEP_TABLE[0].step;
    action = up ? "step_up" : (down ? "step_down" : "maintain");
    target = clampStep(stepCur + (up?1:(down?-1:0)));
    if(up && stepCur===D.STEP_TABLE[D.STEP_TABLE.length-1].step) action="severe";
  }
  v.step_view = target===null ? Infinity : target; v.cur_step = stepCur===null ? 0 : stepCur;
  v.act_up = action==="step_up" || action==="severe"; v.act_down = action==="step_down"; v.is_followup = mode!=="initial" && v.on_controller;

  /* 레지멘 */
  var regimens=[], row=target!==null?stepRow(target):null;
  function regView(t, track, kind){
    var recs=(t.recs||[]).map(recView).filter(Boolean).sort(cmpRec);
    return { track:track, kind:kind, txt:t.txt, tags:t.tags, ics:t.ics||null,
      kr:recs.filter(function(r){ return r.guideline==="gl:asthma:katrd-2026"; }), gina:recs.filter(function(r){ return r.guideline==="gl:asthma:gina-2026"; }),
      products:productsForTags(t.tags).map(function(pr){ return pr.id; }) };
  }
  if(row){
    var t1 = useInit && row.t1_init ? row.t1_init : row.t1, t2 = useInit && row.t2_init ? row.t2_init : row.t2;
    regimens.push(regView(t1, "t1", "preferred")); regimens.push(regView(t2, "t2", "alternative"));
  }
  if(ev(D.SWITCH_MART_WHEN, v)){ var sw=regView(stepRow(stepCur).t1, "switch", "switch"); sw.step=stepCur; regimens.unshift(sw); }
  var other = row ? (row.other||[]).map(recView).filter(Boolean).sort(cmpRec) : [];
  var advice=D.ADVICE.filter(function(a){ return ev(a.when, v); }).map(function(a){ return recView(a.rec); });

  /* 제품 집계 */
  var byProd={}, order=[];
  function addProd(prId, info){
    var pr=productById(prId); if(!pr) return;
    if(!byProd[prId]){ byProd[prId]=prodView(pr, v, curIds.indexOf(prId)>=0); order.push(prId); }
    var o=byProd[prId];
    (info.recs||[]).forEach(function(r){ if(r && o.recs.map(function(x){ return x.id; }).indexOf(r.id)<0) o.recs.push(r); if(r && o.layers.indexOf(r.guideline)<0) o.layers.push(r.guideline); });
    if(info.role && o.roles.indexOf(info.role)<0) o.roles.push(info.role);
  }
  cur.forEach(function(pr){ addProd(pr.id, { role:"current" }); });
  regimens.forEach(function(rg){ rg.products.forEach(function(id){ addProd(id, { recs:rg.kr.concat(rg.gina), role:rg.track }); }); });

  /* LAMA·MART 노출 */
  v.mart_shown = (v.on_formoterol_ics && v.use_mode==="mart") || regimens.some(function(r){ return r.tags.indexOf("mart")>=0; });
  v.lama_shown = regimens.some(function(r){ return r.tags.indexOf("lama")>=0 || r.tags.indexOf("triple")>=0; });
  v.lama_reimb_ok = order.some(function(id){ var d=byProd[id]; return (d.tags.indexOf("triple")>=0 || d.tags.indexOf("lama")>=0) && d.reimb && d.reimb.status==="ok"; });

  /* 생물학제제 */
  v.bio_on = !!ev(D.BIO_ON_WHEN, v);
  var ph=phenotype(v), biologics=null;
  if(v.bio_on){
    var cands=D.PRODUCTS.filter(function(pr){ return pr.kind==="biologic"; }).map(function(pr){
      var bv=prodView(pr, v, curIds.indexOf(pr.id)>=0);
      var bcls=D.BIO_CLASS[pr.ingredients[0]], need=BIO_MATCH[bcls];
      bv.target_cls=bcls; bv.target_label=(D.CLASS_ADD[bcls]||{}).label||bcls;
      bv.pheno_match = need==="any" ? true : !!ph[need];
      bv.recs = D.REC_2026.filter(function(r){ return (r.drugs||[]).indexOf(pr.ingredients[0])>=0; }).map(function(r){ return recView(r.id); });
      bv.recs.unshift(recView("asthma:rec26:kr_s5_pref"));
      bv.layers=["gl:asthma:katrd-2026","gl:asthma:gina-2026"];
      bv.pred = D.BIO_PRED[pr.ingredients[0]] ? tpl(D.BIO_PRED[pr.ingredients[0]]) : null;
      return bv; });
    var st=D.STATUS_ORDER;
    cands.sort(function(a,b){ var sa=st[a.reimb.status], sb=st[b.reimb.status]; if(sa!==sb) return sa-sb; if(a.pheno_match!==b.pheno_match) return a.pheno_match?-1:1; return 0; });
    biologics={ phenotype:ph, candidates:cands, eval:tpl(D.BIO_EVAL), common:{ not_met:tpl(D.BIO_COMMON26.not_met), combo:tpl(D.BIO_COMMON26.combo), switch_txt:tpl(D.BIO_COMMON26.switch), lama_warn:tpl(D.BIO_COMMON26.lama_warn) } };
    cands.forEach(function(bv){ if(!byProd[bv.id]){ byProd[bv.id]=bv; order.push(bv.id); } else { byProd[bv.id].pheno_match=bv.pheno_match; } if(byProd[bv.id].roles.indexOf("biologic")<0) byProd[bv.id].roles.push("biologic"); });
  }

  /* 급성 악화 */
  var ae=null;
  if(v.ae_on){
    var sev=null; for(var i=0;i<D.AE_SEVERITY.length;i++){ if(ev(D.AE_SEVERITY[i].when, v)){ sev=D.AE_SEVERITY[i]; break; } }
    var aeIds=D.REC_2026.filter(function(r){ return r.scope==="ae"; }).map(function(r){ return r.id; }).filter(function(id){
      if(id==="asthma:rec26:g_ae_icsform") return sev.id==="mild_mod";
      if(id==="asthma:rec26:g_ae_mg") return sev.id!=="mild_mod";
      if(id==="asthma:rec26:g_ae_epi") return v.ae_anaphylaxis;
      if(id==="asthma:rec26:g_ae_ipra") return sev.id!=="mild_mod";
      return true; });
    var aeRecs=aeIds.map(recView);
    if(v.ae_anaphylaxis){ aeRecs.sort(function(a,b){ return (a.id==="asthma:rec26:g_ae_epi"?-1:0)-(b.id==="asthma:rec26:g_ae_epi"?-1:0); }); }
    var dispo=D.AE_DISPO.filter(function(d){ return ev(d.when, v); }).map(function(d){ return { id:d.id, txt:tpl(d.txt) }; });
    ae={ severity:{ id:sev.id, label:sev.label, txt:tpl(sev.txt) }, kr:aeRecs.filter(function(r){ return r.guideline==="gl:asthma:katrd-2026"; }), gina:aeRecs.filter(function(r){ return r.guideline==="gl:asthma:gina-2026"; }), dispo:dispo };
  }

  var drugs=order.map(function(id){ var d=byProd[id]; d.recs.sort(cmpRec); d.best=d.recs.length?d.recs[0].rank:Infinity; return d; });
  var unavailable=drugs.filter(function(d){ return d.reimb && d.reimb.status==="na"; });

  /* 상충 */
  var conflicts=D.CONFLICTS.filter(function(cf){ return ev(cf.when, v); }).map(function(cf){ return { id:cf.id, x:cf.x, gl:tpl(cf.gl), reimb:tpl(cf.reimb), kind:cf.kind||"gl_reimb" }; });

  /* 플래그 */
  var flags=[];
  if(v.has_age && v.age<TH[D.META.flow_age_min_th]) flags.push({ id:"asthma:flag:age_flow", lv:"info", msg:"플로우는 만 "+TH[D.META.flow_age_min_th]+"세 이상 기준 — 소아(6–11세) 근거는 도서관 참조" });
  if(!v.sx_given && mode==="initial") flags.push({ id:"asthma:flag:need_sx", lv:"info", msg:"증상 빈도를 선택하면 KATRD 표 4-4 초기 단계가 정해집니다" });
  if(v.on_saba && !v.on_controller) flags.push({ id:"asthma:flag:saba_only", lv:"warn", msg:"SABA 단독 — KATRD 비권고·GINA A: 사망·응급 이용 증가. ICS 포함 치료로 시작" });
  if(v.ics_unknown) flags.push({ id:"asthma:flag:ics_level", lv:"info", msg:"ICS 용량 단계를 확정하지 못함 — "+(v.ics_auto&&v.ics_auto.why?v.ics_auto.why:"직접 선택")+" (급여 판정이 ICS 단계에 의존)" });
  if((action==="step_up"||action==="severe") && (!v.adherence_ok || !v.technique_ok)) flags.push({ id:"asthma:flag:check_first", lv:"warn", msg:"단계 올리기 전 점검 미완료("+(!v.technique_ok?"흡입 기술 ":"")+(!v.adherence_ok?"순응도":"")+") — "+recView("asthma:rec26:kr_check").text });
  if(v.on_formoterol_ics && v.use_mode==="mart" && cur.some(function(pr){ return hasCls(pr,"class:laba") && !isFormoterolIcs(pr); })) flags.push({ id:"asthma:flag:mart_mix", lv:"warn", msg:D.MART.note });
  if(v.exac>=TH.ocs_courses_refer) flags.push({ id:"asthma:flag:refer", lv:"warn", msg:"1년 전신 스테로이드 "+v.exac+"회(≥"+TH.ocs_courses_refer+") — 전문가 의뢰 신호 · 연 누적 OCS ≥"+TH.ocs_cum_g_lo+"–"+TH.ocs_cum_g_hi+" g은 미조절 지표" });
  if(v.ocs_dep) flags.push({ id:"asthma:flag:ocs_long", lv:"warn", msg:"장기 OCS — 부신기능·골다공증 평가, 감량 시 부신 기능 주의(중단 후 6개월 스트레스 보충 고려, KATRD)" });
  if(v.aerd) flags.push({ id:"asthma:flag:aerd", lv:"info", msg:"AERD — NSAID 회피, LTRA는 1차부터 급여 인정(고시 2023-184)" });
  if(v.pregnant) flags.push({ id:"asthma:flag:pregnancy", lv:"info", msg:"임신: 조절 안 된 천식의 위험이 약제 위험보다 큼 — ICS·기관지확장제 유지(KATRD 7단원)" });
  if(v.bio_on && !v.on_lama && v.has_age && v.age>=TH.r_age_adol) flags.push({ id:"asthma:flag:bio_lama", lv:"warn", msg:tpl(D.BIO_COMMON26.lama_warn) });
  if(v.bio_on && v.ocs_dep && v.has_eos) flags.push({ id:"asthma:flag:ocs_eos", lv:"info", msg:"OCS 유지 중에는 혈중 호산구·FeNO가 억제됨 — T2-low로 보여도 표현형 판정에 주의(가능하면 감량 후 재측정)" });
  if(v.bio_on && !v.has_eos) flags.push({ id:"asthma:flag:need_eos", lv:"info", msg:"혈중 호산구(12개월 내 최고)를 입력하세요 — IL-5·IL-4R 급여 경로가 호산구로 갈립니다" });
  if(v.n_biologic>1) flags.push({ id:"asthma:flag:bio_combo", lv:"warn", msg:tpl(D.BIO_COMMON26.combo) });
  if(v.has_feno || v.bio_on) flags.push({ id:"asthma:flag:feno_pay", lv:"info", msg:"FeNO 검사 비급여(현장 확인) — 두필루맙 급여 기준에는 FeNO ≥"+TH.r_feno_25+" ppb가 쓰임" });
  unavailable.forEach(function(u){ flags.push({ id:"asthma:flag:kr_unavailable", lv:"info", msg:u.label+" — 국내 미허가" }); });

  /* 정정 */
  var errata={};
  drugs.forEach(function(d){ if(d.err) errata[d.err]=true; });
  if(v.bio_on && !v.on_lama) errata["asthma:err:AE1"]=true;
  if(v.ae_on) errata["asthma:err:AE12"]=true;
  if(mode==="initial") errata["asthma:err:AE18"]=true;
  var errOrder=D.ERRATA.map(function(e){ return e.id; });
  var errList=Object.keys(errata).sort(function(a,b){ return errOrder.indexOf(a)-errOrder.indexOf(b); });

  /* 목표 */
  var targets=[ { id:"asthma:target:control", label:"증상 조절: GINA 4문항 0개 · ACT ≥"+TH.act_good_ge+"(변화 ≥"+TH.act_mcid+"점 유의)" },
    { id:"asthma:target:reassess", label: mode==="initial" ? "시작 후 "+TH.reassess_wk_lo+"–"+TH.reassess_wk_hi+"주 재평가(진단·반응)" : "조절 양호 "+TH.stepdown_months+"개월 유지 시 단계 내림 검토" } ];
  if(v.ae_on){ targets.unshift({ id:"asthma:target:spo2_gina", label:"GINA 2026: SpO₂ <"+TH.spo2_gina_start_lt+"%에서 산소 시작, 상한 "+TH.spo2_gina_hi+"%" });
    targets.unshift({ id:"asthma:target:spo2_kr", label:"KATRD 2026: SpO₂ "+TH.spo2_kr_lo+"–"+TH.spo2_kr_hi+"% 유지" }); }
  if(biologics) targets.push({ id:"asthma:target:bio_eval", label:biologics.eval });

  return { vars:v, mode:mode, action:action, step:{ initial:stepInit, current:stepCur, target:target, use_init:useInit },
    control:{ level:v.control, n:v.g4_n }, ics:{ level:v.ics_lv, auto:v.ics_auto },
    regimens:regimens, other:other, advice:advice.filter(Boolean), biologics:biologics, ae:ae, drugs:drugs, unavailable:unavailable,
    conflicts:conflicts, flags:flags, targets:targets, errata:errList };
}

/* 정문: recommend(patient) → {drugs[], targets[], flags[]} (+확장) */
function recommend(p){
  var a=applyAsthma2026(p);
  return { drugs:a.drugs.map(function(d){ return { id:d.id, label:d.label, kind:d.kind, drugs:d.drugs, classes:d.classes, roles:d.roles, current:d.current, layers:d.layers, reimb:d.reimb?d.reimb.status:null, best:d.best }; }),
    targets:a.targets, flags:a.flags.concat(a.conflicts.map(function(cf){ return { id:cf.id, lv:"conflict", msg:cf.x }; })),
    mode:a.mode, action:a.action, step:a.step, control:a.control, regimens:a.regimens, biologics:a.biologics, ae:a.ae, conflicts:a.conflicts, errata:a.errata };
}

return { context:context, applyAsthma2026:applyAsthma2026, reimbVerdict26:reimbVerdict26, recommend:recommend, recView:recView, productById:productById,
  productClasses:productClasses, autoIcsLevel:autoIcsLevel, tpl:tpl, evalWhen:ev, drugCls:drugCls };
})(ASTHMA26, ASTHMA_DATA, ASTHMA_DRUG_INDEX, WhenDSL);

/* 정문 노출 — v1 APP(화면 상태)은 재선언하지 않고 속성만 가산 */
APP.recommend = function(p){ return ASTHMA26_ENGINE.recommend(p); };
APP.modules = { asthma: { v1: { data:ASTHMA_DATA, rcEvaluate:rcEvaluate, rcVerdict:rcVerdict, drugIndex:ASTHMA_DRUG_INDEX }, v2: ASTHMA26_ENGINE, data: ASTHMA26 } };
APP.REGISTRY_VERSION = ASTHMA26.META.version;
APP.localMap = ASTHMA26.LOCAL_MAP;
APP.asthma26 = { input:{ products:[] }, result:null, simCase:null, open:{} };
