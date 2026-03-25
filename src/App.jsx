import { useState, useMemo, useRef, useEffect } from 'react';

// 금액 포맷
const fmt = (n) => (n == null || isNaN(n)) ? '0' : Math.round(n).toLocaleString('ko-KR');
const fmtW = (n) => fmt(n) + '원';
const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

// 법인 매출 채널
const CORP_SALES = [
  { key: 'card', label: '카드매출', ph: '카드단말기 매출' },
  { key: 'cash', label: '현금매출', ph: '현금 결제분' },
  { key: 'daangn', label: '당근페이매출', ph: '당근마켓 매출' },
  { key: 'adRevenue', label: '광고수익', ph: '네이버카페 배너' },
  { key: 'other', label: '기타매출', ph: '기타' },
];
const PERS_SALES = [
  { key: 'card', label: '카드매출', ph: '카드단말기 매출' },
  { key: 'cash', label: '현금매출', ph: '현금 결제분' },
  { key: 'other', label: '기타매출', ph: '기타' },
];

// 법인 변동비
const CORP_COSTS = [
  { key: 'purchaseUsed', label: '중고매입(개인)', vat: false, tip: '개인 간 거래 → 부가세 공제 불가' },
  { key: 'purchaseBiz', label: '중고매입(사업자)', vat: true, tip: '세금계산서 있는 거래' },
  { key: 'purchaseCash', label: '중고매입(현금)', vat: false, tip: '현금 매입 → 증빙 주의' },
  { key: 'entertainment', label: '접대비', vat: true, tip: '거래처 식사, 술자리' },
  { key: 'vehicle', label: '차량유지비', vat: true, tip: '기름, 주차, 수리' },
  { key: 'advertising', label: '광고선전비', vat: true, tip: '인스타 광고, 당근 광고' },
  { key: 'office', label: '사무용품비', vat: true, tip: 'A4, 볼펜 등' },
  { key: 'repair', label: '수선비', vat: true, tip: '시설 수리, 공사' },
  { key: 'welfare', label: '복리후생비', vat: true, tip: '직원 식대, 커피' },
  { key: 'supplies', label: '소모품비', vat: true, tip: 'BB탄, 보호장비' },
  { key: 'bonus', label: '상여금', vat: false, tip: '대표 상여금 → 끝전 맞추기' },
];
const PERS_COSTS = [
  { key: 'rawMaterials', label: '원재료비', vat: true, tip: '커피 원두, 우유, 시럽' },
  { key: 'utilities', label: '수도광열비', vat: true, tip: '전기, 수도, 가스' },
  { key: 'supplies', label: '소모품비', vat: true, tip: '컵, 빨대, 냅킨' },
  { key: 'welfare', label: '복리후생비', vat: true, tip: '직원 식대' },
  { key: 'advertising', label: '광고선전비', vat: true, tip: '인스타 광고, 전단지' },
  { key: 'repair', label: '수선비', vat: true, tip: '시설 수리비' },
  { key: 'office', label: '사무용품비', vat: true, tip: '사무용품' },
];

// 법인 고정비 라벨
const CORP_FIXED = { officeRent: '사무실(창고) 임대료', ownerSalary: '대표 급여', staffSalary: '직원 급여', insurance4: '4대보험', communication: '통신비', bizInsurance: '보험료' };
const PERS_FIXED = { cafeRent: '카페 임대료', staffSalary: '직원/알바 급여', insurance4: '4대보험', communication: '통신비' };

// 고정비 중 VAT 공제 가능 항목
const FIXED_VAT_DEDUCTIBLE = ['officeRent', 'cafeRent', 'communication'];

// 빈 월 생성
const emptyMonth = (corp) => ({
  sales: corp ? { card: 0, cash: 0, daangn: 0, adRevenue: 0, other: 0 } : { card: 0, cash: 0, other: 0 },
  costs: corp
    ? { purchaseUsed: 0, purchaseBiz: 0, purchaseCash: 0, entertainment: 0, vehicle: 0, advertising: 0, office: 0, repair: 0, welfare: 0, supplies: 0, bonus: 0 }
    : { rawMaterials: 0, utilities: 0, supplies: 0, welfare: 0, advertising: 0, repair: 0, office: 0 },
  overrides: {},
  desiredTax: 0,
});

