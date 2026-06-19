#!/usr/bin/env node
/**
 * build.js — 만성질환 가이드 포털 빌드
 *
 * 원칙:
 *  - 원본 HTML(uploads)을 절대 수정하지 않는다. 읽어서 가공본을 public/guides에 쓴다.
 *  - 각 가이드 상단에 "공통 헤더"를 주입한다 (position:fixed 상단바 + body push-down).
 *    → 기존 가이드의 sticky 탭바와 충돌하지 않게, 주입 헤더 높이만큼 body를 내린다.
 *  - 멱등(idempotent): 이미 주입된 표식(MARK)이 있으면 건너뛴다.
 *  - registry.json 단일 진실 공급원. 가이드 추가/이모지/제목 변경은 여기만 고친다.
 *
 * 사용:  node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIRS = [
  path.resolve(ROOT, 'guides_src'),                 // 1순위: 리포 내 원본
  '/mnt/user-data/uploads',                         // 2순위: 업로드 폴더(빌드 환경)
];
const OUT_DIR = path.resolve(ROOT, 'public', 'guides');
const REG = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'src', 'registry.json'), 'utf8'));

const MARK = '<!--PORTAL_HEADER_V1-->';
const HDR_H = 46; // px, 주입 헤더 높이

function findSrc(filename) {
  for (const d of SRC_DIRS) {
    const p = path.join(d, filename);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ── 가이드 본문에서 검색 색인 텍스트 추출 ──
// JS 데이터 객체 안에 콘텐츠가 있는 가이드(dm 등)를 위해 script 내 문자열 리터럴도 긁는다.
function extractSearchIndex(html) {
  let s = html;
  // style 블록 제거 (검색 가치 없음)
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  // script 내 따옴표 문자열 리터럴 추출 (약물명·상품명이 여기 있음)
  const literals = [];
  const reLit = /["'`]([^"'`\n]{2,80})["'`]/g;
  let m;
  while ((m = reLit.exec(s)) !== null) literals.push(m[1]);
  // 태그 사이 텍스트 노드 추출 (script 제거 후)
  let noScript = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  noScript = noScript.replace(/<[^>]+>/g, ' ');
  let text = literals.join(' ') + ' ' + noScript;
  // HTML 엔티티 디코드 (간이)
  text = text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
             .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
  // 토큰화: 한글/영문/숫자 덩어리만, 코드성 토큰(함수명·CSS·색상값) 걸러내기
  const tokens = text.match(/[가-힣A-Za-z][가-힣A-Za-z0-9.\-]{1,}/g) || [];
  const STOP = new Set(['function','return','const','var','let','this','null','true','false',
    'div','span','class','style','color','width','height','padding','margin','border','background',
    'document','window','length','push','href','onclick','value','innerHTML','forEach','querySelector',
    'addEventListener','px','rgba','rgb','solid','flex','none','block','center','left','right','top','bottom']);
  const seen = new Set();
  const out = [];
  for (let t of tokens) {
    const low = t.toLowerCase();
    // CSS/색상/순수숫자/너무짧은 영문 제거
    if (/^[0-9.\-]+$/.test(t)) continue;
    if (/^[a-f0-9]{6}$/i.test(t)) continue; // hex color
    if (STOP.has(low)) continue;
    if (/^[a-z]{1,2}$/.test(low)) continue; // 1~2자 영문 약어는 노이즈 많음
    if (seen.has(low)) continue;            // 중복 제거 → 색인 압축
    seen.add(low);
    out.push(t);
    if (out.length >= 3000) break;          // 도구당 상한(색인 비대화 방지)
  }
  return out.join(' ');
}

function headerSnippet(g) {
  // 같은 origin이라 부모 페이지로 history.back; 단독 진입 시엔 index로.
  return `${MARK}
<style>
  #portal-hdr{position:fixed;top:0;left:0;right:0;height:${HDR_H}px;z-index:99999;
    display:flex;align-items:center;gap:10px;padding:0 12px;box-sizing:border-box;
    background:rgba(248,250,252,.94);backdrop-filter:saturate(1.4) blur(10px);
    -webkit-backdrop-filter:saturate(1.4) blur(10px);
    border-bottom:1px solid rgba(20,40,60,.10);
    font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;}
  #portal-hdr a.ph-back,#portal-hdr a.ph-home{display:inline-flex;align-items:center;justify-content:center;
    height:30px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;
    color:#1a2530;background:#fff;border:1px solid rgba(20,40,60,.14);transition:.15s;}
  #portal-hdr a.ph-back{padding:0 11px 0 8px;gap:3px;}
  #portal-hdr a.ph-home{width:32px;font-size:15px;}
  #portal-hdr a.ph-back:active,#portal-hdr a.ph-home:active{transform:scale(.96);background:#eef1f4;}
  #portal-hdr .ph-emoji{font-size:17px;line-height:1;}
  #portal-hdr .ph-title{font-size:14.5px;font-weight:700;color:#16202b;white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;}
  #portal-hdr .ph-tag{font-size:11px;font-weight:600;color:#5a6a78;background:#eef1f4;
    padding:2px 7px;border-radius:999px;white-space:nowrap;}
  #portal-hdr .ph-accent{width:3px;height:18px;border-radius:2px;background:${g.accent};flex:0 0 auto;}
  #portal-hdr .ph-spacer{flex:1 1 auto;min-width:0;}
  body{padding-top:${HDR_H}px !important;}
  @media (max-width:380px){#portal-hdr .ph-tag{display:none;}}
</style>
<div id="portal-hdr" role="navigation" aria-label="포털 내비게이션">
  <a class="ph-back" href="../index.html" title="목록으로">‹ 목록</a>
  <a class="ph-home" href="../index.html" title="홈">🏠</a>
  <span class="ph-accent"></span>
  <span class="ph-emoji">${g.emoji}</span>
  <span class="ph-title">${g.title}</span>
  <span class="ph-spacer"></span>
  <span class="ph-tag">${g.tag}</span>
</div>
`;
}

function injectHeader(html, g) {
  if (html.includes(MARK)) {
    // 이미 주입됨 → 기존 주입 블록을 최신 스니펫으로 교체(멱등 + 갱신)
    const re = new RegExp(MARK + '[\\s\\S]*?<\\/div>\\s*(?=<!--\\/PORTAL_HEADER_V1-->)?', '');
    // 안전하게: 종료 마커 기반 교체
    const start = html.indexOf(MARK);
    const endMark = '<!--/PORTAL_HEADER_V1-->';
    const endIdx = html.indexOf(endMark);
    if (endIdx > -1) {
      return html.slice(0, start) + headerSnippet(g) + '\n' + html.slice(endIdx);
    }
    return html; // 종료 마커 없으면 손대지 않음(보수적)
  }
  const snippet = headerSnippet(g) + '\n<!--/PORTAL_HEADER_V1-->\n';
  // <body ...> 여는 태그 바로 뒤에 삽입
  const m = html.match(/<body[^>]*>/i);
  if (!m) {
    console.warn('  ! <body> 태그 없음 — 헤더 미주입');
    return html;
  }
  const idx = m.index + m[0].length;
  return html.slice(0, idx) + '\n' + snippet + html.slice(idx);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let ok = 0, miss = 0;
const built = [];
const searchIndex = {}; // id → 본문 추출 색인 텍스트
for (const g of REG.guides) {
  const srcPath = findSrc(g.src);
  if (!srcPath) {
    console.warn(`✗ ${g.id}: 원본 없음 (${g.src}) — 건너뜀`);
    miss++;
    continue;
  }
  let html = fs.readFileSync(srcPath, 'utf8');
  // 본문 검색 색인 추출 (헤더 주입 전 원본 기준)
  searchIndex[g.id] = extractSearchIndex(html);
  html = injectHeader(html, g);
  fs.writeFileSync(path.join(OUT_DIR, g.out), html);
  const idxKb = (searchIndex[g.id].length/1024).toFixed(0);
  console.log(`✓ ${g.id.padEnd(14)} → guides/${g.out}  (${(html.length/1024).toFixed(0)} KB, 색인 ${idxKb}KB)`);
  ok++;
  built.push({ id: g.id, out: g.out });
}

// 빌드 시점에 registry 사본에 검색 색인 부착 (registry.json 원본은 불변)
const REG_WITH_INDEX = JSON.parse(JSON.stringify(REG));
REG_WITH_INDEX.guides.forEach(g => { g._idx = searchIndex[g.id] || ''; });

// ── 대시보드 index.html 생성 (템플릿에 registry + SEO 인라인 주입) ──
const tpl = fs.readFileSync(path.resolve(ROOT, 'src', 'index.template.html'), 'utf8');
const buildDate = new Date().toISOString().slice(0, 10);
const M = REG.meta || {};
const SITE = (M.siteUrl || '').replace(/\/+$/, ''); // 끝 슬래시 제거

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// noscript 정적 링크 (크롤러용)
const noscriptLinks = REG.guides.map(g =>
  `<li><a href="guides/${g.out}">${esc(g.emoji)} ${esc(g.title)}</a> — ${esc(g.guideline)}</li>`
).join('\n        ');

// JSON-LD 구조화 데이터 (WebSite + ItemList)
const jsonld = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "진료지원 시스템",
  "description": M.seoDescription || "",
  "url": SITE + "/",
  "publisher": { "@type": "Organization", "name": M.owner || "" },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": REG.guides.map((g, i) => ({
      "@type": "ListItem", "position": i + 1, "name": g.title,
      "url": SITE + "/guides/" + g.out
    }))
  }
};

const indexHtml = tpl
  .split('__REGISTRY__').join(JSON.stringify(REG_WITH_INDEX))
  .split('__BUILD_DATE__').join(buildDate)
  .split('__SEO_DESC__').join(esc(M.seoDescription || ''))
  .split('__SEO_KEYWORDS__').join(esc(M.seoKeywords || ''))
  .split('__SITE_URL__').join(SITE)
  .split('__NOSCRIPT_LINKS__').join(noscriptLinks)
  .split('__JSONLD__').join(JSON.stringify(jsonld, null, 2));
fs.writeFileSync(path.join(ROOT, 'public', 'index.html'), indexHtml);
console.log(`✓ 대시보드      → index.html`);

// ── sitemap.xml 생성 (index + 14개 가이드) ──
const urls = [
  { loc: SITE + '/', priority: '1.0' },
  ...REG.guides.map(g => ({ loc: SITE + '/guides/' + g.out, priority: '0.8' }))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap);
console.log(`✓ sitemap.xml   → ${urls.length}개 URL`);

// ── robots.txt 생성 ──
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'public', 'robots.txt'), robots);
console.log(`✓ robots.txt`);

// 빌드 매니페스트(대시보드 fallback/디버그용)
fs.writeFileSync(
  path.join(ROOT, 'public', 'build-manifest.json'),
  JSON.stringify({ builtAt: new Date().toISOString(), built }, null, 2)
);

console.log(`\n빌드 완료: ${ok}개 성공, ${miss}개 누락.`);
if (!SITE || SITE.includes('YOUR-DOMAIN')) {
  console.log('\n⚠️  registry.json의 meta.siteUrl을 실제 배포 도메인으로 바꾸세요.');
  console.log('   현재 sitemap.xml·canonical·JSON-LD가 플레이스홀더 도메인을 가리킵니다.');
}
if (miss > 0) process.exitCode = 0; // 누락은 경고만, 배포는 진행
