# 진료지원 시스템 포털

한국 학회 진료지침 + 심평원 급여 기준 기반 외래 처방 보조 도구.
11개 진료지원 도구(만성질환 가이드 9 + 감염·항생제 + ICU 계산기)를 하나의 대시보드에서 진입. **각 가이드는 완전 독립 실행**되며,
포털(대시보드 + 공통 헤더)은 가이드 내부 로직을 절대 수정하지 않는다(읽기 전용·가산).

---

## 구조

```
portal/
├── src/
│   ├── registry.json          ← 단일 진실 공급원 (질환·이모지·색·파일명·출처)
│   └── index.template.html    ← 대시보드 템플릿 (빌드 시 registry 주입)
├── guides_src/                ← 원본 가이드 HTML (수정·교체는 여기에)
│   ├── htn_prescribing_guide__7_.html
│   ├── dm_guide__5_.html
│   └── … (9개)
├── scripts/
│   └── build.js               ← 헤더 주입 + 대시보드 생성 (멱등)
├── public/                    ← 배포 산출물 (Vercel outputDirectory)
│   ├── index.html             ← 생성됨
│   └── guides/*.html          ← 헤더 주입된 가이드 (생성됨)
├── vercel.json
└── package.json
```

### 설계 원칙
- **원본 불변**: `guides_src/`의 HTML은 빌드가 읽기만 한다. 헤더는 `public/guides/`의 사본에만 주입.
- **멱등 빌드**: 헤더 주입은 마커(`PORTAL_HEADER_V1`) 기반. 재빌드해도 중복 주입 안 됨.
- **단일 진실 공급원**: 가이드 추가·이모지·제목·색·출처는 `src/registry.json`만 고친다.
- **충돌 회피**: 주입 헤더는 `position:fixed` + `body{padding-top}`. 각 가이드의 기존 sticky 탭바를
  밀어내지 않고 그 아래에 자연스럽게 쌓는다. (9개 서로 다른 헤더 구조에서 검증 완료)

---

## 로컬 빌드 / 미리보기

```bash
npm run build      # public/ 생성
npm run dev        # 빌드 후 http://localhost:3000 서빙
```

빌드 결과: `9개 성공` 메시지 + `public/index.html` + `public/guides/*.html`.

---

## Vercel 배포 (GitHub 연동)

### 최초 1회 세팅
1. 이 폴더를 GitHub 리포지토리로 push.
2. [vercel.com](https://vercel.com) → **Add New… → Project** → 해당 리포 Import.
3. Framework Preset: **Other** (자동 감지됨). 빌드 설정은 `vercel.json`이 처리:
   - Build Command: `node scripts/build.js`
   - Output Directory: `public`
4. **Deploy**. 끝. 도메인(`*.vercel.app`)이 발급된다.

### 이후 업데이트 (가이드 수정·교체)
가이드를 고칠 때는 **`guides_src/`의 해당 파일만 교체**하면 된다:

```bash
# 예: 당뇨 가이드 새 버전으로 교체
cp ~/Downloads/dm_guide_new.html guides_src/dm_guide__5_.html
git add . && git commit -m "update dm guide" && git push
```

push 즉시 Vercel이 자동 재빌드·재배포(약 30초). **나머지 8개 가이드·대시보드는 무영향.**

> 파일명을 바꾸고 싶으면 `guides_src/`에 새 파일을 두고 `src/registry.json`의 해당 `src` 값만 수정.

### GitHub 웹에서만 교체하는 경우 (노드 빌드 없이)
빌드 산출물(`public/`)도 리포에 커밋되어 있으므로, 급하면 GitHub 웹 UI에서
`public/guides/<파일>.html`을 직접 교체해도 배포된다. 단 이 경우 공통 헤더가 빠지므로,
정식 워크플로는 `guides_src/` 교체 + push(자동 빌드)를 권장.

---

## 새 가이드 추가

1. HTML을 `guides_src/`에 넣는다.
2. `src/registry.json`의 `guides[]`에 항목 추가:
   ```json
   {
     "id": "gout",
     "title": "통풍",
     "emoji": "🦶",
     "src": "gout_guide.html",
     "out": "gout.html",
     "guideline": "대한류마티스학회 통풍 진료지침 · 심평원 급여",
     "group": "A",
     "accent": "#7a4fb0",
     "tag": "류마티스"
   }
   ```
3. `git push`. 대시보드에 자동 노출된다.

| 필드 | 의미 |
|---|---|
| `id` | 안정적 식별자 (URL·디버그용, 변경 금지 권장) |
| `emoji` | 카드·헤더 이모지 |
| `src` | `guides_src/` 내 원본 파일명 |
| `out` | `public/guides/` 출력 파일명 (URL이 됨) |
| `accent` | 카드 좌측 띠·헤더 액센트 색 |
| `tag` | 분류 필터 그룹 (자동으로 필터 버튼 생성) |

---

## 통일 정책 (의도된 설계)

각 가이드 내부 강조색은 **일부러 통일하지 않았다.** 천식의 흡입제 관행색(핑크/퍼플),
고혈압의 가이드라인 비교색(KSH/ESC/AHA)처럼 색 자체가 임상적 의미를 담기 때문.
대신 **공통 헤더 + 대시보드**로 시각적 일관성을 만든다 — 사용자 체감상 "한 앱의 챕터"가 된다.
이 방식은 가이드를 계속 수정·재업로드해도 통일 작업을 반복할 필요가 없다(독립성 유지).