// 초기 상태
const INIT = () => ({
  year: 2026, tab: '법인', section: '대시보드', month: 1,
  corporate: {
    fixed: { officeRent: 800000, ownerSalary: 3000000, staffSalary: 2000000, insurance4: 450000, communication: 100000, bizInsurance: 50000 },
    assets: [
      { name: '에어소프트건 장비', cost: 200000000, date: '2025-03', type: 'equipment', years: 4 },
      { name: '인테리어/시설', cost: 30000000, date: '2025-03', type: 'facility', years: 10 },
    ],
    purchases: [
      { id: 1, date: '2026-01-05', item: 'M4A1', source: '당근', amount: 350000, payment: '계좌이체', proof: false, memo: '' },
      { id: 2, date: '2026-01-12', item: 'AK47', source: '중고나라', amount: 200000, payment: '현금', proof: false, memo: '증빙없음' },
      { id: 3, date: '2026-01-20', item: 'P90', source: '직접', amount: 180000, payment: '계좌이체', proof: true, memo: '세금계산서' },
    ],
    months: {
      1: { sales: { card: 8000000, cash: 2000000, daangn: 500000, adRevenue: 300000, other: 200000 }, costs: { purchaseUsed: 530000, purchaseBiz: 300000, purchaseCash: 0, entertainment: 200000, vehicle: 150000, advertising: 500000, office: 50000, repair: 0, welfare: 300000, supplies: 400000, bonus: 0 }, overrides: {}, desiredTax: 500000 },
      2: { sales: { card: 9000000, cash: 2500000, daangn: 600000, adRevenue: 400000, other: 100000 }, costs: { purchaseUsed: 200000, purchaseBiz: 500000, purchaseCash: 100000, entertainment: 300000, vehicle: 200000, advertising: 400000, office: 30000, repair: 100000, welfare: 250000, supplies: 350000, bonus: 0 }, overrides: {}, desiredTax: 500000 },
      3: { sales: { card: 10000000, cash: 3000000, daangn: 700000, adRevenue: 500000, other: 300000 }, costs: { purchaseUsed: 300000, purchaseBiz: 400000, purchaseCash: 50000, entertainment: 250000, vehicle: 180000, advertising: 600000, office: 80000, repair: 0, welfare: 350000, supplies: 500000, bonus: 1000000 }, overrides: {}, desiredTax: 500000 },
    },
  },
  personal: {
    fixed: { cafeRent: 1200000, staffSalary: 1000000, insurance4: 200000, communication: 50000 },
    months: {
      1: { sales: { card: 5000000, cash: 1500000, other: 200000 }, costs: { rawMaterials: 1500000, utilities: 300000, supplies: 200000, welfare: 150000, advertising: 200000, repair: 0, office: 50000 }, overrides: {}, desiredTax: 300000 },
    },
  },
});

// 계산 함수
const sumObj = (o) => o ? Object.values(o).reduce((s, v) => s + toNum(v), 0) : 0;
const getFixed = (fixed, ovr) => {
  let t = 0;
  for (const k of Object.keys(fixed)) t += toNum(ovr && ovr[k] != null ? ovr[k] : fixed[k]);
  return t;
};
const getDepr = (assets) => assets ? assets.reduce((s, a) => s + Math.round(a.cost / (a.years * 12)), 0) : 0;
const getDeductibleVar = (md, defs) => {
  if (!md || !md.costs) return 0;
  return defs.filter(c => c.vat).reduce((s, c) => s + toNum(md.costs[c.key]), 0);
};
const getNonDeductibleVar = (md, defs) => {
  if (!md || !md.costs) return 0;
  return defs.filter(c => !c.vat).reduce((s, c) => s + toNum(md.costs[c.key]), 0);
};
const getDeductibleFixed = (fixed, ovr) => {
  let t = 0;
  for (const k of FIXED_VAT_DEDUCTIBLE) {
    if (fixed[k] != null) t += toNum(ovr && ovr[k] != null ? ovr[k] : fixed[k]);
  }
  return t;
};

// 간단한 바 차트 컴포넌트
const SimpleBar = ({ data, maxVal, label, color = 'bg-blue-500' }) => {
  const pct = maxVal > 0 ? Math.min((data / maxVal) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-10 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: pct + '%' }} />
      </div>
      <span className="text-xs text-gray-600 w-20 text-right shrink-0">{fmt(data)}</span>
    </div>
  );
};

