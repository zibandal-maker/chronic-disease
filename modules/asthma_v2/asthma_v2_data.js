/* ===================================================================
   ASTHMA v2 DATA (ASTHMA26) — KATRD 천식 진료지침 2026 6차(L1) · GINA 2026(L1′) · 심평원 급여 원문(2026-11-07)
   임상 수치·약물·고시 조건은 여기에만. 엔진·UI는 ID와 TH 키로만 참조.
   저작권: KATRD·GINA 문장 미수록 — 의역 + 표·그림·Box 번호 + 근거 문자.
   =================================================================== */
var ASTHMA26 = {
META:{ version:"asthma-v2-2026.11", reimb_checked:"2026-11-07", built:"2026-11-07", ui_top_recs:3, flow_age_min_th:"r_age_adol",
  spec:"claude/천식_개정SPEC_v2.md", note:"v1(asthma_totalcare_app__2_.html) 무수정 · 가산 블록" },

GUIDELINES:{
  "gl:asthma:katrd-2026":{ short:"KATRD 2026", title:"대한결핵및호흡기학회 천식 진료지침 2026 6차 개정", date:"2026-06-30", layer:"L1", recsys:"recsys:tier", status:"active",
    url:"https://www.lungkorea.org/bbs/?code=guide", note:"GRADE 방법론으로 개정했으나 본문 권고에 등급 표기 없음 — 선호(1안)·대안(2안)·다른 치료 구조로 순위화. 일부 표(5-3)는 GINA 근거 문자 인용. GINA 2025를 수용 개작" },
  "gl:asthma:gina-2026":{ short:"GINA 2026", title:"Global Initiative for Asthma — Global Strategy for Asthma Management and Prevention 2026", date:"2026-05", layer:"L1′", recsys:"recsys:gina", status:"active",
    url:"https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf", note:"Evidence A–D · 트랙(preferred/alternative) 구조" },
  "gl:asthma:gina-2025":{ short:"GINA 2025", title:"GINA 2025", layer:"L1′", recsys:"recsys:gina", status:"superseded", superseded_by:"gl:asthma:gina-2026" },
  "gl:asthma:kaaaci-2025":{ short:"KAAACI 2025", title:"대한천식알레르기학회 OCS 감량 권고(v1 표기)", layer:"ref", status:"reference", src_level:"unverified", note:"원문 미확보 — v1 감량 속도 서술의 출처로만 표기" }
},

REC_SYSTEMS:{
  "recsys:tier":{ label:"KATRD 권고 위치", grade:{
      preferred:{ ko:"선호(1안)", rank:1 }, recommended:{ ko:"권고(등급 미표기)", rank:1 }, alternative:{ ko:"대안(2안)", rank:2 },
      other:{ ko:"다른 치료", rank:4 }, not_recommended:{ ko:"비권고", rank:9 } },
    loe:{ A:{ ko:"인용 근거 A", rank:0 }, B:{ ko:"인용 근거 B", rank:1 }, C:{ ko:"인용 근거 C", rank:2 }, D:{ ko:"인용 근거 D", rank:3 } },
    tooltip:"KATRD 2026은 GRADE로 개정했으나 본문 권고에 등급을 표기하지 않았다 — 표 4-4·그림 4-3의 1안/2안/다른 치료 위치로 순위를 매기고, 표가 인용한 GINA 근거 문자만 덧붙인다." },
  "recsys:gina":{ label:"GINA 트랙 위치 · Evidence", grade:{
      preferred:{ ko:"선호", rank:1 }, alternative:{ ko:"대안", rank:2 }, consider:{ ko:"고려", rank:3 }, not_recommended:{ ko:"비권고", rank:9 } },
    loe:{ A:{ ko:"Evidence A", rank:0 }, B:{ ko:"Evidence B", rank:1 }, C:{ ko:"Evidence C", rank:2 }, D:{ ko:"Evidence D", rank:3 } },
    tooltip:"GINA Evidence A = 다수 RCT·메타분석, B = 제한적 RCT, C = 비무작위·관찰, D = 패널 합의." }
},

/* ---------- 임계값 (지침) · r_* = 급여 고시 ---------- */
TH:{
  bdr_pct_ge:12, bdr_ml_ge:200, fev1_risk_lt:60, slit_fev1_gt:70,
  eos_t2_ge:150, feno_t2_ge:25, eos_il5_ge:300, eos_oma_pred_ge:260, feno_oma_pred_ge:20, eos_dupi_avoid_ge:1500, ige_oma_ge:76,
  stepdown_months:3, reassess_wk_lo:4, reassess_wk_hi:8, high_ics_months_lo:3, high_ics_months_hi:6, azithro_months_ge:6,
  ocs_low_max_mg:7.5, ocs_cum_g_lo:0.5, ocs_cum_g_hi:1, ocs_courses_refer:2, bio_eval_months:4, bio_reeval_mo_lo:3, bio_reeval_mo_hi:6,
  act_good_ge:20, act_mcid:3, g4_partly_max:2,
  /* 급성 악화 — KATRD 표 5-4·5단원 / GINA 2026 9장 */
  ae_rr_gt:30, ae_hr_lo:100, ae_hr_gt:120, ae_spo2_lo:90, ae_spo2_hi:95, ae_pef_le:50,
  spo2_kr_lo:93, spo2_kr_hi:95, spo2_gina_start_lt:92, spo2_gina_hi:95,
  saba_puffs_lo:4, saba_puffs_hi:10, saba_q_min:20, saba_rounds:3,
  ocs_mgkg:1, ocs_max_mg:50, ocs_days_lo:5, ocs_days_hi:7, pred_self_lo:40, pred_self_hi:50, self_pef_lt:60, self_h:48,
  ics_ae_mult:4, ics_ae_wk_lo:1, ics_ae_wk_hi:2, dc_ics_wk_lo:2, dc_ics_wk_hi:4,
  pef_admit_lt:25, pef_admit_post_lt:40, pef_dc_ge:60, mgso4_g:2,
  /* 급여 고시 */
  r_age_adult:18, r_age_adol:12, r_age_child:6, r_ige_ge:76, r_fev1_oma_lt:80, r_exac_oma:2,
  r_eos_150:150, r_feno_25:25, r_eos_300:300, r_eos_400:400, r_exac_4:4, r_exac_3:3, r_exac_1:1,
  r_ocs_mg:5, r_ocs_months:6, r_oma_eval_wk:16, r_eval_mo_lo:3, r_eval_mo_hi:6, r_eval_yr_mo:12, r_dupi_ocs_eval_mo:6,
  r_rx_wk:4, r_rx_stable_wk_lo:8, r_rx_stable_wk_hi:12, r_resp_pct:50
},

/* ---------- 전역 ID 보강 (레지스트리 대조 2026-11-07) ---------- */
DRUG_ADD:{
  "drug:indacaterol":{ ko:"인다카테롤", cls:"class:laba" },
  "drug:umeclidinium":{ ko:"우메클리디늄", cls:"class:lama" },
  "drug:ciclesonide":{ ko:"시클레소니드", cls:"class:ics" },
  "drug:depemokimab":{ ko:"데페모키맙", cls:"class:anti_il5" },
  "drug:prednisolone":{ ko:"프레드니솔론", cls:"class:systemic_steroid" },
  "drug:azithromycin":{ ko:"아지스로마이신", cls:"class:macrolide" }
},
BIO_CLASS:{ "drug:omalizumab":"class:anti_ige", "drug:mepolizumab":"class:anti_il5", "drug:reslizumab":"class:anti_il5",
  "drug:benralizumab":"class:anti_il5r", "drug:dupilumab":"class:il4_13_biologic", "drug:tezepelumab":"class:anti_tslp", "drug:depemokimab":"class:anti_il5" },
CLASS_ADD:{
  "class:anti_ige":{ label:"항-IgE", parent:"class:biologic", reuse:"skin" },
  "class:anti_il5":{ label:"항-IL-5", parent:"class:biologic" },
  "class:anti_il5r":{ label:"항-IL-5Rα", parent:"class:biologic" },
  "class:il4_13_biologic":{ label:"항-IL-4Rα(IL-4/13)", parent:"class:biologic", reuse:"skin" },
  "class:anti_tslp":{ label:"항-TSLP", parent:"class:biologic" }
},
LABS:{ "lab:fev1":"FEV1(%예측치)", "lab:eos":"혈중 호산구(/µL)", "lab:feno":"FeNO(ppb)", "lab:ige_total":"총 IgE(IU/mL)" },

/* ---------- 고시 ---------- */
NOTICES:{
  "notice:고시2013-127":{ label:"고시 2013-127 [일반원칙] 기관지천식 흡입제", date:"2013-09-01", text:"허가 범위 내 급여 · 효능군별 2–3종 흡입제 병용 인정 · 분무용 용액은 노인·소아·안면마비·의식불명 등 흡입 곤란 또는 응급치료 시에만" },
  "notice:고시2014-34":{ label:"고시 2014-34 플루티폼", date:"2014-03-01" },
  "notice:고시2015-184":{ label:"고시 2015-184 심비코트 등", date:"2015-11-01" },
  "notice:고시2016-66":{ label:"고시 2016-66 렐바", date:"2016-05-01" },
  "notice:고시2017-193":{ label:"고시 2017-193 포스터 등", date:"2017-11-01" },
  "notice:고시2018-28":{ label:"고시 2018-28 아뉴이티", date:"2018-03-01" },
  "notice:고시2021-234":{ label:"고시 2021-234 에너제어·어택트라", date:"2021-09-01" },
  "notice:고시2022-56":{ label:"고시 2022-56 티오트로피움(다항 천식)", date:"2022-03-01" },
  "notice:고시2023-184":{ label:"고시 2023-184 LTRA", date:"2023-10-01" },
  "notice:고시2023-296":{ label:"고시 2023-296 트림보우(2항 천식)", date:"2024-01-01" },
  "notice:고시2024-37":{ label:"고시 2024-37 트렐리지(2항 천식)", date:"2024-03-01" },
  "notice:고시2025-224":{ label:"고시 2025-224 오말리주맙 주사제", date:"2026-01-01" },
  "notice:고시2026-92":{ label:"고시 2026-92 레슬리주맙·벤랄리주맙", date:"2026-05-01" },
  "notice:고시2026-133":{ label:"고시 2026-133 메폴리주맙", date:"2026-07-01" },
  "notice:고시2026-159":{ label:"고시 2026-159 두필루맙(천식 항목)", date:"2026-08-01" }
},

/* ---------- ICS 1일 용량 (KATRD 표 4-2, 성인 µg/일) — 저 ≤low_max · 중간 ≤med_max · 고 > ---------- */
ICS_DOSE:[
  { key:"drug:beclomethasone|HFA", label:"BDP(HFA)", low:"100–200", med:">200–400", high:">400", low_max:200, med_max:400 },
  { key:"drug:budesonide", label:"부데소니드(DPI·MDI)", low:"200–400", med:">400–800", high:">800", low_max:400, med_max:800 },
  { key:"drug:ciclesonide", label:"시클레소니드(HFA)", low:"80–160", med:">160–320", high:">320", low_max:160, med_max:320 },
  { key:"drug:fluticasone|FF", label:"플루티카손 푸로에이트(DPI)", low:"100", med:"100", high:"200", fixed:{ "100":"low_med", "200":"high" } },
  { key:"drug:fluticasone|FP", label:"플루티카손 프로피오네이트(DPI·HFA)", low:"100–250", med:">250–500", high:">500", low_max:250, med_max:500 },
  { key:"drug:mometasone", label:"모메타손 푸로에이트", low:"110–220", med:">220–440", high:">440", low_max:220, med_max:440, note:"브리즈헬러 복합제(어택트라·에너제어)는 제형이 달라 함량별 용량 단계를 허가사항으로 확인" },
  { key:"drug:beclomethasone|CFC", label:"BDP(CFC, 참고)", low:"200–500", med:">500–1,000", high:">1,000", low_max:500, med_max:1000 }
],
ICS_LEVEL:{ none:"ICS 없음", low:"저용량", medium:"중간용량", high:"고용량" },

/* ---------- 제품 (asthma:prod:*) — v1_brand = v1 INHALERS.list 조인 키 ---------- */
PRODUCTS:[
  { id:"asthma:prod:symbicort_th", v1_brand:"심비코트 터부헬러 160/4.5", label:"심비코트 터부헬러 160/4.5", kind:"inhaler", device:"DPI",
    ingredients:["drug:budesonide","drug:formoterol"], tags:["ics_laba","mart","air"], ics:{ key:"drug:budesonide", ug:200, note:"방출량 160 = 계량 200 µg" },
    mart:{ label_max:8, label_exc:12, kr_row:"bf200" }, age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2015-184"],
    label_note:"AIR(≥12세): 1일 8번 이하, 예외적 일시 12번 · MART 유지 1번 1일 2회 + 필요시" },
  { id:"asthma:prod:symbicort_rh", v1_brand:"심비코트 라피헬러 80/2.25", label:"심비코트 라피헬러 80/2.25", kind:"inhaler", device:"pMDI",
    ingredients:["drug:budesonide","drug:formoterol"], tags:["ics_laba","mart","air"], ics:{ key:"drug:budesonide", ug:100, note:"방출량 80 = 계량 100 µg" },
    mart:{ label_max:16, label_exc:24, kr_row:"bf100" }, age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2015-184"],
    label_note:"AIR: 필요시 2번, 1일 16번 이하·예외적 일시 24번 · MART 유지 최대 4번 1일 2회 + 필요시 2번" },
  { id:"asthma:prod:foster", v1_brand:"포스터 100/6", label:"포스터 100/6", kind:"inhaler", device:"pMDI",
    ingredients:["drug:beclomethasone","drug:formoterol"], tags:["ics_laba","mart"], ics:{ key:"drug:beclomethasone|HFA", ug:100, note:"초미세입자 BDP" },
    mart:{ label_max:8, kr_row:"bdpf" }, age_min_th:"r_age_adult", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2017-193"],
    label_note:"유지요법 1일 최대 4회 · MART 1회 1번 1일 2회 + 필요시, 1일 최대 8회(KATRD 표 4-6은 12회)" },
  { id:"asthma:prod:relvar100", v1_brand:"렐바 엘립타 100", label:"렐바 엘립타 100", kind:"inhaler", device:"DPI",
    ingredients:["drug:fluticasone","drug:vilanterol"], tags:["ics_laba"], ics:{ key:"drug:fluticasone|FF", ug:100, once:true },
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2016-66"], label_note:"1일 1회 · MART 불가(빌란테롤)" },
  { id:"asthma:prod:relvar200", v1_brand:"렐바 엘립타 200", label:"렐바 엘립타 200", kind:"inhaler", device:"DPI",
    ingredients:["drug:fluticasone","drug:vilanterol"], tags:["ics_laba"], ics:{ key:"drug:fluticasone|FF", ug:200, once:true },
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2016-66"], label_note:"1일 1회 · 천식 전용(COPD 적응 없음)" },
  { id:"asthma:prod:flutiform", v1_brand:"플루티폼 50·125·250", label:"플루티폼 50·125·250", kind:"inhaler", device:"pMDI",
    ingredients:["drug:fluticasone","drug:formoterol"], tags:["ics_laba"], ics:{ key:"drug:fluticasone|FP", strengths:[50,125,250] },
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2014-34"], label_note:"1회 2번 1일 2회 · 포르모테롤 함유하나 MART 미허가" },
  { id:"asthma:prod:atectura", v1_brand:"어텍트라 제뉴에어", label:"어택트라 브리즈헬러 150/80·160·320", kind:"inhaler", device:"DPI(캡슐)",
    ingredients:["drug:indacaterol","drug:mometasone"], tags:["ics_laba"], ics:{ key:"drug:mometasone", strengths:[80,160,320] },
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:ics_laba", notice:["notice:고시2021-234"], err:"asthma:err:AE17",
    label_note:"인다카테롤/모메타손 1일 1회 · MART 불가 · 급여: 성인·만 12세 이상 부분조절 이상" },
  { id:"asthma:prod:arnuity", v1_brand:"아뉴이티 엘립타 100·200", label:"아뉴이티 엘립타 100·200", kind:"inhaler", device:"DPI",
    ingredients:["drug:fluticasone"], tags:["ics"], ics:{ key:"drug:fluticasone|FF", strengths:[100,200], once:true },
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:general", notice:["notice:고시2018-28","notice:고시2013-127"], label_note:"ICS 단독 1일 1회 · 만 12세 이상" },
  { id:"asthma:prod:flixotide", v1_brand:"후릭소타이드 에보할러 50·125·250", label:"후릭소타이드 에보할러 50·125·250", kind:"inhaler", device:"pMDI",
    ingredients:["drug:fluticasone"], tags:["ics"], ics:{ key:"drug:fluticasone|FP", strengths:[50,125,250] },
    reimb:"asthma:reimb26:general", notice:["notice:고시2013-127"], label_note:"ICS 단독 pMDI · 스페이서 권장" },
  { id:"asthma:prod:enerzair", v1_brand:"에너제어 엘립타", label:"에너제어 브리즈헬러 150/50/80·160", kind:"inhaler", device:"DPI(캡슐)",
    ingredients:["drug:indacaterol","drug:glycopyrronium","drug:mometasone"], tags:["triple"], age_min_th:"r_age_adult",
    reimb:"asthma:reimb26:triple_asthma", notice:["notice:고시2021-234"], err:"asthma:err:AE9", label_note:"성인 천식 전용 삼제 1일 1회(인다카테롤/글리코피로니움/모메타손)" },
  { id:"asthma:prod:trelegy", v1_brand:"트렐리지 엘립타", label:"트렐리지 엘립타 100·200", kind:"inhaler", device:"DPI",
    ingredients:["drug:fluticasone","drug:umeclidinium","drug:vilanterol"], tags:["triple"], age_min_th:"r_age_adult",
    reimb:"asthma:reimb26:triple_asthma", notice:["notice:고시2024-37"], err:"asthma:err:AE8", label_note:"효능 2: 성인 ICS-LABA로 조절 안 되는 천식 유지(100·200, 1일 1회) — 트렐리지200은 천식용" },
  { id:"asthma:prod:trimbow", v1_brand:"트림보우", label:"트림보우 100/6/12.5", kind:"inhaler", device:"pMDI",
    ingredients:["drug:beclomethasone","drug:formoterol","drug:glycopyrronium"], tags:["triple"], age_min_th:"r_age_adult",
    reimb:"asthma:reimb26:triple_asthma", notice:["notice:고시2023-296"], err:"asthma:err:AE8", label_note:"효능 1: 성인 ICS-LABA로 조절 안 되고 반복 악화 이력 천식 · 1회 2번 1일 2회 · MART 아님" },
  { id:"asthma:prod:spiriva_rm", label:"스피리바 레스피맷", kind:"inhaler", device:"SMI",
    ingredients:["drug:tiotropium"], tags:["lama"], age_min_th:"r_age_child", reimb:"asthma:reimb26:tiotropium", notice:["notice:고시2022-56"], err:"asthma:err:AE10",
    label_note:"6세 이상 중증 악화 경험 중증 천식 유지 부가요법(ICS 병용)" },
  { id:"asthma:prod:saba", label:"살부타몰(벤토린) pMDI", kind:"reliever", device:"pMDI", ingredients:["drug:salbutamol"], tags:["saba"],
    reimb:"asthma:reimb26:general", notice:["notice:고시2013-127"] },
  { id:"asthma:prod:montelukast", label:"몬테루카스트 10 mg", kind:"oral", ingredients:["drug:montelukast"], tags:["ltra"],
    reimb:"asthma:reimb26:ltra", notice:["notice:고시2023-184"], err:"asthma:err:AE15", label_note:"신경정신 이상반응 경고" },
  { id:"asthma:prod:pranlukast", label:"프란루카스트", kind:"oral", ingredients:["drug:pranlukast"], tags:["ltra"], reimb:"asthma:reimb26:ltra", notice:["notice:고시2023-184"] },
  { id:"asthma:prod:theophylline", label:"테오필린 서방형", kind:"oral", ingredients:["drug:theophylline"], tags:["theo"], reimb:"asthma:reimb26:general", notice:[] },
  /* 생물학제제 */
  { id:"asthma:prod:xolair", label:"졸레어(오말리주맙)", kind:"biologic", ingredients:["drug:omalizumab"], tags:["biologic"], bio:"OMA",
    age_min_th:"r_age_child", reimb:"asthma:reimb26:oma", notice:["notice:고시2025-224"], err:"asthma:err:AE2",
    label_note:"알레르기성 천식 ≥12세(통년성 감작·FEV1 <80%·반복 악화) · 6–<12세(FEV1 요건 없음) · 용량 = 기저 IgE × 체중 표(2·4주)" },
  { id:"asthma:prod:omlyclo", label:"옴리클로(오말리주맙 바이오시밀러)", kind:"biologic", ingredients:["drug:omalizumab"], tags:["biologic"], bio:"OMA",
    age_min_th:"r_age_child", reimb:"asthma:reimb26:oma", notice:["notice:고시2025-224"], err:"asthma:err:AE14",
    label_note:"성분 고시(졸레어주사 등) 동일 적용 · PFS 0.3 g 2026-04 · 펜 0.15 g 2026-07 급여 등재" },
  { id:"asthma:prod:nucala_vial", label:"누칼라주(메폴리주맙, 바이알)", kind:"biologic", ingredients:["drug:mepolizumab"], tags:["biologic"], bio:"MEPO",
    age_min_th:"r_age_adult", reimb:"asthma:reimb26:il5", notice:["notice:고시2026-133"], err:"asthma:err:AE3", label_note:"급여 성인 · 100 mg 4주" },
  { id:"asthma:prod:nucala_ai", label:"누칼라오토인젝터주", kind:"biologic", ingredients:["drug:mepolizumab"], tags:["biologic"], bio:"MEPO",
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:il5", notice:["notice:고시2026-133"], err:"asthma:err:AE3", label_note:"급여 ≥12세 · 자가주사 투약일지 · 1회 처방 최대 4주(6개월 후 안정 시 8–12주)" },
  { id:"asthma:prod:cinqaero", label:"싱케어(레슬리주맙)", kind:"biologic", ingredients:["drug:reslizumab"], tags:["biologic"], bio:"RESL",
    age_min_th:"r_age_adult", reimb:"asthma:reimb26:resli", notice:["notice:고시2026-92"], err:"asthma:err:AE4", label_note:"3 mg/kg 정맥 4주" },
  { id:"asthma:prod:fasenra", label:"파센라(벤랄리주맙)", kind:"biologic", ingredients:["drug:benralizumab"], tags:["biologic"], bio:"BENRA",
    age_min_th:"r_age_adult", reimb:"asthma:reimb26:il5", notice:["notice:고시2026-92"], err:"asthma:err:AE5", label_note:"30 mg 4주 × 3회 → 8주" },
  { id:"asthma:prod:dupixent", label:"듀피젠트(두필루맙)", kind:"biologic", ingredients:["drug:dupilumab"], tags:["biologic"], bio:"DUPI",
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:dupi", notice:["notice:고시2026-159"], err:"asthma:err:AE6",
    label_note:"200·300 mg 2주 · OCS 의존 경로 급여는 300 mg 제품만 · 호산구 ≥1,500 이력은 비권장(KATRD)" },
  { id:"asthma:prod:tezspire", label:"테즈파이어(테제펠루맙)", kind:"biologic", ingredients:["drug:tezepelumab"], tags:["biologic"],
    age_min_th:"r_age_adol", reimb:"asthma:reimb26:tezepelumab", notice:[], err:"asthma:err:AE14", label_note:"허가 ≥12세 중증 천식 추가 유지 210 mg 4주(2023-12-21) · 급여 기준 없음" },
  { id:"asthma:prod:depemokimab", label:"데페모키맙", kind:"biologic", ingredients:["drug:depemokimab"], tags:["biologic"], kr_available:false,
    reimb:null, notice:[], err:"asthma:err:AE14", label_note:"GINA 2026 신규(≥12세 중증 호산구성, 26주 간격) · 국내 미허가" }
],
TAG_LABEL:{ air:"필요시 ICS-formoterol(AIR) 허가", mart:"MART 허가", ics_laba:"ICS-LABA", ics:"ICS 단독", triple:"ICS-LABA-LAMA 단일흡입기", lama:"LAMA", saba:"SABA", ltra:"LTRA", theo:"테오필린", biologic:"생물학제제" },

/* ---------- 급여 규칙 (WhenDSL) ---------- */
REIMB_2026:{
  "asthma:reimb26:general":{ id:"asthma:reimb26:general", title:"허가 범위 + 흡입제 일반원칙", fixed:"general", notice:["notice:고시2013-127"],
    notes:["허가 범위 내 급여 · 효능군별 2–3종 흡입제 병용 인정 · 분무용 용액은 흡입 곤란·응급 시만"] },
  "asthma:reimb26:ics_laba":{ id:"asthma:reimb26:ics_laba", title:"ICS/LABA 천식", err:"asthma:err:AE16",
    gate:{ op:"AND", conds:[
      { when:"!has_age || age >= prod_age_min", txt:"허가·급여 연령" },
      { when:"control_ng", txt:"부분조절 이상 단계(GINA 증상 4문항 1개 이상)" } ] },
    fallback:{ when:"on_ics_laba && (!has_age || age >= prod_age_min)", status:"cond", note:"현재 ICS-LABA로 조절 양호 — 유지하면서 3–6개월마다 평가 결과 기재" },
    notes:["3–6개월마다 평가 결과 차트 기재(폐기능검사 필수 아님)"] },
  "asthma:reimb26:triple_asthma":{ id:"asthma:reimb26:triple_asthma", title:"단일흡입기 삼제 — 천식 항목", err:"asthma:err:AE8",
    gate:{ op:"AND", conds:[
      { when:"age >= TH.r_age_adult", txt:"성인(만 {TH.r_age_adult}세 이상)" },
      { when:"on_ics_laba", txt:"ICS-LABA 병용 유지 중" },
      { when:"ics_medhigh", txt:"ICS 중간 또는 고용량" },
      { when:"exac >= TH.r_exac_1", txt:"12개월 내 중증 악화(전신 스테로이드 필요) {TH.r_exac_1}회 이상" } ] },
    notes:["에너제어 2021-234 · 트렐리지 2024-37 2항 · 트림보우 2023-296 2항 — 조건 동일"] },
  "asthma:reimb26:tiotropium":{ id:"asthma:reimb26:tiotropium", title:"티오트로피움 — 천식(다항)", err:"asthma:err:AE10",
    gate:{ op:"AND", conds:[
      { when:"on_ics_laba", txt:"ICS-LABA 병용 유지 중" },
      { when:"ics_high", txt:"ICS 고용량" },
      { when:"exac >= TH.r_exac_1", txt:"중증 악화 경험" } ] },
    notes:["가·나항은 COPD(FEV1 <80% / ≥80% 증상 미조절)"] },
  "asthma:reimb26:ltra":{ id:"asthma:reimb26:ltra", title:"류코트리엔 조절제", err:"asthma:err:AE15",
    gate:{ op:"OR", conds:[
      { op:"AND", label:"타 약제로 조절 안 되는 2단계 이상", conds:[
        { when:"on_controller", txt:"다른 천식 조절제 사용 중" },
        { when:"control_ng", txt:"조절 안 됨(4문항 1개 이상)" } ] },
      { when:"aerd", txt:"아스피린 민감성 천식(1차 투여 인정)" } ] },
    notes:["몬테루카스트+레보세티리진 복합제는 천식 동반 알레르기비염 조건 별도"] },
  "asthma:reimb26:oma":{ id:"asthma:reimb26:oma", title:"오말리주맙(성분 고시 — 졸레어·옴리클로)", err:"asthma:err:AE2",
    gate:{ op:"OR", conds:[
      { op:"AND", label:"만 {TH.r_age_adol}세 이상", conds:[
        { when:"age >= TH.r_age_adol", txt:"만 {TH.r_age_adol}세 이상", applies:true },
        { when:"high_ics_laba", txt:"고용량 ICS-LABA 사용 중" },
        { when:"on_lama", txt:"LAMA 병용 중" },
        { when:"ige >= TH.r_ige_ge", txt:"총 IgE ≥{TH.r_ige_ge} IU/mL" },
        { when:"perennial_sens", txt:"통년성 흡입 알레르겐 감작(in vitro 또는 피부반응)" },
        { when:"fev1 < TH.r_fev1_oma_lt", txt:"FEV1 <{TH.r_fev1_oma_lt}%" },
        { when:"exac >= TH.r_exac_oma", txt:"12개월 내 전신 스테로이드 필요 악화 ≥{TH.r_exac_oma}회" } ] },
      { op:"AND", label:"만 {TH.r_age_child}–{TH.r_age_adol}세 미만", conds:[
        { when:"age >= TH.r_age_child && age < TH.r_age_adol", txt:"만 {TH.r_age_child}세 이상 {TH.r_age_adol}세 미만", applies:true },
        { when:"high_ics_laba", txt:"고용량 ICS-LABA 사용 중(LAMA 요건 없음)" },
        { when:"ige >= TH.r_ige_ge", txt:"총 IgE ≥{TH.r_ige_ge} IU/mL" },
        { when:"perennial_sens", txt:"통년성 흡입 알레르겐 감작" },
        { when:"exac >= TH.r_exac_oma", txt:"12개월 내 전신 스테로이드 필요 악화 ≥{TH.r_exac_oma}회(FEV1 요건 없음)" } ] } ] },
    notes:["최초 {TH.r_oma_eval_wk}주 반응 평가 + 소견서 → 이후 {TH.r_eval_mo_lo}–{TH.r_eval_mo_hi}개월마다", "IL-5·IL-4R 제제 → 오말리주맙 교체 불인정"] },
  "asthma:reimb26:il5":{ id:"asthma:reimb26:il5", title:"메폴리주맙·벤랄리주맙", err:"asthma:err:AE1",
    gate:{ op:"AND", conds:[
      { when:"age >= prod_age_min", txt:"제품별 연령(누칼라주·파센라 성인 / 누칼라오토인젝터 ≥{TH.r_age_adol}세)" },
      { when:"high_ics_laba", txt:"고용량 ICS-LABA 사용 중" },
      { when:"on_lama", txt:"LAMA 병용 중" },
      { op:"OR", label:"호산구 + 악화/OCS", conds:[
        { op:"AND", label:"경로 1", conds:[
          { when:"eos >= TH.r_eos_300", txt:"12개월 내 호산구 ≥{TH.r_eos_300}/µL" },
          { op:"OR", conds:[
            { when:"exac >= TH.r_exac_4", txt:"악화 ≥{TH.r_exac_4}회" },
            { when:"ocs_dep", txt:"시작 6개월 전부터 프레드니솔론 ≥{TH.r_ocs_mg} mg/일 등가 OCS" } ] } ] },
        { op:"AND", label:"경로 2", conds:[
          { when:"eos >= TH.r_eos_400", txt:"12개월 내 호산구 ≥{TH.r_eos_400}/µL" },
          { when:"exac >= TH.r_exac_3", txt:"악화 ≥{TH.r_exac_3}회" } ] } ] } ] },
    notes:["투여 전·매 1년 평가: 악화 또는 OCS ≥{TH.r_resp_pct}% 감소 + 조절 + 소견서", "오말리주맙 {TH.r_eval_mo_lo}–{TH.r_eval_mo_hi}개월 후 효과 불충분·부작용·순응도 문제 시에만 교체 사례별 인정"] },
  "asthma:reimb26:resli":{ id:"asthma:reimb26:resli", title:"레슬리주맙", err:"asthma:err:AE1",
    gate:{ op:"AND", conds:[
      { when:"age >= TH.r_age_adult", txt:"성인" },
      { when:"high_ics_laba", txt:"고용량 ICS-LABA 사용 중" },
      { when:"on_lama", txt:"LAMA 병용 중" },
      { when:"eos_start >= TH.r_eos_400", txt:"치료 시작 시 호산구 ≥{TH.r_eos_400}/µL" },
      { when:"exac >= TH.r_exac_3", txt:"12개월 내 악화 ≥{TH.r_exac_3}회" } ] },
    notes:["매 1년 평가 · 오말리주맙에서만 조건부 교체"] },
  "asthma:reimb26:dupi":{ id:"asthma:reimb26:dupi", title:"두필루맙 — 천식 항목", err:"asthma:err:AE6",
    gate:{ op:"AND", conds:[
      { when:"age >= TH.r_age_adol", txt:"만 {TH.r_age_adol}세 이상" },
      { when:"high_ics_laba", txt:"고용량 ICS-LABA 사용 중" },
      { when:"on_lama", txt:"LAMA 병용 중" },
      { op:"OR", label:"T2 + 악화 또는 OCS 의존", conds:[
        { op:"AND", label:"경로 1", conds:[
          { op:"OR", conds:[
            { when:"eos >= TH.r_eos_150", txt:"12개월 내 호산구 ≥{TH.r_eos_150}/µL" },
            { when:"feno >= TH.r_feno_25", txt:"FeNO ≥{TH.r_feno_25} ppb(검사 비급여)" } ] },
          { when:"exac >= TH.r_exac_4", txt:"악화 ≥{TH.r_exac_4}회" } ] },
        { when:"ocs_dep", txt:"경로 2: 6개월 전부터 프레드니솔론 ≥{TH.r_ocs_mg} mg/일 OCS(300 mg 제품만)" } ] } ] },
    notes:["매 1년 평가, OCS 의존 경로는 {TH.r_dupi_ocs_eval_mo}개월마다", "1회 처방 최대 {TH.r_rx_wk}주(24주 후 안정 시 {TH.r_rx_stable_wk_lo}–{TH.r_rx_stable_wk_hi}주) · 투약일지"] },
  "asthma:reimb26:tezepelumab":{ id:"asthma:reimb26:tezepelumab", title:"테제펠루맙", fixed:"no", err:"asthma:err:AE14",
    notes:["HIRA 보험인정기준 고시 0건 → 급여 기준 없음(전액 본인부담)"] }
},
BIO_COMMON26:{
  not_met:"급여 미충족 → 100/100 전액 본인부담 경로(임의 비급여 아님)",
  combo:"생물학제제 간 병용 불인정",
  switch:"IL-5·IL-5R·IL-4R 제제 간 교체 불인정 · 오말리주맙 → 타 제제만 {TH.r_eval_mo_lo}–{TH.r_eval_mo_hi}개월 후 효과 불충분·부작용·순응도 문제 시 사례별 인정",
  lama_warn:"≥{TH.r_age_adol}세 모든 생물학제제는 '고용량 ICS-LABA와 LAMA 투여에도' 조절 안 될 때만 급여 — LAMA 미사용이면 체크리스트를 다 채워도 미충족(정정 AE1)"
},

/* ---------- 권고 레코드 ---------- */
REC_2026:[
  /* KATRD 2026 — 표 4-4(초기)·그림 4-3(단계) */
  { id:"asthma:rec26:kr_s1_pref", guideline:"gl:asthma:katrd-2026", cite:"표 4-4·그림 4-3", grade:"preferred", text:"1단계 1안: 필요시 저용량 ICS-formoterol(증상 시·운동 직전)" },
  { id:"asthma:rec26:kr_s1_alt", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"alternative", text:"1단계 2안: 필요시 SABA, 사용할 때마다 저용량 ICS 동시 사용" },
  { id:"asthma:rec26:kr_saba_only", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"not_recommended", text:"SABA 단독 치료" },
  { id:"asthma:rec26:kr_s2_pref", guideline:"gl:asthma:katrd-2026", cite:"표 4-4·그림 4-3", grade:"preferred", text:"2단계 1안: 필요시 저용량 ICS-formoterol",
    note:"국내 진료 실정: 2단계 조절제로 선택 시 순응도·경과 관찰·천식 적정성 평가에 불리할 수 있어 충분한 고려 필요(KATRD 단서)" },
  { id:"asthma:rec26:kr_s2_alt", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"alternative", text:"2단계 2안: 규칙적 저용량 ICS + 필요시 SABA(조절제 순응도 확인)" },
  { id:"asthma:rec26:kr_s2_other", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"other", text:"2단계 다른 치료: 설하면역치료, ICS 불가 시 LTRA(신경정신 부작용·ICS 대비 악화 위험↑)" },
  { id:"asthma:rec26:kr_s3_pref", guideline:"gl:asthma:katrd-2026", cite:"표 4-4·그림 4-3", grade:"preferred", text:"3단계 1안: 저용량 ICS(부데소니드·베클로메타손)-formoterol 유지-완화 병용(MART)" },
  { id:"asthma:rec26:kr_s3_alt", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"alternative", text:"3단계 2안: 저용량 ICS-LABA 유지 + 필요시 SABA" },
  { id:"asthma:rec26:kr_s3_other", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"other", text:"3단계 다른 치료: 중간용량 ICS, 저용량 ICS + LTRA 또는 서방형 테오필린(LABA보다 악화 위험↑), 설하면역치료(알레르기비염·집먼지진드기 감작·FEV1 >{TH.slit_fev1_gt}%)" },
  { id:"asthma:rec26:kr_s4_pref", guideline:"gl:asthma:katrd-2026", cite:"표 4-4·그림 4-3", grade:"preferred", text:"4단계 1안: 중간용량 ICS-formoterol MART" },
  { id:"asthma:rec26:kr_s4_alt", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"alternative", text:"4단계 2안: 중간용량 ICS-LABA 유지 + 필요시 SABA" },
  { id:"asthma:rec26:kr_s4_other", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"other", text:"4단계 다른 치료: LAMA 또는 LTRA 추가, 설하면역치료(조건 동일)" },
  { id:"asthma:rec26:kr_s5i_pref", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"preferred", text:"5단계(초기부터 조절 안 되는 중증) 1안: 중간용량 ICS-formoterol MART + 급성 악화에 준한 치료(단기 OCS 포함)" },
  { id:"asthma:rec26:kr_s5i_alt", guideline:"gl:asthma:katrd-2026", cite:"표 4-4", grade:"alternative", text:"5단계 초기 2안: 고용량 ICS 또는 중간용량 ICS-LABA + 필요시 SABA, 단기 OCS 포함" },
  { id:"asthma:rec26:kr_s5_pref", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"preferred", text:"5단계 1안: 전문가 의뢰 → 표현형 평가 후 생물학제제(항 IgE·항 IL-5/5R·항 IL-4Rα·항 TSLP) 고려" },
  { id:"asthma:rec26:kr_s5_high", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3·4단원", grade:"other", text:"고용량 ICS-LABA(또는 고용량 ICS-formoterol) — {TH.high_ics_months_lo}–{TH.high_ics_months_hi}개월 단기 시도(부신 억제 등)" },
  { id:"asthma:rec26:kr_s5_lama", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3·4단원", grade:"other", text:"중간·고용량 ICS-LABA로 조절 안 되면 LAMA 추가(티오트로피움 연무형 또는 단일흡입기 삼제) — 폐기능↑, OCS 필요 중증 악화 감소(과거 악화력에서 뚜렷), 증상·삶의 질 효과는 작음" },
  { id:"asthma:rec26:kr_s5_azithro", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3·4단원", grade:"other", text:"아지스로마이신 주 3회 추가(최소 {TH.azithro_months_ge}개월) — 객담 NTM·QTc·청력 확인" },
  { id:"asthma:rec26:kr_s5_ocs", guideline:"gl:asthma:katrd-2026", cite:"그림 4-3", grade:"other", text:"저용량 OCS(프레드니솔론 ≤{TH.ocs_low_max_mg} mg/일) — 최후 수단" },
  { id:"asthma:rec26:kr_stepdown", guideline:"gl:asthma:katrd-2026", cite:"표 4-5", grade:"recommended", text:"{TH.stepdown_months}개월 이상 조절 양호·폐기능 안정이면 단계 내림 · ICS 완전 중단은 비권고" },
  { id:"asthma:rec26:kr_check", guideline:"gl:asthma:katrd-2026", cite:"4단원", grade:"recommended", text:"단계 올리기 전 점검: 흡입 기법 → 순응도 → 위험인자 노출 → 동반질환 → 진단 재확인" },
  /* GINA 2026 — Box 4-6 등 */
  { id:"asthma:rec26:g_s12_air", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 1", grade:"preferred", loe:"A", text:"1–2단계: 필요시 저용량 ICS-formoterol(AIR)" },
  { id:"asthma:rec26:g_s1_icssaba", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 2", grade:"alternative", loe:"B", text:"1단계: SABA 사용할 때마다 ICS 함께" },
  { id:"asthma:rec26:g_icssaba_combo", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 2", grade:"alternative", loe:"B", text:"필요시 ICS-SABA 복합 흡입기(2026 신규) — 국내 미도입", kr_unavailable:true },
  { id:"asthma:rec26:g_s2_ics", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 2", grade:"alternative", loe:"A", text:"2단계: 매일 저용량 ICS + 필요시 SABA(또는 ICS-SABA)" },
  { id:"asthma:rec26:g_saba_only", guideline:"gl:asthma:gina-2026", cite:"4장", grade:"not_recommended", loe:"A", text:"SABA 단독 치료 — 천식 사망·응급 이용 증가" },
  { id:"asthma:rec26:g_s3_mart", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 1", grade:"preferred", loe:"A", text:"3단계: 저용량 ICS-formoterol MART" },
  { id:"asthma:rec26:g_s3_icslaba", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 2", grade:"alternative", loe:"A", text:"3단계: 저용량 ICS-LABA + 필요시 SABA" },
  { id:"asthma:rec26:g_s4_mart", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 1", grade:"preferred", loe:"B", text:"4단계: 중간용량 ICS-formoterol MART" },
  { id:"asthma:rec26:g_s4_icslaba", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Track 2", grade:"alternative", loe:"A", text:"4단계: 중간~고용량 ICS-LABA + 필요시 SABA" },
  { id:"asthma:rec26:g_s5_lama", guideline:"gl:asthma:gina-2026", cite:"Box 4-6 Step 5", grade:"preferred", loe:"A", text:"5단계: LAMA 추가(≥6세 별도 흡입기, ≥18세 단일흡입기 삼제, ≥12세 부데소니드-포르모테롤-글리코피로니움) — 폐기능 소폭↑·중증 악화 약 16–17%↓" },
  { id:"asthma:rec26:g_s5_bio", guideline:"gl:asthma:gina-2026", cite:"8장·Box 8-4", grade:"preferred", loe:"A", text:"5단계: 표현형 평가 → 생물학제제(항-IgE·항-IL-5/5R·항-IL-4Rα·항-TSLP)" },
  { id:"asthma:rec26:g_s5_azithro", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"consider", loe:"B", text:"전문가 의뢰 후 성인 아지스로마이신(≥{TH.azithro_months_ge}개월, NTM·QTc 확인)" },
  { id:"asthma:rec26:g_s5_ocs", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"consider", loe:"D", text:"저용량 OCS 유지 — 다른 방법이 모두 안 될 때만(장기 부작용 Evidence A)" },
  { id:"asthma:rec26:g_ltra", guideline:"gl:asthma:gina-2026", cite:"4장", grade:"consider", loe:"A", text:"LTRA는 ICS보다 효과 열세(특히 악화) — 몬테루카스트 신경정신 이상반응 경고" },
  { id:"asthma:rec26:g_slit", guideline:"gl:asthma:gina-2026", cite:"4장", grade:"consider", loe:"B", text:"집먼지진드기 감작 + 알레르기비염 + FEV1 >{TH.slit_fev1_gt}%: 설하면역치료 추가" },
  { id:"asthma:rec26:g_stepdown", guideline:"gl:asthma:gina-2026", cite:"Box 4-13", grade:"preferred", loe:"D", text:"저용량 MART로 조절 양호 → 필요시 ICS-formoterol로 단계 내림(저용량 ICS+SABA에서 내릴 때는 A)" },
  { id:"asthma:rec26:g_smoke", guideline:"gl:asthma:gina-2026", cite:"6장", grade:"preferred", loe:"A", text:"금연 상담·프로그램 연결, 간접흡연 회피(B)" },
  { id:"asthma:rec26:g_flu", guideline:"gl:asthma:gina-2026", cite:"6장", grade:"consider", loe:"C", text:"중등증~중증 천식 매년 인플루엔자 접종" },
  /* 생물학제제 */
  { id:"asthma:rec26:g_bio_oma", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"preferred", loe:"A", text:"항-IgE(오말리주맙, ≥6세 중증 알레르기성) — 바이오시밀러(omalizumab-igec) 2026 반영", drugs:["drug:omalizumab"] },
  { id:"asthma:rec26:g_bio_il5", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"preferred", loe:"A", text:"항-IL-5/5R(메폴리주맙 ≥6세·레슬리주맙 ≥18세·벤랄리주맙 ≥12세, 중증 호산구성)", drugs:["drug:mepolizumab","drug:reslizumab","drug:benralizumab"] },
  { id:"asthma:rec26:g_bio_depe", guideline:"gl:asthma:gina-2026", cite:"8장(2026 신규)", grade:"preferred", loe:"A", text:"데페모키맙(≥12세 중증 호산구성, 26주 간격) — 메폴리주맙 반응자 전환 고려 가능", drugs:["drug:depemokimab"] },
  { id:"asthma:rec26:g_bio_dupi", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"preferred", loe:"A", text:"항-IL-4Rα(두필루맙, ≥6세 호산구성/T2 또는 OCS 유지)", drugs:["drug:dupilumab"] },
  { id:"asthma:rec26:g_bio_teze", guideline:"gl:asthma:gina-2026", cite:"8장", grade:"preferred", loe:"A", text:"항-TSLP(테제펠루맙, ≥12세, 표현형 제한 없음 — 호산구·FeNO 높을수록 효과 큼)", drugs:["drug:tezepelumab"] },
  /* 급성 악화 */
  { id:"asthma:rec26:kr_ae_o2", guideline:"gl:asthma:katrd-2026", cite:"5단원", grade:"recommended", scope:"ae", text:"산소: SpO₂ {TH.spo2_kr_lo}–{TH.spo2_kr_hi}% 유지" },
  { id:"asthma:rec26:g_ae_o2", guideline:"gl:asthma:gina-2026", cite:"Box 9-4", grade:"preferred", loe:"B", scope:"ae", text:"산소: SpO₂ <{TH.spo2_gina_start_lt}%일 때만 시작, 목표 상한 {TH.spo2_gina_hi}%(조절 산소가 고농도보다 결과 양호)" },
  { id:"asthma:rec26:kr_ae_saba", guideline:"gl:asthma:katrd-2026", cite:"그림 5-1·5-2", grade:"recommended", scope:"ae", text:"SABA pMDI {TH.saba_puffs_lo}–{TH.saba_puffs_hi}회(스페이서) {TH.saba_q_min}분마다 × {TH.saba_rounds}회(1시간)" },
  { id:"asthma:rec26:g_ae_saba", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"preferred", loe:"A", scope:"ae", text:"반복 SABA 후 반응 재평가 — 2026: 과다 투여·젖산산증 경고로 용량 보수화" },
  { id:"asthma:rec26:g_ae_icsform", guideline:"gl:asthma:gina-2026", cite:"9장(2026 신규)", grade:"consider", scope:"ae", text:"경증 악화: SABA 대신 ICS-formoterol 선택 가능 — 퇴원 전 MART 시작 기회" },
  { id:"asthma:rec26:g_ae_epi", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"preferred", loe:"D", scope:"ae", text:"아나필락시스 동반 의심: 에피네프린 먼저(근주 또는 비강), 이후 기관지확장제" },
  { id:"asthma:rec26:g_ae_ipra", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"preferred", loe:"A", scope:"ae", text:"응급실 중등증~중증: SABA + ipratropium 병용 — 입원 감소(성인 A, 청소년·소아 B)" },
  { id:"asthma:rec26:kr_ae_ocs", guideline:"gl:asthma:katrd-2026", cite:"5단원", grade:"recommended", scope:"ae", text:"전신 스테로이드: 프레드니솔론 {TH.ocs_mgkg} mg/kg(최대 {TH.ocs_max_mg} mg), 귀가 시 {TH.ocs_days_lo}–{TH.ocs_days_hi}일" },
  { id:"asthma:rec26:g_ae_ocs", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"preferred", loe:"B", scope:"ae", text:"성인 프레드니솔론 {TH.pred_self_lo}–{TH.pred_self_hi} mg {TH.ocs_days_lo}–{TH.ocs_days_hi}일, 감량 없이 중단(B)" },
  { id:"asthma:rec26:g_ae_mg", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"consider", scope:"ae", text:"초기 치료에 반응 없는 중증: 정맥 황산마그네슘 {TH.mgso4_g} g 고려(분무 황산마그네슘은 이득 없음 B)" },
  { id:"asthma:rec26:g_ae_abx", guideline:"gl:asthma:gina-2026", cite:"9장", grade:"not_recommended", loe:"B", scope:"ae", text:"폐렴 등 세균 감염 근거 없으면 항생제 일상 투여 비권고" },
  { id:"asthma:rec26:kr_ae_dispo", guideline:"gl:asthma:katrd-2026", cite:"5단원", grade:"recommended", scope:"ae", text:"내원 시 폐기능 <{TH.pef_admit_lt}% 또는 치료 후 <{TH.pef_admit_post_lt}% 입원 · {TH.pef_admit_post_lt}–{TH.pef_dc_ge}% 위험인자 고려 · ≥{TH.pef_dc_ge}% 귀가" },
  { id:"asthma:rec26:kr_ae_dc", guideline:"gl:asthma:katrd-2026", cite:"5단원", grade:"recommended", scope:"ae", text:"퇴원: ICS 시작 또는 {TH.dc_ics_wk_lo}–{TH.dc_ics_wk_hi}주 증량, OCS {TH.ocs_days_lo}–{TH.ocs_days_hi}일, 흡입기 기술·서면 행동지침 교육" },
  { id:"asthma:rec26:g_ae_dc", guideline:"gl:asthma:gina-2026", cite:"9장·Box 9-5", grade:"preferred", loe:"B", scope:"ae", text:"퇴원: ICS 포함 치료, 가능하면 MART(B) — ICS 포함 약제는 사망·입원 감소(A), SABA 단독 퇴원 비권고" },
  { id:"asthma:rec26:kr_ae_selfmgmt", guideline:"gl:asthma:katrd-2026", cite:"표 5-3", grade:"recommended", loe:"B", scope:"ae", text:"자가관리: ICS {TH.ics_ae_mult}배 {TH.ics_ae_wk_lo}–{TH.ics_ae_wk_hi}주 증량(B) · PEF <{TH.self_pef_lt}% 또는 {TH.self_h}시간 무반응 → 프레드니솔론 {TH.pred_self_lo}–{TH.pred_self_hi} mg/일" }
],

/* ---------- 단계표 (KATRD 표 4-4 초기 · 그림 4-3 단계 · GINA Box 4-6) ---------- */
STEP_TABLE:[
  { step:1, id:"asthma:step26:s1", init_when:"sx_lt2m && !risk_any", init_txt:"증상 월 2회 미만 + 악화 위험인자 없음",
    t1:{ txt:"필요시 저용량 ICS-formoterol (AIR)", tags:["air"], recs:["asthma:rec26:kr_s1_pref","asthma:rec26:g_s12_air"] },
    t2:{ txt:"필요시 SABA + 사용할 때마다 저용량 ICS", tags:["ics","saba"], recs:["asthma:rec26:kr_s1_alt","asthma:rec26:g_s1_icssaba"] },
    other:["asthma:rec26:kr_saba_only","asthma:rec26:g_saba_only","asthma:rec26:g_icssaba_combo"] },
  { step:2, id:"asthma:step26:s2", init_when:"sx_ge2m || sx_lt2m", init_txt:"증상·완화제 필요 월 2회 이상(주 4–5일 미만) — 또는 월 2회 미만이라도 위험인자 있음",
    t1:{ txt:"필요시 저용량 ICS-formoterol (AIR)", tags:["air"], recs:["asthma:rec26:kr_s2_pref","asthma:rec26:g_s12_air"] },
    t2:{ txt:"매일 저용량 ICS + 필요시 SABA", tags:["ics"], recs:["asthma:rec26:kr_s2_alt","asthma:rec26:g_s2_ics"] },
    other:["asthma:rec26:kr_s2_other","asthma:rec26:g_ltra","asthma:rec26:g_icssaba_combo"] },
  { step:3, id:"asthma:step26:s3", init_when:"sx_most || sx_daily || night_waking || low_lung", init_txt:"거의 매일 증상 또는 주 1회 이상 야간 각성 또는 낮은 폐기능",
    t1:{ txt:"저용량 ICS-formoterol MART", tags:["mart"], ics:"low", recs:["asthma:rec26:kr_s3_pref","asthma:rec26:g_s3_mart"] },
    t2:{ txt:"저용량 ICS-LABA + 필요시 SABA", tags:["ics_laba"], ics:"low", recs:["asthma:rec26:kr_s3_alt","asthma:rec26:g_s3_icslaba"] },
    other:["asthma:rec26:kr_s3_other","asthma:rec26:g_slit"] },
  { step:4, id:"asthma:step26:s4", init_when:"(sx_daily || night_waking) && (low_lung || exac >= TH.r_exac_1)", init_txt:"매일 증상 또는 주 1회 이상 야간 각성 + 낮은 폐기능 또는 최근 악화",
    t1:{ txt:"중간용량 ICS-formoterol MART", tags:["mart"], ics:"medium", recs:["asthma:rec26:kr_s4_pref","asthma:rec26:g_s4_mart"] },
    t2:{ txt:"중간용량 ICS-LABA + 필요시 SABA", tags:["ics_laba"], ics:"medium", recs:["asthma:rec26:kr_s4_alt","asthma:rec26:g_s4_icslaba"] },
    other:["asthma:rec26:kr_s4_other","asthma:rec26:g_slit"] },
  { step:5, id:"asthma:step26:s5", init_when:"initial_severe", init_txt:"초기부터 조절되지 않는 중증(급성 악화 수준)",
    t1_init:{ txt:"중간용량 ICS-formoterol MART + 단기 OCS(급성 악화에 준함)", tags:["mart"], ics:"medium", recs:["asthma:rec26:kr_s5i_pref","asthma:rec26:g_s4_mart"] },
    t2_init:{ txt:"고용량 ICS 또는 중간용량 ICS-LABA + 필요시 SABA, 단기 OCS", tags:["ics_laba"], ics:"medium", recs:["asthma:rec26:kr_s5i_alt"] },
    t1:{ txt:"전문가 의뢰 → 표현형 평가 → 생물학제제 / LAMA 추가", tags:["triple","lama"], recs:["asthma:rec26:kr_s5_pref","asthma:rec26:g_s5_bio","asthma:rec26:g_s5_lama"] },
    t2:{ txt:"고용량 ICS-LABA 단기 시도 또는 LAMA 추가 · 의뢰", tags:["triple","lama"], recs:["asthma:rec26:kr_s5_high","asthma:rec26:kr_s5_lama"] },
    other:["asthma:rec26:kr_s5_azithro","asthma:rec26:g_s5_azithro","asthma:rec26:kr_s5_ocs","asthma:rec26:g_s5_ocs"] }
],
INIT_ORDER:[5,4,3,1,2],
CURRENT_STEP_AIR:2,
STATUS_ORDER:{ ok:0, cond:1, general:2, unmet:2, no:3, na:4 },
ADVICE:[
  { rec:"asthma:rec26:kr_check", when:"act_up" },
  { rec:"asthma:rec26:kr_stepdown", when:"act_down" },
  { rec:"asthma:rec26:g_stepdown", when:"act_down" },
  { rec:"asthma:rec26:kr_saba_only", when:"on_saba && !on_controller" },
  { rec:"asthma:rec26:g_saba_only", when:"on_saba && !on_controller" },
  { rec:"asthma:rec26:g_smoke", when:"smoker" },
  { rec:"asthma:rec26:g_flu", when:"ics_medhigh || step_view >= 4" }
],
SWITCH_MART_WHEN:"act_up && on_ics_laba && !(on_formoterol_ics && use_mode == mart) && cur_step >= 3 && cur_step <= 4",
BIO_ON_WHEN:"bio_eval || on_biologic || (high_ics_laba && (control_ng || exac >= TH.r_exac_1)) || (step_view >= 5 && is_followup && (control_ng || exac >= TH.r_exac_1))",
/* 현재 치료 → 단계 추정 (첫 매칭) */
CURRENT_STEP:[
  { when:"on_biologic || (on_ics_laba && on_lama)", step:5 },
  { when:"on_ics_laba && (ics_high || ics_medium)", step:4 },
  { when:"on_ics_laba", step:3 },
  { when:"on_ics && (ics_medium || ics_high)", step:3 },
  { when:"on_ics", step:2 },
  { when:"on_ltra || on_theo", step:2 },
  { when:"on_saba", step:1 },
  { when:"true", step:0 }
],
LOWER_STEP_NOTE:"현재 단계는 제품 구성·ICS 용량으로 추정한 값 — MART·AIR 사용 방식은 입력으로 보정",

/* ---------- MART (KATRD 표 4-6 · GINA Box 4-8) ---------- */
MART:{
  rows:[
    { id:"bf200", label:"부데소니드-포르모테롤 200/6 [160/4.5] DPI·pMDI", s12:"필요시 1회", s3:"1회 × 2/일(또는 1/일) + 필요시 1회", s45:"2회 × 2/일 + 필요시 1회", kr_max:12 },
    { id:"bf100", label:"부데소니드-포르모테롤 pMDI 100/3 [80/2.25]", s12:"필요시 2회", s3:"2회 × 2/일(또는 1/일) + 필요시 2회", s45:"4회 × 2/일 + 필요시 2회", kr_max:24 },
    { id:"bdpf", label:"베클로메타손-포르모테롤 100/6 pMDI·DPI", s12:"필요시 1회", s3:"1회 × 2/일(또는 1/일) + 필요시 1회", s45:"2회 × 2/일 + 필요시 1회", kr_max:12 }
  ],
  note:"ICS-formoterol MART 사용자는 비-formoterol ICS-LABA 조절제와 병용하지 않는다(KATRD 4단원) · GINA 2026은 '1일 최대'를 '24시간 내 일정 횟수 초과 시 진료' 안내로 바꿈(Box 9-2)"
},

/* ---------- 생물학제제 반응 예측 (KATRD 그림 6-2 · GINA Box 8-4) ---------- */
BIO_PRED:{
  "drug:omalizumab":"좋은 반응: 호산구 ≥{TH.eos_oma_pred_ge} · FeNO ≥{TH.feno_oma_pred_ge} · 알레르겐 노출 연관 증상 · 소아기 발병 · 첫 3회 투여 후 2시간 관찰(아나필락시스 0.1–0.2%)",
  "drug:mepolizumab":"좋은 반응: 호산구 높을수록 · 지난해 악화 많을수록 · 성인 발병 · 비용종 · OCS 유지",
  "drug:reslizumab":"좋은 반응: 호산구 높을수록 · 악화 많을수록 · 성인 발병 · 비용종 (정맥, 체중 기반)",
  "drug:benralizumab":"좋은 반응: 호산구 높을수록 · 악화 많을수록 · 성인 발병 · 비용종 · OCS 유지",
  "drug:dupilumab":"좋은 반응: 호산구↑·FeNO↑ · 비용종·아토피피부염 동반 · OCS 의존 — 호산구 ≥{TH.eos_dupi_avoid_ge} 이력은 비권장",
  "drug:tezepelumab":"T2 바이오마커가 낮아도 고려 — 호산구·FeNO 높을수록 효과 큼",
  "drug:depemokimab":"메폴리주맙 반응자에서 전환 고려 가능(벤랄리주맙 반응자는 근거 부족)"
},
BIO_EVAL:"반응 평가는 최소 {TH.bio_eval_months}개월 후, 이후 {TH.bio_reeval_mo_lo}–{TH.bio_reeval_mo_hi}개월마다(KATRD 그림 6-2)",

/* ---------- 검사 급여 ---------- */
TESTS_PAY:[
  { lab:"lab:fev1", name:"폐활량·기관지확장제 반응", pay:"급여", cut:"FEV1 ≥{TH.bdr_pct_ge}% 그리고 ≥{TH.bdr_ml_ge} mL 증가 = 양성" },
  { lab:null, name:"메타콜린 유발", pay:"급여", cut:"진단 시" },
  { lab:"lab:feno", name:"FeNO", pay:"비급여", cut:"≥{TH.feno_t2_ge} ppb T2 시사 · 두필루맙 급여 기준에 쓰이지만 검사 자체는 비급여",
    src:"사용자 현장 확인(2026-11-07) + HIRA 보험인정기준 급여기준 없음", confirmed:true },
  { lab:"lab:eos", name:"혈중 호산구", pay:"급여", cut:"{TH.eos_t2_ge} / {TH.eos_il5_ge} / {TH.r_eos_400} — 생물학제제 급여 연동 · OCS 사용 시 억제" },
  { lab:"lab:ige_total", name:"총 IgE·특이 IgE·피부단자", pay:"급여", cut:"총 IgE ≥{TH.ige_oma_ge} — 오말리주맙 진입·용량" }
],

/* ---------- 급성 악화 중증도 (KATRD 표 5-4) — 첫 매칭 ---------- */
AE_SEVERITY:[
  { id:"fatal", label:"치명적 발작", when:"ae_drowsy || ae_silent", txt:"의식 장애 · 호흡음 소실 → 즉시 ICU 연계" },
  { id:"severe", label:"중증", when:"ae_talk_words || rr > TH.ae_rr_gt || hr > TH.ae_hr_gt || spo2 < TH.ae_spo2_lo || pef <= TH.ae_pef_le",
    txt:"단어로 말함 · 호흡수 >{TH.ae_rr_gt} · 맥박 >{TH.ae_hr_gt} · SpO₂ <{TH.ae_spo2_lo}% · PEF ≤{TH.ae_pef_le}%" },
  { id:"mild_mod", label:"경증·중등증", when:"true", txt:"문장으로 말함 · 맥박 {TH.ae_hr_lo}–{TH.ae_hr_gt} · SpO₂ {TH.ae_spo2_lo}–{TH.ae_spo2_hi}% · PEF >{TH.ae_pef_le}%" }
],
AE_DISPO:[
  { id:"admit", when:"has_pef && pef < TH.pef_admit_lt", txt:"내원 시 폐기능 <{TH.pef_admit_lt}% → 입원 기준(KATRD)" },
  { id:"reassess", when:"true", txt:"초기 치료 1시간 후 재평가 — 치료 후 <{TH.pef_admit_post_lt}% 입원 · {TH.pef_admit_post_lt}–{TH.pef_dc_ge}% 위험인자 고려 · ≥{TH.pef_dc_ge}% 귀가" }
],

/* ---------- 입력 정의 (플로우) ---------- */
INPUTS:[
  { k:"age", grp:"base", type:"number", label:"나이", unit:"세" },
  { k:"smoker", grp:"base", type:"chip", label:"현재 흡연" },
  { k:"pregnant", grp:"base", type:"chip", label:"임신" },
  { k:"aerd", grp:"base", type:"chip", label:"아스피린·NSAID 과민(AERD)" },
  { k:"allergic_rhinitis", grp:"base", type:"chip", label:"알레르기비염" },
  { k:"nasal_polyps", grp:"base", type:"chip", label:"비용종" },
  { k:"ics_level", grp:"tx", type:"select", label:"ICS 용량 단계", opts:[["auto","자동(제품·흡입 횟수)"],["none","ICS 없음"],["low","저용량"],["medium","중간용량"],["high","고용량"]] },
  { k:"ics_puffs_day", grp:"tx", type:"number", label:"ICS 제품 1일 흡입 횟수(자동 산정용)", unit:"회" },
  { k:"use_mode", grp:"tx", type:"select", label:"ICS-formoterol 사용 방식", opts:[["maint","유지 + 별도 완화제"],["mart","MART(유지 + 완화 겸용)"],["air","필요시만(AIR)"]] },
  { k:"adherence_ok", grp:"tx", type:"chip", label:"순응도 확인됨" },
  { k:"technique_ok", grp:"tx", type:"chip", label:"흡입 기술 확인됨" },
  { k:"sx_freq", grp:"sx", type:"select", label:"증상 빈도(지난 4주)", opts:[["lt2m","월 2회 미만"],["ge2m","월 2회 이상 · 주 4–5일 미만"],["most","거의 매일"],["daily","매일"]] },
  { k:"night_waking", grp:"sx", type:"chip", label:"주 1회 이상 야간 각성" },
  { k:"g4_day", grp:"sx", type:"chip", label:"주간 증상 주 2회 초과" },
  { k:"g4_night", grp:"sx", type:"chip", label:"천식으로 야간 각성" },
  { k:"g4_reliever", grp:"sx", type:"chip", label:"완화제 주 2회 초과(운동 전 제외)" },
  { k:"g4_limit", grp:"sx", type:"chip", label:"천식으로 활동 제한" },
  { k:"stable_3m", grp:"sx", type:"chip", label:"3개월 이상 조절 양호 유지" },
  { k:"initial_severe", grp:"sx", type:"chip", label:"초기부터 조절 안 되는 중증(급성 악화 수준)" },
  { k:"fev1", grp:"sx", type:"number", label:"FEV1", unit:"%예측치" },
  { k:"low_lung", grp:"sx", type:"chip", label:"낮은 폐기능(판단)" },
  { k:"exac", grp:"risk", type:"number", label:"12개월 내 전신 스테로이드 필요 악화", unit:"회" },
  { k:"hosp", grp:"risk", type:"number", label:"12개월 내 입원·응급실", unit:"회" },
  { k:"ocs_mg", grp:"risk", type:"number", label:"유지 OCS(프레드니솔론 등가)", unit:"mg/일" },
  { k:"ocs_months", grp:"risk", type:"number", label:"유지 OCS 기간", unit:"개월" },
  { k:"eos", grp:"bio", type:"number", label:"혈중 호산구(12개월 내 최고)", unit:"/µL" },
  { k:"eos_start", grp:"bio", type:"number", label:"호산구(생물학제제 시작 시점, 없으면 위 값)", unit:"/µL" },
  { k:"feno", grp:"bio", type:"number", label:"FeNO(비급여)", unit:"ppb" },
  { k:"ige", grp:"bio", type:"number", label:"총 IgE", unit:"IU/mL" },
  { k:"perennial_sens", grp:"bio", type:"chip", label:"통년성 알레르겐 감작" },
  { k:"bio_eval", grp:"bio", type:"chip", label:"생물학제제 검토" }
],
AE_INPUTS:[
  { k:"ae_on", type:"chip", label:"급성 악화로 내원" },
  { k:"ae_talk", type:"select", label:"말하기", opts:[["sentences","문장"],["words","단어"]] },
  { k:"rr", type:"number", label:"호흡수", unit:"/분" },
  { k:"hr", type:"number", label:"맥박", unit:"/분" },
  { k:"spo2", type:"number", label:"SpO₂(대기)", unit:"%" },
  { k:"pef", type:"number", label:"PEF 또는 FEV1", unit:"%" },
  { k:"ae_drowsy", type:"chip", label:"의식 저하" },
  { k:"ae_silent", type:"chip", label:"호흡음 소실" },
  { k:"ae_anaphylaxis", type:"chip", label:"아나필락시스 의심" }
],
INPUT_GROUPS:[ ["base","기본"], ["tx","현재 치료"], ["sx","증상·조절(지난 4주)"], ["risk","위험·악화"], ["bio","바이오마커·생물학제제"] ],

/* ---------- 상충 ---------- */
CONFLICTS:[
  { id:"asthma:conf26:bio_high_ics", x:"생물학제제 — ICS 용량", when:"bio_on && !ics_high",
    gl:"GINA·임상시험: 중간~고용량 ICS-LABA에도 조절 안 되면 생물학제제 대상(KATRD 표 6-2 주1)", reimb:"급여: 모든 제제 '고용량' ICS-LABA 필수" },
  { id:"asthma:conf26:bio_exac_n", x:"생물학제제 — 악화 횟수", when:"bio_on && exac >= TH.r_exac_oma && exac < TH.r_exac_4",
    gl:"임상시험·KATRD: 연 2회 악화 수준에서 효과 입증(주2)", reimb:"급여: IL-5 계열 3–4회 · 두필루맙 4회(오말리주맙만 2회)" },
  { id:"asthma:conf26:bio_lama_first", x:"생물학제제 — LAMA 선행", when:"bio_on && !on_lama && age >= TH.r_age_adol",
    gl:"KATRD 주3: LAMA 선행은 T2 경로와 무관해 적시 투여를 늦춤", reimb:"급여: ≥{TH.r_age_adol}세 전 제제 LAMA 병용 중이어야 함" },
  { id:"asthma:conf26:bio_switch", x:"생물학제제 — 교체", when:"on_biologic",
    gl:"GINA 2026: 반응에 따라 전환 고려(예: 메폴리주맙 → 데페모키맙)", reimb:"급여: IL-5/IL-5R/IL-4R 간 교체 불인정, 오말리주맙 → 타 제제만 조건부" },
  { id:"asthma:conf26:tezepelumab", x:"테제펠루맙", when:"bio_on",
    gl:"GINA A·KATRD: 표현형 무관 중증 천식 생물학제제", reimb:"허가 ≥{TH.r_age_adol}세 있음 · 급여 기준 없음" },
  { id:"asthma:conf26:depemokimab", x:"데페모키맙", when:"bio_on && eos >= TH.eos_il5_ge",
    gl:"GINA 2026 A: ≥12세 중증 호산구성, 26주 간격", reimb:"국내 미허가" },
  { id:"asthma:conf26:air_mild", x:"경증(1–2단계) 필요시 ICS-formoterol — 급여 조건", when:"step_view <= 2 && !control_ng",
    gl:"KATRD·GINA: 1–2단계 선호 치료는 필요시 저용량 ICS-formoterol(GINA A) — KATRD도 국내 순응도·적정성 평가 영향을 단서로 둠", reimb:"급여: ICS/LABA 복합제는 '부분조절 이상 단계' 천식에서 인정(+3–6개월 평가 기재) — 조절 양호 경증의 AIR 단독은 기준 밖일 수 있음" },
  { id:"asthma:conf26:ics_saba", x:"ICS-SABA 복합 흡입기", when:"step_view <= 2",
    gl:"GINA 2026 Track 2 필요시 ICS-SABA(B)", reimb:"국내 미도입 — 대안은 SABA 사용 때마다 ICS 별도 흡입" },
  { id:"asthma:conf26:mart_max", x:"MART 1일 최대 흡입", when:"mart_shown",
    gl:"KATRD 표 4-6·GINA: 부데소니드·베클로메타손-포르모테롤 MART 1일 최대 12회", reimb:"허가: 포스터 8회 · 심비코트 터부헬러 8회(예외적 일시 12회) — 허가 초과 주의" },
  { id:"asthma:conf26:triple_mild", x:"LAMA 추가 — 급여 조건", when:"lama_shown && !lama_reimb_ok",
    gl:"KATRD·GINA: 중간용량 이상 ICS-LABA로 조절 안 되면 LAMA 추가", reimb:"급여: 삼제 = 성인 + 중간·고용량 ICS-LABA + 12개월 내 중증 악화 ≥1회 · 티오트로피움 = 고용량 + 중증 악화" },
  { id:"asthma:conf26:o2_target", x:"급성 악화 산소 목표(지침 간)", when:"ae_on",
    gl:"KATRD 2026: SpO₂ {TH.spo2_kr_lo}–{TH.spo2_kr_hi}% 유지", reimb:"GINA 2026: SpO₂ <{TH.spo2_gina_start_lt}%에서만 시작, 상한 {TH.spo2_gina_hi}%", kind:"gl_gl" },
  { id:"asthma:conf26:feno", x:"FeNO", when:"bio_on || has_feno",
    gl:"KATRD·GINA: T2 평가·생물학제제 선택에 사용, 두필루맙 급여 기준(≥{TH.r_feno_25} ppb)에도 포함", reimb:"FeNO 검사 비급여(현장 확인 2026-11-07)" }
],

/* ---------- v1 정정 ---------- */
ERRATA:[
  { id:"asthma:err:AE1", kind:"erratum", topic:["biologic"], title:"생물학제제 공통 전제 — LAMA 필수", v1:"고용량 ICS-LABA(±LAMA), 체크리스트에 LAMA 없음", now:"≥12세 전 제제 '고용량 ICS-LABA와 LAMA 투여에도' — LAMA 미사용이면 미충족(오말리주맙 6–<12세만 예외)" },
  { id:"asthma:err:AE2", kind:"erratum", topic:["biologic"], title:"오말리주맙 기준", v1:"소아 IgE ≥200 · FEV1 <80% 전 연령 · 1년마다 재평가 · 2020.7", now:"고시 2025-224(2026-01-01): 소아도 IgE ≥76 · 소아 FEV1 요건 없음 · 16주 평가 + 소견서 → 3–6개월마다" },
  { id:"asthma:err:AE3", kind:"erratum", topic:["biologic"], title:"메폴리주맙 연령·OCS", v1:"만 12세 이상 · OCS 용량 없음 · 2026.5", now:"고시 2026-133(2026-07-01): 누칼라주 성인 · 오토인젝터 ≥12세 · 프레드니솔론 ≥5 mg/일 등가 6개월" },
  { id:"asthma:err:AE4", kind:"guideline_update", topic:["biologic"], title:"레슬리주맙 고시", v1:"2023.11", now:"고시 2026-92(2026-05-01)" },
  { id:"asthma:err:AE5", kind:"guideline_update", topic:["biologic"], title:"벤랄리주맙 고시", v1:"2024.7", now:"고시 2026-92(2026-05-01)" },
  { id:"asthma:err:AE6", kind:"erratum", topic:["biologic"], title:"두필루맙 OCS 경로", v1:"OCS 지속(용량 없음) · 1년 재평가 · 2025.1", now:"고시 2026-159(2026-08-01): 프레드니솔론 ≥5 mg/일 6개월, 300 mg만 · OCS 의존은 6개월마다 평가" },
  { id:"asthma:err:AE7", kind:"erratum", topic:["biologic"], title:"재평가 주기 일반화", v1:"1년마다 공통 재평가", now:"제제별: 오말리주맙 16주 → 3–6개월 · IL-5 계열 매 1년 · 두필루맙 OCS 의존 6개월 + 소견서" },
  { id:"asthma:err:AE8", kind:"erratum", topic:["inhaler"], title:"트렐리지·트림보우 천식", v1:"'COPD 적응, 천식 처방 시 삭감 주의'", now:"둘 다 성인 천식 허가 + 천식 급여 항목(2024-37 2항·2023-296 2항): 중간·고용량 ICS-LABA + 12개월 내 중증 악화 ≥1회" },
  { id:"asthma:err:AE9", kind:"erratum", topic:["inhaler","tracks"], title:"에너제어 성분", v1:"FF/우메클리디늄/빌란테롤, 엘립타", now:"인다카테롤/글리코피로니움/모메타손, 브리즈헬러 캡슐 · 고시 2021-234: 성인 + 중간·고용량 ICS-LABA + 중증 악화 ≥1회" },
  { id:"asthma:err:AE10", kind:"erratum", topic:["inhaler"], title:"LAMA 천식 급여", v1:"LAMA 단독은 COPD 허가 → 천식 삭감", now:"스피리바 레스피맷 6세↑ 중증 천식 부가 허가 · 고시 2022-56 다항: 고용량 ICS-LABA + 중증 악화 경험" },
  { id:"asthma:err:AE11", kind:"info", topic:["inhaler","tracks"], title:"MART 1일 최대", v1:"심비코트 8회(일시 12회)만 기재", now:"포스터 허가 MART 최대 8회 추가 · KATRD 표 4-6은 12회 → 상충 표시" },
  { id:"asthma:err:AE12", kind:"guideline_update", topic:["exac"], title:"급성 악화 수치", v1:"SpO₂ ≥90% · 프레드니솔론 30–50 mg × 3–7일 · PEF 60–80/<60/<30", now:"KATRD 2026: SpO₂ 93–95% · 1 mg/kg(최대 50) · 귀가 5–7일 · 표 5-4(PEF >50/≤50) / GINA 2026: <92%에서만 산소·상한 95% · 감량 불필요 · 경증 악화 ICS-formoterol · 아나필락시스 시 에피네프린 우선" },
  { id:"asthma:err:AE13", kind:"guideline_update", topic:["all"], title:"근거 레이어", v1:"대한천식알레르기학회·GINA(연도 없음)", now:"KATRD 2026 6차 + GINA 2026" },
  { id:"asthma:err:AE14", kind:"info", topic:["biologic","pheno"], title:"생물학제제 신규 정보", v1:"5종 · 테제펠루맙 '비급여'만", now:"테즈파이어 ≥12세 허가·급여 기준 없음 · 데페모키맙 국내 미허가 · 옴리클로(오말리주맙 바이오시밀러) 허가·급여 등재" },
  { id:"asthma:err:AE15", kind:"erratum", topic:["tracks"], title:"LTRA 급여 조건", v1:"명시 없음", now:"고시 2023-184: 타 약제로 조절 안 되는 2단계 이상 · 아스피린 민감성 천식 1차 인정" },
  { id:"asthma:err:AE16", kind:"erratum", topic:["inhaler"], title:"ICS/LABA 천식 급여 기재", v1:"'부분조절 이상' 기재(폐기능 불필요)", now:"부분조절 이상 + 3–6개월마다 평가 결과 기재(2016-66·2015-184·2017-193·2014-34·2021-234)" },
  { id:"asthma:err:AE17", kind:"erratum", topic:["inhaler"], title:"어텍트라 성분·기기", v1:"부데소니드/포르모테롤, 제뉴에어", now:"어택트라 브리즈헬러 = 인다카테롤/모메타손 흡입용캡슐(1일 1회, MART 불가) · 고시 2021-234: 성인·만 12세 이상 부분조절 이상 + 3–6개월 평가" },
  { id:"asthma:err:AE18", kind:"guideline_update", topic:["tracks"], title:"단계 진입 증상 기준", v1:"주 1–2일 이하 / 주 3–5일 미만 / 대부분 / 매일", now:"KATRD 표 4-4: 월 2회 미만(+위험인자 없음) / 월 2회 이상 / 거의 매일 또는 주 1회↑ 야간 각성·낮은 폐기능 / 매일 + 낮은 폐기능·최근 악화" }
],
TOPIC_ERRATA:{ inhaler:["asthma:err:AE8","asthma:err:AE9","asthma:err:AE10","asthma:err:AE11","asthma:err:AE16","asthma:err:AE17"],
  biologic:["asthma:err:AE1","asthma:err:AE2","asthma:err:AE3","asthma:err:AE4","asthma:err:AE5","asthma:err:AE6","asthma:err:AE7","asthma:err:AE14"],
  tracks:["asthma:err:AE9","asthma:err:AE11","asthma:err:AE15","asthma:err:AE18"], exac:["asthma:err:AE12"], pheno:["asthma:err:AE14"], monitor:[] },
/* v1 R-CHECK 모달 보강 (v1 BIOLOGICS id → 고시·정정) */
BIO_V1_PATCH:{
  OMA:{ drug:"drug:omalizumab", notice:"notice:고시2025-224", err:"asthma:err:AE2" },
  MEPO:{ drug:"drug:mepolizumab", notice:"notice:고시2026-133", err:"asthma:err:AE3" },
  RESL:{ drug:"drug:reslizumab", notice:"notice:고시2026-92", err:"asthma:err:AE4" },
  BENRA:{ drug:"drug:benralizumab", notice:"notice:고시2026-92", err:"asthma:err:AE5" },
  DUPI:{ drug:"drug:dupilumab", notice:"notice:고시2026-159", err:"asthma:err:AE6" }
},

/* ---------- 도서관 ---------- */
LIB:{
  concepts:[
    "근거 레이어: KATRD 천식 진료지침 2026 6차(2026-06-30, GINA 2025 수용 개작) + GINA 2026 — 권고 위치(1안·2안·다른 치료)와 GINA Evidence를 함께 표시",
    "초기 단계 기준: 월 2회 미만 / 월 2회 이상 / 거의 매일·야간 각성·낮은 폐기능 / 매일 + 낮은 폐기능·최근 악화 / 초기 중증(KATRD 표 4-4)",
    "1안(ICS-formoterol AIR·MART)이 선호, SABA 단독은 비권고 — 국내는 2단계 AIR 선택 시 순응도·적정성 평가 고려 단서",
    "5단계: 전문가 의뢰 → 표현형 → 생물학제제가 1안, LAMA·고용량 ICS-LABA 단기·아지스로마이신·저용량 OCS는 다른 치료",
    "생물학제제 급여: ≥12세 모두 고용량 ICS-LABA + LAMA 필수 · 오말리주맙 고시 2025-224 개정(소아 IgE ≥76, 16주 평가) · 테제펠루맙 비급여 · 데페모키맙 미허가",
    "천식 삼제: 에너제어·트렐리지·트림보우 모두 성인 + 중간·고용량 ICS-LABA + 중증 악화 ≥1회에 급여",
    "급성 악화: KATRD SpO₂ 93–95% 유지 ⟷ GINA 2026 <92%에서만 시작·상한 95% · 프레드니솔론 1 mg/kg(최대 50) 5–7일 · 퇴원 시 ICS 포함(가능하면 MART)",
    "FeNO 검사는 비급여(현장 확인) — 두필루맙 급여 기준에는 쓰임"
  ]
},
SIM_CASES:[
  { id:"asthma:sim26:c1", title:"신규 성인 · 증상 월 1회", input:{ age:34, sx_freq:"lt2m", products:[] } },
  { id:"asthma:sim26:c2", title:"렐바100 부분조절 · 지난해 OCS 악화 1회", input:{ age:52, products:["asthma:prod:relvar100","asthma:prod:saba"], ics_level:"medium", g4_day:true, g4_reliever:true, exac:1, adherence_ok:true, technique_ok:true, fev1:74 } },
  { id:"asthma:sim26:c3", title:"고용량 ICS-LABA + LAMA · 호산구 450 · OCS 악화 3회", input:{ age:58, products:["asthma:prod:relvar200","asthma:prod:spiriva_rm"], ics_level:"high", g4_day:true, g4_night:true, g4_reliever:true, exac:3, eos:450, feno:38, ige:60, fev1:62, nasal_polyps:true, adherence_ok:true, technique_ok:true, bio_eval:true } },
  { id:"asthma:sim26:c4", title:"고용량 ICS-LABA · LAMA 미사용 · 호산구 350 · 악화 4회", input:{ age:47, products:["asthma:prod:relvar200"], ics_level:"high", g4_day:true, g4_night:true, g4_reliever:true, g4_limit:true, exac:4, eos:350, fev1:58, adherence_ok:true, technique_ok:true, bio_eval:true } },
  { id:"asthma:sim26:c5", title:"9세 알레르기성 · IgE 150 · 악화 2회", input:{ age:9, products:["asthma:prod:flutiform"], ics_level:"high", g4_day:true, g4_reliever:true, exac:2, ige:150, perennial_sens:true, allergic_rhinitis:true, eos:320, bio_eval:true }, note:"플로우 대상은 12세 이상 — 소아 경로는 도서관 참조" },
  { id:"asthma:sim26:c6", title:"응급실 · 단어로 말함 · SpO₂ 89%", input:{ age:41, products:["asthma:prod:symbicort_th"], ics_level:"low", use_mode:"mart", ae_on:true, ae_talk:"words", rr:32, hr:125, spo2:89, pef:45, exac:1 } }
],
SOURCES:[
  { id:"gl:asthma:katrd-2026", label:"KATRD 천식 진료지침 2026 6차 개정(대한결핵및호흡기학회, 2026-06-30)", url:"https://www.lungkorea.org/bbs/?code=guide" },
  { id:"gl:asthma:gina-2026", label:"GINA 2026 Strategy Report", url:"https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf" },
  { id:"src:hira", label:"심평원 보험인정기준(고시 원문, 2026-11-07 조회)", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrList.do?pgmid=HIRAA030069000400" },
  { id:"src:nedrug", label:"식약처 의약품안전나라(허가 효능·용법)", url:"https://nedrug.mfds.go.kr/searchDrug" },
  { id:"src:omlyclo", label:"데일리팜 — 옴리클로 급여 제형 확대(2026)", url:"https://dailypharm.com/user/news/339679" }
],
UI_LABELS:{
  REIMB_STATUS:{ ok:{ ko:"급여 충족", cls:"ok" }, cond:{ ko:"조건부 — 평가 기재", cls:"mid" }, unmet:{ ko:"급여 미충족", cls:"bad" },
    general:{ ko:"허가 범위·일반원칙", cls:"mid" }, no:{ ko:"급여 기준 없음", cls:"bad" }, na:{ ko:"국내 미허가", cls:"na" } },
  MODE:{ initial:"초기 치료(조절제 없음)", followup:"추적 — 단계 조정", exacerbation:"급성 악화" },
  ACTION:{ start:"시작 단계 결정", step_up:"단계 올림 검토", step_down:"단계 내림 검토", maintain:"현 단계 유지", severe:"5단계 미조절 — 중증 천식 평가" },
  CONTROL:{ well:"양호", partly:"부분 조절", uncontrolled:"조절 안 됨" },
  TRACK:{ "switch":"같은 단계 Track 1 전환(MART)", t1:"1안 · 선호", t2:"2안 · 대안" },
  ROLE:{ current:"현재", "switch":"전환", t1:"1안", t2:"2안", biologic:"생물학제제" },
  PHENO:{ allergic:"알레르기성(감작 + IgE)", eosinophilic:"호산구성(≥{TH.eos_il5_ge})", t2:"제2형 광의(호산구 ≥{TH.eos_t2_ge} 또는 FeNO ≥{TH.feno_t2_ge})", t2_low:"T2-low 가능" },
  KIND:{ inhaler:"흡입제", reliever:"완화제", oral:"경구", biologic:"생물학제제" },
  LIB_SECTIONS:[ ["steps","치료 단계 — KATRD 표 4-4 · 그림 4-3 ⟷ GINA Box 4-6"], ["mart","MART 투여 · 허가 최대"], ["ics","ICS 1일 용량(KATRD 표 4-2)"],
    ["reimb","급여 — 흡입제·경구제"], ["bio","생물학제제 급여 · 표현형"], ["ae","급성 악화 — KATRD 2026 ⟷ GINA 2026"], ["tests","검사 급여(FeNO 비급여)"],
    ["conflicts","지침 ⟷ 급여 상충"], ["errata","v1 정정(AE1–AE18)"], ["sources","출처"] ]
},
LOCAL_MAP:{ "OMA":"drug:omalizumab", "MEPO":"drug:mepolizumab", "RESL":"drug:reslizumab", "BENRA":"drug:benralizumab", "DUPI":"drug:dupilumab" }
};
