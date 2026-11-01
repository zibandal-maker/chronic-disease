"""liver HBV v2 조립: v1 원본(무수정) + 가산 모듈 → guides_src/chronic_liver_guide.v2.html
실행: 리포 루트에서  python modules/liver_hbv_v2/assemble.py
(클라우드 작업본에서는 V1/OUT 경로를 인자로: python assemble.py <v1.html> <out.html>)"""
import os, sys, json, subprocess
M=os.path.dirname(os.path.abspath(__file__))
if len(sys.argv)>=3: V1, OUT = sys.argv[1], sys.argv[2]
else:
    R=os.path.dirname(os.path.dirname(M))
    V1=os.path.join(R,'guides_src','chronic_liver_guide.html'); OUT=os.path.join(R,'guides_src','chronic_liver_guide.v2.html')
v1=open(V1,encoding='utf-8').read()
order=['when_dsl.js','hbv_v2_rec_raw.js','hbv_v2_data.js','hbv_v2_engine.js','hbv_v2_ui.js']
parts=[open(os.path.join(M,f),encoding='utf-8').read() for f in order]
for bad in ['</script','</svg']: assert all(bad not in p for p in parts), bad
anchor='</body>'; assert v1.count(anchor)==1
block='<script>\n/* ===== liver HBV v2 (KASL 2026 개정) 가산 블록 — v1 코드 무수정 ===== */\n'+'\n'.join(parts)+'\n</script>\n'
v2=v1.replace(anchor, block+anchor)
# SEO head: keywords 가산(정적층, 멱등)
seo=json.load(open(os.path.join(M,'seo_hbv_v2.json'),encoding='utf-8'))
head_end=v2.index('</head>'); head=v2[:head_end]; a=seo['keywordsAnchor']; assert head.count(a)==1
i=head.index(a)+len(a); j=head.index('"',i); kw=[k.strip() for k in head[i:j].split(',')]
kw+= [k for k in seo['keywordsAdd'] if k not in kw]
v2=head[:i]+', '.join(kw)+head[j:]+v2[head_end:]
open(OUT,'w',encoding='utf-8',newline='\n').write(v2)
print('v2 bytes',len(v2.encode()),'added',len(v2.encode())-len(v1.encode()))
subprocess.run(['node',os.path.join(M,'seo_liver_v2.js'),OUT],check=True)
