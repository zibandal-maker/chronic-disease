/* ===================================================================
   liver HBV v2 — ENGINE 레이어 (가산, v1 클로저 함수 무수정)
   값은 HBV26.* DATA만 읽는다. when 평가는 공용 WhenDSL.
   =================================================================== */
(function(){
  var D=HBV26, RS=D.REC_SYSTEMS["recsys:kasl"];

  /* ---- REC 색인: 원문(89) + 플로우 오버레이 ---- */
  function gradeFields(g){
    var ev=g.charAt(0), st=g.charAt(1);
    return { grade_original:g, grade_system:"recsys:kasl", loe:ev, strength:st,
      grade_norm:RS.normByStrength[st], grade_rank:(parseInt(st,10)-1)*RS.strengthStep+RS.rankBase[ev] };
  }
  var REC={}, BY_BLOCK={};
  HBV26_REC_RAW.forEach(function(r){
    var o={ id:r.id, guideline:"gl:liver:kasl-hbv-2026", block:"R"+(r.block<10?"0":"")+r.block, item:r.item, text_original:r.t, status:"active", when:null };
    var gf=gradeFields(r.g); for(var k in gf) o[k]=gf[k];
    var ov=D.REC_FLOW[r.id]; if(ov){ for(var k2 in ov) o[k2]=ov[k2]; }
    REC[r.id]=o; (BY_BLOCK[o.block]=BY_BLOCK[o.block]||[]).push(o);
  });
  Object.keys(D.REC_FLOW).forEach(function(id){ if(!REC[id]) throw new Error("REC_FLOW 미정의 ID: "+id); });
  D.TX_ORDER.forEach(function(id){ if(!REC[id]) throw new Error("TX_ORDER 미정의 ID: "+id); });
  D.REC=REC; D.REC_BY_BLOCK=BY_BLOCK;

  function yes(v){ return v===true || v==="yes"; }
  function num(v){ return (v===""||v==null||isNaN(v))?null:+v; }

  /* ---- 입력 정규화 + 컨텍스트 ---- */
  function context(p){
    var TH=D.TH, v={};
    var dna=num(p.dna), alt=num(p.alt), ast=num(p.ast), age=num(p.age), egfr=num(p.egfr);
    var undet = yes(p.dna_undetected);
    var detected = undet ? false : (dna==null ? null : dna>0);
    if(undet) dna=0;
    var phase=null;
    if(detected===false) phase="nonviremic";
    else if(detected){ if(dna>TH.high_gt) phase="high"; else if(dna>=TH.low_lt) phase=(p.hbeag==="pos"?"mod_eag_pos":(p.hbeag==="neg"?"mod_eag_neg":"mod_eag_unknown")); else phase="low"; }
    var sexKnown = p.sex==="male"||p.sex==="female";
    var uln = sexKnown ? TH.alt_uln[p.sex] : Math.min(TH.alt_uln.male, TH.alt_uln.female);
    var level = p.immuno_risk || D.IMMUNO_RISK_MAP[p.immuno||"no"] || null;
    v.eag=p.hbeag||"unknown"; v.dna=dna; v.dna_detected=!!detected; v.dna_known=(detected!==null);
    v.phase=phase||"unknown"; v.cirr=p.cirr||"none"; v.hcc=yes(p.hcc);
    v.alt=alt; v.ast=ast; v.age=age; v.egfr=egfr;
    v.alt_gt_uln = alt!=null && alt>uln; v.age_gt = age!=null && age>TH.risk_age_gt;
    v.fib_f2 = p.fib==="f2plus"; v.fib_unknown = (p.fib==null||p.fib==="unknown");
    v.risk_any = v.alt_gt_uln || v.age_gt || v.fib_f2;
    v.hcc_age = age!=null && age>=TH.hcc_surv_age_ge; v.age_peds = age!=null && age<TH.peds_age_lt;
    v.renal = egfr!=null && egfr<TH.renal_impair_egfr_lt; v.esrd = egfr!=null && egfr<TH.esrd_egfr_lt;
    v.bone = yes(p.bone); v.renal_bone_risk = yes(p.renal_bone_risk);
    v.na_experienced = p.resist==="lam" || yes(p.na_exp);
    v.preg = yes(p.preg); v.preg_plan = yes(p.preg_plan);
    v.hbsag_loss_x2 = yes(p.hbsag_loss_x2);
    v.immuno = p.immuno||"no"; v.hbsag_pos = p.hbsag!=="neg"; v.anti_hbc_pos = p.anti_hbc==="pos" || (v.immuno==="ritux" && p.anti_hbc!=="neg");
    v.risk_high = level==="high"; v.risk_mod = level==="mod" || level==="modhigh"; v.risk_modhigh = level==="high"||level==="mod"||level==="modhigh"; v.risk_low = level==="low";
    v.low_lt=TH.low_lt; v.high_gt=TH.high_gt; v.vertical_ge=TH.vertical_ge;
    v.eag_pos_reimb_ge=D.REIMB_TH.eag_pos_dna_ge;
    v.vertical = v.preg && dna!=null && dna>=TH.vertical_ge;
    v.treat=false; v.proph=false; v.tdf_candidate=false; v.decision="none"; v.reimb_tx="none";
    return { vars:v, sexKnown:sexKnown, uln:uln, level:level };
  }
  function ev(expr, ctx){ return WhenDSL.eval(expr, { vars:ctx.vars }); }
  function sortRecs(a){ return a.sort(function(x,y){ return x.grade_rank-y.grade_rank; }); }

  /* ---- 급여 판정 (고시 제2025-177호, DATA 재구현) ---- */
  function reimbVerdict(p, ctxIn){
    var ctx=ctxIn||context(p), v=ctx.vars, R=D.REIMB_TH, out={};
    var altmax = (v.alt==null && v.ast==null) ? null : Math.max(v.alt==null?-Infinity:v.alt, v.ast==null?-Infinity:v.ast);
    if(v.cirr!=="none" || v.hcc){
      out.tx = v.dna_detected ? { status:"ok", rule:"hbv:reimb:cirr_hcc", reason:"간경변·간세포암 + HBV-DNA 양성" }
                              : { status:"fail", rule:"hbv:reimb:cirr_hcc", reason:"간경변·간세포암은 HBV-DNA 양성이어야 급여" };
    } else if(v.eag!=="pos" && v.eag!=="neg"){
      out.tx = { status:"fail", rule:"hbv:reimb:naive_noncirr", reason:"HBeAg 미입력" };
    } else {
      var thr = v.eag==="pos" ? R.eag_pos_dna_ge : R.eag_neg_dna_ge;
      var dnaOk = v.dna!=null && v.dna>=thr;
      if(!dnaOk) out.tx = { status:"fail", rule:"hbv:reimb:naive_noncirr", reason:"HBeAg "+(v.eag==="pos"?"양성":"음성")+" HBV-DNA ≥"+thr.toLocaleString()+" 필요" };
      else if(altmax!=null && altmax>=R.alt_hi_ge) out.tx = { status:"ok", rule:"hbv:reimb:naive_noncirr", reason:"HBV-DNA ≥"+thr.toLocaleString()+" + AST 또는 ALT ≥"+R.alt_hi_ge };
      else if(altmax!=null && altmax>=R.alt_mid_ge) out.tx = v.fib_f2 ? { status:"ok", rule:"hbv:reimb:naive_alt_mid_fib", reason:"AST/ALT 40–80 + A2/F2 입증(생검·노829·도163)" }
                                                                : { status:"need_proof", rule:"hbv:reimb:naive_alt_mid_fib", reason:"AST/ALT 40–80: 생검 또는 노829 Fibroscan·도163 MRE로 A2/F2 이상 입증 시 급여" };
      else out.tx = { status:"fail", rule:"hbv:reimb:naive_noncirr", reason:"AST 또는 ALT ≥"+R.alt_hi_ge+" 미충족" };
    }
    if(v.preg) out.vertical = v.vertical ? { status:"ok", rule:"hbv:reimb:vertical", reason:"HBsAg(+) 임부 HBV-DNA ≥"+R.vertical_dna_ge.toLocaleString()+" — TDF/TAF, 24–32주 시작~출산 후 최대 12주" }
                                         : { status:"fail", rule:"hbv:reimb:vertical", reason:"수직감염 예방 급여는 HBV-DNA ≥"+R.vertical_dna_ge.toLocaleString() };
    if(v.immuno!=="no"){
      var M=R.proph_mo;
      if(v.risk_low) out.proph = { status:"fail", rule:"hbv:reimb:proph_low", reason:"저위험군 예방요법은 전액본인부담" };
      else if(v.immuno==="hsct" && !v.hbsag_pos && v.anti_hbc_pos && !v.dna_detected) out.proph = { status:"ok", rule:"hbv:reimb:proph_hsct", reason:"조혈모세포이식 HBsAg(−)·DNA(−)·anti-HBc(+): 총 "+M.hsct_total+"개월" };
      else if(v.immuno==="ritux" && v.anti_hbc_pos) out.proph = { status:"ok", rule:"hbv:reimb:proph_ritux", reason:"anti-HBc(+) + rituximab: 요법 중 + 종료 후 "+M.ritux+"개월" };
      else if((v.hbsag_pos||v.dna_detected) && v.risk_modhigh) out.proph = { status:"ok", rule:"hbv:reimb:proph_modhigh", reason:"HBsAg(+)/DNA(+) + 중등도·고위험: 요법 중 + 종료 후 "+M.modhigh+"개월" };
      else out.proph = { status:"fail", rule:"hbv:reimb:proph_low", reason:"고시 3항 요건(HBsAg+/DNA+ 중등도·고위험, rituximab, HSCT) 미충족 → 전액본인부담" };
    }
    return out;
  }

  /* ---- 메인 판정 ---- */
  function applyHbv2026(p){
    var ctx=context(p), v=ctx.vars, matched=[], gatesHit=[], flags=[];
    // 1) 치료 판정 (TX_ORDER 우선순위 — 간경변·HCC가 phase보다 먼저)
    var txRec=null, decision="none";
    for(var i=0;i<D.TX_ORDER.length;i++){ var r=REC[D.TX_ORDER[i]]; if(ev(r.when,ctx)){ txRec=r; decision=r.action; if(r.actionIf && ev(r.actionIf.expr,ctx)) decision=r.actionIf.then; break; } }
    if(!txRec && v.phase==="nonviremic") decision="monitor";
    v.decision=decision; v.treat=(decision==="treat"||decision==="consider");
    if(txRec) matched.push(txRec);
    // 2) 예방 시작 판정
    ["hbv:rec:kasl2026:hcc_2","hbv:rec:kasl2026:immuno_2a","hbv:rec:kasl2026:immuno_3a","hbv:rec:kasl2026:immuno_3b","hbv:rec:kasl2026:hsct_4","hbv:rec:kasl2026:hsct_5"].forEach(function(id){
      var r=REC[id]; if(ev(r.when,ctx)){ v.proph=true; if(matched.indexOf(r)<0) matched.push(r); } });
    // 3) 급여
    var reimb=reimbVerdict(p, ctx); v.reimb_tx=reimb.tx.status;
    // 4) 약제 후보 (agent·immuno_2b 교집합 → GATE)
    var lists=[];
    Object.keys(D.REC_FLOW).forEach(function(id){ var r=REC[id]; if(r.drugs && ev(r.when,ctx)){ lists.push(r); if(matched.indexOf(r)<0) matched.push(r); } });
    var cand=[];
    if(lists.length){
      cand=lists[0].drugs.slice();
      lists.slice(1).forEach(function(r){ var nx=cand.filter(function(d){ return r.drugs.indexOf(d)>=0; }); if(nx.length) cand=nx; });
    }
    D.GATES.forEach(function(g){ if(ev(g.when,ctx)){ g.drugs.forEach(function(d){ var k=cand.indexOf(d); if(k>=0){ cand.splice(k,1); gatesHit.push({ gate:g.id, drug:d, reason:g.reason }); } }); } });
    v.tdf_candidate = cand.indexOf("drug:tenofovir_df")>=0;
    // 5) 나머지 REC (모니터·중단·수직·예방 유지·소아)
    Object.keys(D.REC_FLOW).forEach(function(id){ var r=REC[id]; if(!r.drugs && D.TX_ORDER.indexOf(id)<0 && matched.indexOf(r)<0 && ev(r.when,ctx)) matched.push(r); });
    // 6) 약제 객체
    var drugs=cand.map(function(id,k){
      var srcRec=null; for(var j=lists.length-1;j>=0;j--){ if(lists[j].drugs.indexOf(id)>=0){ srcRec=lists[j]; break; } }
      var route = v.treat ? reimb.tx : (v.vertical ? reimb.vertical : (v.proph ? reimb.proph : null));
      var st = route ? route.status : "n/a", why = route ? route.reason : "";
      var amin=D.REIMB_TH.age_min[id];
      if(amin!=null && v.age!=null && v.age<amin){ st="fail"; why="급여 투여연령 만 "+amin+"세 이상(고시 1-다)"; }
      if(id==="drug:besifovir" && v.cirr==="decomp"){ st="fail"; why="BSV 비대상성 급여 불인정"; }
      var rd=D.RENAL_DOSE[id], renalDose=null;
      if(rd && v.egfr!=null){ for(var q=0;q<rd.rows.length;q++){ if(v.egfr>=rd.rows[q].min){ renalDose=rd.rows[q].label; break; } } }
      return { id:id, rank:k+1, rec:srcRec?srcRec.id:null, grade_norm:srcRec?srcRec.grade_norm:null, grade:srcRec?srcRec.grade_original:null,
               reimb:{ status:st, rule:route?route.rule:null, reason:why }, renalDose:renalDose };
    });
    // 7) 상충·노트·erratum
    var conflicts=D.CONFLICTS.filter(function(c){ return ev(c.when,ctx); });
    if(!ctx.sexKnown && v.alt!=null && v.alt>D.TH.alt_uln.female && v.alt<=D.TH.alt_uln.male) flags.push({ type:"note", ref:"sex_missing_uln", text:"성별 미입력 — ALT "+v.alt+"는 여성 기준(30) 초과·남성 기준(34) 이하: 성별 입력 필요" });
    if(v.phase==="mod_eag_unknown") flags.push({ type:"note", ref:"eag_missing", text:"HBeAg 미입력 — 중등도 바이러스혈증(양성/음성) 구분 불가" });
    if(!v.dna_known) flags.push({ type:"note", ref:"dna_missing", text:"HBV DNA 수치 입력 또는 '미검출' 선택 필요" });
    var errata=[];
    if(v.cirr==="comp" && v.dna_detected && v.dna<D.TH.low_lt) errata.push("hbv:erratum:E5");
    if(v.egfr!=null && v.egfr<50 && v.egfr>=D.TH.esrd_egfr_lt) errata.push("hbv:erratum:E6");
    if(v.cirr==="none" && !v.hcc && v.alt!=null && v.alt>=2*D.TH.alt_uln.female && v.alt<2*D.TH.alt_uln.male) errata.push("hbv:erratum:E1");
    matched=sortRecs(matched.filter(function(r,i,a){ return a.indexOf(r)===i; }));
    return { ctx:v, phase:v.phase==="unknown"?null:("hbv:phase2026:"+v.phase), decision:decision, txRec:txRec?txRec.id:null,
             recs:matched.map(function(r){ return r.id; }), drugs:drugs, gates:gatesHit, reimb:reimb,
             conflicts:conflicts.map(function(c){ return c.id; }), errata:errata, notes:flags,
             targets:D.TARGETS.filter(function(t){ return !t.when || ev(t.when,ctx); }).map(function(t){ return t.id; }) };
  }

  /* ---- 정문 계약 ---- */
  function recommend(p){
    var a=applyHbv2026(p||{});
    var flags=[];
    if(a.phase) flags.push({ type:"phase", ref:a.phase });
    flags.push({ type:"treat", value:a.decision, rec:a.txRec });
    ["tx","vertical","proph"].forEach(function(k){ if(a.reimb[k]) flags.push({ type:"reimb", route:k, ref:a.reimb[k].rule, status:a.reimb[k].status }); });
    a.conflicts.forEach(function(c){ flags.push({ type:"conflict", ref:c }); });
    a.gates.forEach(function(g){ flags.push({ type:"gate", ref:g.gate, drug:g.drug }); });
    a.recs.forEach(function(id){ var r=REC[id]; if(r.kind) flags.push({ type:r.kind, rec:id }); });
    a.errata.forEach(function(e){ flags.push({ type:"erratum", ref:e }); });
    a.notes.forEach(function(n){ flags.push({ type:"note", ref:n.ref }); });
    return { drugs:a.drugs.map(function(d){ return { id:d.id, rank:d.rank, rec:d.rec, grade_norm:d.grade_norm, reimb:{ status:d.reimb.status, rule:d.reimb.rule } }; }),
             targets:a.targets.map(function(id){ var t=D.TARGETS.filter(function(x){ return x.id===id; })[0]; return { lab:t.lab, op:t.op, ref:t.id }; }),
             flags:flags };
  }

  D.context=context; D.reimbVerdict=reimbVerdict; D.applyHbv2026=applyHbv2026; D.recommend=recommend;
  window.APP = window.APP || {};
  APP.modules = APP.modules || {};
  APP.modules.hbv = { recommend:recommend, applyHbv2026:applyHbv2026, reimbVerdict:function(p){ return reimbVerdict(p); } };
  APP.recommend = function(p){ var m=(p&&p.module)||"hbv"; if(!APP.modules[m]) throw new Error("unknown module "+m); return APP.modules[m].recommend(p); };
  APP.REGISTRY_VERSION = D.META.registry; APP.localMap = D.LOCAL_MAP;
})();
