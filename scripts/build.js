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

// ── 공용 뒤로가기 트랩(Back-Trap): 모든 가이드에 자동 주입 ──
// 모바일/브라우저 뒤로가기가 페이지를 이탈시키지 않고 (1)열린 팝업을 닫거나 (2)앱 내부 "도서관 돌아가기" 뷰-백을 실행.
// build.js가 이 모듈의 단일 소스. 신규 가이드는 registry 추가 후 빌드만 하면 자동 적용. (원본 소스 무손상)
const BT_MARK = '<!--BACK_TRAP_V4-->';
const BT_OLD_MARKS = ['<!--BACK_TRAP_V1-->','<!--BACK_TRAP_V2-->','<!--BACK_TRAP_V3-->','<!--BACK_TRAP_V4-->'];
const BACKTRAP = BT_MARK + `
<script>
/* 공용 뒤로가기 트랩 v4 (build.js 자동 주입) — 뒤로가기 시 열린 팝업을 닫거나, 없으면 "‹ 도서관/돌아가기/목록으로" 뷰-백 실행.
   둘 다 없으면 정상 이탈. 앱 내부 함수명을 몰라도 DOM 레벨로 동작. */
(function(){
  "use strict";
  if(window.__backTrapInstalled) return; window.__backTrapInstalled=true;
  var armed=false, consuming=false, baseline=null, backTrapOK=true, lastSched=-1;
  var SHOW_CLASSES=['on','open','active','show','visible','is-open','opened','shown','in'];
  function inView(el){
    var r=el.getBoundingClientRect();
    var iw=Math.min(r.right,innerWidth)-Math.max(r.left,0);
    var ih=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);
    if(iw<=0||ih<=0) return false;
    return iw>=innerWidth*0.5 && (iw*ih)>=innerWidth*innerHeight*0.22;
  }
  function znum(s){ var z=parseInt(s.zIndex,10); return isNaN(z)?0:z; }
  function candidates(){
    var out=[], body=document.body; if(!body) return out;
    var all=body.getElementsByTagName('*');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(el.id==='portal-hdr') continue;
      var s=getComputedStyle(el);
      if(s.position!=='fixed' && s.position!=='absolute') continue;
      if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<0.05) continue;
      if(znum(s) < 10) continue;
      if(!inView(el)) continue;
      out.push(el);
    }
    return out;
  }
  function overlays(){ if(!baseline) return []; return candidates().filter(function(el){ return !baseline.has(el); }); }
  function isVisible(el){
    var s=getComputedStyle(el); if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<0.05) return false;
    var r=el.getBoundingClientRect(); return r.width>4 && r.height>4 && r.bottom>0 && r.top<innerHeight;
  }
  var BACK_ARROW=/[\\u2039\\u2190\\u25C0\\u27E8\\u276E<]/;
  function looksBack(t){
    if(!t) return false; t=t.replace(/\\s+/g,' ').trim(); if(t.length>16) return false;
    if(/\\uB3CC\\uC544\\uAC00\\uAE30/.test(t)) return true;            // 돌아가기
    if(/\\uBAA9\\uB85D\\uC73C\\uB85C/.test(t)) return true;            // 목록으로
    if(/\\uB3C4\\uC11C\\uAD00/.test(t) && BACK_ARROW.test(t)) return true;  // 도서관 + 화살표
    if(BACK_ARROW.test(t) && /\\uBAA9\\uB85D|\\uB9AC\\uC2A4\\uD2B8|\\uCC98\\uC74C|home/i.test(t)) return true;
    return false;
  }
  function backControl(){
    var nodes=document.body.querySelectorAll('[onclick],a,button,[role=button]');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(el.id==='portal-hdr'||el.closest('#portal-hdr')) continue;
      if(!isVisible(el)) continue;
      if(looksBack(el.textContent||'')) return el.closest('[onclick],a,button,[role=button]')||el;
    }
    return null;
  }
  function closeTarget(){
    if(overlays().length>0) return {type:'overlay'};
    if(backTrapOK){ var b=backControl(); if(b) return {type:'back', el:b}; }
    return null;
  }
  function appClosers(){
    var bad={close:1,closed:1,stop:1,print:1,open:1,opener:1,focus:1,blur:1,alert:1,confirm:1,prompt:1};
    var fns=[];
    for(var k in window){
      try{ if(/^(close|hide|dismiss)/i.test(k) && !bad[k] && typeof window[k]==='function' && window[k].length===0 && (''+window[k]).indexOf('[native code]')<0) fns.push(window[k]); }catch(e){}
    }
    try{ if(typeof window.close==='function' && (''+window.close).indexOf('[native code]')<0) fns.push(window.close); }catch(e){}
    return fns;
  }
  function closeOverlays(){
    appClosers().forEach(function(fn){ try{fn.call(window);}catch(e){} });
    overlays().forEach(function(el){ SHOW_CLASSES.forEach(function(c){ el.classList.remove(c); }); });
    try{ if(!overlays().length) document.body.style.overflow=''; }catch(e){}
  }
  function refreshOnce(){
    var has=!!closeTarget();
    if(has && !armed){ armed=true; try{history.pushState({backTrap:1},'');}catch(e){} }
    else if(!has && armed && !consuming){ consuming=true; try{history.back();}catch(e){} }
  }
  function schedule(){
    var t=(window.performance&&performance.now)?performance.now():+new Date();
    if(lastSched>=0 && t-lastSched<80) return; lastSched=t;
    [0,100,250,450,700].forEach(function(d){ setTimeout(refreshOnce,d); });
  }
  window.addEventListener('popstate', function(){
    if(consuming){ consuming=false; armed=false; return; }
    var tgt=closeTarget();
    if(tgt){
      armed=false;
      if(tgt.type==='overlay') closeOverlays();
      else if(tgt.el){ try{tgt.el.click();}catch(e){} }
      schedule();
    } else { armed=false; }
  });
  function init(){
    baseline=new WeakSet();
    candidates().forEach(function(el){ baseline.add(el); });
    backTrapOK = (backControl()===null);
    var mo=new MutationObserver(schedule);
    mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style','hidden'],childList:true});
    document.addEventListener('click',function(){ schedule(); },true);
    window.addEventListener('resize',schedule);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(init,80); });
  else setTimeout(init,80);
})();
</script>
`;

