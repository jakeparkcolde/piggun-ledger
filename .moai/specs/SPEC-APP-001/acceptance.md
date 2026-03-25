# SPEC-APP-001: Acceptance Criteria

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-APP-001 |
| Title | Simple Tax/Accounting Ledger (간편 세무장부) |
| Status | Planned |

---

## ACC-NAV: Tab Navigation

### Scenario: Switch between Corporate and Personal tabs
```
Given the user is on the Corporate (법인) tab
When the user clicks the Personal (개인사업자) tab
Then the system displays personal business data
And corporate data remains preserved
And the sub-navigation sections remain visible
```

### Scenario: Navigate between sections
```
Given the user is on any tab
When the user clicks a sub-navigation item (대시보드, 월별입력, 중고매입, 고정비, 감가상각, 부가세, 데이터)
Then the corresponding section content is displayed
And the active section is visually highlighted
```

---

## ACC-DASH: Dashboard with Reverse Calculation

### Scenario: Display dashboard metrics
```
Given the user has entered sales and expenses for January
When the user views the Dashboard for January
Then the system displays: target sales, actual sales, achievement rate with progress bar, net income, monthly profit rate, desired tax, and expense deficit
```

### Scenario: Reverse tax calculation (역산)
```
Given corporate total sales for January = 18,500,000 KRW
And current total expenses = 11,166,667 KRW
When the user enters desired tax = 300,000 KRW
Then taxable income limit = 300,000 / 0.10 = 3,000,000 KRW
And required expenses = 18,500,000 - 3,000,000 = 15,500,000 KRW
And expense deficit = 15,500,000 - 11,166,667 = 4,333,333 KRW
And the deficit is displayed with a red warning
```

### Scenario: Expense deficit tips
```
Given the expense deficit is greater than zero
When the dashboard is displayed
Then the system shows actionable tips:
  - "Use corporate card for living expenses (meals, transportation)"
  - "Consider owner bonus (대표 상여금)"
```

### Scenario: Zero or negative deficit
```
Given current expenses exceed required expenses
When the dashboard is displayed
Then no deficit warning is shown
And the system indicates expenses are sufficient (green indicator)
```

---

## ACC-SALES: Sales Input

### Scenario: Corporate sales input
```
Given the user is on the Corporate tab, Monthly Input section
When the user enters:
  - Card sales: 15,000,000
  - Cash sales: 2,000,000
  - Danggeun Pay: 1,000,000
  - Ad revenue: 500,000
Then total sales = 18,500,000 KRW
And the total is automatically calculated and displayed
```

### Scenario: Personal sales input
```
Given the user is on the Personal tab, Monthly Input section
When the user enters:
  - Card sales: 5,000,000
  - Cash sales: 500,000
Then total sales = 5,500,000 KRW
```

### Scenario: Achievement rate calculation
```
Given target sales = 20,000,000
And actual sales = 18,500,000
When the dashboard displays achievement rate
Then achievement = 92.5%
And a progress bar reflects 92.5% fill
```

---

## ACC-EXP: Expense Tracking

### Scenario: Display expense categories with VAT indicators
```
Given the user is on the Corporate Monthly Input
When viewing expense categories
Then each category shows:
  - Name with Korean label
  - VAT deductibility status (checkmark or warning icon)
  - Fixed/variable indicator (lock icon for fixed)
  - Example tooltip
```

### Scenario: Variable cost input
```
Given the user is editing January corporate expenses
When the user enters entertainment = 300,000 KRW
Then the amount is saved under variableCosts.entertainment
And total expenses are recalculated
And the entertainment entry shows a checkmark (VAT deductible)
```

### Scenario: Expense example tooltips
```
Given the user hovers or taps an expense category
When viewing "수선비" (repairs)
Then the tooltip shows "변기 뚫었어 → 수선비"
```

---

## ACC-USED: Used Goods Purchase Management

### Scenario: Add a used purchase entry
```
Given the user is on the Used Purchases section
When the user adds an entry:
  - Date: 2026-01-05
  - Item: M4A1
  - Source: 당근마켓
  - Amount: 350,000
  - Payment: 계좌이체
  - Proof: No (개인거래)
  - Memo: (empty)
Then the entry is added to the purchase list
And the monthly total for used purchases increases by 350,000
And the entry is reflected in corporate expenses under purchaseUsed
```

### Scenario: Proof ratio warning
```
Given 3 purchases totaling 1,000,000 KRW have no proof
And 1 purchase of 500,000 KRW has proof (세금계산서)
When viewing the Used Purchases section
Then the system displays: "증빙 없는 매입: 1,000,000원 (66.7%) - 부가세 공제 불가"
And a warning icon is shown
```

### Scenario: Edit and delete purchase entries
```
Given a used purchase entry exists
When the user edits the amount from 350,000 to 400,000
Then the entry is updated and totals recalculated
When the user deletes an entry
Then the entry is removed and totals recalculated
```

---

## ACC-FIXED: Fixed Cost Automation

### Scenario: Set annual fixed costs
```
Given the user navigates to Fixed Costs settings for Corporate
When the user sets office rent = 800,000 KRW
Then all 12 months reflect office rent = 800,000 in fixed costs
And each month's fixed cost display shows the lock icon
```

### Scenario: Override fixed cost for specific month
```
Given corporate office rent = 800,000 for all months
When the user overrides March office rent to 900,000
Then March shows office rent = 900,000
And all other months remain at 800,000
```

### Scenario: Independent fixed costs per tab
```
Given corporate fixed costs are configured
When the user switches to Personal tab
Then personal fixed costs are shown independently
And changes to one tab do not affect the other
```

---

## ACC-DEP: Depreciation Management