// 숫자 입력
const NI = ({ label, value, onChange, ph = '', tip = '', vatIcon = '' }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500 flex items-center gap-1">
      {vatIcon && <span className="text-xs">{vatIcon}</span>}
      {label}
      {tip && <span className="text-gray-400 cursor-help ml-1" title={tip}>?</span>}
    </label>
    <input type="number" value={value || ''} onChange={(e) => onChange(toNum(e.target.value))} placeholder={ph}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
    {value > 0 && <span className="text-xs text-gray-400 text-right">{fmtW(value)}</span>}
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 ${className}`}>{children}</div>
);

const StatCard = ({ title, value, sub, color = 'text-gray-900' }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <p className="text-xs text-gray-500 mb-1">{title}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ========== 대시보드 ==========
const Dashboard = ({ s, set }) => {
  const corp = s.tab === '법인';
  const td = corp ? s.corporate : s.personal;
  const md = td.months[s.month];
  const defs = corp ? CORP_COSTS : PERS_COSTS;

  const sales = sumObj(md?.sales);
  const varCost = sumObj(md?.costs);
  const fixCost = getFixed(td.fixed, md?.overrides);
  const depr = corp ? getDepr(td.assets) : 0;
  const totalExp = varCost + fixCost + depr;
  const net = sales - totalExp;
  const rate = sales > 0 ? ((net / sales) * 100).toFixed(1) : '0.0';

  const tax = toNum(md?.desiredTax);
  const taxable = tax > 0 ? Math.round(tax / 0.10) : 0;
  const reqExp = tax > 0 ? sales - taxable : 0;
  const deficit = reqExp - totalExp;

  const updateTax = (v) => {
    const k = corp ? 'corporate' : 'personal';
    set(p => {
      const ms = { ...p[k].months };
      ms[p.month] = { ...(ms[p.month] || emptyMonth(corp)), desiredTax: v };
      return { ...p, [k]: { ...p[k], months: ms } };
    });
  };

  // 월별 매출 바차트 데이터
  const barData = useMemo(() => {
    let mx = 0;
    const d = Array.from({ length: 12 }, (_, i) => {
      const v = sumObj(td.months[i + 1]?.sales);
      if (v > mx) mx = v;
      return v;
    });
    return { values: d, max: mx };
  }, [td]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="총 매출" value={fmtW(sales)} color="text-blue-600" />
        <StatCard title="총 비용" value={fmtW(totalExp)} color="text-red-500" />
        <StatCard title="순이익" value={fmtW(net)} color={net >= 0 ? 'text-green-600' : 'text-red-600'} sub={`수익률 ${rate}%`} />
        <StatCard title="달성률" value={sales > 0 && reqExp > 0 ? ((totalExp / reqExp * 100).toFixed(1) + '%') : '-'} color="text-orange-500" />
      </div>

      {/* 역산 시뮬레이션 */}
      <Card className="border-2 border-pink-400 bg-gradient-to-br from-pink-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧮</span>
          <h3 className="text-lg font-bold text-pink-700">역산 시뮬레이션</h3>
          <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-medium">핵심 기능</span>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">희망 납부세액</label>
          <div className="flex items-center gap-2">
            <input type="number" value={tax || ''} onChange={(e) => updateTax(toNum(e.target.value))} placeholder="이달 내고 싶은 세금"
              className="flex-1 border-2 border-pink-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" />
            <span className="text-sm text-gray-500">원</span>
          </div>
          {tax > 0 && <p className="text-xs text-gray-400 mt-1">입력: {fmtW(tax)}</p>}
        </div>
        {tax > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">과세소득 한도</p>
                <p className="text-base font-bold">{fmtW(taxable)}</p>
                <p className="text-xs text-gray-400">= 희망세액 / 10%</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">필요 비용 총액</p>
                <p className="text-base font-bold">{fmtW(reqExp)}</p>
                <p className="text-xs text-gray-400">= 매출 - 과세소득 한도</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">현재 비용 합계</p>
                <p className="text-base font-bold text-blue-600">{fmtW(totalExp)}</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${deficit > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                <p className="text-xs text-gray-500">비용 부족분</p>
                <p className={`text-base font-bold ${deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {deficit > 0 ? fmtW(deficit) : '충분합니다!'}
                </p>
              </div>
            </div>
            {deficit > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-800 mb-2">절세 팁</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>- 법인카드로 식비/교통비 결제하면 비용 확보 가능</li>
                  <li>- 대표 상여금도 검토하세요</li>
                  <li>- 사무용품, 소모품 구매를 이달로 앞당기기</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 세금 적립 배너 */}
      {tax > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="font-bold">이달 세금적립: {fmtW(tax)}</p>
              <p className="text-sm text-blue-100">→ 적립통장 이체!</p>
            </div>
          </div>
        </div>
      )}

      {/* 월별 매출 추세 */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">월별 매출 추세</h3>
        <div className="space-y-2">
          {barData.values.map((v, i) => (
            <SimpleBar key={i} data={v} maxVal={barData.max} label={`${i + 1}월`}
              color={i + 1 === s.month ? 'bg-blue-500' : 'bg-blue-200'} />
          ))}
        </div>
      </Card>
    </div>
  );
};

