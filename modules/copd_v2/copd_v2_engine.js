/* ===================================================================
   COPD v2 ENGINE — applyCopd2026 · reimbVerdict26 · recommend(정문)
   의존: COPD26(DATA) · v1 CD(읽기 전용) · WhenDSL. 임상 수치 리터럴 없음(TH 참조).
   v1 CD.copdRecommend는 호출만 — KATRD 2024 레이어(그림 3-3·3-4)로 재사용하고 legacy로 반환.
   =================================================================== */
var COPD26_ENGINE = (function(D, CD, W){
"use strict";
var BOOL_DEFAULTS = ["smoker","exSmoker","asthmaHx","chronic_bronchitis","sx_uncontrolled","asthma_concurrent","pneumonia_recurrent",
  "ics_inappropriate","ics_no_response","ics_ae","mycobacterial_hx","ae_on","ae_purulent","ae_prior_culture","ae_mv",
  "kr_followup_addon","kr_triple","gold_triple","triple_reimb_ok","bio_shown","dupi_shown","azithro_shown","roflu_gold_shown","roflu_gold_met","roflu_kr_met","roflu_reimb_ok",
  "laba_ics_considered","pcv_due","ics_in_plan"];
var KR_HIGH = "copd:group:high", KR_LOW = "copd:group:low";
var CLS = { lama:"class:lama", laba:"class:laba", ics:"class:ics" };

function num(x){ if(x===null||x===undefined||x==="") return null; var n=Number(x); return isFinite(n)?n:null; }
function truthy(x){ return x===true||x==="true"||x===1||x==="1"; }
function tpl(msg){ return String(msg==null?"":msg).replace(/\{TH\.(\w+)\}/g, function(_,k){ return D.TH[k]; }); }
function ev(expr, vars){ return W.eval(expr, { vars:vars, has:function(x){ return !!vars[x]; }, matched:function(){ return false; } }); }
function setKey(classes){ return classes.slice().sort().join("|"); }
function isTriple(classes){ return classes.indexOf(CLS.ics)>=0 && classes.indexOf(CLS.laba)>=0 && classes.indexOf(CLS.lama)>=0; }
function recById(id){ for(var i=0;i<D.REC_2026.length;i++){ if(D.REC_2026[i].id===id) return D.REC_2026[i]; } return null; }
function gradeInfo(r){ var gl=D.GUIDELINES[r.guideline], rs=D.REC_SYSTEMS[gl.recsys]; var g=rs.grade[r.grade], l=rs.loe[r.loe];
  return { grade_ko:g.ko, norm:g.norm, rank:g.rank, loe_ko:l?l.ko:r.loe, loe_rank:l?l.rank:null, short:gl.short, layer:gl.layer }; }
function recView(id){ var r=recById(id); if(!r) return null; var g=gradeInfo(r);
  return { id:r.id, guideline:r.guideline, gl:g.short, cite:r.cite, grade:r.grade, grade_ko:g.grade_ko, norm:g.norm, rank:g.rank, loe:r.loe, loe_ko:g.loe_ko, loe_raw:r.loe_raw||null, loe_rank:g.loe_rank, text:tpl(r.text), note:r.note?tpl(r.note):null }; }
function cmpRec(a,b){ if(a.rank!==b.rank) return a.rank-b.rank; var la=a.loe_rank==null?Infinity:a.loe_rank, lb=b.loe_rank==null?Infinity:b.loe_rank; return la-lb; }

/* ---------- 컨텍스트 ---------- */
function context(p){
  p=p||{}; var v={}, k, TH=D.TH;
  for(k in TH){ if(Object.prototype.hasOwnProperty.call(TH,k)) v["TH."+k]=TH[k]; }
  BOOL_DEFAULTS.forEach(function(b){ v[b]=false; });
  D.V1_INPUT_KEYS.num.forEach(function(key){ var n=num(p[key]); if(n!==null) v[key]=n; });
  D.V1_INPUT_KEYS.bool.forEach(function(key){ v[key]=truthy(p[key]); });
  D.INPUTS.forEach(function(it){
    if(it.type==="number"){ var n=num(p[it.k]); if(n!==null) v[it.k]=n; }
    else if(it.type==="chip"){ v[it.k]=truthy(p[it.k]); }
    else if(it.type==="select"){ if(p[it.k]) v[it.k]=String(p[it.k]); }
  });
  D.AECOPD_INPUTS.forEach(function(it){
    if(it.type==="chip") v[it.k]=truthy(p[it.k]);
    else v[it.k] = p[it.k] ? String(p[it.k]) : it.opts[0][0];
  });
  if(v.ae_on && !p.ae_severity) v.ae_severity = D.AECOPD_INPUTS[0].opts[1][0];
  v.has_fev1 = v.fev1!==undefined; v.has_eos = v.eos!==undefined; v.has_age = v.age!==undefined;
  v.exac_mod_yr = v.modExac!==undefined ? v.modExac : 0;
  v.exac_hosp_yr = v.hospExac!==undefined ? v.hospExac : 0;
  v.exac_yr = v.exac_mod_yr + v.exac_hosp_yr;
  v.has_exac = v.exac_yr >= TH.gold26_e_exac_ge;
  v.sym_high = (v.cat!==undefined && v.cat >= TH.gold_cat_ge) || (v.mmrc!==undefined && v.mmrc >= TH.gold_mmrc_ge);
  for(var i=0;i<D.GROUP26.length;i++){ if(ev(D.GROUP26[i].when, v)){ v.group26_id=D.GROUP26[i].id; v.group26=D.GROUP26[i].id.split(":").pop(); break; } }
  v.kr_group = CD.KOREAN_GROUP.classify(v.modExac, v.hospExac);
  v.kr_high = v.kr_group===KR_HIGH; v.kr_low = v.kr_group===KR_LOW;
  var cur = CD.currentClasses(p.products||[]);
  v.on_lama=!!cur[CLS.lama]; v.on_laba=!!cur[CLS.laba]; v.on_ics=!!cur[CLS.ics];
  v.on_bd = v.on_lama || v.on_laba; v.on_laba_lama = v.on_laba && v.on_lama; v.on_laba_ics = v.on_laba && v.on_ics;
  v.on_laba_ics_only = v.on_laba_ics && !v.on_lama;
  v.tx = !v.on_bd && !v.on_ics ? "none" : (v.on_laba_lama && v.on_ics ? "triple" : (v.on_laba_lama ? "dual" : (v.on_laba_ics ? "laba_ics" : (v.on_bd && !v.on_ics ? "mono" : "other"))));
  v.tx_none = v.tx==="none";
  v.ics_withdraw_reason = v.pneumonia_recurrent || v.ics_inappropriate || v.ics_no_response || v.ics_ae;
  (p.vaccines||[]).forEach(function(id){ v["done_"+String(id).split(":").pop()]=true; });
  ["influenza","covid19","pcv13","pcv15","pcv20","pcv21","ppsv23","rsv","tdap","zoster"].forEach(function(s){ if(v["done_"+s]===undefined) v["done_"+s]=false; });
  v.pcv_complete = v.done_pcv20 || v.done_pcv21 || (v.done_pcv15 && v.done_ppsv23);
  return v;
}

/* ---------- 제품 ---------- */
function productClasses(pr){
  var dids = pr.v1_brand ? ((CD.INHALER_PRODUCTS.filter(function(x){ return x.brand===pr.v1_brand; })[0]||{}).ingredients||[]) : (pr.ingredients||[]);
  var set={}; dids.forEach(function(did){ var d=CD.DRUGS[did]||D.DRUG_ADD[did]; if(d) set[d.cls]=true; });
  return { drugs:dids, classes:Object.keys(set).sort() };
}
function productById(id){ for(var i=0;i<D.PRODUCTS.length;i++){ if(D.PRODUCTS[i].id===id) return D.PRODUCTS[i]; } return null; }
function productByDrug(did){ return D.PRODUCTS.filter(function(pr){ return !pr.v1_brand && (pr.ingredients||[]).indexOf(did)>=0; })[0]||null; }
function productLabel(pr){ return pr.v1_brand || pr.label || pr.id; }
function productsForSet(classes){
  var key=setKey(classes);
  return D.PRODUCTS.filter(function(pr){ return pr.v1_brand && setKey(productClasses(pr).classes)===key; });
}

/* ---------- 급여 ---------- */
function evalGate(node, vars, out){
  if(node.op){
    var kids=node.conds.map(function(c){ return evalGate(c, vars, out); });
    var pass = node.op==="AND" ? kids.every(function(x){return x.pass;}) : kids.some(function(x){return x.pass;});
    return { op:node.op, label:node.label?tpl(node.label):null, pass:pass, children:kids };
  }
  var ok=!!ev(node.when, vars);
  if(!ok) out.push(tpl(node.txt));
  return { leaf:true, txt:tpl(node.txt), pass:ok };
}
function reimbVerdict26(prodId, vars){
  var pr=productById(prodId); if(!pr) return null;
  if(pr.kr_available===false) return { product:prodId, status:"na", rule:null, missing:[], notes:[], tree:null };
  var r=D.REIMB_2026[pr.reimb]; if(!r) return { product:prodId, status:"general", rule:null, missing:[], notes:[], tree:null };
  var res={ product:prodId, rule:r.id, notice:r.notice||[], title:r.title, missing:[], notes:(r.notes||[]).map(tpl), tree:null, err:r.err||null, opinion:false };
  if(r.fixed){ res.status=r.fixed; }
  else {
    res.tree=evalGate(r.gate, vars, res.missing);
    if(res.tree.pass){
      res.status="ok"; res.missing=[];
      if(r.require && !ev(r.require.when, vars)){ res.status="cond"; res.notes.unshift(tpl(r.require.txt)); }
      if(r.opinion_when && ev(r.opinion_when, vars)) res.opinion=true;
    } else res.status="unmet";
    if(res.status==="unmet" && r.fallback && ev(r.fallback.when, vars)){ res.status=r.fallback.status; res.notes.unshift(tpl(r.fallback.note)); }
  }
  if(pr.note) res.notes.push(pr.note);
  return res;
}

/* ---------- GOLD 2026 경로 ---------- */
function goldPath(vars){
  if(vars.tx_none) return "init";
  if(vars.on_laba_ics_only) return "laba_ics";
  if(vars.trait==="exac") return "exac";
  if(vars.trait==="dyspnea") return vars.has_exac ? "exac" : "dyspnea";
  if(vars.has_exac) return "exac";
  if(vars.sym_high) return "dyspnea";
  return "maintain";
}
function curClasses(vars){ var c=[]; if(vars.on_ics) c.push(CLS.ics); if(vars.on_laba) c.push(CLS.laba); if(vars.on_lama) c.push(CLS.lama); return c.sort(); }

/* ---------- 핵심 ---------- */
function applyCopd2026(p){
  p=p||{};
  var vars=context(p), TH=D.TH;
  var base=null; try{ base=CD.copdRecommend(p); }catch(e){ base=null; }
  var clin = base ? base._clinical : null;
  var krStep = clin ? (clin.followup || clin.initial) : null;
  var krReg = krStep ? krStep.regimen : null;
  var krMap = krReg ? D.REGIMEN_MAP[krReg] : null;
  vars.kr_followup_addon = !!(clin && clin.followup && clin.followup.addon);
  vars.kr_triple = !!(krMap && isTriple(krMap.classes));

  /* KATRD 레이어 */
  var krRecs = D.REC_2026.filter(function(r){ return r.guideline==="gl:copd:katrd-2024" && r.scope==="rx" && ev(r.when, vars); }).map(function(r){ return recView(r.id); });
  /* GOLD 레이어 */
  var path=goldPath(vars), algo=null;
  for(var i=0;i<D.ALGO26.length;i++){ var a=D.ALGO26[i]; if(a.path===path && ev(a.when, vars)){ algo=a; break; } }
  var goldClasses = algo && algo.regimen.length ? algo.regimen.slice().sort() : curClasses(vars);
  var goldKeep = !(algo && algo.regimen.length);
  vars.ics_in_plan = goldClasses.indexOf(CLS.ics)>=0 || !!(krMap && krMap.classes.indexOf(CLS.ics)>=0);
  vars.gold_triple = !goldKeep && isTriple(goldClasses) && vars.tx!=="triple";
  var goldRecs = (algo?algo.recs:[]).map(recView).filter(Boolean);
  var advice = D.REC_2026.filter(function(r){ return r.scope==="rx" && r.when!=="false" && !r.classes && !r.drugs && ev(r.when, vars) && (algo?algo.recs:[]).indexOf(r.id)<0; }).map(function(r){ return recView(r.id); }).sort(cmpRec);

  /* 부가요법 */
  var addons=[];
  (algo&&algo.addons||[]).forEach(function(aid){ var ad=D.ADDONS26[aid]; var met=ev(ad.when, vars);
    addons.push({ id:ad.id, layer:"gl:copd:gold-2026", drug:ad.drug, rec:recView(ad.rec), met:met, unmet:met?null:tpl(ad.unmet) }); });
  var krPde4 = krRecs.filter(function(r){ return r.id==="copd:rec26:kr_pde4"; })[0];
  var krMacro = krRecs.filter(function(r){ return r.id==="copd:rec26:kr_macrolide"; })[0];
  if(krPde4) addons.push({ id:"copd:addon26:kr_pde4", layer:"gl:copd:katrd-2024", drug:"drug:roflumilast", rec:krPde4, met:true, unmet:null });
  if(krMacro) addons.push({ id:"copd:addon26:kr_macrolide", layer:"gl:copd:katrd-2024", drug:"drug:azithromycin", rec:krMacro, met:!vars.smoker, unmet:vars.smoker?"현재 흡연자 — KATRD: 효과 적음":null });
  if(krMap && krMap.biologic) (krMap.bio_drugs||[]).forEach(function(did){ addons.push({ id:"copd:addon26:kr_bio", layer:"gl:copd:katrd-2024", drug:did, rec:null, met:true, unmet:null, kr_fig:"그림 3-4" }); });

  /* 레지멘 */
  var regimens=[];
  if(krMap) regimens.push({ layer:"gl:copd:katrd-2024", classes:krMap.classes.slice().sort(), label:D.REGIMEN_LABEL[setKey(krMap.classes)]||krReg, v1_regimen:krReg,
    step:clin.followup?"후속(그림 3-4)":"초기(그림 3-3)", note:(!clin.followup && !vars.tx_none)?"그림 3-3은 초기치료 기준 — 이미 유지치료 중이면 악화 발생 시 그림 3-4로 판단":null, recs:krRecs.filter(function(r){ var rr=recById(r.id); return rr.classes && setKey(rr.classes)===setKey(krMap.classes); }).sort(cmpRec) });
  regimens.push({ layer:"gl:copd:gold-2026", classes:goldClasses, keep:goldKeep, label:goldClasses.length?(D.REGIMEN_LABEL[setKey(goldClasses)]||setKey(goldClasses)):"—",
    path:path, algo:algo?algo.id:null, note:algo&&algo.note?tpl(algo.note):null, alt:algo&&algo.alt?algo.alt:null, recs:goldRecs.sort(cmpRec) });

  /* 제품 (drugs[]) */
  var byProd={}, order=[];
  function addProd(prId, info){
    if(!byProd[prId]){ var pr=productById(prId); var pc=productClasses(pr);
      byProd[prId]={ id:prId, label:productLabel(pr), drugs:pc.drugs, classes:pc.classes, layers:[], recs:[], current:(p.products||[]).indexOf(pr.v1_brand)>=0, kind:info.kind, addon:info.addon||null, met:info.met!==false, unmet:info.unmet||null };
      order.push(prId); }
    var o=byProd[prId]; if(o.layers.indexOf(info.layer)<0) o.layers.push(info.layer);
    (info.recs||[]).forEach(function(r){ if(r && o.recs.map(function(x){return x.id;}).indexOf(r.id)<0) o.recs.push(r); });
    if(info.met!==false) { o.met=true; o.unmet=null; }
  }
  regimens.forEach(function(rg){
    if(!rg.classes.length) return;
    var ps=productsForSet(rg.classes);
    if(rg.alt){ ps=ps.concat(productsForSet(rg.alt)); }
    ps.forEach(function(pr){ addProd(pr.id, { layer:rg.layer, recs:rg.recs, kind:"inhaler" }); });
  });
  addons.forEach(function(ad){ var pr=productByDrug(ad.drug); if(pr) addProd(pr.id, { layer:ad.layer, recs:ad.rec?[ad.rec]:[], kind:"addon", addon:ad.id, met:ad.met, unmet:ad.unmet }); });
  goldRecs.forEach(function(r){ var rr=recById(r.id); (rr.drugs||[]).forEach(function(did){ var pr=productByDrug(did); if(pr && pr.kr_available===false) addProd(pr.id, { layer:r.guideline, recs:[r], kind:"unavailable" }); }); });

  var drugs=[], unavailable=[];
  order.forEach(function(id){ var d=byProd[id]; d.recs.sort(cmpRec); d.best=d.recs.length?d.recs[0].rank:D.REC_SYSTEMS["recsys:grade"].grade.ungraded.rank;
    d.reimb=reimbVerdict26(id, vars);
    var did=d.drugs.length===1?d.drugs[0]:null; var st=did?D.DRUG_STATUS[did]:null; if(st&&st.label_scope) d.label_scope=st.label_scope;
    if(d.reimb && d.reimb.status==="na") unavailable.push(d); else drugs.push(d); });
  drugs.sort(function(a,b){ if(a.kind!==b.kind) return a.kind==="inhaler"?-1:1; if(a.met!==b.met) return a.met?-1:1; if(a.layers.length!==b.layers.length) return b.layers.length-a.layers.length; return a.best-b.best; });

  /* 상충 트리거용 파생 */
  var tripleProds = D.PRODUCTS.filter(function(pr){ return pr.v1_brand && isTriple(productClasses(pr).classes); });
  vars.triple_reimb_ok = tripleProds.some(function(pr){ var r=reimbVerdict26(pr.id, vars); return r && r.status==="ok"; });
  var bioDrugs = addons.filter(function(a){ return a.drug==="drug:dupilumab"||a.drug==="drug:mepolizumab"; });
  vars.bio_shown = bioDrugs.length>0;
  vars.dupi_shown = bioDrugs.some(function(a){ return a.drug==="drug:dupilumab"; });
  vars.azithro_shown = addons.some(function(a){ return a.drug==="drug:azithromycin"; });
  var gRoflu = addons.filter(function(a){ return a.id==="copd:addon26:roflu"; })[0];
  vars.roflu_gold_shown = !!gRoflu; vars.roflu_gold_met = !!(gRoflu && gRoflu.met);
  vars.roflu_kr_met = addons.some(function(a){ return a.id==="copd:addon26:kr_pde4"; });
  var daxas=productByDrug("drug:roflumilast"); var rv=daxas?reimbVerdict26(daxas.id, vars):null;
  vars.roflu_reimb_ok = !!(rv && (rv.status==="ok"||rv.status==="cond"));

  /* 백신 */
  var vaccines=D.VACC26.map(function(vc){
    var applies=ev(vc.when, vars), done=ev(vc.done_when, vars), plan=null;
    if(vc.plan){ for(var j=0;j<vc.plan.length;j++){ if(ev(vc.plan[j].when, vars)){ plan=tpl(vc.plan[j].txt); break; } } }
    return { id:vc.id, name:vc.name, applies:applies, done:done, due:applies&&!done, plan:plan,
      layers:vc.layers.map(function(l){ var gl=D.GUIDELINES[l.gl]; var rs=D.REC_SYSTEMS[gl.recsys||"recsys:grade"];
        return { gl:l.gl, short:gl.short, src_level:gl.src_level||"원문", txt:tpl(l.txt), grade_ko:(rs.grade[l.grade]||{}).ko||"", loe:l.loe||null, cite:l.cite||null }; }),
      label_note:vc.label_note?tpl(vc.label_note):null };
  });
  vars.pcv_due = vaccines.some(function(x){ return x.id==="vacc:pneumo" && x.due; });

  /* 악화 모드 */
  var aecopd = vars.ae_on ? D.REC_2026.filter(function(r){ return r.scope==="aecopd" && ev(r.when, vars); }).map(function(r){ return recView(r.id); }) : [];

  /* 상충 */
  var conflicts=D.CONFLICTS.filter(function(c){ return ev(c.when, vars); }).map(function(c){ return { id:c.id, x:c.x, gl:tpl(c.gl), reimb:tpl(c.reimb) }; });

  /* 플래그 */
  var flags=[];
  if(algo && algo.flag==="copd:flag:need_eos") flags.push({ id:"copd:flag:need_eos", lv:"info", msg:"혈중 호산구를 입력하세요 — GOLD 추적 악화 경로와 ICS·생물학제제 판단이 호산구 "+TH.eos_ics_min+"·"+TH.eos_ics_high+"으로 갈립니다" });
  drugs.forEach(function(d){ if(d.reimb && d.reimb.opinion && d.reimb.status==="ok") flags.push({ id:"copd:flag:opinion_form", lv:"warn", msg:d.label+": 악화 횟수 경로로 급여 — 투여소견서 필요" }); });
  if(vars.on_ics && vars.ics_withdraw_reason) flags.push({ id:"copd:flag:ics_withdraw", lv:"warn", msg:"ICS 철회 사유 해당 — 철회 검토 가능"+(vars.eos!==undefined && vars.eos>=TH.eos_ics_high?" (단 호산구 ≥"+TH.eos_ics_high+": 철회 후 악화 위험↑)":"") });
  if(vars.on_ics && vars.has_eos && vars.eos < TH.eos_ics_min) flags.push({ id:"copd:flag:ics_low_eos", lv:"warn", msg:"ICS 사용 중 + 호산구 <"+TH.eos_ics_min+": ICS 이득 적고 폐렴 위험 — LABA+LAMA 전환 고려" });
  if(vars.mycobacterial_hx && vars.ics_in_plan) flags.push({ id:"copd:flag:ics_myco", lv:"warn", msg:"결핵·NTM 병력: ICS 시작 반대 요인(Fig 3.10)" });
  if(vars.pneumonia_recurrent && vars.ics_in_plan) flags.push({ id:"copd:flag:ics_pneumonia", lv:"warn", msg:"반복 폐렴: ICS 시작 반대 요인(Fig 3.10)" });
  if(unavailable.length) unavailable.forEach(function(u){ flags.push({ id:"copd:flag:kr_unavailable", lv:"info", msg:u.label+" — "+(D.DRUG_STATUS[u.drugs[0]]||{}).kr_note }); });
  var oldGold = clin && clin.gold ? clin.gold.id.split(":").pop() : null;
  var groupChanged = oldGold && vars.group26 && oldGold!==vars.group26;

  /* 정정 */
  var errata={};
  drugs.forEach(function(d){ if(d.reimb && d.reimb.err) errata[d.reimb.err]=true; d.drugs.forEach(function(did){ var s=D.DRUG_STATUS[did]; if(s&&s.err) errata[s.err]=true; }); });
  if(groupChanged) errata["copd:err:CE9"]=true;
  if(vars.ae_on) errata["copd:err:CE12"]=true;
  if(vars.pcv_due) errata["copd:err:CE8"]=true;

  var targets=[ { id:"copd:target:caat", label:"증상 재평가: CAAT <"+TH.gold_cat_ge+" · mMRC <"+TH.gold_mmrc_ge }, { id:"copd:target:ltot", label:"장기산소요법 평가: PaO₂ ≤"+TH.ltot_pao2_le+" mmHg(폐성심·적혈구증가 시 <"+TH.ltot_pao2_cor_lt+")" } ];
  if(vars.ae_on) targets.unshift({ id:"copd:target:spo2", label:"산소요법 목표 SpO₂ "+TH.spo2_lo+"–"+TH.spo2_hi+"%" });

  return { vars:vars, group:{ kr:vars.kr_group, kr_label:CD.KOREAN_GROUP[vars.kr_group].label, gold26:vars.group26_id, gold26_label:vars.group26+"군", gold25:clin&&clin.gold?clin.gold.id:null, gold25_label:clin&&clin.gold?clin.gold.label:null, changed:!!groupChanged },
    path:path, algo:algo?algo.id:null, regimens:regimens, advice:advice, addons:addons, drugs:drugs, unavailable:unavailable, vaccines:vaccines, aecopd:aecopd,
    conflicts:conflicts, flags:flags, targets:targets, errata:Object.keys(errata).sort(function(a,b){ return Number(a.split("CE")[1])-Number(b.split("CE")[1]); }), legacy:base };
}

/* 정문: recommend(patient) → {drugs[], targets[], flags[]} (+확장) */
function recommend(p){
  var a=applyCopd2026(p);
  return { drugs:a.drugs.map(function(d){ return { id:d.id, label:d.label, drugs:d.drugs, classes:d.classes, layers:d.layers, met:d.met, reimb:d.reimb?d.reimb.status:null, best:d.best }; }),
    targets:a.targets, flags:a.flags.concat(a.conflicts.map(function(c){ return { id:c.id, lv:"conflict", msg:c.x }; })),
    group:a.group, regimens:a.regimens, advice:a.advice, vaccines:a.vaccines, aecopd:a.aecopd, conflicts:a.conflicts, errata:a.errata, legacy:a.legacy };
}

return { context:context, applyCopd2026:applyCopd2026, reimbVerdict26:reimbVerdict26, recommend:recommend, productClasses:productClasses, productById:productById, recView:recView, tpl:tpl, evalWhen:ev };
})(COPD26, CD, WhenDSL);

/* 정문 노출 — v1 APP(화면 상태)은 재선언하지 않고 속성만 가산 */
APP.recommend = function(p){ return COPD26_ENGINE.recommend(p); };
APP.modules = { copd: { v1: CD, v2: COPD26_ENGINE, data: COPD26 } };
APP.REGISTRY_VERSION = COPD26.META.version;
APP.localMap = COPD26.LOCAL_MAP;
APP.copd26 = { input:{}, result:null, sim:null, simCase:null };
