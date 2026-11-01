/* hf v2 SEO 정적층 정합 — node seo_hf_v2.js <v2.html>
   noscript(정적 텍스트)의 v1 급여·용량 서술을 HF26 DATA에서 재생성해 교체하고, ESC 2026 개념 섹션을 가산.
   v1 JS 코드 영역은 건드리지 않음(교체 범위 = <noscript> … </noscript>, <head> 메타·JSON-LD). 멱등. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const FILE=process.argv[2]; if(!FILE) throw new Error('usage: node seo_hf_v2.js <v2.html>');
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'hf_v2_data.js'),'utf8')+'\n;this.HF26=HF26;',ctx);
const D=ctx.HF26, TH=D.TH;
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const nl=(D.NOTICES);
const lab=id=>nl[id].label+'('+nl[id].date+')';
let html=fs.readFileSync(FILE,'utf8');
const a=html.indexOf('<noscript>'), b=html.indexOf('</noscript>',a); if(a<0||b<0) throw new Error('noscript 없음');
let ns=html.slice(a,b);
if(ns.includes('id="concept-esc2026"')){ console.log('SEO 이미 적용(멱등)'); process.exit(0); }
const R=D.REIMB_2026;
const rep=[
  { old:'동율동 + HR≥70 + BB 최대내약/불내성 + LVEF≤35% NYHA II-IV', min:1,
    neu:`동리듬 + HR≥${TH.r_ivab_hr_ge} + LVEF≤${TH.r_ivab_lvef_le}% NYHA II–IV + (BB 금기·불내성 또는 표준치료 4주 후 병용) · LVEF ${TH.r_ivab_lvef_le}–${TH.r_ivab_sel_lvef_le}% 선별급여(본인부담 50%) — ${lab(R['hf:reimb26:ivabradine'].notice)}` },
  { old:'철결핍 진단 충족시(ferritin/TSAT 기준)', min:1,
    neu:`Hb ≤${TH.r_iron_hb_le} g/dL + ferritin &lt;${TH.r_iron_ferritin_lt} 또는 TSAT &lt;${TH.r_iron_tsat_lt}% + 경구 곤란(비투석 CKD 별도) — ${lab(R['hf:reimb26:iv_iron'].notice)} · 비빈혈 HF 철결핍은 비급여` },
  { old:'고시(2024.2 LVEF≤40) + 고시(2025.2 LVEF&gt;40 확대)', min:1,
    neu:`다파 ${lab('notice:고시2025-102')} · 엠파 ${lab('notice:고시2026-159')} — HF 적응증 보유 품목 한정(포시가 취하)` },
  { old:'/ 목표 20mg qd / 적정 4주 후 K+≤4.8이고 eGFR 안정시 10→20mg 증량', min:1,
    neu:`/ 목표 ${escH(D.DOSE_2026['drug:finerenone'].target)} (심부전 허가 용량) · 심부전 급여기준 없음(비급여)` },
  { old:'🧂 파티로머 · Patiromer (-)', min:1, neu:'🧂 파티로머 · Patiromer (국내 미허가)' },
  { old:'<p><b>심부전 노트</b>: 최근 악화 고위험군 대상. 식사와 함께 복용</p>', min:1,
    neu:'<p><b>심부전 노트</b>: 최근 악화 고위험군 대상. 식사와 함께 복용</p>\n  <p><b>급여</b>: '+lab(R['hf:reimb26:vericiguat'].notice)+' — '+
      escH(R['hf:reimb26:vericiguat'].gate.conds.map(c=>c.txt||c.conds.map(x=>x.txt).join(' 또는 ')).join(' · '))+'</p>' }
];
for(const r of rep){ const n=ns.split(r.old).length-1; if(n<r.min) throw new Error('SEO 앵커 없음: '+r.old); ns=ns.split(r.old).join(r.neu); }
// ESC 2026 개념 섹션 (DATA 생성)
const rx=D.REC_2026.filter(r=>r.scope==='rx' && r.tier==='hf:tier:fmt' && r.drugs && r.drugs.length);
const sec='<section id="concept-esc2026" class="seo-concept">\n  <h3>2026 ESC 심부전 지침 반영 (2026.11)</h3>\n'+
  D.LIB.concepts.map(c=>'  <p>'+escH(c)+'</p>').join('\n')+'\n'+
  rx.map(r=>'  <p><b>'+r.grade+'/'+r.loe+'</b> '+escH(r.text)+'</p>').join('\n')+'\n'+
  D.CONFLICTS.map(c=>'  <p><b>지침⟷급여</b>: '+escH(c.gl)+' / '+escH(c.rb)+'</p>').join('\n')+'\n'+
  '  <p>한국 레이어: KSHF 2022 (2026 개정 진행 중). 급여: 심평원 고시 원문 2026-11-01 재검증.</p>\n</section>\n';
const lastDiv=ns.lastIndexOf('</div>'); ns=ns.slice(0,lastDiv)+sec+ns.slice(lastDiv);
html=html.slice(0,a)+ns+html.slice(b);
// head: description·og·JSON-LD·keywords
const DESC='심부전 약물치료 가이드 — 2026 ESC 심부전 지침(HFrEF <50%·HFpEF ≥50%, FMT/AMT) + 대한심부전학회(KSHF) 2022 + 심평원 급여 원문(2026.11). SGLT2i·MRA 전 LVEF, ARNI·베리시구앗·이바브라딘·피네레논·정맥철분 급여기준과 지침 상충을 권고등급(Class/LoE)으로 정리.';
const head=html.slice(0,html.indexOf('</head>'));
let h2=head.replace(/(<meta name="description" content=")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/("description": ")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/("lastReviewed": ")[^"]*(")/, '$1'+D.META.verified+'$2');
const kwAdd=['ESC 2026','2026 ESC 심부전','FMT','HFimpEF','베르쿠보 급여','이바브라딘 급여','피네레논 심부전','케렌디아 40mg','세마글루타이드 HFpEF','철분주사 급여','엠파글리플로진 급여','다파글리플로진 심부전 적응증'];
h2=h2.replace(/(<meta name="keywords" content=")([^"]*)(")/, (m,p1,kw,p3)=>{ const ks=kw.split(',').map(s=>s.trim()); kwAdd.forEach(k=>{ if(!ks.includes(k)) ks.push(k); }); return p1+ks.join(', ')+p3; });
if(h2===head) throw new Error('head 교체 실패');
html=h2+html.slice(head.length);
fs.writeFileSync(FILE,html);
console.log('SEO 적용: noscript 교체',rep.length,'· concept-esc2026 가산 · head 메타 갱신');
