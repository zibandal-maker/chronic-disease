/* ===================================================================
   dyslipidemia v2 — UI 가산 (기존 렌더 함수는 래퍼로만 확장, 본문 무수정)
   =================================================================== */
(function(){
  /* ---- 1. 런타임 DATA 패치 (changelog: LIPID_V2_META) ---- */
  try{
    Object.keys(DRUG_UPDATES_2026).forEach(function(id){
      var d=DRUG_DB[id], u=DRUG_UPDATES_2026[id]; if(!d) return;
      ["name","brand","status","reimbNote","asOf"].forEach(function(k){ if(u[k]!=null) d[k]=u[k]; });
      if(u.indication) d.indication=u.indication;
      if(u.pearlsSupersede){ var rm=u.pearlsSupersede.map(function(x){return x.old;}); d.pearls=(d.pearls||[]).filter(function(x){ return rm.indexOf(x)<0; }); }
      if(u.pearlsAdd) d.pearls=(d.pearls||[]).concat(u.pearlsAdd);
    });
    if(typeof ACCAHA_2026!=="undefined" && ACCAHA_2026.lpa){ ACCAHA_2026.lpa.rows=ACCAHA_LPA_2026.rows; ACCAHA_2026.lpa.source=ACCAHA_LPA_2026.source; }
    Object.keys(SUPERSEDED_V1).forEach(function(k){ if(RECOMMENDATIONS[k]){ RECOMMENDATIONS[k].status="superseded"; RECOMMENDATIONS[k].superseded_by=SUPERSEDED_V1[k].superseded_by; } });
    for(var i=SOURCES_2026.length-1;i>=0;i--) SOURCES.unshift(SOURCES_2026[i]);
    if(typeof PCSK9_GATE_ASCVD!=="undefined"){ PCSK9_GATE_ASCVD.notice=NOTICES_LIPID[REIMB_SOURCE_2026.PCSK9_GATE_ASCVD.notice]; PCSK9_GATE_ASCVD.gate1_pretreat.basis="practice"; PCSK9_GATE_ASCVD.gate1_pretreat.basisNote=REIMB_SOURCE_2026.PCSK9_GATE_ASCVD.gate1_note; }
    if(typeof STATIN_REIMB!=="undefined") STATIN_REIMB.notice=NOTICES_LIPID[REIMB_SOURCE_2026.STATIN_REIMB.notice];
    if(typeof PCSK9_GATE_ASCVD!=="undefined"){ var H=PCSK9_GATE_ASCVD.gate3_eligibility.hrf, N={};
      Object.keys(H).forEach(function(k){ N[k]=H[k]; Object.keys(PCSK9_HRF_ADD_2026).forEach(function(ak){ if(PCSK9_HRF_ADD_2026[ak].after===k && !H[ak]) N[ak]={ label:PCSK9_HRF_ADD_2026[ak].label, erratum:PCSK9_HRF_ADD_2026[ak].erratum }; }); });
      Object.keys(PCSK9_HRF_ADD_2026).forEach(function(ak){ if(!N[ak]) N[ak]={ label:PCSK9_HRF_ADD_2026[ak].label }; });
      Object.keys(H).forEach(function(k){ delete H[k]; }); Object.keys(N).forEach(function(k){ H[k]=N[k]; }); }
  }catch(e){ if(window.console) console.warn("lipid v2 data patch", e); }

  function E(s){ return (typeof esc==="function")?esc(s):String(s==null?"":s); }
  function gradeChip(id){ var r=REC_2026[id]; if(!r) return "";
    var tone = r.grade_norm==="A"?"b-clin":(r.grade_norm==="X"?"b-pay":"b-care");
    return '<span class="badge '+tone+'" style="margin-right:4px">'+E(r.grade_original+(r.loe&&r.loe!=="pending"?" "+r.loe:""))+'</span>'; }
  function changeChip(id){ var r=REC_2026[id]; if(!r) return "";
    if(r.change==="new") return ' <span class="badge b-care">신설</span>';
    if(r.change==="upgraded") return ' <span class="badge b-care">상향</span>';
    if(r.change==="modified") return ' <span class="badge b-care">변경</span>';
    return ""; }
  function tgtText(ref,labId){ var v=lipidTargetValue(ref); if(!v) return ref;
    if(v.ldl!=null) return labId==="lab:non_hdl_c" ? "non-HDL-C <"+v.nonhdl : "LDL-C <"+v.ldl;
    return (v.op==="reduction>="?"기저 대비 ≥"+v.value+"% 감소":"LDL-C "+v.op+v.value); }

  /* ---- 2. 환자 입력 확장 (buildPatient 래퍼) ---- */
  var _buildPatient=buildPatient;
  buildPatient=function(){
    var p=_buildPatient(), f=STATE.flow, v=f.v26||{};
    p.hdlValue=f.hdl; p.age=f.age; p.egfr=f.egfr;
    if(f.hdl!=null) p.high_hdl=(f.hdl>=HDL_PROTECTIVE_2026.range[0] && f.hdl<=HDL_PROTECTIVE_2026.range[1]);
    p.comorbid=Object.assign({}, p.comorbid, { recurrent_stroke_highrisk:!!v.recurStroke });
    p.statinIntolerant=!!v.statinIntolerant; p.onStatin=!!v.onStatin; p.onEzetimibe=!!v.onEze;
    if(v.nonfasting) p.fasting=false;
    p.enh=v.enh||{}; if(v.lpa!=null){ p.lpa=v.lpa; p.lpaUnit=v.lpaUnit||"mg/dL"; } if(v.hscrp!=null) p.hscrp=v.hscrp;
    p.fh=!!v.fh; p.accVeryHigh=!!v.accVeryHigh;
    return p;
  };
  window.setV26=function(k,val,num){ var v=STATE.flow.v26=STATE.flow.v26||{}; v[k]=num?(val===""?null:parseFloat(val)):val; updateFlowResult(); };
  window.toggleV26=function(k){ var v=STATE.flow.v26=STATE.flow.v26||{}; v[k]=!v[k]; updateFlowResult(); };
  window.toggleV26Enh=function(k){ var v=STATE.flow.v26=STATE.flow.v26||{}; v.enh=v.enh||{}; v.enh[k]=!v.enh[k]; updateFlowResult(); };

  function chk(label,on,fn){ return '<label class="chip" style="cursor:pointer"><input type="checkbox" '+(on?'checked':'')+' onchange="'+fn+'" style="margin-right:4px">'+E(label)+'</label>'; }
  function renderInput2026(){
    var v=STATE.flow.v26||{}, en=v.enh||{};
    var h='<div class="card" id="v26Input"><h3>2026 개정 추가 입력 <span class="badge b-clin">진료지침 2026</span></h3>';
    h+='<div class="src">HDL은 위 입력값으로 2026 기준(60–100 mg/dL만 보호 −1) 자동 판정. 아래는 2026 신설 권고 판정용.</div>';
    h+='<div class="chips">'+chk("재발성 죽상경화성 뇌졸중 고위험", v.recurStroke, "toggleV26('recurStroke')")
      +chk("스타틴 불내성", v.statinIntolerant, "toggleV26('statinIntolerant')")
      +chk("스타틴 복용 중", v.onStatin, "toggleV26('onStatin')")+chk("에제티미브 복용 중", v.onEze, "toggleV26('onEze')")
      +chk("비공복 채혈", v.nonfasting, "toggleV26('nonfasting')")+chk("FH(확진·의심)", v.fh, "toggleV26('fh')")
      +chk("ACC 초고위험(해외 레이어)", v.accVeryHigh, "toggleV26('accVeryHigh')")+'</div>';
    h+='<details><summary>위험강화인자 11종 (중등도·저위험에서 목표 강화 판단)</summary><div class="dbody"><div class="chips">';
    Object.keys(RISK_ENHANCERS_2026).forEach(function(id){ var d=RISK_ENHANCERS_2026[id]; if(d.kind==="bool") h+=chk(d.label+(d.def?" ("+d.def+")":""), en[d.key], "toggleV26Enh('"+d.key+"')"); });
    h+='</div><div class="inp-row">';
    h+='<div class="inp-field"><label>Lp(a)</label><input type="number" inputmode="decimal" value="'+(v.lpa!=null?v.lpa:'')+'" oninput="setV26(\'lpa\',this.value,true)"></div>';
    h+='<div class="inp-field"><label>Lp(a) 단위</label><select onchange="setV26(\'lpaUnit\',this.value)"><option'+((v.lpaUnit||"mg/dL")==="mg/dL"?" selected":"")+'>mg/dL</option><option'+(v.lpaUnit==="nmol/L"?" selected":"")+'>nmol/L</option></select></div>';
    h+='<div class="inp-field"><label>hsCRP (mg/L)</label><input type="number" inputmode="decimal" value="'+(v.hscrp!=null?v.hscrp:'')+'" oninput="setV26(\'hscrp\',this.value,true)"></div>';
    h+='</div></div></details></div>';
    return h;
  }
  var _renderFlow=renderFlow;
  renderFlow=function(){ _renderFlow.apply(this,arguments); var r=document.getElementById("flowResult");
    if(r && !document.getElementById("v26Input")) r.insertAdjacentHTML("beforebegin", renderInput2026()); };

  /* ---- 3. 결과: v1 처치단계를 2026 표 2-6으로 표시 교체(엔진 출력은 그대로) ---- */
  var _renderResultCards=renderResultCards;
  renderResultCards=function(out){
    var o=Object.assign({}, out);
    try{ var a=applyLipid2026(buildPatient(), out);
      if(a.zone) o.treatment={ action:a.zone.value, label:a.zone.label+" — 2026 표 2-6 ("+a.zone.band+(a.zone.value==="soft"?", 목표 바로 아래 구간":"")+")" }; }catch(e){}
    return _renderResultCards(o);
  };

  function renderLipid2026Cards(){
    var p=buildPatient(), base=recommendLipid(p), a=applyLipid2026(p, base), out=recommend(p);
    var lab=RISK_LABEL_2026[base.riskStratum]||{};
    var h='<div class="card"><h3>2026 개정 판정 <span class="badge b-clin">이상지질혈증 진료지침 2026</span></h3>';
    h+='<div class="kp"><b>'+E(lab.label||"")+'</b> <span style="color:var(--ink-faint);font-size:12px">'+E(lab.sub||"")+'</span></div>';
    out.targets.forEach(function(t){ h+='<div class="kp">'+(t.optional?'<span class="badge b-care">선택 '+E(t.grade)+'</span> ':'')+E(t.op==="reduction>="?tgtText(t.ref):tgtText(t.ref,t.lab))+(t.rec?' '+gradeChip(t.rec):'')+'</div>'; });
    if(a.zone) h+='<div class="note" style="border-color:var(--clin)">표 2-6: <b>'+E(a.zone.label)+'</b> ('+E(a.zone.band)+')</div>';
    if(a.enhancers.length){ h+='<div class="note" style="border-color:var(--clin)"><b>위험강화인자 '+a.enhancers.length+'개</b>: '+a.enhancers.map(function(x){ return E(x.label+(x.value!=null?" "+x.value+" "+x.unit:"")); }).join(" · ")+'<br>→ '+E(REC_2026[RISK_ENHANCER_SCOPE_2026.rec[base.riskStratum]].text)+' '+gradeChip(RISK_ENHANCER_SCOPE_2026.rec[base.riskStratum])+'</div>'; }
    if(a.tgRetest) h+='<div class="note">비공복 TG ≥'+TG_BANDS_2026.nonfastingRetest+' → <b>공복 재검</b> 권고(2026: 500→400 하향)</div>';
    if(p.hdlValue!=null && p.hdlValue>HDL_PROTECTIVE_2026.range[1]) h+='<div class="note">HDL '+p.hdlValue+' &gt;100 → 2026 기준 보호인자 감산 없음</div>';
    h+='</div>';
    /* 권고 목록 (GL별 등급순) */
    var gen=function(id){ return /:(ldl_primary|nonhdl_secondary|statin_first|hdl_raise|diet_|ex_|ecig)/.test(id); };
    h+='<div class="card"><h3>적용 권고 <span class="badge b-clin">등급순</span></h3>';
    var core=a.recs.ksla2026.filter(function(id){ return !gen(id); });
    core.forEach(function(id){ var r=REC_2026[id]; h+='<div class="kp">'+gradeChip(id)+changeChip(id)+' '+E(r.text)+'</div>'; });
    var rest=a.recs.ksla2026.filter(gen);
    if(rest.length){ h+='<details><summary>공통·생활요법 권고 '+rest.length+'건</summary><div class="dbody">'; rest.forEach(function(id){ h+='<div class="kp">'+gradeChip(id)+changeChip(id)+' '+E(REC_2026[id].text)+'</div>'; }); h+='</div></details>'; }
    if(a.recs.acc2026.length){ h+='<details><summary>해외 레이어 ACC/AHA 2026 — '+a.recs.acc2026.length+'건</summary><div class="dbody">'; a.recs.acc2026.forEach(function(id){ h+='<div class="kp">'+gradeChip(id)+' '+E(REC_2026[id].text)+'</div>'; }); h+='</div></details>'; }
    h+='</div>';
    /* 급여 상충·노트 */
    if(a.conflicts.length || a.notes.length){
      h+='<div class="card"><h3>지침 ↔ 급여 <span class="badge b-pay">급여</span></h3>';
      a.conflicts.forEach(function(cid){ var c=CONFLICTS[cid]; var n=(c.reimb_ref&&NOTICES_LIPID[c.reimb_ref])?NOTICES_LIPID[c.reimb_ref]:null;
        h+='<details><summary>⚖ '+E(CONFLICT_TITLES_2026[cid]||cid)+'</summary><div class="dbody">';
        h+='<div class="kp"><b>지침</b> '+E(c.text_guideline)+'</div><div class="kp"><b>급여</b> '+E(c.text_reimb)+'</div>';
        if(n) h+='<div class="src"><a href="'+n.sourceUrl+'" target="_blank" rel="noopener">'+E(n.noticeNo)+' ('+E(n.effectiveDate)+')</a></div>';
        h+='</div></details>'; });
      a.notes.forEach(function(nid){ var nn=REIMB_NOTES_2026[nid]; h+='<div class="note" style="border-color:var(--pay)">'+E(nn.text)+'</div>'; });
      h+='</div>';
    }
    return h;
  }
  var _renderFlowResult=renderFlowResult;
  renderFlowResult=function(){ return _renderFlowResult()+renderLipid2026Cards(); };
  window.renderLipid2026Cards=renderLipid2026Cards;

  /* ---- 4. 도서관: 2026 개정 카드 + 이전 지침(5판) 기본 접힘 ---- */
  function renderLibrary2026(){
    var h='<div class="card"><h3>📌 2026 개정 반영 <span class="badge b-clin">진료지침 2026 · 2026-09-10</span></h3>';
    h+='<div class="kp">목표 수치는 5판과 동일. 위험군을 질환 기반 5군으로 정비, <b>위험강화인자 신설</b>, 재발성 뇌졸중 고위험·당뇨(TOD 또는 위험인자 ≥3) <b>선택적 &lt;55</b>, 당뇨 고위험 &lt;70 근거 A로 상향.</div>';
    h+='<div class="kp">약물: ACS 초기 스타틴+에제티미브(IIa B), CAD 조기 비스타틴(I B), <b>벰페도익산 정식 권고</b>(IIa B), IPE TG 135–499로 확대(IIa B). 인클리시란은 소개(등급 없음).</div>';
    h+='<details><summary>위험강화인자 11종</summary><div class="dbody"><table class="tbl">';
    Object.keys(RISK_ENHANCERS_2026).forEach(function(id){ var d=RISK_ENHANCERS_2026[id]; var th=d.thresholds?Object.keys(d.thresholds).map(function(u){ return "≥"+d.thresholds[u]+" "+u; }).join(" / "):(d.def||""); h+='<tr><td>'+E(d.label)+'</td><td>'+E(th)+'</td></tr>'; });
    h+='</table><div class="src">분류 후 치료 강도를 보완하는 요소(위험군 자체는 바뀌지 않음). 중등도 IIa B · 저위험 IIb B.</div></div></details>';
    h+='<details><summary>표 2-6 위험도·LDL 구간별 치료</summary><div class="dbody"><table class="tbl"><tr><th></th>'+RX_ZONE_2026.bands.map(function(b){ return '<th>'+E(b.label)+'</th>'; }).join("")+'</tr>';
    Object.keys(RX_ZONE_2026.rows).forEach(function(sid){ h+='<tr><td>'+E((RISK_LABEL_2026[sid]||{}).label||sid)+'</td>'+RX_ZONE_2026.rows[sid].map(function(z){ return '<td style="background:'+(z==="rx"?"var(--clin-bg)":z==="soft"?"var(--panel2)":"transparent")+'">'+(z==="life"?"생활":"약물 고려")+'</td>'; }).join("")+'</tr>'; });
    h+='</table><div class="src">'+E(RX_ZONE_2026.footnote)+'</div></div></details>';
    h+='<details><summary>지침 ↔ 급여 상충 '+Object.keys(CONFLICTS).length+'건</summary><div class="dbody">';
    Object.keys(CONFLICTS).forEach(function(cid){ var c=CONFLICTS[cid]; h+='<div class="kp"><b>'+E(CONFLICT_TITLES_2026[cid]||cid)+'</b><br>지침: '+E(c.text_guideline)+'<br><span style="color:var(--pay)">급여: '+E(c.text_reimb)+'</span></div>'; });
    h+='</div></details>';
    h+='<details><summary>이전 지침 보기 (제5판 2022 · superseded)</summary><div class="dbody">';
    Object.keys(SUPERSEDED_V1).forEach(function(k){ var r=RECOMMENDATIONS[k], s=SUPERSEDED_V1[k];
      h+='<div class="kp"><span class="badge b-care">5판</span> '+E(r?r.txt:k)+(s.erratum?'<br><span style="color:var(--alert);font-size:12px">정정: '+E(s.erratum)+'</span>':'')+'<br><span style="color:var(--ink-faint);font-size:12px">→ '+s.superseded_by.map(function(x){ return REC_2026[x]?REC_2026[x].text:x; }).map(E).join(" / ")+'</span></div>'; });
    h+='</div></details>';
    h+='<div class="src"><a href="'+GUIDELINES["gl:dyslipidemia:ksla-2026"].url+'" target="_blank" rel="noopener">이상지질혈증 진료지침 2026 원문</a> · <a href="'+GUIDELINES["gl:dyslipidemia:acc-aha-2026"].url+'" target="_blank" rel="noopener">ACC/AHA 2026</a></div>';
    h+='</div>';
    return h;
  }
  var _renderLibrary=renderLibrary;
  renderLibrary=function(){ _renderLibrary.apply(this,arguments); if(STATE.openTopic) return; var v=$("view-library"); if(v){ v.insertAdjacentHTML("afterbegin", renderLibrary2026()); relabel2026(v); } };

  /* ---- 4b. 헤더·배너 지침 표기 갱신 (텍스트 노드만) ---- */
  function relabel2026(root){
    if(!root) return; var tw=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while((n=tw.nextNode())){ var t=n.nodeValue;
      if(t.indexOf("2022 진료지침 5판")>=0) n.nodeValue=t.replace("2022 진료지침 5판","진료지침 2026(5판 대비 개정 반영)");
      else if(/^\s*5판·급여/.test(t)) n.nodeValue=t.replace("5판·급여","2026 지침·급여"); }
  }
  var _renderAll=renderAll;
  renderAll=function(){ _renderAll.apply(this,arguments); relabel2026(document.body); };
  if(document.readyState!=="loading") relabel2026(document.body); else document.addEventListener("DOMContentLoaded", function(){ relabel2026(document.body); });

  /* ---- 5. 시뮬레이션: 2026 신설 케이스 4종 (노드 가산) ---- */
  try{
    SIMFLOW.nodes.s_entry.opts.push({ t:"2026 개정 신설 권고 케이스", collect:"2026 개정 케이스 경로", next:"s26_entry" });
    SIMFLOW.nodes.s26_entry={ q:"2026. 어떤 케이스입니까?", hint:"진료지침 2026 신설·상향 권고를 점검합니다.", opts:[
      { t:"급성관상동맥증후군(ACS) 입원", collect:"ACS: 즉시 고강도 스타틴(I A) + 초기 최대 가용 스타틴+에제티미브(IIa B) — 복합제는 일반원칙 범위 내 급여. 기존 투약 중이면 입원 중 강화(I C)", next:null },
      { t:"CAD + 스타틴 불내성", collect:"벰페도익산 고려(IIa B) — 넥스레톨 2026-10 허가·급여 미등재(전액 본인부담). 대안: 에제티미브, 급여 조건 충족 시 PCSK9i", next:null },
      { t:"중등도 위험 + LDL 100–129 + Lp(a)·hsCRP 상승", collect:"위험강화인자 동반 → 스타틴으로 더 적극 강하 고려(IIa B). 판단 모호 시 관상동맥칼슘점수(IIa B)", next:null },
      { t:"재발성 죽상경화성 뇌졸중 고위험", collect:"LDL <55 선택적 고려(IIa B). 스타틴+에제티미브로 <70 미달 시 PCSK9i(IIa B) — 급여는 주요 ASCVD 1개+고위험요인 ≥2 필요(고시 제2024-37호)", next:null }
    ]};
  }catch(e){ if(window.console) console.warn("lipid v2 sim", e); }
})();

