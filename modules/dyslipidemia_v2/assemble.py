"""dyslipidemia v2 조립: v1 원본(무수정) + 가산 모듈 3개 → guides_src/dyslipidemia_guide.v2.html
   → seo_v2.js 후처리(정적 head·noscript를 패치된 DRUG_DB 기준으로 정합, 멱등)
실행: 리포 루트에서  python modules/dyslipidemia_v2/assemble.py   (node + jsdom 필요)"""
import os, subprocess
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M=os.path.join(R,'modules','dyslipidemia_v2')
v1=open(os.path.join(R,'guides_src','dyslipidemia_guide.html'),encoding='utf-8').read()
parts=[open(os.path.join(M,f),encoding='utf-8').read() for f in ['lipid_v2_data.js','lipid_v2_engine.js','lipid_v2_ui.js']]
for bad in ['</script','</svg']: assert all(bad not in p for p in parts), bad
anchor='</body>'; assert v1.count(anchor)==1
block='<script>\n/* ===== dyslipidemia v2 (2026 개정) 가산 블록 — v1 코드 무수정 ===== */\n'+'\n'.join(parts)+'\n</script>\n'
open(os.path.join(R,'guides_src','dyslipidemia_guide.v2.html'),'w',encoding='utf-8',newline='\n').write(v1.replace(anchor,block+anchor))
V1=os.path.join(R,'guides_src','dyslipidemia_guide.html'); V2=os.path.join(R,'guides_src','dyslipidemia_guide.v2.html')
subprocess.run(['node',os.path.join(M,'seo_v2.js'),V1,V2],check=True,cwd=R)
print('ok')
