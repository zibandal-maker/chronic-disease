# dyslipidemia 회귀 하네스 (계획 §7)
리포 루트에서:
```
node tests/regress.js guides_src/dyslipidemia_guide.html guides_src/dyslipidemia_guide.v2.html tests/dyslipidemia_golden.json
node tests/ui_smoke.js guides_src/dyslipidemia_guide.v2.html
```
- regress: (1) G1–G18 모두 v1·v2 `recommendLipid` 출력 동일 (2) v2 `recommend()`/`applyLipid2026()` 기대값(SPEC v2.1 §9-2) 일치. 불일치 시 exit 1.
- ui_smoke: 도서관 2026 카드·이전 지침 토글·플로우 2026 입력/판정/상충·시뮬 2026 분기·APP 정문·pageerror 0.

## 조립·배포 전 (2026-11-01 추가)
```
python modules/dyslipidemia_v2/assemble.py      # v1 + 모듈 → v2, 이어서 seo_v2.js(SEO 정적층 정합·템플릿 충실도 검사) 자동 실행
node tests/regress.js guides_src/dyslipidemia_guide.html guides_src/dyslipidemia_guide.v2.html tests/dyslipidemia_golden.json
node tests/ui_smoke.js guides_src/dyslipidemia_guide.v2.html     # 16항목
```
- `tests/pw_built.py <base_public> <new_public> <shot_dir>`: 빌드 산출물 실브라우저 비교(선택, Playwright 필요).
