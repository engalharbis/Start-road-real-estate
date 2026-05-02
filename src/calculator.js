// ─── Financial Calculator Engine ──────────────────────────────────────────────

export function calcTotalConstructionCost(builtUpArea, costPerSqm) {
  return builtUpArea * costPerSqm
}

export function calcTotalProjectCost(costs, builtUpArea) {
  const construction = builtUpArea * (costs.constructionCostPerSqm || 0)
  const base =
    (costs.landCost || 0) +
    construction +
    (costs.designFees || 0) +
    (costs.permitsFees || 0) +
    (costs.infrastructure || 0) +
    (costs.civilDefense || 0) +
    (costs.elevators || 0) +
    (costs.finishingCosts || 0) +
    (costs.marketingCosts || 0) +
    (costs.preOperating || 0)
  const contingency = base * ((costs.contingencyPct || 0) / 100)
  return { base, contingency, total: base + contingency, construction }
}

export function calcEffectiveGrossIncome(revenue) {
  const baseRent = (revenue.annualRent || 0) * ((revenue.occupancyRate || 90) / 100)
  const additional =
    (revenue.parkingIncome || 0) +
    (revenue.advertisingIncome || 0) +
    (revenue.servicesIncome || 0) +
    (revenue.hospitalityIncome || 0)
  return { baseRent, additional, total: baseRent + additional }
}

export function calcTotalOpex(opex) {
  return (
    (opex.maintenance || 0) +
    (opex.security || 0) +
    (opex.cleaning || 0) +
    (opex.managementFees || 0) +
    (opex.utilities || 0) +
    (opex.insurance || 0) +
    (opex.governmentFees || 0) +
    (opex.marketing || 0) +
    (opex.vacancyLoss || 0) +
    (opex.collectionCosts || 0)
  )
}

export function calcLoanMetrics(financing) {
  if (!financing.enabled || !financing.loanAmount || !financing.interestRate || !financing.loanTermYears) {
    return { monthlyPayment: 0, annualDebtService: 0, totalInterest: 0, totalPaid: 0 }
  }
  const monthlyRate = financing.interestRate / 100 / 12
  const n = financing.loanTermYears * 12
  const monthly = monthlyRate > 0
    ? financing.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : financing.loanAmount / n
  const totalPaid = monthly * n
  return {
    monthlyPayment: monthly,
    annualDebtService: monthly * 12,
    totalInterest: totalPaid - financing.loanAmount,
    totalPaid
  }
}

function calcIRR(cashFlows) {
  let rate = 0.1
  for (let i = 0; i < 200; i++) {
    let npv = 0, dnpv = 0
    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t)
      npv += cashFlows[t] / factor
      if (t > 0) dnpv -= t * cashFlows[t] / (factor * (1 + rate))
    }
    if (Math.abs(npv) < 0.1) break
    if (dnpv === 0) break
    rate -= npv / dnpv
    if (rate <= -0.999) return -99
  }
  return rate * 100
}

function calcNPV(cashFlows, rate = 0.1) {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0)
}

