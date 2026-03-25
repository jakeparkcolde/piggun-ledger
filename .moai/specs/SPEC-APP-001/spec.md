# SPEC-APP-001: Simple Tax/Accounting Ledger for Small Business Owners

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-APP-001 |
| Title | Simple Tax/Accounting Ledger (간편 세무장부) |
| Created | 2026-03-25 |
| Status | Planned |
| Priority | High |
| Lifecycle | spec-first |
| Target User | Kim Young-gyu (김영규), PigGun (피그건) CEO |

---

## 1. Overview

### 1.1 Project Summary

A single-file React web application that serves as a simplified tax/accounting ledger for small business owners. The primary user operates two businesses simultaneously: a corporate entity (법인) for airsoft gun experiences and used equipment sales, and a personal business (개인사업자) for an offline cafe.

### 1.2 Core Concept: Reverse Calculation (역산형)

Unlike traditional accounting (Revenue - Costs = Profit -> Tax), this system inverts the flow:

**Revenue Input -> Desired Tax Input -> Required Expenses (reverse calculated) -> Expense Gap Display**

The user asks "How much tax do I want to pay this month?" and the system calculates how much in expenses they need to justify.

### 1.3 Design Philosophy

- Extreme simplicity: card terminal printout -> enter amount -> done
- Monthly cycle (월 1회): no daily tracking required
- Fixed costs set once per year, auto-applied monthly
- Dual-tab separation: Corporate (법인) / Personal (개인) with independent structures
- No backend, no localStorage: JSON export/import only

### 1.4 Business Structure

**Corporate (법인 - PigGun):**
- Airsoft gun experience services
- Used airsoft gun buying/selling (중고 매매)
- Naver Cafe ad revenue (배너 광고비)
- Storage/office rental for equipment
- Corporate card terminal

**Personal (개인사업자 - Cafe):**
- Offline cafe (coffee/beverage sales)
- Cafe rental
- Personal card terminal

**Common:** 2 employees + part-time workers, used goods purchases (당근마켓/중고나라), some cash transactions.

---

## 2. Environment

- **Platform:** Web browser (desktop + mobile responsive)
- **Tech Stack:** React (JSX single file) + Tailwind CSS
- **Charts:** recharts (achievement bars, VAT pie charts, monthly trends)
- **Icons:** lucide-react
- **Data Persistence:** JSON file export/import only (no localStorage, no backend)
- **Target Device:** Mobile-first responsive design (phone check capability)

---

## 3. Assumptions

- A-1: The user already has separate card terminals for corporate and personal businesses, so revenue input is naturally separated.
- A-2: The user records used goods purchases (중고매입) in a list format already, so the digital purchase list mirrors existing habits.
- A-3: Monthly input is sufficient; the user will not track daily transactions.
- A-4: Fixed costs (rent, salaries, insurance) rarely change within a year.
- A-5: The user understands basic Korean tax concepts (부가세, 법인세, 소득세) but not accounting details.
- A-6: Corporate tax rate is 10% for taxable income under 200M KRW.
- A-7: VAT rate is 10% applied as 10/110 of gross amounts.
- A-8: JSON export is the primary method for sharing data with a tax accountant (세무사).

---

## 4. Requirements (EARS Format)

### 4.1 Tab Navigation (탭 전환)

**REQ-NAV-001** [Ubiquitous]
The system shall provide two main tabs: Corporate (법인) and Personal (개인사업자), each maintaining independent data structures for sales, expenses, fixed costs, and tax calculations.

**REQ-NAV-002** [Event-Driven]
WHEN the user switches between Corporate and Personal tabs, THEN the system shall display the corresponding business data without data loss in either tab.

**REQ-NAV-003** [Ubiquitous]
The system shall provide sub-navigation with the following sections: Dashboard (대시보드), Monthly Input (월별입력), Used Purchases (중고매입), Fixed Costs (고정비), Depreciation (감가상각), VAT (부가세), and Data Export (데이터).

