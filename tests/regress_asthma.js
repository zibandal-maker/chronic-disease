/* asthma v2 회귀 — node regress_asthma.js <v1.html> <v2.html> <golden.json>
   1) v1 엔진(rcEvaluate·rcVerdict·calcStep·calcBioRows·actScore·acqScore) v1·v2 동일  2) 2026 기대값(golden)  3) 정문 계약
   4) 엔진·UI 수치 리터럴 0  5) DATA 참조 무결성(ID)  6) APP v1 키 보존 + 가산 5키  7) SPEC §8 핵심 판정  8) 변이 검출 */
const load=require('./asthma_load'), fs=require('fs'), path=require('path'), got=require('./asthma_got');
const [V1,V2,GF]=process.argv.slice(2); const G=JSON.parse(fs.readFileSync(GF,'utf8'));
let pass=0, fail=0; const ok=(c,m)=>{ if(c){pass++;} else {fail++; console.log('FAIL',m);} };
const A=load(V1), B=load(V2); ok(A.errors.length===0 && B.errors.length===0, 'jsdom 오류 '+A.errors.concat(B.errors).join(' | '));
const a=A.w, b=B.w; const J=o=>JSON.stringify(o);
/* 1 */
a.ASTHMA_DATA.BIOLOGICS.forEach(bio=>{
  const ids=[]; (bio.criteria||[]).concat(bio.sharedChecks||[]).forEach(c=>ids.push(c.id)); (bio.paths||[]).forEach(p=>p.criteria.forEach(c=>ids.push(c.id)));
  for(let mask=0; mask<(1<<Math.min(ids.length,8)); mask++){ const ck={}; ids.forEach((id,i)=>{ if(mask&(1<<i)) ck[id]=true; });
    const x=a.rcEvaluate(a.findBio(bio.id),ck), y=b.rcEvaluate(b.findBio(bio.id),ck);
    if(J(x)!==J(y) || J(a.rcVerdict(x))!==J(b.rcVerdict(y))){ ok(false,'rcEvaluate 차이 '+bio.id+' '+mask); return; } }
  ok(true,'rc '+bio.id); });
