/* ===================================================================
   hf v2 UI — DOM 가산만 (v1 렌더 함수·이벤트 무수정)
   플로우: 2026 입력 카드 + 2026 판정 카드, v1 결과는 details.hf26-legacy로 접음
   도서관: 2026 카드 prepend · 시뮬: 2026 증례 · 푸터: 2026 출처
   =================================================================== */
(function(D, E){
"use strict";
var $=function(s,r){ return (r||document).querySelector(s); }, $$=function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var REC={}; D.REC_2026.forEach(function(r){ REC[r.id]=r; });
var CONF={}; D.CONFLICTS.forEach(function(c){ CONF[c.id]=c; });
var ERR={}; D.ERRATA.forEach(function(e){ ERR[e.id]=e; });

var CSS='.hf26-sum{list-style:none;cursor:pointer}.hf26-sum::-webkit-details-marker{display:none}'+
 '.hf26-tier{font-weight:800;font-size:12.5px;color:var(--hf-deep);margin:12px 2px 4px}'+
 '.hf26-ban{border-radius:10px;padding:9px 12px;margin:6px 0;font-size:12.5px;background:var(--hf-soft);color:var(--hf-ink);font-weight:700}'+
 '.hf26-gate{margin:4px 0 4px 2px;padding:0;list-style:none;font-size:12px}.hf26-gate ul{list-style:none;padding-left:14px;margin:2px 0}'+
 '.hf26-gate li.ok::before{content:"\\2713  ";color:var(--hf-cover);font-weight:800}.hf26-gate li.no::before{content:"\\2717  ";color:var(--hf-noncover);font-weight:800}'+
 '.hf26-gate li.grp{font-weight:700;color:var(--hf-mut)}'+
 '.hf26-tbl{width:100%;border-collapse:collapse;font-size:12px}.hf26-tbl td,.hf26-tbl th{border-bottom:1px solid var(--hf-line);padding:5px 4px;text-align:left;vertical-align:top}'+
 '.hf26-mini{font-size:11.5px;color:var(--hf-mut);margin-top:3px}.hf26-legacy>summary{cursor:pointer;font-weight:700;font-size:12.5px;color:var(--hf-mut);padding:8px 2px}'+
 '.hf26-in .chips{margin-top:4px}.hf26-case{display:block;width:100%;text-align:left;margin:6px 0}.hf26-old{font-size:11px;font-weight:700;color:var(--hf-mut);background:var(--hf-bg);border:1px dashed var(--hf-line);border-radius:8px;padding:6px 9px;margin:6px 0}';

function gradeBadge(g){ return '<span class="bdg bdg-cor-'+esc(g)+'">'+esc(g)+'</span>'; }
function loeBadge(l){ var c=l==="A"?"var(--hf-loeA)":(l==="C"?"var(--hf-loeC)":"var(--hf-loeB)");
  return '<span class="bdg bdg-loe"><span class="loe-dot" style="background:'+c+'"></span>LoE '+esc(l)+'</span>'; }
function reimbBadge(st){ var s=D.REIMB_STATUS[st]||{label:st,tone:"cond"}; return '<span class="bdg bdg-'+s.tone+'">'+esc(s.label)+'</span>'; }
function noticeLabel(n){ if(!n) return ""; var arr=Array.isArray(n)?n:[n];
  return arr.map(function(id){ var x=D.NOTICES[id]; return x?x.label+'('+x.date+')':id; }).join(' · '); }

function gateHTML(node){
  if(!node) return "";
  if(node.leaf) return '<li class="'+(node.pass?"ok":"no")+'">'+esc(node.txt)+'</li>';
  var head=node.label?'<li class="grp">'+esc(node.label)+' ('+(node.op==="AND"?"모두":"하나 이상")+')</li>':'';
  return head+'<li><ul>'+node.children.map(gateHTML).join('')+'</ul></li>';
}
function reimbDetail(rb){
  var h='<div class="hf26-mini"><b>급여</b> '+reimbBadge(rb.status)+(rb.title?' '+esc(rb.title):'')+(rb.notice?' · '+esc(noticeLabel(rb.notice)):'')+'</div>';
  if(rb.tree) h+='<ul class="hf26-gate">'+gateHTML(rb.tree)+'</ul>';
  (rb.notes||[]).forEach(function(n){ if(n) h+='<div class="hf26-mini">· '+esc(n)+'</div>'; });
  return h;
}
function drugHTML(d){
  var r=REC[d.rec];
  var h='<div class="rec-item"><div class="rh"><span class="nm">'+esc(d.label)+' <small style="font-weight:500;color:var(--hf-mut)">'+esc(d.clsLabel)+'</small></span></div>'+
    '<div class="badges">'+gradeBadge(d.grade)+loeBadge(d.loe)+reimbBadge(d.reimb.status)+'</div>';
  if(r) h+='<div class="role">'+esc(r.text)+' <span class="hf26-mini">('+esc(r.cite)+')</span></div>';
  if(d.brand) h+='<div class="hf26-mini">'+esc(d.brand)+'</div>';
  if(d.dose) h+='<div class="hf26-mini"><b>용량</b> '+esc(d.dose.start)+' → '+esc(d.dose.target)+(d.dose.note?' · '+esc(d.dose.note):'')+(d.dose.src!==D.DOSE_SRC?' <i>('+esc(d.dose.src)+')</i>':'')+'</div>';
  d.safety.forEach(function(s){ h+='<div class="'+(s.lv==="warn"?"warnbox":"infobox")+'" style="margin:5px 0;padding:6px 9px">'+esc(s.msg)+'</div>'; });
  h+='<details><summary class="hf26-sum hf26-mini">급여 판정 상세 ▾</summary>'+reimbDetail(d.reimb)+'</details>';
  if(d.recs.length>1) h+='<div class="hf26-mini">관련 권고: '+d.recs.map(function(id){ var x=REC[id]; return esc(x.grade+'/'+x.loe); }).join(' · ')+'</div>';
  return h+'</div>';
}
function resultHTML(res){
  var v=res.vars||{};
  if(res.phenotype26==="none") return '<div class="infobox">ESC 2026 판정: LVEF를 입력하세요.</div>';
  var P=D.PHENO26["hf:pheno26:"+res.phenotype26];
  var h='<div class="card lead hf26-res" id="hf26Result"><div class="head"><span class="emoji">🆕</span><div class="t">ESC 2026 판정 <small>한국 레이어 KSHF 2022 · 급여 HIRA 원문 2026-11-01</small></div></div><div class="body">';
  h+='<div class="hf26-ban">ESC 2026: '+esc(P.label)+' ('+esc(P.rule)+') · KSHF 2022: '+esc(res.kshfLabel||"—")+'</div>';
  if(res.band4149) h+='<div class="infobox">'+esc(D.PHENO26["hf:pheno26:band4149"].text)+'</div>';
  if(res.impef) h+='<div class="infobox">'+esc(D.PHENO26["hf:pheno26:impef"].text)+'</div>';
  res.conflicts.forEach(function(id){ var c=CONF[id];
    h+='<div class="conflictbox"><b>⚖️ 지침 ⟷ 급여 상충</b><div>📘 '+esc(c.gl)+'</div><div>💰 '+esc(c.rb)+'</div></div>'; });
  if(res.avoid.length){ h+='<div class="warnbox"><b>⛔ 금기·권고하지 않음 (Class III)</b>'+res.avoid.map(function(a){ return '<div>· '+esc(a.label)+' — '+esc(a.text)+'</div>'; }).join('')+'</div>'; }
  var tiers=Object.keys(D.TIERS).sort(function(a,b){ return D.TIERS[a].order-D.TIERS[b].order; });
  tiers.forEach(function(t){
    var ds=res.drugs.filter(function(d){ return d.tier===t; });
    var ps=res.recs.map(function(id){ return REC[id]; }).filter(function(r){ return r.tier===t && (!r.drugs||!r.drugs.length); });
    if(!ds.length && !ps.length) return;
    h+='<div class="hf26-tier">'+esc(D.TIERS[t].label)+' <span class="hf26-mini">'+esc(D.TIERS[t].desc)+'</span></div>';
    ds.forEach(function(d){ h+=drugHTML(d); });
    ps.forEach(function(r){ h+='<div class="rec-item"><div class="role" style="color:var(--hf-ink)">'+esc(r.text)+'</div><div class="badges">'+gradeBadge(r.grade)+loeBadge(r.loe)+'</div></div>'; });
  });
  if(res.unavailable.length) h+='<div class="infobox"><b>국내 미허가(참고)</b>'+res.unavailable.map(function(d){ return '<div>· '+esc(d.label)+' — '+esc(d.kr_note||"")+'</div>'; }).join('')+'</div>';
  res.flags.filter(function(f){ return f.lv!=="conflict"; }).forEach(function(f){ h+='<div class="'+(f.lv==="warn"?"warnbox":"infobox")+'">'+esc(f.msg)+'</div>'; });
  if(res.errata.length) h+='<div class="kbox kbox-green"><b>🔧 v1 정정 반영</b>'+res.errata.map(function(id){ var e=ERR[id]; return '<div>'+esc(id.replace("hf:err:",""))+' · '+esc(e.current)+'</div>'; }).join('')+'</div>';
  h+='<div class="disclaimer">ESC 2026 권고는 한국어 의역(원문 미수록)이며 Class/LoE는 원문 표기입니다. 급여 판정은 입력값 기반 참고 — 청구 전 고시 원문·품목 허가사항을 확인하세요.</div>';
  return h+'</div></div>';
}

/* ---------- 입력 ---------- */
function inputCardHTML(ns){
  var fl=D.INPUTS.filter(function(i){ return i.type!=="chip"; }), ch=D.INPUTS.filter(function(i){ return i.type==="chip"; });
  var h='<div class="card lead hf26-in" id="hf26Input'+(ns==="sim"?"Sim":"")+'"><div class="head"><span class="emoji">🆕</span><div class="t">ESC 2026·급여 추가 입력 <small>선택 — 비워 두면 해당 조건은 미충족으로 판정</small></div></div><div class="body"><div class="form-grid">';
  fl.forEach(function(i){
    if(i.type==="select") h+='<div class="fld"><label>'+esc(i.label)+'</label><select data-k26="'+esc(i.k)+'">'+i.opts.map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join('')+'</select></div>';
    else h+='<div class="fld"><label>'+esc(i.label)+'</label><input type="number" inputmode="decimal" data-k26="'+esc(i.k)+'" placeholder="'+esc(i.ph||"")+'"></div>';
  });
  h+='</div><div class="chips">'+ch.map(function(i){ return '<button class="chip" data-chip26="'+esc(i.k)+'">'+esc(i.label)+'</button>'; }).join('')+'</div></div></div>';
  return h;
}
function collect(scopeSel, chipsSel, inCard){
  var p={};
  $$(scopeSel+' [data-k]').forEach(function(inp){ if(inp.value!=="") p[inp.getAttribute("data-k")]=inp.value; });
  $$(chipsSel+' .chip.sel').forEach(function(c){ p[c.getAttribute("data-chip")]=true; });
  if(inCard){ $$('[data-k26]',inCard).forEach(function(inp){ if(inp.value!=="") p[inp.getAttribute("data-k26")]=inp.value; });
    $$('[data-chip26].sel',inCard).forEach(function(c){ p[c.getAttribute("data-chip26")]=true; }); }
  return p;
}
function runFlow(){
  var out=$('#flowResult'); if(!out) return;
  var p=collect('#sec-flow','#flowChips',$('#hf26Input'));
  var res=E.applyHf2026(p);
  var legacy=out.innerHTML;
  out.innerHTML=resultHTML(res)+(legacy?'<details class="hf26-legacy"><summary>이전 지침(v1 · KSHF 2022/ESC 2023) 결과 보기 ▾</summary>'+legacy+'</details>':'');
}

/* ---------- 도서관 ---------- */
function libCard(id, emoji, title, sub, body){
  return '<details class="card lead hf26-libcard" id="'+id+'"><summary class="head hf26-sum"><span class="emoji">'+emoji+'</span><div class="t">'+esc(title)+(sub?' <small>'+esc(sub)+'</small>':'')+'</div><span class="chev">▾</span></summary><div class="body">'+body+'</div></details>';
}
function recRow(r){ return '<tr><td>'+gradeBadge(r.grade)+' '+loeBadge(r.loe)+'</td><td>'+esc(r.text)+' <span class="hf26-mini">'+esc(r.cite)+(r.scope==="library"?' · 도서관':'')+(r.change&&r.change!=="same"?' · '+esc(r.change):'')+'</span></td></tr>'; }
function sortedRecs(list){ return list.slice().sort(function(a,b){ var g=D.REC_SYSTEMS["recsys:esc"]; var x=g.grade[a.grade].rank-g.grade[b.grade].rank; if(x) return x; return g.loe_rank[a.loe]-g.loe_rank[b.loe]; }); }
function gateText(node, depth){
  if(!node) return "";
  if(!node.op) return '<li>'+esc(node.txt)+'</li>';
  return (node.label?'<li class="grp">'+esc(node.label)+'</li>':'')+'<li class="grp">'+(node.op==="AND"?"모두 충족":"하나 이상")+'</li><li><ul>'+node.conds.map(function(c){ return gateText(c, depth+1); }).join('')+'</ul></li>';
}
function renderLib(){
  var sec=$('#sec-lib'); if(!sec||$('#hf26-lib')) return;
  var tiers=Object.keys(D.TIERS).sort(function(a,b){ return D.TIERS[a].order-D.TIERS[b].order; });
  var all='<div class="hf26-mini">총 '+D.REC_2026.length+'건 (엔진 판정 '+D.REC_2026.filter(function(r){ return r.scope==="rx"; }).length+' · 도서관 '+D.REC_2026.filter(function(r){ return r.scope==="library"; }).length+')</div>';
  tiers.forEach(function(t){ var rs=sortedRecs(D.REC_2026.filter(function(r){ return r.tier===t; })); if(!rs.length) return;
    all+='<div class="hf26-tier">'+esc(D.TIERS[t].label)+'</div><table class="hf26-tbl">'+rs.map(recRow).join('')+'</table>'; });
  var tierBody=tiers.map(function(t){ return '<div class="rec-item"><b>'+esc(D.TIERS[t].label)+'</b><div class="role">'+esc(D.TIERS[t].desc)+'</div></div>'; }).join('')+
    '<div class="hf26-mini">v1 치료축 대응: '+Object.keys(D.AXIS_TIER).map(function(a){ return esc(a.replace("axis:",""))+'→'+esc(D.TIERS[D.AXIS_TIER[a]].label.split(" ")[0]); }).join(' · ')+'</div>';
  var doseRows=Object.keys(D.DOSE_2026).map(function(did){ var info=E.drugInfo(did), d=D.DOSE_2026[did];
    return '<tr><td><b>'+esc(info?info.label_ko:did)+'</b></td><td>'+esc(d.start)+'</td><td>'+esc(d.target)+(d.note?'<div class="hf26-mini">'+esc(d.note)+'</div>':'')+'</td></tr>'; }).join('');
  var safety=D.SAFETY.map(function(s){ return '<div class="'+(s.lv==="warn"?"warnbox":"infobox")+'">'+esc(E.tpl(s.msg))+'</div>'; }).join('');
  var reimb=Object.keys(D.REIMB_2026).map(function(id){ var r=D.REIMB_2026[id];
    var h='<div class="rec-item"><div class="rh"><span class="nm">'+esc(r.title)+'</span>'+(r.fixed?reimbBadge(r.fixed):'')+'</div><div class="hf26-mini">'+esc(noticeLabel(r.notice))+'</div>';
    if(r.gate) h+='<ul class="hf26-gate">'+gateText(r.gate,0)+'</ul>';
    if(r.selective) h+='<div class="hf26-mini">· '+esc(r.selective.txt)+'</div>';
    (r.notes||[]).forEach(function(n){ h+='<div class="hf26-mini">· '+esc(n)+'</div>'; });
    if(r.fallback) h+='<div class="hf26-mini">· '+esc(r.fallback.note)+'</div>';
    return h+'</div>'; }).join('')+'<div class="hf26-mini">세부기준 없음(허가 범위 내 일반 원칙): 디곡신·스피로노락톤·에플레레논·고리이뇨제·로켈마 등</div>';
  var conf=D.CONFLICTS.map(function(c){ return '<div class="conflictbox"><div>📘 '+esc(c.gl)+'</div><div>💰 '+esc(c.rb)+'</div></div>'; }).join('');
  var err='<table class="hf26-tbl"><tr><th>ID</th><th>v1</th><th>현행</th></tr>'+D.ERRATA.map(function(e){ return '<tr><td>'+esc(e.id.replace("hf:err:",""))+'</td><td>'+esc(e.v1_value)+'</td><td>'+esc(e.current)+' <span class="hf26-mini">'+esc(e.src)+'</span></td></tr>'; }).join('')+'</table>';
  var kr=Object.keys(D.NOTES_KR).map(function(k){ return '<div class="rec-item"><div class="role">'+esc(D.NOTES_KR[k])+'</div></div>'; }).join('')+
    '<div class="infobox">'+esc(D.LIB.kshf2026)+'</div>'+
    '<div class="hf26-mini">v1 권고 → 2026 대체: '+Object.keys(D.SUPERSEDED_V1).map(function(k){ return esc(k.replace("hf:rec:",""))+'→'+esc((D.SUPERSEDED_V1[k].map(function(x){ return x.replace("hf:rec26:",""); }).join("+"))||"ESC 권고 없음"); }).join(' · ')+'</div>';
  var html='<div id="hf26-lib">'+
    libCard('hf26-lib-concept','🆕','ESC 2026 핵심 변화','2026-08 발표 · 신규 권고 39',D.LIB.concepts.map(function(c){ return '<div class="rec-item"><div class="role">'+esc(c)+'</div></div>'; }).join('')+'<div class="hf26-mini">'+esc(D.REC_SYSTEMS["recsys:esc"].loe_note)+'</div>')+
    libCard('hf26-lib-tier','🏛️','치료 분류 FMT · AMT · GDIT','',tierBody)+
    libCard('hf26-lib-recs','📋','ESC 2026 권고 전수','등급순 · 의역',all)+
    libCard('hf26-lib-dose','💊','용량표 (시작 → 목표)',D.DOSE_SRC,'<table class="hf26-tbl"><tr><th>약물</th><th>시작</th><th>목표</th></tr>'+doseRows+'</table>')+
    libCard('hf26-lib-safety','⚠️','안전 임계값','ESC 2026 본문·허가',safety)+
    libCard('hf26-lib-reimb','💰','급여 기준 (고시 원문 2026-11-01)','HIRA 보험인정기준',reimb)+
    libCard('hf26-lib-conf','⚖️','지침 ⟷ 허가·급여 상충',D.CONFLICTS.length+'건',conf)+
    libCard('hf26-lib-err','🔧','v1 정정 (errata)',D.ERRATA.length+'건',err)+
    libCard('hf26-lib-kr','🇰🇷','한국 레이어 · KSHF','KSHF 2022 유지 · 2026 개정 대기',kr)+
    '<div class="hf26-old">아래 분야별 카드는 이전 지침(v1 · KSHF 2022/ESC 2023) 기준입니다. 2026 변경·정정은 위 카드를 우선하세요.</div></div>';
  var hub=$('#libHub');
  if(hub) hub.insertAdjacentHTML('beforebegin', html); else sec.insertAdjacentHTML('afterbegin', html);
}

/* ---------- 시뮬레이션 ---------- */
function renderSim(){
  var sec=$('#sec-sim'); if(!sec||$('#hf26-sim')) return;
  var h='<div class="card lead" id="hf26-sim"><div class="head"><span class="emoji">🧪</span><div class="t">ESC 2026 증례 <small>탭하면 2026 엔진 판정(입력값만 저장 — 판정은 매번 계산)</small></div></div><div class="body">';
  D.SIM_CASES.forEach(function(c){ h+='<button class="btn-ghost hf26-case" data-case26="'+esc(c.id)+'"><b>'+esc(c.title)+'</b><div class="hf26-mini">'+esc(c.point)+'</div></button>'; });
  h+='<div id="hf26SimOut" class="result"></div></div></div>';
  sec.insertAdjacentHTML('afterbegin', h);
  $('#hf26-sim').addEventListener('click',function(e){
    var b=e.target.closest('[data-case26]'); if(!b) return;
    var c=null; D.SIM_CASES.forEach(function(x){ if(x.id===b.getAttribute('data-case26')) c=x; });
    if(c) $('#hf26SimOut').innerHTML=resultHTML(E.applyHf2026(c.p));
  });
}

/* ---------- 헤더·푸터 ---------- */
function relabel(){
  $$('.hf-hd .gl span').forEach(function(s){ if(/ESC 2023/.test(s.textContent)) s.textContent='ESC 2026 반영'; });
  var gl=$('.hf-hd .gl'); if(gl && !$('#hf26Ver')) gl.insertAdjacentHTML('beforeend','<span id="hf26Ver">'+esc(D.META.version)+'</span>');
  var sub=$('.hf-hd .sub'); if(sub && !/2026/.test(sub.textContent)) sub.textContent='HFrEF(<50%) · HFpEF(≥50%) — ESC 2026 · KSHF 2022 HFmrEF 병기 · 전문가용 의사결정 조언자';
}
function renderSources(){
  var el=$('#sources'); if(!el||$('#hf26-src')) return;
  el.insertAdjacentHTML('afterbegin','<div id="hf26-src"><h3>🆕 2026 개정 출처</h3><ul>'+D.SOURCES.map(function(s){
    return '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a>'+(s.kind==="secondary"?' <span class="hf26-mini">(2차)</span>':'')+'</li>'; }).join('')+'</ul></div>');
}

function bindChips(card){ if(!card) return; card.addEventListener('click',function(e){ var b=e.target.closest('[data-chip26]'); if(b) b.classList.toggle('sel'); }); }
function init(){
  if(!document.getElementById('hf26-css')){ var st=document.createElement('style'); st.id='hf26-css'; st.textContent=CSS; document.head.appendChild(st); }
  relabel(); renderLib(); renderSim(); renderSources();
  var run=$('#flowRun');
  if(run && !$('#hf26Input')){ run.insertAdjacentHTML('beforebegin', inputCardHTML('flow')); bindChips($('#hf26Input')); run.addEventListener('click', runFlow); }
  var resetBtn=$('#flowReset'); if(resetBtn) resetBtn.addEventListener('click',function(){ $$('#hf26Input [data-k26]').forEach(function(i){ i.value=''; }); $$('#hf26Input .sel').forEach(function(c){ c.classList.remove('sel'); }); });
}
window.__hf26UI={ resultHTML:resultHTML, runFlow:runFlow };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init,0); });
else setTimeout(init,0);
})(HF26, HF26_ENGINE);