### 4.2 Dashboard with Reverse Tax Calculation (대시보드 / 역산)

**REQ-DASH-001** [Ubiquitous]
The dashboard shall display for the selected month: target sales (목표 매출), actual sales (실제 매출), achievement rate (달성률) with progress bar, net income (순이익), monthly profit rate (월수익률), desired tax amount (희망 납부세액), and expense gap (비용 부족분).

**REQ-DASH-002** [Event-Driven]
WHEN the user inputs a desired tax amount (희망 납부세액), THEN the system shall reverse-calculate and display: required taxable income limit (과세소득 한도), required total expenses (필요 비용 총액), current total expenses (현재 비용 합계), and expense deficit (비용 부족분) with warning indicator.

**REQ-DASH-003** [State-Driven]
IF the expense deficit (비용 부족분) is greater than zero, THEN the system shall display a red warning indicator and suggest actionable tips such as "Use corporate card for living expenses" or "Consider owner bonus (대표 상여금)".

**REQ-DASH-004** [Ubiquitous]
The reverse calculation for corporate tax (법인세 역산) shall use the formula:
- Taxable Income = Desired Tax / 0.10 (for income under 200M KRW at 10% rate)
- Required Expenses = Total Revenue - Taxable Income
- Expense Deficit = Required Expenses - Current Total Expenses

**REQ-DASH-005** [Ubiquitous]
The dashboard shall display Kim Young-gyu's personal metrics: owner sales (김영규 매출 = actual sales), owner profit (김영규 수익 = sales - expenses), and monthly profit rate (월수익률 = profit / sales x 100).

### 4.3 Sales Input (매출 입력)

**REQ-SALES-001** [Event-Driven]
WHEN the user navigates to Monthly Input for Corporate (법인), THEN the system shall display input fields for: card sales (카드매출), cash sales (현금매출), Danggeun Pay sales (당근페이매출), ad revenue (광고수익), and other sales (기타매출).

**REQ-SALES-002** [Event-Driven]
WHEN the user navigates to Monthly Input for Personal (개인), THEN the system shall display input fields for: card sales (카드매출), cash sales (현금매출), and other sales (기타매출).

**REQ-SALES-003** [Ubiquitous]
The system shall automatically calculate total sales (총 매출) as the sum of all sales channel inputs for the active tab.

**REQ-SALES-004** [Event-Driven]
WHEN the user inputs a target sales amount (목표 매출) for the month, THEN the system shall calculate and display the achievement rate as (actual sales / target sales x 100) with a progress bar.

### 4.4 Expense Tracking (비용 관리)

**REQ-EXP-001** [Ubiquitous]
The system shall categorize expenses into fixed costs (고정비, marked with lock icon) and variable costs (변동비, user-editable each month).

**REQ-EXP-002** [Ubiquitous]
Corporate (법인) variable cost categories shall include: used purchase from individuals (중고매입-개인, VAT non-deductible), used purchase from businesses (중고매입-사업자, VAT deductible), used purchase cash (중고매입-현금, VAT non-deductible), entertainment (접대비), vehicle maintenance (차량유지비), advertising (광고선전비), office supplies (사무용품비), repairs (수선비), welfare (복리후생비), supplies (소모품비), and owner bonus (상여금).

**REQ-EXP-003** [Ubiquitous]
Personal (개인) variable cost categories shall include: raw materials (원재료비), utilities (수도광열비), supplies (소모품비), welfare (복리후생비), advertising (광고선전비), repairs (수선비), and office supplies (사무용품비).

**REQ-EXP-004** [Ubiquitous]
Each expense category shall indicate whether it is VAT-deductible (부가세 공제 가능) or not, using visual markers (checkmark for deductible, warning for non-deductible).

**REQ-EXP-005** [Ubiquitous]
Each expense category shall display an easy-to-understand example tooltip. Examples: "Unclogging toilet -> Repairs (수선비)", "Instagram ad -> Advertising (광고선전비)".

