/* copd v2 회귀 — node regress_copd.js <v1.html> <v2.html> <golden.json>
   1) v1 엔진(CD.*) 출력 v1·v2 파일 동일  2) 2026 기대값  3) 정문 계약  4) 엔진 리터럴 0  5) REGIMEN_MAP = v1 matrix 전수
   6) APP v1 키 보존 + 가산 5키  7) SPEC §8 핵심 판정  8) 변이 검출 */
const load=require('./copd_load'), fs=require('fs'), path=require('path');
const [V1,V2,GF]=process.argv.slice(2); const G=JSON.parse(fs.readFileSync(GF,'utf8'));
let pass=0, fail=0; const ok=(c,m)=>{ if(c){pass++;} else {fail++; console.log('FAIL',m);} };
const A=load(V1).w, B=load(V2).w;
const strip=o=>JSON.parse(JSON.stringify(o));
// 1
G.forEach(g=>{ ['copdRecommend','clinicalEngine','careEngine','simAssess'].forEach(fn=>{
  const x=strip(A.CD[fn](JSON.parse(JSON.stringify(g.p)))), y=strip(B.CD[fn](JSON.parse(JSON.stringify(g.p))));
  ok(JSON.stringify(x)===JSON.stringify(y), g.id+' v1 '+fn+' 차이'); });
  const reg=(A.CD.copdRecommend(JSON.parse(JSON.stringify(g.p))).drugs||[])[0]||null;
  ok(JSON.stringify(strip(A.CD.reimbEngine(JSON.parse(JSON.stringify(g.p)),reg)))===JSON.stringify(strip(B.CD.reimbEngine(JSON.parse(JSON.stringify(g.p)),reg))), g.id+' v1 reimbEngine 차이'); });
// 2
function check(w,g,label){ const a=w.COPD26_ENGINE.applyCopd2026(JSON.parse(JSON.stringify(g.p))); const e=g.expect;
  const reimb={}, opinion=[]; a.drugs.forEach(d=>{ reimb[d.id]=d.reimb&&d.reimb.status; if(d.reimb&&d.reimb.opinion&&d.reimb.status==='ok') opinion.push(d.id); });
  const addons={}; a.addons.forEach(x=>addons[x.id]=x.met);
  const got={ kr:a.group.kr, gold26:a.group.gold26, changed:a.group.changed, path:a.path, algo:a.algo,
    kr_regimen:(a.regimens.find(r=>r.layer==='gl:copd:katrd-2024')||{}).label||null, gold_regimen:a.regimens.find(r=>r.layer==='gl:copd:gold-2026').label,
    gold_keep:a.regimens.find(r=>r.layer==='gl:copd:gold-2026').keep, reimb, opinion, addons, unavailable:a.unavailable.map(d=>d.id),
    conflicts:a.conflicts.map(x=>x.x), flags:a.flags.map(f=>f.id), advice:a.advice.map(x=>x.id), vacc_due:a.vaccines.filter(v=>v.due).map(v=>v.id),
    aecopd:a.aecopd.map(x=>x.id), errata:a.errata, top_kr_rec:((a.regimens.find(r=>r.layer==='gl:copd:katrd-2024')||{}).recs||[]).map(r=>r.id)[0]||null };
  let bad=[]; Object.keys(e).forEach(k=>{ if(JSON.stringify(e[k])!==JSON.stringify(got[k])) bad.push(k+': 기대 '+JSON.stringify(e[k])+' / 실제 '+JSON.stringify(got[k])); });
  return bad; }
