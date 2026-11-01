/* ===================================================================
   liver HBV v2 — DATA 레이어 (KASL 2026 · 고시 제2025-177호)
   스펙: claude/만성간질환_B형간염_개정SPEC_v2.md (v2.1)
   원칙: 임상 수치·기준·고시 조건은 이 파일에만. ENGINE·UI는 ID/키 참조.
   =================================================================== */
var HBV26 = {};

HBV26.META = { version:"liver-hbv-v2-2026.11", registry:"liver-hbv-v2-2026.11", spec:"claude/만성간질환_B형간염_개정SPEC_v2.md v2.1",
  changelog:[
    { date:"2026-11-01", version:"v2", author:"박형도(설계 확정)/Claude", change:"KASL 2026 만성 B형간염 지침 반영 — 바이러스역가 4분류·REC 89·급여 원문 재구현·상충 4", affected_ids:["gl:liver:kasl-hbv-2026","hbv:phase2026:*","hbv:rec:kasl2026:*"] },
    { date:"2026-11-01", version:"v2", author:"Claude", change:"v1 erratum 표시: E1(ALT 2×ULN HBeAg 분기)·E5(대상성 간경변 DNA≥2,000)·E6(BSV GFR<50 금기)·E7(예방요법 근거 고시 표기)·E8(3-라 누락)", affected_ids:["hbv:erratum:*"] }
  ] };

/* ---------- GL · 권고체계 ---------- */
HBV26.GUIDELINES = {
  "gl:liver:kasl-hbv-2022": { title:"KASL clinical practice guidelines for management of chronic hepatitis B (2022)", org:"KASL", year:2022, status:"superseded", superseded_by:"gl:liver:kasl-hbv-2026", recsys:"recsys:kasl", cite:"Clin Mol Hepatol 2022;28:276-331 (PMID 35430783)" },
  "gl:liver:kasl-hbv-2026": { title:"KASL clinical practice guidelines for management of chronic hepatitis B — Endorsed by the East Asia Liver Alliance (EALA)", org:"KASL", year:2026, effective:"2026-06-12", status:"active", superseded_by:null, supersedes:["gl:liver:kasl-hbv-2022"], recsys:"recsys:kasl",
    cite:"Choi WM, et al. Clin Mol Hepatol 2026;32(3):1029-1116. doi:10.3350/cmh.2026.0579", url:"https://www.e-cmh.org/journal/view.php?doi=10.3350/cmh.2026.0579", license:"CC BY-NC 3.0" }
};
HBV26.REC_SYSTEMS = {
  "recsys:kasl": { label:"KASL (modified GRADE)", evidence:{A:"High",B:"Moderate",C:"Low"}, strength:{"1":"Strong","2":"Weak"},
    rankBase:{A:1,B:2,C:3}, strengthStep:3, normByStrength:{"1":"A","2":"B"} }
};

/* ---------- 지침 임계값 (유일 소유) ---------- */
HBV26.TH = {
  low_lt:2000, high_gt:1e8, risk_age_gt:30, hcc_surv_age_ge:40,
  alt_uln:{ male:34, female:30 },
  renal_impair_egfr_lt:60, esrd_egfr_lt:15,
  vertical_ge:200000, vertical_start_wk:[24,32], vertical_end_pp_wk:[2,12],
  retreat_ge:2000, peds_age_lt:18,
  proph_after_mo:{ default:6, bcell:12, hsct:12 }, proph_post_monitor_mo:12,
  monitor_untreated_mo:[3,6], monitor_uncertain_mo:[1,3], hcc_surv_mo:6
};

/* ---------- 자연경과 2026 (판정식은 ENGINE이 TH로 평가) ---------- */
HBV26.PHASES = [
  { id:"hbv:phase2026:high", ko:"고바이러스혈증", en:"High viremic phase", def:"HBV DNA > 8 log₁₀ IU/mL (10⁸)", action:"위험인자(ALT>ULN·>30세·≥F2) 있으면 치료 고려, 없으면 모니터", rec:"hbv:rec:kasl2026:tx_high_1", tone:"obs" },
  { id:"hbv:phase2026:mod_eag_pos", ko:"HBeAg 양성 중등도 바이러스혈증", en:"HBeAg-positive moderate viremic phase", def:"HBeAg(+) & HBV DNA 2,000 IU/mL ~ 8 log₁₀", action:"치료(ALT 무관)", rec:"hbv:rec:kasl2026:tx_mod_1", tone:"tx" },
  { id:"hbv:phase2026:low", ko:"저바이러스혈증", en:"Low viremic phase", def:"HBV DNA < 2,000 IU/mL (검출)", action:"간경변 평가 → 있으면 치료, 없으면 모니터(ALT↑면 타 원인 평가)", rec:"hbv:rec:kasl2026:tx_low_1", tone:"obs" },
  { id:"hbv:phase2026:mod_eag_neg", ko:"HBeAg 음성 중등도 바이러스혈증", en:"HBeAg-negative moderate viremic phase", def:"HBeAg(−) & HBV DNA 2,000 IU/mL ~ 8 log₁₀ (약 20%)", action:"치료(ALT 무관)", rec:"hbv:rec:kasl2026:tx_mod_1", tone:"tx" },
  { id:"hbv:phase2026:nonviremic", ko:"비바이러스혈증(DNA 미검출)", en:"Non-viremic phase (Fig. 2)", def:"HBsAg(+) & HBV DNA 미검출 — 원문 Fig.2에만 존재, 본문 정의 없음(스펙 D6 해석)", action:"모니터", rec:null, tone:"end" }
];
HBV26.ALGORITHM = [
  "HBsAg 양성(만성 HBV 감염)",
  "특수집단? (면역억제·간세포암·간외증상·이식·임신·소아) → 해당 섹션 권고 적용",
  "바이러스역가 기준 단계 판정",
  "고바이러스혈증 → 위험인자*? 예: 치료 / 아니오: 모니터",
  "중등도 바이러스혈증(2,000–8 log) → 치료",
  "저바이러스혈증(<2,000) → 간경변? 예: 치료 / 아니오: 모니터",
  "비바이러스혈증 → 모니터",
  "* 위험인자: ALT >ULN, 나이 >30세, 유의 섬유화(≥F2) · 치료 = 경구 NA 1차"
];