['low','mid','most','daily',undefined].forEach(sx=>['no','yes',undefined].forEach(n=>ok(a.calcStep({sx:sx,night:n})===b.calcStep({sx:sx,night:n}),'calcStep '+sx+n)));
['lt150','150_300','ge300',undefined].forEach(e=>['lt25','ge25',undefined].forEach(f=>['no','yes',undefined].forEach(al=>ok(J(a.calcBioRows({eos:e,feno:f,allergy:al}))===J(b.calcBioRows({eos:e,feno:f,allergy:al})),'calcBioRows'))));
[[5,4,3,5,2],[1,1,1,1,1]].forEach(v=>{ a.APP.act={}; b.APP.act={}; v.forEach((x,i)=>{ a.APP.act[i]=x; b.APP.act[i]=x; }); ok(J(a.actScore())===J(b.actScore()),'actScore'); });
[[0,1,2,3,4,5],[6,6,6,6,6,6]].forEach(v=>{ a.APP.acq={}; b.APP.acq={}; v.forEach((x,i)=>{ a.APP.acq[i]=x; b.APP.acq[i]=x; }); ok(J(a.acqScore())===J(b.acqScore()),'acqScore'); });
ok(J(a.ASTHMA_DATA)===J(b.ASTHMA_DATA),'v1 ASTHMA_DATA 동일');
ok(J(a.asthmaGlobalDrugs())===J(b.asthmaGlobalDrugs()),'v1 asthmaGlobalDrugs 동일');
/* 2 */
G.forEach(g=>{ const e=g.expect, r=got(b,g.p); const bad=Object.keys(e).filter(k=>J(e[k])!==J(r[k])).map(k=>k+': 기대 '+J(e[k])+' / 실제 '+J(r[k])); ok(bad.length===0, g.id+' 2026 기대값\n   '+bad.join('\n   ')); });
/* 3 */
G.forEach(g=>{ const r=b.APP.recommend(JSON.parse(J(g.p))); ok(Array.isArray(r.drugs)&&Array.isArray(r.targets)&&Array.isArray(r.flags)&&r.drugs.every(d=>d.id&&d.id.indexOf('asthma:prod:')===0)&&r.targets.every(t=>t.id&&t.label)&&r.flags.every(f=>f.id&&f.msg), g.id+' 정문 형태'); });
/* 4 */
function stripCode(src){ let o='',i=0,q=null; while(i<src.length){ const c=src[i], n=src[i+1];
  if(q){ if(c==='\\'){ i+=2; continue; } if(c===q){ q=null; o+=c+c; } i++; continue; }
  if(c==='/'&&n==='*'){ const e=src.indexOf('*/',i+2); i=e<0?src.length:e+2; continue; }
  if(c==='/'&&n==='/'){ const e=src.indexOf('\n',i); i=e<0?src.length:e; continue; }
  if(c==='"'||c==="'"||c==='`'){ q=c; i++; continue; }
  if(c==='/' && /[=(,:!&|?{};]\s*$/.test(o.slice(-3))){ let j=i+1; while(j<src.length && src[j]!=='/'){ if(src[j]==='\\') j++; j++; } i=j+1; while(/[gimy]/.test(src[i]||'')) i++; o+='/re/'; continue; }
  o+=c; i++; } return o; }
const M=fs.existsSync(path.join(__dirname,'..','modules','asthma_v2'))?path.join(__dirname,'..','modules','asthma_v2'):path.join(__dirname,'..','v2');
const lit=s=>(s.match(/(?<![\w$.])\d+(\.\d+)?(?![\w$])/g)||[]).filter(n=>n!=='0'&&n!=='1');
const eng=stripCode(fs.readFileSync(path.join(M,'asthma_v2_engine.js'),'utf8')); ok(lit(eng).length===0,'엔진 수치 리터럴: '+lit(eng).join(','));
let ui=fs.readFileSync(path.join(M,'asthma_v2_ui.js'),'utf8'); ui=ui.slice(0,ui.indexOf('st.textContent=['))+ui.slice(ui.indexOf('].join("\\n");')); ui=stripCode(ui);
ok(lit(ui).length===0,'UI 수치 리터럴: '+lit(ui).join(','));
/* 5 */
const D=b.ASTHMA26, E=b.ASTHMA26_ENGINE;
const v1Brands=a.ASTHMA_DATA.INHALERS.list.map(x=>x.brand);
D.PRODUCTS.filter(p=>p.v1_brand).forEach(p=>ok(v1Brands.indexOf(p.v1_brand)>=0,'v1_brand 조인 실패 '+p.id));
ok(v1Brands.every(br=>D.PRODUCTS.some(p=>p.v1_brand===br)),'v1 INHALERS 전 브랜드 매핑');
D.PRODUCTS.forEach(p=>{ p.ingredients.forEach(did=>ok(!!E.drugCls(did),'성분 계열 없음 '+did)); if(p.reimb) ok(!!D.REIMB_2026[p.reimb],'규칙 없음 '+p.reimb); (p.notice||[]).forEach(n=>ok(!!D.NOTICES[n],'고시 없음 '+n)); if(p.err) ok(D.ERRATA.some(e=>e.id===p.err),'정정 없음 '+p.err); if(p.age_min_th) ok(D.TH[p.age_min_th]!==undefined,'TH 없음 '+p.age_min_th); });
const recIds=new Set(D.REC_2026.map(r=>r.id)); ok(recIds.size===D.REC_2026.length,'REC id 중복');
D.STEP_TABLE.forEach(s=>['t1','t2','t1_init','t2_init'].forEach(k=>{ if(s[k]) s[k].recs.forEach(r=>ok(recIds.has(r),'REC 없음 '+r)); }));
D.STEP_TABLE.forEach(s=>(s.other||[]).forEach(r=>ok(recIds.has(r),'REC 없음 '+r)));
D.ADVICE.forEach(x=>ok(recIds.has(x.rec),'ADVICE REC 없음 '+x.rec));
D.REC_2026.forEach(r=>{ const gl=D.GUIDELINES[r.guideline]; ok(!!gl,'GL 없음 '+r.id); const rs=D.REC_SYSTEMS[gl.recsys]; ok(!!rs.grade[r.grade],'grade '+r.id); if(r.loe) ok(!!rs.loe[r.loe],'loe '+r.id); });
Object.values(D.TOPIC_ERRATA).forEach(arr=>arr.forEach(id=>ok(D.ERRATA.some(e=>e.id===id),'TOPIC_ERRATA '+id)));
Object.values(D.BIO_V1_PATCH).forEach(x=>{ ok(!!D.NOTICES[x.notice],'patch notice'); ok(D.ERRATA.some(e=>e.id===x.err),'patch err'); });
ok(Object.keys(D.BIO_V1_PATCH).every(k=>a.ASTHMA_BIO_ID_MAP[k]===D.BIO_V1_PATCH[k].drug),'BIO_V1_PATCH ↔ v1 ASTHMA_BIO_ID_MAP');
ok(D.ICS_DOSE.every(r=>r.fixed||r.low_max<r.med_max),'ICS_DOSE 경계 순서');
const tplAll=JSON.stringify(D).match(/\{TH\.(\w+)\}/g)||[]; tplAll.forEach(t=>ok(D.TH[t.slice(4,-1)]!==undefined,'tpl TH 없음 '+t));
ok(D.TESTS_PAY.find(t=>t.lab==='lab:feno').pay==='비급여','FeNO = 비급여(사용자 결정 D10)');
/* 6 */
['tab','topic','rcheck','sim','acc','mtx','act','acq'].forEach(k=>ok(k in b.APP,'APP v1 키 '+k));
['recommend','modules','REGISTRY_VERSION','localMap','asthma26'].forEach(k=>ok(k in b.APP && !(k in a.APP),'APP 가산 키 '+k));
ok(b.APP.REGISTRY_VERSION==='asthma-v2-2026.11','REGISTRY_VERSION');
ok(!!b.document.getElementById('tab-flow') && !a.document.getElementById('tab-flow'),'플로우 탭 가산');
/* 7 SPEC §8 */
const by=id=>G.find(g=>g.id===id).expect;
ok(by('G1').step[1]===1 && by('G1').regimens[0].indexOf('ICS-formoterol')>=0 && by('G1').conflicts.includes('asthma:conf26:ics_saba'),'S1 1단계 AIR + ICS-SABA 미도입');
ok(by('G2').regimens[0].indexOf('switch:')===0 && ['enerzair','trelegy','trimbow'].every(p=>by('G2').reimb['asthma:prod:'+p]==='ok') && by('G2').reimb['asthma:prod:spiriva_rm']==='unmet','S2 MART 전환 + 삼제 급여 충족 + 티오트로피움(고용량 필요) 미충족');
ok(['nucala_vial','nucala_ai','fasenra','cinqaero'].every(p=>by('G3').reimb['asthma:prod:'+p]==='ok') && by('G3').reimb['asthma:prod:dupixent']==='unmet' && by('G3').reimb['asthma:prod:tezspire']==='no','S3 IL-5 충족 · 두필루맙(≥4) 미충족 · 테즈파이어 비급여');
ok(['nucala_vial','nucala_ai','fasenra','cinqaero','dupixent','xolair'].every(p=>by('G4').reimb['asthma:prod:'+p]==='unmet') && by('G4').conflicts.includes('asthma:conf26:bio_lama_first') && by('G4').errata.includes('asthma:err:AE1'),'S4 LAMA 미사용 → 전부 미충족 + AE1');
ok(by('G5').reimb['asthma:prod:xolair']==='ok' && by('G5').flags.includes('asthma:flag:age_flow'),'S5 오말리주맙 소아 IgE 150 충족(AE2)');
ok(by('G6').ae==='severe' && by('G6').conflicts.includes('asthma:conf26:o2_target') && by('G6').errata.includes('asthma:err:AE12'),'S6 중증 악화 + 산소 목표 상충');
ok(by('G19').reimb['asthma:prod:xolair']==='ok' && by('G20').reimb['asthma:prod:xolair']==='unmet','경계 FEV1 79/80');
ok(by('G17').reimb['asthma:prod:nucala_ai']==='ok' && by('G17').reimb['asthma:prod:nucala_vial']==='unmet','15세 오토인젝터만');
ok(by('G18').reimb['asthma:prod:nucala_vial']==='unmet' && by('G18').reimb['asthma:prod:dupixent']==='ok','호산구 299');
ok(by('G16').reimb['asthma:prod:dupixent']==='ok' && by('G16').flags.includes('asthma:flag:ocs_eos'),'OCS 의존 경로');
ok(by('G15').reimb['asthma:prod:montelukast']==='ok','AERD LTRA 1차');
/* 8 변이 */
const T=D.TH, keep=T.r_eos_400; T.r_eos_400=keep+keep; const m=got(b,G.find(g=>g.id==='G3').p); T.r_eos_400=keep;
ok(m.reimb['asthma:prod:cinqaero']!=='ok','변이 테스트: TH 변조가 검출되지 않음');
console.log((fail?'FAILED':'ALL PASS')+' '+pass+'/'+(pass+fail)); process.exit(fail?1:0);