### 4.5 Used Goods Purchase Management (중고매입 관리)

**REQ-USED-001** [Event-Driven]
WHEN the user adds a used goods purchase entry, THEN the system shall capture: purchase date (매입일), item name (품목명), source (매입처: 당근마켓/중고나라/직접매입), purchase amount (매입금액), payment method (결제방식: 당근페이/계좌이체/현금), proof availability (증빙유무: 세금계산서/없음/간이영수증), and memo (비고).

**REQ-USED-002** [Ubiquitous]
The system shall automatically aggregate monthly used purchase totals and reflect them in the expense section of the corresponding month.

**REQ-USED-003** [State-Driven]
IF the ratio of purchases without proof (증빙 없는 매입) exceeds a significant portion, THEN the system shall display a warning showing the total amount of VAT-non-deductible purchases with visual emphasis.

**REQ-USED-004** [Ubiquitous]
The used purchase list shall mirror the existing manual purchase list habit, serving as a digital version of the paper-based tracking the user already performs.

### 4.6 Fixed Cost Automation (고정비 자동 입력)

**REQ-FIXED-001** [Event-Driven]
WHEN the user configures fixed costs in the settings screen, THEN the system shall automatically apply those amounts to all 12 months for the selected business tab.

**REQ-FIXED-002** [Ubiquitous]
Corporate (법인) fixed costs shall include: office/warehouse rent (사무실 임대료), owner salary (대표 급여), staff salary (직원 급여), four major insurances (4대보험), communication fees (통신비), and business insurance (보험료).

**REQ-FIXED-003** [Ubiquitous]
Personal (개인) fixed costs shall include: cafe rent (카페 임대료), staff salary (직원 급여), four major insurances (4대보험), and communication fees (통신비).

**REQ-FIXED-004** [Event-Driven]
WHEN the user needs to override a fixed cost for a specific month, THEN the system shall allow per-month overrides (fixedCostOverrides) while preserving the default values for other months.

**REQ-FIXED-005** [Ubiquitous]
Fixed cost items shall be displayed with a lock icon (lock) to visually distinguish them from variable costs.

### 4.7 Depreciation Management (감가상각 관리)

**REQ-DEP-001** [Event-Driven]
WHEN the user registers an asset, THEN the system shall capture: asset name, acquisition cost, acquisition date, asset type (equipment/장비 or facility/시설물), and depreciation period (years).

**REQ-DEP-002** [Ubiquitous]
Equipment assets (장비, e.g., airsoft guns classified as equipment not inventory) shall use a 4-year straight-line depreciation period.

**REQ-DEP-003** [Ubiquitous]
Facility assets (시설물, e.g., interior, desks, PCs, partitions) shall use a 10-year straight-line depreciation period.

**REQ-DEP-004** [Ubiquitous]
The system shall automatically calculate monthly depreciation (감가상각비) as (acquisition cost / depreciation years / 12) and reflect it in the monthly expense totals.

**REQ-DEP-005** [Ubiquitous]
The system shall display a tip explaining that classifying airsoft guns as equipment (장비) rather than inventory (재고) provides significant tax savings, since selling inventory worth 200M KRW would trigger 200M KRW in corporate tax liability.

### 4.8 VAT Simulation (부가세 시뮬레이션)

**REQ-VAT-001** [Ubiquitous]
The system shall calculate VAT for each business tab independently, per quarter:
- Output VAT (매출 부가세) = Total Sales x 10/110
- Input VAT (매입 부가세) = Sum of VAT-deductible expenses x 10/110
- Estimated VAT payable = Output VAT - Input VAT

**REQ-VAT-002** [Ubiquitous]
VAT-deductible expenses shall include: rent, raw materials, business-sourced purchases, entertainment, vehicle maintenance, advertising, office supplies, communication fees, welfare, and utilities.

