/* 공용 팝업·그림 뷰어 v1 (build.js 자동 주입) — 네이티브 <dialog> + 자체 history 항목 1개.
   - PortalDialog.show(dlg)/wire(dlg,onClosed): 바깥 탭·✕·Esc·뒤로가기 = 이 팝업만 닫힘(아래 화면·상세 뷰 유지).
   - PortalLightbox.open(src, caption): 그림 확대 뷰어. 그림 탭 = 확대/축소(탭 지점 중심), 확대 시 스크롤 이동.
   - 어댑터 ① 전역 openImgModal(…) 관례(가이드 v1 그림 모달)를 감싸 원래 모달 대신 뷰어로 표시(원본 함수 무수정·DOM 레벨).
   - 어댑터 ② 본문의 큰 그림(폭≥140px, 자체 onclick·링크 없음)은 탭하면 뷰어로 확대.
   공용 뒤로가기 트랩(V5+)은 dialog[open] 동안 대기 → 이중 처리 없음. <dialog> 미지원 브라우저는 아무것도 바꾸지 않음(v1 동작). */
(function(){
  "use strict";
  if(window.PortalDialog) return;
  if(typeof window.HTMLDialogElement!=="function" || !HTMLDialogElement.prototype.showModal) return;
  var ZOOM_PCT=240, SKIP_TTL=1200, MIN_IMG_W=140;
  var css=document.createElement("style"); css.id="portal-viewer-css";
  css.textContent=[
    "dialog.pv-d{border:0;padding:0;margin:0;background:transparent;color:inherit;max-width:100vw;max-height:100vh;width:100vw;height:100vh;height:100dvh;overflow:hidden}",
    "dialog.pv-d::backdrop{background:rgba(0,0,0,.86)}",
    "dialog.pv-d[open]{display:flex;flex-direction:column}",
    "dialog.pv-d:focus{outline:none}",
    ".pv-bar{display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 8px 14px;color:#fff}",
    ".pv-cap{flex:1;min-width:0;font-size:13.5px;font-weight:700;line-height:1.35;word-break:keep-all}",
    ".pv-x{flex:0 0 auto;width:44px;height:44px;border-radius:22px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;font-size:20px;line-height:1;cursor:pointer;font-family:inherit}",
    ".pv-x:focus-visible{outline:3px solid #8ab4f8;outline-offset:2px}",
    ".pv-stage{flex:1;min-height:0;overflow:auto;display:flex;align-items:center;justify-content:center;padding:6px 10px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}",
    ".pv-img{max-width:100%;max-height:100%;object-fit:contain;background:#fff;border-radius:6px;cursor:zoom-in;touch-action:manipulation}",
    "dialog.pv-d.zoom .pv-stage{display:block}",
    "dialog.pv-d.zoom .pv-img{max-width:none;max-height:none;width:"+ZOOM_PCT+"%;cursor:zoom-out}",
    ".pv-hint{text-align:center;font-size:11.5px;color:rgba(255,255,255,.72);padding:6px 10px calc(10px + env(safe-area-inset-bottom))}",
    "img.pv-zoomable{cursor:zoom-in}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---- 뒤로가기 인지 dialog ---- */
  var openStack=[], skip=0, skipTimer=null;
  function armSkip(){ skip++; clearTimeout(skipTimer); skipTimer=setTimeout(function(){ skip=0; }, SKIP_TTL); }
  function show(dlg){
    if(dlg.open) return;
    dlg._pvOpener=document.activeElement;
    dlg.showModal(); openStack.push(dlg);
    try{ history.pushState({portalDialog:dlg.id||1}, ""); dlg._pvPushed=true; }catch(e){ dlg._pvPushed=false; }
  }
  function wire(dlg, onClosed){
    if(dlg._pvWired) return; dlg._pvWired=true;
    dlg.addEventListener("close", function(){
      var i=openStack.indexOf(dlg); if(i>=0) openStack.splice(i,1);
      if(onClosed){ try{ onClosed(); }catch(e){} }
      var op=dlg._pvOpener; dlg._pvOpener=null;
      if(op && op.focus && document.contains(op)){ try{ op.focus({preventScroll:true}); }catch(e){} }
      if(dlg._pvPushed){ dlg._pvPushed=false; armSkip(); try{ history.back(); }catch(e){ skip=0; } }
    });
    dlg.addEventListener("click", function(e){
      var t=e.target;
      if(t===dlg || (t.closest && t.closest("[data-pv-dismiss]"))) dlg.close();
    });
  }
  window.addEventListener("popstate", function(e){
    if(skip>0){ skip--; e.stopImmediatePropagation(); return; }
    var top=openStack[openStack.length-1];
    if(top && top._pvPushed){ top._pvPushed=false; e.stopImmediatePropagation(); top.close(); }
  }, true);
  window.PortalDialog={ show:show, wire:wire };

  /* ---- 그림 뷰어 ---- */
  var lb=null, img, stage, cap;
  function build(){
    if(lb) return;
    lb=document.createElement("dialog"); lb.id="portalLightbox"; lb.className="pv-d"; lb.setAttribute("aria-labelledby","portalLbCap");
    lb.innerHTML='<div class="pv-bar"><div class="pv-cap" id="portalLbCap"></div><button type="button" class="pv-x" data-pv-dismiss aria-label="그림 닫기">✕</button></div>'+
      '<div class="pv-stage" data-pv-dismiss><img class="pv-img" alt=""></div>'+
      '<div class="pv-hint" data-pv-dismiss>그림 탭: 확대/축소 · 바깥 탭 · 뒤로가기 · Esc: 닫기</div>';
    document.body.appendChild(lb);
    img=lb.querySelector(".pv-img"); stage=lb.querySelector(".pv-stage"); cap=lb.querySelector(".pv-cap");
    wire(lb, function(){ lb.classList.remove("zoom"); });
    img.addEventListener("click", function(e){
      e.stopPropagation();
      var r=img.getBoundingClientRect(), rx=(e.clientX-r.left)/(r.width||1), ry=(e.clientY-r.top)/(r.height||1);
      if(lb.classList.toggle("zoom")){ requestAnimationFrame(function(){
        stage.scrollLeft=Math.max(0, rx*img.offsetWidth-stage.clientWidth/2);
        stage.scrollTop=Math.max(0, ry*img.offsetHeight-stage.clientHeight/2); }); }
      else { stage.scrollLeft=0; stage.scrollTop=0; }
    });
  }
  function open(src, caption){
    if(!src) return; build();
    var c=(caption||"").replace(/\s+/g," ").trim()||"그림";
    cap.textContent=c; img.alt=c; img.src=src; lb.classList.remove("zoom");
    show(lb);
  }
  window.PortalLightbox={ open:open };

  /* ---- 캡션 추정(가까운 그림 설명) ---- */
  var lastTap=null;
  document.addEventListener("click", function(e){ lastTap=e.target; }, true);
  function captionNear(el){
    if(!el || !el.closest) return "";
    var host=el.closest("figure,.figbox,.figbtn,.ab,.fig,.figure,.card,div");
    var c=host && host.querySelector && host.querySelector("figcaption,.figcap,.cap,.caption");
    var t=(c&&c.textContent)||(el.classList&&el.classList.contains("figbtn")?el.textContent:"")||el.alt||el.getAttribute&&el.getAttribute("aria-label")||"";
    return t.replace(/\s*[·(]\s*(탭하면|탭하여)\s*확대\)?\s*$/,"").replace(/^\s*📊\s*/,"").trim();
  }

  /* ---- 어댑터 ① openImgModal 관례 ---- */
  function visibleOverlayImg(){
    var all=document.body.querySelectorAll("img"), best=null;
    for(var i=0;i<all.length;i++){ var im=all[i]; if(lb && lb.contains(im)) continue;
      var p=im, fixed=false; while(p && p!==document.body){ var s=getComputedStyle(p); if(s.display==="none"||s.visibility==="hidden") { fixed=false; break; } if(s.position==="fixed"){ fixed=true; } p=p.parentElement; }
      if(fixed && im.getAttribute("src")){ best=im; } }
    return best;
  }
  function adaptOpenImgModal(){
    var orig=window.openImgModal; if(typeof orig!=="function" || orig._pv) return;
    var origClose=window.closeImgModal;
    var wrapped=function(){
      var r=orig.apply(this, arguments);
      var im=visibleOverlayImg();
      if(!im) return r;                                    /* 표시 실패 → 원래 동작 유지 */
      var src=im.currentSrc||im.src, ovCap="";
      var p=im.parentElement; while(p && p!==document.body){ var cc=p.querySelector&&p.querySelector(".imgmodal-cap,.mcap,.cap,figcaption"); if(cc&&cc.textContent.trim()){ ovCap=cc.textContent; break; } if(getComputedStyle(p).position==="fixed") break; p=p.parentElement; }
      var c=ovCap || (typeof arguments[1]==="string"?arguments[1]:"") || captionNear(lastTap);
      if(typeof origClose==="function"){ try{ origClose(); }catch(e){} }
      open(src, c);
      return r;
    };
    wrapped._pv=true; window.openImgModal=wrapped;
  }

  /* ---- 어댑터 ② 본문 큰 그림 탭 → 확대 ---- */
  function zoomableImg(t){
    if(!t || t.tagName!=="IMG" || (lb && lb.contains(t))) return false;
    if(t.hasAttribute("onclick") || t.closest("a,button,[onclick],#portal-hdr")) return false;
    if(t.getBoundingClientRect().width<MIN_IMG_W) return false;
    if(t.closest("[id*=modal i],[class*=modal i],[class*=lightbox i]")) return false;   /* v1 그림 모달 내부는 어댑터 ①이 처리 */
    return true;
  }
  document.addEventListener("click", function(e){
    var t=e.target; if((lb && lb.open) || !zoomableImg(t)) return;
    e.preventDefault(); open(t.currentSrc||t.src, captionNear(t));
  });
  document.addEventListener("pointerover", function(e){ var t=e.target; if(t && t.tagName==="IMG" && !t.classList.contains("pv-zoomable") && zoomableImg(t)) t.classList.add("pv-zoomable"); }, true);

  function init(){ adaptOpenImgModal(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