G.forEach(g=>{ const bad=check(B,g); ok(bad.length===0, g.id+' 2026 기대값\n   '+bad.join('\n   ')); });
// 3
G.forEach(g=>{ const r=B.APP.recommend(JSON.parse(JSON.stringify(g.p))); ok(Array.isArray(r.drugs)&&Array.isArray(r.targets)&&Array.isArray(r.flags)&&r.drugs.every(d=>d.id&&d.id.indexOf('copd:prod:')===0), g.id+' 정문 형태'); });
// 4
function stripCode(src){ let o='',i=0,q=null; while(i<src.length){ const c=src[i], n=src[i+1];
  if(q){ if(c==='\\'){ i+=2; continue; } if(c===q){ q=null; o+=c+c; } i++; continue; }
  if(c==='/'&&n==='*'){ const e=src.indexOf('*/',i+2); i=e<0?src.length:e+2; continue; }
  if(c==='/'&&n==='/'){ const e=src.indexOf('\n',i); i=e<0?src.length:e; continue; }
  if(c==='"'||c==="'"||c==='`'){ q=c; i++; continue; }
  if(c==='/' && /[=(,:!&|?{};]\s*$/.test(o.slice(-3))){ let j=i+1; while(j<src.length && src[j]!=='/'){ if(src[j]==='\\') j++; j++; } i=j+1; while(/[gimy]/.test(src[i]||'')) i++; o+='/re/'; continue; }
  o+=c; i++; } return o; }
const M=fs.existsSync(path.join(__dirname,'..','modules','copd_v2'))?path.join(__dirname,'..','modules','copd_v2'):path.join(__dirname,'..','v2'); const eng=stripCode(fs.readFileSync(path.join(M,'copd_v2_engine.js'),'utf8'))
  ;
const lits=(eng.match(/(?<![\w$.])\d+(\.\d+)?(?![\w$])/g)||[]).filter(n=>n!=='0'&&n!=='1');
ok(lits.length===0,'엔진 수치 리터럴: '+lits.join(','));
let ui=fs.readFileSync(path.join(M,'copd_v2_ui.js'),'utf8'); ui=ui.slice(0,ui.indexOf('st.textContent=['))+ui.slice(ui.indexOf('].join("\\n");'));
ui=stripCode(ui);
const uil=(ui.match(/(?<![\w$.])\d+(\.\d+)?(?![\w$])/g)||[]).filter(n=>n!=='0'&&n!=='1'); ok(uil.length===0,'UI 수치 리터럴: '+uil.join(','));
// 5
const regs=new Set(); ['ALGO_INITIAL','ALGO_FOLLOWUP'].forEach(k=>Object.values(B.CD[k].matrix).forEach(v=>regs.add(v.regimen)));
ok(JSON.stringify([...regs].sort())===JSON.stringify(Object.keys(B.COPD26.REGIMEN_MAP).sort()),'REGIMEN_MAP 키 ≠ v1 matrix: '+[...regs].join('|'));
// 6
['tab','topic','acc','flow','sim','dxTool','rcheck'].forEach(k=>ok(k in B.APP,'APP v1 키 '+k));
['recommend','modules','REGISTRY_VERSION','localMap','copd26'].forEach(k=>ok(k in B.APP && !(k in A.APP),'APP 가산 키 '+k));
ok(B.APP.REGISTRY_VERSION==='copd-v2-2026.11','REGISTRY_VERSION');
// 7 SPEC §8 핵심(사람이 읽는 단언)
const by=id=>G.find(g=>g.id===id).expect;
ok(by('G1').gold26==='copd:gold26:E' && by('G1').kr==='copd:group:low' && by('G1').changed===true && by('G1').conflicts.includes('X7'),'S1 저위험 + GOLD E + 기준변경 + X7');
ok(by('G2').conflicts.includes('X1') && ['copd:prod:trelegy','copd:prod:breztri','copd:prod:trimbow'].every(p=>by('G2').reimb[p]==='unmet'),'S2 X1 삼제 3품목 미충족');
ok(['copd:prod:trelegy','copd:prod:breztri','copd:prod:trimbow'].every(p=>by('G3').reimb[p]==='ok') && by('G3').opinion.includes('copd:prod:trimbow') && by('G3').top_kr_rec==='copd:rec26:kq3','S3 삼제 급여 + 트림보우 소견서 + KQ');
ok(by('G4').reimb['copd:prod:dupixent']==='no' && by('G4').reimb['copd:prod:nucala_ai']==='no' && by('G4').reimb['copd:prod:daxas']==='ok' && by('G4').conflicts.includes('X3'),'S4 생물학제제 비급여 + 로플루 급여');
ok(by('G5').addons['copd:addon26:roflu']===false && by('G5').reimb['copd:prod:daxas']==='ok' && by('G5').conflicts.includes('X4') && by('G5').addons['copd:addon26:azithro']===false && by('G5').advice.includes('copd:rec26:kr_smoking'),'S5 X4 + 흡연');
ok(by('G6').aecopd.includes('copd:rec26:g_ae_hfnt') && by('G6').aecopd.includes('copd:rec26:g_ae_abx') && by('G6').errata.includes('copd:err:CE12'),'S6 악화 모드');
ok(by('G18').reimb['copd:prod:trelegy']===undefined && by('G18').algo==='copd:algo26:exac_dual_low','경계 FEV1 60/호산구 99');
ok(by('G7').reimb['copd:prod:anoro']==='unmet' && by('G8').reimb['copd:prod:anoro']==='ok' && by('G9').reimb['copd:prod:anoro']==='unknown','2022-56 FEV1 80 경로');
ok(by('G11').reimb['copd:prod:trelegy']==='unmet' && by('G11').conflicts.includes('X6'),'LABA+ICS → 삼제(나.항 증상 미조절 필요)');
// 8 변이: 급여 임계값 변조 시 검출
const T=B.COPD26.TH, keep=T.r_fev1_triple_tb_lt; T.r_fev1_triple_tb_lt=keep+keep; const m=check(B,G.find(g=>g.id==='G2')); T.r_fev1_triple_tb_lt=keep;
ok(m.length>0,'변이 테스트: TH 변조가 검출되지 않음');
console.log((fail?'FAILED':'ALL PASS')+' '+pass+'/'+(pass+fail)); process.exit(fail?1:0);
