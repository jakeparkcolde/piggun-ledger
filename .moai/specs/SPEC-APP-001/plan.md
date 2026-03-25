# SPEC-APP-001: Implementation Plan

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-APP-001 |
| Title | Simple Tax/Accounting Ledger (간편 세무장부) |
| Status | Planned |

---

## 1. Milestones

### Primary Goal: Core Data Structure and Navigation

**Scope:** Establish the single-file React app with complete state structure, tab navigation (법인/개인), sub-navigation, and month selector.

**Tasks:**
- Set up HTML file with CDN imports (React, Tailwind, recharts, lucide-react)
- Implement root state with corporate and personal data structures
- Build Header with main tab switcher (법인/개인)
- Build SubNavigation bar with all section links
- Build MonthSelector component (1-12)
- Implement tab switching and section routing logic

**Dependencies:** None

### Secondary Goal: Sales and Expense Input

**Scope:** Build the monthly input screens for both corporate and personal tabs, including all sales channels and expense categories.

**Tasks:**
- Build corporate sales input form (card, cash, danggeun, ad revenue, other)
- Build personal sales input form (card, cash, other)
- Build corporate variable cost input with all categories
- Build personal variable cost input with all categories
- Add VAT deductibility indicators (checkmark/warning icons)
- Add example tooltips for each expense category
- Implement total calculations (auto-sum)

**Dependencies:** Primary Goal

### Secondary Goal: Fixed Costs and Depreciation

**Scope:** Implement fixed cost settings with annual auto-apply and depreciation asset management.

**Tasks:**
- Build FixedCostSettings screen for corporate (6 items)
- Build FixedCostSettings screen for personal (4 items)
- Implement auto-apply to all 12 months
- Implement per-month override capability
- Build DepreciationManager with asset registration form
- Implement straight-line depreciation calculation (4yr equipment, 10yr facility)
- Auto-reflect monthly depreciation in expense totals
- Add tax tip about equipment vs inventory classification

**Dependencies:** Primary Goal

### Primary Goal: Reverse Tax Calculation Dashboard

**Scope:** Build the dashboard with reverse calculation (역산) as the central feature.

**Tasks:**
- Implement corporate tax reverse calculation formula
- Build dashboard layout with all metrics (target, actual, achievement, profit, desired tax, deficit)
- Implement progress bar for achievement rate
- Implement color-coded warnings (red deficit, green achievement)
- Add actionable tip display (corporate card usage, owner bonus suggestions)
- Add tax reserve banner with monthly/annual cumulative tracking

**Dependencies:** Sales and Expense Input, Fixed Costs and Depreciation

### Secondary Goal: Used Goods Purchase Management

**Scope:** Build the used purchase tracking system with list CRUD and automatic expense aggregation.

**Tasks:**
- Build UsedPurchases list view with all fields
- Implement add/edit/delete for purchase entries
- Auto-aggregate monthly totals into corporate expense categories
- Implement proof-ratio warning (증빙 없는 매입 비율)
- Visual emphasis on non-deductible amounts

**Dependencies:** Primary Goal

### Secondary Goal: VAT Simulation

**Scope:** Build quarterly VAT estimation with deductible/non-deductible breakdown.

**Tasks:**
- Implement VAT calculation logic (output - input VAT)
- Build VATSimulation screen with quarterly breakdown
- Implement pie chart for deductible vs non-deductible
- Add warning for high individual-sourced purchase ratio
- Display specific non-deductible amounts

**Dependencies:** Sales and Expense Input

### Final Goal: Data Management and Polish

**Scope:** Implement JSON export/import and responsive design polish.

**Tasks:**
- Implement JSON export (full state download)
- Implement JSON import with validation
- Responsive design pass (mobile-first)
- Monthly summary printable view (optional)
- Cross-browser testing
- recharts integration (achievement bars, VAT pie, monthly trends)

**Dependencies:** All previous milestones

---

## 2. Technical Approach

### 2.1 Architecture

Single HTML file with embedded JSX, loaded via CDN:
- React 18+ via unpkg/esm.sh CDN
- Tailwind CSS via CDN (play.tailwindcss.com or cdn.tailwindcss.com)
- recharts via CDN
- lucide-react via CDN

### 2.2 State Management Strategy

Single `useState` at App level holding entire application state. Pass down via props. For this scale, no Context API or external library needed.

Update pattern:
```
setState(prev => ({
  ...prev,
  [activeTab === '법인' ? 'corporate' : 'personal']: {
    ...prev[activeTab === '법인' ? 'corporate' : 'personal'],
    months: {
      ...prev[...].months,
      [currentMonth]: { ...updated }
    }
  }
}))
```

### 2.3 Component Design

All components are functional components defined in the single file. Key patterns:
- Controlled inputs for all form fields
- Computed values (totals, rates, reverse calculations) derived from state
- Conditional rendering based on activeTab and activeSection

### 2.4 Calculation Module

Pure functions for all tax calculations:
- `calcReverseTax(totalRevenue, desiredTax)` -> required expenses, deficit
- `calcVAT(sales, deductibleExpenses)` -> output VAT, input VAT, payable
- `calcDepreciation(cost, years)` -> monthly amount
- `calcTotalExpenses(fixedCosts, variableCosts, depreciation, overrides)`

---

## 3. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Single-file becomes too large | Maintainability | Keep components focused; use clear section comments |
| CDN dependency failure | App won't load | Document CDN URLs; provide fallback instructions |
| Tax rate changes | Incorrect calculations | Hardcode rates with clear constants at top of file |
| Data loss (no persistence) | User loses all data | Prominent "Export Data" reminder; auto-download prompt |
| Mobile usability | Poor experience on phone | Mobile-first design; test on actual devices |
| Complex state updates | Bugs from nested state | Use helper functions for immutable updates |

---

## 4. Expert Consultation Recommendations

| Domain | Agent | Reason |
|--------|-------|--------|
| Frontend | expert-frontend | Single-file React architecture, recharts integration, responsive design |

**Note:** This project is frontend-only (no backend, no database), so backend/devops consultation is not required. The tax calculation logic is well-defined in the spec and does not require additional domain expertise beyond what is documented.
