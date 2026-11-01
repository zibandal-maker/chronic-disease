/* ===================================================================
   liver HBV v2 — UI 가산 (DOM 레벨). v1 HBV 모듈은 클로저라 함수 래핑 불가 →
   v1이 그린 DOM에 카드/입력을 덧붙이고, v1 결과는 '이전 지침' 접힘으로 보존.
   모든 문구·수치는 HBV26 DATA에서 읽는다.
   =================================================================== */
(function(){
  var D=HBV26, root=document.getElementById("disease-hbv");
  if(!root) return;
  function $(sel){ return root.querySelector(sel); }
  function E(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function chip(g){ return g ? '<span class="gchip '+E(g)+'">'+E(g)+'</span>' : ''; }
  function rec(id){ return D.REC[id]; }
  function phaseObj(id){ return D.PHASES.filter(function(x){ return x.id===id; })[0]; }
  function drugLabel(id){ return (D.DRUG_NOTES[id]&&D.DRUG_NOTES[id].label) || id.split(":")[1]; }
  var DEC={ treat:"치료 권고", consider:"치료 고려", monitor:"모니터", prophylaxis:"예방 투여 고려", none:"판정 보류" };
  var RST={ ok:'<span class="tag ok">급여 인정</span>', fail:'<span class="tag warn">급여 불인정</span>', need_proof:'<span class="tag warn">조건부 — 섬유화 입증 필요</span>', "n/a":'' };

  /* ---- 스타일 (v1 토큰 재사용, 색 리터럴 없음) ---- */
  var css=document.createElement("style");
  css.textContent=".hbv26-in{border:1px dashed var(--hbv-400);border-radius:11px;padding:10px 12px;margin:10px 0;background:var(--hbv-50)}"+
    ".hbv26-in .h26{font-weight:800;color:var(--hbv-800);margin-bottom:6px}"+
    ".hbv26-legacy{margin-top:14px;border:1px solid var(--line);border-radius:11px;padding:8px 10px;background:var(--paper)}"+
    ".hbv26-legacy>summary{cursor:pointer;font-weight:800;color:var(--ink2)}"+
    ".hbv26-tbl{width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0}.hbv26-tbl td,.hbv26-tbl th{border-bottom:1px solid var(--line);padding:5px 4px;vertical-align:top;text-align:left}"+
    ".hbv26-chip{display:inline-block;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700;background:var(--hbv-100);color:var(--hbv-800);margin-left:6px}"+
    ".hbv26-old{display:inline-block;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700;background:var(--warn-bg);color:var(--warn);margin-left:6px}"+
    ".hbv26-rec{margin:6px 0;font-size:12.5px;line-height:1.45}.hbv26-rec .ko{display:block;font-weight:700;color:var(--ink)}.hbv26-rec .en{display:block;color:var(--ink2)}"+
    ".hbv26-sim{margin-top:8px}";
  document.head.appendChild(css);

  /* ---- 헤더 relabel ---- */
  var ver=root.querySelector("header .ver");
  if(ver) ver.textContent="KASL 2026 · 고시 제2025-177호(2025.11.1.) · HBV v2.0";

  /* ================= 플로우: 2026 입력 ================= */
  var S26={};
  function optHtml(f){ return '<div class="field"><label>'+E(f.label)+'</label><div class="opts" data-k26="'+f.key+'">'+
    f.options.map(function(o){ return '<button type="button" data-v="'+E(o[0])+'">'+E(o[1])+'</button>'; }).join("")+'</div></div>'; }
  function numHtml(f){ return '<div class="field"><label>'+E(f.label)+'</label><input id="hbv26-in-'+f.key+'" type="number" inputmode="numeric" placeholder="'+E(f.ph||"")+'"></div>'; }
  var CORE=["sex","age","ast","fib","dna_undetected"];
  var runBtn=$("#runBtn");
  if(runBtn){
    var box=document.createElement("div"); box.className="hbv26-in"; box.id="hbv26Input";
    var core=D.INPUTS.filter(function(f){ return CORE.indexOf(f.key)>=0; }), rest=D.INPUTS.filter(function(f){ return CORE.indexOf(f.key)<0; });
    box.innerHTML='<div class="h26">🆕 KASL 2026 판정 입력 <span class="kbd">(성별·나이·섬유화로 2026 위험인자·ULN 판정)</span></div>'+
      core.map(function(f){ return f.type==="num"?numHtml(f):optHtml(f); }).join("")+
      '<details><summary class="kbd">＋ 2026 특수상황(임신 계획·신/골 위험·약제 노출력·예방요법 세분)</summary>'+rest.map(function(f){ return f.type==="num"?numHtml(f):optHtml(f); }).join("")+'</details>';
    runBtn.parentNode.insertBefore(box, runBtn);
    box.addEventListener("click", function(e){
      var b=e.target.closest("button[data-v]"); if(!b) return; var grp=b.parentNode, k=grp.getAttribute("data-k26"); if(!k) return;
      var on=b.classList.contains("sel"); grp.querySelectorAll("button").forEach(function(x){ x.classList.remove("sel"); });
      if(!on){ b.classList.add("sel"); S26[k]=b.getAttribute("data-v"); } else delete S26[k];
    });
  }
  function v1sel(k){ var b=root.querySelector('#hbv-tab-flow .opts[data-k="'+k+'"] button.sel'); return b?b.getAttribute("data-v"):null; }
  function v1num(id){ var el=$("#"+id); if(!el||el.value==="") return null; var n=parseFloat(el.value); return isNaN(n)?null:n; }
  function readPatient(){
    var p={ hbeag:v1sel("hbeag"), cirr:v1sel("cirr"), hcc:v1sel("hcc")||"no", preg:v1sel("preg")||"no", bone:v1sel("bone")||"no", resist:v1sel("resist")||"no", immuno:v1sel("immuno")||"no",
            dna:v1num("in-dna"), alt:v1num("in-alt"), egfr:v1num("in-egfr") };
    D.INPUTS.forEach(function(f){ if(f.type==="num"){ var el=$("#hbv26-in-"+f.key); if(el && el.value!=="") p[f.key]=parseFloat(el.value); } else if(S26[f.key]!=null) p[f.key]=S26[f.key]; });
    return p;
  }

  /* ================= 플로우: 2026 결과 렌더 ================= */
  function render26(a){
    var tx=a.txRec?rec(a.txRec):null, ph=a.phase?phaseObj(a.phase):null, h="";
    h+='<div class="card lead"><div class="head"><span class="emoji">🧬</span><span class="t">KASL 2026 판정 '+(tx?chip(tx.grade_original):"")+'</span></div><div class="body">';
    h+='<div style="margin-bottom:6px"><span class="tag gl">'+E(ph?ph.ko:"단계 미정")+'</span> <span class="tag gl">'+E(DEC[a.decision]||a.decision)+'</span> '+RST[a.reimb.tx.status]+'</div>';
    h+='<div class="dual"><div class="layer gl"><div class="lh">🩺 지침 (KASL 2026)</div>'+E(tx?tx.ko:(ph?ph.action:"입력 확인 필요"))+(ph?'<div class="kbd">'+E(ph.def)+'</div>':'')+'</div>';
    h+='<div class="layer rb"><div class="lh">⚖️ 급여 (고시 제2025-177호)</div>'+E(a.reimb.tx.reason)+'<div class="kbd">'+E(D.REIMB[a.reimb.tx.rule]?D.REIMB[a.reimb.tx.rule].art:"")+'</div></div></div>';
    a.conflicts.forEach(function(id){ var c=D.CONFLICTS.filter(function(x){ return x.id===id; })[0];
      h+='<div class="clash"><b>⚠️ 지침 ⟷ 급여 상충.</b> 지침: '+E(c.text_guideline)+' / 급여: '+E(c.text_reimb)+'</div>'; });
    if(tx && tx.reimbNote) h+='<div class="target">'+E(tx.reimbNote)+'</div>';
    a.notes.forEach(function(n){ h+='<div class="flagbox">'+E(n.text)+'</div>'; });
    h+='</div></div>';
    // 약제
    if(a.drugs.length){
      h+='<h3 class="sec">💊 2026 약제 <span class="kbd">(KASL 2026 권고 · GATE 적용 후)</span></h3>';
      a.drugs.forEach(function(d){
        var r=d.rec?rec(d.rec):null, n=D.DRUG_NOTES[d.id];
        h+='<div class="rx"><div class="name">'+d.rank+'. '+E(drugLabel(d.id))+' '+chip(d.grade)+'</div><div class="flags">'+(RST[d.reimb.status]||"")+'</div>';
        if(r) h+='<div class="note">'+E(r.ko)+'</div>';
        if(d.reimb.reason && d.reimb.status!=="ok") h+='<div class="note">⚖️ '+E(d.reimb.reason)+'</div>';
        if(d.renalDose) h+='<div class="note">🔬 신기능: '+E(d.renalDose)+'</div>';
        if(n) h+='<ul class="tight">'+n.notes.map(function(x){ return '<li>'+E(x)+'</li>'; }).join("")+'</ul>';
        h+='</div>';
      });
      a.gates.forEach(function(g){ h+='<div class="flagbox"><b>제외: '+E(drugLabel(g.drug))+'</b> — '+E(g.reason)+'</div>'; });
    }
    // 급여 기타 경로
    ["vertical","proph"].forEach(function(k){ var r=a.reimb[k]; if(!r) return;
      h+='<div class="'+(r.status==="ok"?"target":"flagbox")+'"><b>⚖️ '+(k==="vertical"?"수직감염 예방 급여":"예방요법 급여")+'</b> '+(RST[r.status]||"")+'<div class="fl">'+E(r.reason)+' ('+E(D.REIMB[r.rule].art)+')</div></div>'; });
    // 관리·모니터·중단·예방
    var care=a.recs.map(rec).filter(function(r){ return r.kind; });
    if(care.length){
      h+='<h3 class="sec">🗓️ 관리 · 모니터링 <span class="kbd">(등급순)</span></h3>';
      care.forEach(function(r){ h+='<div class="target">'+chip(r.grade_original)+' '+E(r.ko)+'</div>'; });
    }
    h+='<div class="target"><b>🎯 치료 목표</b><ul class="tight">'+a.targets.map(function(id){ var t=D.TARGETS.filter(function(x){ return x.id===id; })[0]; return '<li>'+E(t.ko)+'</li>'; }).join("")+'</ul></div>';
    if(a.errata.length){
      h+='<div class="note">ℹ️ 아래 이전 지침(v1) 판정 해석 시 정정사항: '+a.errata.map(function(id){ var e=D.ERRATA.filter(function(x){ return x.id===id; })[0]; return '<b>'+E(id.split(":").pop())+'</b> '+E(e.text); }).join(" / ")+'</div>';
    }
    return h;
  }
  if(runBtn){
    runBtn.addEventListener("click", function(){
      var res=$("#result"); if(!res) return;
      var p=readPatient(); if(!p.hbeag || !p.cirr) return;
      var a=D.applyHbv2026(p), legacy=res.innerHTML.replace("📢 2026 개정 예정","📢 2026 반영 — 위 KASL 2026 판정 참조");
      res.innerHTML=render26(a)+'<details class="hbv26-legacy"><summary>이전 지침(KASL 2022) 판정 · v1 엔진 — 접힘</summary>'+legacy+'</details>';
    });
  }
  var resetBtn=$("#resetBtn");
  if(resetBtn) resetBtn.addEventListener("click", function(){
    S26={}; D.INPUTS.forEach(function(f){ var el=$("#hbv26-in-"+f.key); if(el) el.value=""; });
    root.querySelectorAll("#hbv26Input .opts button.sel").forEach(function(b){ b.classList.remove("sel"); });
  });

  /* ================= 도서관: 2026 카드 prepend ================= */
  function card(emoji,title,body,lead){ return '<div class="card'+(lead?" lead":" sheetmode")+'"><div class="head"><span class="emoji">'+emoji+'</span><span class="t">'+title+'</span>'+(lead?"":'<span class="chev">▶</span>')+'</div><div class="body">'+body+'</div></div>'; }
  var lib=$("#hbv-tab-lib");
  if(lib){
    var gl=D.GUIDELINES["gl:liver:kasl-hbv-2026"], h="";
    var b0='<div class="keybox"><div class="kt">2026 핵심</div><div class="kv">자연경과를 <b>HBV DNA 역가 기반 4단계</b>로 재편(회색지대 소멸) · <b>중등도 바이러스혈증은 ALT와 무관하게 치료</b> · 대상성 간경변은 DNA 검출되면 치료 · 1차 TAF·TDF·ETV·BSV</div></div>';
    b0+='<table class="hbv26-tbl"><tr><th>단계</th><th>정의</th><th>행동</th></tr>'+D.PHASES.map(function(x){ var r=x.rec?rec(x.rec):null; return '<tr><td><b>'+E(x.ko)+'</b></td><td>'+E(x.def)+'</td><td>'+E(x.action)+' '+(r?chip(r.grade_original):"")+'</td></tr>'; }).join("")+'</table>';
    b0+='<div class="note"><b>알고리즘(Fig.2)</b></div><ol class="tight">'+D.ALGORITHM.map(function(s){ return '<li>'+E(s)+'</li>'; }).join("")+'</ol>';
    b0+='<div class="note">ALT 정상상한: 남 '+D.TH.alt_uln.male+' · 여 '+D.TH.alt_uln.female+' IU/L · 출처: '+E(gl.cite)+'</div>';
    h+=card("🆕","KASL 2026 개정 반영 — 바이러스역가 기반 분류",b0,true);
    var b1=Object.keys(D.REC_BY_BLOCK).map(function(bk){
      return '<div class="note" style="margin-top:10px"><b>'+E(bk)+' · '+E(HBV26_BLOCKS[bk])+'</b></div>'+D.REC_BY_BLOCK[bk].map(function(r){
        return '<div class="hbv26-rec">'+chip(r.grade_original)+(r.change==="new"?'<span class="hbv26-chip">신설</span>':'')+(r.ko?'<span class="ko">'+E(r.ko)+'</span>':'')+'<span class="en">'+E(r.text_original)+'</span></div>'; }).join(""); }).join("");
    h+=card("📜","KASL 2026 권고 전수 ("+Object.keys(D.REC).length+"건, 원문·등급)",b1+'<div class="note">'+E(gl.license)+' · © KASL</div>');
    var N=D.NOTICE, b2='<div class="note">'+E(N.noticeNo)+' · 시행 '+E(N.effectiveDate)+' · 이전 '+E(N.prev)+'</div><table class="hbv26-tbl">'+
      Object.keys(D.REIMB).map(function(id){ var r=D.REIMB[id]; return '<tr><td><b>'+E(r.art)+'</b></td><td>'+E(r.text)+'</td></tr>'; }).join("")+'</table><div class="note"><a href="'+E(N.sourceUrl)+'" target="_blank" rel="noopener">심평원 보험인정기준 원문</a></div>';
    h+=card("⚖️","급여 원문 — "+E(N.noticeNo)+" (원문 대조 "+E(N.verified)+")",b2);
    var b3=D.CONFLICTS.map(function(c){ return '<div class="clash"><b>'+E(c.id.split(":").pop())+'</b><br>지침: '+E(c.text_guideline)+'<br>급여: '+E(c.text_reimb)+'</div>'; }).join("")+D.NOTES.map(function(n){ return '<div class="note">• '+E(n.text)+'</div>'; }).join("");
    h+=card("⚠️","지침 ⟷ 급여 상충 (2026 · "+D.CONFLICTS.length+"건)",b3);
    var RR=D.REACT_RISK, b4='<div class="note">급여 고시 3항은 위험도를 "최신 가이드라인"으로 판단 → 이 표가 급여 위험도 판정 근거</div>'+
      '<div class="note"><b>HBsAg(+) 또는 DNA(+)</b></div><div class="note">고위험(&gt;10%): '+E(RR.hbsag_pos.high.join(" · "))+'</div><div class="note">중등도(1–10%): '+E(RR.hbsag_pos.mod.join(" · "))+'</div>'+
      '<div class="note"><b>HBsAg(−)/anti-HBc(+)/DNA(−)</b></div><div class="note">고위험: '+E(RR.hbsag_neg_antihbc_pos.high.join(" · "))+'</div><div class="note">중등도: '+E(RR.hbsag_neg_antihbc_pos.mod.join(" · "))+'</div><div class="kbd">'+E(RR.note)+'</div>';
    h+=card("🛡️","재활성화 위험도 — "+E(RR.source),b4);
    var O=D.OVERSEAS, b5='<table class="hbv26-tbl"><tr><th>지침</th><th>분류</th><th>치료 시작</th><th>ULN</th><th>적격</th></tr>'+O.rows.map(function(r){ return '<tr><td><b>'+E(r.org)+'</b></td><td>'+E(r.cls)+'</td><td>'+E(r.tx)+'</td><td>'+E(r.uln)+'</td><td>'+E(r.elig)+'</td></tr>'; }).join("")+'</table><div class="kbd">'+E(O.eligNote)+' · '+E(O.source)+' · 표시 전용(권고 레코드 아님)</div>';
    h+=card("🌐","해외 지침 비교 (AASLD·EASL·WHO)",b5);
    var b6='<div class="note"><b>superseded (KASL 2022 → 2026)</b></div><table class="hbv26-tbl">'+D.SUPERSEDED_V1.map(function(x){ return '<tr><td>'+E(x.v1)+'</td><td>→ '+E(x.by)+'</td></tr>'; }).join("")+'</table>'+
      '<div class="note"><b>v1 정정(erratum)</b></div>'+D.ERRATA.map(function(e){ return '<div class="flagbox"><b>'+E(e.id.split(":").pop())+'</b> '+E(e.where)+' — '+E(e.text)+'</div>'; }).join("");
    h+=card("🗂️","이전 지침 보기 (KASL 2022) · v1 정정사항",b6);
    var wrap=document.createElement("div"); wrap.id="hbv26-lib"; wrap.innerHTML=h;
    lib.insertBefore(wrap, lib.firstChild);
    // v1 카드 relabel (텍스트 노드만)
    var OLD={"판독 — 자연경과":"KASL 2022 · 이전 분류","치료 종료 기준":"KASL 2022 · 이전 기준","재활성화 예방요법":"근거: 고시 2025-177 제3항(E7·E8)","특수상황 관리":"일부 2022 서술"};
    lib.querySelectorAll(".card .head .t").forEach(function(t){
      if(t.closest("#hbv26-lib")) return;
      Object.keys(OLD).forEach(function(k){ if(t.textContent.indexOf(k)===0 && !t.querySelector(".hbv26-old")) t.insertAdjacentHTML("beforeend",' <span class="hbv26-old">'+E(OLD[k])+'</span>'); });
    });
  }

  /* ================= 시뮬레이션: 판정기 2026 병기 + 2026 증례 ================= */
  var sim=$("#hbv-tab-sim");
  function rkSel(k){ var b=sim.querySelector('.opts[data-rk="'+k+'"] button.sel'); return b?b.getAttribute("data-v"):null; }
  var RKMAP={ dna:{ hi:25000, mid:5000, lo:500 }, alt:{ hi:90, mid:60, lo:30 } };
  function simLine(){
    var box=sim.querySelector("#reimbVerdict"); if(!box) return;
    var old=box.querySelector(".hbv26-sim"); if(old) old.remove();
    var liver=rkSel("liver"); if(!liver) return;
    var dna=rkSel("dna"), p={ hbeag:rkSel("hbeag"), cirr:(liver==="comp"||liver==="decomp")?liver:"none", hcc:liver==="hcc"?"yes":"no",
      alt:rkSel("alt")?RKMAP.alt[rkSel("alt")]:null, fib:rkSel("fib")==="yes"?"f2plus":null };
    if(dna==="neg") p.dna_undetected="yes"; else if(dna) p.dna=RKMAP.dna[dna];
    if(!dna) return;
    var a=D.applyHbv2026(p), tx=a.txRec?rec(a.txRec):null, ph=a.phase?phaseObj(a.phase):null;
    var h='<div class="hbv26-sim target"><b>🩺 KASL 2026</b> '+E(ph?ph.ko:"")+' → '+E(DEC[a.decision])+' '+(tx?chip(tx.grade_original):"")+
      (dna==="hi"||dna==="mid" ? '<div class="kbd">DNA 범주 대표값으로 판정(>10⁸이면 고바이러스혈증 기준 적용)</div>' : '')+
      '<div class="fl">급여(고시 2025-177 원문): '+(RST[a.reimb.tx.status]||"")+' '+E(a.reimb.tx.reason)+'</div>'+
      (a.errata.indexOf("hbv:erratum:E5")>=0 ? '<div class="flagbox">이 판정기(v1)의 "대상성 간경변 DNA≥2,000 필요"는 정정 대상(E5) — 현행 고시는 HBV-DNA 양성이면 인정</div>' : '')+'</div>';
    box.insertAdjacentHTML("beforeend", h);
  }
  if(sim){
    sim.addEventListener("click", function(e){ if(e.target.closest('.opts[data-rk] button')) setTimeout(simLine,0); });
    var cases=D.SIM_CASES.map(function(c){
      var a=D.applyHbv2026(c.p), tx=a.txRec?rec(a.txRec):null, ph=a.phase?phaseObj(a.phase):null;
      var pt=[c.p.sex==="male"?"남":(c.p.sex==="female"?"여":""), c.p.age?c.p.age+"세":"", c.p.hbeag?"HBeAg("+(c.p.hbeag==="pos"?"+":"−")+")":"", c.p.dna_undetected==="yes"?"HBV DNA 미검출":(c.p.dna!=null?"HBV DNA "+Number(c.p.dna).toLocaleString():""), c.p.alt!=null?"ALT "+c.p.alt:"", {none:"간경변 없음",comp:"대상성 간경변",decomp:"비대상성 간경변"}[c.p.cirr]||""].filter(Boolean).join(", ");
      var b='<div class="layer gl" style="margin-bottom:8px"><div class="lh">환자</div>'+E(pt)+'</div><p style="font-weight:700;margin:6px 0">❓ '+E(c.q)+'</p>'+
        '<div class="target">엔진 판정: '+E(ph?ph.ko:"")+' → <b>'+E(DEC[a.decision])+'</b> '+(tx?chip(tx.grade_original):"")+' · 급여 '+(RST[a.reimb.tx.status]||"")+'</div>'+
        '<ul class="tight">'+c.teach.map(function(t){ return '<li>'+E(t)+'</li>'; }).join("")+'</ul>';
      return card(c.emoji, E(c.id)+" — "+E(c.title)+' <span class="hbv26-chip">2026</span>', b);
    }).join("");
    var sw=document.createElement("div"); sw.id="hbv26-sim"; sw.innerHTML='<h3 class="sec">🆕 2026 증례 (KASL 2026 · 고시 2025-177)</h3>'+cases;
    var lead=sim.querySelector(".card.lead"); if(lead && lead.nextSibling) sim.insertBefore(sw, lead.nextSibling); else sim.appendChild(sw);
  }

  /* ================= 푸터: 2026 출처 prepend ================= */
  var foot=$("#hbv-footer");
  if(foot){
    var f='<h4>📖 2026 개정 출처</h4><ol>'+D.SOURCES.map(function(s){ return '<li><a href="'+E(s.url)+'" target="_blank" rel="noopener">'+E(s.label)+'</a> <span class="kbd">('+E(s.note)+')</span></li>'; }).join("")+'</ol>';
    foot.insertAdjacentHTML("afterbegin", f);
  }
})();
