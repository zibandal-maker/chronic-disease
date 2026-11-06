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
const BT_MARK = '<!--BACK_TRAP_V6-->';
const BT_OLD_MARKS = ['<!--BACK_TRAP_V1-->','<!--BACK_TRAP_V2-->','<!--BACK_TRAP_V3-->','<!--BACK_TRAP_V4-->','<!--BACK_TRAP_V5-->','<!--BACK_TRAP_V6-->',
  '<!--PORTAL_VIEWER_V1-->'];
const BACKTRAP = BT_MARK + `
<script>
/* 공용 뒤로가기 트랩 v6 (build.js 자동 주입) — 뒤로가기 시 열린 팝업을 닫거나, 없으면 "‹ 도서관/돌아가기/목록으로" 뷰-백 실행.
   둘 다 없으면 정상 이탈. 앱 내부 함수명을 몰라도 DOM 레벨로 동작.
   v6: (1) 화면 덮는 패널이 열리면 포털 헤더를 잠시 숨겨 패널 상단 닫기 버튼 노출 (3) 반투명 배경 탭 = 닫기 (2) 팝업을 닫을 때 닫기 함수를 순위 그룹(팝업 계열 → 기타 → 뷰 계열 closeTopic 등)으로 호출, 앞 그룹이 오버레이를 건드리면 중단.
   v5: (1) 네이티브 <dialog open>이 있으면 대기(소유 모듈이 자체 history로 처리) (2) 런타임 뷰-백 감지는 뷰포트 무관(스크롤로 버튼이 가려져도 무장 유지). 로드 시 판정은 v4와 동일. */
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
  function isVisible(el, inViewport){
    var s=getComputedStyle(el); if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<0.05) return false;
    var r=el.getBoundingClientRect(); if(!(r.width>4 && r.height>4)) return false;
    return inViewport ? (r.bottom>0 && r.top<innerHeight) : true;
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
  function backControl(inViewport){
    var nodes=document.body.querySelectorAll('[onclick],a,button,[role=button]');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(el.id==='portal-hdr'||el.closest('#portal-hdr')) continue;
      if(!isVisible(el, inViewport)) continue;
      if(looksBack(el.textContent||'')) return el.closest('[onclick],a,button,[role=button]')||el;
    }
    return null;
  }
  function closeTarget(){
    if(overlays().length>0) return {type:'overlay'};
    if(backTrapOK){ var b=backControl(false); if(b) return {type:'back', el:b}; }
    return null;
  }
  var POPUP_NAME=/modal|img|image|sheet|popup|pop|drawer|dialog|overlay|ref|calc|score|fb|lightbox|menu|tip|layer|^closed$/i;
  var VIEW_NAME=/topic|page|view|detail|section|hub|cat|tab|panel|chapter|floor|lesson/i;
  function closerRank(k){ return POPUP_NAME.test(k.replace(/^(close|hide|dismiss)/i,''))?0:(VIEW_NAME.test(k)?2:1); }
  function appClosers(){
    var bad={close:1,closed:1,stop:1,print:1,open:1,opener:1,focus:1,blur:1,alert:1,confirm:1,prompt:1};
    var list=[];
    for(var k in window){
      try{ if(/^(close|hide|dismiss)/i.test(k) && !bad[k] && typeof window[k]==='function' && window[k].length===0 && (''+window[k]).indexOf('[native code]')<0) list.push({k:k,fn:window[k],r:closerRank(k)}); }catch(e){}
    }
    try{ if(typeof window.close==='function' && (''+window.close).indexOf('[native code]')<0) list.push({k:'close',fn:window.close,r:0}); }catch(e){}
    /* v6: 순위 그룹 [팝업 계열(0), 기타(1), 뷰 계열(2: closeTopic 등)] — 앞 그룹이 오버레이를 건드리면 뒤 그룹은 호출 안 함 */
    return [0,1,2].map(function(r){ return list.filter(function(x){ return x.r===r; }).map(function(x){ return x.fn; }); }).filter(function(g){ return g.length; });
  }
  function ovSig(el){ var s=el.className+'|'+(el.getAttribute('style')||'')+'|'+el.hidden; for(var c=el.firstElementChild,n=0;c&&n<6;c=c.nextElementSibling,n++) s+='|'+c.className+(c.getAttribute('style')||''); return s; }
  function closeOverlays(){
    var ov0=overlays(), snap=ov0.map(ovSig), groups=appClosers();
    for(var gi=0;gi<groups.length;gi++){
      groups[gi].forEach(function(fn){ try{fn.call(window);}catch(e){} });
      var now=overlays(); if(!now.length) break;
      var touched=ov0.some(function(el,i){ return now.indexOf(el)<0 || ovSig(el)!==snap[i]; });
      if(touched) break;
    }
    overlays().forEach(function(el){ SHOW_CLASSES.forEach(function(c){ el.classList.remove(c); }); });
    try{ if(!overlays().length) document.body.style.overflow=''; }catch(e){}
  }
  function held(){ try{ return !!document.querySelector('dialog[open]'); }catch(e){ return false; } }
  /* v6: 화면 덮는 패널/팝업이 포털 헤더 영역까지 올라오면 헤더를 잠시 숨김 — 패널 상단의 닫기·뒤로 버튼이 헤더에 가려지는 문제 방지 */
  function syncHdr(){
    var h=document.getElementById('portal-hdr'); if(!h) return;
    var hb=h.offsetHeight||46, cover=false;
    try{ cover=overlays().some(function(el){ return el.getBoundingClientRect().top < hb; }); }catch(e){}
    var v=cover?'hidden':''; if(h.style.visibility!==v) h.style.visibility=v;
  }
  function refreshOnce(){
    syncHdr();
    if(held()) return;
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
    if(held()) return;
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
    backTrapOK = (backControl(true)===null);
    /* v6: 반투명 배경(backdrop) 자체를 탭하면 닫기 — 가이드가 자체 처리하면(먼저 닫히면) 아무것도 안 함. 불투명 전체화면 패널은 제외 */
    document.addEventListener('click',function(e){
      var t=e.target; if(!t||held()) return;
      var ov=overlays(); if(ov.indexOf(t)<0) return;
      var bg=getComputedStyle(t).backgroundColor||'', a=1;
      if(bg==='transparent'){ a=0; } else if(bg.indexOf('(')>=0){ var parts=bg.slice(bg.indexOf('(')+1, bg.indexOf(')')).split(','); a=parts.length>3?parseFloat(parts[3]):1; }
      if(a>=0.95) return;
      setTimeout(function(){ if(overlays().indexOf(t)>=0){ closeOverlays(); schedule(); } },0);
    },false);
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
// 공용 팝업·그림 뷰어(PortalDialog·PortalLightbox): 단일 소스 scripts/portal_viewer.js — 트랩과 함께 주입
const PV_MARK = '<!--PORTAL_VIEWER_V1-->';
const PORTAL_VIEWER = PV_MARK + '\n<script>\n' + fs.readFileSync(path.join(__dirname, 'portal_viewer.js'), 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>\n';
// </body> 직전에 최신 트랩 주입
function injectBackTrap(html){
  const m=html.match(/<\/body>/i);
  if(!m){ return html; }
  const idx=html.lastIndexOf(m[0]);
  return html.slice(0,idx)+PORTAL_VIEWER+BACKTRAP+'\n'+html.slice(idx);
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
  <a class="ph-back" href="/" title="목록으로">‹ 목록</a>
  <a class="ph-home" href="/" title="홈">🏠</a>
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

// ── SEO 정합 후처리 V1 (2026-10-05) — guides_src 무손상, 출력본(public/guides)에만 적용 ──
// (1) canonical·og:url·JSON-LD url을 registry slug로 정합 (404 canonical 방지)
// (2) JSON-LD "Drug" → "DefinedTerm" (schema.org Drug⊂Product → GSC '제품 스니펫' 오류 방지)
// (3) 관련 가이드 내부링크 블록 (크롤러가 따라갈 <a href> 링크망; GSC '참조 페이지 없음' 해소)
const SEO_SITE = ((REG.meta || {}).siteUrl || '').replace(/\/+$/, '');
const slugOf = g => g.out.replace(/\.html$/, '');
const pageUrl = g => SEO_SITE + '/guides/' + slugOf(g);
const REL_MARK = '<!--SEO_RELATED_V1-->', REL_END = '<!--/SEO_RELATED_V1-->';

function fixCanonical(html, g) {
  const want = pageUrl(g);
  const headEnd = html.search(/<\/head>/i);
  if (headEnd < 0) return html;
  let head = html.slice(0, headEnd), rest = html.slice(headEnd);
  const m = head.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return head + `<link rel="canonical" href="${want}">\n` + rest;
  const hm = m[0].match(/href=["']([^"']+)["']/i);
  const cur = hm ? hm[1] : '';
  if (cur === want) return html;
  if (/^https?:\/\//.test(cur)) {
    // head 영역 안에서 정확히 같은 URL 문자열(따옴표 경계)만 교체 → canonical·og:url·JSON-LD url 동시 정합
    head = head.split('"' + cur + '"').join('"' + want + '"');
  } else {
    head = head.replace(m[0], `<link rel="canonical" href="${want}">`);
  }
  return head + rest;
}

function fixJsonLdTypes(html) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (all, body) => {
    let d; try { d = JSON.parse(body); } catch (e) { return all; }
    let n = 0;
    (function walk(o) {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') {
        if (o['@type'] === 'Drug') { o['@type'] = 'DefinedTerm'; n++; }
        Object.values(o).forEach(walk);
      }
    })(d);
    if (!n) return all;
    return '<script type="application/ld+json">' + JSON.stringify(d).replace(/</g, '\\u003c') + '</script>';
  });
}

function relatedNav(g) {
  const internal = REG.guides.filter(x => !x.external && x.id !== g.id);
  const same = internal.filter(x => x.tag === g.tag);
  const others = internal.filter(x => x.tag !== g.tag);
  const li = x => `<li><a href="/guides/${slugOf(x)}">${esc(x.emoji)} ${esc(x.title)}</a></li>`;
  return `${REL_MARK}
