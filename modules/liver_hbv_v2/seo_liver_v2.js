/* liver HBV v2 SEO 정적층 정합 — node seo_liver_v2.js <v2.html>
   noscript(정적 텍스트)의 v1 약제 서술에 KASL 2026·허가·급여 노트를 HBV26 DATA에서 생성해 가산하고,
   TAF 구 허가 문구('식사와 함께')를 교체, KASL 2026 개념 섹션을 추가. head description 갱신. 멱등.
   v1 JS 코드 영역은 건드리지 않음(교체 범위 = <noscript>…</noscript>, <head> 메타). */
const fs=require('fs'), vm=require('vm'), path=require('path');
const FILE=process.argv[2]; if(!FILE) throw new Error('usage: node seo_liver_v2.js <v2.html>');
const ctx={}; vm.createContext(ctx);
vm.runInContext(['hbv_v2_rec_raw.js','hbv_v2_data.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+'\n;this.HBV26=HBV26;',ctx);
const D=ctx.HBV26;
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let html=fs.readFileSync(FILE,'utf8');
const a=html.indexOf('<noscript'), b=html.indexOf('</noscript>',a); if(a<0||b<0) throw new Error('noscript 없음');
let ns=html.slice(a,b);
if(ns.includes('id="concept-kasl2026"')){ console.log('SEO 이미 적용(멱등)'); process.exit(0); }
// 1) TAF 구 허가 문구 교체
const OLD_TAF='<p><b>용법</b>: 25mg 1일 1회, 식사와 함께. 신배설 의존 낮아 CrCl≥15에서 용량조절 불요(국내 허가 확인 권장).</p>';
if(ns.split(OLD_TAF).length-1!==1) throw new Error('TAF 앵커 없음');
ns=ns.replace(OLD_TAF,'<p><b>용법</b>: 25mg 1일 1회, 식사와 관계없이. 신배설 의존 낮아 CrCl≥15에서 용량조절 불요.</p>');
// 2) 약제별 KASL 2026·허가·급여 노트 가산 (DRUG_NOTES → 해당 section 끝 링크 앞)
let added=0;
Object.keys(D.DRUG_NOTES).forEach(id=>{
  const sid='id="drug-'+id.replace('drug:','')+'"'; const i=ns.indexOf(sid); if(i<0) return;
  const end=ns.indexOf('</section>',i); const link=ns.lastIndexOf('<p><a href="#lib">',end);
  const at=(link>i)?link:end;
  ns=ns.slice(0,at)+'<p><b>KASL 2026·허가·급여</b>: '+escH(D.DRUG_NOTES[id].notes.join(' · '))+'</p>\n  '+ns.slice(at); added++;
});
// 3) KASL 2026 개념 섹션
const gl=D.GUIDELINES['gl:liver:kasl-hbv-2026'];
const sec='<section id="concept-kasl2026" class="seo-concept">\n  <h3>대한간학회 만성 B형간염 진료지침 2026 반영 (2026.11)</h3>\n'+
  '  <p>'+escH(gl.cite)+' — 바이러스 역가 기반 4분류(+비바이러스혈증)로 재편.</p>\n'+
  D.PHASES.map(p=>'  <p><b>'+escH(p.ko)+'</b>: '+escH(p.def)+' → '+escH(p.action)+'</p>').join('\n')+'\n'+
  D.CONFLICTS.map(c=>'  <p><b>지침⟷급여</b>: '+escH(c.text_guideline)+' / '+escH(c.text_reimb)+'</p>').join('\n')+'\n'+
  '  <p>급여: '+escH(D.NOTICE.noticeNo)+' ('+escH(D.NOTICE.effectiveDate)+' 시행) 원문 2026-11-01 재검증.</p>\n</section>\n';
const lastDiv=ns.lastIndexOf('</div>'); ns=ns.slice(0,lastDiv)+sec+ns.slice(lastDiv);
html=html.slice(0,a)+ns+html.slice(b);
// 4) head description·og·JSON-LD(있으면)
const DESC='만성간질환 약물치료 가이드 — 대한간학회 만성 B형간염 진료지침 2026(바이러스 역가 4분류·중등도 ALT 무관 치료) + 고시 제2025-177호 급여 원문 재검증, 간경변 합병증(복수·간성뇌증·정맥류)·MASH 약물의 용법·권고등급·급여와 지침 상충을 임상의용으로 정리.';
const hEnd=html.indexOf('</head>'); const head=html.slice(0,hEnd);
let h2=head.replace(/(<meta name="description" content=")[^"]*(")/,'$1'+DESC+'$2').replace(/(<meta property="og:description" content=")[^"]*(")/,'$1'+DESC+'$2')
  .replace(/("description": ")[^"]*(")/,'$1'+DESC+'$2').replace(/("lastReviewed": ")[^"]*(")/,'$1'+(D.NOTICE.verified||'2026-11-01')+'$2');
if(h2===head) throw new Error('head 교체 실패');
html=h2+html.slice(hEnd);
fs.writeFileSync(FILE,html);
console.log('SEO 적용: TAF 문구 교체 · 약제 노트 '+added+' · concept-kasl2026 · head description');
