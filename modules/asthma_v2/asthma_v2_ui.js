/* ===================================================================
   ASTHMA v2 UI — v1 DOM 위 가산. v1 함수 본문 무수정.
   · 탭바에 ⚡ 플로우 버튼 가산 → v1 switchTab('flow') 그대로 사용(APP.tab="flow")
   · window.render 래핑: APP.tab==="flow"면 v2가 #view를 그림, 그 외에는 v1 실행 후 2026 요소 부착(멱등 마커 data-a26)
   · window.renderModal 래핑: R-CHECK 모달 상단에 LAMA 필수·고시 경고 띠
   v1 상태는 읽기만, v2 입력은 APP.asthma26에만 저장.
   =================================================================== */
var ASTHMA26_UI = (function(D, E){
"use strict";
var TH = D.TH, L = D.UI_LABELS;
function h(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function t(s){ return h(E.tpl(s)); }
function q(s){ return "'"+String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"; }
function glCls(id){ return id==="gl:asthma:katrd-2026" ? "a26-kr" : (id==="gl:asthma:gina-2026" ? "a26-gi" : "a26-ot"); }
function noticeLabels(ids){ return (ids||[]).map(function(n){ var x=D.NOTICES[n]; return x? x.label+"("+x.date+")" : n; }).join(" · "); }
function errById(id){ for(var i=0;i<D.ERRATA.length;i++){ if(D.ERRATA[i].id===id) return D.ERRATA[i]; } return null; }

/* ---------- 스타일 (v1 토큰 재사용: --clin 임상 · --care 관리 · --pay 급여) ---------- */
function ensureCss(){
  if(document.getElementById("a26-css")) return;
  var st=document.createElement("style"); st.id="a26-css";
  st.textContent=[
    ".a26-chip{display:inline-block;font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:9px;margin:1px 3px 1px 0;white-space:nowrap;border:1px solid var(--line);background:var(--bg);color:var(--muted)}",
    ".a26-kr{background:var(--care-bg);color:var(--care);border-color:var(--care)}",
    ".a26-gi{background:var(--clin-bg);color:var(--clin);border-color:var(--clin)}",
    ".a26-pay{background:var(--pay-bg);color:var(--pay);border-color:var(--pay)}",
    ".a26-new{background:var(--pay);color:#fff;border-color:var(--pay)}",
    ".a26-st{display:inline-block;font-size:11px;font-weight:800;padding:2px 7px;border-radius:6px;white-space:nowrap}",
    ".a26-st.ok{background:var(--met-bg);color:var(--met)}",
    ".a26-st.mid{background:var(--warn-bg);color:var(--warn)}",
    ".a26-st.bad{background:var(--notmet-bg);color:var(--notmet)}",
    ".a26-st.na{background:var(--bg);color:var(--muted);border:1px dashed var(--line)}",
    ".a26-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 13px;margin:10px 0}",
    ".a26-card.pay{border-left:4px solid var(--pay)} .a26-card.clin{border-left:4px solid var(--clin)} .a26-card.care{border-left:4px solid var(--care)}",
    ".a26-ch{font-size:14.5px;font-weight:800;margin-bottom:6px;line-height:1.35}",
    ".a26-sub{font-size:12px;color:var(--muted);line-height:1.5}",
    ".a26-kv{display:grid;grid-template-columns:42px 1fr;gap:3px 8px;font-size:12.5px;line-height:1.45;margin:6px 0}",
    ".a26-kv .k{color:var(--muted);font-weight:700;font-size:11.5px}",
    ".a26-rec{font-size:12px;line-height:1.5;margin:4px 0;color:var(--ink)}",
    ".a26-note{font-size:11.5px;color:var(--muted);margin-top:2px;line-height:1.45}",
    ".a26-miss{font-size:11.5px;color:var(--notmet);margin-top:2px}",
    ".a26-row{border-top:1px solid var(--line);padding:8px 0;font-size:12.5px;line-height:1.5}",
    ".a26-row:first-child{border-top:0}",
    ".a26-row .nm{font-weight:700}",
    ".a26-conf{border-left:3px solid var(--warn);background:var(--warn-bg);padding:7px 9px;margin:6px 0;border-radius:5px;font-size:12px;line-height:1.5}",
    ".a26-flag{padding:6px 9px;margin:5px 0;border-radius:6px;font-size:12px;line-height:1.5;background:var(--bg);border:1px solid var(--line)}",
    ".a26-flag.warn{background:var(--warn-bg);border-color:var(--warn);color:var(--ink)}",
    "details.a26-d{border:1px solid var(--line);border-radius:9px;margin:7px 0;background:var(--card)}",
    "details.a26-d>summary{cursor:pointer;padding:9px 11px;font-weight:700;font-size:13px;list-style:none}",
    "details.a26-d>summary::-webkit-details-marker{display:none}",
    "details.a26-d>summary::before{content:'▸ ';color:var(--muted)}",
    "details.a26-d[open]>summary::before{content:'▾ '}",
    "details.a26-d>.a26-body{padding:0 11px 11px}",
    ".a26-tbl{width:100%;border-collapse:collapse;font-size:11.5px;table-layout:fixed}",
    ".a26-tbl td,.a26-tbl th{border-top:1px solid var(--line);padding:5px 3px;vertical-align:top;text-align:left;word-break:break-word}",
    ".a26-tbl th{color:var(--muted);font-weight:700}",
    ".a26-cols{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    "@media(max-width:420px){.a26-cols{grid-template-columns:1fr}}",
    ".a26-col{border:1px solid var(--line);border-radius:9px;padding:9px;min-width:0;background:var(--card)}",
    ".a26-in{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    "@media(max-width:420px){.a26-in{grid-template-columns:1fr}}",
    ".a26-in label{display:block;font-size:11.5px;color:var(--muted);font-weight:700;margin-bottom:3px}",
    ".a26-in input,.a26-in select{width:100%;padding:8px;border:1px solid var(--line);border-radius:7px;font-size:16px;font-family:inherit;background:#fff;color:var(--ink)}",
    ".a26-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}",
    ".a26-tg{appearance:none;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit;font-size:13px;padding:7px 10px;border-radius:16px;cursor:pointer;touch-action:manipulation}",
    ".a26-tg.on{background:var(--clin);border-color:var(--clin);color:#fff}",
    ".a26-btn{appearance:none;border:1px solid var(--clin);background:var(--clin);color:#fff;font-family:inherit;font-size:13px;font-weight:700;padding:8px 12px;border-radius:8px;cursor:pointer;touch-action:manipulation}",
    ".a26-btn.ghost{background:var(--card);color:var(--clin)}",
    ".a26-cases{display:grid;grid-template-columns:1fr;gap:6px}",
    ".a26-cases button{text-align:left;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:9px 10px;font-family:inherit;font-size:12.5px;cursor:pointer;color:var(--ink)}",
    ".a26-cases button.on{border-color:var(--care);box-shadow:0 0 0 1px var(--care) inset}",
    ".a26-banner{background:var(--pay-bg);border:1px solid var(--pay);border-radius:9px;padding:9px 11px;font-size:12.5px;line-height:1.5;margin:0 0 10px}",
    ".a26-src a{color:var(--clin);word-break:break-all}",
    ".a26-foot{font-size:11px;color:var(--muted);margin-top:14px;line-height:1.6}"
  ].join("\n");
  document.head.appendChild(st);
}

/* ---------- 조각 ---------- */
function recChip(r){
  if(!r) return "";
  var tip=D.REC_SYSTEMS[D.GUIDELINES[r.guideline].recsys].tooltip;
  return '<span class="a26-chip '+glCls(r.guideline)+'" title="'+h(tip)+'">'+h(r.gl+" "+r.cite)+'</span><span class="a26-chip">'+h(r.grade_ko+(r.loe_ko?" · "+r.loe_ko:""))+'</span>';
}
function recLine(r){ return r ? '<div class="a26-rec">'+recChip(r)+' '+h(r.text)+(r.kr_unavailable?' <span class="a26-chip a26-pay">국내 미도입</span>':'')+(r.note?'<div class="a26-note">'+h(r.note)+'</div>':'')+'</div>' : ""; }
function stBadge(st){ var s=L.REIMB_STATUS[st]||{ ko:st, cls:"mid" }; return '<span class="a26-st '+s.cls+'">'+h(s.ko)+'</span>'; }
function gateHTML(node){
  if(node.op){ return '<div style="margin-left:8px">'+(node.label?'<div class="a26-note"><b>'+t(node.label)+'</b></div>':'')+'<div class="a26-note">'+(node.op==="AND"?"모두 충족":"하나 이상")+'</div>'+node.conds.map(gateHTML).join("")+'</div>'; }
  return '<div class="a26-rec">• '+t(node.txt)+'</div>';
}
function prodRow(d){
  var r=d.reimb||{};
  var x='<div class="a26-row"><div><span class="nm">'+h(d.label)+'</span> '+stBadge(r.status)+(d.current?' <span class="a26-chip">현재</span>':'')+(d.age_ok?'':' <span class="a26-chip a26-pay">연령 밖</span>')+'</div>';
  if(r.notice && r.notice.length) x+='<div class="a26-note">'+h(noticeLabels(r.notice))+'</div>';
  if(r.missing && r.missing.length) x+='<div class="a26-miss">미충족: '+h(r.missing.join(" · "))+'</div>';
  (r.notes||[]).forEach(function(n){ x+='<div class="a26-note">'+h(n)+'</div>'; });
  if(d.label_note) x+='<div class="a26-note">허가: '+h(d.label_note)+'</div>';
  if(d.mart && d.mart.label_max) x+='<div class="a26-note">MART 1일 최대: 허가 '+h(d.mart.label_max)+(d.mart.label_exc?'(예외 '+h(d.mart.label_exc)+')':'')+' ⟷ KATRD 표 4-6 '+h(d.mart.kr_max)+'</div>';
  if(d.err){ var e=errById(d.err); if(e) x+='<div class="a26-note"><span class="a26-chip a26-new">정정 '+h(e.id.split(":").pop())+'</span>'+h(e.now)+'</div>'; }
  return x+'</div>';
}
function kv(k, v){ return '<div class="k">'+h(k)+'</div><div>'+v+'</div>'; }

/* ---------- 결과 ---------- */
function resultHTML(a){
  var x='', byId={}; a.drugs.forEach(function(d){ byId[d.id]=d; });
  var st=a.step;
  x+='<div class="a26-card clin" data-a26="result"><div class="a26-ch">🧭 판정 — KATRD 2026 · GINA 2026</div><div class="a26-kv">';
  x+=kv("모드", h(L.MODE[a.mode]));
  x+=kv("방향", h(L.ACTION[a.action]||"—"));
  x+=kv("단계", (st.current!==null?"현재 "+h(st.current)+"단계 → ":"")+(st.target!==null?"<b>"+h(st.target)+"단계</b>":"증상 빈도 입력 필요")+(st.use_init?" <span class=\"a26-note\">(KATRD 표 4-4 초기)</span>":""));
  x+=kv("조절", h(L.CONTROL[a.control.level])+' <span class="a26-note">(4문항 '+h(a.control.n)+'개)</span>');
  x+=kv("ICS", h(D.ICS_LEVEL[a.ics.level]||"미확정")+(a.ics.auto&&a.ics.auto.daily?' <span class="a26-note">자동 '+h(a.ics.auto.daily)+' µg/일 · '+h(a.ics.auto.row)+'</span>':''));
  x+='</div></div>';
  if(a.ae) x+=aeHTML(a.ae);
  a.regimens.forEach(function(rg){
    x+='<div class="a26-card '+(rg.track==="t2"?"care":"clin")+'" data-a26="reg"><div class="a26-ch">'+h(L.TRACK[rg.track])+(rg.step?' · '+h(rg.step)+'단계':'')+'</div>';
    x+='<div style="font-size:15px;font-weight:800;margin-bottom:4px">'+h(rg.txt)+'</div>';
    x+='<div class="a26-cols"><div class="a26-col"><div class="a26-note"><b>KATRD 2026</b></div>'+(rg.kr.map(recLine).join("")||'<div class="a26-note">—</div>')+'</div>';
    x+='<div class="a26-col"><div class="a26-note"><b>GINA 2026</b></div>'+(rg.gina.map(recLine).join("")||'<div class="a26-note">—</div>')+'</div></div>';
    var ps=rg.products.map(function(id){ return byId[id]; }).filter(Boolean);
    if(ps.length) x+='<details class="a26-d"><summary>제품 · 급여 ('+h(ps.length)+')</summary><div class="a26-body">'+ps.map(prodRow).join("")+'</div></details>';
    x+='</div>';
  });
  if(a.other.length) x+='<details class="a26-d"><summary>다른 치료 · 비권고 ('+h(a.other.length)+')</summary><div class="a26-body">'+a.other.map(recLine).join("")+'</div></details>';
  if(a.advice.length) x+='<div class="a26-card care"><div class="a26-ch">점검 · 관리</div>'+a.advice.map(recLine).join("")+'</div>';
  var cur=a.drugs.filter(function(d){ return d.current; });
  if(cur.length) x+='<details class="a26-d"><summary>현재 처방 급여 판정 ('+h(cur.length)+')</summary><div class="a26-body">'+cur.map(prodRow).join("")+'</div></details>';
  if(a.biologics) x+=bioHTML(a.biologics);
  if(a.conflicts.length) x+='<div class="a26-card pay"><div class="a26-ch">⚖ 지침 ⟷ 급여 상충</div>'+a.conflicts.map(function(c){ return '<div class="a26-conf"><b>'+h(c.x)+'</b><br>지침: '+h(c.gl)+'<br>'+(c.kind==="gl_gl"?"GINA":"급여·허가")+': '+h(c.reimb)+'</div>'; }).join("")+'</div>';
  if(a.flags.length) x+='<div class="a26-card"><div class="a26-ch">플래그</div>'+a.flags.map(function(f){ return '<div class="a26-flag '+h(f.lv)+'">'+h(f.msg)+'</div>'; }).join("")+'</div>';
  x+='<div class="a26-card care"><div class="a26-ch">목표</div>'+a.targets.map(function(tg){ return '<div class="a26-rec">• '+h(tg.label)+'</div>'; }).join("")+'</div>';
  if(a.errata.length) x+='<details class="a26-d"><summary>v1 대비 정정 ('+h(a.errata.length)+')</summary><div class="a26-body">'+a.errata.map(function(id){ var e=errById(id); return '<div class="a26-row"><span class="a26-chip a26-new">'+h(id.split(":").pop())+'</span><b>'+h(e.title)+'</b><div class="a26-note">v1: '+h(e.v1)+'</div><div class="a26-rec">2026: '+h(e.now)+'</div></div>'; }).join("")+'</div></details>';
  return x;
}
function bioHTML(b){
  var x='<div class="a26-card pay" data-a26="bio"><div class="a26-ch">💉 생물학제제 — 표현형 · 급여</div><div class="a26-chips">';
  Object.keys(L.PHENO).forEach(function(k){ if(b.phenotype[k]) x+='<span class="a26-chip a26-gi">'+t(L.PHENO[k])+'</span>'; });
  x+='</div><div class="a26-flag warn">'+h(b.common.lama_warn)+'</div>';
  b.candidates.forEach(function(d){
    x+='<div class="a26-row"><div><span class="nm">'+h(d.label)+'</span> <span class="a26-chip">'+h(d.target_label)+'</span> '+stBadge(d.reimb.status)+(d.pheno_match?' <span class="a26-chip a26-gi">표현형 부합</span>':'')+'</div>';
    d.recs.filter(Boolean).forEach(function(r){ x+=recLine(r); });
    if(d.pred) x+='<div class="a26-note">반응 예측: '+h(d.pred)+'</div>';
    var r=d.reimb;
    if(r.notice && r.notice.length) x+='<div class="a26-note">'+h(noticeLabels(r.notice))+'</div>';
    if(r.missing && r.missing.length) x+='<div class="a26-miss">미충족: '+h(r.missing.join(" · "))+'</div>';
    (r.notes||[]).forEach(function(n){ x+='<div class="a26-note">'+h(n)+'</div>'; });
    if(d.label_note) x+='<div class="a26-note">허가: '+h(d.label_note)+'</div>';
    x+='</div>';
  });
  x+='<div class="a26-note">'+h(b.common.not_met)+' · '+h(b.common.combo)+' · '+h(b.common.switch_txt)+'</div><div class="a26-note">'+h(b.eval)+'</div></div>';
  return x;
}
function aeHTML(ae){
  var x='<div class="a26-card clin" data-a26="ae"><div class="a26-ch">🚨 급성 악화 — '+h(ae.severity.label)+'</div><div class="a26-sub">'+h(ae.severity.txt)+' (KATRD 표 5-4)</div>';
  x+='<div class="a26-cols" style="margin-top:8px"><div class="a26-col"><div class="a26-note"><b>KATRD 2026</b></div>'+ae.kr.map(recLine).join("")+'</div><div class="a26-col"><div class="a26-note"><b>GINA 2026</b></div>'+ae.gina.map(recLine).join("")+'</div></div>';
  x+=ae.dispo.map(function(d){ return '<div class="a26-flag'+(d.id==="admit"?" warn":"")+'">'+h(d.txt)+'</div>'; }).join("")+'</div>';
  return x;
}

/* ---------- 입력 ---------- */
function S(){ return APP.asthma26; }
function inputVal(k){ var v=S().input[k]; return v===undefined||v===null?"":v; }
function fieldHTML(it){
  var v=inputVal(it.k);
  if(it.type==="chip") return '<button type="button" class="a26-tg'+(v?" on":"")+'" onclick="ASTHMA26_UI.toggle('+q(it.k)+')">'+h(it.label)+'</button>';
  if(it.type==="select") return '<div><label>'+h(it.label)+'</label><select onchange="ASTHMA26_UI.set('+q(it.k)+',this.value)">'+it.opts.map(function(o){ return '<option value="'+h(o[0])+'"'+(String(v)===o[0]?" selected":"")+'>'+h(o[1])+'</option>'; }).join("")+'</select></div>';
  return '<div><label>'+h(it.label)+(it.unit?' ('+h(it.unit)+')':'')+'</label><input type="number" inputmode="decimal" value="'+h(v)+'" onchange="ASTHMA26_UI.set('+q(it.k)+',this.value)"></div>';
}
function groupHTML(items){
  var chips=items.filter(function(i){ return i.type==="chip"; }), rest=items.filter(function(i){ return i.type!=="chip"; });
  return (rest.length?'<div class="a26-in">'+rest.map(fieldHTML).join("")+'</div>':'')+(chips.length?'<div class="a26-chips">'+chips.map(fieldHTML).join("")+'</div>':'');
}
function productPicker(){
  var sel=S().input.products||[], x='';
  Object.keys(L.KIND).forEach(function(kind){
    var ps=D.PRODUCTS.filter(function(p){ return p.kind===kind && p.kr_available!==false; }); if(!ps.length) return;
    x+='<div class="a26-note"><b>'+h(L.KIND[kind])+'</b></div><div class="a26-chips">'+ps.map(function(p){ return '<button type="button" class="a26-tg'+(sel.indexOf(p.id)>=0?" on":"")+'" onclick="ASTHMA26_UI.toggleProd('+q(p.id)+')">'+h(p.label)+'</button>'; }).join("")+'</div>';
  });
  return x;
}
function inputsHTML(){
  var x='', open=S().open;
  D.INPUT_GROUPS.forEach(function(g, gi){
    var its=D.INPUTS.filter(function(i){ return i.grp===g[0]; });
    var isOpen = open[g[0]]!==undefined ? open[g[0]] : gi<D.INPUT_GROUPS.length-1;
    x+='<details class="a26-d"'+(isOpen?" open":"")+' ontoggle="ASTHMA26_UI.openGrp('+q(g[0])+',this.open)"><summary>'+h(g[1])+'</summary><div class="a26-body">'+(g[0]==="tx"?productPicker():'')+groupHTML(its)+'</div></details>';
  });
  var aeOpen = S().open.ae!==undefined ? S().open.ae : !!S().input.ae_on;
  x+='<details class="a26-d"'+(aeOpen?" open":"")+' ontoggle="ASTHMA26_UI.openGrp(\'ae\',this.open)"><summary>🚨 급성 악화 모드</summary><div class="a26-body">'+groupHTML(D.AE_INPUTS)+'</div></details>';
  return x;
}
function casesHTML(target){
  return '<div class="a26-cases">'+D.SIM_CASES.map(function(c){ return '<button type="button" class="'+(S().simCase===c.id?"on":"")+'" onclick="ASTHMA26_UI.loadCase('+q(c.id)+')"><b>'+h(c.id.split(":").pop().toUpperCase())+'</b> '+h(c.title)+(c.note?'<div class="a26-note">'+h(c.note)+'</div>':'')+'</button>'; }).join("")+'</div>';
}
function sourcesHTML(){
  return '<div class="a26-foot a26-src"><b>출처</b><br>'+D.SOURCES.map(function(s){ return h(s.label)+' — <a href="'+h(s.url)+'" target="_blank" rel="noopener">'+h(s.url)+'</a>'; }).join("<br>")+'<br>급여: 심평원 고시 원문 '+h(D.META.reimb_checked)+' 재검증 · 판단은 진료의에게 있습니다.</div>';
}
function flowHTML(){
  var x='<button type="button" class="back-btn" onclick="switchTab(\'lib\')">‹ 도서관</button>';
  x+='<h2 class="topic-h">⚡ 플로우 — 실환자 적용</h2><p class="topic-sub">만 '+h(TH[D.META.flow_age_min_th])+'세 이상 · 입력하면 KATRD 2026(권고 위치) · GINA 2026(Evidence) · 심평원 급여(제품 단위)를 함께 판정합니다.</p>';
  x+='<details class="a26-d"><summary>증례 불러오기 ('+h(D.SIM_CASES.length)+')</summary><div class="a26-body">'+casesHTML()+'</div></details>';
  x+=inputsHTML();
  x+='<div style="display:flex;gap:8px;margin:8px 0"><button type="button" class="a26-btn ghost" onclick="ASTHMA26_UI.reset()">입력 초기화</button></div>';
  var a=E.applyAsthma2026(S().input); S().result=a;
  x+=resultHTML(a);
  x+=sourcesHTML();
  return x;
}

/* ---------- 도서관 2026 블록 ---------- */
function stepsHTML(){
  var x='<table class="a26-tbl"><tr><th style="width:12%">단계</th><th>초기 기준(표 4-4)</th><th>1안(선호)</th><th>2안(대안)</th></tr>';
  D.STEP_TABLE.forEach(function(s){ var a=s.t1_init||s.t1, b=s.t2_init||s.t2;
    x+='<tr><td>'+h(s.step)+'</td><td>'+h(s.init_txt)+'</td><td>'+h(a.txt)+'</td><td>'+h(b.txt)+'</td></tr>'; });
  x+='</table>';
  var s5=D.STEP_TABLE[D.STEP_TABLE.length-1];
  x+='<div class="a26-note" style="margin-top:6px"><b>추적 중 5단계</b>: '+h(s5.t1.txt)+' / '+h(s5.t2.txt)+'</div>';
  D.STEP_TABLE.forEach(function(s){ var ids=(s.t1.recs||[]).concat(s.t2.recs||[]).concat(s.other||[]);
    x+='<details class="a26-d"><summary>'+h(s.step)+'단계 근거</summary><div class="a26-body">'+ids.map(E.recView).map(recLine).join("")+'</div></details>'; });
  return x;
}
function martHTML(){
  var x='<table class="a26-tbl"><tr><th>제품(KATRD 표 4-6)</th><th>1–2단계</th><th>3단계</th><th>4–5단계</th><th style="width:13%">최대</th></tr>';
  D.MART.rows.forEach(function(r){ x+='<tr><td>'+h(r.label)+'</td><td>'+h(r.s12)+'</td><td>'+h(r.s3)+'</td><td>'+h(r.s45)+'</td><td>'+h(r.kr_max)+'</td></tr>'; });
  x+='</table><div class="a26-note">'+h(D.MART.note)+'</div>';
  D.PRODUCTS.filter(function(p){ return p.mart; }).forEach(function(p){ x+='<div class="a26-rec">• <b>'+h(p.label)+'</b> 허가: '+t(p.label_note)+'</div>'; });
  return x;
}
function icsHTML(){
  return '<table class="a26-tbl"><tr><th>약제</th><th>저</th><th>중간</th><th>고</th></tr>'+D.ICS_DOSE.map(function(r){ return '<tr><td>'+h(r.label)+(r.note?'<div class="a26-note">'+h(r.note)+'</div>':'')+'</td><td>'+h(r.low)+'</td><td>'+h(r.med)+'</td><td>'+h(r.high)+'</td></tr>'; }).join("")+'</table><div class="a26-note">성인 µg/일 · 고용량 ICS-LABA는 '+h(TH.high_ics_months_lo)+'–'+h(TH.high_ics_months_hi)+'개월 단기만(KATRD)</div>';
}
function ruleTxt(rid){ var r=D.REIMB_2026[rid]; if(!r) return ""; return r.gate? gateHTML(r.gate) : ''; }
function reimbHTML(kinds){
  var x='';
  D.PRODUCTS.filter(function(p){ return kinds.indexOf(p.kind)>=0; }).forEach(function(p){
    var r=p.reimb?D.REIMB_2026[p.reimb]:null;
    x+='<details class="a26-d"><summary>'+h(p.label)+' — '+(p.kr_available===false?'국내 미허가':h(r?r.title:'일반원칙'))+'</summary><div class="a26-body">';
    if(p.notice && p.notice.length) x+='<div class="a26-note">'+h(noticeLabels(p.notice))+'</div>';
    if(r && r.gate) x+=gateHTML(r.gate);
    if(r) (r.notes||[]).forEach(function(n){ x+='<div class="a26-note">'+t(n)+'</div>'; });
    if(p.label_note) x+='<div class="a26-note">허가: '+t(p.label_note)+'</div>';
    x+='</div></details>';
  });
  return x;
}
function bioLibHTML(){
  var x='<div class="a26-flag warn">'+t(D.BIO_COMMON26.lama_warn)+'</div>'+reimbHTML(["biologic"]);
  x+='<div class="a26-note">'+t(D.BIO_COMMON26.combo)+' · '+t(D.BIO_COMMON26.switch)+'</div><div class="a26-note">'+t(D.BIO_EVAL)+'</div>';
  Object.keys(D.BIO_PRED).forEach(function(k){ x+='<div class="a26-rec">• '+h(E.drugCls(k)?(D.CLASS_ADD[E.drugCls(k)]||{}).label:k)+' ('+h(k.split(":").pop())+'): '+t(D.BIO_PRED[k])+'</div>'; });
  return x;
}
function aeLibHTML(){
  var x='<table class="a26-tbl"><tr><th>중증도</th><th>KATRD 표 5-4</th></tr>'+D.AE_SEVERITY.map(function(s){ return '<tr><td>'+h(s.label)+'</td><td>'+t(s.txt)+'</td></tr>'; }).join("")+'</table>';
  var ids=D.REC_2026.filter(function(r){ return r.scope==="ae"; }).map(function(r){ return E.recView(r.id); });
  x+='<div class="a26-cols" style="margin-top:8px"><div class="a26-col"><div class="a26-note"><b>KATRD 2026</b></div>'+ids.filter(function(r){ return r.guideline==="gl:asthma:katrd-2026"; }).map(recLine).join("")+'</div><div class="a26-col"><div class="a26-note"><b>GINA 2026</b></div>'+ids.filter(function(r){ return r.guideline==="gl:asthma:gina-2026"; }).map(recLine).join("")+'</div></div>';
  return x;
}
function testsHTML(){
  return D.TESTS_PAY.map(function(tp){ return '<div class="a26-row"><span class="nm">'+h(tp.name)+'</span> <span class="a26-st '+(tp.pay==="급여"?"ok":"bad")+'">'+h(tp.pay)+'</span><div class="a26-note">'+t(tp.cut)+'</div>'+(tp.src?'<div class="a26-note">근거: '+h(tp.src)+'</div>':'')+'</div>'; }).join("");
}
function confLibHTML(){ return D.CONFLICTS.map(function(c){ return '<div class="a26-conf"><b>'+h(c.x)+'</b><br>지침: '+t(c.gl)+'<br>'+(c.kind==="gl_gl"?"GINA":"급여·허가")+': '+t(c.reimb)+'</div>'; }).join(""); }
function errLibHTML(ids){ return (ids||D.ERRATA.map(function(e){ return e.id; })).map(function(id){ var e=errById(id); return e?'<div class="a26-row"><span class="a26-chip a26-new">'+h(id.split(":").pop())+'</span><b>'+h(e.title)+'</b><div class="a26-note">v1: '+h(e.v1)+'</div><div class="a26-rec">2026: '+h(e.now)+'</div></div>':''; }).join(""); }
function libSection(key){
  return { steps:stepsHTML, mart:martHTML, ics:icsHTML, reimb:function(){ return reimbHTML(["inhaler","reliever","oral"]); }, bio:bioLibHTML, ae:aeLibHTML,
    tests:testsHTML, conflicts:confLibHTML, errata:function(){ return errLibHTML(); }, sources:function(){ return sourcesHTML(); } }[key]();
}
function libBlockHTML(){
  var x='<div class="a26-card pay" data-a26="lib"><div class="a26-ch">🆕 2026 개정 — KATRD 6차 · GINA 2026 · 급여 원문</div>';
  x+=D.LIB.concepts.map(function(c){ return '<div class="a26-rec">• '+h(c)+'</div>'; }).join("");
  L.LIB_SECTIONS.forEach(function(s){ x+='<details class="a26-d"><summary>'+h(s[1])+'</summary><div class="a26-body">'+libSection(s[0])+'</div></details>'; });
  return x+'</div>';
}
var TOPIC_EXTRA = { tracks:"steps", inhaler:"reimb", biologic:"bio", exac:"ae", monitor:"tests", pheno:"bio" };
function topicBoxHTML(id){
  var ids=D.TOPIC_ERRATA[id]||[], ex=TOPIC_EXTRA[id];
  if(!ids.length && !ex) return "";
  var x='<div class="a26-card pay" data-a26="topic"><div class="a26-ch">🆕 2026 갱신 — 이 토픽의 v1 서술 정정</div>';
  if(ids.length) x+=errLibHTML(ids);
  if(ex){ var lab=L.LIB_SECTIONS.filter(function(s){ return s[0]===ex; })[0]; x+='<details class="a26-d"><summary>'+h(lab?lab[1]:ex)+'</summary><div class="a26-body">'+libSection(ex)+'</div></details>'; }
  return x+'</div>';
}

/* ---------- 부착 ---------- */
function syncTabs(){
  ["lib","flow","sim"].forEach(function(k){ var b=document.getElementById("tab-"+k); if(b) b.className="tab"+(APP.tab===k?" on":""); });
}
function ensureTab(){
  if(document.getElementById("tab-flow")) return;
  var lib=document.getElementById("tab-lib"); if(!lib) return;
  var b=document.createElement("button"); b.type="button"; b.className="tab"; b.id="tab-flow"; b.textContent="⚡ 플로우";
  b.setAttribute("onclick","switchTab('flow')");
  lib.parentNode.insertBefore(b, lib.nextSibling);
}
function decorate(){
  var v=document.getElementById("view"); if(!v) return;
  if(APP.tab==="lib" && !APP.topic && !v.querySelector('[data-a26="lib"]')){
    var wrap=document.createElement("div"); wrap.setAttribute("data-a26","libwrap");
    wrap.innerHTML='<button type="button" class="intro-card" data-a26="flowintro" onclick="switchTab(\'flow\')"><div class="intro-t">⚡ 플로우 — 실환자 적용</div><div class="intro-d">나이·현재 흡입제·증상·악화·호산구를 넣으면 KATRD 2026·GINA 2026 권고와 제품별 급여를 함께 판정합니다</div></button>'+libBlockHTML();
    v.insertBefore(wrap, v.firstChild);
    Array.prototype.forEach.call(v.querySelectorAll(".topic-card"), function(card){
      var m=/openTopic\('(\w+)'\)/.exec(card.getAttribute("onclick")||""); if(!m) return;
      if((D.TOPIC_ERRATA[m[1]]||[]).length || TOPIC_EXTRA[m[1]]){ var c=document.createElement("span"); c.className="a26-chip a26-new"; c.textContent="2026 갱신"; c.setAttribute("data-a26","tchip"); card.appendChild(c); }
    });
  }
  if(APP.tab==="lib" && APP.topic && !v.querySelector('[data-a26="topic"]')){
    var html=topicBoxHTML(APP.topic);
    if(html){ var box=document.createElement("div"); box.innerHTML=html; var anchor=v.querySelector(".topic-sub")||v.querySelector(".topic-h"); var node=box.firstChild;
      if(anchor && anchor.nextSibling) v.insertBefore(node, anchor.nextSibling); else v.appendChild(node); }
  }
  if(APP.tab==="sim" && !v.querySelector('[data-a26="sim"]')){
    var sb=document.createElement("div"); sb.setAttribute("data-a26","sim");
    if(!APP.sim.route) sb.innerHTML='<div class="a26-card care"><div class="a26-ch">🆕 2026 증례 — 플로우로 불러오기</div>'+casesHTML()+'</div>';
    else if(APP.sim.route==="biologic") sb.innerHTML='<div class="a26-flag warn">'+t(D.BIO_COMMON26.lama_warn)+'</div>';
    else if(APP.sim.route==="acute") sb.innerHTML='<div class="a26-flag warn">2026 갱신(AE12): '+h(errById("asthma:err:AE12").now)+'</div>';
    else if(APP.sim.route==="new") sb.innerHTML='<div class="a26-flag">2026 갱신(AE18): '+h(errById("asthma:err:AE18").now)+'</div>';
    if(sb.innerHTML){ var crumb=v.querySelector(".sim-crumb"); if(crumb && crumb.nextSibling) v.insertBefore(sb, crumb.nextSibling); else v.insertBefore(sb, v.firstChild); }
  }
}
function modalBanner(){
  var mc=document.getElementById("modalContent"); if(!mc || mc.querySelector('[data-a26="modal"]')) return;
  var p=D.BIO_V1_PATCH[APP.rcheck&&APP.rcheck.drugId]; if(!p) return;
  var e=errById(p.err), n=D.NOTICES[p.notice];
  var div=document.createElement("div"); div.setAttribute("data-a26","modal"); div.className="a26-banner";
  div.innerHTML='<b>2026 원문 기준</b> — '+h(n.label)+'('+h(n.date)+')<br>'+t(D.BIO_COMMON26.lama_warn)+'<br><span class="a26-chip a26-new">정정 '+h(p.err.split(":").pop())+'</span>'+h(e.now)+'<br><a href="#" onclick="switchTab(\'flow\');document.getElementById(\'modalBg\').className=\'modal-bg\';return false;">⚡ 환자 입력으로 자동 판정(플로우) →</a>';
  var head=mc.querySelector(".modal-head"); if(head && head.nextSibling) mc.insertBefore(div, head.nextSibling); else mc.insertBefore(div, mc.firstChild);
}

/* ---------- 액션 ---------- */
function rerender(){ window.render(); }
var api = {
  set:function(k, val){ var it=D.INPUTS.concat(D.AE_INPUTS).filter(function(i){ return i.k===k; })[0];
    if(it && it.type==="number"){ if(val===""||val===null) delete S().input[k]; else S().input[k]=Number(val); } else S().input[k]=val;
    S().simCase=null; rerender(); },
  toggle:function(k){ S().input[k]=!S().input[k]; if(k==="ae_on") S().open.ae=S().input[k]; S().simCase=null; rerender(); },
  toggleProd:function(id){ var a=S().input.products||(S().input.products=[]); var i=a.indexOf(id); if(i>=0) a.splice(i,1); else a.push(id); S().simCase=null; rerender(); },
  openGrp:function(g, isOpen){ S().open[g]=!!isOpen; },
  reset:function(){ S().input={ products:[] }; S().simCase=null; S().open={}; rerender(); },
  loadCase:function(id){ var c=D.SIM_CASES.filter(function(x){ return x.id===id; })[0]; if(!c) return;
    S().input=JSON.parse(JSON.stringify(c.input)); if(!S().input.products) S().input.products=[]; S().simCase=id; S().open={ bio:!!(c.input.bio_eval||c.input.eos), ae:!!c.input.ae_on };
    if(APP.tab!=="flow") window.switchTab("flow"); else rerender(); },
  flowHTML:flowHTML, resultHTML:resultHTML, libBlockHTML:libBlockHTML, topicBoxHTML:topicBoxHTML, decorate:decorate, syncTabs:syncTabs
};

/* render · renderModal 래핑 */
var v1Render = window.render, v1Modal = window.renderModal;
window.render = function(scrollTop){
  ensureCss(); ensureTab();
  if(APP.tab==="flow"){ var v=document.getElementById("view"); v.innerHTML=flowHTML(); if(scrollTop) window.scrollTo(0,0); }
  else { v1Render.apply(this, arguments); decorate(); }
  syncTabs();
};
window.renderModal = function(){ v1Modal.apply(this, arguments); modalBanner(); };
window.render();
return api;
})(ASTHMA26, ASTHMA26_ENGINE);
