/* ===================================================================
   COPD v2 DATA (COPD26) — KATRD 2024 · GOLD 2026 · 심평원 급여(원문 2026-11-06)
   임상 수치·약물·고시 조건은 이 파일에만 둔다. 엔진·UI는 ID와 TH 키로만 참조.
   GOLD 원문 문장·그림 미수록(저작권) — 한국어 의역 + 그림 번호 인용.
   v1 CD(무수정)는 읽기 전용 참조: 제품·성분·계열·국내 위험군·호산구 구간.
   =================================================================== */
var COPD26 = (function(){
"use strict";

var META = { version:"copd-v2-2026.11", built:"2026-11-06",
  header_sub:"KATRD 2024 · GOLD 2026 · 심평원 급여(원문 2026-11-06)",
  reimb_checked:"2026-11-06", note:"조언 도구 — 판단은 처방의에게", ui_top_recs:3 };

/* ---------- 1. 지침 레이어 ---------- */
var GUIDELINES = {
  "gl:copd:katrd-2024": { id:"gl:copd:katrd-2024", short:"KATRD 2024", title:"대한결핵및호흡기학회 COPD 진료지침 2024 개정", year:2024, status:"active", layer:"L1", recsys:"recsys:grade", src:"src:katrd2024" },
  "gl:copd:gold-2025":  { id:"gl:copd:gold-2025", short:"GOLD 2025", title:"GOLD 2025 Report", year:2025, status:"superseded", superseded_by:"gl:copd:gold-2026", layer:"L1'", recsys:"recsys:gold", src:null },
  "gl:copd:gold-2026":  { id:"gl:copd:gold-2026", short:"GOLD 2026", title:"GOLD 2026 Report v1.3 (2025-12-08)", year:2026, status:"active", layer:"L1'", recsys:"recsys:gold", supersedes:["gl:copd:gold-2025"], src:"src:gold2026" },
  "gl:vacc:ksid-pcv-2026": { id:"gl:vacc:ksid-pcv-2026", short:"대한감염학회 2026", title:"한국 성인 폐렴구균 예방접종 권고안 2026 개정판", year:2026, status:"active", layer:"L1", src_level:"report", src:"src:ksid_pcv" },
  "gl:vacc:ksid-rsv-2026": { id:"gl:vacc:ksid-rsv-2026", short:"대한감염학회 RSV(개정안)", title:"대한감염학회 RSV 백신 권고 개정안", year:2026, status:"reported", layer:"L1", src_level:"report", src:"src:ksid_rsv" }
};

/* ---------- 2. 권고체계 ---------- */
var REC_SYSTEMS = {
  "recsys:grade": { id:"recsys:grade", label:"GRADE(권고강도 × 근거수준)",
    grade:{ "strong":{norm:"A",rank:1,ko:"강하게 권고"}, "weak":{norm:"B",rank:2,ko:"약하게 권고"},
            "weak_against":{norm:"C",rank:3,ko:"약하게 반대"}, "strong_against":{norm:"X",rank:9,ko:"강하게 반대"},
            "withheld":{norm:"-",rank:8,ko:"권고 보류"}, "ungraded":{norm:"U",rank:6,ko:"등급 미부여(전문가 합의·이전 지침)"} },
    loe:{ "high":{rank:0,ko:"높음"}, "moderate":{rank:1,ko:"보통"}, "low":{rank:2,ko:"낮음"}, "very_low":{rank:3,ko:"매우 낮음"}, "expert":{rank:4,ko:"전문가 의견"}, "none":{rank:5,ko:"—"} },
    note:"KATRD 2024는 치료 영역 핵심질문(KQ1–9)과 금연에만 GRADE 등급을 부여했다. 나머지 권고는 '등급 미부여'로 표시한다." },
  "recsys:gold": { id:"recsys:gold", label:"GOLD(권고 동사 × Evidence A–D)",
    grade:{ "recommend":{norm:"A",rank:1,ko:"권고"}, "suggest":{norm:"B",rank:2,ko:"제안"}, "consider":{norm:"C",rank:3,ko:"고려"},
            "practical":{norm:"P",rank:4,ko:"실용적 권고(직접 근거 없음)"}, "option":{norm:"O",rank:5,ko:"선택지"},
            "statement":{norm:"S",rank:5,ko:"근거 진술"}, "not_recommended":{norm:"X",rank:9,ko:"권장하지 않음"} },
    loe:{ "A":{rank:0,ko:"A"}, "B":{rank:1,ko:"B"}, "C":{rank:2,ko:"C"}, "D":{rank:3,ko:"D"}, "none":{rank:5,ko:"미부여"} },
    note:"GOLD는 권고 강도를 매기지 않는다. 원문 동사(recommend/suggest/consider)와 Evidence A–D를 그대로 표기. 알고리즘(그림 3.8·3.9)은 근거등급 미부여." }
};

/* ---------- 3. 임계값 (지침 / 급여 r_* / 백신) ---------- */
var TH = {
  gold26_e_exac_ge:1, gold_cat_ge:10, gold_mmrc_ge:2,
  eos_ics_min:100, eos_ics_high:300, eos_bio:300, bio_mod_ge:2, bio_sev_ge:1,
  roflu_fev1_lt:50, roflu_hosp_ge:1, exac_hx_ge:1,
  cs_days:5, abx_days:5, spo2_lo:88, spo2_hi:92, ltot_pao2_le:55, ltot_pao2_cor_lt:60, recovery_wk_lo:4, recovery_wk_hi:6, pr_post_wk:4,
  r_fev1_maint_lt:80, r_fev1_icslaba_lt:60, r_fev1_triple_tb_lt:60, r_fev1_triple_tm_lt:50, r_fev1_roflu_lt:50,
  r_exac_n:2, r_hosp_n:1, r_adult_age_ge:18,
  pcv_age_ge:65, pcv_hr_age_ge:19, pcv_after_ppsv23_y:1, pcv_after_pcv13_y:1,
  rsv_label_age_ge:60, rsv_label_hr_age_ge:18, rsv_ksid_hr_age_ge:50, rsv_ksid_all_age_ge:75, rsv_gold_age_ge:50,
  zoster_age_gt:50
};

/* ---------- 4. GOLD 2026 ABE (국내 위험군은 v1 CD.KOREAN_GROUP 재사용) ---------- */
var GROUP26 = [
  { id:"copd:gold26:E", label:"E군", when:"exac_yr >= TH.gold26_e_exac_ge", def:"지난 1년 중등도 또는 중증 악화 {TH.gold26_e_exac_ge}회 이상 (증상 무관)", cite:"Fig 3.8" },
  { id:"copd:gold26:B", label:"B군", when:"sym_high", def:"악화 0회 + 증상 많음(CAAT ≥{TH.gold_cat_ge} 또는 mMRC ≥{TH.gold_mmrc_ge})", cite:"Fig 3.8" },
  { id:"copd:gold26:A", label:"A군", when:"true", def:"악화 0회 + 증상 적음", cite:"Fig 3.8" }
];

/* ---------- 5. v1 KATRD 레지멘 문자열 → 계열 (키 = v1 ALGO_INITIAL·ALGO_FOLLOWUP regimen 전수) ---------- */
var REGIMEN_MAP = {
  "LABA+LAMA":                  { classes:["class:laba","class:lama"], biologic:false },
  "ICS+LAMA+LABA":              { classes:["class:laba","class:lama","class:ics"], biologic:false },
  "ICS+LABA+LAMA":              { classes:["class:laba","class:lama","class:ics"], biologic:false },
  "ICS+LAMA+LABA + Anti-IL-4R": { classes:["class:laba","class:lama","class:ics"], biologic:true, bio_drugs:["drug:dupilumab"] }
};
var REGIMEN_LABEL = {
  "class:lama":"LAMA 단일", "class:laba":"LABA 단일", "class:laba|class:lama":"LABA+LAMA", "class:ics|class:laba|class:lama":"LABA+LAMA+ICS(삼제)", "class:ics|class:laba":"LABA+ICS"
};

/* ---------- 6. 권고 (REC_2026) ---------- */
/* scope: rx(안정기 처방) · aecopd · vacc · library.  when은 WhenDSL. */
var REC_2026 = [
  /* --- KATRD 2024 (GRADE) --- */
  { id:"copd:rec26:kq1", guideline:"gl:copd:katrd-2024", cite:"KQ1", scope:"rx", grade:"withheld", loe:"low", loe_raw:"Low", when:"kr_low",
    text:"저위험군: 질병 진행(악화) 억제 목적의 기관지확장제 사용은 권고를 보류한다", classes:["class:lama","class:laba"] },
  { id:"copd:rec26:kq2", guideline:"gl:copd:katrd-2024", cite:"KQ2", scope:"rx", grade:"withheld", loe:"low", loe_raw:"Low", when:"kr_low",
    text:"저위험군: 증상 호전 목적의 기관지확장제 사용은 권고를 보류한다", classes:["class:lama","class:laba"] },
  { id:"copd:rec26:kq3", guideline:"gl:copd:katrd-2024", cite:"KQ3", scope:"rx", grade:"strong", loe:"moderate", loe_raw:"Moderate", when:"kr_high",
    text:"고위험군 악화 감소: ICS+LABA보다 삼제(ICS+LAMA+LABA)", classes:["class:ics","class:laba","class:lama"] },
  { id:"copd:rec26:kq4", guideline:"gl:copd:katrd-2024", cite:"KQ4", scope:"rx", grade:"strong", loe:"moderate", loe_raw:"Moderate", when:"kr_high",
    text:"고위험군 악화 감소: LAMA 단독보다 삼제", classes:["class:ics","class:laba","class:lama"] },
  { id:"copd:rec26:kq5", guideline:"gl:copd:katrd-2024", cite:"KQ5", scope:"rx", grade:"strong", loe:"moderate", loe_raw:"Moderate", when:"kr_high && eos >= TH.eos_ics_high",
    text:"고위험군 + 혈중 호산구 상승(>300/μL): 악화 감소에 LAMA+LABA보다 삼제", classes:["class:ics","class:laba","class:lama"],
    note:"KQ 문구는 '>300', 같은 지침 요약은 '300 이상' — 경계값 300은 요약 문구를 따른다" },
  { id:"copd:rec26:kq6", guideline:"gl:copd:katrd-2024", cite:"KQ6", scope:"rx", grade:"weak", loe:"moderate", loe_raw:"Moderate", when:"kr_high",
    text:"고위험군 사망 감소: ICS+LABA보다 삼제", classes:["class:ics","class:laba","class:lama"] },
  { id:"copd:rec26:kq7", guideline:"gl:copd:katrd-2024", cite:"KQ7", scope:"rx", grade:"strong", loe:"low", loe_raw:"Weak", when:"kr_high",
    text:"고위험군 사망 감소: LAMA보다 삼제", classes:["class:ics","class:laba","class:lama"], note:"원문 근거수준 표기 'Weak'(GRADE 근거 어휘 아님) → '낮음'으로 정규화" },
  { id:"copd:rec26:kq8", guideline:"gl:copd:katrd-2024", cite:"KQ8", scope:"rx", grade:"strong", loe:"low", loe_raw:"Weak", when:"kr_high",
    text:"고위험군 사망 감소: LABA보다 삼제", classes:["class:ics","class:laba","class:lama"], note:"원문 근거수준 표기 'Weak' → '낮음'으로 정규화" },
  { id:"copd:rec26:kq9", guideline:"gl:copd:katrd-2024", cite:"KQ9", scope:"rx", grade:"strong", loe:"moderate", loe_raw:"Moderate", when:"kr_high",
    text:"고위험군 사망 감소: LAMA+LABA보다 삼제", classes:["class:ics","class:laba","class:lama"] },
  { id:"copd:rec26:kr_smoking", guideline:"gl:copd:katrd-2024", cite:"4단원", scope:"rx", grade:"strong", loe:"high", loe_raw:"높음", when:"smoker",
    text:"금연은 중증도와 무관하게 폐기능 감소를 늦추는 핵심 수단 — 상담·행동요법 + 약물(니코틴대체·부프로피온·바레니클린) 병행" },
  { id:"copd:rec26:kr_init_low", guideline:"gl:copd:katrd-2024", cite:"그림 3-3", scope:"rx", grade:"ungraded", loe:"none", when:"kr_low",
    text:"저위험군 1차: LABA+LAMA 복합제 권장(단독 대비 FEV1·호흡곤란·삶의 질·악화 개선)", classes:["class:laba","class:lama"] },
  { id:"copd:rec26:kr_init_high", guideline:"gl:copd:katrd-2024", cite:"그림 3-3", scope:"rx", grade:"ungraded", loe:"none", when:"kr_high",
    text:"고위험군 1차: LABA+LAMA, 혈중 호산구 ≥{TH.eos_ics_high}이면 삼제", classes:["class:laba","class:lama"] },
  { id:"copd:rec26:kr_pde4", guideline:"gl:copd:katrd-2024", cite:"3단원", scope:"rx", grade:"ungraded", loe:"none",
    when:"fev1 < TH.roflu_fev1_lt && chronic_bronchitis && exac_yr >= TH.exac_hx_ge",
    text:"FEV1 <{TH.roflu_fev1_lt}% + 만성기관지염 + 악화 병력: 1차 약제에 PDE4 억제제 추가 가능", drugs:["drug:roflumilast"] },
  { id:"copd:rec26:kr_macrolide", guideline:"gl:copd:katrd-2024", cite:"3단원", scope:"rx", grade:"ungraded", loe:"none", when:"kr_followup_addon",
    text:"악화 경향 환자: 아지스로마이신(250 mg/일 또는 500 mg 주 3회)·에리스로마이신 1년 투여로 악화 감소. 현재 흡연자는 효과 적음, 내성·QT·청력 주의, 1년 초과 근거 없음", drugs:["drug:azithromycin"] },
  { id:"copd:rec26:kr_no_ics_asthma_hx", guideline:"gl:copd:katrd-2024", cite:"3단원", scope:"rx", grade:"ungraded", loe:"none", when:"asthmaHx",
    text:"천식 병력만으로 ICS를 처방하지 않는다 — 국내 연구에서 혈중 호산구 ≥{TH.eos_ics_high}에서만 ICS 악화 감소" },

  /* --- GOLD 2026 --- */
  { id:"copd:rec26:g_init_a", guideline:"gl:copd:gold-2026", cite:"Fig 3.8", scope:"rx", grade:"recommend", loe:"none", when:"false",
    text:"A군: 기관지확장제(가능하면 장기지속형 1제). 효과 확인 시 유지" },
  { id:"copd:rec26:g_init_b", guideline:"gl:copd:gold-2026", cite:"Fig 3.8", scope:"rx", grade:"recommend", loe:"none", when:"false",
    text:"B군: LABA+LAMA로 시작(단일 흡입기 선호). 동반질환 탐색" },
  { id:"copd:rec26:g_init_e", guideline:"gl:copd:gold-2026", cite:"Fig 3.8", scope:"rx", grade:"recommend", loe:"none", when:"false",
    text:"E군: LABA+LAMA가 1차 선택" },
  { id:"copd:rec26:g_init_e_eos300", guideline:"gl:copd:gold-2026", cite:"Fig 3.8", scope:"rx", grade:"practical", loe:"none", when:"false",
    text:"E군 + 혈중 호산구 ≥{TH.eos_ics_high}: 초치료로 삼제 고려(초치료 직접 근거 없음 — 실용적 권고)" },
  { id:"copd:rec26:g_dual_vs_mono", guideline:"gl:copd:gold-2026", cite:"Fig A3.2", scope:"rx", grade:"recommend", loe:"A", when:"false",
    text:"장기지속형 시작 시 LABA+LAMA 선호. 단일제에도 호흡곤란 지속 시 2제로 상향" },
  { id:"copd:rec26:g_dual_exac", guideline:"gl:copd:gold-2026", cite:"Fig A3.2", scope:"library", grade:"statement", loe:"B", when:"true",
    text:"LABA+LAMA는 단일제보다 악화를 줄인다" },
  { id:"copd:rec26:g_lama_gt_laba", guideline:"gl:copd:gold-2026", cite:"Fig A3.2", scope:"library", grade:"statement", loe:"A", when:"true",
    text:"LAMA는 LABA보다 악화 감소 효과가 크다(A), 입원도 줄인다(B)" },
  { id:"copd:rec26:g_triple", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"rx", grade:"statement", loe:"A", when:"false",
    text:"삼제는 LABA+ICS·LABA+LAMA·LAMA 단독보다 폐기능·증상·건강상태·악화를 개선" },
  { id:"copd:rec26:g_no_laba_ics", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"rx", grade:"not_recommended", loe:"none", when:"on_laba_ics_only",
    text:"COPD에 LABA+ICS는 권장하지 않음 — ICS 적응이면 삼제가 우월" },
  { id:"copd:rec26:g_fu_exac_mono", guideline:"gl:copd:gold-2026", cite:"Fig 3.9", scope:"rx", grade:"recommend", loe:"none", when:"false",
    text:"단일 기관지확장제 중 악화: LABA+LAMA로 상향(호산구 ≥{TH.eos_ics_high}이면 삼제)" },
  { id:"copd:rec26:g_fu_exac_dual_ics", guideline:"gl:copd:gold-2026", cite:"Fig 3.9·3.10", scope:"rx", grade:"suggest", loe:"none", when:"false",
    text:"LABA+LAMA 중 중등도·중증 악화 + 호산구 ≥{TH.eos_ics_min}: 삼제로 상향(호산구 높을수록 반응 큼)" },
  { id:"copd:rec26:g_fu_azithro", guideline:"gl:copd:gold-2026", cite:"Fig 3.9 · A3.3", scope:"rx", grade:"consider", loe:"A", when:"false",
    text:"현재 비흡연자에서 지속 악화 시 아지스로마이신 추가 고려(악화 감소 A, 과거 흡연자 우선 B). 내성균·청력 저하 주의", drugs:["drug:azithromycin"] },
  { id:"copd:rec26:g_fu_roflu", guideline:"gl:copd:gold-2026", cite:"Fig 3.9 · A3.3", scope:"rx", grade:"consider", loe:"A", when:"false",
    text:"FEV1 <{TH.roflu_fev1_lt}% + 만성기관지염 + 입원(중증) 악화력: 로플루밀라스트 추가 고려", drugs:["drug:roflumilast"] },
  { id:"copd:rec26:g_fu_bio_dupi", guideline:"gl:copd:gold-2026", cite:"Fig 3.9·3.11 · A3.3", scope:"rx", grade:"consider", loe:"A", when:"false",
    text:"삼제 중 지속 악화 + 혈중 호산구 ≥{TH.eos_bio} + 만성기관지염: 듀필루맙 추가 고려", drugs:["drug:dupilumab"] },
  { id:"copd:rec26:g_fu_bio_mepo", guideline:"gl:copd:gold-2026", cite:"Fig 3.9·3.11 · A3.3", scope:"rx", grade:"consider", loe:"A", when:"false",
    text:"삼제 중 지속 악화 + 혈중 호산구 ≥{TH.eos_bio}(만성기관지염 무관): 메폴리주맙 추가 고려", drugs:["drug:mepolizumab"] },
  { id:"copd:rec26:g_fu_dysp", guideline:"gl:copd:gold-2026", cite:"Fig 3.9", scope:"rx", grade:"suggest", loe:"none", when:"false",
    text:"2제에도 호흡곤란 지속: 기기·성분 변경, 호흡재활, 엔시펜트린(가능 시), 타 원인 감별·흡입 기법·순응도 확인" },
  { id:"copd:rec26:g_ensifentrine", guideline:"gl:copd:gold-2026", cite:"Fig A3.2·A3.3", scope:"rx", grade:"statement", loe:"A", when:"false",
    text:"엔시펜트린: 폐기능(A)·호흡곤란(A)·건강상태(B) 개선, 악화 효과는 미평가 — 국내 미허가", drugs:["drug:ensifentrine"] },
  { id:"copd:rec26:g_laba_ics_pt", guideline:"gl:copd:gold-2026", cite:"Fig 3.12", scope:"rx", grade:"option", loe:"none", when:"false",
    text:"LABA+ICS 중: 조절 양호하면 유지 가능 / 악화 시 호산구 ≥{TH.eos_ics_min} → 삼제, 미만 → LABA+LAMA 전환 / 증상 위주면 ICS 반응에 따라 2제 또는 삼제" },
  { id:"copd:rec26:g_ics_withdraw", guideline:"gl:copd:gold-2026", cite:"Fig 3.9", scope:"rx", grade:"statement", loe:"none", when:"on_ics && ics_withdraw_reason",
    text:"삼제의 ICS 철회는 부적절한 시작·무반응·심한 부작용·중증/반복 폐렴일 때만. 호산구 ≥{TH.eos_ics_high}이면 철회 후 악화 위험↑" },
  { id:"copd:rec26:g_asthma_ics", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"rx", grade:"recommend", loe:"none", when:"asthma_concurrent",
    text:"천식 동반(공존 진단) 시 ICS 필수 — 천식 지침을 우선 따른다" },
  { id:"copd:rec26:g_ics_pneumonia", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"rx", grade:"statement", loe:"A", when:"ics_in_plan",
    text:"ICS 정기 사용은 폐렴 위험을 높인다(중증일수록)" },
  { id:"copd:rec26:g_eos2pct", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"library", grade:"statement", loe:"C", when:"true",
    text:"혈중 호산구 <2%는 ICS 사용과 무관하게 폐렴 위험 증가" },
  { id:"copd:rec26:g_ocs_long", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"library", grade:"not_recommended", loe:"A", when:"true",
    text:"경구 스테로이드 장기 사용: 부작용 다수(A), 이득 근거 없음(C)" },
  { id:"copd:rec26:g_statin", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"library", grade:"not_recommended", loe:"A", when:"true",
    text:"악화 예방 목적의 스타틴은 권장하지 않음(A). 심혈관·대사 적응이면 사용(관찰연구 C)" },
  { id:"copd:rec26:g_mucolytic", guideline:"gl:copd:gold-2026", cite:"Fig A3.3", scope:"library", grade:"statement", loe:"B", when:"true",
    text:"점액조절제(에르도스테인·카르보시스테인·NAC) 정기 투여는 일부 환자에서 악화 감소" },
  { id:"copd:rec26:g_theophylline", guideline:"gl:copd:gold-2026", cite:"Fig A3.2", scope:"library", grade:"statement", loe:"A", when:"true",
    text:"테오필린: 기관지확장 효과 작음(A), 증상 이득 미미(B)" },
  { id:"copd:rec26:g_aatd", guideline:"gl:copd:gold-2026", cite:"Fig A3.4", scope:"library", grade:"statement", loe:"B", when:"true",
    text:"알파1-항트립신 증강요법: 폐기종 진행 둔화 가능(국내 미도입)" },
  { id:"copd:rec26:g_opioid", guideline:"gl:copd:gold-2026", cite:"Fig A3.4", scope:"library", grade:"consider", loe:"B", when:"true",
    text:"중증 호흡곤란: 저용량 장기지속 경구·비경구 아편유사제 고려 가능" },
  { id:"copd:rec26:g_ph_drug", guideline:"gl:copd:gold-2026", cite:"Fig A3.4", scope:"library", grade:"not_recommended", loe:"B", when:"true",
    text:"COPD에 따른 폐고혈압에 원발성 폐고혈압 약제는 권장하지 않음" },
  { id:"copd:rec26:g_pr", guideline:"gl:copd:gold-2026", cite:"Fig A4.1", scope:"rx", grade:"recommend", loe:"A", when:"sym_high || exac_yr >= TH.exac_hx_ge",
    text:"호흡재활: 증상 있거나 악화 고위험이면 적응(A). 최근 입원 악화(≤{TH.pr_post_wk}주) 후 재입원 감소(B)" },
  { id:"copd:rec26:g_self_mgmt", guideline:"gl:copd:gold-2026", cite:"Fig A4.1", scope:"library", grade:"statement", loe:"B", when:"true",
    text:"의료진과 소통하는 자가관리 중재는 건강상태 개선·입원 감소(B)" },

  /* --- 악화(AECOPD) GOLD 2026 Fig 4.5·4.6 --- */
  { id:"copd:rec26:g_ae_saba", guideline:"gl:copd:gold-2026", cite:"Fig 4.6", scope:"aecopd", grade:"recommend", loe:"C", when:"ae_on",
    text:"초기 기관지확장제: 속효성 β2작용제 ± 속효성 항콜린제 증량" },
  { id:"copd:rec26:g_ae_cs", guideline:"gl:copd:gold-2026", cite:"Fig 4.6", scope:"aecopd", grade:"recommend", loe:"A", when:"ae_on && ae_severity != mild",
    text:"전신 스테로이드: 폐기능·산소화 개선, 회복·입원 기간 단축 — {TH.cs_days}일" },
  { id:"copd:rec26:g_ae_abx", guideline:"gl:copd:gold-2026", cite:"Fig 4.6", scope:"aecopd", grade:"recommend", loe:"A", when:"ae_on && (ae_purulent || ae_prior_culture || ae_mv)",
    text:"항생제 적응: 화농성 객담·이전 객담 세균 양성·기계환기(A). 기간 {TH.abx_days}일(B)" },
  { id:"copd:rec26:g_ae_hfnt", guideline:"gl:copd:gold-2026", cite:"Fig 4.5·4.6", scope:"aecopd", grade:"recommend", loe:"A", when:"ae_on && ae_rf == hypoxemic",
    text:"급성 저산소 호흡부전: 고유량 비강 산소(HFNT)가 첫 환기 보조. 반응 없으면 NIV" },
  { id:"copd:rec26:g_ae_niv", guideline:"gl:copd:gold-2026", cite:"Fig 4.6", scope:"aecopd", grade:"recommend", loe:"A", when:"ae_on && ae_rf == hypercapnic",
    text:"고탄산성 호흡부전: 금기가 없으면 NIV — 가스교환·호흡일·삽관 필요·입원기간·생존 개선" },
  { id:"copd:rec26:g_ae_vte", guideline:"gl:copd:gold-2026", cite:"Fig 4.5", scope:"aecopd", grade:"consider", loe:"none", when:"ae_on && ae_severity == severe",
    text:"입원 시 혈전예방(피하 헤파린·LMWH) 고려, 수분균형 감시, 동반 질환(심부전·부정맥·폐색전) 확인·치료" },
  { id:"copd:rec26:g_ae_discharge", guideline:"gl:copd:gold-2026", cite:"4장", scope:"aecopd", grade:"suggest", loe:"none", when:"ae_on",
    text:"안정되면 장기지속 기관지확장제 조기 시작, 악화 ≥1회 + 호산구 높으면 ICS 추가 고려, 퇴원 후 {TH.pr_post_wk}주 내 호흡재활, 회복 {TH.recovery_wk_lo}–{TH.recovery_wk_hi}주" }
];

/* ---------- 7. GOLD 2026 알고리즘 경로 (첫 매칭) ---------- */
/* regimen: 계열 세트(빈 배열 = 현 치료 유지). addons: 조건부 부가요법 rec. */
var ALGO26 = [
  /* 초치료 */
  { id:"copd:algo26:init_e_eos", path:"init", when:"group26 == E && eos >= TH.eos_ics_high", regimen:["class:ics","class:laba","class:lama"], recs:["copd:rec26:g_init_e_eos300","copd:rec26:g_init_e","copd:rec26:g_triple"] },
  { id:"copd:algo26:init_e", path:"init", when:"group26 == E", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_init_e","copd:rec26:g_dual_vs_mono"] },
  { id:"copd:algo26:init_b", path:"init", when:"group26 == B", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_init_b","copd:rec26:g_dual_vs_mono"] },
  { id:"copd:algo26:init_a", path:"init", when:"true", regimen:["class:lama"], alt:["class:laba"], recs:["copd:rec26:g_init_a"],
    note:"장기지속 기관지확장제 1제(LAMA 또는 LABA) — 아주 가끔의 호흡곤란이면 속효성도 가능" },
  /* 추적 — 악화 경로 */
  { id:"copd:algo26:exac_noeos", path:"exac", when:"!has_eos", regimen:[], recs:[], note:"혈중 호산구 미입력 — 추적 악화 경로는 호산구(100·300)로 갈린다", flag:"copd:flag:need_eos" },
  { id:"copd:algo26:exac_mono_eos", path:"exac", when:"tx == mono && eos >= TH.eos_ics_high", regimen:["class:ics","class:laba","class:lama"], recs:["copd:rec26:g_fu_exac_mono","copd:rec26:g_triple"] },
  { id:"copd:algo26:exac_mono", path:"exac", when:"tx == mono", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_fu_exac_mono"] },
  { id:"copd:algo26:exac_dual_ics", path:"exac", when:"tx == dual && eos >= TH.eos_ics_min", regimen:["class:ics","class:laba","class:lama"], recs:["copd:rec26:g_fu_exac_dual_ics","copd:rec26:g_triple"] },
  { id:"copd:algo26:exac_dual_low", path:"exac", when:"tx == dual", regimen:[], recs:[], addons:["copd:addon26:azithro","copd:addon26:roflu"],
    note:"LABA+LAMA 유지 + 호산구 <{TH.eos_ics_min}: 부가요법 검토" },
  { id:"copd:algo26:exac_triple_bio", path:"exac", when:"tx == triple && eos >= TH.eos_bio && (exac_mod_yr >= TH.bio_mod_ge || exac_hosp_yr >= TH.bio_sev_ge)", regimen:[], recs:[],
    addons:["copd:addon26:dupi","copd:addon26:mepo","copd:addon26:azithro","copd:addon26:roflu"], note:"삼제 유지 + 생물학제제·부가요법 검토" },
  { id:"copd:algo26:exac_triple", path:"exac", when:"tx == triple", regimen:[], recs:[], addons:["copd:addon26:azithro","copd:addon26:roflu"], note:"삼제 유지 + 부가요법 검토" },
  { id:"copd:algo26:exac_other", path:"exac", when:"true", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_dual_vs_mono"], note:"현재 치료 조합이 알고리즘 상자와 맞지 않음 — 처방 내역 확인" },
  /* 추적 — 호흡곤란 경로 */
  { id:"copd:algo26:dysp_mono", path:"dyspnea", when:"tx == mono", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_dual_vs_mono"] },
  { id:"copd:algo26:dysp_dual", path:"dyspnea", when:"true", regimen:[], recs:["copd:rec26:g_fu_dysp","copd:rec26:g_ensifentrine","copd:rec26:g_pr"], note:"약 상향보다 기기·성분 변경·재활·감별" },
  /* LABA+ICS 사용 중 (Fig 3.12) */
  { id:"copd:algo26:lics_exac_hi", path:"laba_ics", when:"has_exac && has_eos && eos >= TH.eos_ics_min", regimen:["class:ics","class:laba","class:lama"], recs:["copd:rec26:g_laba_ics_pt","copd:rec26:g_no_laba_ics"] },
  { id:"copd:algo26:lics_exac_lo", path:"laba_ics", when:"has_exac && has_eos", regimen:["class:laba","class:lama"], recs:["copd:rec26:g_laba_ics_pt","copd:rec26:g_no_laba_ics"], note:"ICS 이득 적음 → LABA+LAMA 전환" },
  { id:"copd:algo26:lics_noeos", path:"laba_ics", when:"has_exac", regimen:[], recs:["copd:rec26:g_laba_ics_pt"], flag:"copd:flag:need_eos" },
  { id:"copd:algo26:lics_sym", path:"laba_ics", when:"sym_high", regimen:["class:ics","class:laba","class:lama"], recs:["copd:rec26:g_laba_ics_pt"], note:"증상 위주: ICS 반응 있었으면 삼제, 없었으면 LABA+LAMA" },
  { id:"copd:algo26:lics_keep", path:"laba_ics", when:"true", regimen:[], recs:["copd:rec26:g_laba_ics_pt"], note:"조절 양호 — LABA+ICS 유지 가능(천식 특징 없으면 장기적으로 재평가)" },
  /* 유지 */
  { id:"copd:algo26:maintain", path:"maintain", when:"true", regimen:[], recs:[], note:"초치료 반응 적절 — 유지. 흡입 기법·순응도·비약물 치료 점검" }
];
/* 부가요법(악화 경로) — 조건 충족 시 표시, 미충족은 사유와 함께 회색 */
var ADDONS26 = {
  "copd:addon26:azithro": { id:"copd:addon26:azithro", drug:"drug:azithromycin", rec:"copd:rec26:g_fu_azithro", when:"!smoker", unmet:"현재 흡연자 — 효과 작음(GOLD: 현재 비흡연자 대상)" },
  "copd:addon26:roflu":   { id:"copd:addon26:roflu", drug:"drug:roflumilast", rec:"copd:rec26:g_fu_roflu", when:"fev1 < TH.roflu_fev1_lt && chronic_bronchitis && exac_hosp_yr >= TH.roflu_hosp_ge", unmet:"FEV1 <{TH.roflu_fev1_lt}% · 만성기관지염 · 입원 악화력 중 미충족" },
  "copd:addon26:dupi":    { id:"copd:addon26:dupi", drug:"drug:dupilumab", rec:"copd:rec26:g_fu_bio_dupi", when:"chronic_bronchitis", unmet:"GOLD: 듀필루맙은 만성기관지염 동반 시(허가 문구에는 이 요건 없음 — 상충 X8)" },
  "copd:addon26:mepo":    { id:"copd:addon26:mepo", drug:"drug:mepolizumab", rec:"copd:rec26:g_fu_bio_mepo", when:"true", unmet:"" }
};

/* ---------- 8. 제품 (급여 단위) ---------- */
/* 흡입제는 v1_brand로 CD.INHALER_PRODUCTS에 조인(성분·기기 복제 없음). 비흡입제만 ingredients 보유. */
var PRODUCTS = [
  { id:"copd:prod:spiriva_hh", v1_brand:"스피리바 핸디헬러", reimb:"copd:reimb26:lama_laba_general" },
  { id:"copd:prod:spiriva_rm", v1_brand:"스피리바 레스피맷", reimb:"copd:reimb26:lama_laba_general" },
  { id:"copd:prod:incruse", v1_brand:"인크루즈 엘립타", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:onbrez", v1_brand:"온브리즈 브리즈헬러", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:anoro", v1_brand:"아노로 엘립타", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:ultibro", v1_brand:"조터나 브리즈헬러", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:spiolto", v1_brand:"바헬바 레스피맷", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:duaklir", v1_brand:"듀어클리어 제뉴에어", reimb:"copd:reimb26:lama_laba" },
  { id:"copd:prod:relvar", v1_brand:"렐바 엘립타", reimb:"copd:reimb26:ics_laba" },
  { id:"copd:prod:symbicort", v1_brand:"심비코트 터부헬러", reimb:"copd:reimb26:ics_laba" },
  { id:"copd:prod:trelegy", v1_brand:"트렐리지 엘립타", reimb:"copd:reimb26:triple_tb", note:"트렐리지200은 COPD 급여 제외(천식용) · 동일 함량 렐바+인크루즈 병용 중 전환도 인정(2024-37 3항)" },
  { id:"copd:prod:breztri", v1_brand:"브레즈트리 에어로스피어", reimb:"copd:reimb26:triple_tb" },
  { id:"copd:prod:trimbow", v1_brand:"트림보우", reimb:"copd:reimb26:triple_tm" },
  { id:"copd:prod:daxas", v1_brand:null, label:"닥사스정 등", ingredients:["drug:roflumilast"], reimb:"copd:reimb26:roflumilast" },
  { id:"copd:prod:azithro", v1_brand:null, label:"지스로맥스정 등", ingredients:["drug:azithromycin"], reimb:"copd:reimb26:azithro" },
  { id:"copd:prod:dupixent", v1_brand:null, label:"듀피젠트프리필드시린지주300mg", ingredients:["drug:dupilumab"], reimb:"copd:reimb26:biologic" },
  { id:"copd:prod:nucala_ai", v1_brand:null, label:"누칼라오토인젝터주", ingredients:["drug:mepolizumab"], reimb:"copd:reimb26:biologic", note:"COPD 효능은 오토인젝터 품목만(바이알 '누칼라주'는 천식만)" },
  { id:"copd:prod:ensifentrine", v1_brand:null, label:"엔시펜트린(국내 미허가)", ingredients:["drug:ensifentrine"], reimb:null, kr_available:false }
];
var DRUG_ADD = {
  "drug:ensifentrine": { name:"엔시펜트린", en:"Ensifentrine", cls:"class:pde34i" }
};
var CLASS_ADD = {
  "class:pde34i": { label:"PDE3/4i", full:"PDE3/PDE4 이중 억제제(흡입)", color:"clin" }
};
var DRUG_STATUS = {
  "drug:ensifentrine": { kr_available:false, kr_note:"국내 허가 품목 0건(nedrug 2026-11-01) — GOLD 2026 호흡곤란 경로 '가능 시'", err:null },
  "drug:mepolizumab": { kr_available:true, label_scope:"COPD 효능은 누칼라오토인젝터주(202500679) 효능 4에만 — ICS+LABA+LAMA로 조절 안 되는 혈중 호산구 증가 COPD 추가 유지요법(2026-10 승인 발표)", err:"copd:err:CE5" },
  "drug:dupilumab": { kr_available:true, label_scope:"효능 5: ICS+LABA+LAMA, 또는 ICS가 적절하지 않으면 LABA+LAMA로 조절 안 되는 혈중 호산구 증가 COPD 추가 유지 치료(2025-03 허가)", err:"copd:err:CE10" },
  "drug:azithromycin": { kr_available:true, label_scope:"허가 효능은 감염증 치료(하·상부호흡기 감염 등) — COPD 악화 예방은 허가 외(nedrug 지스로맥스정 200511067, 2026-11-06)", err:"copd:err:CE6" },
  "drug:roflumilast": { kr_available:true, label_scope:"닥사스정 등 — 고시 2021-270", err:"copd:err:CE4" }
};

/* ---------- 9. 고시 ---------- */
var NOTICES = {
  "notice:고시2022-56":  { id:"notice:고시2022-56", label:"고시 제2022-56호", date:"2022-03-01", items:["copd:reimb26:lama_laba"], title:"만성폐쇄성폐질환 흡입용 치료제", shared:"hf(이력) — 같은 번호 전역 ID" },
  "notice:고시2016-66":  { id:"notice:고시2016-66", label:"고시 제2016-66호", date:"2016-05-01", items:["copd:prod:relvar"], title:"렐바엘립타" },
  "notice:고시2015-184": { id:"notice:고시2015-184", label:"고시 제2015-184호", date:"2015-11-01", items:["copd:prod:symbicort"], title:"심비코트터부헬러 등" },
  "notice:고시2024-37":  { id:"notice:고시2024-37", label:"고시 제2024-37호", date:"2024-03-01", items:["copd:prod:trelegy"], title:"트렐리지엘립타 등", prev:"고시 제2021-152호(2021.6.1)" },
  "notice:고시2026-176": { id:"notice:고시2026-176", label:"고시 제2026-176호", date:"2026-09-01", items:["copd:prod:breztri"], title:"브레즈트리에어로스피어 160/7.2/5.0", prev:"신설" },
  "notice:고시2023-296": { id:"notice:고시2023-296", label:"고시 제2023-296호", date:"2024-01-01", items:["copd:prod:trimbow"], title:"트림보우 100/6/12.5", prev:"신설" },
  "notice:고시2021-270": { id:"notice:고시2021-270", label:"고시 제2021-270호", date:"2021-11-01", items:["copd:prod:daxas"], title:"Roflumilast 경구제(닥사스정 등)", prev:"고시 제2015-184호" },
  "notice:고시2025-15":  { id:"notice:고시2025-15", label:"고시 제2025-15호", date:"2025-02-01", items:["copd:prod:azithro"], title:"Azithromycin 경구제 — 허가초과 인정: 미만성 범세기관지염·M. genitalium·백일해 노출 후 예방(COPD 없음)", shared:"hf — 같은 번호 전역 ID" },
  "notice:고시2026-159": { id:"notice:고시2026-159", label:"고시 제2026-159호", date:"2026-08-01", items:["copd:prod:dupixent"], title:"Dupilumab — 아토피피부염·천식 항목만", shared:"hf — 같은 번호 전역 ID" },
  "notice:고시2026-133": { id:"notice:고시2026-133", label:"고시 제2026-133호", date:"2026-07-01", items:["copd:prod:nucala_ai"], title:"Mepolizumab — 중증 호산구성 천식 항목만" }
};
var EXAC_DEF_REIMB = "급성악화 = 호흡곤란 악화·기침 증가·가래양 증가·가래색 변화 등으로 약제 변경 또는 추가(항생제·스테로이드 등)가 필요한 경우(고시 공통 정의) → 중등도·중증 악화 합산";

/* ---------- 10. 급여 판정 (WhenDSL gate) ---------- */
var REIMB_2026 = {
  "copd:reimb26:lama_laba": { id:"copd:reimb26:lama_laba", notice:["notice:고시2022-56"], title:"COPD 흡입용 치료제(LAMA·LABA 단일, LABA+LAMA 복합)",
    gate:{ op:"OR", conds:[ { when:"fev1 < TH.r_fev1_maint_lt", txt:"FEV1 <{TH.r_fev1_maint_lt}%(중등도 이상) 유지요법" },
                            { when:"fev1 >= TH.r_fev1_maint_lt && sx_uncontrolled", txt:"FEV1 ≥{TH.r_fev1_maint_lt}%이나 호흡곤란 등 증상 조절 안 됨" } ] },
    fallback:{ when:"!has_fev1", status:"unknown", note:"FEV1 입력 필요" }, err:"copd:err:CE7" },
  "copd:reimb26:lama_laba_general": { id:"copd:reimb26:lama_laba_general", notice:[], title:"티오트로피움 단일제 — 2022-56 대상 품목 목록에 없음", fixed:"general",
    notes:["개별 세부기준 없음 — 허가사항 범위 내 급여 원칙. 청구 전 약제급여목록 확인"] },
  "copd:reimb26:ics_laba": { id:"copd:reimb26:ics_laba", notice:["notice:고시2016-66","notice:고시2015-184"], title:"ICS/LABA 복합제(렐바·심비코트) COPD",
    gate:{ op:"OR", conds:[ { when:"fev1 < TH.r_fev1_icslaba_lt", txt:"FEV1 <{TH.r_fev1_icslaba_lt}%" },
                            { when:"on_bd && exac_yr >= TH.r_exac_n", txt:"β2작용제·항콜린제 지속 투여에도 연 {TH.r_exac_n}회 이상 급성악화(투여소견서)" } ] },
    opinion_when:"!(fev1 < TH.r_fev1_icslaba_lt)", fallback:{ when:"!has_fev1 && exac_yr < TH.r_exac_n", status:"unknown", note:"FEV1 입력 필요" }, err:"copd:err:CE1" },
  "copd:reimb26:triple_tb": { id:"copd:reimb26:triple_tb", notice:["notice:고시2024-37","notice:고시2026-176"], title:"삼제 — 트렐리지(200 제외)·브레즈트리",
    gate:{ op:"OR", conds:[
      { op:"AND", label:"가. LABA+LAMA 복합요법에도", conds:[ { when:"on_laba_lama", txt:"현재 LABA+LAMA 사용 중" },
        { op:"OR", conds:[ { when:"fev1 < TH.r_fev1_triple_tb_lt", txt:"FEV1 <{TH.r_fev1_triple_tb_lt}%" }, { when:"exac_yr >= TH.r_exac_n", txt:"연 {TH.r_exac_n}회 이상 급성악화(투여소견서)" } ] } ] },
      { op:"AND", label:"나. LABA+ICS 복합요법에도", conds:[ { when:"on_laba_ics", txt:"현재 LABA+ICS 사용 중" }, { when:"sx_uncontrolled", txt:"호흡곤란 등 증상 조절 안 됨" } ] } ] },
    opinion_when:"on_laba_lama && !(fev1 < TH.r_fev1_triple_tb_lt)", notes:["중등도 이상 성인(만 {TH.r_adult_age_ge}세 이상)"], err:"copd:err:CE2" },
  "copd:reimb26:triple_tm": { id:"copd:reimb26:triple_tm", notice:["notice:고시2023-296"], title:"삼제 — 트림보우",
    gate:{ op:"AND", label:"중증 성인 COPD", conds:[
      { when:"on_laba_ics || on_laba_lama", txt:"LABA+ICS 또는 LABA+LAMA 병용 중" },
      { when:"sx_uncontrolled", txt:"호흡곤란 등 증상이 적절히 치료되지 않음" },
      { op:"OR", conds:[ { when:"fev1 < TH.r_fev1_triple_tm_lt", txt:"FEV1 <{TH.r_fev1_triple_tm_lt}%" }, { when:"exac_yr >= TH.r_exac_n", txt:"연 {TH.r_exac_n}회 이상 급성악화(투여소견서)" }, { when:"exac_hosp_yr >= TH.r_hosp_n", txt:"입원으로 이어진 악화 {TH.r_hosp_n}회 이상(투여소견서)" } ] } ] },
    opinion_when:"!(fev1 < TH.r_fev1_triple_tm_lt)", notes:["성인(만 {TH.r_adult_age_ge}세 이상)"], err:"copd:err:CE2" },
  "copd:reimb26:roflumilast": { id:"copd:reimb26:roflumilast", notice:["notice:고시2021-270"], title:"로플루밀라스트(닥사스 등)",
    gate:{ op:"AND", label:"악화 병력 + 만성기관지염 동반 중증 COPD", conds:[
      { when:"exac_yr >= TH.exac_hx_ge", txt:"증상악화 병력" }, { when:"chronic_bronchitis", txt:"만성기관지염 동반" },
      { op:"OR", conds:[ { when:"fev1 < TH.r_fev1_roflu_lt", txt:"FEV1 <{TH.r_fev1_roflu_lt}%" }, { when:"on_bd && exac_yr >= TH.r_exac_n", txt:"β2작용제·항콜린제 지속 투여에도 연 {TH.r_exac_n}회 이상 급성악화(투여소견서)" } ] } ] },
    require:{ when:"on_laba || on_lama", txt:"투여방법: 지속성 기관지확장제(LABA 또는 LAMA) 1종과 병용" },
    opinion_when:"!(fev1 < TH.r_fev1_roflu_lt)", err:"copd:err:CE4" },
  "copd:reimb26:biologic": { id:"copd:reimb26:biologic", notice:["notice:고시2026-159","notice:고시2026-133"], title:"생물학제제(듀필루맙·메폴리주맙) COPD", fixed:"no",
    notes:["COPD 급여 기준 없음 → 전액 본인부담", "천식·아토피 적응증 급여와 혼동 주의"], err:"copd:err:CE5" },
  "copd:reimb26:azithro": { id:"copd:reimb26:azithro", notice:["notice:고시2025-15"], title:"아지스로마이신 COPD 악화 예방", fixed:"no",
    notes:["허가 외 사용 + 고시 허가초과 인정 항목에 COPD 없음 → 장기 예방투여 급여 근거 없음"], err:"copd:err:CE6" }
};
var REIMB_STATUS = {
  ok:{ ko:"급여 충족", cls:"ok" }, unmet:{ ko:"급여 조건 미충족", cls:"block" }, cond:{ ko:"조건부(요건 확인)", cls:"warn" },
  unknown:{ ko:"입력 부족", cls:"warn" }, general:{ ko:"개별 기준 없음(허가 범위)", cls:"clin" }, no:{ ko:"비급여(기준 없음)", cls:"block" }, na:{ ko:"국내 미허가", cls:"block" }
};

/* ---------- 11. 백신 ---------- */
var VACC_ADD = {
  "vacc:pcv15": { name:"폐렴구균 PCV15" }, "vacc:pcv20": { name:"폐렴구균 PCV20" }, "vacc:pcv21": { name:"폐렴구균 PCV21" }
};
var VACC26 = [
  { id:"vacc:influenza", name:"인플루엔자(매년)", when:"true", done_when:"done_influenza",
    layers:[ {gl:"gl:copd:katrd-2024", txt:"모든 COPD 환자", grade:"ungraded"}, {gl:"gl:copd:gold-2026", txt:"매년 접종", grade:"recommend", loe:"B", cite:"Fig 3.6"} ] },
  { id:"vacc:covid19", name:"COVID-19", when:"true", done_when:"done_covid19",
    layers:[ {gl:"gl:copd:gold-2026", txt:"WHO·CDC 최신 권고에 따라", grade:"recommend", loe:"B", cite:"Fig 3.6"} ] },
  { id:"vacc:pneumo", name:"폐렴구균", when:"age >= TH.pcv_hr_age_ge || !has_age", done_when:"pcv_complete",
    plan:[ { when:"done_pcv20 || done_pcv21", txt:"PCV20 또는 PCV21 접종 완료 — 추가 폐렴구균 백신 불필요" },
           { when:"done_pcv15 && !done_ppsv23", txt:"PCV15 후 PPSV23 순차 접종(보통 {TH.pcv_after_ppsv23_y}년 간격)" },
           { when:"done_pcv15 && done_ppsv23", txt:"PCV15→PPSV23 완료" },
           { when:"done_pcv13", txt:"PCV13만 접종: {TH.pcv_after_pcv13_y}년 이후 PCV21 또는 PCV20 1회(PPSV23 아님)" },
           { when:"done_ppsv23", txt:"PPSV23만 접종(NIP 등): 마지막 접종 {TH.pcv_after_ppsv23_y}년 이후 PCV21·PCV20·PCV15 중 1회" },
           { when:"true", txt:"미접종: PCV21 1회 또는 PCV20 1회, 또는 PCV15 → PPSV23(우선순위 없음)" } ],
    layers:[ {gl:"gl:vacc:ksid-pcv-2026", txt:"{TH.pcv_age_ge}세 이상 + {TH.pcv_hr_age_ge}–64세 위험군(만성 호흡기질환 등 — 보도 기준, 원문 위험군 목록 확인 예정)", grade:"ungraded"},
            {gl:"gl:copd:gold-2026", txt:"COPD 환자에게 PCV21 또는 PCV20 1회 권고 — 지역사회획득 폐렴·악화 감소", grade:"recommend", loe:"B", cite:"Fig 3.6"},
            {gl:"gl:copd:katrd-2024", txt:"{TH.pcv_age_ge}세 이상 모든 COPD 환자 폐렴구균 접종(PCV13·PPSV23 근거 서술)", grade:"ungraded"} ] },
  { id:"vacc:rsv", name:"RSV(1회)", when:"!has_age || age >= TH.rsv_ksid_hr_age_ge", done_when:"done_rsv",
    layers:[ {gl:"gl:copd:gold-2026", txt:"{TH.rsv_gold_age_ge}세 이상 그리고/또는 만성 심·폐질환(CDC 기준)", grade:"recommend", loe:"A", cite:"Fig 3.6"},
             {gl:"gl:vacc:ksid-rsv-2026", txt:"{TH.rsv_ksid_hr_age_ge}–74세 중증 RSV 고위험(만성 폐질환 포함) + {TH.rsv_ksid_all_age_ge}세 이상 전원, 1회, 늦여름–초가을(개정안 보도)", grade:"ungraded"} ],
    label_note:"허가(아렉스비·엠레스비아·아브리스보): {TH.rsv_label_age_ge}세 이상, 또는 {TH.rsv_label_hr_age_ge}–59세 RSV 하기도질환 고위험" },
  { id:"vacc:tdap", name:"Tdap", when:"true", done_when:"done_tdap",
    layers:[ {gl:"gl:copd:gold-2026", txt:"청소년기 미접종자 — 백일해·파상풍·디프테리아", grade:"recommend", loe:"B", cite:"Fig 3.6"} ] },
  { id:"vacc:zoster", name:"대상포진", when:"!has_age || age > TH.zoster_age_gt", done_when:"done_zoster",
    layers:[ {gl:"gl:copd:gold-2026", txt:"{TH.zoster_age_gt}세 초과 COPD", grade:"recommend", loe:"B", cite:"Fig 3.6"} ] }
];
var VACC_REIMB_NOTE = "백신은 요양급여 대상이 아님 — 국가예방접종(NIP) 지원 범위는 질병관리청 기준 확인(65세 PPSV23 무료 접종 보도)";

/* ---------- 12. 악화(AECOPD) 입력 ---------- */
var AECOPD_INPUTS = [
  { k:"ae_severity", label:"중증도(로마 제안)", type:"select", opts:[["mild","경증"],["moderate","중등증"],["severe","중증(입원·ABGA 산증)"]] },
  { k:"ae_rf", label:"호흡부전", type:"select", opts:[["none","없음"],["hypoxemic","급성 저산소성"],["hypercapnic","고탄산성"]] },
  { k:"ae_purulent", label:"화농성 객담", type:"chip" },
  { k:"ae_prior_culture", label:"이전 객담 세균 양성", type:"chip" },
  { k:"ae_mv", label:"기계환기(NIV·침습)", type:"chip" }
];

/* ---------- 13. 상충 (지침 ⟷ 허가·급여) ---------- */
var CONFLICTS = [
  { id:"copd:conf26:triple_1exac", x:"X1", when:"gold_triple && !tx_none && !triple_reimb_ok",
    gl:"GOLD 2026: LABA+LAMA 중 악화 1회 + 호산구 ≥{TH.eos_ics_min}이면 삼제(제안). KATRD 2024는 고위험군(중등도 ≥2회 또는 입원)부터 삼제",
    reimb:"트렐리지·브레즈트리: LABA+LAMA에도 FEV1 <{TH.r_fev1_triple_tb_lt}% 또는 연 {TH.r_exac_n}회↑ / 트림보우: <{TH.r_fev1_triple_tm_lt}% 또는 {TH.r_exac_n}회↑·입원 {TH.r_hosp_n}회↑ — 현재 입력으로 미충족" },
  { id:"copd:conf26:triple_initial", x:"X2", when:"tx_none && (gold_triple || kr_triple)",
    gl:"초치료 삼제: GOLD E군 + 호산구 ≥{TH.eos_ics_high}(실용적 권고) / KATRD 고위험군 + 호산구 ≥{TH.eos_ics_high} 1차",
    reimb:"삼제 급여는 LABA+LAMA 또는 LABA+ICS 사용 후가 전제 → 초치료 삼제 급여 근거 없음(전액 본인부담 또는 2제 선행)" },
  { id:"copd:conf26:biologic", x:"X3", when:"bio_shown",
    gl:"GOLD 2026: 듀필루맙·메폴리주맙(Evidence A) / KATRD 그림 3-4: 고위험 + 호산구 ≥{TH.eos_bio} anti-IL-4R",
    reimb:"듀피젠트(2026-159)·누칼라(2026-133) 고시에 COPD 항목 없음 → 전액 본인부담" },
  { id:"copd:conf26:roflu", x:"X4", when:"(roflu_gold_shown && roflu_gold_met != roflu_reimb_ok) || (roflu_kr_met && !roflu_reimb_ok)",
    gl:"GOLD: FEV1 <{TH.roflu_fev1_lt}% + 만성기관지염 + 입원 악화력 / KATRD: <{TH.roflu_fev1_lt}% + 만성기관지염 + 악화 병력",
    reimb:"2021-270: 악화 병력 + 만성기관지염 + (FEV1 <{TH.r_fev1_roflu_lt}% 또는 기관지확장제 중 연 {TH.r_exac_n}회↑), LABA·LAMA 1종 병용" },
  { id:"copd:conf26:azithro", x:"X5", when:"azithro_shown",
    gl:"GOLD: 현재 비흡연자 지속 악화 시 고려(A) / KATRD: 악화 경향 환자 1년 투여 근거",
    reimb:"COPD 악화 예방은 허가 외 + 2025-15 허가초과 인정 항목에 없음 → 급여 근거 없음" },
  { id:"copd:conf26:ics_laba", x:"X6", when:"on_laba_ics_only || laba_ics_considered",
    gl:"GOLD: LABA+ICS 비권장(삼제 우월) / KATRD KQ3·6: LABA+ICS보다 삼제",
    reimb:"렐바·심비코트 COPD 급여 기준은 있음(FEV1 <{TH.r_fev1_icslaba_lt}% 또는 연 {TH.r_exac_n}회↑) — 급여 가능 ≠ 권고" },
  { id:"copd:conf26:kr_low_risk", x:"X7", when:"kr_low",
    gl:"KATRD 2024 내부: KQ1·2(근거 낮음) 저위험군 기관지확장제 '권고 보류' ⟷ 같은 지침 그림 3-3은 저위험군 1차 LABA+LAMA(등급 미부여)",
    reimb:"LABA+LAMA 급여: FEV1 <{TH.r_fev1_maint_lt}% 또는 ≥{TH.r_fev1_maint_lt}%이면 증상 조절 안 될 때" },
  { id:"copd:conf26:dupi_cb", x:"X8", when:"dupi_shown && !chronic_bronchitis",
    gl:"GOLD 2026: 듀필루맙은 만성기관지염 동반 시(BOREAS·NOTUS 대상)",
    reimb:"허가 효능에 만성기관지염 요건 없음 + ICS 부적절 시 LABA+LAMA 경로 포함 — 급여는 없음" },
  { id:"copd:conf26:pcv", x:"X9", when:"pcv_due",
    gl:"GOLD 2026: COPD 전원 PCV21 또는 PCV20(B) / KATRD 2024: {TH.pcv_age_ge}세 이상(PCV13 근거 서술)",
    reimb:"대한감염학회 2026: {TH.pcv_age_ge}세↑ + {TH.pcv_hr_age_ge}–64세 위험군 → PCV21·PCV20 1회 또는 PCV15→PPSV23. 요양급여 대상 아님" }
];

/* ---------- 14. v1 정정 ---------- */
var ERRATA = [
  { id:"copd:err:CE1", kind:"erratum", v1_path:"CD.REIMB['copd:rule:ics_laba'] · CD.reimbEngine", v1:"FEV1<60% + 악화 잦은 경우(AND)", current:"FEV1 <60% 또는 β2·항콜린제 지속 투여에도 연 2회↑(OR, 투여소견서)", src:"notice:고시2016-66 · 고시2015-184", effect:"급여 대상 과소 판정" },
  { id:"copd:err:CE2", kind:"erratum", v1_path:"CD.REIMB['copd:rule:triple'] · CD.reimbEngine", v1:"3제품 공통 '트렐리지 기준', 입원 1회를 잦은 악화로 인정", current:"트렐리지·브레즈트리(2026-176 신설) FEV1 <60% 또는 연 2회↑ / 트림보우 중증 + FEV1 <50% 또는 연 2회↑ 또는 입원 1회↑ — 모두 투여소견서", src:"notice:고시2024-37 · 2026-176 · 2023-296", effect:"트림보우 과대·트렐리지 입원 1회 과대" },
  { id:"copd:err:CE3", kind:"erratum", v1_path:"CD.REIMB", v1:"고시 번호·시행일 없음", current:"10개 notice ID 부여", src:"HIRA 보험인정기준", effect:"감사 추적" },
  { id:"copd:err:CE4", kind:"erratum", v1_path:"CD.REIMB['copd:rule:roflumilast']", v1:"만성기관지염 + FEV1<50% + 악화", current:"악화 병력 + 만성기관지염 + (FEV1 <50% 또는 기관지확장제 중 연 2회↑) + LABA·LAMA 1종 병용", src:"notice:고시2021-270", effect:"OR 경로·병용 요건 누락" },
  { id:"copd:err:CE5", kind:"erratum", v1_path:"CD.BIOLOGICS[MEPO].approval/criteria", v1:"'2025말 국내 허가', 호산구 ≥150", current:"누칼라오토인젝터주만 COPD 효능(2026-10 승인 발표), 허가 문구는 '호산구 증가'(수치 없음), 급여 없음", src:"nedrug 202500679 · notice:고시2026-133", effect:"허가 시점·제형 오류" },
  { id:"copd:err:CE6", kind:"erratum", v1_path:"CD.REIMB['copd:rule:macrolide']", v1:"'주의 — 급여 삭감 빈번'", current:"허가 외 + 고시 허가초과 인정 항목에 COPD 없음 → 급여 근거 없음", src:"notice:고시2025-15 · nedrug 200511067", effect:"표현 정정" },
  { id:"copd:err:CE7", kind:"erratum", v1_path:"CD.REIMB['copd:rule:laba_lama']", v1:"무조건 급여", current:"FEV1 <80% 유지요법, 또는 ≥80%라도 증상 조절 안 되는 경우. 대상 품목 열거(티오트로피움 단일 미포함)", src:"notice:고시2022-56", effect:"FEV1 ≥80% 증상 경미 과대 판정" },
  { id:"copd:err:CE8", kind:"guideline_update", v1_path:"CD.VACCINE pcv13·rsv", v1:"PCV13 우선(65세↑) · RSV '국내 권고 미정'", current:"대한감염학회 2026: PCV21·PCV20 1회 또는 PCV15→PPSV23 / RSV 3품목 허가, 학회 개정안 50–74세 고위험 + 75세↑", src:"gl:vacc:ksid-pcv-2026 · gl:vacc:ksid-rsv-2026 · nedrug", effect:"v1은 KATRD 2024 원문 그대로 — 오류 아닌 지침 갱신" },
  { id:"copd:err:CE9", kind:"guideline_update", v1_path:"CD.GOLD_GROUP.classify", v1:"E = 중등도 ≥2 또는 입원 ≥1 (GOLD 2025)", current:"E = 중등도·중증 ≥1 (GOLD 2026)", src:"GOLD 2026 Fig 3.8", effect:"중등도 1회 환자 A/B → E" },
  { id:"copd:err:CE10", kind:"erratum", v1_path:"CD.BIOLOGICS[DUPI].criteria d0", v1:"고용량 ICS+LABA+LAMA 최적치료에도", current:"허가: ICS+LABA+LAMA, 또는 ICS 부적절 시 LABA+LAMA로 조절 안 되는 호산구 증가 COPD", src:"nedrug 201801406", effect:"전제가 허가보다 좁음" },
  { id:"copd:err:CE11", kind:"erratum", v1_path:"CD.BIO_COMMON.verdict_reimb · reimbEngine", v1:"'월 ~150만원'", current:"출처 없음 → 금액 미표시, '전액 본인부담'만", src:"—", effect:"근거 없는 수치 제거" },
  { id:"copd:err:CE12", kind:"guideline_update", v1_path:"CD.EXAC.tx", v1:"스테로이드 '통상 5일', 항생제 기간 없음, NIV만", current:"스테로이드 5일(A) · 항생제 적응(A)·5일(B) · 급성 저산소 호흡부전은 HFNT 우선(A)", src:"GOLD 2026 Fig 4.5·4.6", effect:"악화 관리 갱신" }
];
var SUPERSEDED_V1 = {
  "copd:rule:laba_lama":["copd:reimb26:lama_laba","copd:reimb26:lama_laba_general"], "copd:rule:ics_laba":["copd:reimb26:ics_laba"],
  "copd:rule:triple":["copd:reimb26:triple_tb","copd:reimb26:triple_tm"], "copd:rule:roflumilast":["copd:reimb26:roflumilast"], "copd:rule:macrolide":["copd:reimb26:azithro"],
  "copd:gold:A":["copd:gold26:A"], "copd:gold:B":["copd:gold26:B"], "copd:gold:E":["copd:gold26:E"],
  "vacc:pcv13":["vacc:pcv21","vacc:pcv20","vacc:pcv15"]
};

/* ---------- 15. 입력 ---------- */
var V1_INPUT_KEYS = { num:["fev1","cat","mmrc","modExac","hospExac","eos"], bool:["smoker","exSmoker","asthmaHx"] };
var INPUTS = [
  { k:"age", label:"나이", type:"number", ph:"백신 판정" },
  { k:"trait", label:"주된 치료 표적(추적)", type:"select", opts:[["","자동(악화 있으면 악화)"],["exac","악화"],["dyspnea","호흡곤란"]] },
  { k:"chronic_bronchitis", label:"만성기관지염", type:"chip" },
  { k:"sx_uncontrolled", label:"현 치료로 증상 조절 안 됨", type:"chip" },
  { k:"asthma_concurrent", label:"천식 공존 진단", type:"chip" },
  { k:"pneumonia_recurrent", label:"중증·반복 폐렴", type:"chip" },
  { k:"ics_inappropriate", label:"ICS 부적절 시작", type:"chip" },
  { k:"ics_no_response", label:"ICS 무반응", type:"chip" },
  { k:"ics_ae", label:"ICS 심한 부작용", type:"chip" },
  { k:"mycobacterial_hx", label:"결핵·NTM 병력", type:"chip" },
  { k:"ae_on", label:"지금 급성악화(악화 모드)", type:"chip" }
];
var VACC_INPUTS = [ ["vacc:pcv15","PCV15"],["vacc:pcv20","PCV20"],["vacc:pcv21","PCV21"] ];

/* ---------- 16. 시뮬 증례 (입력만) ---------- */
var SIM_CASES = [
  { id:"copd:sim26:c1", title:"무치료 · CAAT 14 · 중등도 악화 1회 · 호산구 150 · FEV1 65%",
    p:{ products:[], cat:14, mmrc:2, modExac:1, hospExac:0, eos:150, fev1:65, age:66, exSmoker:true },
    point:"국내 저위험(KQ1·2 보류 ⟷ 그림 3-3, X7) / GOLD 2026 E군(2025 기준이면 B) / LABA+LAMA 급여 충족" },
  { id:"copd:sim26:c2", title:"LABA+LAMA 중 · 중등도 악화 1회 · 호산구 220 · FEV1 62%",
    p:{ products:["아노로 엘립타"], cat:16, mmrc:2, modExac:1, hospExac:0, eos:220, fev1:62, age:70, exSmoker:true },
    point:"GOLD 삼제 제안 ⟷ 삼제 3품목 급여 미충족(X1)" },
  { id:"copd:sim26:c3", title:"LABA+LAMA 중 · 중등도 악화 2회 · 호산구 350 · FEV1 55% · 증상 미조절",
    p:{ products:["조터나 브리즈헬러"], cat:20, mmrc:2, modExac:2, hospExac:0, eos:350, fev1:55, age:68, exSmoker:true, sx_uncontrolled:true },
    point:"KATRD KQ5(강하게 권고/보통) + GOLD 삼제 / 트렐리지·브레즈트리·트림보우 급여 충족(투여소견서)" },
  { id:"copd:sim26:c4", title:"삼제 중 · 중등도 2회 + 입원 1회 · 호산구 400 · 만성기관지염 · FEV1 45%",
    p:{ products:["트렐리지 엘립타"], cat:22, mmrc:3, modExac:2, hospExac:1, eos:400, fev1:45, age:72, exSmoker:true, chronic_bronchitis:true, sx_uncontrolled:true },
    point:"듀필루맙·메폴리주맙(Evidence A) 비급여(X3) · 로플루밀라스트 급여 충족(병용 요건) · 아지스로마이신 급여 근거 없음(X5)" },
  { id:"copd:sim26:c5", title:"LABA+LAMA 중 · 현재 흡연 · 중등도 2회 · 호산구 60 · 만성기관지염 · FEV1 40%",
    p:{ products:["바헬바 레스피맷"], cat:18, mmrc:2, modExac:2, hospExac:0, eos:60, fev1:40, age:63, smoker:true, chronic_bronchitis:true },
    point:"GOLD 로플루밀라스트 조건(입원력) 미충족 ⟷ 급여 충족(X4) · 아지스로마이신 비선호(현재 흡연) · 금연 강하게 권고/높음" },
  { id:"copd:sim26:c6", title:"입원 급성악화 · 72세 · 급성 저산소 호흡부전 · 화농성 객담 · 호산구 350 · 백신 없음",
    p:{ products:["아노로 엘립타"], cat:24, mmrc:3, modExac:1, hospExac:1, eos:350, fev1:42, age:72, exSmoker:true, ae_on:true, ae_severity:"severe", ae_rf:"hypoxemic", ae_purulent:true, vaccines:[] },
    point:"스테로이드 5일(A) · 항생제 5일(B) · HFNT 우선(A) · 퇴원 시 LABD + ICS 고려 · 백신(PCV21/20, RSV, 인플루엔자, COVID-19)" }
];

/* ---------- 17. 도서관 ---------- */
var LIB = {
  concepts:[
    "GOLD 2026: E군 = 지난 1년 중등도 또는 중증 악화 1회 이상(2025: 중등도 2회 또는 입원 1회). 국내 KATRD 2024 고위험군 정의는 그대로 → 두 축을 분리 표시",
    "증상 도구 이름 CAT → CAAT(Chronic Airways Assessment Test), 컷오프 10 동일",
    "초치료(약물 미사용자)와 추적치료 알고리즘 분리. 추적은 '주된 치료 표적'(악화 / 호흡곤란)으로 경로 선택 — 둘 다면 악화 경로",
    "추적 악화 경로 진입 = 중등도 또는 중증 악화 1회. 호산구 100·300이 ICS·생물학제제 분기점",
    "생물학제제 근거표 신설(Fig 3.11): 듀필루맙(만성기관지염 동반)·메폴리주맙",
    "악화 장 전면 개정: 로마 제안 중증도, 감별(폐렴·폐색전·급성 심부전·기흉), 치료 장소, 스테로이드 5일·항생제 5일, HFNT 우선",
    "백신: RSV 추가, 폐렴구균 PCV20·PCV21 권고",
    "KATRD 2024: GRADE로 KQ1–9 등급 부여(삼제 중심). 이외 권고는 등급 미부여"
  ],
  bio_trials:[
    { drug:"drug:dupilumab", dose:"300 mg 2주마다 피하", trials:"BOREAS(n=939)·NOTUS(n=935)", pop:"FEV1 30–70%, 만성기관지염, 혈중 호산구 ≥300, 삼제 중 지난 1년 악화", result:"중등도·중증 악화 RR 0.70·0.66, FEV1 +83·+62 mL, SGRQ 개선" },
    { drug:"drug:mepolizumab", dose:"100 mg 4주마다 피하", trials:"METREO·METREX·MATINEE(n=804)", pop:"삼제 중 악화, MATINEE: 스크리닝 호산구 ≥300 + 이전 ≥150", result:"METREO RR 0.80(NS) · METREX RR 0.82(p=0.04) · MATINEE RR 0.79(p=0.01), FEV1·SGRQ 유의차 없음" }
  ],
  topic_notes:{
    diagnosis:["copd:err:CE9"], inhaler:["copd:err:CE7","copd:err:CE2"], eos:["copd:err:CE9"], biologic:["copd:err:CE5","copd:err:CE10","copd:err:CE11"],
    exac:["copd:err:CE12"], comorbid_vacc:["copd:err:CE8"], reimb:["copd:err:CE1","copd:err:CE2","copd:err:CE3","copd:err:CE4","copd:err:CE6","copd:err:CE7"]
  }
};

var SOURCES = [
  { id:"src:gold2026", label:"GOLD 2026 Report v1.3 (2025-12-08)", url:"https://goldcopd.org/wp-content/uploads/2026/01/GOLD-REPORT-2026-v1.3-8Dec2025_WMV2.pdf", level:"원문" },
  { id:"src:gold2026_pg", label:"GOLD 2026 Pocket Guide v1.1", url:"https://goldcopd.org/wp-content/uploads/2026/01/GOLD-Pocket-Guide-2026-v1.1-20Nov2025_WMV2.pdf", level:"원문" },
  { id:"src:katrd2024", label:"대한결핵및호흡기학회 COPD 진료지침 2024 개정", url:"https://www.lungkorea.org/bbs/index.html?code=guide", level:"원문" },
  { id:"src:hira", label:"심평원 보험인정기준(고시 2022-56·2016-66·2015-184·2024-37·2026-176·2023-296·2021-270·2025-15·2026-159·2026-133)", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrList.do?pgmid=HIRAA030069000400", level:"원문" },
  { id:"src:nedrug", label:"의약품안전나라 — 누칼라오토인젝터주·듀피젠트300·RSV 백신 3품목·지스로맥스정 효능효과", url:"https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=202500679", level:"원문" },
  { id:"src:ksid_pcv", label:"대한감염학회 성인 폐렴구균 권고 2026 개정(메디칼업저버 2026-10-06 보도)", url:"https://www.monews.co.kr/news/articleView.html?idxno=414323", level:"보도" },
  { id:"src:ksid_rsv", label:"대한감염학회 RSV 권고 개정안(헤럴드경제 2026-03-24 보도)", url:"https://www.heraldk.com/article/2026032421544538634", level:"보도" },
  { id:"src:nucala_kr", label:"누칼라 COPD 적응증 국내 승인(메디칼업저버 2026-10-26)", url:"https://www.monews.co.kr/news/articleView.html?idxno=414807", level:"보도" }
];
var LOCAL_MAP = { "copd:gold:E":"copd:gold26:E (기준 변경: 2025 ≥2/입원 → 2026 ≥1)", "vacc:pcv13":"접종력 입력용으로만 유지" };

return { META:META, GUIDELINES:GUIDELINES, REC_SYSTEMS:REC_SYSTEMS, TH:TH, GROUP26:GROUP26, REGIMEN_MAP:REGIMEN_MAP, REGIMEN_LABEL:REGIMEN_LABEL,
  REC_2026:REC_2026, ALGO26:ALGO26, ADDONS26:ADDONS26, PRODUCTS:PRODUCTS, DRUG_ADD:DRUG_ADD, CLASS_ADD:CLASS_ADD, DRUG_STATUS:DRUG_STATUS,
  NOTICES:NOTICES, EXAC_DEF_REIMB:EXAC_DEF_REIMB, REIMB_2026:REIMB_2026, REIMB_STATUS:REIMB_STATUS, VACC_ADD:VACC_ADD, VACC26:VACC26, VACC_REIMB_NOTE:VACC_REIMB_NOTE,
  AECOPD_INPUTS:AECOPD_INPUTS, CONFLICTS:CONFLICTS, ERRATA:ERRATA, SUPERSEDED_V1:SUPERSEDED_V1, V1_INPUT_KEYS:V1_INPUT_KEYS, INPUTS:INPUTS, VACC_INPUTS:VACC_INPUTS,
  SIM_CASES:SIM_CASES, LIB:LIB, SOURCES:SOURCES, LOCAL_MAP:LOCAL_MAP };
})();
