/* ===================================================================
   dyslipidemia v2 — DATA (가산 전용) · 이상지질혈증 진료지침 2026 반영
   SPEC: claude/이상지질혈증_개정SPEC_v2.md (v2.1)
   규칙: 기존 v1 상수는 수정하지 않는다. 수치는 기존 상수를 ID로 참조한다.
   =================================================================== */

/* ---------- §1 GL·권고체계 ---------- */
const GUIDELINES = {
  "gl:dyslipidemia:ksla-2022": { topic:"dyslipidemia", title:"이상지질혈증 진료지침 제5판", source_org:"한국지질·동맥경화학회", year:2022, effective:"2022-11-30", status:"superseded", superseded_by:"gl:dyslipidemia:ksla-2026", supersedes:[], recsys:"recsys:ksla", layer:"L1", revision_count:0, retired_eligible:"2032-11-30", source:"external", url:"https://www.lipid.or.kr/uploaded/board/guideline/_ce93749f6bdf94453c23ace0baa9c8421.pdf" },
  "gl:dyslipidemia:ksla-2026": { topic:"dyslipidemia", title:"이상지질혈증 진료지침 2026", source_org:"한국지질·동맥경화학회", year:2026, effective:"2026-09-10", status:"active", superseded_by:null, supersedes:["gl:dyslipidemia:ksla-2022"], recsys:"recsys:ksla", layer:"L1", revision_count:1, retired_eligible:"2036-09-10", source:"external", url:"https://www.lipid.or.kr/reference/guideline.php?boardid=guideline&mode=view&idx=1456" },
  "gl:dyslipidemia:acc-aha-2026": { topic:"dyslipidemia", title:"2026 ACC/AHA/Multisociety Guideline on the Management of Dyslipidemia", source_org:"ACC/AHA 외", year:2026, effective:"2026-03-13", status:"active", superseded_by:null, supersedes:[], recsys:"recsys:acc-aha", layer:"L1'", revision_count:0, retired_eligible:"2036-03-13", source:"external", url:"https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423" }
};

const REC_SYSTEMS = {
  "recsys:ksla":   { label:"KSoLA", grades:{ "I":{norm:"A",rank:1,txt:"권고한다"}, "IIa":{norm:"B",rank:2,txt:"고려한다"}, "IIb":{norm:"C",rank:3,txt:"고려할 수 있다"}, "III":{norm:"X",rank:9,txt:"권고하지 않는다"} }, loe:["A","B","C","E"] },
  "recsys:acc-aha":{ label:"ACC/AHA", grades:{ "1":{norm:"A",rank:1,txt:"Is recommended"}, "2a":{norm:"B",rank:2,txt:"Is reasonable"}, "2b":{norm:"C",rank:3,txt:"May be considered"}, "3":{norm:"X",rank:9,txt:"No benefit / Harm"} }, loe:["A","B-R","B-NR","C-LD","C-EO","pending"] }
};

/* ---------- §2-1 목표 (수치는 RISK_STRATA 참조, 복제 금지) ---------- */
const TARGETS_2026 = {
  "lipid:tgt:ldl55":  { stratumRef:"lipid:risk:veryhigh" },
  "lipid:tgt:ldl70":  { stratumRef:"lipid:risk:high" },
  "lipid:tgt:ldl100": { stratumRef:"lipid:risk:mod_dm" },
  "lipid:tgt:ldl130": { stratumRef:"lipid:risk:moderate" },
  "lipid:tgt:ldl160": { stratumRef:"lipid:risk:low" },
  "lipid:tgt:codrop50": { op:"reduction>=", value:50, unit:"%" },
  "lipid:tgt:fh_adult_ascvd": { ref:"lipid:tgt:ldl55", alsoRef:"lipid:tgt:codrop50" },
  "lipid:tgt:fh_adult":       { ref:"lipid:tgt:ldl70", alsoRef:"lipid:tgt:codrop50" },
  "lipid:tgt:fh_child": { op:"<", value:115, unit:"mg/dL", note:"KSoLA 2026 요약·본문 기준(권고표 p44 잔존 표기 135와 상충 — 근거자료집 §9-A)" },
  "lipid:tgt:child":    { op:"<", value:130, unit:"mg/dL" }
};
function lipidTargetValue(id){ /* 참조 해석: 값은 RISK_STRATA가 유일 소유 */
  var t = TARGETS_2026[id]; if(!t) return null;
  if(t.stratumRef){ var s = RISK_STRATA[t.stratumRef]; return s ? { ldl:s.ldlTarget, nonhdl:s.nonhdlTarget } : null; }
  if(t.ref) return lipidTargetValue(t.ref);
  return { value:t.value, op:t.op, unit:t.unit };
}

