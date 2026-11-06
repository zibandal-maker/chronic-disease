# copd v2 (KATRD 2024 · GOLD 2026 · 급여 원문 2026-11) 테스트

리포 루트에서:

```
python modules/copd_v2/assemble.py                    # guides_src/copd_guide.v2.html 생성 (v1 무수정) + SEO 정합
node tests/regress_copd.js guides_src/copd_guide__2_.html guides_src/copd_guide.v2.html tests/copd_golden.json
node tests/ui_smoke_copd.js guides_src/copd_guide.v2.html
python tests/pw_copd.py guides_src/copd_guide.v2.html tests/shots_copd   # 선택(Playwright)
node scripts/verify_all_seo.js guides_src
python modules/copd_v2/patch_registry_copd.py src/registry.json           # src → v2, changelog
```

- regress_copd(166): ① v1 `CD.copdRecommend·clinicalEngine·careEngine·simAssess·reimbEngine` 출력 v1·v2 동일(20건 × 5) ② 2026 기대값 G1–G20
  ③ 정문 형태 ④ 엔진·UI 수치 리터럴 0 ⑤ REGIMEN_MAP = v1 matrix 전수 ⑥ APP v1 키 보존 + 가산 5키 ⑦ SPEC §8 핵심 단언 ⑧ 변이 검출
- ui_smoke_copd(27): 도서관 블록·멱등·검색·토픽 정정 / 플로우 입력·결과·v1 접힘·상충·악화 모드·백신 / 시뮬 6증례·병기·불러오기 / v1 상태 오염 없음
- jsdom 필요(`npm i jsdom` 또는 NODE_PATH 지정)
