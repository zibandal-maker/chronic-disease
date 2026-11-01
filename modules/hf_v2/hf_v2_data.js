/* ===================================================================
   hf v2 DATA (HF26) — ESC 2026 해외 레이어 + KSHF 2022 한국 레이어 + 심평원 급여 원문(2026-11-01 재검증)
   규칙: 임상 수치·약물명·기준값·고시조건은 이 파일에만. 엔진·UI는 ID와 TH 키로만 참조.
   ESC 원문 문장 미수록(라이선스) — text는 한국어 의역, cite = Recommendation Table 번호.
   스펙: claude/심부전_개정SPEC_v2.md (v2.1) · 원문 로그: claude/심부전_급여재검증로그.md
   =================================================================== */
var HF26 = (function(){
"use strict";

var META = { key:"hf", version:"hf-v2-2026.11", built:"2026-11-01", base_v1:"hf-1.0",
  verified:"2026-11-01", note:"v1(hf-1.0) 바이트 무수정 + 가산 블록" };

/* ---------- 1. 지침·권고체계 ---------- */
var GUIDELINES = {
  "gl:hf:kshf-2022": { id:"gl:hf:kshf-2022", title:"대한심부전학회 심부전 진료지침 2022", org:"KSHF", year:2022, status:"active", layer:"L1", recsys:"recsys:esc", src:"src:kshf2022" },
  "gl:hf:kshf-2026": { id:"gl:hf:kshf-2026", title:"대한심부전학회 심부전 진료지침 2026 (개정 진행 중)", org:"KSHF", year:2026, status:"pending", layer:"L1", recsys:"recsys:grade", supersedes:["gl:hf:kshf-2022"], src:"src:kshf2026_news",
    note:"2026-09 Heart Failure Seoul 공청회 · GRADE 방법론 전환 · 연내 발표 예정. 발표 전까지 한국 레이어 = KSHF 2022" },
  "gl:hf:esc-2021": { id:"gl:hf:esc-2021", title:"2021 ESC HF Guidelines", org:"ESC", year:2021, status:"superseded", superseded_by:"gl:hf:esc-2026", recsys:"recsys:esc" },
  "gl:hf:esc-2023fu": { id:"gl:hf:esc-2023fu", title:"2023 Focused Update of the 2021 ESC HF Guidelines", org:"ESC", year:2023, status:"superseded", superseded_by:"gl:hf:esc-2026", recsys:"recsys:esc", alias:["gl:esc-hf-2023"] },
  "gl:hf:esc-2026": { id:"gl:hf:esc-2026", title:"2026 ESC Guidelines for the management of heart failure", org:"ESC", year:2026, status:"active", layer:"L1'", recsys:"recsys:esc", supersedes:["gl:hf:esc-2021","gl:hf:esc-2023fu"], src:"src:esc2026" },
  "gl:hf:acc-2022": { id:"gl:hf:acc-2022", title:"2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure", org:"AHA/ACC/HFSA", year:2022, status:"active", layer:"보조", recsys:"recsys:acc-aha" }
};
var REC_SYSTEMS = {
  "recsys:esc": { id:"recsys:esc", label:"ESC Class/LoE",
    grade:{ "I":{norm:"A",rank:1,ko:"권고"}, "IIa":{norm:"B",rank:2,ko:"고려해야 함"}, "IIb":{norm:"C",rank:3,ko:"고려할 수 있음"}, "III":{norm:"X",rank:9,ko:"권고하지 않음(해로움/무익)"} },
    loe_rank:{ "A":0, "B1":1, "B":1, "B2":2, "C":3 },
    loe_note:"ESC 2026은 A / B1 / B2 / C 체계(정의 표는 원문 Table 2·3). 서열 A > B1 > B2 > C. 구판 B는 B1 서열로 취급" }
};
var TIERS = {
  "hf:tier:fmt":  { id:"hf:tier:fmt",  order:1, label:"FMT 기본 약물치료", desc:"Foundational medical therapy — 예후 개선 근간, 가능한 한 모두 조기 시작·증량" },
  "hf:tier:amt":  { id:"hf:tier:amt",  order:2, label:"AMT 추가 약물치료", desc:"Additional medical therapy — 증상·상황·잔여 위험에 따라 추가" },
  "hf:tier:dhf":  { id:"hf:tier:dhf",  order:3, label:"비대상성 HF(DHF)", desc:"입원·안정화 단계 (구 '급성 HF')" },
  "hf:tier:com":  { id:"hf:tier:com",  order:4, label:"동반질환", desc:"철결핍·AF·비만 등" },
  "hf:tier:prev": { id:"hf:tier:prev", order:5, label:"예방·병기 A/B", desc:"HF 발생 전 위험인자·구조이상 단계" },
  "hf:tier:gdit": { id:"hf:tier:gdit", order:6, label:"GDIT 시술·기기", desc:"Guideline-directed interventional therapy (도서관 전용)" },
  "hf:tier:safety": { id:"hf:tier:safety", order:7, label:"금기·주의", desc:"Class III" }
};
/* v1 AXES → 2026 tier 매핑 (v1 값 복제 없이 ID만) */
var AXIS_TIER = { "axis:ras":"hf:tier:fmt", "axis:bb":"hf:tier:fmt", "axis:mra":"hf:tier:fmt", "axis:sglt2i":"hf:tier:fmt",
  "axis:congestion":"hf:tier:amt", "axis:rate":"hf:tier:amt", "axis:refractory":"hf:tier:amt", "axis:iron":"hf:tier:com", "axis:kbinder":"hf:tier:amt" };

/* ---------- 2. 임계값 (단일 출처) — 지침(g_)·허가/급여(r_) 분리 ---------- */
var TH = {
  /* 표현형 */
  ref_lt:50, kshf_ref_le:40, kshf_pef_ge:50, impef_delta:10, impef_floor:40, nyha_sym_ge:2,
  /* ESC 2026 권고 조건 */
  glycoside_lvef_le:40, ivab_lvef_le:35, ivab_hr_gt:70, vericiguat_lvef_lt:45, hisdn_lvef_le:40,
  glp1_lvef_ge:45, glp1_bmi_ge:30, bariatric_bmi_ge:35, stageb_acei_lvef_le:40, post_mi_mra_lvef_le:40,
  /* 안전 (ESC 2026 본문) */
  mra_egfr_untested_lt:25, mra_k_caution_ge:5.0, mra_k_reduce_gt:5.5,
  raas_sbp_lt:100, raas_egfr_lt:30, raas_k_gt:5.2, arni_washout_h:36,
  cr_rise_ok_lt_pct:50, cr_rise_egfr_floor:15, sglt2i_egfr_start_ge:20,
  /* 철결핍 정의 */
  id_ferritin_lt:100, id_ferritin_hi:300, id_tsat_lt:20,
  /* 허가(nedrug) — 피네레논 HF */
  fine_egfr_split:60, fine_egfr_start_ge:25, fine_egfr_stop_lt:15, fine_k_start_le:5.0,
  /* 급여 (HIRA 원문) */
  r_nyha_ge:2, r_arni_lvef_le:40, r_sglt_lvef_le:40, r_sglt_nt_ge:125, r_sglt_bnp_ge:35,
  r_veri_lvef_lt:45, r_veri_bnp_sr_ge:300, r_veri_nt_sr_ge:1000, r_veri_bnp_af_ge:500, r_veri_nt_af_ge:1600,
  r_ivab_hr_ge:75, r_ivab_lvef_le:35, r_ivab_sel_lvef_le:40,
  r_iron_hb_le:10, r_iron_ferritin_lt:30, r_iron_tsat_lt:20, r_iron_ckd_ferritin_lt:100,
  r_fine_uacr_gt:300, r_fine_egfr_ge:25, r_fine_egfr_lt:75
};

/* ---------- 3. 표현형 ---------- */
var PHENO26 = {
  "hf:pheno26:ref": { id:"hf:pheno26:ref", key:"ref", label:"HFrEF", rule:"LVEF < 50%", when:"lvef < TH.ref_lt", gl:"gl:hf:esc-2026" },
  "hf:pheno26:pef": { id:"hf:pheno26:pef", key:"pef", label:"HFpEF", rule:"LVEF ≥ 50% + 구조·기능 이상 객관 증거 + NP 상승", when:"lvef >= TH.ref_lt", gl:"gl:hf:esc-2026" },
  "hf:pheno26:band4149": { id:"hf:pheno26:band4149", key:"band4149", label:"LVEF 41–49% 구간", flag:true,
    text:"KSHF 2022 = HFmrEF / ESC 2026 = HFrEF. 이 구간만 대상으로 한 대형 RCT는 BB·ACE-I/ARNI/ARB 모두 없음 → ESC HFrEF 권고는 외삽(RT5 각주)" },
  "hf:pheno26:impef": { id:"hf:pheno26:impef", key:"impef", label:"HFimpEF(개선된 LVEF)", flag:true,
    text:"이전 LVEF 대비 절대 +10%p 이상이면서 40% 초과. FMT는 원칙적으로 유지(I/C)" }
};
var PHENO_MAP = { rEF:"hf:pheno26:ref", mrEF:"hf:pheno26:ref", pEF:"hf:pheno26:pef" };

/* ---------- 4. 추가 계열·약물 (v1 CLASSES/DRUGS에 없는 것만; 전역 ID는 기존 가이드와 동일) ---------- */
var CLASS_ADD = {
  "class:glp1ra": { id:"class:glp1ra", label:"GLP-1 RA / GIP·GLP-1", members:["drug:semaglutide","drug:tirzepatide"] },
  "class:ttr_stabilizer": { id:"class:ttr_stabilizer", label:"TTR 안정제", members:["drug:tafamidis","drug:acoramidis"] },
  "class:ttr_silencer": { id:"class:ttr_silencer", label:"TTR silencer", members:["drug:vutrisiran"] },
  "class:diuretic_adj": { id:"class:diuretic_adj", label:"이뇨 보강제", members:["drug:acetazolamide","drug:hydrochlorothiazide"] }
};
var CLASS_EXTEND = { "class:cardiac_glycoside":["drug:digitoxin"] };
var DRUG_ADD = {
  "drug:valsartan":   { id:"drug:valsartan", label_ko:"발사르탄", label_en:"Valsartan", cls:"class:arb", kr_available:true },
  "drug:losartan":    { id:"drug:losartan", label_ko:"로사르탄", label_en:"Losartan", cls:"class:arb", kr_available:true },
  "drug:digitoxin":   { id:"drug:digitoxin", label_ko:"디기톡신", label_en:"Digitoxin", cls:"class:cardiac_glycoside", kr_available:false, kr_note:"국내 허가 0건(nedrug 2026-11-01)" },
  "drug:semaglutide": { id:"drug:semaglutide", label_ko:"세마글루타이드", label_en:"Semaglutide", brand:"위고비(체중관리)·오젬픽(당뇨)", cls:"class:glp1ra", kr_available:true, kr_note:"HF 적응증 없음 — 위고비: 체중관리(BMI ≥30, 또는 ≥27+동반질환)·CVD+BMI ≥27 MACE 감소" },
  "drug:tirzepatide": { id:"drug:tirzepatide", label_ko:"터제파타이드", label_en:"Tirzepatide", brand:"마운자로", cls:"class:glp1ra", kr_available:true, kr_note:"HF 적응증 없음 — 당뇨·만성 체중관리" },
  "drug:acetazolamide": { id:"drug:acetazolamide", label_ko:"아세타졸아미드", label_en:"Acetazolamide", cls:"class:diuretic_adj", kr_available:true },
  "drug:hydrochlorothiazide": { id:"drug:hydrochlorothiazide", label_ko:"히드로클로로티아지드", label_en:"Hydrochlorothiazide", cls:"class:diuretic_adj", kr_available:true },
  "drug:tafamidis":   { id:"drug:tafamidis", label_ko:"타파미디스", label_en:"Tafamidis", brand:"빈다맥스 61mg", cls:"class:ttr_stabilizer", kr_available:true },
  "drug:acoramidis":  { id:"drug:acoramidis", label_ko:"아코라미디스", label_en:"Acoramidis", cls:"class:ttr_stabilizer", kr_available:false, kr_note:"국내 허가 0건(nedrug 2026-11-01)" },
  "drug:vutrisiran":  { id:"drug:vutrisiran", label_ko:"부트리시란", label_en:"Vutrisiran", brand:"암부트라", cls:"class:ttr_silencer", kr_available:true, kr_note:"국내 급여는 TTR-FAP(다발신경병증)만" }
};
/* v1 DRUGS 상태 오버레이(값 수정 아님 — 표시용 보정, 근거 ERRATA) */
var DRUG_STATUS = {
  "drug:patiromer": { kr_available:false, kr_note:"국내 허가 0건(nedrug 2026-11-01) — v1 정정 HE8", err:"hf:err:HE8" },
  "drug:sodium_zirconium_cyclosilicate": { kr_available:true, brand26:"로켈마 현탁용분말 5·10 g", kr_note:"국내 유일 칼륨결합제 · 응급 단독 비권장(허가)" },
  "drug:dapagliflozin": { kr_available:true, brand26:"포시가 취하 — HF 적응증 보유 제네릭(다파엔정 등)", err:"hf:err:HE2", flag:"hf:flag:sglt2i_product_hf" },
  "drug:empagliflozin": { kr_available:true, brand26:"자디앙 등 — 제네릭 다수는 HF 적응증 없음", flag:"hf:flag:sglt2i_product_hf" },
  "drug:finerenone": { kr_available:true, brand26:"케렌디아 10·20·40 mg (40 mg 2026-06-30 허가)", err:"hf:err:HE3" }
};

/* ---------- 5. 권고 (ESC 2026, 의역) ---------- */
/* scope: rx(엔진 판정) | library(도서관 전용). when: WhenDSL(ctx.vars). drugs: class/drug ID. drug_when: 구성원별 추가 조건 */
var REC_2026 = [
  /* --- FMT / 전 LVEF --- */
  { id:"hf:rec26:all_sglt2i", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"A", change:"same",
    when:"has_lvef && symptomatic", drugs:["class:sglt2i"], v1:["hf:rec:rEF_sglt2i","hf:rec:mrEF_sglt2i","hf:rec:pEF_sglt2i"],
    text:"증상 HF는 LVEF와 무관하게 SGLT2 억제제(다파·엠파) — HF 입원·CV 사망 감소" },
  { id:"hf:rec26:all_mra", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"A", change:"upgrade",
    when:"has_lvef && symptomatic", drugs:["class:mra_steroidal","class:mra_nonsteroidal"], drug_when:{ "class:mra_nonsteroidal":"pheno26 == pef" },
    v1:["hf:rec:rEF_mra","hf:rec:mrEF_other"],
    text:"증상 HF는 LVEF와 무관하게 MRA — HFrEF는 스테로이드성, HFpEF는 스테로이드성 또는 피네레논(비스테로이드성)" },
  { id:"hf:rec26:loop_dynamic", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"I", loe:"A", change:"upgrade",
    when:"has_lvef && congestion", drugs:["class:loop_diuretic"], v1:["hf:rec:diuretic"],
    text:"울혈 증상·징후가 있으면 체액 상태에 맞춘 고리이뇨제 동적 용량 조절(대규모 RCT는 윤리상 불가 — 합의상 LoE A)" },
  { id:"hf:rec26:uptitrate", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"C", change:"new",
    when:"has_lvef", drugs:[], text:"FMT는 증상·활력징후·검사로 확인하며 1–2주마다 증량해 RCT 목표용량(또는 최대내약)까지" },
  { id:"hf:rec26:continue", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"C", change:"new",
    when:"has_lvef", drugs:[], text:"무증상이 되거나 LVEF가 개선돼도 최대내약 FMT 유지" },
  { id:"hf:rec26:deescalate", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"IIb", loe:"C", change:"new",
    when:"impef && !symptomatic", drugs:[], text:"가역 원인 교정 후 LV 기능·용적·NP가 완전히 정상화된 무증상 환자에서, 환자 선호 시 면밀한 감시하 FMT 점진 중단을 고려할 수 있음(고도 선택군)" },
  /* --- FMT / HFrEF --- */
  { id:"hf:rec26:ref_bb", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"A", change:"same",
    when:"pheno26 == ref && symptomatic", drugs:["class:bb_hf"], v1:["hf:rec:rEF_bb"], text:"안정된 증상 HFrEF에 베타차단제" },
  { id:"hf:rec26:ref_acei_arni", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"A", change:"reworded",
    when:"pheno26 == ref && symptomatic", drugs:["class:arni","class:acei"], v1:["hf:rec:rEF_arni","hf:rec:rEF_acei"],
    text:"증상 HFrEF에 ACE 억제제 또는 ARNI(ESC 2026은 동격 — KSHF 2022의 'ARNI 우선'은 한국 레이어 참고)" },
  { id:"hf:rec26:ref_switch_arni", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"B1", change:"same",
    when:"pheno26 == ref && symptomatic", drugs:["class:arni"], text:"ACE 억제제·ARB 복용 중인 증상 HFrEF는 ARNI로 전환(ACE-I 중단 후 36시간 washout)" },
  { id:"hf:rec26:ref_arb", cite:"RT5", scope:"rx", tier:"hf:tier:fmt", grade:"I", loe:"A", change:"same",
    when:"pheno26 == ref && symptomatic && raas_intol", drugs:["class:arb"], v1:["hf:rec:rEF_acei"], text:"ACE-I·ARNI 불내성이면 ARB" },
  /* --- AMT / HFrEF --- */
  { id:"hf:rec26:ref_glycoside", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIa", loe:"B1", change:"upgrade",
    when:"pheno26 == ref && symptomatic && lvef <= TH.glycoside_lvef_le", drugs:["class:cardiac_glycoside"], v1:["hf:rec:digoxin"],
    text:"최적 FMT에도 증상이 남는 LVEF ≤40% HFrEF에 강심배당체(디곡신·디기톡신) — HF 입원 감소" },
  { id:"hf:rec26:ref_ivab", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIa", loe:"B1", change:"same",
    when:"pheno26 == ref && symptomatic && lvef <= TH.ivab_lvef_le && sinus_rhythm && hr > TH.ivab_hr_gt", drugs:["class:if_inhibitor"], v1:["hf:rec:ivabradine"],
    text:"LVEF ≤35%, 동리듬, 안정시 HR >70, 최대내약 ACE-I/ARNI·MRA·SGLT2-I·BB에도 → 이바브라딘" },
  { id:"hf:rec26:ref_ivab_bbintol", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIa", loe:"C", change:"new",
    when:"pheno26 == ref && symptomatic && lvef <= TH.ivab_lvef_le && sinus_rhythm && bb_intol", drugs:["class:if_inhibitor"],
    text:"BB 불내성인 LVEF ≤35% 동리듬 HFrEF → 이바브라딘" },
  { id:"hf:rec26:ref_hisdn_intol", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIb", loe:"C", change:"downgrade",
    when:"pheno26 == ref && symptomatic && lvef <= TH.hisdn_lvef_le && raas_all_intol", drugs:["class:vasodilator"], v1:["hf:rec:hyd_isdn"],
    text:"ARNI·ACE-I·ARB 모두 불내성인 LVEF ≤40% HFrEF → 하이드랄라진+ISDN" },
  { id:"hf:rec26:ref_hisdn_black", cite:"RT5", scope:"library", tier:"hf:tier:amt", grade:"IIa", loe:"B2", change:"reworded",
    drugs:["class:vasodilator"], v1:["hf:rec:hyd_isdn"], text:"자기보고 흑인 LVEF ≤40% HFrEF에서 최적 FMT에 하이드랄라진+ISDN 추가(국내 적용 드묾 — 입력 필드 없음)" },
  { id:"hf:rec26:ref_vericiguat", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIb", loe:"B1", change:"reworded",
    when:"pheno26 == ref && symptomatic && lvef < TH.vericiguat_lvef_lt", drugs:["class:sgc_stimulator"], v1:["hf:rec:vericiguat"],
    text:"최적 FMT에도 증상 HFrEF(LVEF <45%) → 베리시구앗(ESC 2026은 '최근 악화' 요건 없음 — 국내 허가·급여는 악화 사건 필요)" },
  /* --- HFpEF --- */
  { id:"hf:rec26:pef_raas", cite:"RT5", scope:"rx", tier:"hf:tier:amt", grade:"IIb", loe:"C", change:"new",
    when:"pheno26 == pef && symptomatic", drugs:["class:arni","class:acei","class:arb"], v1:["hf:rec:mrEF_other"],
    text:"증상 HFpEF에서 ACE-I/ARB/ARNI로 HF 입원 감소를 고려할 수 있음" },
  /* --- 비대상성 HF --- */
  { id:"hf:rec26:dhf_loop_iv", cite:"RT9", scope:"rx", tier:"hf:tier:dhf", grade:"I", loe:"A", change:"same",
    when:"inpatient && congestion", drugs:["class:loop_diuretic"], text:"체액 과다로 입원한 DHF는 IV 고리이뇨제" },
  { id:"hf:rec26:dhf_adj", cite:"RT9", scope:"rx", tier:"hf:tier:dhf", grade:"IIa", loe:"B1", change:"reworded",
    when:"inpatient && congestion", drugs:["class:diuretic_adj"], text:"고리이뇨제로 치료 중인 체액 과다에 단기 IV 아세타졸아미드 또는 경구 HCTZ 추가(울혈 감소)" },
  { id:"hf:rec26:dhf_sglt2i", cite:"RT9", scope:"rx", tier:"hf:tier:dhf", grade:"I", loe:"B1", change:"new",
    when:"inpatient", drugs:["class:sglt2i"], text:"DHF 초기 안정화 후 원내 SGLT2-I 개시 — QoL·울혈 증상 개선, HF 입원 감소" },
  { id:"hf:rec26:dhf_early_fmt", cite:"RT8", scope:"rx", tier:"hf:tier:dhf", grade:"I", loe:"B2", change:"new",
    when:"inpatient", drugs:[], text:"HF 입원 후 퇴원 전·6주 내 FMT를 신속히 개시·증량하고 자주 추적(재입원·사망 감소)" },
  { id:"hf:rec26:dhf_discharge", cite:"RT8", scope:"rx", tier:"hf:tier:dhf", grade:"I", loe:"C", change:"same",
    when:"inpatient", drugs:[], text:"퇴원 전 잔존 울혈 징후 평가" },
  /* --- 동반질환 --- */
  { id:"hf:rec26:iron_sym", cite:"RT19", scope:"rx", tier:"hf:tier:com", grade:"I", loe:"B1", change:"downgrade",
    when:"pheno26 == ref && symptomatic && iron_def", drugs:["class:iv_iron"], v1:["hf:rec:iron"], text:"철결핍 증상 HFrEF에 정맥 철분 — 증상·QoL 개선" },
  { id:"hf:rec26:iron_hfh", cite:"RT19", scope:"rx", tier:"hf:tier:com", grade:"IIa", loe:"B1", change:"new",
    when:"pheno26 == ref && symptomatic && iron_def", drugs:["class:iv_iron"], text:"철결핍 증상 HFrEF에 정맥 철분 — HF 입원 감소 목적" },
  { id:"hf:rec26:af_bb", cite:"RT15", scope:"rx", tier:"hf:tier:com", grade:"I", loe:"C", change:"upgrade",
    when:"pheno26 == ref && af", drugs:["class:bb_hf"], text:"안정 HFrEF+AF의 1차 심박수 조절은 BB" },
  { id:"hf:rec26:af_digoxin", cite:"RT15", scope:"rx", tier:"hf:tier:com", grade:"IIa", loe:"C", change:"same",
    when:"pheno26 == ref && af", drugs:["drug:digoxin"], text:"BB로 심박수가 높거나 BB 금기·불내성이면 디곡신" },
  { id:"hf:rec26:obesity_glp1", cite:"RT18", scope:"rx", tier:"hf:tier:com", grade:"IIa", loe:"B1", change:"new",
    when:"symptomatic && lvef >= TH.glp1_lvef_ge && bmi >= TH.glp1_bmi_ge", drugs:["class:glp1ra"],
    text:"증상 HF·LVEF ≥45%·BMI ≥30이면 당뇨 무관 세마글루타이드 또는 터제파타이드 — 체중 감소·운동능·QoL" },
  /* --- 예방·병기 B --- */
  { id:"hf:rec26:prev_sglt2i_dm", cite:"RT1", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"A", change:"new",
    when:"preclinical && t2dm", drugs:["class:sglt2i"], text:"T2DM + ASCVD 위험/확립 → SGLT2-I (HF·CV 사망 감소)" },
  { id:"hf:rec26:prev_finerenone", cite:"RT1", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"A", change:"new",
    when:"preclinical && t2dm && ckd", drugs:["drug:finerenone"], text:"T2DM + CKD(FIDELIO/FIGARO 기준) → 피네레논(HF 감소)" },
  { id:"hf:rec26:prev_glp1", cite:"RT1", scope:"rx", tier:"hf:tier:prev", grade:"IIa", loe:"A", change:"new",
    when:"preclinical && t2dm", drugs:["class:glp1ra"], text:"T2DM + 추가 CV 위험인자 1개 이상 → GLP-1 RA" },
  { id:"hf:rec26:prev_bp", cite:"RT1", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"A", change:"upgrade",
    when:"preclinical", drugs:[], text:"고혈압·병기 B는 수축기 <130 mmHg 엄격 조절" },
  { id:"hf:rec26:stageb_acei", cite:"RT2", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"A", change:"new",
    when:"stage == B && lvef <= TH.stageb_acei_lvef_le", drugs:["class:acei","class:arb"], text:"병기 B·LVEF ≤40% → ACE-I(불내성 시 ARB)" },
  { id:"hf:rec26:stageb_bb", cite:"RT2", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"B1", change:"new",
    when:"stage == B && lvef < TH.ref_lt", drugs:["class:bb_hf"], text:"병기 B·LVEF <50% → BB" },
  { id:"hf:rec26:stageb_eplerenone", cite:"RT2", scope:"rx", tier:"hf:tier:prev", grade:"I", loe:"B1", change:"new",
    when:"post_mi && lvef <= TH.post_mi_mra_lvef_le && (hf_symptom || t2dm)", drugs:["drug:eplerenone"], text:"MI 후 LVEF ≤40% + HF 징후 또는 당뇨 → 에플레레논" },
  /* --- 금기 (Class III) --- */
  { id:"hf:rec26:preg_contra", cite:"RT27", scope:"rx", tier:"hf:tier:safety", grade:"III", loe:"C", change:"new",
    when:"pregnant", drugs:["class:acei","class:arb","class:arni","class:mra_steroidal","class:mra_nonsteroidal","class:if_inhibitor","class:sglt2i"],
    text:"임신 중 ACE-I·ARB·ARNI·MRA·이바브라딘·SGLT2-I는 태아독성·기형 위험으로 권고하지 않음" },
  { id:"hf:rec26:preg_bb", cite:"RT27", scope:"rx", tier:"hf:tier:safety", grade:"I", loe:"C", change:"new",
    when:"pregnant && pheno26 == ref", drugs:["drug:metoprolol","drug:bisoprolol"], text:"임신 HFrEF는 비선택 BB를 β1 선택제(메토프롤롤·비소프롤롤)로 전환 + 모체·태아 감시" },
  { id:"hf:rec26:nsaid", cite:"RT22", scope:"rx", tier:"hf:tier:safety", grade:"III", loe:"B2", change:"new",
    when:"nsaid", drugs:[], text:"NSAID·COX-2 억제제는 HF 악화·입원 위험으로 권고하지 않음" },
  /* --- 도서관 전용 --- */
  { id:"hf:rec26:vaccine", cite:"RT22", scope:"library", tier:"hf:tier:com", grade:"IIa", loe:"C", text:"인플루엔자·폐렴구균 백신" },
  { id:"hf:rec26:prev_statin", cite:"RT1", scope:"library", tier:"hf:tier:prev", grade:"IIa", loe:"A", text:"ASCVD 고위험·확립 → 스타틴(HF 감소)" },
  { id:"hf:rec26:prev_lifestyle", cite:"RT1", scope:"library", tier:"hf:tier:prev", grade:"I", loe:"C", text:"병기 A·B 생활습관 상담(체중·식이·활동·금연·절주·약물 남용 금지)" },
  { id:"hf:rec26:icd_secondary", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"A", text:"혈역학 불안정 심실부정맥 생존자(1년 이상 기대여명, 가역원인·MI 48시간 내 제외) ICD 이차예방" },
  { id:"hf:rec26:icd_isch", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"B1", text:"허혈성 HFrEF NYHA II–III, FMT 3개월 이상에도 LVEF ≤35%(MI 40일 이내 제외) ICD 일차예방" },
  { id:"hf:rec26:icd_nonisch", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"B1", text:"비허혈성 HFrEF 동일 조건 ICD 일차예방" },
  { id:"hf:rec26:icd_post_mi40", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"III", loe:"B1", text:"MI 후 40일 이내 일차예방 ICD는 권고하지 않음" },
  { id:"hf:rec26:icd_nyha4", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"III", loe:"C", text:"약물 불응 NYHA IV(CRT·LVAD·이식 후보 제외) ICD 권고하지 않음" },
  { id:"hf:rec26:wcd", cite:"RT6", scope:"library", tier:"hf:tier:gdit", grade:"IIb", loe:"C", text:"SCD 위험 한시적 브리지로 착용형 제세동기" },
  { id:"hf:rec26:crt_lbbb150", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"A", text:"동리듬·LBBB·QRS ≥150 ms·최적 FMT에도 LVEF ≤35% → CRT" },
  { id:"hf:rec26:crt_upgrade", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"B1", text:"RV 조율 비율 높은 PM/ICD 환자 HF 악화 + LVEF ≤35% → CRT 업그레이드" },
  { id:"hf:rec26:crt_avb", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"B1", change:"downgrade", text:"고도 AVB로 심실 조율이 필요한 HFrEF는 RV 조율 대신 CRT (2021 I/A → IIa/B1)" },
  { id:"hf:rec26:crt_nonlbbb150", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"C", text:"non-LBBB·QRS ≥150 → CRT 고려" },
  { id:"hf:rec26:crt_lbbb130", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"C", text:"LBBB·QRS 130–149 → CRT 고려" },
  { id:"hf:rec26:crt_nonlbbb130", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"IIb", loe:"C", text:"non-LBBB·QRS 130–149 → CRT 고려 가능" },
  { id:"hf:rec26:crt_qrs130", cite:"RT7", scope:"library", tier:"hf:tier:gdit", grade:"III", loe:"A", text:"QRS <130 ms(고도 AVB 조율 적응 없음) CRT 권고하지 않음" },
  { id:"hf:rec26:dhf_o2", cite:"RT9", scope:"library", tier:"hf:tier:dhf", grade:"I", loe:"C", text:"SpO₂ <90% 또는 PaO₂ <60 mmHg → 산소. 진행성 호흡부전 → 삽관(I/C). NIPPV IIa/B2" },
  { id:"hf:rec26:dhf_una", cite:"RT9", scope:"library", tier:"hf:tier:dhf", grade:"IIb", loe:"B1", text:"초기 수일 소변 Na 유도 이뇨 고려 가능" },
  { id:"hf:rec26:dhf_vaso", cite:"RT9", scope:"library", tier:"hf:tier:dhf", grade:"IIb", loe:"C", text:"SBP >110 → IV 혈관확장제 / SBP <90+저관류 → 강심제 / 쇼크 → 승압제(노르에피 우선) — 각 IIb/C. 오피오이드 일상 사용 III/C" },
  { id:"hf:rec26:shock_team", cite:"RT10", scope:"library", tier:"hf:tier:dhf", grade:"I", loe:"C", text:"tMCS 후보는 다학제 Shock Team이 기기 선택. STEMI 쇼크 microaxial pump IIa/B1, 비선택 AMI 쇼크 tMCS III/B1, 비선택 IABP III/B1" },
  { id:"hf:rec26:adv_refer", cite:"RT11", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"A", text:"진행성 HF(또는 위험) + 이식·LVAD 절대금기 없음 → 진행성 HF 센터 조기 의뢰. CPET·RHC I/C" },
  { id:"hf:rec26:adv_bb_down", cite:"RT12", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"C", text:"장기 저관류 진행성 HFrEF는 BB·이바브라딘 감량·중단 고려 / 지속 강심제 IIa/C / 신대체 IIa/C / 초여과 IIb/C" },
  { id:"hf:rec26:lvad", cite:"RT13", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"C", change:"upgrade", text:"선택된 진행성 HFrEF에 durable LVAD(BTT·BTC·BTR·DT) / 이식 I/C" },
  { id:"hf:rec26:as_avr", cite:"RT17", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"B1", text:"중증 AS + HF → SAVR 또는 TAVI" },
  { id:"hf:rec26:mr_teer", cite:"RT17", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"B1", change:"upgrade", text:"이차성 중증 MR, 최적 FMT·CRT에도 지속 + Table 19 기준 충족 → mitral TEER (미충족 시 증상 목적 IIb/C)" },
  { id:"hf:rec26:cad_revasc", cite:"RT16", scope:"library", tier:"hf:tier:gdit", grade:"I", loe:"C", text:"FMT·항협심증제에도 지속 협심증 → 관상동맥 재관류 / LVEF ≤35% 다혈관 → CABG 우선 IIa/B1" },
  { id:"hf:rec26:af_ablation", cite:"RT15", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"C", text:"선택된 증상 AF+HFrEF 카테터 절제 / AVN 절제+CRT IIa/B1 / OAC I/A(DOAC 우선 I/B1)" },
  { id:"hf:rec26:asv", cite:"RT20", scope:"library", tier:"hf:tier:com", grade:"III", loe:"A", text:"중추성 수면무호흡 우세 HFrEF에 ASV 권고하지 않음(사망 증가) / 폐쇄성 우세 IIb/C" },
  { id:"hf:rec26:bariatric", cite:"RT18", scope:"library", tier:"hf:tier:com", grade:"IIb", loe:"C", text:"BMI ≥35에서 생활습관+약물로 체중 유지 실패 시 비만수술" },
  { id:"hf:rec26:mdt", cite:"RT23", scope:"library", tier:"hf:tier:com", grade:"I", loe:"B1", text:"다학제 HF 관리 프로그램(I/B1) · 교육·자기관리(I/A) · 순응도 중재(I/B2) · 운동재활(I/B1)" },
  { id:"hf:rec26:pa_monitor", cite:"RT25", scope:"library", tier:"hf:tier:gdit", grade:"IIa", loe:"B1", change:"upgrade", text:"NYHA III + 12개월 내 HF 입원 → PA압 원격 모니터링" },
  { id:"hf:rec26:palliative", cite:"RT26", scope:"library", tier:"hf:tier:com", grade:"I", loe:"B1", text:"진행성 HF 사전돌봄계획(I/B1) · 통합 완화의료(I/B2)" },
  { id:"hf:rec26:attr", cite:"RT28", scope:"library", tier:"hf:tier:com", grade:"I", loe:"A", change:"upgrade", drugs:["class:ttr_stabilizer","class:ttr_silencer"],
    text:"ATTR-CM(변이·야생형) NYHA I–III → TTR silencer(부트리시란) 또는 안정제(타파미디스·아코라미디스)" }
];

/* ---------- 6. 용량 (ESC 2026 Table 11 + 국내 허가 우선 항목) ---------- */
var DOSE_2026 = {
  "drug:enalapril":{start:"2.5 mg bid",target:"10–20 mg bid"},
  "drug:ramipril":{start:"1.25–2.5 mg bid",target:"5 mg bid"},
  "drug:sacubitril_valsartan":{start:"49/51 mg bid (국내 표기 100 mg bid)",target:"97/103 mg bid (200 mg bid)",note:"24/26 mg(50 mg) bid 시작 고려: 증상성 저혈압 병력·ACE-I 미사용·eGFR 30–60"},
  "drug:candesartan":{start:"4 mg qd",target:"32 mg qd"},
  "drug:losartan":{start:"(12.5) 25–50 mg qd",target:"150 mg qd"},
  "drug:valsartan":{start:"40 mg bid",target:"160 mg bid"},
  "drug:bisoprolol":{start:"1.25 mg qd",target:"10 mg qd"},
  "drug:carvedilol":{start:"3.125 mg bid",target:"25 mg bid",note:"85 kg 초과 50 mg bid"},
  "drug:metoprolol":{start:"12.5–25 mg qd (succinate)",target:"200 mg qd"},
  "drug:nebivolol":{start:"1.25 mg qd",target:"10 mg qd",note:"CV·전체 사망 감소 미입증"},
  "drug:eplerenone":{start:"25 mg qd",target:"50 mg qd"},
  "drug:spironolactone":{start:"12.5–25 mg qd",target:"50 mg qd",note:"신기능·고칼륨 우려 시 12.5 mg"},
  "drug:finerenone":{src:"nedrug 허가(만성 심부전 LVEF ≥40%)", rule:[
      {when:"egfr >= TH.fine_egfr_split", start:"20 mg qd", target:"40 mg qd"},
      {when:"egfr >= TH.fine_egfr_start_ge && egfr < TH.fine_egfr_split", start:"10 mg qd", target:"20 mg qd"},
      {when:"egfr < TH.fine_egfr_start_ge", start:"개시 비권장", target:"—"} ],
    start:"eGFR ≥60: 20 mg / 25–<60: 10 mg", target:"eGFR ≥60: 40 mg / 25–<60: 20 mg (최대 40 mg)",
    note:"개시 K⁺ ≤5.0. 4주 후 K⁺·eGFR: <5.0 증량(eGFR 저하 <30%) · 5.0–<5.5 유지 · 5.5–<6.0 한 단계 감량(10 mg이면 중단) · ≥6.0 중단 → <5.5에서 10 mg 재개. eGFR <15 중단. ESC 각주는 경계 ≤60/>60(참고)" },
  "drug:dapagliflozin":{start:"10 mg qd",target:"10 mg qd"},
  "drug:empagliflozin":{start:"10 mg qd",target:"10 mg qd"},
  "drug:digoxin":{start:"62.5 µg qd",target:"250 µg qd",note:"혈중농도로 적정"},
  "drug:digitoxin":{start:"0.07 mg qd",target:"0.1 mg qd",note:"간 대사 · 국내 미허가"},
  "drug:ivabradine":{start:"5 mg bid",target:"7.5 mg bid"},
  "drug:vericiguat":{start:"2.5 mg qd",target:"10 mg qd"},
  "drug:hydralazine":{start:"37.5 mg tid (ISDN 20 mg tid와 병용)",target:"75 mg tid"},
  "drug:isosorbide_dinitrate":{start:"20 mg tid",target:"40 mg tid"}
};
var DOSE_SRC = "ESC 2026 Table 11";

/* ---------- 7. 안전 규칙 (msg의 {TH.x}는 엔진이 치환) ---------- */
var SAFETY = [
  { id:"hf:flag:mra_egfr", lv:"warn", when:"egfr < TH.mra_egfr_untested_lt", applies:["class:mra_steroidal","class:mra_nonsteroidal"], msg:"MRA: eGFR <{TH.mra_egfr_untested_lt}에서는 시험된 적 없음(ESC 2026)" },
  { id:"hf:flag:mra_k_start", lv:"warn", when:"potassium >= TH.mra_k_caution_ge", applies:["class:mra_steroidal","class:mra_nonsteroidal"], msg:"MRA 개시 주의: K⁺ ≥{TH.mra_k_caution_ge}" },
  { id:"hf:flag:mra_k_high", lv:"warn", when:"potassium > TH.mra_k_reduce_gt", applies:["class:mra_steroidal","class:mra_nonsteroidal"], msg:"MRA 복용 중 K⁺ >{TH.mra_k_reduce_gt}: 재측정 후 감량·일시중단, 해소되면 재개" },
  { id:"hf:flag:raas_sbp", lv:"warn", when:"sbp < TH.raas_sbp_lt", applies:["class:acei","class:arni","class:arb"], msg:"ACE-I/ARNI 신중: SBP <{TH.raas_sbp_lt}" },
  { id:"hf:flag:raas_egfr", lv:"warn", when:"egfr < TH.raas_egfr_lt", applies:["class:acei","class:arni","class:arb"], msg:"ACE-I/ARNI 신중: eGFR <{TH.raas_egfr_lt}" },
  { id:"hf:flag:raas_k", lv:"warn", when:"potassium > TH.raas_k_gt", applies:["class:acei","class:arni","class:arb"], msg:"ACE-I/ARNI 신중: K⁺ >{TH.raas_k_gt}" },
  { id:"hf:flag:arni_washout", lv:"info", when:"pheno26 == ref", applies:["class:arni"], msg:"ACE-I → ARNI 전환 시 최소 {TH.arni_washout_h}시간 washout(혈관부종). 급여상 ACE-I·ARB 병용 불인정" },
  { id:"hf:flag:sglt2i_egfr", lv:"warn", when:"egfr < TH.sglt2i_egfr_start_ge", applies:["class:sglt2i"], msg:"SGLT2-I: eGFR <{TH.sglt2i_egfr_start_ge}에서 개시 근거 제한" },
  { id:"hf:flag:fine_k", lv:"warn", when:"potassium > TH.fine_k_start_le", applies:["drug:finerenone"], msg:"피네레논: K⁺ >{TH.fine_k_start_le}이면 개시 비권장(허가)" },
  { id:"hf:flag:fine_egfr", lv:"warn", when:"egfr < TH.fine_egfr_start_ge", applies:["drug:finerenone"], msg:"피네레논: eGFR <{TH.fine_egfr_start_ge} 개시 비권장 · <{TH.fine_egfr_stop_lt} 중단(허가)" },
  { id:"hf:flag:cr_rise", lv:"info", when:"has_lvef", msg:"RAAS·MRA·SGLT2-I 개시 후 일시적 eGFR 저하로 중단하지 말 것 — Cr 상승 <{TH.cr_rise_ok_lt_pct}% 이면서 eGFR >{TH.cr_rise_egfr_floor}이면 허용(ESC 2026)" },
  { id:"hf:flag:band4149", lv:"info", when:"band4149", msg:"LVEF 41–49%: ESC 2026은 HFrEF로 분류하나 이 구간 전용 대형 RCT 없음(외삽). KSHF 2022는 HFmrEF" },
  { id:"hf:flag:impef", lv:"info", when:"impef", msg:"HFimpEF(이전 대비 +{TH.impef_delta}%p 이상·>{TH.impef_floor}%): FMT 유지(I/C), 중단은 고도 선택군만 IIb/C" },
  { id:"hf:flag:iron_alt", lv:"info", when:"tsat < TH.id_tsat_lt && !iron_def", msg:"TSAT <{TH.id_tsat_lt}%: ESC 2026에서 제안된 대안 철결핍 정의 충족(기존 정의 미충족)" },
  { id:"hf:flag:preg", lv:"warn", when:"pregnant", msg:"임신: ACE-I·ARB·ARNI·MRA·이바브라딘·SGLT2-I 권고하지 않음(III/C) — 해당 약제는 아래 '금기' 목록으로 분리" },
  { id:"hf:flag:preg_bb", lv:"warn", when:"pregnant", applies:["drug:carvedilol"], msg:"임신: 비선택 BB(카르베딜롤)는 β1 선택제(메토프롤롤·비소프롤롤)로 전환 권고(I/C) + 모체·태아 감시" },
  { id:"hf:flag:nsaid", lv:"warn", when:"nsaid", msg:"NSAID·COX-2 억제제 사용 중: HF 악화·입원 위험(III/B2)" },
  { id:"hf:flag:kbinder_kr", lv:"info", when:"potassium > TH.mra_k_reduce_gt", msg:"칼륨결합제: ESC 2026 권고표 없음(결과 개선 불확실). 국내는 로켈마만 허가(패티로머 미허가)" },
  { id:"hf:flag:sglt2i_product_hf", lv:"info", when:"matched(class:sglt2i)", msg:"SGLT2-I 급여는 '각 약제별 허가사항 범위 내' — 다파 단일제 10 mg 정상 77개 중 37개, 엠파 38개 중 11개만 HF 적응증(nedrug 2026-11-01). 포시가 취하. 처방 품목의 HF 적응증 확인" },
  { id:"hf:flag:kshf2026", lv:"info", when:"has_lvef", msg:"KSHF 2026(GRADE) 개정 진행 중 — 발표 전까지 한국 레이어는 KSHF 2022" }
];

/* ---------- 8. 고시 ---------- */
var NOTICES = {
  "notice:고시2023-120": { id:"notice:고시2023-120", label:"고시 제2023-120호", date:"2023-07-01", items:["drug:sacubitril_valsartan"], prev:"고시 제2022-56호(2022.3.1)" },
  "notice:고시2023-23":  { id:"notice:고시2023-23",  label:"고시 제2023-23호",  date:"2023-02-01", items:["drug:ivabradine"], prev:"고시 제2019-93호(2019.7.1)" },
  "notice:고시2023-165": { id:"notice:고시2023-165", label:"고시 제2023-165호", date:"2023-09-01", items:["drug:vericiguat"], prev:"신설" },
  "notice:고시2024-20":  { id:"notice:고시2024-20",  label:"고시 제2024-20호",  date:"2024-02-01", items:["drug:finerenone"], prev:"신설(DKD) — 이후 개정 없음" },
  "notice:고시2025-15":  { id:"notice:고시2025-15",  label:"고시 제2025-15호",  date:"2025-02-01", items:["drug:dapagliflozin","drug:empagliflozin"], prev:"(이력) SGLT2-I LVEF >40% HF 확대" },
  "notice:고시2025-102": { id:"notice:고시2025-102", label:"고시 제2025-102호", date:"2025-07-01", items:["drug:dapagliflozin","drug:ferric_carboxymaltose"], prev:"다파: 2025-15 / 철분주사: 2024-72(2024.5.1)" },
  "notice:고시2025-169": { id:"notice:고시2025-169", label:"고시 제2025-169호", date:"2025-10-24", items:["drug:empagliflozin"], prev:"(이력)" },
  "notice:고시2026-159": { id:"notice:고시2026-159", label:"고시 제2026-159호", date:"2026-08-01", items:["drug:empagliflozin"], prev:"고시 제2025-169호(2025.10.24)" },
  "notice:고시2026-69":  { id:"notice:고시2026-69",  label:"고시 제2026-69호",  date:"2026-04-01", items:["drug:tafamidis","drug:vutrisiran"], prev:"타파미디스: 2025-37(2025.3.1) / 부트리시란 신설" }
};

/* ---------- 9. 급여 (HIRA 원문 2026-11-01) ---------- */
/* gate: {op, conds:[ {txt, when} | 하위 gate ]}. fixed: 기준 자체가 없음/비급여. selective: 선별급여 경로. fallback: 다른 급여 경로 안내 */
var REIMB_2026 = {
  "hf:reimb26:arni": { id:"hf:reimb26:arni", drugs:["drug:sacubitril_valsartan"], notice:"notice:고시2023-120", title:"사쿠비트릴·발사르탄 (엔트레스토)",
    gate:{op:"AND",conds:[
      {txt:"좌심실 수축기능 저하 만성 HF, NYHA II–IV", when:"nyha >= TH.r_nyha_ge"},
      {txt:"LVEF ≤ 40%", when:"lvef <= TH.r_arni_lvef_le"},
      {txt:"표준치료(베타차단제·aldosterone antagonist 등)와 병용", when:"std_therapy"} ]},
    notes:["ACE 억제제 또는 ARB와의 병용투여는 인정하지 않음"] },
  "hf:reimb26:sglt2i": { id:"hf:reimb26:sglt2i", drugs:["drug:dapagliflozin","drug:empagliflozin"], notice:["notice:고시2025-102","notice:고시2026-159"], title:"다파글리플로진·엠파글리플로진 — 비당뇨 만성 HF",
    gate:{op:"AND",conds:[
      {txt:"만성 HF NYHA II–IV", when:"nyha >= TH.r_nyha_ge"},
      {op:"OR",conds:[
        {op:"AND",label:"LVEF ≤40% 경로",conds:[
          {txt:"LVEF ≤ 40%", when:"lvef <= TH.r_sglt_lvef_le"},
          {txt:"표준치료(ACE-I/ARB/ARNI + BB·MRA 등) 안정용량 투여 중", when:"std_therapy"} ]},
        {op:"AND",label:"LVEF >40% 경로",conds:[
          {txt:"LVEF > 40%", when:"lvef > TH.r_sglt_lvef_le"},
          {txt:"HF 증상 및 징후", when:"hf_symptom"},
          {op:"OR",conds:[
            {txt:"NT-proBNP ≥125 또는 BNP ≥35에 부합하는 구조·기능 이상 객관적 증거", when:"ntprobnp >= TH.r_sglt_nt_ge || bnp >= TH.r_sglt_bnp_ge"},
            {txt:"12개월 이내 HF 악화로 응급실 방문 또는 입원", when:"hf_admission_12mo"} ]} ]} ]} ]},
    fallback:{ when:"t2dm", status:"general", note:"제2형 당뇨: [일반원칙] 당뇨병용제 세부사항 범위 내 급여" },
    notes:["다른 HF 표준치료와 병용","각 약제별 허가사항 범위 내 — HF 적응증 없는 품목은 HF 급여 대상 아님(포시가 취하)"] },
  "hf:reimb26:vericiguat": { id:"hf:reimb26:vericiguat", drugs:["drug:vericiguat"], notice:"notice:고시2023-165", title:"베리시구앗 (베르쿠보)",
    gate:{op:"AND",conds:[
      {txt:"좌심실 수축기능 저하 만성 HF, NYHA II–IV", when:"nyha >= TH.r_nyha_ge"},
      {txt:"LVEF < 45%", when:"lvef < TH.r_veri_lvef_lt"},
      {txt:"4주 이상 표준치료(ACE-I/ARB/ARNI + BB·aldosterone antagonist 등)에도", when:"std_therapy_4wk"},
      {op:"OR",conds:[
        {txt:"6개월 이내 HF 입원", when:"hfh_6mo"},
        {txt:"3개월 이내 외래 정맥 이뇨제(충분한 내약용량 경구 이뇨제 후)", when:"ivdiur_3mo"} ]},
      {op:"OR",conds:[
        {txt:"동리듬: BNP ≥300 또는 NT-proBNP ≥1,000", when:"sinus_rhythm && (bnp >= TH.r_veri_bnp_sr_ge || ntprobnp >= TH.r_veri_nt_sr_ge)"},
        {txt:"심방세동: BNP ≥500 또는 NT-proBNP ≥1,600", when:"af && (bnp >= TH.r_veri_bnp_af_ge || ntprobnp >= TH.r_veri_nt_af_ge)"} ]} ]},
    notes:["다른 HF 표준치료와 병용","표준치료 약제를 부작용·금기로 못 쓰면 투여소견서 첨부 시 사례별 인정","국내 허가 자체가 'HF 입원 또는 외래 IV 이뇨제 경험' 환자 한정"] },
  "hf:reimb26:ivabradine": { id:"hf:reimb26:ivabradine", drugs:["drug:ivabradine"], notice:"notice:고시2023-23", title:"이바브라딘 (프로코라란)",
    gate:{op:"AND",conds:[
      {txt:"좌심실 수축기능 저하 만성 HF, NYHA II–IV", when:"nyha >= TH.r_nyha_ge"},
      {txt:"동리듬", when:"sinus_rhythm"},
      {txt:"심박수 ≥ 75/분", when:"hr >= TH.r_ivab_hr_ge"},
      {txt:"LVEF ≤ 35%", when:"lvef <= TH.r_ivab_lvef_le"},
      {op:"OR",conds:[
        {txt:"베타차단제 금기 또는 내약성 불량", when:"bb_intol"},
        {txt:"BB·ACE-I(또는 ARB)·aldosterone antagonist 포함 표준치료 4주 사용 후 병용", when:"std_therapy_4wk"} ]} ]},
    selective:{ txt:"나머지 조건 충족 + LVEF 35% 초과 40% 이하 → 선별급여(본인부담 50%)",
      when:"nyha >= TH.r_nyha_ge && sinus_rhythm && hr >= TH.r_ivab_hr_ge && lvef > TH.r_ivab_lvef_le && lvef <= TH.r_ivab_sel_lvef_le && (bb_intol || std_therapy_4wk)" } },
  "hf:reimb26:finerenone": { id:"hf:reimb26:finerenone", drugs:["drug:finerenone"], notice:"notice:고시2024-20", title:"피네레논 (케렌디아)",
    gate:{op:"AND",label:"DKD 경로(HF 아님)",conds:[
      {txt:"제2형 당뇨 동반 CKD 성인", when:"t2dm && ckd"},
      {txt:"ACE-I 또는 ARB 최대허용 4주 이상 안정 투여 중", when:"raasi_max_4wk"},
      {txt:"uACR >300 mg/g 또는 dipstick 1+ 이상", when:"uacr > TH.r_fine_uacr_gt"},
      {txt:"25 ≤ eGFR < 75", when:"egfr >= TH.r_fine_egfr_ge && egfr < TH.r_fine_egfr_lt"},
      {txt:"지속 증상 만성 HF(NYHA II–IV)가 아닐 것", when:"!(nyha >= TH.r_nyha_ge)"} ]},
    fail_status:"no",
    notes:["만성 심부전(LVEF ≥40%) 적응증은 허가(2025)되었으나 HF 급여기준 없음 → 심부전 처방은 비급여","eGFR <15로 감소하면 투여 중단"] },
  "hf:reimb26:iv_iron": { id:"hf:reimb26:iv_iron", drugs:["drug:ferric_carboxymaltose"], notice:"notice:고시2025-102", title:"철분주사제 (페린젝트·베노훼럼)",
    gate:{op:"OR",conds:[
      {op:"AND",label:"일반 환자",conds:[
        {txt:"Hb ≤ 10 g/dL (임신부 11)", when:"hb <= TH.r_iron_hb_le"},
        {txt:"경구투여 곤란", when:"oral_iron_difficult"},
        {txt:"ferritin < 30 또는 TSAT < 20%", when:"ferritin < TH.r_iron_ferritin_lt || tsat < TH.r_iron_tsat_lt"} ]},
      {op:"AND",label:"비투석 CKD",conds:[
        {txt:"투석 중이 아닌 만성신부전", when:"ckd"},
        {txt:"Hb ≤ 10 g/dL", when:"hb <= TH.r_iron_hb_le"},
        {txt:"경구투여 곤란", when:"oral_iron_difficult"},
        {txt:"ferritin < 100 또는 TSAT < 20%", when:"ferritin < TH.r_iron_ckd_ferritin_lt || tsat < TH.r_iron_tsat_lt"} ]} ]},
    notes:["매월 혈액검사·철결핍 확인 검사결과·투여소견서 첨부","HF 철결핍(빈혈 없음) 조항 없음 — v1 '빈혈 무관 인정'은 정정(HE5)","투석 CKD에는 FCM 제외"] },
  "hf:reimb26:glp1": { id:"hf:reimb26:glp1", drugs:["drug:semaglutide","drug:tirzepatide"], title:"세마글루타이드·터제파타이드",
    fixed:"no", fallback:{ when:"t2dm", status:"general", note:"제2형 당뇨는 당뇨병용제 기준(오젬픽 고시 제2026-24호 등)으로 별도 판단" },
    notes:["HF 적응증 없음 · 체중관리 목적은 비급여"] },
  "hf:reimb26:tafamidis": { id:"hf:reimb26:tafamidis", drugs:["drug:tafamidis"], notice:"notice:고시2026-69", title:"타파미디스 61 mg (빈다맥스) — ATTR-CM", fixed:"library",
    notes:["ATTR-CM 확진(영상 의심 + AL 배제 + PYP/DPD/HMDP grade 2–3 또는 조직) 성인: 유전형, 또는 정상형 + 6개월 NYHA I–III + 6개월 내 HF 입원 ≥1 + NT-proBNP ≥600 + 이완기말 LV 벽두께 ≥12 mm",
           "제외: 간·심장이식, 기계적 심장보조장치 · 12개월마다 반응평가 · 중지: NYHA IV, LVWT +2 mm, LVEF −5%p","부트리시란 병용 불인정 · 심장 관련 전문의 처방·자료 제출"] },
  "hf:reimb26:vutrisiran": { id:"hf:reimb26:vutrisiran", drugs:["drug:vutrisiran"], notice:"notice:고시2026-69", title:"부트리시란 (암부트라)", fixed:"no",
    notes:["급여는 TTR-FAP(다발신경병증) 1·2단계만, NYHA > II 제외 → ATTR-CM 적응 비급여"] }
};
/* 급여 규칙 → 관련 v1 정정 */
var REIMB_ERRATA = { "hf:reimb26:vericiguat":["hf:err:HE1"], "hf:reimb26:sglt2i":["hf:err:HE6","hf:err:HE2"], "hf:reimb26:finerenone":["hf:err:HE3","hf:err:HE4"],
  "hf:reimb26:iv_iron":["hf:err:HE5"], "hf:reimb26:ivabradine":["hf:err:HE7"] };
var REIMB_STATUS = {
  ok:{label:"급여 충족", tone:"cover"}, selective:{label:"선별급여(본인부담 50%)", tone:"cond"}, unmet:{label:"급여 조건 미충족", tone:"noncover"},
  no:{label:"비급여(HF 급여기준 없음)", tone:"noncover"}, general:{label:"일반 원칙(세부기준 없음)", tone:"cond"},
  na:{label:"국내 미허가", tone:"noncover"}, library:{label:"도서관 참조", tone:"cond"}
};

/* ---------- 10. 지침 ⟷ 허가·급여 상충 ---------- */
var CONFLICTS = [
  { id:"hf:conf26:arni_4149", when:"band4149 && symptomatic", recs:["hf:rec26:ref_acei_arni"], reimb:"hf:reimb26:arni",
    gl:"ESC 2026: LVEF 41–49%도 HFrEF → ACE-I/ARNI I/A(외삽)", rb:"급여: LVEF ≤40%만(고시 2023-120) — 41–49%는 ARNI 비급여" },
  { id:"hf:conf26:vericiguat_worsening", when:"pheno26 == ref && symptomatic && lvef < TH.vericiguat_lvef_lt && !(hfh_6mo || ivdiur_3mo)", recs:["hf:rec26:ref_vericiguat"], reimb:"hf:reimb26:vericiguat",
    gl:"ESC 2026: 최적 FMT에도 LVEF <45% 증상 HFrEF IIb/B1 — 악화 사건 요건 없음", rb:"허가: HF 입원/외래 IV 이뇨제 경험자 한정 · 급여: 6개월 입원 또는 3개월 외래 IV 이뇨제 + 리듬별 NP 컷 + 4주 표준치료" },
  { id:"hf:conf26:mra_pef_finerenone", when:"pheno26 == pef && symptomatic", recs:["hf:rec26:all_mra"], reimb:"hf:reimb26:finerenone",
    gl:"ESC 2026: HFpEF에 nsMRA(피네레논) 포함 MRA I/A", rb:"허가 있음(LVEF ≥40%) · HF 급여기준 없음 → 비급여 (스피로노락톤은 세부기준 없는 일반 원칙)" },
  { id:"hf:conf26:iron_nonanemic", when:"pheno26 == ref && symptomatic && iron_def && !(hb <= TH.r_iron_hb_le)", recs:["hf:rec26:iron_sym","hf:rec26:iron_hfh"], reimb:"hf:reimb26:iv_iron",
    gl:"ESC 2026: 철결핍 증상 HFrEF IV 철분 I/B1 — 빈혈 무관", rb:"급여: Hb ≤10 + ferritin <30 또는 TSAT <20 + 경구 곤란(고시 2025-102) — 비빈혈 HF 철결핍은 비급여" },
  { id:"hf:conf26:glp1_pef", when:"symptomatic && lvef >= TH.glp1_lvef_ge && bmi >= TH.glp1_bmi_ge", recs:["hf:rec26:obesity_glp1"], reimb:"hf:reimb26:glp1",
    gl:"ESC 2026: LVEF ≥45% + BMI ≥30 세마/터제 IIa/B1", rb:"HF 적응증 없음(체중관리 허가) · 비급여" },
  { id:"hf:conf26:ivab_hr", when:"pheno26 == ref && sinus_rhythm && lvef <= TH.ivab_lvef_le && hr > TH.ivab_hr_gt && hr < TH.r_ivab_hr_ge", recs:["hf:rec26:ref_ivab"], reimb:"hf:reimb26:ivabradine",
    gl:"ESC 2026: 안정시 HR >70", rb:"허가·급여: HR ≥75 (고시 2023-23) · LVEF 35–40%는 선별급여 50%" }
];

/* ---------- 11. v1 정정 ---------- */
var ERRATA = [
  { id:"hf:err:HE1", v1:"REIMB(베리시구앗 없음)", v1_value:"급여 정보 공백", current:"고시 2023-165(2023.9.1) 급여 — LVEF <45%·악화 사건·리듬별 NP·4주 표준치료", src:"HIRA" },
  { id:"hf:err:HE2", v1:"DRUGS.drug:dapagliflozin.brand", v1_value:"포시가 등(제네릭)", current:"포시가 허가 취하. HF 적응증 보유 제네릭만 HF 급여(단일제 10 mg 77개 중 37개, 2026-11-01)", src:"nedrug" },
  { id:"hf:err:HE3", v1:"DRUGS.drug:finerenone", v1_value:"HF 허가 언급 없음", current:"2025 만성 심부전(LVEF ≥40%) 허가. HF 급여기준은 없음 → 비급여 유지", src:"nedrug·HIRA" },
  { id:"hf:err:HE4", v1:"DRUGS.drug:finerenone.target", v1_value:"20 mg qd", current:"HF: eGFR ≥60 → 목표 40 mg / 25–<60 → 20 mg (v1은 DKD 용량)", src:"nedrug" },
  { id:"hf:err:HE5", v1:"REIMB.hf:reimb:iv_iron.defense", v1_value:"빈혈 유무 무관하게 철결핍 기준 충족 시 인정", current:"급여는 Hb ≤10 + ferritin <30 또는 TSAT <20 + 경구 곤란(일반) — 비빈혈 HF 조항 없음", src:"HIRA 2025-102" },
  { id:"hf:err:HE6", v1:"REIMB.hf:reimb:sglt2i.notice", v1_value:"고시 번호 미기재", current:"다파 고시 2025-102(2025.7.1) · 엠파 고시 2026-159(2026.8.1)", src:"HIRA" },
  { id:"hf:err:HE7", v1:"REIMB.hf:reimb:ivabradine", v1_value:"HR ≥70, 선별급여 누락", current:"HR ≥75 · LVEF 35–40% 선별급여 본인부담 50%(고시 2023-23)", src:"HIRA·nedrug" },
  { id:"hf:err:HE8", v1:"DRUGS.drug:patiromer / AXES axis:kbinder", v1_value:"처방 후보로 노출", current:"국내 미허가 — 국내 칼륨결합제는 로켈마(SZC)만", src:"nedrug" },
  { id:"hf:err:HE10", v1:"—", v1_value:"—", current:"ESC 2026 신규 디기톡신은 국내 미허가 — 엔진 제외, 도서관 서술만", src:"nedrug" }
];
var SUPERSEDED_V1 = {
  "hf:rec:rEF_arni":["hf:rec26:ref_acei_arni","hf:rec26:ref_switch_arni"], "hf:rec:rEF_acei":["hf:rec26:ref_acei_arni","hf:rec26:ref_arb"],
  "hf:rec:rEF_bb":["hf:rec26:ref_bb"], "hf:rec:rEF_mra":["hf:rec26:all_mra"], "hf:rec:rEF_sglt2i":["hf:rec26:all_sglt2i"],
  "hf:rec:mrEF_sglt2i":["hf:rec26:all_sglt2i"], "hf:rec:pEF_sglt2i":["hf:rec26:all_sglt2i"], "hf:rec:mrEF_other":["hf:rec26:all_mra","hf:rec26:pef_raas"],
  "hf:rec:pEF_comorbid":["hf:rec26:prev_bp","hf:rec26:obesity_glp1"], "hf:rec:diuretic":["hf:rec26:loop_dynamic"],
  "hf:rec:ivabradine":["hf:rec26:ref_ivab","hf:rec26:ref_ivab_bbintol"], "hf:rec:vericiguat":["hf:rec26:ref_vericiguat"],
  "hf:rec:hyd_isdn":["hf:rec26:ref_hisdn_black","hf:rec26:ref_hisdn_intol"], "hf:rec:digoxin":["hf:rec26:ref_glycoside"],
  "hf:rec:iron":["hf:rec26:iron_sym","hf:rec26:iron_hfh"], "hf:rec:hk_binder":[]
};
var NOTES_KR = {
  "hf:note:kshf_arni_first":"KSHF 2022: 증상 HFrEF에서 ARNI를 ACE-I/ARB보다 우선 고려(한국 레이어). ESC 2026은 ACE-I와 동격, ACE-I/ARB → ARNI 전환 I/B1",
  "hf:note:kbinder":"v1의 칼륨결합제 권고(ACC 2022 IIb)는 ACC 레이어로 유지 — ESC 2026 권고표에는 없음, REALIZE-K에서 SZC의 HF 악화 신호(검정력 부족)"
};

/* ---------- 12. 입력 (v1 폼 위 가산 카드) — v1 입력(lvef·nyha·egfr·potassium·ntprobnp·bnp·hr·ferritin·tsat·uacr·칩)은 v1 DOM에서 읽음 ---------- */
var INPUTS = [
  { k:"prior_lvef", label:"이전 LVEF (%)", type:"number", ph:"HFimpEF 판정" },
  { k:"sbp", label:"수축기 혈압", type:"number", ph:"mmHg" },
  { k:"hb", label:"Hb (g/dL)", type:"number", ph:"철분 급여" },
  { k:"bmi", label:"BMI", type:"number", ph:"kg/m²" },
  { k:"setting", label:"진료 상황", type:"select", opts:[["","외래(기본)"],["inpatient","입원 DHF·초기 안정화 후"]] },
  { k:"stage", label:"HF 병기", type:"select", opts:[["","C/D(기본)"],["A","A 위험인자"],["B","B 구조이상·무증상"]] },
  { k:"congestion", label:"울혈 증상·징후", type:"chip" },
  { k:"af", label:"심방세동", type:"chip" },
  { k:"std_therapy_4wk", label:"표준치료 4주 이상", type:"chip" },
  { k:"hfh_6mo", label:"6개월 내 HF 입원", type:"chip" },
  { k:"ivdiur_3mo", label:"3개월 내 외래 IV 이뇨제", type:"chip" },
  { k:"bb_intol", label:"BB 금기·불내성", type:"chip" },
  { k:"raas_intol", label:"ACE-I/ARNI 불내성", type:"chip" },
  { k:"raas_all_intol", label:"ARB까지 불내성", type:"chip" },
  { k:"oral_iron_difficult", label:"경구 철분 곤란", type:"chip" },
  { k:"post_mi", label:"MI 후", type:"chip" },
  { k:"pregnant", label:"임신", type:"chip" },
  { k:"nsaid", label:"NSAID 복용", type:"chip" }
];
var V1_INPUT_KEYS = { num:["lvef","nyha","egfr","potassium","ntprobnp","bnp","hr","ferritin","tsat","uacr"],
  bool:["sinus_rhythm","std_therapy","bb_max_or_intol","hf_symptom","hf_admission_12mo","t2dm","ckd","raasi_max_4wk"] };

/* ---------- 13. 시뮬레이션 증례 (입력만 — 판정은 엔진) ---------- */
var SIM_CASES = [
  { id:"hf:sim26:c1", title:"HFrEF 30% · 동리듬 HR 78 · 표준치료 4주", p:{lvef:30,nyha:2,egfr:65,potassium:4.4,sbp:118,hr:78,ntprobnp:1800,sinus_rhythm:true,std_therapy:true,std_therapy_4wk:true,hf_symptom:true},
    point:"FMT 4계열 + ARNI·SGLT2-I 급여 충족 · 이바브라딘 급여 충족(HR ≥75)" },
  { id:"hf:sim26:c2", title:"LVEF 45% · NYHA II · NT-proBNP 900", p:{lvef:45,nyha:2,egfr:70,potassium:4.2,ntprobnp:900,hf_symptom:true,std_therapy:true,sinus_rhythm:true,hr:68},
    point:"ESC HFrEF(외삽) ⟷ KSHF HFmrEF · ARNI 급여 상충 · SGLT2-I LVEF >40 경로 충족" },
  { id:"hf:sim26:c3", title:"HFpEF 58% · BMI 33 · 비당뇨", p:{lvef:58,nyha:2,egfr:72,potassium:4.3,ntprobnp:600,bmi:33,hf_symptom:true,sinus_rhythm:true},
    point:"SGLT2-I 급여 · MRA(피네레논 비급여 상충) · GLP-1 IIa 비급여 상충" },
  { id:"hf:sim26:c4", title:"HFrEF 32% · AF · 6개월 내 입원 · NT-proBNP 2000", p:{lvef:32,nyha:3,egfr:55,potassium:4.6,ntprobnp:2000,hr:80,af:true,hfh_6mo:true,std_therapy:true,std_therapy_4wk:true,hf_symptom:true,hf_admission_12mo:true},
    point:"베리시구앗 급여 충족(AF 컷 1,600) · 이바브라딘 제외(동리듬 아님) · AF 율동조절 BB/디곡신" },
  { id:"hf:sim26:c5", title:"입원 DHF 안정화 · LVEF 25% · 울혈", p:{lvef:25,nyha:4,egfr:48,potassium:4.0,ntprobnp:6000,setting:"inpatient",congestion:true,hf_symptom:true,sinus_rhythm:true,hr:92},
    point:"원내 SGLT2-I I/B1 · IV 고리이뇨제 I/A · 아세타졸아미드/HCTZ IIa/B1 · 6주 내 FMT 증량" },
  { id:"hf:sim26:c6", title:"임신 HFrEF 35% · K⁺ 5.6", p:{lvef:35,nyha:2,egfr:90,potassium:5.6,pregnant:true,hf_symptom:true,sinus_rhythm:true,hr:88},
    point:"RAAS·MRA·SGLT2-I·이바브라딘 금기(III/C) · β1 선택 BB 전환 · K⁺ 경고" }
];

/* ---------- 14. 출처 ---------- */
var SOURCES = [
  { id:"src:esc2026", label:"2026 ESC Guidelines for the management of heart failure (Eur Heart J 2026;47(38):5346) — 권고는 의역, 원문 미수록", url:"https://doi.org/10.1093/eurheartj/ehag100", kind:"guideline" },
  { id:"src:kshf2022", label:"대한심부전학회 심부전 진료지침 2022", url:"https://www.kshf.or.kr/heart/heart_04_04.php", kind:"guideline" },
  { id:"src:kshf2026_news", label:"KSHF 2026 개정 진행(메디칼타임즈 2026-09-11, 2차)", url:"https://medicaltimes.com/Main/News/NewsView.html?ID=1170669", kind:"secondary" },
  { id:"src:hira_list", label:"심평원 보험인정기준 — 고시 2023-120·2023-23·2023-165·2024-20·2025-102·2026-159·2026-69 (2026-11-01 원문 확인)", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrList.do?pgmid=HIRAA030069000400", kind:"reimb" },
  { id:"src:nedrug_kerendia", label:"의약품안전나라 — 케렌디아 허가사항(만성 심부전 LVEF ≥40% 용법)", url:"https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=202201902", kind:"label" },
  { id:"src:nedrug_verquvo", label:"의약품안전나라 — 베르쿠보 허가사항", url:"https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=202107708", kind:"label" },
  { id:"src:nedrug_search", label:"의약품안전나라 — 의약품 검색(다파·엠파 HF 적응증 품목 확인)", url:"https://nedrug.mfds.go.kr/searchDrug", kind:"label" }
];
var LOCAL_MAP = { "gl:esc-hf-2023":"gl:hf:esc-2023fu", "anemia:gl":"gl:esc-hf-2023 ≡ gl:hf:esc-2023fu (통합 시 alias)" };

var LIB = {
  concepts:[
    "HFrEF = LVEF <50%(ESC 2026). HFmrEF 폐지. HFpEF = LVEF ≥50% + 구조·기능 이상 객관 증거 + NP 상승",
    "'급성 HF' → '비대상성 HF(DHF)'로 용어 변경",
    "HF 병기 A–D 채택 — 위험인자 단계부터 진행성 HF까지",
    "치료 분류 신설: FMT(기본) · AMT(추가) · GDIT(시술·기기)",
    "HFimpEF: 이전 대비 절대 +10%p 이상 & 40% 초과 — FMT 유지",
    "ESC 2026 신규 권고 39개 · LoE 체계 A/B1/B2/C"
  ],
  kshf2026:"KSHF 2026: 2026-09 공청회, GRADE(근거 4단계·EtD) 전환, 주요 질문 — HFimpEF 감량, HFpEF/HFmrEF 전략(SGLT2-I·ARNI·nsMRA·GLP-1), 입원 중 조기 치료, ATTR-CM 신약. 발표 시 별도 개정"
};

return { META:META, GUIDELINES:GUIDELINES, REC_SYSTEMS:REC_SYSTEMS, TIERS:TIERS, AXIS_TIER:AXIS_TIER, TH:TH, PHENO26:PHENO26, PHENO_MAP:PHENO_MAP,
  CLASS_ADD:CLASS_ADD, CLASS_EXTEND:CLASS_EXTEND, DRUG_ADD:DRUG_ADD, DRUG_STATUS:DRUG_STATUS, REC_2026:REC_2026, DOSE_2026:DOSE_2026, DOSE_SRC:DOSE_SRC,
  SAFETY:SAFETY, NOTICES:NOTICES, REIMB_2026:REIMB_2026, REIMB_ERRATA:REIMB_ERRATA, REIMB_STATUS:REIMB_STATUS, CONFLICTS:CONFLICTS, ERRATA:ERRATA, SUPERSEDED_V1:SUPERSEDED_V1,
  NOTES_KR:NOTES_KR, INPUTS:INPUTS, V1_INPUT_KEYS:V1_INPUT_KEYS, SIM_CASES:SIM_CASES, SOURCES:SOURCES, LOCAL_MAP:LOCAL_MAP, LIB:LIB };
})();
