# liver(B형간염) v2 회귀 하네스 — Wave 1 #2
리포 루트에서:
```
python modules/liver_hbv_v2/assemble.py          # v1(무수정) + 가산 모듈 → guides_src/chronic_liver_guide.v2.html
node tests/regress_liver.js guides_src/chronic_liver_guide.html guides_src/chronic_liver_guide.v2.html tests/liver_hbv_golden.json
node tests/ui_smoke_liver.js guides_src/chronic_liver_guide.v2.html
```
- regress: ① v1 HBV 엔진(클로저)을 소스에서 vm 추출 → v1·v2 파일 출력 동일 ② KASL 2026 판정 기대값(스펙 §9-2) ③ 급여 재구현 == v1 rbTreat (G11만 erratum E5 expected diff)
- ui_smoke: 2026 입력·판정 카드·이전 지침 접힘·도서관 7카드·시뮬 병기·MASH 토글·pageerror 0 (20항목)
- `tests/pw_liver.py <abs v2.html> <shot_dir>`: Playwright 모바일 렌더(선택)