/* ---------- 플로우 엔진용 REC 오버레이 (원문은 HBV26_REC_RAW) ---------- */
HBV26.TX_ORDER = ["hbv:rec:kasl2026:tx_dcirr_1","hbv:rec:kasl2026:tx_ccirr_1a","hbv:rec:kasl2026:tx_ccirr_1b","hbv:rec:kasl2026:hcc_1","hbv:rec:kasl2026:hcc_2","hbv:rec:kasl2026:tx_high_1","hbv:rec:kasl2026:tx_mod_1","hbv:rec:kasl2026:tx_low_1"];
HBV26.REC_FLOW = {
  "hbv:rec:kasl2026:tx_dcirr_1": { when:"cirr == decomp && dna_detected", action:"treat", ko:"비대상성 간경변: HBV DNA 검출 시 항바이러스 치료, 간부전 진행 시 간이식 고려", change:"maintained", supersedes:["v1:evalTreatIndication:decomp"] },
  "hbv:rec:kasl2026:tx_ccirr_1a": { when:"cirr == comp && dna >= low_lt", action:"treat", ko:"대상성 간경변: HBV DNA ≥2,000 → 치료", change:"maintained" },
  "hbv:rec:kasl2026:tx_ccirr_1b": { when:"cirr == comp && dna_detected && dna < low_lt", action:"treat", ko:"대상성 간경변: HBV DNA <2,000이라도 검출되면 치료", change:"new" },
  "hbv:rec:kasl2026:hcc_1": { when:"hcc && dna_detected", action:"treat", ko:"HBV 관련 간세포암: DNA 검출 시 암치료 상태와 무관하게 치료", change:"maintained" },
  "hbv:rec:kasl2026:hcc_2": { when:"hcc && !dna_detected", action:"prophylaxis", ko:"간세포암 + HBsAg(+) DNA 미검출: 재활성화 위험 → 예방적 항바이러스 고려", change:"new", reimbNote:"급여: 고시 2025-177 제3항-가(HBsAg+ 중등도·고위험 항암, 위험도=최신 가이드라인 → Table 7 TACE 고위험) 경로" },
  "hbv:rec:kasl2026:tx_high_1": { when:"phase == high && cirr == none && !hcc", action:"monitor", actionIf:{ expr:"risk_any", then:"consider" }, ko:"고바이러스혈증: >30세·ALT 상승·유의 섬유화 중 하나라도 있으면 치료 고려, 없으면 면밀 모니터", change:"new", supersedes:["hbv:phase:it"] },
  "hbv:rec:kasl2026:tx_mod_1": { when:"(phase == mod_eag_pos || phase == mod_eag_neg) && cirr == none && !hcc", action:"treat", ko:"중등도 바이러스혈증(2,000 IU/mL–8 log): 간질환 진행·간암 고위험 → ALT와 무관하게 치료 권고", change:"new", supersedes:["hbv:phase:ia_eag_pos","hbv:phase:ia_eag_neg","hbv:phase:grey"] },
  "hbv:rec:kasl2026:tx_low_1": { when:"phase == low && cirr == none && !hcc", action:"monitor", ko:"저바이러스혈증: 간경변 없으면 치료 없이 모니터, ALT 상승 시 다른 간질환 원인 평가", change:"modified", supersedes:["hbv:phase:inactive"] },
  "hbv:rec:kasl2026:agent_1": { when:"(treat || vertical) && !na_experienced", drugs:["drug:tenofovir_af","drug:tenofovir_df","drug:entecavir","drug:besifovir"], ko:"초치료 1차: 고유전자장벽 TAF·TDF·ETV·BSV", change:"modified" },
  "hbv:rec:kasl2026:agent_2a": { when:"treat && (renal || bone)", drugs:["drug:tenofovir_af","drug:entecavir","drug:besifovir"], ko:"신기능 저하·골대사질환 기존: TAF·ETV·BSV 우선", change:"maintained" },
  "hbv:rec:kasl2026:agent_2b": { when:"treat && renal_bone_risk && !renal && !bone", drugs:["drug:tenofovir_af","drug:entecavir","drug:besifovir"], ko:"신·골 질환 발생 위험 증가: TAF·ETV·BSV 우선", change:"new" },
  "hbv:rec:kasl2026:agent_3a": { when:"treat && na_experienced", drugs:["drug:tenofovir_af","drug:tenofovir_df"], ko:"LAM·ADV·LdT 노출력: TAF 또는 TDF", change:"maintained" },
  "hbv:rec:kasl2026:agent_3b": { when:"(treat || vertical) && (preg || preg_plan)", drugs:["drug:tenofovir_af","drug:tenofovir_df"], ko:"임신·임신 계획: TAF 또는 TDF", change:"modified" },
  "hbv:rec:kasl2026:immuno_2b": { when:"proph && !treat", drugs:["drug:tenofovir_af","drug:tenofovir_df","drug:entecavir"], ko:"예방 약제: TAF·TDF·ETV 우선(DNA·면역억제 강도·신/골 위험 고려)", change:"maintained" },
  "hbv:rec:kasl2026:ontx_1": { when:"treat", ko:"치료 중 6개월마다 AFP+초음파 HCC 감시", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:ontx_2": { when:"treat", ko:"치료 중 간기능·HBV DNA 1–6개월, 정량 HBsAg 연 1회 가능", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:ontx_4a": { when:"treat", ko:"치료 중 신기능 정기 모니터링", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:ontx_4b": { when:"treat && tdf_candidate", ko:"TDF: 신기능·혈청 인·BMD 주기 확인, GFR↓·저인산·골다공증 시 TAF/ETV/BSV 전환", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:monitor_1": { when:"!treat && !proph && !vertical", ko:"치료 비대상: ALT·HBV DNA 3–6개월 간격 추적", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:monitor_2": { when:"!treat && !proph && (fib_unknown || (phase == high && !risk_any))", ko:"치료 적격 불명확: 1–3개월 간격 또는 섬유화 평가", change:"modified", kind:"monitor" },
  "hbv:rec:kasl2026:monitor_3": { when:"!treat && (hcc_age || cirr != none)", ko:"HCC 감시: ≥40세 또는 간경변 등 고위험 → 6개월마다 AFP+초음파", change:"maintained", kind:"monitor" },
  "hbv:rec:kasl2026:stop_1": { when:"hbsag_loss_x2", ko:"HBsAg 소실 2회 연속 확인 시 항바이러스제 중단 권고", change:"modified", kind:"stop", supersedes:["v1:lib:치료 종료 기준","hbv:phase:hbsag_loss"] },
  "hbv:rec:kasl2026:stop_2": { when:"cirr != none", ko:"간경변 장기 치료 고려, 비대상성은 중단 금지", change:"maintained", kind:"stop" },
  "hbv:rec:kasl2026:stop_4": { when:"hbsag_loss_x2", ko:"중단 후 HBV DNA ≥2,000 재상승 시 재치료 고려", change:"maintained", kind:"stop" },
  "hbv:rec:kasl2026:preg_4a": { when:"preg && dna >= vertical_ge", ko:"임부 HBV DNA ≥200,000: 수직감염 예방 항바이러스 시작", change:"maintained", kind:"vertical" },
  "hbv:rec:kasl2026:preg_4b": { when:"preg && dna >= vertical_ge", ko:"28주 전 이상적, 24–32주 시작 · 분만 후 2–12주까지", change:"modified", kind:"vertical" },
  "hbv:rec:kasl2026:immuno_1": { when:"immuno != no", ko:"면역억제·항암 전 HBsAg·anti-HBc 선별, 어느 하나 양성이면 HBV DNA", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:immuno_2a": { when:"immuno != no && immuno != hsct && (hbsag_pos || dna_detected) && risk_modhigh", ko:"HBsAg(+) 또는 DNA(+) & 고·중등도 위험 약제: 시작 전/시작 시 예방", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:immuno_3a": { when:"immuno != no && immuno != hsct && !hbsag_pos && anti_hbc_pos && !dna_detected && risk_high", ko:"HBsAg(−)/anti-HBc(+)/DNA(−) & 고위험(rituximab 등): 예방 시작", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:immuno_3b": { when:"immuno != no && immuno != hsct && !hbsag_pos && anti_hbc_pos && !dna_detected && risk_mod", ko:"HBsAg(−)/anti-HBc(+) & 중등도 위험: 주기적 HBsAg·DNA 모니터링 또는 예방", change:"new", kind:"proph" },
  "hbv:rec:kasl2026:immuno_3c": { when:"immuno != no && immuno != hsct && !hbsag_pos && anti_hbc_pos && !dna_detected && risk_low", ko:"저위험: 모니터링 후 재활성화 시 선제 치료", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:immuno_4": { when:"proph && immuno != hsct", ko:"예방: 요법 종료 후 ≥6개월, B세포 고갈제(rituximab 등) ≥12개월 유지", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:immuno_5": { when:"proph", ko:"예방 종료 후 ≥12개월 HBV DNA 모니터링", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:hsct_4": { when:"immuno == hsct && (hbsag_pos || dna_detected)", ko:"HSCT HBsAg(+) 또는 DNA(+): 이식 시 예방", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:hsct_5": { when:"immuno == hsct && !hbsag_pos && anti_hbc_pos && !dna_detected", ko:"HSCT HBsAg(−)/anti-HBc(+)/DNA(−): 이식 시 예방 권고", change:"maintained", kind:"proph" },
  "hbv:rec:kasl2026:hsct_6": { when:"immuno == hsct", ko:"HSCT 예방 ≥12개월, TAF·TDF·ETV 우선", change:"modified", kind:"proph" },
  "hbv:rec:kasl2026:peds_1": { when:"age_peds && treat", ko:"소아청소년: DNA ≥2,000 + ALT 6개월 이상 지속상승 또는 유의 섬유화 → 치료 고려", change:"maintained", kind:"peds" },
  "hbv:rec:kasl2026:peds_2b": { when:"age_peds && treat", ko:"소아 선호 약제: TAF·TDF·ETV·Peg-IFNα", change:"modified", kind:"peds" }
};
/* 예방 판정용 위험도 매핑: v1 입력(immuno) + v2 세분(immuno_risk) */
HBV26.IMMUNO_RISK_MAP = { mod:"modhigh", ritux:"high", hsct:"high", no:null };

/* ---------- 약물 안전 GATE (지침 버전 독립) ---------- */
HBV26.GATES = [
  { id:"hbv:gate:decomp_excl", when:"cirr == decomp", drugs:["drug:besifovir","drug:peg_ifn_alpha"], reason:"비대상성: BSV 안전성·유효성 미확립(허가) + 급여 불인정(고시 1-가-1)-나)), Peg-IFN 금기" },
  { id:"hbv:gate:etv_experienced", when:"na_experienced", drugs:["drug:entecavir"], reason:"타 항바이러스제 노출력: ETV 비권고(KASL ontx_4c A1)" },
  { id:"hbv:gate:preg_excl", when:"preg || preg_plan", drugs:["drug:entecavir","drug:besifovir"], reason:"임신·임신 계획: Table 5 ETV·BSV Not recommended" },
  { id:"hbv:gate:bsv_esrd", when:"esrd", drugs:["drug:besifovir"], reason:"말기신질환: BSV 치료 경험 없음 — 투여 비권장(허가)" },
  { id:"hbv:gate:proph_no_bsv", when:"proph && !treat", drugs:["drug:besifovir"], reason:"예방요법 급여 대상 약제에 BSV 없음(고시 2025-177 제3항)" }
];
HBV26.RENAL_DOSE = {
  "drug:besifovir": { source:"베시보정 허가(의약품안전나라 2026-10-01)", rows:[
    { min:50, label:"150 mg 1일 1회 (경증 조절 불요)" }, { min:30, label:"중등증: 2일마다 1회 1정" }, { min:15, label:"중증: 4일마다 1회 1정" }, { min:0, label:"말기신질환: 투여 비권장" } ],
    boundary_note:"신장애 구간(중등증 30–49·중증 <30)은 일반 CrCl 분류 — 허가 원문은 수치 미표기" },
  "drug:tenofovir_af": { source:"베믈리디정 허가(의약품안전나라 2026-10-01)", rows:[
    { min:15, label:"25 mg 1일 1회 — 경증·중등증·중증 성인 용량 조절 불요" }, { min:0, label:"혈액투석: 투석일엔 투석 후 복용 (신장애 소아 미확립)" } ] }
};
HBV26.DRUG_NOTES = {
  "drug:tenofovir_af": { label:"TAF (베믈리디)", notes:["KASL 2026 1차(A1) · 신·골 위험/임신 우선","허가: 성인 및 6세 이상·25 kg 이상 소아, 식사와 관계없이(v1 '식사와 함께'·'18세 이상'은 구 허가)","급여 투여연령 만 18세 이상(고시 1-다)","2025-11-01 급여 확대: 비대상성·HCC 초치료, 간이식, 예방요법, 수직감염"] },
  "drug:tenofovir_df": { label:"TDF (비리어드)", notes:["KASL 2026 1차(A1) · 신·골 질환에는 Not recommended(Table 5)","급여 만 12세 이상","TDF 사용 시 신기능·인·BMD 주기 확인(ontx_4b A1)"] },
  "drug:entecavir": { label:"ETV (바라크루드)", notes:["KASL 2026 1차(A1) · 0.5 mg 공복","타 항바이러스제 노출력 시 비권고(A1) · 임신 Not recommended","급여 만 2세 이상"] },
  "drug:besifovir": { label:"BSV (베시보)", notes:["KASL 2026 1차(A1) · 150 mg + L-carnitine — 허가·고시 660 mg / KASL Table 5 표기 550 mg(병기)","신장애: 중등증 2일·중증 4일 간격, 말기신질환 비권장(허가) — v1 'GFR<50 금기'는 erratum E6","비대상성 간경변 급여 불인정 · 예방요법 급여 대상 아님 · 급여 만 20세 이상"] },
  "drug:peg_ifn_alpha": { label:"Peg-IFNα", notes:["KASL 2026 본문: 국내 성인 1차 권고 어려움","소아 선호 옵션 중 하나(A1) · HDV 대상성 간질환 고려(A2)","비대상성 금기 · 급여: IFN 병용 시 IFN만 인정(고시 1-라)"] },
  "drug:bulevirtide": { label:"bulevirtide (헵클루덱스)", notes:["KASL 2026: HDV 대상성 간질환에서 Peg-IFNα 또는 bulevirtide 고려(A2)","국내 미허가(의약품안전나라 검색 0건, 2026-11-01)"] }
};

/* ---------- 급여 레이어: 고시 제2025-177호 (원문 검증 v2.1) ---------- */
HBV26.NOTICE = { id:"notice:고시2025-177", noticeNo:"보건복지부 고시 제2025-177호", title:"[일반원칙] 경구용 만성 B형간염치료제", effectiveDate:"2025-11-01", prev:"고시 제2023-37호(2023-03-01)",
  sourceUrl:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20251101&sno=1&mtgMtrRegSno=0001", verified:"2026-11-01" };
HBV26.REIMB_TH = { eag_pos_dna_ge:20000, eag_neg_dna_ge:2000, alt_hi_ge:80, alt_mid_ge:40, vertical_dna_ge:200000, vertical_start_wk:[24,32], vertical_end_pp_wk_max:12, peds_initial_age:[12,18],
  age_min:{ "drug:telbivudine":16, "drug:clevudine":18, "drug:entecavir":2, "drug:adefovir":18, "drug:tenofovir_df":12, "drug:tenofovir_af":18, "drug:besifovir":20 },
  proph_mo:{ modhigh:6, ritux:12, hsct_total:18, antihbc_donor_lt:6 } };
HBV26.REIMB = {
  "hbv:reimb:naive_noncirr": { art:"1-가-1)-가)(1)", text:"HBeAg(+) HBV-DNA ≥20,000 IU/mL 또는 HBeAg(−) ≥2,000 IU/mL 만성활동성 B형간염 + AST 또는 ALT ≥80단위" },
  "hbv:reimb:naive_alt_mid_fib": { art:"1-가-1)-가)(2)", text:"위 DNA 기준 + AST 또는 ALT 40–80단위 + 간생검(곤란 시 노829 Fibroscan·도163 MR 탄성도)에서 A2 이상 염증괴사 또는 F2 이상 섬유화" },
  "hbv:reimb:cirr_hcc": { art:"1-가-1)-나)", text:"간경변(대상·비대상)·간세포암 동반 만성활동성 B형간염: HBV-DNA 양성" },
  "hbv:reimb:bsv_decomp_excl": { art:"1-가-1)-나) 단서", text:"Besifovir는 비대상성 간경변증에 인정하지 아니함" },
  "hbv:reimb:agents_naive": { art:"1-가-2)", text:"LAM·CLV·LdT·ETV 0.5 mg·ADV·TDF·TAF·BSV 중 1종. LAM은 고장벽 약제 불가·부적절 시만(투여소견서). BSV는 L-carnitine 660 mg 병용" },
  "hbv:reimb:resistance": { art:"1-나", text:"바이러스돌파(HBV-DNA 100배↓ 도달 후 최저치에서 10배↑) + 내성 돌연변이, 또는 내성 돌연변이(사례별). 투여방법 표는 고시 첨부" },
  "hbv:reimb:age_limits": { art:"1-다", text:"LdT ≥16세 · CLV ≥18세(CrCl <60 금기) · ETV ≥2세 · ADV ≥18세 · TDF ≥12세 · TAF ≥18세 · BSV ≥20세" },
  "hbv:reimb:ifn_combo": { art:"1-라", text:"인터페론과 병용 시 인터페론만 인정" },
  "hbv:reimb:hepatoprotectant_exclusive": { art:"1-마", text:"간장약(실리마린·UDCA 등) 병용: 항바이러스제 급여 시 간장약 전액본인부담, 반대도 동일" },
  "hbv:reimb:lt": { art:"2-가", text:"B형간염 간이식: LAM·CLV·LdT·ETV 0.5·ADV·TDF·TAF 중 1종(허가초과 인정)" },
  "hbv:reimb:peds": { art:"2-나", text:"소아 초치료 만 12–18세 미만: Adefovir / LAM 내성 18세 미만: LAM+ADV 병용" },
  "hbv:reimb:proph_modhigh": { art:"3-가", text:"HBsAg(+) 또는 HBV-DNA(+) + 재활성화 위험 중등도·고위험(위험도=최신 가이드라인) 항암·면역억제: 요법 중 + 종료 후 6개월" },
  "hbv:reimb:proph_ritux": { art:"3-나", text:"anti-HBc(+) + rituximab 포함 요법: 요법 중 + 종료 후 12개월" },
  "hbv:reimb:proph_hsct": { art:"3-다", text:"HBsAg(−)·HBV-DNA(−)·anti-HBc(+) 조혈모세포이식: 총 18개월" },
  "hbv:reimb:proph_antihbc_donor_lt": { art:"3-라", text:"anti-HBc(+) 공여 간 수혜자, HBIG 미투여: 면역억제 중 + 종료 후 6개월 (v1 누락 — erratum E8)" },
  "hbv:reimb:proph_low": { art:"4", text:"3항 기간 이후 또는 저위험군 항암·면역억제: 전액본인부담. 예방 대상 약제에 BSV 없음" },
  "hbv:reimb:vertical": { art:"5", text:"HBsAg(+) 임부 HBV-DNA ≥200,000 IU/mL: TDF 300 mg 또는 TAF 25 mg 1일 1회, 임신 24–32주 시작 ~ 출산 후 최대 12주" },
  "hbv:reimb:switch": { art:"6", text:"교체: 내성·부분 바이러스 반응·일차 무반응·임신·객관적 심한 부작용 급여, 복약순응·비용효과는 사례별(최신 KASL 지침 참고)" }
};

/* ---------- 지침↔급여 상충 (헌장 §6) ---------- */
HBV26.CONFLICTS = [
  { id:"hbv:conflict:mod_viremia_alt_independent", guideline_ref:["hbv:rec:kasl2026:tx_mod_1"], reimb_ref:["hbv:reimb:naive_noncirr","hbv:reimb:naive_alt_mid_fib"],
    when:"(phase == mod_eag_pos || phase == mod_eag_neg) && cirr == none && !hcc && reimb_tx != ok",
    text_guideline:"중등도 바이러스혈증은 ALT와 무관하게 치료 권고(B1)", text_reimb:"AST 또는 ALT ≥80(또는 40–80 + 생검·Fibroscan·MRE A2/F2 입증) 필요 — 미충족 시 전액본인부담", status:"open" },
  { id:"hbv:conflict:eag_pos_dna_threshold", guideline_ref:["hbv:rec:kasl2026:tx_mod_1"], reimb_ref:["hbv:reimb:naive_noncirr"],
    when:"phase == mod_eag_pos && cirr == none && !hcc && dna < eag_pos_reimb_ge",
    text_guideline:"HBeAg 양성 중등도 하한 2,000 IU/mL", text_reimb:"HBeAg 양성 급여 하한 20,000 IU/mL — 2,000–19,999 구간 급여 불가", status:"open" },
  { id:"hbv:conflict:high_viremia_risk", guideline_ref:["hbv:rec:kasl2026:tx_high_1"], reimb_ref:["hbv:reimb:naive_noncirr"],
    when:"phase == high && decision == consider && reimb_tx != ok",
    text_guideline:">30세·ALT >ULN(남 34/여 30)·≥F2 중 하나면 치료 고려(B1)", text_reimb:"AST 또는 ALT ≥80(또는 40–80 + 섬유화 입증)만 인정", status:"open" },
  { id:"hbv:conflict:peds_adefovir_only", guideline_ref:["hbv:rec:kasl2026:peds_1","hbv:rec:kasl2026:peds_2b"], reimb_ref:["hbv:reimb:peds"],
    when:"age_peds && treat",
    text_guideline:"소아 선호 약제 TAF·TDF·ETV·Peg-IFNα(A1)", text_reimb:"소아 초치료 급여는 12–18세 Adefovir만(고시 2-나), TAF 급여 ≥18세", status:"open" }
];
HBV26.NOTES = [
  { id:"hbv:note:alt_uln_definition", text:"지침 ALT 정상상한 남 34·여 30 IU/L(위험인자 판정) ↔ 급여는 절대값 AST 또는 ALT 80·40 단위" },
  { id:"hbv:note:taf_age_label_vs_reimb", text:"TAF 허가 성인 및 6세 이상·25 kg 이상 ↔ 급여 투여연령 만 18세 이상" }
];
HBV26.TARGETS = [
  { id:"hbv:tgt:dna_undetectable", lab:"lab:hbv_dna", op:"undetectable", ko:"혈청 HBV DNA 불검출" },
  { id:"hbv:tgt:alt_normal", lab:"lab:alt", op:"<=", ref:"HBV26.TH.alt_uln", ko:"ALT 정상화(남 34·여 30 IU/L 이하)" },
  { id:"hbv:tgt:hbeag_loss", lab:"lab:hbeag", op:"loss", when:"eag == pos", ko:"HBeAg 소실·혈청전환" },
  { id:"hbv:tgt:hbsag_loss", lab:"lab:hbsag", op:"loss", ko:"HBsAg 소실(이상적 목표·중단 기준)" }
];

/* ---------- 재활성화 위험도 (KASL 2026 Table 7 — 급여 고시 3항 '최신 가이드라인'의 실체) ---------- */
HBV26.REACT_RISK = {
  source:"KASL 2026 Table 7",
  hbsag_pos:{ high:["Anthracyclines(doxorubicin·daunorubicin·epirubicin)","Anti-TNF(infliximab·adalimumab·etanercept·certolizumab·golimumab)","Anti-IL-6(tocilizumab)","Anti-IL-17(secukinumab·ixekizumab)","B세포 고갈제(rituximab·ofatumumab·natalizumab·alemtuzumab·ibritumomab·obinutuzumab)","Daratumumab","CAR-T(BCMA·CD19)","조혈모세포이식","TACE","TKI(sorafenib·lenvatinib·regorafenib·imatinib·sunitinib·osimertinib·nilotinib·gefitinib·dasatinib·erlotinib·afatinib·ibrutinib·idelalisib·palbociclib·ribociclib)","JAK 억제제(tofacitinib·baricitinib)","스테로이드 고용량 >20 mg/d 또는 중등도 10–20 mg/d prednisone ≥4주"],
    mod:["Anthracycline 외 세포독성 항암","Anti-T cell(abatacept·belatacept)","Cytokine 기반","Immunophilin 억제제(cyclosporine)","Anti-IL-12/23(ustekinumab)","mTOR 억제제(everolimus·temsirolimus)","Proteasome 억제제(bortezomib)","HDAC 억제제","면역관문억제제(pembrolizumab·nivolumab·atezolizumab·durvalumab·ipilimumab)","스테로이드 <10 mg/d ≥4주"] },
  hbsag_neg_antihbc_pos:{ high:["B세포 고갈제(rituximab·ofatumumab·ocrelizumab·alemtuzumab·ibritumomab·obinutuzumab)","조혈모세포이식"],
    mod:["Anthracyclines","Anti-IL-6","Anti-IL-12/23","Cytokine 기반","Anti-T cell","Immunophilin 억제제","mTOR 억제제","Proteasome 억제제","Daratumumab","HDAC 억제제","Anti-IL-17","CAR-T","Cyclophosphamide","TACE","T cell 고갈제","TKI","JAK 억제제","스테로이드 고용량·중등도 ≥4주"] },
  note:"원문 표 저위험(<1%) 열은 추출 범위 밖 — 원문 Table 7 참조"
};

/* ---------- 해외 비교(표시 전용 — REC 아님, 스펙 D11) ---------- */
HBV26.OVERSEAS = { source:"Kim GA, et al. Clin Mol Hepatol 2026;32(3):1186-1200. doi:10.3350/cmh.2026.0697 (2차 문헌)", rows:[
  { org:"KASL-EALA 2026", cls:"바이러스역가 4단계(회색지대 소멸)", tx:"중등도 무조건 치료 · 고바이러스혈증 위험인자 시 · 간경변 DNA 검출", uln:"34/30", elig:"54.0%" },
  { org:"AASLD 2025", cls:"면역학적 5단계 + indeterminate(~40%)", tx:"IA: ALT ≥2×ULN + DNA ≥20,000(e+)/≥2,000(e−) · IT >40세 또는 염증·섬유화 조건부 · indeterminate e− SDM · 간경변 무관", uln:"35/25", elig:"32.2%" },
  { org:"EASL 2025", cls:"infection/hepatitis 4 + impending·cACLD", tx:"원칙: HBsAg+ & DNA 검출 후보 · 표준 DNA ≥2,000 + ALT >ULN 또는 유의 섬유화 · 위험인자 개별화", uln:"관행 40(근거 30/19)", elig:"37.3%" },
  { org:"WHO 2024", cls:"6 표현형(치료결정엔 미사용)", tx:"① APRI >0.5·TE >7 kPa ② DNA >2,000 + ALT↑ ③ 위험인자(HIV·HCV·대사·가족력·면역억제 등) ④ DNA 불가 시 ALT 지속↑", uln:"30/19", elig:"70.5%" }
], eligNote:"치료적격 비율 = 한·중 코호트 시뮬레이션(비교 리뷰)" };

/* ---------- v1 superseded · erratum (표시용, v1 객체 무수정) ---------- */
HBV26.SUPERSEDED_V1 = [
  { v1:"hbv:phase:it (면역관용기)", by:"hbv:phase2026:high (근사)" },
  { v1:"hbv:phase:ia_eag_pos", by:"hbv:phase2026:mod_eag_pos / high (DNA로)" },
  { v1:"hbv:phase:inactive", by:"hbv:phase2026:low" },
  { v1:"hbv:phase:ia_eag_neg", by:"hbv:phase2026:mod_eag_neg" },
  { v1:"hbv:phase:grey (회색지대)", by:"소멸 — DNA로 재분류" },
  { v1:"hbv:phase:hbsag_loss", by:"hbv:rec:kasl2026:stop_1 (중단 기준)" },
  { v1:"치료 종료 기준(HBeAg 혈청전환 + 12개월 등)", by:"stop_1–4 (2026 권고문은 HBsAg 소실 2회만 중단 권고)" },
  { v1:"임신 '안전성등급 B = TDF/텔비부딘'", by:"agent_3b · preg_* (TAF/TDF A1)" }
];
HBV26.ERRATA = [
  { id:"hbv:erratum:E1", where:"v1 치료 판정(지침 2022 레이어)", text:"ALT 2×ULN을 성별이 아닌 HBeAg 상태로 분기(HBeAg+ 68 / HBeAg− 60) — 성별 입력 없음. 이전 지침 판정 해석 시 주의" },
  { id:"hbv:erratum:E5", where:"v1 급여 판정·급여 요지·판정기", text:"'대상성 간경변 DNA ≥2,000'은 2023-03 이전 기준. 현행(고시 2023-37→2025-177): 간경변(대상·비대상)·간세포암 + HBV-DNA 양성이면 급여" },
  { id:"hbv:erratum:E6", where:"v1 약제 선택·플래그·증례3", text:"'besifovir GFR<50 금기' → 허가: 중등증 2일·중증 4일 간격, 말기신질환 비권장(금기 아님)" },
  { id:"hbv:erratum:E7", where:"v1 예방요법 근거", text:"예방요법 현행 근거는 고시 제2025-177호 제3·4항(2019-21은 질의응답)" },
  { id:"hbv:erratum:E8", where:"v1 예방요법 표", text:"고시 3-라 누락: anti-HBc(+) 공여 간 수혜자 HBIG 미투여 — 면역억제 중 + 종료 후 6개월" }
];

/* ---------- 플로우 2026 입력 정의 (UI는 이 표로 생성) ---------- */
HBV26.INPUTS = [
  { key:"sex", label:"성별 (ALT 정상상한 남 34·여 30)", type:"opts", options:[["male","남"],["female","여"]] },
  { key:"age", label:"나이 (세)", type:"num", ph:"예: 45" },
  { key:"ast", label:"AST (IU/L) — 급여는 AST 또는 ALT 기준", type:"num", ph:"예: 60" },
  { key:"fib", label:"유의 섬유화 ≥F2 (생검·Fibroscan 노829·MRE 도163)", type:"opts", options:[["f2plus","예(≥F2/A2)"],["none","아니오"],["unknown","미평가"]] },
  { key:"dna_undetected", label:"HBV DNA 미검출", type:"opts", options:[["yes","미검출"],["no","검출/수치 입력"]] },
  { key:"hbsag_loss_x2", label:"HBsAg 소실 2회 연속 확인", type:"opts", options:[["yes","예"],["no","아니오"]] },
  { key:"preg_plan", label:"임신 계획", type:"opts", options:[["yes","예"],["no","아니오"]] },
  { key:"renal_bone_risk", label:"신·골 질환 발생 위험 증가(고령·당뇨·고혈압·골감소 등)", type:"opts", options:[["yes","예"],["no","아니오"]] },
  { key:"na_exp", label:"LAM·ADV·LdT 등 항바이러스제 노출력", type:"opts", options:[["yes","예"],["no","아니오"]] },
  { key:"hbsag", label:"HBsAg (예방요법 판정용)", type:"opts", options:[["pos","양성"],["neg","음성"]] },
  { key:"anti_hbc", label:"anti-HBc (예방요법 판정용)", type:"opts", options:[["pos","양성"],["neg","음성"]] },
  { key:"immuno_risk", label:"면역억제·항암 위험도(Table 7)", type:"opts", options:[["high","고위험 >10%"],["mod","중등도 1–10%"],["low","저위험 <1%"]] }
];

/* ---------- 2026 증례 (환자 입력만 보관 — 판정은 엔진이 계산) ---------- */
HBV26.SIM_CASES = [
  { id:"S26-1", emoji:"🟥", title:"중등도 바이러스혈증 · ALT 정상", p:{ hbeag:"neg", dna:8000, alt:25, sex:"male", age:45, cirr:"none" }, q:"치료 여부와 급여는?",
    teach:["2026: 중등도 바이러스혈증 → ALT 무관 치료 권고(B1) — v1 '회색지대 함정' 증례의 판정이 바뀐 지점","급여: AST 또는 ALT ≥80(또는 40–80 + 섬유화 입증) 미충족 → 전액본인부담","의사 판단: 지침 근거·비급여 부담을 환자와 공유(조언자 원칙)"] },
  { id:"S26-2", emoji:"🟧", title:"HBeAg 양성 · DNA 1만", p:{ hbeag:"pos", dna:10000, alt:95, sex:"female", age:38, cirr:"none" }, q:"ALT가 높은데 급여는?",
    teach:["2026: HBeAg 양성 중등도(≥2,000) → 치료","급여: HBeAg 양성은 DNA ≥20,000 필요 → ALT 95여도 불인정(상충)"] },
  { id:"S26-3", emoji:"🟨", title:"고바이러스혈증 · 32세", p:{ hbeag:"pos", dna:3e8, alt:22, sex:"male", age:32, cirr:"none", fib:"none" }, q:"면역관용기처럼 관찰?",
    teach:["2026: >8 log 고바이러스혈증 + 나이 >30 → 치료 고려(B1)","30세 이하·ALT ≤ULN·<F2면 면밀 모니터","급여: ALT 기준 미충족 → 불인정"] },
  { id:"S26-4", emoji:"🟫", title:"대상성 간경변 · DNA 500", p:{ hbeag:"neg", dna:500, alt:30, sex:"male", age:58, cirr:"comp" }, q:"DNA <2,000인데?",
    teach:["2026: 대상성 간경변은 DNA 검출되면 치료(<2,000 B1)","급여: 간경변 + HBV-DNA 양성 → 인정(고시 2025-177) — v1의 '≥2,000 필요'는 erratum E5"] },
  { id:"S26-5", emoji:"🟩", title:"HBsAg 소실 2회", p:{ hbeag:"neg", dna_undetected:"yes", alt:20, sex:"female", age:55, cirr:"none", hbsag_loss_x2:"yes" }, q:"중단 가능?",
    teach:["2026: HBsAg 소실 2회 연속 확인 시 중단 권고(A1)","중단 후 6개월 1–3개월 간격 간기능·DNA, DNA ≥2,000 재상승 시 재치료 고려(B1)","간경변이면 장기 치료(비대상성 중단 금지)"] }
];

HBV26.SOURCES = [
  { label:"KASL. 만성 B형간염 진료 가이드라인 2026 (EALA endorsed). Clin Mol Hepatol 2026;32(3):1029-1116", url:"https://www.e-cmh.org/journal/view.php?doi=10.3350/cmh.2026.0579", note:"active · 1차 레이어" },
  { label:"Kim GA, et al. CHB 진료지침 비교(자연경과·치료 시작). Clin Mol Hepatol 2026;32(3):1186-1200", url:"https://www.e-cmh.org/journal/view.php?doi=10.3350%2Fcmh.2026.0697", note:"해외 비교" },
  { label:"보건복지부 고시 제2025-177호 [일반원칙] 경구용 만성 B형간염치료제 (2025-11-01)", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20251101&sno=1&mtgMtrRegSno=0001", note:"급여 원문" },
  { label:"의약품안전나라 — 베시보정 허가사항", url:"https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201702347", note:"허가" },
  { label:"의약품안전나라 — 베믈리디정 허가사항", url:"https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201702418", note:"허가" },
  { label:"KASL 만성 B형간염 진료 가이드라인 2022 (Clin Mol Hepatol 2022;28:276-331)", url:"https://pubmed.ncbi.nlm.nih.gov/35430783/", note:"superseded · 이전 지침" }
];

/* 통합 시 사전 정렬용 로컬→전역 매핑 (스펙 §10-1) */
HBV26.LOCAL_MAP = { "drug:tenofovir_df":"drug:tenofovir", "drug:tenofovir_af":"drug:tenofovir_af", "drug:besifovir":"drug:besifovir",
  "notice:수직감염":"notice:고시2025-177#5", "notice:고시2019-21":"notice:고시2025-177#3" };