/* ---------- §2-2·2-3 REC ---------- */
/* 필드: id, gl, when, recommend, g(원본등급), loe, text, change, sup(supersedes), src */
const REC_2026_RAW = [
/* 관상동맥질환 */
["ksla2026:cad_ldl55_50pct","ksla","has(cad)","lipid:tgt:ldl55|lipid:tgt:codrop50","I","A","관상동맥질환: LDL-C <55 그리고 기저 대비 ≥50% 감소","maintained","r_ldl55_cad,r_50pct_codrop","p43,p111"],
["ksla2026:acs_hi_statin","ksla","has(acs) || has(mi)","class:statin","I","A","ACS·급성심근경색: 기저 LDL 무관 가능한 빨리 고강도 스타틴","maintained","r_ami_immediate","p43"],
["ksla2026:cad_nonstatin_early","ksla","has(cad)","drug:ezetimibe|class:pcsk9i","I","B","CAD: 스타틴만으로 목표 미달 또는 조기 달성 필요 시 에제티미브 또는 PCSK9 억제제 병용","new","r_ladder","p43,p111"],
["ksla2026:acs_initial_combo","ksla","has(acs)","class:statin|drug:ezetimibe","IIa","B","ACS: 초기부터 최대 가용 스타틴+에제티미브 병용으로 조기 목표 도달","new","r_ladder","p43,p111"],
["ksla2026:acs_inhosp_intensify","ksla","has(acs) && on_llt","class:statin","I","C","기존 지질강하요법 중 ACS: 입원 기간 내 치료 강화","new","","p111"],
["ksla2026:cad_intol_bempedoic","ksla","has(cad) && statin_intolerant","drug:bempedoic_acid","IIa","B","스타틴 불내성 CAD: 목표 도달 위해 벰페도익산","new","","p111,p161"],
/* 비심장성 혈관질환·뇌졸중 */
["ksla2026:ncv_ldl70_50pct","ksla","has(ischemic_stroke) || has(tia) || has(pad) || has(carotid) || has(aaa)","lipid:tgt:ldl70|lipid:tgt:codrop50","I","A","뇌혈관질환·PAD·유의 경동맥질환·AAA: ≥50% 감소 그리고 <70","maintained","r_50pct_codrop","p43"],
["ksla2026:stroke_recur_ldl55_opt","ksla","(has(ischemic_stroke) || has(tia)) && recurrent_stroke_highrisk","lipid:tgt:ldl55","IIa","B","재발성 죽상경화성 허혈뇌졸중 위험 높음: LDL-C <55 고려(선택)","new","","p43,p168"],
["ksla2026:stroke_eval_etiology","ksla","has(ischemic_stroke)","","I","E","허혈뇌졸중: 발병 원인·죽상경화증 동반 평가","maintained","","p168"],
["ksla2026:stroke_hi_statin","ksla","has(ischemic_stroke) && !has(cad) && ldl >= 100","class:statin","I","A","CAD·심장성 색전원 없고 LDL ≥100: 이차예방 고강도 스타틴","maintained","","p168"],
["ksla2026:stroke_athero_eze70","ksla","has(ischemic_stroke) || has(tia)","class:statin|drug:ezetimibe","I","B","두개강 내·외 협착·대동맥 플라크·CAD 병력: 스타틴 우선, 필요 시 에제티미브로 <70","maintained","","p168"],
["ksla2026:stroke_pcsk9","ksla","has(ischemic_stroke) && rf_count >= 1","class:pcsk9i","IIa","B","죽상경화+위험요인 동반 허혈뇌졸중: 최대 스타틴+에제티미브에도 ≥70이면 PCSK9 억제제","new","","p168"],
/* 당뇨병 */
["ksla2026:dm_lipid_annual","ksla","dm","","I","E","당뇨: 진단 시·이후 매년 1회 이상 지질검사","maintained","","p172"],
["ksla2026:dm_panel","ksla","dm","lab:total_cholesterol|lab:hdl_c|lab:triglyceride|lab:ldl_c","I","A","지질검사: TC·HDL-C·TG·LDL-C","maintained","","p172"],
["ksla2026:dm_nonhdl_apob","ksla","dm","lab:non_hdl_c|lab:apolipoprotein_b","IIa","A","non-HDL-C·ApoB 측정 고려","maintained","","p172"],
["ksla2026:dm_ascvd_ldl55","ksla","dm && (has(cad) || has(ischemic_stroke) || has(pad))","lipid:tgt:ldl55|lipid:tgt:codrop50","I","A","ASCVD 동반 당뇨: <55 그리고 ≥50% 감소","maintained","","p172"],
["ksla2026:dm_high_ldl70_50pct","ksla","dm && (dm_years >= 10 || rf_count >= 1 || tod_count >= 1)","lipid:tgt:ldl70|lipid:tgt:codrop50","I","A","TOD·주요위험인자 동반 또는 2형 유병 ≥10년: <70 그리고 ≥50% 감소","upgraded","r_dm_tod","p43,p172"],
["ksla2026:dm_veryhigh_ldl55_opt","ksla","dm && (tod_count >= 1 || rf_count >= 3)","lipid:tgt:ldl55|lipid:tgt:codrop50","IIa","B","TOD 또는 주요위험인자 ≥3: <55 그리고 ≥50% 감소 선택적 고려","modified","r_dm_tod","p43,p172"],
["ksla2026:dm_low_ldl100","ksla","dm && dm_years < 10 && rf_count == 0 && tod_count == 0","lipid:tgt:ldl100","I","A","유병 <10년·위험인자 없음: LDL-C ≥100이면 약물","maintained","","p43,p172"],
["ksla2026:t1dm_long_tod","ksla","t1dm && dm_years >= 20 && tod_count >= 1","lipid:tgt:ldl70|lipid:tgt:codrop50","IIb","C","1형 20년+ 조기발현 + TOD: 고위험 2형과 동일","maintained","","p43,p172"],
["ksla2026:dm_statin_first","ksla","dm","class:statin","I","A","당뇨 이상지질혈증 일차약 스타틴","maintained","","p172"],
["ksla2026:dm_eze_add","ksla","dm && on_statin","drug:ezetimibe","IIa","B","최대 가용 스타틴 미달 → 에제티미브","maintained","","p172"],
["ksla2026:dm_ascvd_pcsk9","ksla","dm && (has(cad) || has(ischemic_stroke) || has(pad)) && on_ezetimibe","class:pcsk9i","IIa","A","ASCVD 당뇨: 에제티미브 후 미달 → PCSK9 억제제","maintained","","p172"],
["ksla2026:dm_followup","ksla","dm && on_llt","","I","E","투약 4–12주 후 지질검사로 반응·순응도 평가","maintained","","p172"],
["ksla2026:dm_tg_lifestyle","ksla","dm && tg >= 200","","I","B","고TG: 금주·체중감소·혈당조절 등 생활습관·이차요인 우선","maintained","","p172"],
["ksla2026:dm_tg500_drug","ksla","dm && tg > 500","drug:fenofibrate|drug:omega3","IIa","A","심한 고TG(>500): 페노피브레이트·오메가-3","maintained","","p172"],
["ksla2026:dm_tg_fenofibrate","ksla","dm && on_statin && tg >= 200","drug:fenofibrate","IIb","B","스타틴 후 TG ≥200 지속: 페노피브레이트","maintained","","p172"],
["ksla2026:dm_tg_epadha","ksla","dm && on_statin && tg >= 200","drug:omega3","IIb","E","스타틴 후 TG ≥200: EPA+DHA 혼합 오메가-3","maintained","","p172"],
["ksla2026:dm_ipe","ksla","dm && on_statin && tg >= 135 && tg <= 499","drug:icosapent_ethyl","IIa","B","고위험 당뇨, 스타틴 후 TG 135–499: IPE 4 g/일","upgraded","","p172"],
/* CKD */
["ksla2026:ckd_lipid_test","ksla","has(ckd)","lab:ldl_c|lab:triglyceride","I","C","CKD 첫 진단 시 이상지질혈증 검사","new","","p181"],
["ksla2026:ckd_high_risk","ksla","has(ckd)","","I","A","CKD = 심뇌혈관 고위험군 간주, LDL 저하 기본(수치 목표 없음)","maintained","","p181"],
["ksla2026:ckd_statin_eze","ksla","has(ckd) && !dialysis && (age >= 50 || egfr < 60)","class:statin|drug:ezetimibe","I","A","≥50세 또는 eGFR <60(비투석·비이식): 스타틴 또는 스타틴+에제티미브","maintained","","p181"],
["ksla2026:ckd_statin_stage12","ksla","has(ckd) && age >= 50 && egfr >= 60","class:statin","I","B","≥50세 그리고 eGFR ≥60(1–2단계): 스타틴","maintained","","p181"],
/* FH */
["ksla2026:fh_dx","ksla","fh_suspected","","I","C","FH: 임상기준 진단, 가능하면 유전검사로 확인","new","","p214"],
["ksla2026:fh_screen","ksla","fh_suspected","","I","C","선별: 남 <55·여 <60 CAD, 본인/가족 LDL >190(소아 >150), 가족 조기 CVD, 건황색종","new","","p214"],
["ksla2026:fh_cascade","ksla","fh","","I","C","첫 환자 진단 시 혈연가족 연쇄 선별검사","new","","p214"],
["ksla2026:fh_ascvd_ldl55","ksla","fh && (has(cad) || has(ischemic_stroke) || has(pad) || rf_count >= 1)","lipid:tgt:fh_adult_ascvd","IIa","C","ASCVD/주요위험요인 있는 성인 FH: <55 (+≥50%)","modified","","p44,p214"],
["ksla2026:fh_adult_ldl70","ksla","fh && rf_count == 0 && !has(cad) && !has(ischemic_stroke) && !has(pad)","lipid:tgt:fh_adult","IIa","C","ASCVD·위험요인 없는 성인 FH: <70 (+≥50%)","modified","","p44,p214"],
["ksla2026:fh_child_ldl115","ksla","fh && age < 19","lipid:tgt:fh_child","IIa","C","소아 FH: <115","modified","","p10,p219"],
/* 일차예방·특수 */
["ksla2026:mod_statin_ldl130","ksla","stratum == moderate && ldl >= 130","class:statin","IIa","B","중등도: 생활습관 후에도 LDL ≥130 → 스타틴","maintained","","p43"],
["ksla2026:mod_enhancer","ksla","stratum == moderate && ldl >= 100 && ldl < 130 && enh_count >= 1","class:statin","IIa","B","중등도 + 위험강화인자 + LDL 100–129: 스타틴으로 더 적극 강하","new","","p44"],
["ksla2026:cac_decision","ksla","stratum == moderate || stratum == low","","IIa","B","중등도·저위험: 관상동맥칼슘점수로 스타틴 결정 가능(한국인 절단값 미제시)","new","","p44"],
["ksla2026:low_statin_ldl160","ksla","stratum == low && ldl >= 160","class:statin","IIb","B","저위험: 생활습관 후 LDL ≥160 → 스타틴 고려 가능","maintained","","p44"],
["ksla2026:low_enhancer","ksla","stratum == low && enh_count >= 1","class:statin","IIb","B","저위험 + 위험강화인자: 더 적극 강하 고려 가능","new","","p44"],
["ksla2026:ldl190_secondary","ksla","ldl >= 190","","I","A","LDL ≥190: 이차 원인(담도폐쇄·신증후군·갑상선기능저하·임신·glucocorticoid·cyclosporine) 확인·교정","maintained","","p44"],
["ksla2026:ldl190_statin","ksla","ldl >= 190","class:statin","I","A","이차 원인 없이 LDL ≥190: 위험도 무관 스타틴","maintained","","p44"],
/* 약물 총론 */
["ksla2026:ldl_primary","ksla","true","lab:ldl_c","I","A","이상지질혈증 치료 일차 목표 LDL-C","maintained","","p111"],
["ksla2026:nonhdl_secondary","ksla","true","lab:non_hdl_c","IIa","A","LDL 조절 후 이차 목표 non-HDL-C","maintained","","p111"],
["ksla2026:statin_first","ksla","true","class:statin","I","A","스타틴 = 고콜레스테롤혈증 일차 선택","maintained","","p111"],
["ksla2026:lowmod_drug","ksla","stratum == moderate || stratum == low","class:statin","IIa","B","저·중간위험: 생활습관 개선에도 목표 이상 → 약물 고려","maintained","","p111"],
["ksla2026:intol_nonstatin","ksla","statin_intolerant","drug:ezetimibe|class:pcsk9i|drug:bempedoic_acid","IIa","B","스타틴 불내성: 에제티미브·PCSK9 억제제·벰페도익산 단독 또는 병용","modified","r_statin_intol","p111"],
["ksla2026:bas_add","ksla","on_statin","class:bile_acid_sequestrant","IIb","C","스타틴으로 목표 미달 → 담즙산 결합수지 병용","maintained","","p111"],
["ksla2026:niacin_combo","ksla","on_statin","class:niacin","III","A","스타틴+니코틴산 병용 권고 안 함","maintained","","p111"],
["ksla2026:ascvd_pcsk9","ksla","(has(cad) || has(ischemic_stroke) || has(pad) || has(carotid) || has(aaa)) && on_ezetimibe","class:pcsk9i","IIa","A","ASCVD: 최대 가용 스타틴+에제티미브에도 미달 → PCSK9 억제제","maintained","r_ladder","p111"],
["ksla2026:cad_ncv_eze_bempedoic","ksla","(has(cad) || has(ischemic_stroke) || has(tia) || has(pad) || has(carotid) || has(aaa)) && on_statin","drug:ezetimibe|drug:bempedoic_acid","IIa","C","CAD·비심장성: 최대 내약 스타틴 미달 → 에제티미브 병용 + 벰페도익산 추가","new","","p111"],
["ksla2026:hdl_raise","ksla","true","","III","A","HDL-C 상승 목적 약물치료 권고 안 함","maintained","","p112"],
["ksla2026:gemfibrozil_statin","ksla","on_statin","drug:gemfibrozil","III","B","겜피브로질+스타틴 병용(근육병증) 권고 안 함","maintained","r_gemfibrozil","p112"],
/* 고TG */
["ksla2026:tg200_lifestyle","ksla","tg >= 200","","I","B","TG ≥200: 체중·음주·탄수화물 등 생활습관 확인·교정","maintained","","p44"],
["ksla2026:tg500_secondary","ksla","tg >= 500","","I","A","TG ≥500: 이차 원인·유전 요인 확인","maintained","","p44"],
["ksla2026:tg500_urgent","ksla","tg >= 500","drug:fenofibrate|drug:omega3","I","A","TG ≥500: 급성췌장염 예방 즉각 약물치료 + 생활습관","maintained","r_tg500","p111"],
["ksla2026:tg500_drug","ksla","tg >= 500","drug:fenofibrate|drug:omega3","IIa","A","지속 ≥500: 피브린산·니코틴산·오메가-3","maintained","","p44"],
["ksla2026:tg200_statin","ksla","tg >= 200 && tg <= 499","class:statin","I","A","TG 200–499: 생활습관 후 스타틴","maintained","","p44"],
["ksla2026:tg_highrisk_drug","ksla","tg >= 200 && tg <= 499 && (ascvd || dm)","","IIa","B","ASCVD·고위험 당뇨 TG 200–499: LDL 달성 후 TG ≥200 또는 non-HDL 미달 → 약물","maintained","","p112"],
["ksla2026:ipe","ksla","(ascvd || dm) && on_statin && tg >= 135 && tg <= 499","drug:icosapent_ethyl","IIa","B","ASCVD·고위험 당뇨, 스타틴 후 TG 135–499: IPE 4 g/일","upgraded","","p44,p112"],
["ksla2026:fibrate_add","ksla","(ascvd || dm) && on_statin && tg >= 200 && tg <= 499","drug:fenofibrate","IIb","B","스타틴 후 TG 200–499: 피브린산 추가","maintained","","p44"],
["ksla2026:epadha","ksla","(ascvd || dm) && on_statin && tg >= 200 && tg <= 499","drug:omega3","IIb","E","스타틴 후 TG 200–499: EPA+DHA","maintained","","p44"],
["ksla2026:tg_combo","ksla","tg >= 200","","IIb","C","단일 약제로 TG 목표 미달 → 병용","maintained","","p112"],
/* 생활요법 */
["ksla2026:diet_carb","ksla","true","","IIa","B","탄수화물 총에너지 50–65%, 총당류 <20%, 첨가당 <10%","new","","p8"],
["ksla2026:diet_transfat","ksla","true","","I","A","트랜스지방 섭취 제한","modified","","p8"],
["ksla2026:ex_aerobic","ksla","true","","I","A","중강도 주 150–300분 또는 고강도 75–150분 유산소","maintained","","p99"],
["ksla2026:ex_combined","ksla","true","","I","B","유산소+저항성 복합운동","new","","p99"],
["ksla2026:ex_sedentary","ksla","true","","I","B","좌식시간 감소, 자주 서기·가벼운 걷기","maintained","","p99"],
["ksla2026:ex_preeval","ksla","rf_count >= 2 || ascvd","","I","A","다수 위험인자·동반질환 시 운동 전 의학적 평가","maintained","","p99"],
["ksla2026:ecig","ksla","smoking","","III","B","전자담배를 금연 수단으로 권장하지 않음","new","","p9"],
/* ACC/AHA 2026 (해외 레이어) */
["acc2026:prevent_use","acc","!ascvd && age >= 30 && age <= 79","","1","pending","PREVENT-ASCVD로 10·30년 위험 추정(PCE 대체)","new","","4.2.3.2"],
["acc2026:prev_low_select","acc","false","class:statin","2a","C-LD","10년 <3%라도 LDL 160–189 또는 30년 ≥10%: 중강도 스타틴","new","","p39"],
["acc2026:prev_borderline","acc","false","class:statin","2a","A","경계(3–<5%) 시작 시 중강도 스타틴","new","","p39"],
["acc2026:prev_intermediate","acc","false","class:statin","1","A","중간(5–<10%): 최소 중강도, 30–49% 감소","new","","p39"],
["acc2026:prev_goal100","acc","false","lipid:tgt:ldl100","2a","B-NR","경계·중간: 목표 LDL <100","new","","p39"],
["acc2026:prev_high","acc","false","class:statin","1","A","고위험(≥10%): LLT 시작","new","","p39"],
["acc2026:hscrp_borderline","acc","false","lab:crp","2a","B-R","경계 위험에서 hsCRP ≥2(2회 연속) → 위험강화","new","","p33"],
["acc2026:repro_markers","acc","false","","2a","B-NR","조기폐경(<45세)·임신 합병증을 위험 평가에 반영","new","","p33"],
["acc2026:cac_pos","acc","false","","1","B-R","CAC >0(중간·일부 경계): LDL 저하 치료 권고","new","","p36"],
["acc2026:cac_zero","acc","false","","2a","pending","CAC 0 + 고위험조건 없음 + LLT 회피 선호: 생활습관 중심 가능","new","","p36"],
["acc2026:cac_1000","acc","false","class:statin","1","B-NR","CAC ≥1000: 스타틴 1차, ≥50% 감소","new","","p60"],
["acc2026:cac_300","acc","false","class:statin","1","B-R","CAC 300–999: 스타틴 1차(강화는 2a/B-NR)","new","","p60"],
["acc2026:cac_100","acc","false","class:statin","1","B-R","CAC 100–299 또는 ≥75 백분위: LDL 저하요법","new","","p60"],
["acc2026:cac_1_99","acc","false","class:statin","2a","B-R","CAC 1–99 & <75 백분위: 중강도 스타틴","new","","p60"],
["acc2026:lpa_once","acc","true","lab:lipoprotein_a","1","B-NR","모든 성인 Lp(a) 1회 이상 측정","new","","p15"],
["acc2026:apob_guide","acc","on_llt","lab:apolipoprotein_b","2a","B-NR","LLT 중 목표 달성 후 ApoB로 추가 강화 판단","new","","p14"],
["acc2026:ascvd_nvh_hi_statin","acc","ascvd && !acc_very_high","class:statin","1","A","ASCVD 비초고위험: 고강도 스타틴, ≥50% 감소, <70","new","","p55"],
["acc2026:ascvd_nvh_nonstatin55","acc","ascvd && !acc_very_high && on_statin","drug:ezetimibe|class:pcsk9i|drug:bempedoic_acid","2a","B-R","비초고위험: 비스타틴 추가로 <55","new","","p55"],
["acc2026:ascvd_vh_hi_statin","acc","ascvd && acc_very_high","class:statin","1","A","초고위험: 고강도 스타틴, <55","new","","p55"],
["acc2026:ascvd_vh_eze_pcsk9","acc","ascvd && acc_very_high && on_statin","drug:ezetimibe|class:pcsk9i","1","A","초고위험: 에제티미브 및/또는 PCSK9 mAb 추가(필요 강하폭 기준, 순차 아님) → <55","new","","p55"],
["acc2026:ascvd_vh_bempedoic","acc","ascvd && acc_very_high && on_statin","drug:bempedoic_acid","2a","B-R","초고위험: 벰페도익산 추가","new","","p55"],
["acc2026:ascvd_vh_inclisiran","acc","ascvd && acc_very_high && on_statin","drug:inclisiran","2a","pending","초고위험: mAb 불내·접근불가·저빈도 선호 시 인클리시란","new","","p55"],
["acc2026:dm_mod_100","acc","dm && !ascvd && age >= 40 && age <= 75","class:statin|lipid:tgt:ldl100","1","A","당뇨 40–75세: 중강도, 30–49% 감소, <100","new","","p51"],
["acc2026:dm_mrf_hi_70","acc","dm && !ascvd && age >= 40 && age <= 75 && rf_count >= 2","class:statin|lipid:tgt:ldl70","2a","B-R","당뇨 + 다수 위험인자: 고강도, ≥50% 감소, <70","new","","p51"],
["acc2026:sevhc_ascvd_add","acc","ldl >= 190 && ascvd","drug:ezetimibe|class:pcsk9i","1","pending","LDL ≥190 + ASCVD: 최대 내약 스타틴에 비스타틴 추가","new","","p45"],
["acc2026:sevhc_ldl100","acc","ldl_baseline >= 190 && on_statin && ldl >= 100","class:pcsk9i|drug:inclisiran","2a","pending","중증 고콜, 스타틴±에제티미브에도 ≥100: 추가요법","new","","p45"],
["acc2026:ckd3_ascvd","acc","has(ckd) && egfr < 60 && ascvd","class:statin|drug:ezetimibe|class:pcsk9i","1","B-R","CKD 3+ & ASCVD: 고강도 ± 에제티미브 ± PCSK9 mAb, ≥50%","new","","p70"],
["acc2026:ckd3_primary","acc","has(ckd) && egfr < 60 && !ascvd && age >= 40 && age <= 75","class:statin","1","B-R","40–75세 CKD 3+ & LDL 70–189: 스타틴","new","","p70"],
["acc2026:hiv_statin","acc","enh_hiv && age >= 40 && age <= 75","class:statin","1","pending","HIV 40–75세(안정적 cART): 스타틴","new","","4.2.8.9"],
["acc2026:cancer_survivor","acc","false","","1","B-NR","암 생존자(기대여명 ≥2년): 일반인과 동일 기준","new","","p72"],
["acc2026:tg150_persistent","acc","tg >= 150","","1","B-NR","TG ≥150 지속: 이차원인 평가·생활습관","new","","p74"],
["acc2026:tg_rdn_1000","acc","tg >= 1000","","1","B-NR","공복 TG ≥1000: 영양사 의뢰","new","","p23"],
["acc2026:supplements","acc","true","","3","pending","식이보충제로 LDL·TG 저하 권고 안 함","new","","4.1.5"]
];
const REC_2026 = (function(){
  var out = {};
  REC_2026_RAW.forEach(function(r){
    var gl = r[1]==="ksla" ? "gl:dyslipidemia:ksla-2026" : "gl:dyslipidemia:acc-aha-2026";
    var sys = GUIDELINES[gl].recsys, g = REC_SYSTEMS[sys].grades[r[4]];
    out["lipid:rec:"+r[0]] = {
      id:"lipid:rec:"+r[0], guideline:gl, when:r[2],
      recommend: r[3] ? r[3].split("|") : [],
      grade_original:r[4], grade_system:sys, grade_norm:g.norm, grade_rank:g.rank, loe:r[5],
      text:r[6], change:r[7], supersedes: r[8] ? r[8].split(",") : [], source_page:r[9],
      status:"active", source_year:2026
    };
  });
  return out;
})();

