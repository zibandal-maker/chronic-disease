/* copd v2 SEO 정적층 정합 — node seo_copd_v2.js <v2.html>
   noscript의 v1 급여·생물학제제 서술을 COPD26 DATA에서 재생성해 교체하고, GOLD 2026·KATRD 2024 개념 섹션을 가산.
   교체 범위 = <noscript> … </noscript>와 <head> 메타. v1 JS 코드 영역 무수정. 멱등. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const FILE=process.argv[2]; if(!FILE) throw new Error('usage: node seo_copd_v2.js <v2.html>');
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'copd_v2_data.js'),'utf8')+'\n;this.COPD26=COPD26;',ctx);
const D=ctx.COPD26, TH=D.TH;
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tpl=s=>String(s).replace(/\{TH\.(\w+)\}/g,(_,k)=>TH[k]);
const lab=id=>{ const n=D.NOTICES[id]; return n.label+'('+n.date+')'; };
function gateTxt(g){ if(g.op){ const inner=g.conds.map(gateTxt).join(g.op==='AND'?' + ':' 또는 '); return (g.label?tpl(g.label)+': ':'')+(g.conds.length>1?'['+inner+']':inner); } return tpl(g.txt); }
function ruleTxt(id){ const r=D.REIMB_2026[id]; let s=r.fixed? (r.notes||[]).map(tpl).join(' · ') : gateTxt(r.gate);
  if(r.require) s+=' + '+tpl(r.require.txt); return escH(s)+(r.notice.length?' — '+r.notice.map(lab).join(' · '):''); }
const prods=id=>D.PRODUCTS.filter(p=>p.reimb===id).map(p=>p.v1_brand||p.label).join('·');
let html=fs.readFileSync(FILE,'utf8');
const a=html.indexOf('<noscript>'), b=html.indexOf('</noscript>',a); if(a<0||b<0) throw new Error('noscript 없음');
let ns=html.slice(a,b);
if(ns.includes('id="concept-gold2026"')){ console.log('SEO 이미 적용(멱등)'); process.exit(0); }
const rep=[
  { old:'<h3>LABA+LAMA 복합제 — 급여</h3>\n  <p><b>급여기준</b>: 국내 2024 지침 저위험·고위험 공통 1차 요법. 급여 인정.</p>',
    neu:'<h3>LABA+LAMA 복합제·LAMA/LABA 단일제 — 조건부급여</h3>\n  <p><b>급여기준</b>: '+ruleTxt('copd:reimb26:lama_laba')+' · 티오트로피움 단일제도 같은 고시 별도 항목(동일 조건)</p>' },
  { old:'<p><b>급여기준</b>: FEV1&lt;60% 예측치 + COPD 악화 잦은 경우 인정.</p>',
    neu:'<p><b>급여기준</b>: '+ruleTxt('copd:reimb26:ics_laba')+' · 지침은 LABA+ICS 비권장(삼제 우월)</p>' },
  { old:'<h3>ICS+LABA+LAMA 3제 (트렐리지 기준) — 조건부급여</h3>\n  <p><b>급여기준</b>: 다음 3택1: ① LABA+LAMA에도 FEV1&lt;60% 또는 연 2회↑ 급성악화  ② LABA+ICS에도 호흡곤란 조절 안됨  ③ 동일성분 복합제·단일제 동시투여 중 전환</p>',
    neu:'<h3>ICS+LABA+LAMA 3제 — 제품별 조건부급여</h3>\n  <p><b>트렐리지·브레즈트리</b>: '+ruleTxt('copd:reimb26:triple_tb')+'</p>\n  <p><b>트림보우</b>: '+ruleTxt('copd:reimb26:triple_tm')+'</p>\n  <p><b>급성악화 정의</b>: '+escH(D.EXAC_DEF_REIMB)+'</p>' },
  { old:'<p><b>급여기준</b>: 만성기관지염 동반 + FEV1&lt;50% 예측치 + 악화 있는 환자.</p>',
    neu:'<p><b>급여기준</b>: '+ruleTxt('copd:reimb26:roflumilast')+'</p>' },
  { old:'<h3>아지스로마이신 (Macrolide) — 주의</h3>\n  <p><b>급여기준</b>: ★국내 급여 삭감 빈번. 지침은 흡연력 환자 악화예방 권고하나 급여 현실 주의. 청구 전 확인.</p>',
    neu:'<h3>아지스로마이신 (Macrolide) — COPD 악화 예방 급여 기준 없음</h3>\n  <p><b>급여기준</b>: '+ruleTxt('copd:reimb26:azithro')+' · GOLD 2026: 현재 비흡연자 지속 악화 시 고려(Evidence A)</p>' },
  { old:'<p><b>급여</b>: ★COPD 급여 미등재 → 100/100 (월 ~150만원)</p>',
    neu:'<p><b>허가</b>: '+escH(D.DRUG_STATUS['drug:dupilumab'].label_scope)+'</p>\n  <p><b>급여</b>: COPD 고시 항목 없음 → 전액 본인부담 — '+lab('notice:고시2026-159')+'(아토피·천식만)</p>' },
  { old:'<p><b>급여</b>: ★COPD 급여 미등재 (국내 천식 적응증만 급여)</p>',
    neu:'<p><b>허가</b>: '+escH(D.DRUG_STATUS['drug:mepolizumab'].label_scope)+'</p>\n  <p><b>급여</b>: COPD 고시 항목 없음 → 전액 본인부담 — '+lab('notice:고시2026-133')+'(천식만)</p>' }
];
for(const r of rep){ let o=r.old, nw=r.neu; if(ns.split(o).length-1===0 && o.includes('\n')){ o=o.replace(/\n/g,'\r\n'); nw=nw.replace(/\n/g,'\r\n'); } /* noscript는 CRLF 혼재 */
  const n=ns.split(o).length-1; if(n!==1) throw new Error('SEO 앵커 '+n+'회: '+r.old.slice(0,60)); ns=ns.split(o).join(nw); }