### Scenario: Register equipment asset
```
Given the user navigates to Depreciation Management
When the user registers:
  - Name: 에어소프트건 장비
  - Cost: 200,000,000
  - Date: 2025-03
  - Type: equipment (장비)
  - Years: 4
Then monthly depreciation = 200,000,000 / 4 / 12 = 4,166,667 KRW
And this amount is auto-reflected in monthly expenses as 감가상각비
```

### Scenario: Register facility asset
```
Given the user registers a facility asset:
  - Name: 인테리어/시설
  - Cost: 30,000,000
  - Type: facility (시설물)
  - Years: 10
Then monthly depreciation = 30,000,000 / 10 / 12 = 250,000 KRW
```

### Scenario: Tax tip display
```
Given the user is on the Depreciation section
Then the system displays a tip:
  "에어소프트건을 재고가 아닌 장비(4년 감가상각)로 분류하면 절세 효과가 큽니다.
   재고 2억 원이 한꺼번에 팔리면 법인세가 2억 원 기준으로 나옵니다."
```

---

## ACC-VAT: VAT Simulation

### Scenario: Calculate quarterly VAT
```
Given January corporate data:
  - Total sales: 18,500,000
  - VAT-deductible expenses: officeRent(800,000) + purchaseBiz(500,000) + entertainment(300,000) + vehicle(200,000) + advertising(150,000) + office(50,000) + communication(100,000) + welfare(200,000) = 2,300,000
When viewing VAT Simulation for Q1
Then output VAT = 18,500,000 * 10/110 = 1,681,818 KRW
And input VAT = 2,300,000 * 10/110 = 209,091 KRW
And estimated payable = 1,681,818 - 209,091 = 1,472,727 KRW
```

### Scenario: Non-deductible warning
```
Given used purchases from individuals = 3,000,000 KRW
When viewing VAT Simulation
Then the system displays: "중고 개인매입 3,000,000원은 공제 불가"
And an orange warning indicator is shown
```

---

## ACC-RESERVE: Tax Reserve Guidance

### Scenario: Monthly reserve banner
```
Given the user set desired tax = 300,000 for January
When viewing the dashboard
Then a banner displays: "이달 세금적립: 300,000원 → 적립통장 이체!"
```

### Scenario: Annual cumulative reserve
```
Given desired tax for Jan=300,000, Feb=300,000, Mar=350,000
When viewing the reserve section
Then cumulative reserve = 950,000 KRW
```

---

## ACC-DATA: Data Export/Import

### Scenario: Export data as JSON
```
Given the user has entered data across multiple months
When the user clicks Export Data
Then a JSON file downloads containing the complete application state
And the filename includes the year (e.g., piggun-ledger-2026.json)
```

### Scenario: Import data from JSON
```
Given the user has a previously exported JSON file
When the user selects the file for import
Then the system validates the JSON structure
And loads all data, replacing current state
And displays a confirmation message
```

### Scenario: Invalid JSON import
```
Given the user selects an invalid or corrupted JSON file
When the import is attempted
Then the system displays an error message
And the current data remains unchanged
```

### Scenario: No localStorage usage
```
Given the user closes the browser tab
When the user reopens the application
Then all data fields are empty (default state)
And the user must import a JSON file to restore data
```

---

## ACC-UI: Responsive Design and UX

### Scenario: Mobile responsive layout
```
Given the user opens the app on a mobile device (viewport < 768px)
When viewing any section
Then all elements are properly stacked and readable
And input fields are touch-friendly
And navigation is accessible
```

### Scenario: Color-coded indicators
```
Given the dashboard is displayed
When expense deficit > 0
Then the deficit amount is displayed in red

When achievement rate > 80%
Then the achievement bar is displayed in green

When VAT payable is high due to non-deductible purchases
Then the VAT section shows orange warning
```

### Scenario: Reverse calculation prominence
```
Given the user is on the dashboard
Then the reverse calculation section (역산 시뮬레이션) is the most visually prominent element
And the desired tax input is easy to find and modify
```

---

## ACC-TIP: Tax Optimization Tips

### Scenario: Small deficit bonus suggestion
```
Given the expense deficit is less than 500,000 KRW
When the dashboard displays tips
Then the system suggests: "대표 상여금 처리를 검토하세요"
```

### Scenario: Cash purchase proof advice
```
Given the user adds a cash purchase without proof
When viewing the purchase entry
Then the system displays: "현금 매입 시 간이영수증 + 상대방 신분증 확보 필요"
```

---

## Quality Gate Criteria

| Criterion | Threshold |
|-----------|-----------|
| All EARS requirements implemented | 100% |
| All acceptance scenarios passing | 100% |
| Responsive on mobile viewport | Works on 375px+ width |
| Tax calculation accuracy | Matches formulas exactly |
| JSON export/import round-trip | Data integrity preserved |
| No localStorage usage | Zero localStorage calls |
| Korean UI text | All user-facing text in Korean |
| Color indicators correct | Red/Green/Orange per spec |

---

## Definition of Done

- [ ] All navigation tabs and sections functional
- [ ] Corporate and Personal data structures independent
- [ ] Reverse tax calculation accurate per formula
- [ ] All sales channels for both tabs implemented
- [ ] All expense categories with VAT indicators
- [ ] Used purchase CRUD with proof tracking
- [ ] Fixed costs with annual auto-apply and monthly override
- [ ] Depreciation with auto-calculation
- [ ] VAT simulation with quarterly breakdown
- [ ] Tax reserve banner and cumulative tracking
- [ ] JSON export/import with validation
- [ ] Responsive design (mobile + desktop)
- [ ] Color-coded warnings throughout
- [ ] Contextual tips displayed appropriately
- [ ] recharts integration (achievement, VAT, trends)