**REQ-VAT-003** [Ubiquitous]
VAT-non-deductible expenses shall include: salaries, four major insurances, personal-sourced used purchases (개인매입), cash purchases without proof (현금매입 증빙없음), depreciation, and owner bonus.

**REQ-VAT-004** [State-Driven]
IF the proportion of used purchases from individuals (중고 개인매입) is high relative to total purchases, THEN the system shall display a warning indicating increased VAT burden due to non-deductible purchases.

**REQ-VAT-005** [Ubiquitous]
The VAT simulation shall clearly display which expense amounts are non-deductible with specific amounts noted (e.g., "Used individual purchases 3,000,000 KRW are non-deductible").

### 4.9 Tax Reserve Guidance (세금 적립 안내)

**REQ-RESERVE-001** [Event-Driven]
WHEN the user sets a desired tax amount for a month, THEN the system shall display a banner: "Transfer [amount] to your tax reserve account this month! (세금 적립 통장에 이체하세요)".

**REQ-RESERVE-002** [Ubiquitous]
The system shall track and display the cumulative annual tax reserve amount (연간 누적 적립액).

### 4.10 Data Export/Import (데이터 관리)

**REQ-DATA-001** [Event-Driven]
WHEN the user triggers data export, THEN the system shall generate a JSON file containing all application state (year, corporate data, personal data, assets, used purchases) for download.

**REQ-DATA-002** [Event-Driven]
WHEN the user imports a JSON file, THEN the system shall validate the structure and load all data, replacing the current application state.

**REQ-DATA-003** [Unwanted]
The system shall NOT use localStorage or any server-side persistence. All data persistence shall rely exclusively on JSON export/import.

**REQ-DATA-004** [Optional]
Where possible, the system shall provide a monthly summary printable view for submission to the accounting office (회계사무실 제출용).

### 4.11 Responsive Design (모바일 대응)

**REQ-UI-001** [Ubiquitous]
The system shall be fully responsive, supporting both desktop and mobile viewports.

**REQ-UI-002** [Ubiquitous]
The system shall use color-coded warnings: red for expense deficit, green for high achievement rate, orange for VAT risk.

**REQ-UI-003** [Ubiquitous]
The system shall minimize per-screen input: the user should only need to look at card terminal printout and enter the amount.

**REQ-UI-004** [Ubiquitous]
The reverse calculation (역산) section shall be the most visually prominent element on the dashboard.

**REQ-UI-005** [Ubiquitous]
The system header shall display the PigGun branding with pig emoji and app title "피그건 간편 세무장부".

### 4.12 Tax Optimization Tips

**REQ-TIP-001** [State-Driven]
IF the expense deficit is a small amount, THEN the system shall suggest "Consider processing as owner bonus (대표 상여금 처리 검토)".

**REQ-TIP-002** [Ubiquitous]
The system shall display contextual advice: "Always use corporate card for meals and entertainment (밥, 술은 무조건 법인카드)".

**REQ-TIP-003** [Ubiquitous]
The system shall note that Danggeun Pay commission (<8% for small business) is VAT-deductible, but purchased goods from individuals are not.

**REQ-TIP-004** [Ubiquitous]
For cash purchases, the system shall advise securing a simplified receipt + counterpart ID (간이영수증 + 상대방 신분증).

---

## 5. Data Model

### 5.1 Root State

```
{
  year: number,                    // Current fiscal year (e.g., 2026)
  activeTab: "법인" | "개인",       // Active business tab
  corporate: CorporateData,
  personal: PersonalData
}
```

### 5.2 Corporate Data (법인)