export function calculateAll(project) {
  const { propertyInfo: info, costs, revenue, opex, financing } = project

  const { total: totalCost, construction, contingency } = calcTotalProjectCost(costs, info.builtUpArea || 0)
  const { total: egi, baseRent } = calcEffectiveGrossIncome(revenue)
  const totalOpexAmt = calcTotalOpex(opex)
  const noi = egi - totalOpexAmt
  const loanMetrics = calcLoanMetrics(financing)
  const annualDebtService = financing.enabled ? loanMetrics.annualDebtService : 0
  const equityInvested = financing.enabled ? Math.max(totalCost - (financing.loanAmount || 0), totalCost * 0.2) : totalCost
  const cashFlowBefore = noi
  const cashFlowAfter = noi - annualDebtService

  const roi = totalCost > 0 ? (noi / totalCost) * 100 : 0
  const roe = equityInvested > 0 ? (cashFlowAfter / equityInvested) * 100 : 0
  const capRate = totalCost > 0 ? (noi / totalCost) * 100 : 0
  const payback = cashFlowAfter > 0 ? equityInvested / cashFlowAfter : 999
  const breakEvenOcc = revenue.annualRent > 0
    ? ((totalOpexAmt + annualDebtService) / revenue.annualRent) * 100
    : 0
  const marketCap = 0.08
  const propertyValue = marketCap > 0 ? noi / marketCap : 0
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 99

  // IRR & NPV
  const years = info.projectDurationYears || 10
  const terminalValue = propertyValue * 0.5
  const irr_cashFlows = [-equityInvested]
  for (let y = 1; y <= years; y++) {
    const rentGrowth = Math.pow(1 + (revenue.annualRentIncrease || 3) / 100, y - 1)
    const adjustedRent = (revenue.annualRent || 0) * rentGrowth * ((revenue.occupancyRate || 90) / 100)
    const additionalIncome = (revenue.parkingIncome || 0) + (revenue.advertisingIncome || 0) +
      (revenue.servicesIncome || 0) + (revenue.hospitalityIncome || 0)
    const yearNOI = (adjustedRent + additionalIncome) - totalOpexAmt
    const yearCF = yearNOI - annualDebtService
    irr_cashFlows.push(y === years ? yearCF + terminalValue : yearCF)
  }
  const irr = calcIRR(irr_cashFlows)
  const npv = calcNPV(irr_cashFlows, 0.1)

  // Rating
  let rating = 'high-risk'
  if (roi >= 10 && dscr >= 1.25 && payback <= 12) rating = 'good'
  else if (roi >= 6 && dscr >= 1.0 && payback <= 18) rating = 'moderate'

  return {
    totalCost, construction, contingency, egi, baseRent, totalOpex: totalOpexAmt,
    noi, cashFlowBefore, cashFlowAfter, equityInvested,
    roi, roe, capRate, payback, breakEvenOcc, propertyValue, dscr,
    irr, npv, rating,
    loanMetrics,
    opexRatio: egi > 0 ? (totalOpexAmt / egi) * 100 : 0
  }
}

export function calcScenario(project, multipliers) {
  const modified = {
    ...project,
    revenue: {
      ...project.revenue,
      annualRent: (project.revenue.annualRent || 0) * multipliers.rent,
      occupancyRate: Math.min(100, (project.revenue.occupancyRate || 90) * multipliers.occ),
    },
    costs: {
      ...project.costs,
      constructionCostPerSqm: (project.costs.constructionCostPerSqm || 0) * multipliers.cost,
    }
  }
  return calculateAll(modified)
}

export function calcCashFlowProjection(project, results) {
  const years = project.propertyInfo.projectDurationYears || 10
  const annualDebtService = project.financing.enabled ? results.loanMetrics.annualDebtService : 0
  const data = []
  for (let y = 1; y <= years; y++) {
    const rentGrowth = Math.pow(1 + (project.revenue.annualRentIncrease || 3) / 100, y - 1)
    const adjustedRent = (project.revenue.annualRent || 0) * rentGrowth * ((project.revenue.occupancyRate || 90) / 100)
    const additionalIncome = (project.revenue.parkingIncome || 0) + (project.revenue.advertisingIncome || 0) +
      (project.revenue.servicesIncome || 0) + (project.revenue.hospitalityIncome || 0)
    const yearNOI = (adjustedRent + additionalIncome) - results.totalOpex
    data.push({ year: y, noi: yearNOI, cashFlow: yearNOI - annualDebtService, rent: adjustedRent })
  }
  return data
}

export const PROPERTY_TYPES = [
  { id: 'residential', label: 'عمارة سكنية', icon: '🏢' },
  { id: 'villas', label: 'فلل', icon: '🏡' },
  { id: 'commercial', label: 'مجمع تجاري', icon: '🏪' },
  { id: 'workshops', label: 'ورش', icon: '🔧' },
  { id: 'warehouses', label: 'مستودعات', icon: '📦' },
  { id: 'land', label: 'أرض', icon: '🗺️' },
  { id: 'hotel', label: 'فندق / شقق مخدومة', icon: '🏨' },
]

