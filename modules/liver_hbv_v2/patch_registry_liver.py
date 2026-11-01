"""registry.json: liver → v2 전환 + changelog 1건 (멱등). 실행: python patch_registry_liver.py src/registry.json"""
import json, sys
P=sys.argv[1]
raw=open(P,'rb').read(); crlf=b'\r\n' in raw
R=json.loads(raw.decode('utf-8'))
g=[x for x in R['guides'] if x['id']=='liver'][0]
g['src']='chronic_liver_guide.v2.html'
g['guideline']='만성 간질환 통합 가이드 · B형간염(KASL 2026)·지방간(MASLD/MASH)·간경변 · 심평원 급여'
kw=g.get('keywords','').split(' ')
for t in ['KASL','2026','바이러스역가','중등도','바이러스혈증','HBV','DNA','베시포비르','베믈리디','TAF','예방요법','재활성화','고시','2025-177']:
    if t not in kw: kw.append(t)
g['keywords']=' '.join(k for k in kw if k)
E={"id":"upd:2026-11-01:liver-hbv-v2","date":"2026-11-01","guides":["liver"],"kind":"guideline",
 "title":"만성 간질환(B형간염) — KASL 2026 진료지침 반영·급여 원문 재검증",
 "summary":"대한간학회 만성 B형간염 진료지침 2026을 반영하고, 경구용 B형간염치료제 급여(고시 제2025-177호)를 원문으로 재검증했습니다. MASH·간경변 파트는 변동 없음.",
 "items":[
  "바이러스 역가 기반 4분류(고·HBeAg± 중등도·저바이러스혈증 + 비바이러스혈증)로 판정, 이전 지침(2022) 결과는 접어서 보존",
  "권고 89건을 KASL 등급(A1–C2)과 함께 표시 — 중등도 바이러스혈증 ALT 무관 치료(B1)",
  "지침–급여 상충 4건 표시: 중등도 ALT 무관 치료, HBeAg 양성 DNA 하한, 고바이러스혈증 위험인자, 소아 아데포비르",
  "정정: 대상성 간경변 급여는 HBV-DNA 양성(2,000 기준 아님) · 베시포비르 신장애는 금기 아닌 투여간격 조절",
  "정정: ALT 2×ULN은 성별 기준(남 34·여 30) · 예방요법 근거 고시 표기·항목 누락 보완",
  "2025-11-01 급여 확대 반영: TAF 비대상성·HCC 초치료·간이식·예방요법·수직감염, 재활성화 위험도 표"]}
cl=R.setdefault('changelog',[])
cl[:]=[x for x in cl if x.get('id')!=E['id']]; cl.insert(0,E)
s=json.dumps(R,ensure_ascii=False,indent=2)+'\n'
if crlf: s=s.replace('\n','\r\n')
open(P,'w',encoding='utf-8',newline='').write(s)
print('liver →',g['src'],'| changelog',len(cl),'| crlf',crlf)