/* ---------- §3 위험군 2026 명칭 오버레이 (수치 없음) ---------- */
const RISK_LABEL_2026 = {
  "lipid:risk:veryhigh": { label:"관상동맥질환군", sub:"5판: 초고위험군" },
  "lipid:risk:high":     { label:"비심장성 혈관질환군 · 당뇨병군(고위험)", sub:"5판: 고위험군" },
  "lipid:risk:mod_dm":   { label:"당뇨병군(저위험)", sub:"5판: 중등도위험군(당뇨)" },
  "lipid:risk:moderate": { label:"중등도 위험군", sub:"위험강화인자 동반 시 목표 강화 가능" },
  "lipid:risk:low":      { label:"저위험군", sub:"위험강화인자 동반 시 목표 강화 가능" }
};

/* ---------- §3-1 표 2-6 (원문 시각 대조 완료) ---------- */
const RX_ZONE_2026 = {
  id:"lipid:rxzone:2026", source:"이상지질혈증 진료지침 2026 표 2-6",
  bands:[ {lo:null,hi:55,label:"<55"}, {lo:55,hi:70,label:"55-69"}, {lo:70,hi:100,label:"70-99"}, {lo:100,hi:130,label:"100-129"}, {lo:130,hi:160,label:"130-159"}, {lo:160,hi:null,label:"≥160"} ],
  enum:{ life:{label:"생활습관 교정", tone:"care"}, soft:{label:"생활습관 교정 및 약물 치료 고려", tone:"clin", shade:"연한 음영 — 목표 바로 아래 구간"}, rx:{label:"생활습관 교정 및 약물 치료 고려", tone:"clin", shade:"진한 음영 — 목표 초과"} },
  rows:{
    "lipid:risk:veryhigh": ["soft","rx","rx","rx","rx","rx"],
    "lipid:risk:high":     ["life","soft","rx","rx","rx","rx"],
    "lipid:risk:mod_dm":   ["life","life","soft","rx","rx","rx"],
    "lipid:risk:moderate": ["life","life","life","soft","rx","rx"],
    "lipid:risk:low":      ["life","life","life","life","soft","rx"]
  },
  footnote:"중등도·저위험군은 수주~수개월 생활습관 관리 후에도 LDL-C가 높을 때 스타틴 고려. 일차예방에서 위험강화인자 동반 시 더 적극적으로 약물 치료 고려."
};