```
CorporateData {
  fixedCosts: {
    officeRent: number,           // 사무실(창고) 임대료
    ownerSalary: number,          // 대표 급여
    staffSalary: number,          // 직원 급여
    insurance4: number,           // 4대보험
    communication: number,        // 통신비
    bizInsurance: number          // 보험료
  },
  assets: Asset[],                // Depreciation assets
  months: { [month: number]: CorporateMonth }
}

Asset {
  name: string,                   // Asset name (e.g., "에어소프트건 장비")
  cost: number,                   // Acquisition cost
  date: string,                   // Acquisition date (YYYY-MM)
  type: "equipment" | "facility", // 장비(4yr) or 시설물(10yr)
  years: number                   // Depreciation period
}

CorporateMonth {
  targetSales: number,            // 목표 매출
  sales: {
    card: number,                 // 카드매출
    cash: number,                 // 현금매출
    daangn: number,               // 당근페이매출
    adRevenue: number,            // 광고수익
    other: number                 // 기타매출
  },
  variableCosts: {
    purchaseUsed: number,         // 중고매입(개인) - VAT X
    purchaseBiz: number,          // 중고매입(사업자) - VAT O
    purchaseCash: number,         // 중고매입(현금) - VAT X
    entertainment: number,        // 접대비
    vehicle: number,              // 차량유지비
    advertising: number,          // 광고선전비
    office: number,               // 사무용품비
    repair: number,               // 수선비
    welfare: number,              // 복리후생비
    supplies: number,             // 소모품비
    bonus: number                 // 상여금
  },
  fixedCostOverrides: {},         // Per-month fixed cost overrides
  desiredTax: number,             // 희망 납부세액
  usedPurchases: UsedPurchase[]   // 중고매입 리스트
}

UsedPurchase {
  date: string,                   // 매입일
  item: string,                   // 품목명
  source: string,                 // 매입처 (당근/중고나라/직접매입)
  amount: number,                 // 매입금액
  payment: string,                // 결제방식 (당근페이/계좌이체/현금)
  hasProof: boolean,              // 증빙유무
  memo?: string                   // 비고
}
```

### 5.3 Personal Data (개인)

```
PersonalData {
  fixedCosts: {
    cafeRent: number,             // 카페 임대료
    staffSalary: number,          // 직원/알바 급여
    insurance4: number,           // 4대보험
    communication: number         // 통신비
  },
  months: { [month: number]: PersonalMonth }
}

PersonalMonth {
  targetSales: number,            // 목표 매출
  sales: {
    card: number,                 // 카드매출
    cash: number,                 // 현금매출
    other: number                 // 기타매출
  },
  variableCosts: {
    rawMaterials: number,         // 원재료비
    utilities: number,            // 수도광열비
    supplies: number,             // 소모품비
    welfare: number,              // 복리후생비
    advertising: number,          // 광고선전비
    repair: number,               // 수선비
    office: number                // 사무용품비
  },
  fixedCostOverrides: {},         // Per-month fixed cost overrides
  desiredTax: number              // 희망 납부세액
}
```

---

## 6. Technical Approach

### 6.1 Single-File Architecture

The entire application is a single React JSX file with Tailwind CSS for styling. All components are defined within the same file. External dependencies (React, recharts, lucide-react, Tailwind) are loaded via CDN.

### 6.2 State Management

- Single `useState` hook holding the entire root state object
- Helper functions for state updates (immutable updates using spread operator)
- No external state management library needed for this scale

### 6.3 Component Hierarchy

```
App
  |-- Header (branding + main tab switcher: 법인/개인)
  |-- SubNavigation (대시보드|월별입력|중고매입|고정비|감가상각|부가세|데이터)
  |-- MonthSelector (1-12 month selector)
  |-- ContentArea
  |     |-- Dashboard (reverse calculation, achievement, metrics)
  |     |-- MonthlyInput (sales + variable costs input)
  |     |-- UsedPurchases (purchase list CRUD)
  |     |-- FixedCostSettings (annual fixed cost config)
  |     |-- DepreciationManager (asset registration + auto-calc)
  |     |-- VATSimulation (quarterly VAT estimate)
  |     |-- DataManager (JSON export/import)
  |-- Footer (tax reserve banner)
```

