/* ===================================================================
   COPD v2 UI — v1 DOM 위 가산(post-render 훅). v1 함수 본문 무수정.
   window.render / window.runFlow를 래핑: 원본 실행 → 2026 요소 재부착(멱등 마커 data-copd26).
   v1 상태(APP.tab/topic/flow/sim)는 읽기만, v2 입력은 APP.copd26에만 저장.
   =================================================================== */
var COPD26_UI = (function(D, E){
"use strict";
var TH = D.TH;
function h(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function t(s){ return h(E.tpl(s)); }
function glShort(id){ var g=D.GUIDELINES[id]; return g?g.short:id; }
function layerCls(id){ return id==="gl:copd:katrd-2024" ? "c26-kr" : (id==="gl:copd:gold-2026" ? "c26-gd" : "c26-ot"); }
function clsLabel(cid){ var c=(typeof CD!=="undefined" && CD.CLASSES[cid]) || D.CLASS_ADD[cid]; return c?c.label:cid; }
function setLabel(classes){ var k=classes.slice().sort().join("|"); return D.REGIMEN_LABEL[k] || classes.map(clsLabel).join("+"); }

/* ---------- 스타일 (v1 토큰 재사용) ---------- */
function ensureCss(){
  if(document.getElementById("copd26-css")) return;
  var st=document.createElement("style"); st.id="copd26-css";
  st.textContent=[
    ".c26-chip{display:inline-block;font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:9px;margin:1px 3px 1px 0;white-space:nowrap;border:1px solid var(--line);background:var(--panel2);color:var(--ink-dim)}",
    ".c26-kr{background:var(--care-bg);color:var(--care);border-color:var(--care)}",
    ".c26-gd{background:var(--clin-bg);color:var(--clin);border-color:var(--clin)}",
    ".c26-ot{background:var(--bio-bg);color:var(--bio);border-color:var(--bio)}",
    ".c26-pay{background:var(--pay-bg);color:var(--pay);border-color:var(--pay)}",
    ".c26-new{background:var(--pay);color:#fff;border-color:var(--pay)}",
    ".c26-cols{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}",
    "@media(max-width:380px){.c26-cols{grid-template-columns:1fr}}",
    ".c26-col{border:1px solid var(--line);border-radius:8px;padding:8px;background:var(--panel);min-width:0}",
    ".c26-col .c26-reg{font-size:14px;font-weight:700;margin:4px 0;word-break:keep-all}",
    ".c26-rec{font-size:11.5px;line-height:1.45;margin:4px 0;color:var(--ink-dim)}",
    ".c26-row{border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;line-height:1.5}",
    ".c26-row:first-of-type{border-top:0}",
    ".c26-row.off{opacity:.6}",
    ".c26-miss{font-size:11.5px;color:var(--block);margin-top:2px}",
    ".c26-note{font-size:11.5px;color:var(--ink-faint);margin-top:2px}",
    ".c26-conf{border-left:3px solid var(--alert);background:var(--panel2);padding:6px 8px;margin:6px 0;border-radius:4px;font-size:12px;line-height:1.5}",
    ".c26-conf b{color:var(--alert)}",
    ".c26-kv{display:grid;grid-template-columns:42px 1fr;gap:2px 6px;font-size:12px;line-height:1.45}",
    ".c26-kv .k{color:var(--ink-faint);font-weight:700}",
    "details.c26-d{border:1px solid var(--line);border-radius:8px;margin:6px 0;background:var(--panel)}",
    "details.c26-d>summary{cursor:pointer;padding:8px 10px;font-weight:700;font-size:13px;list-style:none}",
    "details.c26-d>summary::-webkit-details-marker{display:none}",
    "details.c26-d>summary::before{content:'▸ ';color:var(--ink-faint)}",
    "details.c26-d[open]>summary::before{content:'▾ '}",
    "details.c26-d>.c26-body{padding:0 10px 10px}",
    ".c26-tbl{width:100%;border-collapse:collapse;font-size:11.5px;table-layout:fixed}",
    ".c26-tbl td,.c26-tbl th{border-top:1px solid var(--line);padding:4px 3px;vertical-align:top;text-align:left;word-break:break-word}",
    ".c26-tbl th{color:var(--ink-faint);font-weight:700}",
    ".c26-in{border:1px dashed var(--clin);border-radius:8px;padding:8px;margin:8px 0;background:var(--clin-bg)}",
    ".c26-in .ttl{font-size:12px;font-weight:700;color:var(--clin);margin-bottom:6px}",
    ".c26-in select{width:100%;padding:7px;border:1px solid var(--line);border-radius:6px;font-size:14px;background:#fff;font-family:inherit}",
    ".c26-cases button{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:8px;margin:5px 0;font-family:inherit;font-size:12.5px;cursor:pointer;color:var(--ink)}",
    ".c26-cases button.on{border-color:var(--care);box-shadow:0 0 0 1px var(--care) inset}",
    ".c26-src a{color:var(--clin);word-break:break-all}",
    "details.copd26-legacy{margin-top:10px}"
  ].join("\n");
  document.head.appendChild(st);
}

/* ---------- 공통 조각 ---------- */
function recChip(r){
  if(!r) return "";
  var lv = r.loe_ko && r.loe_ko!=="—" ? "·"+r.loe_ko : "";
  return '<span class="c26-chip '+layerCls(r.guideline)+'">'+h(r.gl+" "+r.cite)+'</span><span class="c26-chip">'+h(r.grade_ko+lv)+'</span>';
}
function recLine(r){ return '<div class="c26-rec">'+recChip(r)+' '+h(r.text)+(r.note?'<div class="c26-note">'+h(r.note)+'</div>':'')+'</div>'; }
function statusBadge(st){ var s=D.REIMB_STATUS[st]||{ko:st,cls:"warn"}; return '<span class="badge '+s.cls+'">'+h(s.ko)+'</span>'; }
function noticeLabels(ids){ return (ids||[]).map(function(n){ var x=D.NOTICES[n]; return x? x.label+"("+x.date+")" : n; }).join(" · "); }
function gateHTML(node){
  if(node.op){ return '<div style="margin-left:8px">'+(node.label?'<div class="c26-note"><b>'+t(node.label)+'</b></div>':'')+'<div class="c26-note">'+(node.op==="AND"?"모두 충족":"하나 이상")+'</div>'
      +node.conds.map(gateHTML).join("")+'</div>'; }
  return '<div class="c26-rec">• '+t(node.txt)+'</div>';
}

/* ---------- 결과 카드 ---------- */
function resultHTML(a, opt){
  opt=opt||{}; var x='';
  x+='<div class="card clin" data-copd26="result"><div class="rescard-h clin">🧭 2026 판정 — KATRD 2024 · GOLD 2026</div>';
  x+='<div class="dualcls"><div class="clsbox k"><div class="lab">국내 KATRD 2024</div><div class="val">'+h(a.group.kr_label)+'</div></div>'
    +'<div class="clsbox g"><div class="lab">GOLD 2026</div><div class="val">'+h(a.group.gold26_label)+'</div></div></div>';
  if(a.group.changed) x+='<div class="c26-note"><span class="c26-chip c26-new">기준 변경</span> GOLD 2025였다면 '+h(a.group.gold25_label)+' → 2026 '+h(a.group.gold26_label)+' (E군 = 중등도·중증 악화 '+TH.gold26_e_exac_ge+'회 이상)</div>';
  x+='<div class="c26-cols">';
  a.regimens.forEach(function(rg){
    x+='<div class="c26-col"><span class="c26-chip '+layerCls(rg.layer)+'">'+h(glShort(rg.layer))+'</span>'
      +(rg.step?'<span class="c26-note">'+h(rg.step)+'</span>':'')+(rg.keep?'<span class="c26-chip">현 치료 유지</span>':'')
      +'<div class="c26-reg">'+h(rg.label)+(rg.alt?' <span class="c26-note">또는 '+h(setLabel(rg.alt))+'</span>':'')+'</div>';
    if(rg.note) x+='<div class="c26-note">'+h(rg.note)+'</div>';
    var top=rg.recs.slice(0,D.META.ui_top_recs), rest=rg.recs.slice(D.META.ui_top_recs);
    top.forEach(function(r){ x+=recLine(r); });
    if(rest.length) x+='<details class="c26-d"><summary>근거 '+rest.length+'건 더</summary><div class="c26-body">'+rest.map(recLine).join("")+'</div></details>';
    if(!rg.recs.length && !rg.note) x+='<div class="c26-note">해당 권고 없음</div>';
    x+='</div>';
  });
  x+='</div>';
  if(a.advice && a.advice.length) x+='<details class="c26-d"><summary>함께 볼 권고 '+a.advice.length+'건</summary><div class="c26-body">'+a.advice.map(recLine).join("")+'</div></details>';
  a.flags.forEach(function(f){ x+='<div class="c26-note">'+(f.lv==="warn"?"⚠ ":"ℹ ")+h(f.msg)+'</div>'; });
  x+='</div>';

  /* 제품별 급여 */
  x+='<div class="card pay" data-copd26="reimb"><div class="rescard-h pay">💊 제품별 급여 (원문 '+h(D.META.reimb_checked)+')</div>';
  x+='<div class="c26-note">'+h(D.EXAC_DEF_REIMB)+'</div>';
  a.drugs.forEach(function(d){
    var r=d.reimb||{};
    x+='<div class="c26-row'+(d.met?'':' off')+'"><b>'+h(d.label)+'</b> <span class="c26-note">'+h(setLabel(d.classes))+'</span>'
      +(d.current?' <span class="c26-chip">현재 사용</span>':'')+'<div>'
      +d.layers.map(function(l){ return '<span class="c26-chip '+layerCls(l)+'">'+h(glShort(l))+'</span>'; }).join("")
      +statusBadge(r.status)+(r.opinion&&r.status==="ok"?' <span class="c26-chip c26-pay">투여소견서</span>':'')+'</div>';
    if(!d.met && d.unmet) x+='<div class="c26-note">지침 조건 미충족: '+h(d.unmet)+'</div>';
    if(r.status==="unmet" && r.missing && r.missing.length) x+='<div class="c26-miss">미충족: '+h(r.missing.join(" / "))+'</div>';
    if(r.notes && r.notes.length) x+='<div class="c26-note">'+h(r.notes.join(" · "))+'</div>';
    if(d.label_scope) x+='<div class="c26-note">허가: '+h(d.label_scope)+'</div>';
    if(r.notice && r.notice.length) x+='<div class="c26-note">근거: '+h(noticeLabels(r.notice))+'</div>';
    x+='</div>';
  });
  a.unavailable.forEach(function(u){ x+='<div class="c26-row off"><b>'+h(u.label)+'</b> '+statusBadge("na")+'</div>'; });
  x+='</div>';

  /* 상충 */
  if(a.conflicts.length){
    x+='<div class="card" data-copd26="conf"><div class="rescard-h clin">⚖ 지침 ⟷ 급여 상충 ('+a.conflicts.length+')</div>';
    a.conflicts.forEach(function(c){ x+='<div class="c26-conf"><b>'+h(c.x)+'</b><div class="c26-kv"><span class="k">지침</span><span>'+h(c.gl)+'</span><span class="k">급여</span><span>'+h(c.reimb)+'</span></div></div>'; });
    x+='</div>';
  }
  /* 악화 모드 */
  if(a.aecopd.length){
    x+='<div class="card clin" data-copd26="ae"><div class="rescard-h clin">🚑 급성악화 관리 (GOLD 2026)</div>'+a.aecopd.map(recLine).join("")+'</div>';
  }
  /* 백신 */
  var due=a.vaccines.filter(function(v){ return v.due; });
  if(due.length){
    x+='<div class="card care" data-copd26="vacc"><div class="rescard-h care">💉 백신 (레이어별)</div>';
    due.forEach(function(v){
      x+='<div class="c26-row"><b>'+h(v.name)+'</b>'+(v.plan?'<div class="c26-rec">→ '+h(v.plan)+'</div>':'')
        +v.layers.map(function(l){ return '<div class="c26-rec"><span class="c26-chip '+layerCls(l.gl)+'">'+h(l.short)+'</span>'+(l.src_level==="report"?'<span class="c26-chip">보도</span>':'')
          +(l.loe?'<span class="c26-chip">Evidence '+h(l.loe)+'</span>':'')+h(l.txt)+'</div>'; }).join("")
        +(v.label_note?'<div class="c26-note">'+h(v.label_note)+'</div>':'')+'</div>';
    });
    x+='<div class="c26-note">'+h(D.VACC_REIMB_NOTE)+'</div></div>';
  }
  /* 목표·정정 */
  x+='<div class="card care" data-copd26="targets"><div class="rescard-h care">🎯 목표·재평가</div>'+a.targets.map(function(tg){ return '<div class="c26-rec">• '+h(tg.label)+'</div>'; }).join("")+'</div>';
  if(a.errata.length){
    x+='<details class="c26-d" data-copd26="errata"><summary>v1 정정·갱신 '+a.errata.length+'건 (이 환자 관련)</summary><div class="c26-body">';
    a.errata.forEach(function(id){ var e=D.ERRATA.filter(function(z){ return z.id===id; })[0]; if(e) x+=errataLine(e); });
    x+='</div></details>';
  }
  if(!opt.noLegacyNote) x+='<div class="note-foot">2026 판정은 조언이며 최종 결정은 처방의 책임입니다. 급여는 청구 시 최신 고시를 확인하세요.</div>';
  return x;
}
function errataLine(e){
  return '<div class="c26-row"><span class="c26-chip '+(e.kind==="erratum"?"c26-pay":"c26-gd")+'">'+h(e.id.split(":").pop())+' '+(e.kind==="erratum"?"정정":"지침 갱신")+'</span>'
    +'<div class="c26-kv"><span class="k">v1</span><span>'+h(e.v1)+'</span><span class="k">현행</span><span>'+h(e.current)+'</span><span class="k">근거</span><span>'+h(e.src)+'</span></div></div>';
}

/* ---------- 입력 ---------- */
function inputValue(k){ var v=APP.copd26.input[k]; return v==null?"":v; }
function inputsHTML(){
  var x='<div class="c26-in" data-copd26="inputs"><div class="ttl">🆕 2026 판정 추가 입력 (GOLD 2026 · KATRD 2024 · 급여)</div>';
  var nums=D.INPUTS.filter(function(i){ return i.type==="number"; }), sels=D.INPUTS.filter(function(i){ return i.type==="select"; }), chips=D.INPUTS.filter(function(i){ return i.type==="chip"; });
  x+='<div class="row2">';
  nums.forEach(function(i){ x+='<div class="field"><label>'+h(i.label)+'</label><input id="c26_'+i.k+'" type="number" inputmode="decimal" placeholder="'+h(i.ph||"")+'" value="'+h(inputValue(i.k))+'" oninput="COPD26_UI.setNum(\''+i.k+'\',this.value)"></div>'; });
  sels.forEach(function(i){ x+='<div class="field"><label>'+h(i.label)+'</label><select onchange="COPD26_UI.setSel(\''+i.k+'\',this.value)">'
    +i.opts.map(function(o){ return '<option value="'+h(o[0])+'"'+(String(inputValue(i.k))===o[0]?' selected':'')+'>'+h(o[1])+'</option>'; }).join("")+'</select></div>'; });
  x+='</div><div class="field"><div class="chips">';
  chips.forEach(function(i){ x+='<div class="chip'+(APP.copd26.input[i.k]?' on':'')+'" onclick="COPD26_UI.toggle(\''+i.k+'\')">'+h(i.label)+'</div>'; });
  x+='</div></div>';
  x+='<div class="field"><label>추가 접종력(폐렴구균)</label><div class="chips">';
  D.VACC_INPUTS.forEach(function(v){ var on=(APP.copd26.input.vx||[]).indexOf(v[0])>=0; x+='<div class="chip'+(on?' on':'')+'" onclick="COPD26_UI.toggleVx(\''+v[0]+'\')">'+h(v[1])+'</div>'; });
  x+='</div></div>';
  if(APP.copd26.input.ae_on){
    x+='<div class="row2">';
    D.AECOPD_INPUTS.forEach(function(i){
      if(i.type==="select") x+='<div class="field"><label>'+h(i.label)+'</label><select onchange="COPD26_UI.setSel(\''+i.k+'\',this.value)">'
        +i.opts.map(function(o){ return '<option value="'+h(o[0])+'"'+(String(inputValue(i.k))===o[0]?' selected':'')+'>'+h(o[1])+'</option>'; }).join("")+'</select></div>';
    });
    x+='</div><div class="chips">';
    D.AECOPD_INPUTS.filter(function(i){ return i.type==="chip"; }).forEach(function(i){ x+='<div class="chip'+(APP.copd26.input[i.k]?' on':'')+'" onclick="COPD26_UI.toggle(\''+i.k+'\')">'+h(i.label)+'</div>'; });
    x+='</div>';
  }
  x+='<div class="c26-note">아래 분석 버튼이 v1 결과와 2026 판정을 함께 냅니다. 흡입제 선택 = 현재 치료(급여 판정의 “~에도 불구하고” 조건).</div></div>';
  return x;
}
function patientFrom(base){
  var p={}, k; for(k in base){ if(Object.prototype.hasOwnProperty.call(base,k)) p[k]=base[k]; }
  var inp=APP.copd26.input; for(k in inp){ if(k!=="vx" && Object.prototype.hasOwnProperty.call(inp,k)) p[k]=inp[k]; }
  p.vaccines=(base.vaccines||[]).concat(inp.vx||[]);
  p.products=(base.products||[]).slice();
  return p;
}
function compute(){ APP.copd26.result = E.applyCopd2026(patientFrom(APP.flow)); }

/* ---------- 도서관 블록 ---------- */
function tableRecs(list){
  return '<table class="c26-tbl"><tr><th style="width:24%">근거</th><th style="width:22%">등급</th><th>내용</th></tr>'
    +list.map(function(r){ var v=E.recView(r.id); return '<tr><td>'+recChip(v).split('</span>')[0]+'</span></td><td>'+h(v.grade_ko+(v.loe_ko&&v.loe_ko!=="—"?" · "+v.loe_ko:"")+(v.loe_raw&&v.loe_raw!==v.loe_ko?" (원문 "+v.loe_raw+")":""))+'</td><td>'+h(v.text)+(v.note?'<div class="c26-note">'+h(v.note)+'</div>':'')+'</td></tr>'; }).join("")+'</table>';
}
function libHTML(){
  var x='<div class="card" data-copd26="lib"><div class="sec-title" style="font-size:15px;color:var(--ink)">🆕 2026 개정 반영 <span class="c26-chip c26-new">v2</span></div>'
    +'<div class="c26-note">GOLD 2026 · KATRD 2024 권고등급 · 심평원 급여 원문('+h(D.META.reimb_checked)+') — 아래 v1 토픽은 이전 기준을 포함합니다(“2026 갱신” 칩).</div>';
  function sec(title, body){ return '<details class="c26-d"><summary>'+h(title)+'</summary><div class="c26-body">'+body+'</div></details>'; }
  x+=sec("핵심 변화 "+D.LIB.concepts.length, D.LIB.concepts.map(function(c){ return '<div class="c26-rec">• '+h(c)+'</div>'; }).join(""));
  var kr=D.REC_2026.filter(function(r){ return r.guideline==="gl:copd:katrd-2024"; });
  x+=sec("KATRD 2024 권고등급(GRADE) — KQ1–9 등 "+kr.length, '<div class="c26-note">'+h(D.REC_SYSTEMS["recsys:grade"].note)+'</div>'+tableRecs(kr)
    +'<div class="c26-conf"><b>X7 레이어 내부</b> KQ1·2는 저위험군 기관지확장제 “권고 보류”(근거 낮음), 같은 지침 그림 3-3은 저위험군 1차 LABA+LAMA(등급 미부여) — 판단은 처방의에게</div>');
  var gd=D.REC_2026.filter(function(r){ return r.guideline==="gl:copd:gold-2026" && r.scope!=="aecopd"; });
  x+=sec("GOLD 2026 권고·근거(Evidence A–D) "+gd.length, '<div class="c26-note">'+h(D.REC_SYSTEMS["recsys:gold"].note)+'</div>'+tableRecs(gd));
  var paths={init:"초치료(그림 3.8)",exac:"추적 — 악화 경로(그림 3.9)",dyspnea:"추적 — 호흡곤란 경로(그림 3.9)",laba_ics:"LABA+ICS 사용 중(그림 3.12)",maintain:"유지"};
  var alg=''; Object.keys(paths).forEach(function(pk){
    alg+='<div class="c26-rec"><b>'+h(paths[pk])+'</b></div>';
    D.ALGO26.filter(function(a){ return a.path===pk; }).forEach(function(a){
      alg+='<div class="c26-rec" style="margin-left:8px">→ '+h(a.regimen.length?setLabel(a.regimen):"현 치료 유지")
        +(a.addons?' + '+a.addons.map(function(id){ var ad=D.ADDONS26[id]; var dr=(typeof CD!=="undefined"&&CD.DRUGS[ad.drug])||D.DRUG_ADD[ad.drug]; return dr?dr.name:ad.drug; }).join("·"):'')
        +(a.note?' — '+t(a.note):'')+(a.recs.length?' <span class="c26-note">('+a.recs.map(function(id){ var r=E.recView(id); return r?r.cite:id; }).join(", ")+')</span>':'')+'</div>'; });
  });
  x+=sec("GOLD 2026 알고리즘 경로", '<div class="c26-note">추적 경로는 주된 치료 표적(악화 / 호흡곤란)으로 고른다. 둘 다면 악화 경로. 호산구 '+TH.eos_ics_min+'·'+TH.eos_ics_high+'이 분기점.</div>'+alg);
  var rb=''; Object.keys(D.REIMB_2026).forEach(function(id){ var r=D.REIMB_2026[id];
    var prods=D.PRODUCTS.filter(function(p){ return p.reimb===id; }).map(function(p){ return p.v1_brand||p.label; });
    rb+='<div class="c26-row"><b>'+h(r.title)+'</b> '+(r.fixed?statusBadge(r.fixed):'')+'<div class="c26-note">'+h(prods.join(" · "))+'</div>'
      +(r.gate?gateHTML(r.gate):'')+(r.require?'<div class="c26-rec">＋ '+t(r.require.txt)+'</div>':'')
      +((r.notes||[]).map(function(n){ return '<div class="c26-note">'+t(n)+'</div>'; }).join(""))
      +'<div class="c26-note">근거: '+h(noticeLabels(r.notice))+'</div></div>'; });
  x+=sec("급여 기준 — 제품별(고시 원문 "+Object.keys(D.NOTICES).length+"건)", '<div class="c26-note">'+h(D.EXAC_DEF_REIMB)+'</div>'+rb);
  var bio=D.LIB.bio_trials.map(function(b){ var dr=CD.DRUGS[b.drug]; var st=D.DRUG_STATUS[b.drug]||{};
    return '<div class="c26-row"><b>'+h(dr?dr.name:b.drug)+'</b> <span class="c26-note">'+h(b.dose)+'</span><div class="c26-kv"><span class="k">시험</span><span>'+h(b.trials)+'</span><span class="k">대상</span><span>'+h(b.pop)+'</span><span class="k">결과</span><span>'+h(b.result)+'</span><span class="k">허가</span><span>'+h(st.label_scope||"")+'</span><span class="k">급여</span><span>'+statusBadge("no")+' COPD 고시 항목 없음</span></div></div>'; }).join("");
  x+=sec("생물학제제 — 근거(Fig 3.11)·허가·급여", bio);
  var vx=D.VACC26.map(function(v){ return '<div class="c26-row"><b>'+h(v.name)+'</b>'+v.layers.map(function(l){ var g=D.GUIDELINES[l.gl]; return '<div class="c26-rec"><span class="c26-chip '+layerCls(l.gl)+'">'+h(g.short)+'</span>'+(g.src_level==="report"?'<span class="c26-chip">보도</span>':'')+(l.loe?'<span class="c26-chip">Evidence '+h(l.loe)+'</span>':'')+t(l.txt)+'</div>'; }).join("")
    +(v.plan?'<div class="c26-note">접종력별: '+v.plan.map(function(p){ return t(p.txt); }).join(" / ")+'</div>':'')+(v.label_note?'<div class="c26-note">'+t(v.label_note)+'</div>':'')+'</div>'; }).join("");
  x+=sec("백신 — KATRD 2024 · GOLD 2026 · 대한감염학회 2026", vx+'<div class="c26-note">'+h(D.VACC_REIMB_NOTE)+'</div>');
  x+=sec("급성악화 2026 (Fig 4.5·4.6)", tableRecs(D.REC_2026.filter(function(r){ return r.scope==="aecopd"; })));
  x+=sec("지침 ⟷ 급여 상충 X1–X"+D.CONFLICTS.length, D.CONFLICTS.map(function(c){ return '<div class="c26-conf"><b>'+h(c.x)+'</b><div class="c26-kv"><span class="k">지침</span><span>'+t(c.gl)+'</span><span class="k">급여</span><span>'+t(c.reimb)+'</span></div></div>'; }).join(""));
  x+=sec("v1 정정·갱신 CE1–CE"+D.ERRATA.length, D.ERRATA.map(errataLine).join(""));
  x+='</div>';
  return x;
}
function sourcesHTML(){
  return '<div class="note-foot c26-src" data-copd26="src"><b>2026 반영 출처</b><br>'+D.SOURCES.map(function(s){ return '• <a href="'+h(s.url)+'" target="_blank" rel="noopener">'+h(s.label)+'</a> <span class="c26-chip">'+h(s.level)+'</span>'; }).join("<br>")+'</div>';
}
function topicNoteHTML(topic){
  var ids=D.LIB.topic_notes[topic]; if(!ids) return "";
  return '<div class="card" data-copd26="topicnote"><div class="rescard-h pay">🆕 2026 갱신 — 이 토픽의 v1 서술 중 바뀐 것</div>'
    +ids.map(function(id){ var e=D.ERRATA.filter(function(z){ return z.id===id; })[0]; return e?errataLine(e):""; }).join("")+'<div class="c26-note">상세: 도서관 첫 화면 “2026 개정 반영” 카드</div></div>';
}

/* ---------- 시뮬 블록 ---------- */
function simHTML(){
  var x='<div class="card" data-copd26="sim"><div class="rescard-h clin">🆕 2026 증례 '+D.SIM_CASES.length+'건 — 입력만 저장, 판정은 엔진 계산</div><div class="c26-cases">';
  D.SIM_CASES.forEach(function(c){ x+='<button type="button" class="'+(APP.copd26.simCase===c.id?'on':'')+'" onclick="COPD26_UI.simCase(\''+c.id+'\')">'+h(c.title)+'</button>'; });
  x+='</div>';
  var c=D.SIM_CASES.filter(function(z){ return z.id===APP.copd26.simCase; })[0];
  if(c){
    x+='<div class="c26-note">학습 포인트: '+h(c.point)+'</div><button class="btn" onclick="COPD26_UI.loadCase(\''+c.id+'\')">이 증례를 플로우로 불러오기</button>';
  }
  x+='</div>';
  if(c) x+=resultHTML(E.applyCopd2026(JSON.parse(JSON.stringify(c.p))), {noLegacyNote:true});
  return x;
}
function simDualHTML(){
  var s=APP.sim; if(!s || (s.fev1==null && s.modExac==null && s.hospExac==null && s.eos==null)) return "";
  var a=E.applyCopd2026(patientFrom(s));
  return '<details class="c26-d" data-copd26="simdual" open><summary>2026 병기 — 위 시뮬 입력으로 본 KATRD 2024 · GOLD 2026 · 급여</summary><div class="c26-body">'+resultHTML(a,{noLegacyNote:true})+'</div></details>';
}

/* ---------- 부착 ---------- */
function decorate(){
  ensureCss();
  var sub=document.querySelector(".hdr .sub"); if(sub && sub.getAttribute("data-copd26")!=="1"){ sub.textContent=D.META.header_sub+" · "+D.META.note; sub.setAttribute("data-copd26","1"); }
  var wrap=document.querySelector("#app .wrap"); if(!wrap || wrap.getAttribute("data-copd26")==="1") return;
  wrap.setAttribute("data-copd26","1");
  if(APP.tab==="lib"){
    if(!APP.topic){
      var sb=wrap.querySelector(".searchbar");
      var box=document.createElement("div"); box.innerHTML=libHTML();
      if(sb) wrap.insertBefore(box.firstChild, sb); else wrap.insertBefore(box.firstChild, wrap.firstChild);
      Array.prototype.forEach.call(wrap.querySelectorAll("button.topic"), function(b){
        var m=(b.getAttribute("onclick")||"").match(/openTopic\('(\w+)'\)/);
        if(m && D.LIB.topic_notes[m[1]]){ var th=b.querySelector(".th"); if(th){ var sp=document.createElement("span"); sp.className="c26-chip c26-new"; sp.textContent="2026 갱신"; th.appendChild(sp); } }
      });
      var sbox=document.createElement("div"); sbox.innerHTML=sourcesHTML(); wrap.appendChild(sbox.firstChild);
    } else {
      var note=topicNoteHTML(APP.topic);
      if(note){ var nb=document.createElement("div"); nb.innerHTML=note; var first=wrap.firstChild; wrap.insertBefore(nb.firstChild, first?first.nextSibling:null); }
    }
  } else if(APP.tab==="flow"){
    var btn=wrap.querySelector('button.btn[onclick="runFlow()"]');
    if(btn){ var ib=document.createElement("div"); ib.innerHTML=inputsHTML(); btn.parentNode.insertBefore(ib.firstChild, btn); }
    if(APP.flowResult && APP.copd26.result){
      var inputCard=btn?btn.closest(".card"):null;
      var legacy=[]; var n=inputCard?inputCard.nextSibling:null;
      while(n){ legacy.push(n); n=n.nextSibling; }
      var det=document.createElement("details"); det.className="c26-d copd26-legacy"; det.setAttribute("data-copd26","legacy");
      det.innerHTML='<summary>이전 판정(v1: 국내 2024 · GOLD 2025 · 이전 급여 서술) 보기</summary>';
      var body=document.createElement("div"); body.className="c26-body"; det.appendChild(body);
      legacy.forEach(function(el){ body.appendChild(el); });
      var rb=document.createElement("div"); rb.innerHTML=resultHTML(APP.copd26.result);
      var anchorNode=inputCard?inputCard.nextSibling:null;
      while(rb.firstChild){ wrap.insertBefore(rb.firstChild, anchorNode); }
      wrap.appendChild(det);
    }
  } else if(APP.tab==="sim"){
    var bn=wrap.querySelector(".banner"); var sbx=document.createElement("div"); sbx.innerHTML=simHTML();
    var ref=bn?bn.nextSibling:wrap.firstChild; while(sbx.firstChild){ wrap.insertBefore(sbx.firstChild, ref); }
    var dual=simDualHTML(); if(dual){ var dd=document.createElement("div"); dd.innerHTML=dual; wrap.appendChild(dd.firstChild); }
  }
}

/* ---------- 핸들러 ---------- */
function recomputeIfShown(){ if(APP.copd26.result) compute(); }
var api = {
  decorate:decorate, resultHTML:resultHTML, libHTML:libHTML, compute:compute, patientFrom:patientFrom,
  setNum:function(k,v){ APP.copd26.input[k]=(v===""?null:parseFloat(v)); },
  setSel:function(k,v){ APP.copd26.input[k]=v||null; recomputeIfShown(); render(); },
  toggle:function(k){ APP.copd26.input[k]=!APP.copd26.input[k]; recomputeIfShown(); render(); },
  toggleVx:function(id){ var a=APP.copd26.input.vx||(APP.copd26.input.vx=[]); var i=a.indexOf(id); if(i>=0) a.splice(i,1); else a.push(id); recomputeIfShown(); render(); },
  simCase:function(id){ APP.copd26.simCase=(APP.copd26.simCase===id?null:id); render(); },
  loadCase:function(id){
    var c=D.SIM_CASES.filter(function(z){ return z.id===id; })[0]; if(!c) return;
    var f=APP.flow, k; f.products=(c.p.products||[]).slice(); f.vaccines=(c.p.vaccines||[]).filter(function(v){ return !D.VACC_ADD[v]; });
    D.V1_INPUT_KEYS.num.forEach(function(key){ f[key]=c.p[key]==null?null:c.p[key]; });
    D.V1_INPUT_KEYS.bool.forEach(function(key){ f[key]=!!c.p[key]; });
    APP.copd26.input={ vx:(c.p.vaccines||[]).filter(function(v){ return !!D.VACC_ADD[v]; }) };
    D.INPUTS.concat(D.AECOPD_INPUTS).forEach(function(i){ if(c.p[i.k]!=null) APP.copd26.input[i.k]=c.p[i.k]; });
    APP.flowResult=null; APP.copd26.result=null;
    if(typeof switchTab==="function") switchTab("flow"); else { APP.tab="flow"; render(); }
    window.runFlow();
  }
};
return api;
})(COPD26, COPD26_ENGINE);

/* ---------- v1 함수 래핑 (본문 무수정) ---------- */
(function(){
  var _render = window.render, _runFlow = window.runFlow;
  window.render = function(){ var r=_render.apply(this, arguments); try{ COPD26_UI.decorate(); }catch(e){ if(window.console) console.error("[copd26]", e); } return r; };
  window.runFlow = function(){ try{ COPD26_UI.compute(); }catch(e){ if(window.console) console.error("[copd26]", e); APP.copd26.result=null; } return _runFlow.apply(this, arguments); };
  window.render(); /* 최초 1회 — v1 render(true) 이후 가산 */
})();