<style>
#seo-related{max-width:960px;margin:28px auto 16px;padding:14px 16px;box-sizing:border-box;border-top:1px solid rgba(20,40,60,.12);
  font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#33414d;font-size:13px;line-height:1.5;}
#seo-related h2{font-size:13px;font-weight:700;margin:10px 0 6px;color:#1a2530;}
#seo-related ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px 14px;}
#seo-related a{color:#2b5d7d;text-decoration:none;}
#seo-related a:hover{text-decoration:underline;}
</style>
<nav id="seo-related" aria-label="관련 진료 가이드">
${same.length ? `<h2>관련 가이드 · ${esc(g.tag)}</h2>\n<ul>${same.map(li).join('')}</ul>\n` : ''}<h2>다른 진료 가이드</h2>
<ul>${others.map(li).join('')}</ul>
<p style="margin:10px 0 0"><a href="/">진료지원 시스템 — 전체 가이드</a></p>
</nav>
${REL_END}`;
}

function injectRelated(html, g) {
  const a = html.indexOf(REL_MARK), b = html.indexOf(REL_END);
  if (a > -1 && b > a) html = html.slice(0, a) + html.slice(b + REL_END.length); // 멱등: 기존 블록 제거 후 재주입
  const idx = html.toLowerCase().lastIndexOf('</body>');
  if (idx < 0) return html;
  return html.slice(0, idx) + relatedNav(g) + '\n' + html.slice(idx);
}

// ── SEO 요약 승격 V2 (2026-10-13) — <noscript> 정적 앵커 → 렌더 DOM의 접이식 <details> ──
// Googlebot은 JS를 실행해 렌더 DOM으로 판단 → <noscript> 내부는 본문으로 잡히지 않음.
// 소스의 noscript 블록을 출력본에서만 <details>로 옮겨 본문 끝(관련 가이드 위)에 둔다. 소스 무손상.
// 블록 내부 id는 'seo-' 접두사(앱 요소 id 충돌 방지: anemia drug/type/class, gerd reimb, nutrition tpn).
const SUM_MARK = '<!--SEO_SUMMARY_V2-->', SUM_END = '<!--/SEO_SUMMARY_V2-->';
function promoteNoscript(html, g) {
  if (html.includes(SUM_MARK)) return html;
  const re = /<noscript>\s*(<div class="seo-content"[\s\S]*?)<\/noscript>/;
  const m = html.match(re);
  if (!m) return html;
  const seen = {};
  const inner = m[1].replace(/(\s)id="([^"]+)"/g, (a, sp, id) => {
    seen[id] = (seen[id] || 0) + 1;                       // 소스 블록 내 중복 id(dialysis concept-*) 방지
    return `${sp}id="seo-${id}${seen[id] > 1 ? '-' + seen[id] : ''}"`;
  });
  html = html.slice(0, m.index) + html.slice(m.index + m[0].length);
  const block = `${SUM_MARK}