const kq=D.REC_2026.filter(r=>r.guideline==='gl:copd:katrd-2024' && /^KQ/.test(r.cite));
const gs=D.REC_SYSTEMS['recsys:grade'];
const sec='<section id="concept-gold2026" class="seo-concept">\n  <h3>GOLD 2026 · KATRD 2024 권고등급 · 급여 원문 반영 (2026.11)</h3>\n'+
  D.LIB.concepts.map(c=>'  <p>'+escH(c)+'</p>').join('\n')+'\n'+
  kq.map(r=>'  <p><b>KATRD '+r.cite+' '+gs.grade[r.grade].ko+'·'+gs.loe[r.loe].ko+'</b> '+escH(tpl(r.text))+'</p>').join('\n')+'\n'+
  D.CONFLICTS.map(c=>'  <p><b>'+c.x+' 지침⟷급여</b>: '+escH(tpl(c.gl))+' / '+escH(tpl(c.reimb))+'</p>').join('\n')+'\n'+
  '  <p>백신: '+escH(D.VACC26.map(v=>v.name).join(' · '))+' — '+escH(D.VACC_REIMB_NOTE)+'</p>\n'+
  '  <p>급여: 심평원 보험인정기준 원문 '+D.META.reimb_checked+' 재검증('+Object.keys(D.NOTICES).map(lab).join(', ')+').</p>\n</section>\n';
const lastDiv=ns.lastIndexOf('</div>'); ns=ns.slice(0,lastDiv)+sec+ns.slice(lastDiv);
html=html.slice(0,a)+ns+html.slice(b);
const DESC='COPD 약물치료 가이드 — GOLD 2026(E군 = 악화 1회, 초치료·추적 분리) + 대한결핵및호흡기학회 KATRD 2024(GRADE KQ1–9) + 심평원 급여 원문(2026.11). LAMA·LABA·ICS 흡입기, 삼제(트렐리지·브레즈트리·트림보우) 제품별 급여, 로플루밀라스트·아지스로마이신, 듀피젠트·누칼라 COPD 허가·비급여, 폐렴구균 PCV21·RSV 백신을 권고등급으로 정리.';
const head=html.slice(0,html.indexOf('</head>'));
let h2=head.replace(/(<meta name="description" content=")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/("description":\s*")[^"]*(")/, '$1'+DESC+'$2');
const kwAdd=['GOLD 2026','KATRD 2024','COPD 진료지침 2024','CAAT','E군','브레즈트리 급여','트림보우 급여','트렐리지 급여','삼제요법 급여기준','닥사스 급여','듀피젠트 COPD','누칼라 COPD','엔시펜트린','PCV21','RSV 백신','HFNT'];
h2=h2.replace(/(<meta name="keywords" content=")([^"]*)(")/, (m,p1,kw,p3)=>{ const ks=kw.split(',').map(s=>s.trim()); kwAdd.forEach(k=>{ if(!ks.includes(k)) ks.push(k); }); return p1+ks.join(', ')+p3; });
if(h2===head) throw new Error('head 교체 실패');
html=h2+html.slice(head.length);
fs.writeFileSync(FILE,html);
console.log('SEO 적용: noscript 교체',rep.length,'· concept-gold2026 가산 · head 메타 갱신');