/* ---------- §3-2 위험강화인자 ---------- */
const RISK_ENHANCERS_2026 = {
  "lipid:enh:2026:stress":        { label:"스트레스", kind:"bool", key:"stress" },
  "lipid:enh:2026:psych":         { label:"우울증 등 주요 정신질환", kind:"bool", key:"psych" },
  "lipid:enh:2026:obesity":       { label:"비만", kind:"bool", key:"obesity", def:"BMI ≥25 kg/m² 또는 허리둘레 남 ≥90·여 ≥85 cm" },
  "lipid:enh:2026:inactivity":    { label:"신체활동부족", kind:"bool", key:"inactivity" },
  "lipid:enh:2026:chronic_inflam":{ label:"만성염증성 질환", kind:"bool", key:"chronic_inflam" },
  "lipid:enh:2026:repro":         { label:"조기폐경·전자간증·임신성 고혈압 병력", kind:"bool", key:"repro" },
  "lipid:enh:2026:osa":           { label:"수면무호흡증", kind:"bool", key:"osa" },
  "lipid:enh:2026:hiv":           { label:"HIV 감염", kind:"bool", key:"hiv" },
  "lipid:enh:2026:lpa":           { label:"Lp(a) 상승", kind:"lab", lab:"lab:lipoprotein_a", key:"lpa", thresholds:{ "mg/dL":50, "nmol/L":125 }, note:"한국인은 다른 위험인자 동반 시 ≥30 mg/dL에서도 위험 증가 가능" },
  "lipid:enh:2026:hscrp":         { label:"hsCRP 상승", kind:"lab", lab:"lab:crp", assay:"hs", key:"hscrp", thresholds:{ "mg/L":2 } },
  "lipid:enh:2026:apob":          { label:"ApoB 상승(목표 달성 후에도)", kind:"bool", key:"apob", lab:"lab:apolipoprotein_b" }
};
const RISK_ENHANCER_SCOPE_2026 = { applies:["lipid:risk:moderate","lipid:risk:low"], rec:{ "lipid:risk:moderate":"lipid:rec:ksla2026:mod_enhancer", "lipid:risk:low":"lipid:rec:ksla2026:low_enhancer" } };

