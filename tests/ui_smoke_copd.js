/* copd v2 UI 스모크(jsdom) — node ui_smoke_copd.js <v2.html> */
const load=require('./copd_load'); const {w,errors}=load(process.argv[2]); const d=w.document;
let pass=0,fail=0; const ok=(c,m)=>{ if(c)pass++; else {fail++; console.log('FAIL',m);} }; const q=s=>d.querySelectorAll(s).length;
const errs=()=>errors.filter(e=>!/scrollTo/.test(e));
ok(errs().length===0,'로드 오류 '+errs());
ok(d.querySelector('.hdr .sub').textContent.indexOf('GOLD 2026')>=0,'헤더 라벨');
ok(q('[data-copd26="lib"]')===1 && q('[data-copd26="src"]')===1,'도서관 2026 블록·출처');
ok(d.querySelectorAll('[data-copd26="lib"] details.c26-d').length===10,'도서관 섹션 10 = '+d.querySelectorAll('[data-copd26="lib"] details.c26-d').length);
ok(q('button.topic .c26-new')===7,'토픽 2026 갱신 칩 7 = '+q('button.topic .c26-new'));
for(let i=0;i<3;i++) w.render(); ok(q('[data-copd26="lib"]')===1,'render 반복 멱등(도서관)');
// 검색 입력은 v1 IME 경로 — 블록 유지
w.APP.q='호산구'; w.render(); ok(q('[data-copd26="lib"]')===1 && d.getElementById('libresult'),'검색 상태 블록 유지'); w.APP.q=''; w.render();
w.openTopic('reimb'); ok(q('[data-copd26="topicnote"]')===1 && d.querySelectorAll('[data-copd26="topicnote"] .c26-row').length===6,'급여 토픽 정정 6'); w.closeTopic();
w.openTopic('kcd'); ok(q('[data-copd26="topicnote"]')===0,'정정 없는 토픽'); w.closeTopic();
w.switchTab('flow'); ok(q('[data-copd26="inputs"]')===1 && q('[data-copd26="result"]')===0,'플로우 입력 카드만');
const F=w.APP.flow; Object.assign(F,{fev1:62,modExac:1,hospExac:0,eos:220,cat:16,mmrc:2}); F.products.push('아노로 엘립타');
w.runFlow();
ok(q('[data-copd26="result"]')===1 && q('[data-copd26="reimb"]')===1,'2026 결과 카드');
ok(q('details.copd26-legacy')===1 && d.querySelectorAll('details.copd26-legacy .card').length>=3,'v1 결과 접힘');
ok(d.querySelector('[data-copd26="conf"]') && d.querySelector('[data-copd26="conf"]').textContent.indexOf('X1')>=0,'X1 상충 표시');
const firstClin=d.querySelector('.card.clin'); ok(firstClin && firstClin.getAttribute('data-copd26')==='result','v1 스크롤 대상 = 2026 카드');
w.COPD26_UI.toggle('sx_uncontrolled'); ok(q('[data-copd26="result"]')===1,'칩 토글 후 재계산·1세트');
w.COPD26_UI.toggle('ae_on'); ok(d.querySelectorAll('[data-copd26="inputs"] select').length===3,'악화 모드 입력');
w.COPD26_UI.setSel('ae_rf','hypoxemic'); ok(d.querySelector('[data-copd26="ae"]') && d.querySelector('[data-copd26="ae"]').textContent.indexOf('HFNT')>=0,'악화 카드 HFNT');
w.COPD26_UI.toggleVx('vacc:pcv21'); const vc=d.querySelector('[data-copd26="vacc"]'); ok(!vc || vc.textContent.indexOf('폐렴구균')<0,'PCV21 접종 → 폐렴구균 due 해제');
// v1 플로우 칩 토글(render 경로)도 유지
w.toggleFlow('smoker'); ok(q('[data-copd26="result"]')===1 && q('[data-copd26="inputs"]')===1,'v1 칩 토글 후 유지');
ok(w.APP.flow.vaccines.indexOf('vacc:pcv21')<0,'v1 상태 오염 없음(vaccines)');
w.switchTab('sim'); ok(q('[data-copd26="sim"]')===1 && d.querySelectorAll('[data-copd26="sim"] .c26-cases button').length===6,'시뮬 증례 6');
w.COPD26_UI.simCase('copd:sim26:c4'); ok(q('[data-copd26="result"]')===1 && d.querySelector('[data-copd26="reimb"]').textContent.indexOf('듀피젠트')>=0,'증례4 결과');
Object.assign(w.APP.sim,{fev1:45,modExac:2,eos:350}); w.render(); ok(q('[data-copd26="simdual"]')===1,'시뮬 2026 병기');
w.COPD26_UI.loadCase('copd:sim26:c6'); ok(w.APP.tab==='flow' && q('[data-copd26="ae"]')===1 && q('[data-copd26="vacc"]')===1,'증례 → 플로우 불러오기');
ok(w.APP.flow.fev1===42 && w.APP.copd26.input.ae_on===true,'불러오기 값');
// 이전 v1 기능: 시뮬 판정기/생물학 토픽 동작
w.switchTab('lib'); w.openTopic('biologic'); ok(d.querySelector('#app .wrap').textContent.indexOf('듀피젠트')>=0,'v1 생물학 토픽 렌더'); w.closeTopic();
ok(errs().length===0,'최종 오류 0: '+errs());
console.log((fail?'FAILED':'ALL PASS')+' '+pass+'/'+(pass+fail)); process.exit(fail?1:0);
