"""registry.json: asthma → v2 전환 + changelog 1건 (멱등). 실행: python modules/asthma_v2/patch_registry_asthma.py src/registry.json"""
import json, sys
P=sys.argv[1]
raw=open(P,'rb').read(); crlf=b'\r\n' in raw
R=json.loads(raw.decode('utf-8'))
g=[x for x in R['guides'] if x['id']=='asthma'][0]
g['src']='asthma_guide.v2.html'
g['guideline']='대한결핵및호흡기학회 천식 진료지침 2026(6차) · GINA 2026 · 심평원 급여(2026-11)'
add=['KATRD','GINA2026','MART','AIR','삼제','에너제어','트렐리지','트림보우','스피리바','졸레어','옴리클로','누칼라','파센라','싱케어','듀피젠트','테즈파이어','FeNO','급성악화']
kw=g['keywords'].split(' ')
for k in add:
    if k not in kw: kw.append(k)
g['keywords']=' '.join(kw)
E={"id":"upd:2026-11-07:asthma-v2","date":"2026-11-07","guides":["asthma"],"kind":"guideline",
 "title":"천식 — KATRD 2026(6차)·GINA 2026 반영, 플로우 탭 신설, 급여 원문 재검증",
 "summary":"대한결핵및호흡기학회 천식 진료지침 2026 6차와 GINA 2026을 이중 레이어로 반영하고, 실환자 입력으로 단계·처방·제품별 급여를 판정하는 플로우 탭을 새로 만들었습니다. 생물학제제·삼제·흡입제 급여는 심평원 고시 원문으로 재검증했습니다.",
 "items":[
  "⚡ 플로우 탭 신설: 나이·현재 흡입제·증상·악화·호산구·IgE·FeNO 입력 → KATRD 초기 단계(표 4-4)·단계 조정·Track 1 전환 · GINA Evidence 칩 · 제품별 급여 판정",
  "생물학제제 급여 원문: ≥12세 모두 '고용량 ICS-LABA + LAMA' 필수(v1 체크리스트 누락 정정) · 오말리주맙 2025-224(소아 IgE ≥76, 16주 평가) · 메폴리주맙 2026-133(오토인젝터 ≥12세) · 두필루맙 OCS 경로 300 mg·6개월 평가",
  "정정: 트렐리지·트림보우는 천식 허가·급여 있음(성인 + 중간·고용량 ICS-LABA + 중증 악화 1회) · 에너제어 성분(인다카테롤/글리코피로니움/모메타손) · 어택트라(인다카테롤/모메타손) · 스피리바 천식 급여(고용량 + 중증 악화)",
  "MART 1일 최대: 허가(포스터 8회·심비코트 8회, 예외 12회) ⟷ KATRD 12회 상충 표시 · ICS 용량표 7행",
  "테즈파이어 급여 기준 없음 · 데페모키맙 국내 미허가 · 옴리클로(오말리주맙 바이오시밀러) 급여 등재 · FeNO 검사 비급여 명시",
  "급성 악화: KATRD SpO₂ 93–95% ⟷ GINA 2026 <92%에서만 산소·상한 95%, 프레드니솔론 1 mg/kg(최대 50) 5–7일, 아나필락시스 시 에피네프린 우선",
  "지침–급여 상충 12건(생물학제제 ICS 용량·악화 횟수·LAMA 선행·교체, 경증 AIR 급여, 삼제 등)"]}
cl=R.setdefault('changelog',[])
cl[:]=[x for x in cl if x.get('id')!=E['id']]; cl.insert(0,E)
s=json.dumps(R,ensure_ascii=False,indent=2)+'\n'
if crlf: s=s.replace('\n','\r\n')
open(P,'w',encoding='utf-8',newline='').write(s)
print('asthma →',g['src'],'| changelog',len(cl),'| crlf',crlf)