/* ===================================================================
   6. 근거(ⓘ) 팝업 → 공용 PortalDialog(<dialog>) 전환  [2026-11-07]
   문제: v1 #refModal은 뒤로가기로 닫히지 않고(hidden 속성), 공용 트랩이 closeTopic까지 호출해 토픽 이탈.
   해결: v1 #refModalBody를 dialog로 옮기고 openRef/closeRefModal 재할당(v1 본문 무수정·렌더는 v1 그대로).
         닫기 = 바깥 탭 · 닫기× · Esc · 뒤로가기(팝업만). 원문 그림(openImgModal)은 build.js 공용 그림 뷰어가 처리.
         PortalDialog는 build.js 주입(본문 뒤) → DOMContentLoaded 시점에 연결. 없으면(단독 실행) v1 동작 유지.
   =================================================================== */
(function(){
  function init(){
    var PD=window.PortalDialog, rb=document.getElementById("refModalBody"), oldRef=document.getElementById("refModal");
    if(!PD || !rb || typeof window.openRef!=="function" || document.getElementById("lipid26RefDialog")) return;
    var rd=document.createElement("dialog"); rd.id="lipid26RefDialog"; rd.className="pv-d lipid26-ref"; rd.setAttribute("aria-label","근거 상세");
    var st=document.createElement("style"); st.textContent="dialog.lipid26-ref{align-items:center;justify-content:center;padding:16px}dialog.lipid26-ref .pv-hint{padding-top:8px}";
    document.head.appendChild(st); document.body.appendChild(rd); rd.appendChild(rb);
    rd.insertAdjacentHTML("beforeend",'<div class="pv-hint" data-pv-dismiss>바깥 탭 · 뒤로가기 · Esc: 닫기</div>');
    PD.wire(rd);
    var _openRef=window.openRef;
    window.openRef=function(){ var r=_openRef.apply(this, arguments); if(oldRef) oldRef.hidden=true; if(rb.innerHTML) PD.show(rd); return r; };
    window.closeRefModal=function(){ if(rd.open) rd.close(); };
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else setTimeout(init,0);
})();
