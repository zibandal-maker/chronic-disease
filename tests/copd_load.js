// jsdom 로더: v1/v2 html을 로드해 window 반환
const fs=require('fs'); const {JSDOM,VirtualConsole}=require('jsdom');
module.exports=function load(file){
  const errors=[]; const vc=new VirtualConsole(); vc.on('jsdomError',e=>errors.push(String(e.message||e))); vc.on('error',e=>errors.push(String(e)));
  const html=fs.readFileSync(file,'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,url:'https://example.test/guides/copd'});
  dom.window.scrollTo=()=>{}; if(!dom.window.HTMLElement.prototype.scrollIntoView) dom.window.HTMLElement.prototype.scrollIntoView=function(){};
  return {w:dom.window, errors};
};
