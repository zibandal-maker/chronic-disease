/* dyslipidemia v2 — SEO 정적 레이어 정합 (조립 후처리)
   사용: node seo_v2.js <v1.html> <v2.html>   (v2.html을 제자리 갱신)
   - 값은 전부 v2 런타임(패치 후 DRUG_DB · SEO_2026 · DRUG_UPDATES_2026)에서 파생. 이 파일에 임상 값 없음.
   - 템플릿 충실도: v1 DRUG_DB로 v1 noscript 섹션 전부를 재현할 수 있어야 진행(불일치 시 exit 1).
   - 멱등: 이미 반영된 v2에 재실행해도 결과 동일. */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const [, , V1, V2] = process.argv;
if (!V1 || !V2) { console.error('usage: node seo_v2.js <v1.html> <v2.html>'); process.exit(2); }

function load(file) {
  const vc = new VirtualConsole();
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  return dom.window;
}
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* v1 SEO 생성기 규칙(충실도 검사로 확인): pearls 항목은 ', '로 분할해 li, 줄바꿈은 대상 파일 EOL */
function section(d, NL) {
  const li = [].concat.apply([], (d.pearls || []).map(x => String(x).split(/,\s*/))).map(x => '<li>' + escHtml(x) + '</li>').join('');
  return ['<section id="drug-' + d.en + '" class="seo-drug">',
    '  <h3>' + escHtml(d.name) + ' (' + escHtml(d.brand) + ') · ' + escHtml(d.en) + '</h3>',
    '  <p><b>투여</b>: ' + escHtml(d.route) + '</p>',
    '  <p><b>용법</b>: ' + escHtml(d.dose) + '</p>',
    '  <p><b>기전</b>: ' + escHtml(d.moa) + '</p>',
    '  ' + (d.status ? '<p><b>급여상태</b>: ' + escHtml(d.status) + '</p>' : '') + (d.priceNote ? '<p><b>급여</b>: ' + escHtml(d.priceNote) + '</p>' : '') + '<ul>' + li + '</ul>',
    '  <p><a href="#view-library">이상지질혈증 전체 가이드에서 보기 →</a></p>',
    '</section>'].join(NL);
}
const secRe = en => new RegExp('<section id="drug-' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '" class="seo-drug">[\\s\\S]*?</section>', 'g');

/* 1. 템플릿 충실도 (v1) */
const w1 = load(V1), v1src = fs.readFileSync(V1, 'utf8');
const eol = t => (t.indexOf('\r\n') >= 0 ? '\r\n' : '\n');
const DB1 = w1.eval('DRUG_DB');
let fid = 0, fidBad = [];
Object.keys(DB1).forEach(id => {
  const d = DB1[id], m = v1src.match(secRe(d.en));
  if (!m) return;
  fid++; if (m.length !== 1 || m[0] !== section(d, eol(m[0]))) fidBad.push(id);
});
if (!fid || fidBad.length) { console.error('✗ 템플릿 충실도 실패', fid, fidBad); process.exit(1); }
console.log('✓ 템플릿 충실도', fid + '/' + fid, '섹션 재현');

/* 2. v2 런타임 값 */
let out = fs.readFileSync(V2, 'utf8');
const w2 = load(V2);
const DB2 = w2.eval('DRUG_DB'), UPD = w2.eval('DRUG_UPDATES_2026'), SEO = w2.eval('SEO_2026');
const log = [];

/* 2-1. pearlsSupersede 원문 존재 확인(v1) + 패치 후 부재 확인(v2) */
Object.keys(UPD).forEach(id => (UPD[id].pearlsSupersede || []).forEach(x => {
  if ((DB1[id].pearls || []).indexOf(x.old) < 0) { console.error('✗ supersede 대상이 v1에 없음', id, x.old); process.exit(1); }
  if ((DB2[id].pearls || []).indexOf(x.old) >= 0) { console.error('✗ supersede 미적용', id); process.exit(1); }
}));

/* 2-2. noscript 섹션 재생성 (DRUG_UPDATES_2026 대상만) */
Object.keys(UPD).forEach(id => {
  const d = DB2[id]; if (!d) return;
  const re = secRe(d.en), m = out.match(re);
  if (!m || m.length !== 1) { console.error('✗ 섹션 위치 불명', id, m && m.length); process.exit(1); }
  const nu = section(d, eol(m[0]));
  if (m[0] !== nu) { out = out.replace(re, () => nu); log.push('noscript ' + id); }
});

/* 2-3. head: description · keywords · JSON-LD alternateName */
const hEnd = out.indexOf('</head>'); let head = out.slice(0, hEnd); const rest = out.slice(hEnd);
if (head.includes(SEO.description.from)) { const n = head.split(SEO.description.from).length - 1; head = head.split(SEO.description.from).join(SEO.description.to); log.push('description ×' + n); }
else if (!head.includes(SEO.description.to)) { console.error('✗ description 앵커 없음'); process.exit(1); }
head = head.replace(/(<meta name="keywords" content=")([^"]*)(")/, (all, a, kw, z) => {
  const have = kw.split(/,\s*/), add = SEO.keywordsAdd.filter(k => have.indexOf(k) < 0);
  if (add.length) log.push('keywords +' + add.length);
  return a + have.concat(add).join(', ') + z;
});
head = head.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (all, a, t, z) => {
  const j = JSON.parse(t);
  (j.mentions || []).forEach(mn => {
    const id = Object.keys(UPD).find(k => DB2[k] && DB2[k].en === mn.name); if (!id) return;
    const d = DB2[id], alt = [d.name, String(d.brand || '').replace(/\s*등$/, '')].concat(UPD[id].alias || []);
    const nu = alt.filter((x, i) => x && alt.indexOf(x) === i);
    if (JSON.stringify(nu) !== JSON.stringify(mn.alternateName)) { mn.alternateName = nu; log.push('jsonld ' + id); }
  });
  return a + JSON.stringify(j) + z;
});
out = head + rest;
fs.writeFileSync(V2, out);
console.log('✓ SEO 정합', log.length ? log.join(' · ') : '(변경 없음 — 멱등)');
