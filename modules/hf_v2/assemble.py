"""hf v2 조립: v1 원본(무수정) + 가산 모듈 → guides_src/hf_guide.v2.html
실행: 리포 루트에서  python modules/hf_v2/assemble.py
(작업본: python assemble.py <v1.html> <out.html>)
WhenDSL은 단일 원본 modules/liver_hbv_v2/when_dsl.js를 인라인(사본 금지). 작업본은 같은 폴더의 when_dsl.js를 폴백으로 사용."""
import os, sys, subprocess
M=os.path.dirname(os.path.abspath(__file__))
R=os.path.dirname(os.path.dirname(M))
if len(sys.argv)>=3: V1, OUT = sys.argv[1], sys.argv[2]
else: V1=os.path.join(R,'guides_src','hf_guide.html'); OUT=os.path.join(R,'guides_src','hf_guide.v2.html')
WD=os.path.join(R,'modules','liver_hbv_v2','when_dsl.js')
if not os.path.exists(WD): WD=os.path.join(M,'when_dsl.js')
v1=open(V1,encoding='utf-8',newline='').read()
files=[WD]+[os.path.join(M,f) for f in ['hf_v2_data.js','hf_v2_engine.js','hf_v2_ui.js']]
parts=[open(f,encoding='utf-8').read() for f in files]
for bad in ['</script','</svg']: assert all(bad not in p for p in parts), bad
anchor='</body>'; assert v1.count(anchor)==1
assert 'var APP' not in v1 and 'HF26' not in v1, 'v1에 이미 v2 심볼 존재'
block='<script>\n/* ===== hf v2 (ESC 2026 · 급여 원문 2026-11) 가산 블록 — v1 코드 무수정 ===== */\n'+'\n'.join(parts)+'\n</script>\n'
v2=v1.replace(anchor, block+anchor)
open(OUT,'w',encoding='utf-8',newline='').write(v2)
subprocess.run(['node',os.path.join(M,'seo_hf_v2.js'),OUT],check=True)
print('v2 bytes',os.path.getsize(OUT),'added',os.path.getsize(OUT)-len(v1.encode('utf-8')))