/* ---------- HDL 보호인자 2026 ---------- */
const HDL_PROTECTIVE_2026 = { id:"lipid:rf:high_hdl_protective:2026", label:"HDL 60–100 mg/dL(보호 −1)", range:[60,100], weight:-1, supersedes:"lipid:rf:high_hdl_protective", conflict:"lipid:conflict:hdl_protective_range" };

/* ---------- TG 구간 2026 ---------- */
const TG_BANDS_2026 = {
  bands:[ {id:"lipid:tgband:2026:lt135",lo:null,hi:135,label:"<135"}, {id:"lipid:tgband:2026:135_149",lo:135,hi:150,label:"135–149"}, {id:"lipid:tgband:2026:150_199",lo:150,hi:200,label:"150–199"}, {id:"lipid:tgband:2026:200_499",lo:200,hi:500,label:"200–499"}, {id:"lipid:tgband:2026:ge500",lo:500,hi:null,label:"≥500"} ],
  hyperTG:200, nonfastingRetest:400, pancreatitis:500
};

/* ---------- 선택적 <55 (뇌졸중) ---------- */
const STROKE_OPT_2026 = { input:"recurrent_stroke_highrisk", target:"lipid:tgt:ldl55", rec:"lipid:rec:ksla2026:stroke_recur_ldl55_opt" };

