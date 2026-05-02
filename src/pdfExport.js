import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmt, fmtCurrency, fmtPct, RATINGS, SCENARIOS, calcScenario } from './calculator'

export async function generatePDF(project, results) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const rating = RATINGS[results.rating]

  // ── Helper colors
  const GOLD = [212, 160, 23]
  const DARK = [13, 13, 15]
  const DARK2 = [28, 28, 33]
  const WHITE = [245, 245, 245]
  const GRAY = [120, 120, 130]

  const addPage = () => {
    doc.addPage()
    // dark bg
    doc.setFillColor(...DARK)
    doc.rect(0, 0, W, H, 'F')
  }

  // ═══ PAGE 1 ═══
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, H, 'F')

  // Gold header bar
  doc.setFillColor(...GOLD)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(...DARK)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Real Estate Investment Pro', 14, 11)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Professional Real Estate Feasibility Platform', 14, 18)

  const dateStr = new Date().toLocaleDateString('ar-SA')
  doc.setFontSize(8)
  doc.text(dateStr, W - 14, 18, { align: 'right' })

  // Project name
  doc.setTextColor(...WHITE)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(project.name, W - 14, 44, { align: 'right' })

  doc.setTextColor(...GRAY)
  doc.setFontSize(9)
  doc.text(project.propertyInfo.city || '', W - 14, 52, { align: 'right' })

  // Gold line
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(14, 58, W - 14, 58)

  // ── Rating Box
  let ratingColor = results.rating === 'good' ? [16, 185, 129] : results.rating === 'moderate' ? [245, 158, 11] : [239, 68, 68]
  doc.setFillColor(...ratingColor, 0.15)
  doc.setFillColor(ratingColor[0], ratingColor[1], ratingColor[2])
  doc.setGState(new doc.GState({ opacity: 0.12 }))
  doc.roundedRect(14, 62, W - 28, 18, 3, 3, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))
  doc.setDrawColor(...ratingColor)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, 62, W - 28, 18, 3, 3, 'S')
  doc.setTextColor(...ratingColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(rating.label, W - 20, 73.5, { align: 'right' })
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.text('Investment Rating', 20, 73.5)

  // ── KPIs Grid
  const kpis = [
    ['Total Project Cost', fmtCurrency(results.totalCost)],
    ['NOI (Annual)', fmtCurrency(results.noi)],
    ['ROI', fmtPct(results.roi)],
    ['ROE', fmtPct(results.roe)],
    ['Cap Rate', fmtPct(results.capRate)],
    ['Payback Period', `${results.payback < 99 ? results.payback.toFixed(1) : '—'} yrs`],
    ['IRR', fmtPct(results.irr)],
    ['NPV', fmtCurrency(results.npv)],
    ['DSCR', results.dscr < 99 ? results.dscr.toFixed(2) : '—'],
    ['Break-even Occ.', fmtPct(results.breakEvenOcc)],
  ]

  let y = 92
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD)
  doc.text('Key Financial Indicators', W - 14, y, { align: 'right' })
  y += 6

  const cols = 2
  const colW = (W - 28) / cols
  kpis.forEach(([label, value], i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = 14 + col * colW
    const yy = y + row * 12

    doc.setFillColor(...DARK2)
    doc.roundedRect(x, yy, colW - 3, 11, 2, 2, 'F')

    doc.setTextColor(...GRAY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x + colW - 5, yy + 4.5, { align: 'right' })

    const isPositive = value.includes('+') || (!value.includes('-') && !value.includes('٪') && parseFloat(value) > 0)
    doc.setTextColor(...WHITE)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(value, x + 4, yy + 8)
  })

  // ── Property Info section
  y = y + Math.ceil(kpis.length / cols) * 12 + 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD)
  doc.text('Property Information', W - 14, y, { align: 'right' })
  y += 6

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['Type', project.propertyInfo.propertyType],
      ['City / Location', project.propertyInfo.city || '—'],
      ['Land Area', `${fmt(project.propertyInfo.landArea)} m²`],
      ['Built-up Area', `${fmt(project.propertyInfo.builtUpArea)} m²`],
      ['Floors', String(project.propertyInfo.floors || 1)],
      ['Units', String(project.propertyInfo.units || 1)],
      ['Duration', `${project.propertyInfo.projectDurationYears} years`],
    ],
    styles: { fontSize: 8, cellPadding: 3, textColor: WHITE, fillColor: DARK2, lineColor: [40, 40, 50], lineWidth: 0.2 },
    columnStyles: { 0: { textColor: GRAY, cellWidth: 50 }, 1: { halign: 'right' } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })

  // Footer page 1
  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.text('Page 1 of 3', W / 2, H - 8, { align: 'center' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.3)
  doc.line(14, H - 12, W - 14, H - 12)

  // ═══ PAGE 2 — Costs & Revenue ═══
  addPage()

  // Gold top bar
  doc.setFillColor(...GOLD)
  doc.rect(0, 0, W, 14, 'F')
  doc.setTextColor(...DARK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Development Costs & Revenue Analysis', 14, 9)

  y = 22
  doc.setTextColor(...GOLD)
  doc.setFontSize(9)
  doc.text('Development Costs Breakdown', W - 14, y, { align: 'right' })
  y += 5

  const construction = project.propertyInfo.builtUpArea * (project.costs.constructionCostPerSqm || 0)
  autoTable(doc, {
    startY: y,
    head: [['Cost Item', 'Amount (SAR)']],
    body: [
      ['Land Cost', fmtCurrency(project.costs.landCost)],
      ['Construction Cost', fmtCurrency(construction)],
      ['Design & Engineering', fmtCurrency(project.costs.designFees)],
      ['Permits & Government Fees', fmtCurrency(project.costs.permitsFees)],
      ['Infrastructure', fmtCurrency(project.costs.infrastructure)],
      ['Civil Defense', fmtCurrency(project.costs.civilDefense)],
      ['Elevators', fmtCurrency(project.costs.elevators)],
      ['Finishing', fmtCurrency(project.costs.finishingCosts)],
      ['Marketing & Leasing', fmtCurrency(project.costs.marketingCosts)],
      ['Pre-operating', fmtCurrency(project.costs.preOperating)],
      [`Contingency (${project.costs.contingencyPct}%)`, fmtCurrency(results.contingency)],
      ['TOTAL PROJECT COST', fmtCurrency(results.totalCost)],
    ],
    styles: { fontSize: 8, cellPadding: 3, textColor: WHITE, fillColor: DARK2, lineColor: [40, 40, 50] },
    headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: 'bold' },
    foot: [],
    didParseCell: (data) => {
      if (data.row.index === 11) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = GOLD
        data.cell.styles.fillColor = [30, 30, 36]
      }
    },
    columnStyles: { 1: { halign: 'right' } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10

  doc.setTextColor(...GOLD)
  doc.setFontSize(9)
  doc.text('Revenue & Operating Expenses', W - 14, y, { align: 'right' })
  y += 5

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Amount (SAR)']],
    body: [
      ['Annual Rent (Gross)', fmtCurrency(project.revenue.annualRent)],
      [`Occupancy Rate`, fmtPct(project.revenue.occupancyRate)],
      ['Effective Rental Income', fmtCurrency(results.baseRent)],
      ['Additional Income', fmtCurrency(results.egi - results.baseRent)],
      ['Effective Gross Income', fmtCurrency(results.egi)],
      ['Total Operating Expenses', fmtCurrency(results.totalOpex)],
      ['Net Operating Income (NOI)', fmtCurrency(results.noi)],
      ['Annual Debt Service', fmtCurrency(project.financing.enabled ? results.loanMetrics.annualDebtService : 0)],
      ['Cash Flow After Financing', fmtCurrency(results.cashFlowAfter)],
    ],
    styles: { fontSize: 8, cellPadding: 3, textColor: WHITE, fillColor: DARK2, lineColor: [40, 40, 50] },
    headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: 'bold' },
    didParseCell: (data) => {
      if ([4, 6, 8].includes(data.row.index)) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = GOLD
      }
    },
    columnStyles: { 1: { halign: 'right' } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })

  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.text('Page 2 of 3', W / 2, H - 8, { align: 'center' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.3)
  doc.line(14, H - 12, W - 14, H - 12)

  // ═══ PAGE 3 — Scenarios & Risk ═══
  addPage()

  doc.setFillColor(...GOLD)
  doc.rect(0, 0, W, 14, 'F')
  doc.setTextColor(...DARK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Scenario Analysis & Risk Assessment', 14, 9)

  y = 22
  doc.setTextColor(...GOLD)
  doc.setFontSize(9)
  doc.text('Three-Scenario Comparison', W - 14, y, { align: 'right' })
  y += 5

  const scenarios = SCENARIOS.map(s => {
    const r = calcScenario(project, s.multipliers)
    return [s.label, fmtCurrency(r.noi), fmtPct(r.roi), fmtPct(r.capRate), `${r.payback < 99 ? r.payback.toFixed(1) : '—'} yrs`, fmtPct(r.irr), RATINGS[r.rating]?.label || '']
  })

  autoTable(doc, {
    startY: y,
    head: [['Scenario', 'NOI', 'ROI', 'Cap Rate', 'Payback', 'IRR', 'Rating']],
    body: scenarios,
    styles: { fontSize: 8, cellPadding: 3, textColor: WHITE, fillColor: DARK2, lineColor: [40, 40, 50] },
    headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10

  if (project.financing.enabled) {
    doc.setTextColor(...GOLD)
    doc.setFontSize(9)
    doc.text('Financing Details', W - 14, y, { align: 'right' })
    y += 5
    autoTable(doc, {
      startY: y,
      head: [],
      body: [
        ['Loan Amount', fmtCurrency(project.financing.loanAmount)],
        ['LTV', fmtPct(project.financing.ltvPct)],
        ['Interest Rate', fmtPct(project.financing.interestRate)],
        ['Loan Term', `${project.financing.loanTermYears} years`],
        ['Monthly Payment', fmtCurrency(results.loanMetrics.monthlyPayment)],
        ['Total Interest', fmtCurrency(results.loanMetrics.totalInterest)],
        ['DSCR', results.dscr < 99 ? results.dscr.toFixed(2) : '—'],
      ],
      styles: { fontSize: 8, cellPadding: 3, textColor: WHITE, fillColor: DARK2, lineColor: [40, 40, 50] },
      columnStyles: { 0: { textColor: GRAY, cellWidth: 50 }, 1: { halign: 'right' } },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Disclaimer
  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.text(
    'This report was generated by Real Estate Investment Pro. All figures are estimates based on provided inputs.',
    14, H - 18, { maxWidth: W - 28 }
  )
  doc.text('Page 3 of 3', W / 2, H - 8, { align: 'center' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.3)
  doc.line(14, H - 12, W - 14, H - 12)

  doc.save(`${project.name.replace(/\s+/g, '-')}-report.pdf`)
}
