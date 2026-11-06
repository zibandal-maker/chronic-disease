/* asthma v2 SEO 정적층 정합 — node seo_asthma_v2.js <v2.html>
   noscript의 v1 생물학제제 급여 서술(bio-* 5섹션)을 ASTHMA26 DATA에서 재생성해 교체하고, 근거 레이어 문구·티오트로피움·테제펠루맙 급여 줄을
   정정하며 KATRD 2026·GINA 2026 개념 섹션을 가산. 교체 범위 = <noscript> … </noscript>와 <head> 메타. v1 JS 코드 영역 무수정. 멱등. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const FILE=process.argv[2]; if(!FILE) throw new Error('usage: node seo_asthma_v2.js <v2.html>');
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'asthma_v2_data.js'),'utf8')+'\n;this.ASTHMA26=ASTHMA26;',ctx);
const D=ctx.ASTHMA26, TH=D.TH;
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tpl=s=>String(s).replace(/\{TH\.(\w+)\}/g,(_,k)=>TH[k]);
const lab=id=>{ const n=D.NOTICES[id]; return n.label+'('+n.date+')'; };
function gateTxt(g){ if(g.op){ const inner=g.conds.map(gateTxt).join(g.op==='AND'?' + ':' 또는 '); return (g.label?tpl(g.label)+': ':'')+(g.conds.length>1?'['+inner+']':inner); } return tpl(g.txt); }
function ruleTxt(rid){ const r=D.REIMB_2026[rid]; if(!r) return ''; return escH(r.gate?gateTxt(r.gate):(r.notes||[]).map(tpl).join(' · ')); }
const prodsOf=did=>D.PRODUCTS.filter(p=>p.ingredients.length===1 && p.ingredients[0]===did);
const NL='\r\n';
let html=fs.readFileSync(FILE,'utf8');
const a=html.indexOf('<noscript>'), b=html.indexOf('</noscript>',a); if(a<0||b<0) throw new Error('noscript 없음');
let ns=html.slice(a,b);
if(ns.includes('id="concept-katrd2026"')){ console.log('SEO 이미 적용(멱등)'); process.exit(0); }
function once(o, n){ let old=o, neu=n; if(ns.split(old).length-1===0 && old.includes('\n')){ old=old.replace(/\r?\n/g,'\r\n'); neu=neu.replace(/\r?\n/g,'\r\n'); }
  const c=ns.split(old).length-1; if(c!==1) throw new Error('SEO 앵커 '+c+'회: '+o.slice(0,60)); ns=ns.split(old).join(neu); }
/* 1) 근거 레이어 */
once('<p>대한천식알레르기학회·GINA 가이드라인 및 건강보험 급여기준(복지부 고시·심평원 약제 세부사항) 기반.',
     '<p>대한결핵및호흡기학회 천식 진료지침 2026 6차(KATRD)·GINA 2026 및 건강보험 급여기준(심평원 고시 원문 '+D.META.reimb_checked+' 재검증) 기반.');
/* 2) bio-* 5섹션 재생성 */
const BIO=[['omalizumab','drug:omalizumab'],['mepolizumab','drug:mepolizumab'],['reslizumab','drug:reslizumab'],['benralizumab','drug:benralizumab'],['dupilumab','drug:dupilumab']];
BIO.forEach(([slug,did])=>{
  const s0=ns.indexOf('<section id="bio-'+slug+'"'); if(s0<0) throw new Error('bio 섹션 없음 '+slug);
  const s1=ns.indexOf('</section>',s0)+'</section>'.length; const old=ns.slice(s0,s1);
  const h3=(old.match(/<h3>[^<]*<\/h3>/)||[''])[0];
  const ps=prodsOf(did); const rid=ps[0].reimb, r=D.REIMB_2026[rid];
  const cls=D.CLASS_ADD[D.BIO_CLASS[did]].label;
  const lines=['<section id="bio-'+slug+'" class="seo-drug">','  '+h3,'  <p><b>표적</b>: '+escH(cls)+'</p>',
    '  <p><b>제품·허가</b>: '+escH(ps.map(p=>p.label+' — '+tpl(p.label_note||'')).join(' / '))+'</p>',
    '  <p><b>급여기준</b>: '+ruleTxt(rid)+' — '+escH((ps[0].notice||[]).map(lab).join(' · '))+'</p>',
    '  <p><b>평가·지속</b>: '+escH((r.notes||[]).map(tpl).join(' · '))+'</p>',
    '  <p><b>공통</b>: '+escH(tpl(D.BIO_COMMON26.lama_warn))+' · '+escH(tpl(D.BIO_COMMON26.not_met))+'</p>',
    '  <p><b>반응 예측(KATRD 그림 6-2)</b>: '+escH(tpl(D.BIO_PRED[did]))+'</p>',
    '  <p><a href="#sim">중증천식 급여 판정 시뮬레이션 →</a></p>','</section>'];
  ns=ns.slice(0,s0)+lines.join(NL)+ns.slice(s1);
});
/* 3) 티오트로피움·테제펠루맙 */
once('<h3>티오트로피움 · tiotropium</h3>\n  <p><b>계열</b>: 지속성 무스카린길항제(LAMA)</p>',
     '<h3>티오트로피움 · tiotropium</h3>\n  <p><b>계열</b>: 지속성 무스카린길항제(LAMA)</p>\n  <p><b>천식 급여</b>: '+ruleTxt('asthma:reimb26:tiotropium')+' — '+escH(lab('notice:고시2022-56'))+' · 스피리바 레스피맷 6세 이상 중증 천식 부가 허가</p>');