### 6.4 Tax Calculation Logic

**Corporate Tax Reverse Calculation (법인세 역산):**
```
taxableIncome = desiredTax / 0.10          // 10% rate for < 200M KRW
requiredExpenses = totalRevenue - taxableIncome
expenseDeficit = requiredExpenses - currentTotalExpenses
```

**VAT Calculation (부가세):**
```
outputVAT = totalSales * 10 / 110
inputVAT = sumOfVATDeductibleExpenses * 10 / 110
estimatedVATPayable = outputVAT - inputVAT
```

**VAT-Deductible items:** rent, raw materials, biz-sourced purchases, entertainment, vehicle, advertising, office supplies, communication, welfare, utilities, repairs.

**VAT-Non-Deductible items:** salaries, 4-major insurance, individual-sourced used purchases, cash purchases without proof, depreciation, owner bonus.

**Monthly Depreciation:**
```
monthlyDepreciation = acquisitionCost / depreciationYears / 12
```

### 6.5 Charts (recharts)

- Achievement rate: horizontal progress bar
- VAT breakdown: pie chart (deductible vs non-deductible)
- Monthly sales trend: line/bar chart

---

## 7. UI/UX Requirements

### 7.1 Principles (from spec section 7)

1. **Minimal input per screen** - Look at card terminal printout, enter amount, done
2. **Easy examples per account category** - "Unclogged toilet -> Repairs", "Instagram ad -> Advertising"
3. **Monthly cycle (월 1회)** - Designed so daily tracking is not required
4. **Reverse calculation is main feature** - "How much tax do you want to pay?" is the most prominent element
5. **Color-coded warnings** - Red: expense deficit, Green: high achievement, Orange: VAT risk
6. **Fixed cost automation** - Lock icon display, set once per year
7. **Mobile responsive** - Fully usable on phone
8. **Used purchase list** - Digitizes existing paper-based purchase tracking habit

### 7.2 Visual Indicators

- Lock icon (lock): fixed costs (auto-applied)
- Warning icon: VAT-non-deductible items (중고매입 개인/현금)
- Checkmark: VAT-deductible items
- Red badge: expense deficit amount
- Green progress: achievement rate
- Orange warning: high VAT burden

### 7.3 Branding

- Header: Pig emoji + "피그건 간편 세무장부"
- Clean, minimal UI with Tailwind CSS utility classes
- Korean language interface throughout

---

## 8. Constraints

- C-1: Single HTML/JSX file implementation (no build system, no bundler)
- C-2: No localStorage or server-side persistence
- C-3: No user authentication required (single-user app)
- C-4: All monetary amounts in Korean Won (KRW)
- C-5: Korean language UI only
- C-6: Tax rates are hardcoded (corporate 10% for <200M KRW, VAT 10%)
- C-7: No real-time data sync; manual JSON export/import only

---

## 9. Traceability

| Requirement | Source Section | Acceptance Criteria |
|-------------|---------------|-------------------|
| REQ-NAV-* | Spec 5-1 | ACC-NAV |
| REQ-DASH-* | Spec 4-1, 3-1 | ACC-DASH |
| REQ-SALES-* | Spec 4-2 | ACC-SALES |
| REQ-EXP-* | Spec 4-3 | ACC-EXP |
| REQ-USED-* | Spec 4-4 | ACC-USED |
| REQ-FIXED-* | Spec 4-5 | ACC-FIXED |
| REQ-DEP-* | Spec 4-6, 8 | ACC-DEP |
| REQ-VAT-* | Spec 4-7 | ACC-VAT |
| REQ-RESERVE-* | Spec 4-8 | ACC-RESERVE |
| REQ-DATA-* | Spec 9 | ACC-DATA |
| REQ-UI-* | Spec 7 | ACC-UI |
| REQ-TIP-* | Spec 8 | ACC-TIP |