/* ---------- §5 상충 레코드 ---------- */
const NOTICES_LIPID = {
  "notice:고시2024-37": { noticeNo:"고시 제2024-37호(약제)", effectiveDate:"2024-03-01", sourceUrl:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20240301&sno=1&mtgMtrRegSno=0004", title:"Evolocumab·Alirocumab 주사제" },
  "notice:고시2014-34": { noticeNo:"고시 제2014-34호", effectiveDate:"2014-03-01", sourceUrl:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20140301&sno=1&mtgMtrRegSno=0004", title:"[일반원칙] 고지혈증치료제" },
  "notice:고시2021-245": { noticeNo:"고시 제2021-245호(약제)", effectiveDate:"2021-10-01", sourceUrl:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20211001&sno=5&mtgMtrRegSno=0001", title:"스타틴+에제티미브 복합경구제" },
  "notice:고시2016-66": { noticeNo:"고시 제2016-66호(약제)", effectiveDate:"2016-05-01", sourceUrl:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20160501&sno=1&mtgMtrRegSno=0008", title:"Ezetimibe 경구제" }
};
const CONFLICTS = {
  "lipid:conflict:bempedoic_unlisted": { guideline_ref:["lipid:rec:ksla2026:cad_intol_bempedoic","lipid:rec:ksla2026:intol_nonstatin","lipid:rec:ksla2026:cad_ncv_eze_bempedoic","lipid:rec:acc2026:ascvd_vh_bempedoic"], reimb_ref:"unlisted", drug:"drug:bempedoic_acid",
    text_guideline:"KSoLA 2026 IIa B(스타틴 불내성·CAD)·IIa C(병용), ACC 2026 2a/B-R", text_reimb:"넥스레톨정 2026-10-14 식약처 허가 — 급여 미등재(전액 본인부담)", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:inclisiran_unlisted": { guideline_ref:["lipid:rec:acc2026:ascvd_vh_inclisiran"], reimb_ref:"unlisted", drug:"drug:inclisiran",
    text_guideline:"ACC 2026 2a(PCSK9 mAb 불내·접근불가·저빈도 선호). KSoLA 2026은 권고등급 없이 소개", text_reimb:"렉비오 2025-04 약평위 조건부 통과 후 2025-09-05 약가협상 결렬 — 미등재", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:pcsk9_stroke": { guideline_ref:["lipid:rec:ksla2026:stroke_pcsk9"], reimb_ref:"notice:고시2024-37",
    text_guideline:"죽상경화+위험요인 동반 허혈뇌졸중, 스타틴+에제티미브에도 LDL ≥70 → PCSK9i 고려(IIa B)", text_reimb:"허혈성 뇌졸중 = 주요 ASCVD 1개 → 고위험요인 ≥2 동반해야 초고위험군(급여)", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:pcsk9_codrop": { guideline_ref:["lipid:rec:ksla2026:cad_nonstatin_early"], reimb_ref:"notice:고시2024-37",
    text_guideline:"CAD: 조기 목표 달성 필요 시 PCSK9i 등 비스타틴 병용(I B)", text_reimb:"최대내약 스타틴+에제티미브 병용 후 반응 불충분(<50% 감소 또는 LDL ≥70)일 때만 급여", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:ipe": { guideline_ref:["lipid:rec:ksla2026:ipe","lipid:rec:ksla2026:dm_ipe"], reimb_ref:"unlisted", drug:"drug:icosapent_ethyl",
    text_guideline:"ASCVD·고위험 당뇨, 스타틴 후 TG 135–499: IPE 4 g/일(IIa B)", text_reimb:"바세파연질캡슐 998 mg 2025-05-22 허가(TG ≥150, 스타틴 중 고위험) — 미등재", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:hdl_protective_range": { guideline_ref:["lipid:rf:high_hdl_protective:2026"], reimb_ref:"notice:고시2014-34",
    text_guideline:"HDL 60–100 mg/dL에서만 위험인자 1개 감산", text_reimb:"HDL ≥60 보호인자로 1개 감산(상한 없음)", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:start_threshold": { guideline_ref:["lipid:rec:ksla2026:cad_ldl55_50pct","lipid:rec:ksla2026:ncv_ldl70_50pct","lipid:rec:ksla2026:dm_high_ldl70_50pct"], reimb_ref:"notice:고시2014-34",
    text_guideline:"목표 CAD <55, 비심장성·고위험 당뇨 <70(+≥50% 감소)", text_reimb:"급여 개시: CAD·준위험(PAD·AAA·증상 경동맥·당뇨) LDL ≥100, ACS ≥70", status:"open", resolved_by:null, resolved_date:null },
  "lipid:conflict:stroke_start": { guideline_ref:["lipid:rec:ksla2026:ncv_ldl70_50pct","lipid:rec:ksla2026:stroke_hi_statin"], reimb_ref:"notice:고시2014-34",
    text_guideline:"허혈뇌졸중: <70 그리고 ≥50% 감소(I A)", text_reimb:"허혈성 뇌졸중이 'CAD에 준하는 위험' 목록에 없음 → 위험요인 개수 기준(≥130/≥160)으로 개시", status:"open", resolved_by:null, resolved_date:null }
};
const REIMB_NOTES_2026 = {
  "lipid:note:combo_reimb": { recs:["lipid:rec:ksla2026:acs_initial_combo","lipid:rec:ksla2026:cad_nonstatin_early"], notice:"notice:고시2021-245", text:"스타틴+에제티미브 복합제는 일반원칙 범위 내 급여 — 초기 병용은 복합제로. 단일제 에제티미브 병용은 스타틴 선행 요건(고시 제2016-66호)." }
};

/* ---------- superseded 매핑 (v1 레코드: 값 무수정, 상태만) ---------- */
const SUPERSEDED_V1 = {
  "r_ldl55_cad":     { status:"superseded", superseded_by:["lipid:rec:ksla2026:cad_ldl55_50pct"] },
  "r_50pct_codrop":  { status:"superseded", superseded_by:["lipid:rec:ksla2026:cad_ldl55_50pct","lipid:rec:ksla2026:ncv_ldl70_50pct","lipid:rec:ksla2026:dm_high_ldl70_50pct"] },
  "r_dm_tod":        { status:"superseded", superseded_by:["lipid:rec:ksla2026:dm_high_ldl70_50pct","lipid:rec:ksla2026:dm_veryhigh_ldl55_opt"] },
  "r_ami_immediate": { status:"superseded", superseded_by:["lipid:rec:ksla2026:acs_hi_statin"] },
  "r_ladder":        { status:"superseded", superseded_by:["lipid:rec:ksla2026:cad_nonstatin_early","lipid:rec:ksla2026:acs_initial_combo","lipid:rec:ksla2026:ascvd_pcsk9"] },
  "r_tg500":         { status:"superseded", superseded_by:["lipid:rec:ksla2026:tg500_urgent"] },
  "r_gemfibrozil":   { status:"superseded", superseded_by:["lipid:rec:ksla2026:gemfibrozil_statin"] },
  "r_statin_intol":  { status:"superseded", superseded_by:["lipid:rec:ksla2026:intol_nonstatin"] },
  "TREATMENT_THRESHOLD": { status:"superseded", superseded_by:["lipid:rxzone:2026"], erratum:"v1 입력이 5판 표 2-5 대비 4개 행(high·mod_dm·moderate·low)에서 '투약 고려' 구간이 1칸 늦음" },
  "lipid:rf:high_hdl_protective": { status:"superseded", superseded_by:["lipid:rf:high_hdl_protective:2026"] },
  "TG_MANAGEMENT.bands": { status:"superseded", superseded_by:["lipid:tgband:2026"] }
};

/* ---------- 약물 사실 갱신 (값 수정 + changelog, SPEC §9) ---------- */
const DRUG_UPDATES_2026 = {
  "drug:bempedoic_acid": { name:"벰페도익산", alias:["벰페도산"], brand:"넥스레톨", status:"2026-10-14 허가 · 급여 미등재", reimbNote:"넥스레톨정 180 mg — 2026-10-14 식약처 허가, 급여 미등재(전액 본인부담)",
    indication:["원발성 고콜레스테롤혈증(HeFH 포함)·혼합형 이상지질혈증 성인 식이 보조: 최대 내약 스타틴으로 불충분 시 병용 / 스타틴 불내성·금기 시 단독 또는 병용","심혈관 위험 감소: 권고 스타틴을 쓸 수 없는 성인(심혈관질환 병력 또는 고위험) — 심근경색·관상동맥 재관류술"],
    pearlsAdd:["KSoLA 2026: 스타틴 불내성 CAD IIa B / CAD·비심장성 병용 IIa C","simvastatin >20 mg·pravastatin >40 mg 병용 회피(근독성)","8–12주 내 지질 재평가"],
    pearlsSupersede:[{ old:"★국내 2026년말 도입 예정 — 도입 시 급여 확인", reason:"2026-10-14 허가 · 급여 미등재" }], asOf:"2026-11" },
  "drug:inclisiran": { status:"미등재(2025-09-05 약가협상 결렬)", pearlsSupersede:[{ old:"★급여 협상중(2026-06 미등재) — ASCVD 적응증 쟁점", reason:"2025-09-05 약가협상 결렬 · 미등재" }], pearlsAdd:["KSoLA 2026: 권고등급 없음(소개) — CVOT 2026–27 예정","ACC 2026: 초고위험에서 PCSK9 mAb 불가 시 2a"], asOf:"2026-11" },
  "drug:icosapent_ethyl": { status:"바세파 998 mg 허가(2025-05-22) · 급여 미등재", reimbNote:"바세파연질캡슐 998 mg — CV 위험 감소 적응증 허가(2025-05-22), 급여 미등재(전액 본인부담)",
    pearlsSupersede:[{ old:"★국내는 비급여 — 바세파 심혈관 적응증 국내 미반영", reason:"2025-05-22 바세파 998 mg CV 위험 감소 적응증 허가" },{ old:"국내 허가는 300mg 코사펜트산에틸(고지혈증·동맥경화 적응증)", reason:"998 mg 고순도 EPA 제제 허가로 300 mg 단독 서술 무효" }], pearlsAdd:["바세파연질캡슐 998 mg 2025-05-22 허가 — CV 위험 감소(TG ≥150·스타틴 중·CVD 또는 당뇨+위험인자 ≥1)","급여 미등재","KSoLA 2026: TG 135–499 IIa B"], asOf:"2026-11" },
  "drug:evolocumab": { pearlsAdd:["KSoLA 2026: 소아청소년 FH ≥10세 사용 가능"], asOf:"2026-11" },
  "drug:alirocumab": { pearlsAdd:["KSoLA 2026: 소아청소년 FH ≥8세 사용 가능"], asOf:"2026-11" }
};
const REIMB_SOURCE_2026 = {
  PCSK9_GATE_ASCVD: { notice:"notice:고시2024-37", gate1_basis:"practice", gate1_note:"'≥4주'는 고시 문구가 아닌 심사 실무 기준. 고시 원문: 최대내약 스타틴+에제티미브 병용 후 반응 불충분", hrf_notice_list:["65세 이상","이형접합 가족성 고콜레스테롤혈증","주요 ASCVD가 아닌 CABG·PCI 과거력","당뇨병","고혈압","만성신장질환(eGFR 15–59)","현재 흡연","최대내약 스타틴+에제티미브에도 LDL-C ≥100","울혈성 심부전 과거력"] },
  STATIN_REIMB: { notice:"notice:고시2014-34" }
};

/* ---------- ACC/AHA Lp(a) 원문 표 (기존 rows 대체, changelog 보존) ---------- */
const ACCAHA_LPA_2026 = { source:"2026 ACC/AHA Table (Lp(a) relative risk vs population median 20 nmol/L · 7 mg/dL)",
  rows:[ {v:"<75 nmol/L (<30 mg/dL)",meaning:"기준"}, {v:"75–124 nmol/L (30–49 mg/dL)",meaning:"1.2배"}, {v:"125 nmol/L (50 mg/dL)",meaning:"1.4배 — 위험강화인자 기준"}, {v:"250 nmol/L (100 mg/dL)",meaning:"2배"}, {v:"350 nmol/L (150 mg/dL)",meaning:"3배"}, {v:"430 nmol/L (180 mg/dL)",meaning:"4배"} ],
  supersedes_row:"300~400 nmol/L — HeFH에 준하는 위험(출처 미확인)" };

const SOURCES_2026 = [
  { label:"한국지질·동맥경화학회. 이상지질혈증 진료지침 2026 (2026-09-10)", url:"https://www.lipid.or.kr/reference/guideline.php?boardid=guideline&mode=view&idx=1456", note:"active · 1차 레이어" },
  { label:"2026 ACC/AHA/Multisociety Guideline on the Management of Dyslipidemia. Circulation 2026", url:"https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423", note:"active · 해외 레이어(COR/LOE 원문 PDF)" },
  { label:"한국지질·동맥경화학회. 이상지질혈증 진료지침 제5판 (2022)", url:"https://www.lipid.or.kr/uploaded/board/guideline/_ce93749f6bdf94453c23ace0baa9c8421.pdf", note:"superseded · 이전 지침" },
  { label:"심평원 고시 제2024-37호 PCSK9 억제제", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20240301&sno=1&mtgMtrRegSno=0004", note:"급여" },
  { label:"심평원 고시 제2014-34호 [일반원칙] 고지혈증치료제", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20140301&sno=1&mtgMtrRegSno=0004", note:"급여" },
  { label:"심평원 고시 제2021-245호 스타틴+에제티미브 복합제", url:"https://www.hira.or.kr/rc/insu/insuadtcrtr/InsuAdtCrtrPopup.do?mtgHmeDd=20211001&sno=5&mtgMtrRegSno=0001", note:"급여" }
];

const LIPID_V2_META = { version:"lipid-v2-2026.11", registry:"lipid-v2-2026.11",
  changelog:[
    { date:"2026-11-01", version:"v2", author:"박형도(설계 확정)/Claude", change:"이상지질혈증 진료지침 2026·ACC/AHA 2026 반영 — GL·REC·위험강화인자·RX_ZONE·상충 가산, v1 TREATMENT_THRESHOLD 오입력 superseded", affected_ids:["gl:dyslipidemia:ksla-2026","gl:dyslipidemia:acc-aha-2026","lipid:rxzone:2026"] },
    { date:"2026-11-01", version:"v2", author:"Claude", change:"DRUG_DB 사실 갱신(bempedoic name 벰페도산→벰페도익산, brand 넥슬레톨 등→넥스레톨, status 도입예정→허가·미등재; inclisiran status 급여협상중→미등재; icosapent status 국내 비급여→998 mg 허가·미등재)", affected_ids:["drug:bempedoic_acid","drug:inclisiran","drug:icosapent_ethyl"], previous:{ "drug:bempedoic_acid":{name:"벰페도산",brand:"넥슬레톨 등",status:"국내 2026년말 도입 예정",reimbNote:"2026년말 국내 도입 예정 — 출시·급여 시 갱신"}, "drug:inclisiran":{status:"급여협상중"}, "drug:icosapent_ethyl":{status:"국내 비급여",reimbNote:"국내 비급여(2026-06). 처방 시 최신 급여·허가 확인"} } },
    { date:"2026-11-01", version:"v2", author:"Claude", change:"v1 pearls 중 사실 변경 항목 superseded(DRUG_UPDATES_2026.*.pearlsSupersede — 원문은 old 필드에 보존)", affected_ids:["drug:bempedoic_acid","drug:inclisiran","drug:icosapent_ethyl"] },
    { date:"2026-11-01", version:"v2", author:"Claude", change:"ACCAHA_2026.lpa rows → 원문 표 6행", affected_ids:["ACCAHA_2026.lpa"], previous:{ row:"300~400 nmol/L — HeFH에 준하는 위험 수준" } }
  ]
};

/* ---------- SEO 레이어 정합 (seo_v2.js가 조립 후 정적 head·noscript에 반영 — 값은 DRUG_DB(패치 후)에서 파생) ---------- */
const SEO_2026 = {
  description:{ from:"한국지질·동맥경화학회 권고와 급여기준 기반", to:"한국지질·동맥경화학회 이상지질혈증 진료지침 2026·ACC/AHA 2026 권고와 심평원 급여기준 기반" },
  keywordsAdd:["이상지질혈증 진료지침 2026","ACC/AHA 2026","위험강화인자","Lp(a)","벰페도익산","넥스레톨","렉비오"],
  regenDrugs:"DRUG_UPDATES_2026",
  sectionTemplateRef:"v1 noscript .seo-drug (fidelity-tested)"
};

/* ---------- 엔진 보조 DATA (v2.1) ---------- */
const STRATUM_TARGET_2026 = {
  "lipid:risk:veryhigh":"lipid:tgt:ldl55", "lipid:risk:high":"lipid:tgt:ldl70", "lipid:risk:mod_dm":"lipid:tgt:ldl100",
  "lipid:risk:moderate":"lipid:tgt:ldl130", "lipid:risk:low":"lipid:tgt:ldl160"
};
const STRATUM_SHORT_2026 = { "lipid:risk:veryhigh":"veryhigh", "lipid:risk:high":"high", "lipid:risk:mod_dm":"mod_dm", "lipid:risk:moderate":"moderate", "lipid:risk:low":"low" };
const ASCVD_KEYS_2026 = ["cad","acs","mi","ischemic_stroke","tia","carotid","pad","aaa"];
/* 상충 노출 조건 (미니문법) — 매칭된 REC와 무관하게 환자 상황으로 판정 */
const CONFLICT_WHEN_2026 = {
  "lipid:conflict:bempedoic_unlisted": "statin_intolerant || matched(lipid:rec:ksla2026:cad_ncv_eze_bempedoic)",
  "lipid:conflict:inclisiran_unlisted": "matched(lipid:rec:acc2026:ascvd_vh_inclisiran)",
  "lipid:conflict:pcsk9_stroke": "(has(ischemic_stroke) || has(tia)) && !has(cad) && !has(acs) && !has(mi)",
  "lipid:conflict:pcsk9_codrop": "has(cad) || has(acs)",
  "lipid:conflict:ipe": "matched(lipid:rec:ksla2026:ipe) || matched(lipid:rec:ksla2026:dm_ipe)",
  "lipid:conflict:hdl_protective_range": "hdl > 100",
  "lipid:conflict:start_threshold": "stratum == veryhigh || stratum == high",
  "lipid:conflict:stroke_start": "(has(ischemic_stroke) || has(tia)) && !has(cad) && !has(acs) && !has(mi) && !has(pad) && !has(aaa) && !has(carotid) && !dm"
};
const REIMB_NOTE_WHEN_2026 = { "lipid:note:combo_reimb": "matched(lipid:rec:ksla2026:acs_initial_combo) || matched(lipid:rec:ksla2026:cad_nonstatin_early)" };
const CONFLICT_TITLES_2026 = {
  "lipid:conflict:bempedoic_unlisted":"벰페도익산 — 지침 권고 vs 비급여",
  "lipid:conflict:inclisiran_unlisted":"인클리시란 — ACC 2a vs 미등재",
  "lipid:conflict:pcsk9_stroke":"PCSK9i 뇌졸중 — 지침 IIa B vs 급여 초고위험 정의",
  "lipid:conflict:pcsk9_codrop":"PCSK9i 조기 병용 — 지침 I B vs 급여 선행치료 요건",
  "lipid:conflict:ipe":"IPE — TG 135–499 IIa B vs 허가 TG ≥150·비급여",
  "lipid:conflict:hdl_protective_range":"HDL 보호인자 — 지침 60–100 vs 급여 ≥60(상한 없음)",
  "lipid:conflict:start_threshold":"치료 목표 vs 급여 개시 LDL 기준",
  "lipid:conflict:stroke_start":"허혈뇌졸중 — 급여 개시 기준 목록 누락"
};
/* ---------- PCSK9 게이트 고위험요인 누락 교정 (고시 제2024-37호 9종 중 '고혈압' 누락 — v1 erratum) ---------- */
const PCSK9_HRF_ADD_2026 = { "lipid:hrf:htn": { label:"고혈압", after:"lipid:hrf:dm", notice:"notice:고시2024-37", erratum:"v1 고위험요인 8종 — 고시 원문 9종 중 고혈압 누락" } };