const teze=D.PRODUCTS.find(p=>p.id==='asthma:prod:tezspire');
once('<h3>테제펠루맙 · tezepelumab</h3>',
     '<h3>테제펠루맙 · tezepelumab</h3>\n  <p><b>허가·급여</b>: '+escH(tpl(teze.label_note))+' — 표현형 무관 중증 천식(GINA Evidence A)</p>');
/* 4) 개념 섹션 */
const st=D.STEP_TABLE.map(s=>'  <p><b>'+s.step+'단계</b> '+escH(s.init_txt)+' — 1안 '+escH((s.t1_init||s.t1).txt)+' / 2안 '+escH((s.t2_init||s.t2).txt)+'</p>').join(NL);
const tri='  <p><b>천식 삼제 급여(에너제어·트렐리지·트림보우)</b>: '+ruleTxt('asthma:reimb26:triple_asthma')+'</p>';
const ics='  <p><b>ICS/LABA 천식 급여</b>: '+ruleTxt('asthma:reimb26:ics_laba')+' · '+escH(D.REIMB_2026['asthma:reimb26:ics_laba'].notes.map(tpl).join(' · '))+'</p>';
const ltra='  <p><b>LTRA 급여</b>: '+ruleTxt('asthma:reimb26:ltra')+' — '+escH(lab('notice:고시2023-184'))+'</p>';
const conf=D.CONFLICTS.map(c=>'  <p><b>'+escH(c.x)+'</b>: 지침 '+escH(tpl(c.gl))+' / '+(c.kind==='gl_gl'?'GINA ':'급여 ')+escH(tpl(c.reimb))+'</p>').join(NL);
const err=D.ERRATA.filter(e=>e.kind==='erratum').map(e=>'  <p><b>정정 '+e.id.split(':').pop()+' '+escH(e.title)+'</b>: '+escH(e.now)+'</p>').join(NL);
const tests=D.TESTS_PAY.map(t=>escH(t.name)+' '+t.pay).join(' · ');
const sec=['<section id="concept-katrd2026" class="seo-concept">','  <h3>KATRD 천식 진료지침 2026 6차 · GINA 2026 · 급여 원문 반영 (2026.11)</h3>',
  D.LIB.concepts.map(c=>'  <p>'+escH(c)+'</p>').join(NL), st, ics, tri, ltra,
  '  <p><b>급성 악화</b>: '+D.REC_2026.filter(r=>r.scope==='ae').map(r=>escH((r.guideline==='gl:asthma:katrd-2026'?'KATRD ':'GINA ')+tpl(r.text)+(r.loe?' ('+r.loe+')':''))).join(' · ')+'</p>',
  '  <p><b>검사 급여</b>: '+tests+'</p>', conf, err,
  '  <p>급여: 심평원 보험인정기준 원문 '+D.META.reimb_checked+' 재검증('+Object.keys(D.NOTICES).map(lab).join(', ')+').</p>','</section>',''].join(NL);
const lastDiv=ns.lastIndexOf('</div>'); ns=ns.slice(0,lastDiv)+sec+ns.slice(lastDiv);
html=html.slice(0,a)+ns+html.slice(b);
/* 5) head 메타 */
const DESC='천식 약물치료 가이드 — 대한결핵및호흡기학회 KATRD 천식 진료지침 2026 6차 + GINA 2026 + 심평원 급여 원문(2026.11). 초기 단계(월 2회 미만·월 2회 이상·거의 매일·매일), ICS-formoterol AIR·MART, ICS 용량표, 천식 삼제(에너제어·트렐리지·트림보우) 급여, 생물학제제(졸레어·옴리클로·누칼라·싱케어·파센라·듀피젠트) LAMA 필수 급여기준, 테즈파이어 비급여, FeNO 비급여, 급성 악화 산소 목표를 권고등급으로 정리.';
const head=html.slice(0,html.indexOf('</head>'));
let h2=head.replace(/(<meta name="description" content=")[^"]*(")/, '$1'+DESC+'$2')
  .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1'+DESC+'$2');
const kwAdd=['KATRD 2026','천식 진료지침 2026','GINA 2026','천식 6차 개정','AIR','에너제어 급여','트렐리지 천식','트림보우 천식','어택트라','스피리바 천식 급여','옴리클로','오말리주맙 급여기준','누칼라 급여기준','듀피젠트 천식 급여','테즈파이어','데페모키맙','FeNO 비급여','천식 급성악화 산소'];
h2=h2.replace(/(<meta name="keywords" content=")([^"]*)(")/, (m,p1,kw,p3)=>{ const ks=kw.split(',').map(s=>s.trim()); kwAdd.forEach(k=>{ if(!ks.includes(k)) ks.push(k); }); return p1+ks.join(', ')+p3; });
if(h2===head) throw new Error('head 교체 실패');
html=h2+html.slice(head.length);
fs.writeFileSync(FILE,html);
console.log('SEO 적용: 근거 레이어 · bio-* 5섹션 재생성 · 티오트로피움/테제펠루맙 · concept-katrd2026 가산 · head 메타 갱신');
