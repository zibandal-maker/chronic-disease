/* ===================================================================
   공용 when 미니문법 (SPEC §10.5(5)) — eval/Function 미사용 재귀하강 파서
   문법: has(x) · matched(x) · 비교(== != >= <= > <) · && || ! · 괄호
   식별자: ctx.vars에 있으면 값, 없으면 문자열 리터럴(예: phase == high)
   출처: dyslipidemia v2 lipidWhenEval과 동일 의미론 — 신규 가이드는 이 모듈 사용
   =================================================================== */
var WhenDSL = (function(){
  function tokens(s){
    var t=[], i=0, re=/\s*(\|\||&&|==|!=|>=|<=|[()!<>]|-?\d+(?:\.\d+)?(?:e\d+)?|[A-Za-z_][\w:.\-]*)/y;
    while(i<s.length){ re.lastIndex=i; var m=re.exec(s); if(!m){ if(/^\s*$/.test(s.slice(i))) break; throw new Error("when 구문 오류: "+s.slice(i)); } t.push(m[1]); i=re.lastIndex; }
    return t;
  }
  function evaluate(expr, ctx){
    if(expr==null || expr==="") return true;
    var tk=tokens(expr), p=0, vars=ctx.vars||{};
    function peek(){ return tk[p]; } function next(){ return tk[p++]; }
    function val(tok){
      if(/^-?\d/.test(tok)) return parseFloat(tok);
      if(tok==="true") return true; if(tok==="false") return false;
      if(Object.prototype.hasOwnProperty.call(vars,tok)) return vars[tok];
      return tok;
    }
    function primary(){
      var tok=next();
      if(tok==="("){ var v=orE(); next(); return v; }
      if(tok==="!") return !primary();
      if((tok==="has"||tok==="matched") && peek()==="("){ next(); var arg=next(); next();
        return tok==="has" ? !!(ctx.has&&ctx.has(arg)) : !!(ctx.matched&&ctx.matched(arg)); }
      var a=val(tok), op=peek();
      if(op==="=="||op==="!="||op===">="||op==="<="||op===">"||op==="<"){
        next(); var b=val(next());
        if(op==="==") return a===b; if(op==="!=") return a!==b;
        if(typeof a!=="number"||typeof b!=="number") return false;
        if(op===">=") return a>=b; if(op==="<=") return a<=b; if(op===">") return a>b; return a<b;
      }
      return !!a;
    }
    function andE(){ var v=primary(); while(peek()==="&&"){ next(); var r=primary(); v=v&&r; } return v; }
    function orE(){ var v=andE(); while(peek()==="||"){ next(); var r=andE(); v=v||r; } return v; }
    var out=orE(); if(p<tk.length) throw new Error("when 잔여 토큰: "+tk.slice(p).join(" "));
    return out;
  }
  return { tokens:tokens, eval:evaluate, version:"when-dsl-1.0" };
})();
