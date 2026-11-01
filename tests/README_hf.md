# hf v2 (ESC 2026 · 급여 원문 2026-11) 테스트

리포 루트에서:

```
python modules/hf_v2/assemble.py                     # guides_src/hf_guide.v2.html 생성 (v1 무수정)
node tests/regress_hf.js guides_src/hf_guide.html guides_src/hf_guide.v2.html tests/hf_golden.json
node tests/ui_smoke_hf.js guides_src/hf_guide.html guides_src/hf_guide.v2.html
python tests/pw_hf.py guides_src/hf_guide.v2.html tests/shots_hf   # 선택(Playwright)
node scripts/verify_all_seo.js guides_src
```

- regress_hf: ① v1 `HF_ENGINE.recommend`·`HF.recommend` 출력 v1·v2 동일(20건) ② 2026 기대값 G1–G20(표현형·약제·급여 상태·상충·금기·플래그·정정) ③ 정문 계약 ④ 엔진 수치 리터럴 0
- ui_smoke_hf: v1 JS 영역 바이트 동일 · 가산 script 1개 · SEO 정적층(noscript 교체 6 + concept-esc2026) · 헤더·도서관 9카드·플로우 입력/판정/legacy 접힘·시뮬 6증례·푸터·탭·pageerror 0
- 의존: jsdom(리포 node_modules), WhenDSL은 `modules/liver_hbv_v2/when_dsl.js` 단일 원본
