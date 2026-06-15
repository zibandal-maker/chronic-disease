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
for (const g of REG.guides) {
  const srcPath = findSrc(g.src);
  if (!srcPath) {
    console.warn(`✗ ${g.id}: 원본 없음 (${g.src}) — 건너뜀`);
    miss++;
    continue;
  }
  let html = fs.readFileSync(srcPath, 'utf8');
  html = injectHeader(html, g);
  fs.writeFileSync(path.join(OUT_DIR, g.out), html);
  console.log(`✓ ${g.id.padEnd(14)} → guides/${g.out}  (${(html.length/1024).toFixed(0)} KB)`);
  ok++;
  built.push({ id: g.id, out: g.out });
}

// ── 대시보드 index.html 생성 (템플릿에 registry 인라인 주입) ──
const tpl = fs.readFileSync(path.resolve(ROOT, 'src', 'index.template.html'), 'utf8');
const buildDate = new Date().toISOString().slice(0, 10);
const indexHtml = tpl
  .split('__REGISTRY__').join(JSON.stringify(REG))
  .split('__BUILD_DATE__').join(buildDate);
fs.writeFileSync(path.join(ROOT, 'public', 'index.html'), indexHtml);
console.log(`✓ 대시보드      → index.html`);

// 빌드 매니페스트(대시보드 fallback/디버그용)
fs.writeFileSync(
  path.join(ROOT, 'public', 'build-manifest.json'),
  JSON.stringify({ builtAt: new Date().toISOString(), built }, null, 2)
);

console.log(`\n빌드 완료: ${ok}개 성공, ${miss}개 누락.`);
if (miss > 0) process.exitCode = 0; // 누락은 경고만, 배포는 진행