// ========== 월별입력 ==========
const MonthlyInput = ({ s, set }) => {
  const corp = s.tab === '법인';
  const k = corp ? 'corporate' : 'personal';
  const td = corp ? s.corporate : s.personal;
  const md = td.months[s.month] || emptyMonth(corp);
  const salesDefs = corp ? CORP_SALES : PERS_SALES;
  const costDefs = corp ? CORP_COSTS : PERS_COSTS;

  const up = (cat, field, val) => {
    set(p => {
      const ms = { ...p[k].months };
      const cm = { ...(ms[p.month] || emptyMonth(corp)) };
      cm[cat] = { ...cm[cat], [field]: val };
      ms[p.month] = cm;
      return { ...p, [k]: { ...p[k], months: ms } };
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📈 매출 입력</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {salesDefs.map(c => (
            <NI key={c.key} label={c.label} value={md.sales?.[c.key] || 0} onChange={v => up('sales', c.key, v)} ph={c.ph} />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between">
          <span className="text-sm text-gray-600">매출 합계</span>
          <span className="text-lg font-bold text-green-600">{fmtW(sumObj(md.sales))}</span>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">💸 변동비 입력</h3>
        <p className="text-xs text-gray-400 mb-3">✅ 부가세공제 | ⚠️ 공제불가</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {costDefs.map(c => (
            <NI key={c.key} label={c.label} value={md.costs?.[c.key] || 0} onChange={v => up('costs', c.key, v)}
              vatIcon={c.vat ? '✅' : '⚠️'} tip={c.tip} />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between">
          <span className="text-sm text-gray-600">변동비 합계</span>
          <span className="text-lg font-bold text-red-500">{fmtW(sumObj(md.costs))}</span>
        </div>
      </Card>

      <Card className="bg-gray-50">
        <h3 className="text-sm font-semibold mb-3">{s.month}월 요약</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>총 매출</span><span className="font-semibold text-green-600">{fmtW(sumObj(md.sales))}</span></div>
          <div className="flex justify-between"><span>변동비</span><span className="text-red-500">-{fmtW(sumObj(md.costs))}</span></div>
          <div className="flex justify-between"><span>고정비</span><span className="text-red-500">-{fmtW(getFixed(td.fixed, md.overrides))}</span></div>
          {corp && <div className="flex justify-between"><span>감가상각비</span><span className="text-red-500">-{fmtW(getDepr(td.assets))}</span></div>}
          <div className="flex justify-between pt-2 border-t font-bold">
            <span>순이익</span>
            <span className={sumObj(md.sales) - sumObj(md.costs) - getFixed(td.fixed, md.overrides) - (corp ? getDepr(td.assets) : 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {fmtW(sumObj(md.sales) - sumObj(md.costs) - getFixed(td.fixed, md.overrides) - (corp ? getDepr(td.assets) : 0))}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ========== 중고매입 ==========
const UsedPurchases = ({ s, set }) => {
  const [form, setForm] = useState({ date: '', item: '', source: '당근', amount: 0, payment: '계좌이체', proof: false, memo: '' });
  const [editId, setEditId] = useState(null);
  const list = s.corporate.purchases || [];

  const save = () => {
    if (!form.date || !form.item || form.amount <= 0) return;
    set(p => {
      let ps = [...(p.corporate.purchases || [])];
      if (editId != null) {
        const i = ps.findIndex(x => x.id === editId);
        if (i >= 0) ps[i] = { ...form, id: editId };
      } else {
        ps.push({ ...form, id: Date.now() });
      }
      return { ...p, corporate: { ...p.corporate, purchases: ps } };
    });
    setForm({ date: '', item: '', source: '당근', amount: 0, payment: '계좌이체', proof: false, memo: '' });
    setEditId(null);
  };

  const del = (id) => set(p => ({ ...p, corporate: { ...p.corporate, purchases: p.corporate.purchases.filter(x => x.id !== id) } }));

  const total = list.reduce((s, p) => s + toNum(p.amount), 0);
  const noProof = list.filter(p => !p.proof).reduce((s, p) => s + toNum(p.amount), 0);
  const ratio = total > 0 ? ((noProof / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold mb-3">{editId ? '매입 수정' : '새 매입 등록'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500">날짜</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">품목</label><input type="text" value={form.item} onChange={e => setForm({...form, item: e.target.value})} placeholder="모델명" className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">구매처</label><select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"><option>당근</option><option>중고나라</option><option>직접</option></select></div>
          <div><label className="text-xs text-gray-500">금액</label><input type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: toNum(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">결제방법</label><select value={form.payment} onChange={e => setForm({...form, payment: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"><option>계좌이체</option><option>현금</option><option>당근페이</option></select></div>
          <div><label className="text-xs text-gray-500">증빙</label><select value={form.proof ? 'y' : 'n'} onChange={e => setForm({...form, proof: e.target.value === 'y'})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"><option value="y">있음</option><option value="n">없음</option></select></div>
          <div className="col-span-2"><label className="text-xs text-gray-500">메모</label><input type="text" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div className="flex items-end gap-2">
            <button onClick={save} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">{editId ? '수정' : '등록'}</button>
            {editId && <button onClick={() => { setEditId(null); setForm({ date: '', item: '', source: '당근', amount: 0, payment: '계좌이체', proof: false, memo: '' }); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">취소</button>}
          </div>
        </div>
      </Card>

      {noProof > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-800">⚠️ 증빙 없는 매입: {fmtW(noProof)} ({ratio}%) - 부가세 공제 불가</p>
          <p className="text-xs text-orange-600 mt-1">현금 매입 시 간이영수증 + 상대방 신분증 확보 필요</p>
        </div>
      )}

      <Card>
        <h3 className="text-sm font-semibold mb-3">매입 내역 ({list.length}건 / {fmtW(total)})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-gray-500"><th className="py-2 text-left">날짜</th><th className="py-2 text-left">품목</th><th className="py-2 text-left">구매처</th><th className="py-2 text-right">금액</th><th className="py-2 text-center">결제</th><th className="py-2 text-center">증빙</th><th className="py-2 text-left">메모</th><th className="py-2">관리</th></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">{p.date}</td><td className="py-2 font-medium">{p.item}</td><td className="py-2">{p.source}</td>
                  <td className="py-2 text-right font-semibold">{fmtW(p.amount)}</td><td className="py-2 text-center">{p.payment}</td>
                  <td className="py-2 text-center">{p.proof ? '✅' : '❌'}</td><td className="py-2 text-gray-500">{p.memo}</td>
                  <td className="py-2 text-center">
                    <button onClick={() => { setForm(p); setEditId(p.id); }} className="text-blue-500 mr-2">수정</button>
                    <button onClick={() => del(p.id)} className="text-red-500">삭제</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">등록된 내역이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ========== 고정비 ==========
const FixedCosts = ({ s, set }) => {
  const corp = s.tab === '법인';
  const k = corp ? 'corporate' : 'personal';
  const td = corp ? s.corporate : s.personal;
  const labels = corp ? CORP_FIXED : PERS_FIXED;
  const md = td.months[s.month];
  const ovr = md?.overrides || {};

  const upBase = (key, val) => set(p => ({ ...p, [k]: { ...p[k], fixed: { ...p[k].fixed, [key]: val } } }));
  const upOvr = (key, val) => {
    set(p => {
      const ms = { ...p[k].months };
      const cm = { ...(ms[p.month] || emptyMonth(corp)) };
      cm.overrides = { ...cm.overrides, [key]: val };
      ms[p.month] = cm;
      return { ...p, [k]: { ...p[k], months: ms } };
    });
  };
  const clearOvr = (key) => {
    set(p => {
      const ms = { ...p[k].months };
      if (!ms[p.month]) return p;
      const cm = { ...ms[p.month] };
      const o = { ...cm.overrides };
      delete o[key];
      cm.overrides = o;
      ms[p.month] = cm;
      return { ...p, [k]: { ...p[k], months: ms } };
    });
  };

  const total = Object.keys(labels).reduce((s, key) => s + toNum(ovr[key] != null ? ovr[key] : td.fixed[key]), 0);

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold mb-3">🔒 연간 기본 고정비</h3>
        <p className="text-xs text-gray-400 mb-3">연초 1회 설정하면 매월 자동 적용됩니다.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(labels).map(([key, label]) => (
            <NI key={key} label={'🔒 ' + label} value={td.fixed[key]} onChange={v => upBase(key, v)} />
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-3">{s.month}월 고정비 조정</h3>
        <p className="text-xs text-gray-400 mb-3">이달만 다른 금액이면 여기서 수정하세요.</p>
        <div className="space-y-3">
          {Object.entries(labels).map(([key, label]) => {
            const has = ovr[key] != null;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{label}</span>
                    {has && <button onClick={() => clearOvr(key)} className="text-xs text-blue-500">기본값으로</button>}
                  </div>
                  <input type="number" value={has ? ovr[key] : td.fixed[key] || ''} onChange={e => upOvr(key, toNum(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${has ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`} />
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-gray-400">기본</p>
                  <p className="text-xs font-medium">{fmtW(td.fixed[key])}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between">
          <span className="text-sm">{s.month}월 고정비 합계</span>
          <span className="text-lg font-bold">{fmtW(total)}</span>
        </div>
      </Card>
    </div>
  );
};

// ========== 감가상각 ==========
const DepreciationMgr = ({ s, set }) => {
  const [na, setNa] = useState({ name: '', cost: 0, date: '', type: 'equipment' });
  const assets = s.corporate.assets || [];

  const add = () => {
    if (!na.name || na.cost <= 0 || !na.date) return;
    const years = na.type === 'equipment' ? 4 : 10;
    set(p => ({ ...p, corporate: { ...p.corporate, assets: [...p.corporate.assets, { ...na, years }] } }));
    setNa({ name: '', cost: 0, date: '', type: 'equipment' });
  };
  const rm = (i) => set(p => ({ ...p, corporate: { ...p.corporate, assets: p.corporate.assets.filter((_, j) => j !== i) } }));

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800"><strong>절세 팁:</strong> 에어소프트건을 재고가 아닌 장비(4년 감가상각)로 분류하면 절세 효과가 큽니다. 재고 2억이 한꺼번에 팔리면 법인세가 2억 기준으로 나옵니다.</p>
      </div>
      <Card>
        <h3 className="text-sm font-semibold mb-3">자산 등록</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500">자산명</label><input type="text" value={na.name} onChange={e => setNa({...na, name: e.target.value})} placeholder="에어소프트건 장비" className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">취득가액</label><input type="number" value={na.cost || ''} onChange={e => setNa({...na, cost: toNum(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">취득일</label><input type="month" value={na.date} onChange={e => setNa({...na, date: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
          <div><label className="text-xs text-gray-500">유형</label><select value={na.type} onChange={e => setNa({...na, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"><option value="equipment">장비 (4년)</option><option value="facility">시설 (10년)</option></select></div>
          <div className="flex items-end"><button onClick={add} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">등록</button></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-3">등록 자산 ({assets.length}건)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-gray-500"><th className="py-2 text-left">자산명</th><th className="py-2 text-right">취득가액</th><th className="py-2 text-center">취득일</th><th className="py-2 text-center">유형</th><th className="py-2 text-right">월 감가상각</th><th className="py-2">관리</th></tr></thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-medium">{a.name}</td>
                  <td className="py-2 text-right">{fmtW(a.cost)}</td>
                  <td className="py-2 text-center">{a.date}</td>
                  <td className="py-2 text-center">{a.type === 'equipment' ? '장비(4년)' : '시설(10년)'}</td>
                  <td className="py-2 text-right font-semibold text-red-500">{fmtW(Math.round(a.cost / (a.years * 12)))}</td>
                  <td className="py-2 text-center"><button onClick={() => rm(i)} className="text-red-500">삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between">
          <span className="text-sm">월 감가상각비 합계</span>
          <span className="text-lg font-bold text-red-500">{fmtW(getDepr(assets))}</span>
        </div>
      </Card>
    </div>
  );
};

// ========== 부가세 ==========
const VATSim = ({ s }) => {
  const corp = s.tab === '법인';
  const td = corp ? s.corporate : s.personal;
  const defs = corp ? CORP_COSTS : PERS_COSTS;
  const quarters = [{ l: '1분기 (1-3월)', m: [1,2,3] }, { l: '2분기 (4-6월)', m: [4,5,6] }, { l: '3분기 (7-9월)', m: [7,8,9] }, { l: '4분기 (10-12월)', m: [10,11,12] }];
  const curQ = Math.floor((s.month - 1) / 3);

  const qData = quarters.map(q => {
    let sales = 0, ded = 0, nded = 0, fixDed = 0;
    q.m.forEach(m => {
      const md = td.months[m];
      sales += sumObj(md?.sales);
      ded += getDeductibleVar(md, defs);
      nded += getNonDeductibleVar(md, defs);
      fixDed += getDeductibleFixed(td.fixed, md?.overrides);
    });
    const totalDed = ded + fixDed;
    const outVAT = Math.round(sales * 10 / 110);
    const inVAT = Math.round(totalDed * 10 / 110);
    return { ...q, sales, ded: totalDed, nded, outVAT, inVAT, pay: outVAT - inVAT };
  });

  const cq = qData[curQ];
  const totalPurchases = cq.ded + cq.nded;
  const ndRatio = totalPurchases > 0 ? ((cq.nded / totalPurchases) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {qData.map((q, i) => (
        <Card key={i} className={i === curQ ? 'border-2 border-blue-400' : ''}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            {q.l} {i === curQ && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">현재</span>}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">매출세액</p><p className="font-semibold">{fmtW(q.outVAT)}</p></div>
            <div><p className="text-xs text-gray-500">매입세액 (공제)</p><p className="font-semibold text-green-600">{fmtW(q.inVAT)}</p></div>
            <div><p className="text-xs text-gray-500">납부 예상액</p><p className={`font-bold text-lg ${q.pay > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtW(q.pay)}</p></div>
            <div><p className="text-xs text-gray-500">분기 매출</p><p className="font-semibold">{fmtW(q.sales)}</p></div>
          </div>
        </Card>
      ))}

      {ndRatio > 30 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-800">⚠️ 공제 불가 비율: {ndRatio}%</p>
          <p className="text-xs text-orange-600">법인카드 사용 등으로 공제 가능 비용을 늘리세요.</p>
        </div>
      )}

      {/* 공제 비율 시각화 */}
      <Card>
        <h3 className="text-sm font-semibold mb-3">VAT 공제 비율 ({quarters[curQ].l})</h3>
        {totalPurchases > 0 ? (
          <div>
            <div className="flex rounded-full overflow-hidden h-8 mb-3">
              <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: (cq.ded / totalPurchases * 100) + '%' }}>
                {cq.ded > 0 ? '공제' : ''}
              </div>
              <div className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: (cq.nded / totalPurchases * 100) + '%' }}>
                {cq.nded > 0 ? '불가' : ''}
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600">공제 가능: {fmtW(cq.ded)} ({(100 - ndRatio).toFixed(1)}%)</span>
              <span className="text-red-500">공제 불가: {fmtW(cq.nded)} ({ndRatio}%)</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">데이터가 없습니다.</p>
        )}
      </Card>
    </div>
  );
};

// ========== 데이터 관리 ==========
const DataMgr = ({ s, set }) => {
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  const exp = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `piggun-ledger-${s.year}.json`;
    a.click();
  };

  const imp = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setErr(''); setOk(false);
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d.corporate || !d.personal || !d.year) { setErr('올바르지 않은 데이터입니다.'); return; }
        set(d);
        setOk(true);
      } catch (ex) { setErr('JSON 파싱 오류: ' + ex.message); }
    };
    r.readAsText(f);
  };

  const corp = s.tab === '법인';
  const td = corp ? s.corporate : s.personal;

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold mb-3">데이터 관리</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exp} className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 text-sm">📥 JSON 내보내기</button>
          <label className="flex-1">
            <div className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 text-sm text-center cursor-pointer">📤 JSON 가져오기</div>
            <input type="file" accept=".json" onChange={imp} className="hidden" />
          </label>
        </div>
        {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
        {ok && <p className="text-sm text-green-500 mt-2">데이터를 성공적으로 불러왔습니다!</p>}
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-3">월별 요약 ({s.tab})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-gray-500"><th className="py-2 text-left">월</th><th className="py-2 text-right">매출</th><th className="py-2 text-right">비용</th><th className="py-2 text-right">순이익</th></tr></thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const md = td.months[m];
                const sl = sumObj(md?.sales);
                const ex = sumObj(md?.costs) + getFixed(td.fixed, md?.overrides) + (corp ? getDepr(td.assets) : 0);
                const nt = sl - ex;
                return (
                  <tr key={m} className={`border-b border-gray-50 ${md ? '' : 'text-gray-300'}`}>
                    <td className="py-2">{m}월</td>
                    <td className="py-2 text-right">{fmtW(sl)}</td>
                    <td className="py-2 text-right">{fmtW(ex)}</td>
                    <td className={`py-2 text-right font-semibold ${nt >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtW(nt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ========== AI 챗봇 ==========
const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'assistant', content: '안녕하세요! 피그건 세무장부 도우미입니다. 앱 사용법이나 세무 관련 궁금한 점을 물어보세요!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    try {
      // API 메시지 형식 (첫 번째 안내 메시지 제외)
      const apiMsgs = newMsgs.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs }),
      });
      const data = await res.json();
      if (data.reply) {
        setMsgs(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMsgs(prev => [...prev, { role: 'assistant', content: '죄송합니다, 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }]);
      }
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했어요. 인터넷 연결을 확인해주세요.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition z-50 flex items-center justify-center text-2xl">
        {open ? '✕' : '💬'}
      </button>

      {/* 채팅 창 */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col" style={{ maxHeight: '70vh' }}>
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 py-3 rounded-t-2xl flex items-center gap-2">
            <span className="text-xl">🐷</span>
            <div>
              <p className="font-bold text-sm">피그건 세무 도우미</p>
              <p className="text-xs text-pink-100">앱 사용법 + 세무 지식 안내</p>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '50vh' }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-pink-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl rounded-bl-md text-sm">
                  입력 중...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t p-3 flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="질문을 입력하세요..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-600 disabled:opacity-50 transition text-sm">
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ========== 메인 앱 ==========
const App = () => {
  const [s, set] = useState(INIT);
  const corp = s.tab === '법인';
  const sections = corp
    ? ['대시보드', '월별입력', '중고매입', '고정비', '감가상각', '부가세', '데이터']
    : ['대시보드', '월별입력', '고정비', '부가세', '데이터'];

  const switchTab = (tab) => {
    const secs = tab === '법인'
      ? ['대시보드', '월별입력', '중고매입', '고정비', '감가상각', '부가세', '데이터']
      : ['대시보드', '월별입력', '고정비', '부가세', '데이터'];
    set(p => ({ ...p, tab, section: secs.includes(p.section) ? p.section : '대시보드' }));
  };

  const renderSection = () => {
    switch (s.section) {
      case '대시보드': return <Dashboard s={s} set={set} />;
      case '월별입력': return <MonthlyInput s={s} set={set} />;
      case '중고매입': return corp ? <UsedPurchases s={s} set={set} /> : null;
      case '고정비': return <FixedCosts s={s} set={set} />;
      case '감가상각': return corp ? <DepreciationMgr s={s} set={set} /> : null;
      case '부가세': return <VATSim s={s} />;
      case '데이터': return <DataMgr s={s} set={set} />;
      default: return <Dashboard s={s} set={set} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">🐷 피그건 간편 세무장부</h1>
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{s.year}년</span>
          </div>
          <div className="flex gap-2 mt-3">
            {['법인', '개인사업자'].map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${s.tab === t ? 'bg-white text-pink-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 서브 네비 */}
      <div className="bg-white border-b sticky top-[104px] z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {sections.map(sec => (
              <button key={sec} onClick={() => set(p => ({ ...p, section: sec }))}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${s.section === sec ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}>
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 월 선택 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-gray-500 shrink-0">월 선택:</span>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button key={m} onClick={() => set(p => ({ ...p, month: m }))}
                className={`w-8 h-8 rounded-full text-xs font-medium shrink-0 transition ${s.month === m ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {renderSection()}
      </main>

      <footer className="bg-gray-100 border-t py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          피그건 간편 세무장부 v1.0 | 참고용이며, 정확한 세무 신고는 세무사와 상담하세요.
        </div>
      </footer>

      {/* AI 챗봇 */}
      <ChatBot />
    </div>
  );
};

export default App;
