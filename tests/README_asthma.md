# asthma v2 테스트 (KATRD 2026 · GINA 2026 · 급여 2026-11)
리포 루트에서 (jsdom 필요: `npm i jsdom` 또는 NODE_PATH 지정)
```
python modules/asthma_v2/patch_registry_asthma.py src/registry.json   # asthma src → v2, changelog (멱등)
python modules/asthma_v2/assemble.py                                  # guides_src/asthma_guide.v2.html 생성 + SEO
node tests/regress_asthma.js guides_src/asthma_totalcare_app__2_.html guides_src/asthma_guide.v2.html tests/asthma_golden.json   # 615/615
node tests/ui_smoke_asthma.js guides_src/asthma_guide.v2.html          # 45/45
python tests/pw_asthma.py guides_src/asthma_guide.v2.html shots/asthma # Playwright 420px
node scripts/build.js
```
- golden 재동결: 판정 변경을 검토한 뒤 `node tests/asthma_mkgolden.js guides_src/asthma_guide.v2.html`
- 공용 파일: `asthma_load.js`(jsdom 로더) · `asthma_got.js`(판정 요약) · `asthma_cases.json`(G1–G21, G1–G6 = SIM_CASES)