<style>
#seo-summary{max-width:960px;margin:24px auto 0;padding:0 16px;box-sizing:border-box;
  font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#33414d;font-size:13px;line-height:1.55;}
#seo-summary>summary{cursor:pointer;font-weight:700;font-size:13.5px;color:#1a2530;padding:12px 0 10px;border-top:1px solid rgba(20,40,60,.12);}
#seo-summary .seo-content{padding:4px 0 12px;}
#seo-summary h2{font-size:15px;margin:12px 0 6px;color:#1a2530;}
#seo-summary h3{font-size:13.5px;margin:10px 0 4px;color:#1a2530;}
#seo-summary p,#seo-summary li{margin:3px 0;}
#seo-summary a{color:#2b5d7d;}
</style>
<details id="seo-summary"><summary>${esc(g.emoji)} ${esc(g.title)} 가이드 수록 내용 — 약물·급여·근거 요약</summary>
${inner}
</details>
${SUM_END}`;
  const idx = html.toLowerCase().lastIndexOf('</body>');
  if (idx < 0) return html;
  return html.slice(0, idx) + block + '\n' + html.slice(idx);
}

function seoPostProcess(html, g) {
  html = fixCanonical(html, g);
  html = fixJsonLdTypes(html);
  html = promoteNoscript(html, g); // V2: noscript → <details> (관련 가이드 위)
  html = injectRelated(html, g);
  return html;
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
  html = seoPostProcess(html, g); // SEO 정합 후처리 V1 (canonical·JSON-LD·관련링크)
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