export const SCENARIOS = [
  { key: 'conservative', label: 'متحفظ', multipliers: { rent: 0.90, occ: 0.85, cost: 1.10 }, color: '#F59E0B' },
  { key: 'base', label: 'أساسي', multipliers: { rent: 1.00, occ: 1.00, cost: 1.00 }, color: '#3B82F6' },
  { key: 'optimistic', label: 'متفائل', multipliers: { rent: 1.10, occ: 1.05, cost: 0.95 }, color: '#10B981' },
]

export const RATINGS = {
  good: { label: 'استثمار جيد', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: '✅' },
  moderate: { label: 'استثمار متوسط', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '⚠️' },
  'high-risk': { label: 'استثمار عالي المخاطر', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '🚨' },
}

export function fmt(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(Math.round(n))
}

export function fmtCurrency(n) {
  return `${fmt(n)} ر.س`
}

export function fmtPct(n) {
  if (!n && n !== 0) return '—'
  return `${n.toFixed(1)}%`
}

export const defaultProject = () => ({
  id: crypto.randomUUID(),
  name: 'مشروع جديد',
  createdAt: new Date().toISOString(),
  propertyInfo: {
    propertyType: 'residential',
    city: '',
    landArea: 0,
    builtUpArea: 0,
    floors: 1,
    units: 1,
    projectDurationYears: 10,
  },
  costs: {
    landCost: 0,
    constructionCostPerSqm: 0,
    designFees: 0,
    permitsFees: 0,
    infrastructure: 0,
    civilDefense: 0,
    elevators: 0,
    finishingCosts: 0,
    marketingCosts: 0,
    preOperating: 0,
    contingencyPct: 5,
  },
  revenue: {
    annualRent: 0,
    occupancyRate: 90,
    annualRentIncrease: 3,
    parkingIncome: 0,
    advertisingIncome: 0,
    servicesIncome: 0,
    hospitalityIncome: 0,
  },
  opex: {
    maintenance: 0,
    security: 0,
    cleaning: 0,
    managementFees: 0,
    utilities: 0,
    insurance: 0,
    governmentFees: 0,
    marketing: 0,
    vacancyLoss: 0,
    collectionCosts: 0,
  },
  financing: {
    enabled: false,
    loanAmount: 0,
    ltvPct: 60,
    interestRate: 5.5,
    loanTermYears: 20,
    gracePeriodMonths: 0,
  }
})

export const sampleProject = () => ({
  ...defaultProject(),
  id: 'sample-1',
  name: 'عمارة سكنية - الرياض',
  propertyInfo: { propertyType: 'residential', city: 'الرياض - حي النرجس', landArea: 800, builtUpArea: 3200, floors: 6, units: 24, projectDurationYears: 10 },
  costs: { landCost: 4000000, constructionCostPerSqm: 1800, designFees: 300000, permitsFees: 150000, infrastructure: 250000, civilDefense: 120000, elevators: 200000, finishingCosts: 800000, marketingCosts: 100000, preOperating: 80000, contingencyPct: 5 },
  revenue: { annualRent: 1440000, occupancyRate: 90, annualRentIncrease: 3, parkingIncome: 60000, advertisingIncome: 0, servicesIncome: 30000, hospitalityIncome: 0 },
  opex: { maintenance: 120000, security: 60000, cleaning: 48000, managementFees: 72000, utilities: 36000, insurance: 30000, governmentFees: 24000, marketing: 20000, vacancyLoss: 0, collectionCosts: 15000 },
  financing: { enabled: true, loanAmount: 5000000, ltvPct: 60, interestRate: 5.5, loanTermYears: 20, gracePeriodMonths: 12 },
})
