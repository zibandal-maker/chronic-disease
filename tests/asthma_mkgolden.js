/* golden 동결 — 검토 후 실행: node mkgolden.js <v2.html> */
const fs=require('fs'); const {w}=require('./asthma_load')(process.argv[2]); const got=require('./asthma_got'); const C=require('./asthma_cases.json');
const G=C.map(c=>{ const p=c.p||w.ASTHMA26.SIM_CASES.find(s=>s.id===c.from).input; return { id:c.id, from:c.from||null, p:JSON.parse(JSON.stringify(p)), expect:got(w,p) }; });
fs.writeFileSync(__dirname+'/asthma_golden.json', JSON.stringify(G,null,1)); console.log('golden', G.length);