// 기존 트랩 블록 제거(버전 정규화 + 검색색인 오염 방지)
function stripBackTrap(html){
  for(const MK of BT_OLD_MARKS){
    let i=html.indexOf(MK);
    while(i>=0){
      const end=html.indexOf('</script>', i);
      if(end<0) break;
      let e=end+'</script>'.length; if(html[e]==='\n') e++;
      html=html.slice(0,i)+html.slice(e);
      i=html.indexOf(MK);
    }
  }
  return html;
}
// </body> 직전에 최신 트랩 주입
function injectBackTrap(html){
  const m=html.match(/<\/body>/i);
  if(!m){ return html; }
  const idx=html.lastIndexOf(m[0]);
  return html.slice(0,idx)+BACKTRAP+'\n'+html.slice(idx);
}

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
  if (g.external) {
    console.log(`↗ ${g.id.padEnd(14)} → 외부 링크 (${g.href}) — 빌드 제외`);
    continue;
  }
  const srcPath = findSrc(g.src);
  if (!srcPath) {
    console.warn(`✗ ${g.id}: 원본 없음 (${g.src}) — 건너뜀`);
    miss++;
    continue;
  }
  let html = fs.readFileSync(srcPath, 'utf8');
  html = stripBackTrap(html);   // 소스에 남은 트랩 제거(색인 오염 방지 + 버전 정규화)
  // 본문 검색 색인 추출 (헤더·트랩 주입 전 원본 기준)
  searchIndex[g.id] = extractSearchIndex(html);
  html = injectHeader(html, g);
  html = injectBackTrap(html);  // 공용 뒤로가기 트랩 자동 주입(전 가이드 공통)
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
const noscriptLinks = REG.guides.map(g => {
  const href = g.external ? g.href : 'guides/' + g.out.replace(/\.html$/, '');
  return `<li><a href="${href}">${esc(g.emoji)} ${esc(g.title)}</a> — ${esc(g.guideline)}</li>`;
}).join('\n        ');

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
      "url": g.external ? g.href : SITE + "/guides/" + g.out.replace(/\.html$/, '')
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

// ── sitemap.xml 생성 (index + 내부 가이드만; 외부 링크는 제외) ──
const urls = [
  { loc: SITE + '/', priority: '1.0' },
  ...REG.guides.filter(g => !g.external).map(g => ({ loc: SITE + '/guides/' + g.out.replace(/\.html$/, ''), priority: '0.8' }))
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
