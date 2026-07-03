#!/usr/bin/env node
/**
 * verify_all_seo.js — 배포 전 일괄 재검증
 * ────────────────────────────────────────
 * guides_src/의 모든 SEO 파일에 대해:
 *   1) jsdom 렌더 에러 0 (검색엔진 파싱 안정성 — 헌장 "검색엔진 에러 테스트")
 *   2) SEO 필수요소 존재: <title>·description·canonical·JSON-LD·noscript
 *   3) 앵커 존재(noscript 내 id= 개수)
 * 실행: node verify_all_seo.js <guides_src_dir>
 */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || './guides_src';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

let pass = 0, fail = 0;
const results = [];

for (const f of files) {
  const fp = path.join(DIR, f);
  const html = fs.readFileSync(fp, 'utf-8');
  const errors = [];
  // jsdom이 구현 안 한 브라우저 API는 실제 브라우저에선 정상 → 무해 경고로 간주(화이트리스트).
  // 실브라우저(Playwright) 검증에서 에러 0 확인된 패턴들.
  // "Not implemented"류는 jsdom이 브라우저 API를 구현 안 한 것 → 확실히 무해.
  // addEventListener null 등 코드성 에러는 여기 넣지 않는다(진짜 결함일 수 있음).
  // 그런 파일은 아래에서 needBrowserCheck로 표시 → Playwright 교차검증 권고.
  const BENIGN = [
    /Not implemented:/i,          // scrollTo, HTMLCanvasElement.getContext 등 전부
    /Could not parse CSS stylesheet/i,
  ];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const msg = (e.message || e).toString().split('\n')[0];
    if (BENIGN.some(re => re.test(msg))) return; // 무해 → 무시
    errors.push(msg);
  });

  try {
    new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true });
  } catch (e) {
    errors.push('FATAL: ' + String(e).split('\n')[0]);
  }

  // SEO 요소 체크
  const has = {
    title:     (html.match(/<title>/g) || []).length,
    desc:      (html.match(/name="description"/g) || []).length,
    canonical: (html.match(/rel="canonical"/g) || []).length,
    ld:        (html.match(/application\/ld\+json/g) || []).length,
    noscript:  (html.match(/<noscript/g) || []).length,
  };
  const anchors = (html.match(/id="(drug|term|disease|concept|layer|class|profile)-/g) || []).length;

  // 판정: SEO요소 정상 + (jsdom 무해에러만 남음)
  const seoOk = has.title === 1 && has.canonical === 1 && has.ld >= 1 && has.noscript >= 1;
  const ok = errors.length === 0 && seoOk;
  // SEO는 되는데 jsdom 코드에러만 남은 경우 = 실브라우저 확인 권고(대개 무해)
  const needBrowserCheck = seoOk && errors.length > 0;

  results.push({ f, err: errors.length, has, anchors, ok, needBrowserCheck, errMsg: errors[0] || '' });
  if (ok) pass++; else fail++;
}

// 출력
console.log('파일'.padEnd(34), 'jsdom', 'title', 'desc', 'canon', 'ld', 'nos', 'anchors', '판정');
console.log('-'.repeat(90));
for (const r of results) {
  console.log(
    r.f.padEnd(34),
    String(r.err).padStart(3),
    String(r.has.title).padStart(5),
    String(r.has.desc).padStart(4),
    String(r.has.canonical).padStart(5),
    String(r.has.ld).padStart(3),
    String(r.has.noscript).padStart(4),
    String(r.anchors).padStart(6),
    '  ', r.ok ? '✅' : (r.needBrowserCheck ? '🌐' : '⚠️')
  );
  if (r.needBrowserCheck) {
    console.log('     └ jsdom: ' + r.errMsg.slice(0, 70) + '  → 실브라우저 확인 필요(대개 무해)');
  }
}
console.log('-'.repeat(90));
console.log(`통과 ${pass} / 실패 ${fail} / 총 ${files.length}`);
console.log('  ✅ 배포OK  🌐 SEO정상·jsdom경고(실브라우저 확인)  ⚠️ SEO미주입/결함');
process.exit(fail > 0 ? 1 : 0);
