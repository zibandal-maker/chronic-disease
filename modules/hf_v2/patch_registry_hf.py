"""registry.json: hf → v2 전환 + changelog 1건 (멱등). 실행: python patch_registry_hf.py src/registry.json"""
import json, sys, io
P=sys.argv[1]
raw=open(P,'rb').read(); crlf=b'\r\n' in raw
R=json.loads(raw.decode('utf-8'))
g=[x for x in R['guides'] if x['id']=='hf'][0]
g['src']='hf_guide.v2.html'
g['guideline']='심부전 진료지침 · ESC 2026 · KSHF 2022 · HFrEF·HFpEF · FMT · 심평원 급여'
add=['ESC 2026','FMT','HFimpEF','베리시구앗','베르쿠보','이바브라딘','피네레논','케렌디아','정맥철분','페린젝트','세마글루타이드','비대상성 심부전']
kw=g['keywords'].split(' ')
for k in add:
    for t in k.split(' '):
        if t not in kw: kw.append(t)
g['keywords']=' '.join(kw)
E={"id":"upd:2026-11-01:hf-v2","date":"2026-11-01","guides":["hf"],"kind":"guideline",
 "title":"심부전 — 2026 ESC 심부전 지침 반영·급여 원문 재검증",
 "summary":"2026 ESC 심부전 지침을 해외 레이어로 반영하고, 심평원 고시·의약품안전나라 허가를 원문으로 재검증했습니다. 한국 레이어는 KSHF 2022(2026 개정 발표 대기).",
 "items":[
  "ESC 2026 분류(HFrEF <50%·HFpEF ≥50%)와 KSHF 2022 3분류 병기, LVEF 41–49% 외삽 표시",
  "치료 분류 FMT·AMT로 판정 — SGLT2i·MRA 전 LVEF I/A, 원내 SGLT2i 개시 I/B1, 비만 HFpEF GLP-1 IIa/B1",
  "지침–급여 상충 6건 표시: ARNI 41–49%, 베리시구앗 악화 요건, 피네레논 HF 비급여, 비빈혈 철결핍, GLP-1, 이바브라딘 HR",
  "정정: 베리시구앗 급여(고시 2023-165) 추가 · 이바브라딘 급여 HR ≥75·선별급여 50%",
  "정정: 정맥철분 급여는 Hb ≤10 필요 · 피네레논 심부전 목표용량 40 mg(eGFR ≥60)",
  "약제 상태: 포시가 취하(HF 적응증 제네릭만 급여) · 패티로머·디기톡신 국내 미허가",
  "임신 금기 6계열·NSAID III, 안전 임계값(K⁺·eGFR·SBP) 플래그"]}
cl=R.setdefault('changelog',[])
cl[:]=[x for x in cl if x.get('id')!=E['id']]; cl.insert(0,E)
s=json.dumps(R,ensure_ascii=False,indent=2)+'\n'
if crlf: s=s.replace('\n','\r\n')
open(P,'w',encoding='utf-8',newline='').write(s)
print('hf →',g['src'],'| changelog',len(cl),'| crlf',crlf)
