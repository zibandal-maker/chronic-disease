"""registry.json: copd → v2 전환 + changelog 1건 (멱등). 실행: python modules/copd_v2/patch_registry_copd.py src/registry.json"""
import json, sys
P=sys.argv[1]
raw=open(P,'rb').read(); crlf=b'\r\n' in raw
R=json.loads(raw.decode('utf-8'))
g=[x for x in R['guides'] if x['id']=='copd'][0]
g['src']='copd_guide.v2.html'
g['guideline']='대한결핵및호흡기학회 KATRD 2024 · GOLD 2026 · 심평원 급여(2026-11)'
add=['GOLD 2026','KATRD','CAAT','삼제','트렐리지','브레즈트리','트림보우','로플루밀라스트','듀피젠트','누칼라','폐렴구균','RSV','급성악화']
kw=g['keywords'].split(' ')
for k in add:
    for t in k.split(' '):
        if t not in kw: kw.append(t)
g['keywords']=' '.join(kw)
E={"id":"upd:2026-11-06:copd-v2","date":"2026-11-06","guides":["copd"],"kind":"guideline",
 "title":"COPD — GOLD 2026 반영·KATRD 2024 권고등급·급여 원문 재검증",
 "summary":"GOLD 2026을 해외 레이어로 반영하고 KATRD 2024의 GRADE 권고등급(KQ1–9)을 붙였습니다. 흡입제·삼제·로플루밀라스트·생물학제제 급여를 심평원 고시와 의약품안전나라 허가 원문으로 재검증했습니다.",
 "items":[
  "GOLD 2026 E군 = 중등도·중증 악화 1회 이상 — 국내 고/저위험과 나란히 표시, 2025 기준 대비 바뀐 환자에 '기준 변경' 표시",
  "GOLD 2026 초치료·추적(악화/호흡곤란 경로) 판정, 호산구 100·300 분기, 생물학제제·로플루밀라스트·아지스로마이신 조건",
  "삼제 급여를 제품별로: 트렐리지·브레즈트리(2026-176 신설) FEV1 <60% 또는 연 2회 / 트림보우 <50% 또는 2회·입원 1회 — 투여소견서 표시",
  "정정: ICS/LABA 급여는 FEV1 <60% 또는 연 2회(OR) · LABA+LAMA 급여는 FEV1 <80% 또는 증상 미조절 · 로플루밀라스트 OR 경로·병용 요건",
  "듀피젠트·누칼라(오토인젝터만 COPD 허가) COPD 비급여, 아지스로마이신 COPD 예방 급여 근거 없음",
  "지침–급여 상충 9건 표시(악화 1회 삼제, 초치료 삼제, 생물학제제 등)",
  "백신: 대한감염학회 2026 폐렴구균(PCV21·PCV20 또는 PCV15→PPSV23), RSV 3품목 허가·권고 / 급성악화 모드(스테로이드 5일·항생제 5일·HFNT 우선)"]}
cl=R.setdefault('changelog',[])
cl[:]=[x for x in cl if x.get('id')!=E['id']]; cl.insert(0,E)
s=json.dumps(R,ensure_ascii=False,indent=2)+'\n'
if crlf: s=s.replace('\n','\r\n')
open(P,'w',encoding='utf-8',newline='').write(s)
print('copd →',g['src'],'| changelog',len(cl),'| crlf',crlf)
