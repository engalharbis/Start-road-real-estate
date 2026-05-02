import React, { useState } from 'react'
import { useStore } from '../../context/store'
import {
  calculateAll, calcScenario, fmtCurrency, fmtPct,
  RATINGS, SCENARIOS
} from '../../utils/calculator'
import { generatePDF } from '../../utils/pdfExport'
import { KPICard, InfoRow, SectionHeader, RiskBadge } from '../ui'
import { CostBreakdownChart, IncomeVsExpenseChart, CashFlowChart, ScenarioChart } from '../charts/Charts'

const TABS = ['المؤشرات', 'السيناريوهات', 'المخاطر', 'الرسوم البيانية']

function generateRiskFlags(project, results) {
  const flags = []
  const c = project.costs
  const constructionCost = project.propertyInfo.builtUpArea * (c.constructionCostPerSqm || 0)
  const costPerSqm = project.propertyInfo.builtUpArea > 0 ? constructionCost / project.propertyInfo.builtUpArea : 0

  if (costPerSqm > 4000) flags.push({ title: 'تكلفة بناء مرتفعة', desc: `تكلفة البناء ${Math.round(costPerSqm).toLocaleString('ar-SA')} ر.س/م² أعلى من المتوسط`, level: 'high' })
  if (project.revenue.occupancyRate < 75) flags.push({ title: 'معدل إشغال منخفض', desc: `معدل الإشغال ${project.revenue.occupancyRate}% أقل من الحد الأمني (75%)`, level: 'high' })
  if (project.financing.enabled && results.dscr < 1.2 && results.dscr < 99) flags.push({ title: 'عبء تمويلي مرتفع', desc: `DSCR = ${results.dscr.toFixed(2)} أقل من المعيار المقبول (1.25)`, level: 'medium' })
  if (results.payback > 15 && results.payback < 99) flags.push({ title: 'فترة استرداد طويلة', desc: `فترة الاسترداد ${results.payback.toFixed(1)} سنة تعتبر طويلة جداً`, level: 'medium' })
  if (results.roi < 6) flags.push({ title: 'عائد منخفض', desc: `ROI = ${results.roi.toFixed(1)}% أقل من المعدل المقبول (6%)`, level: 'high' })
  if (results.breakEvenOcc > 85) flags.push({ title: 'حساسية سوقية عالية', desc: `نقطة التعادل تتطلب إشغالاً بنسبة ${results.breakEvenOcc.toFixed(0)}%`, level: 'medium' })
  if (results.npv < 0) flags.push({ title: 'NPV سلبية', desc: 'صافي القيمة الحالية سالبة بمعدل خصم 10%', level: 'high' })
  return flags
}

export default function Step6Results() {
  const project = useStore(s => s.getActiveProject())
  const [tab, setTab] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const results = calculateAll(project)
  const rating = RATINGS[results.rating]
  const riskFlags = generateRiskFlags(project, results)
  const scenarios = SCENARIOS.map(s => ({ ...s, results: calcScenario(project, s.multipliers) }))

  const handlePDF = async () => {
    setPdfLoading(true)
    try { await generatePDF(project, results) }
    finally { setPdfLoading(false) }
  }

  const overallRisk = riskFlags.some(f => f.level === 'high') ? 'high' : riskFlags.some(f => f.level === 'medium') ? 'medium' : 'low'

  return (
    <div className="animate-slide-up space-y-5">
      <SectionHeader icon="📊" title="النتائج المالية" subtitle="تحليل شامل لجدوى الاستثمار" />

      {/* Rating Banner */}
      <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: rating.bg, borderColor: rating.border }}>
        <span className="text-3xl">{rating.icon}</span>
        <div className="flex-1 text-right">
          <p className="font-bold text-xl" style={{ color: rating.color }}>{rating.label}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            ROI {fmtPct(results.roi)} · DSCR {results.dscr < 99 ? results.dscr.toFixed(2) : '—'} · استرداد {results.payback < 99 ? results.payback.toFixed(1) : '—'} سنة
          </p>
        </div>
        <button
          onClick={handlePDF}
          disabled={pdfLoading}
          className="btn-gold flex items-center gap-2 text-sm whitespace-nowrap"
        >
          {pdfLoading ? (
            <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin inline-block" />
          ) : '📄'}
          {pdfLoading ? 'جاري الإنشاء...' : 'تصدير PDF'}
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${tab === i ? 'gold-gradient text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: KPIs */}
      {tab === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="العائد على الاستثمار" value={fmtPct(results.roi)} color={results.roi >= 10 ? 'text-emerald-400' : results.roi >= 6 ? 'text-yellow-400' : 'text-red-400'} icon="%" />
            <KPICard label="العائد على حقوق الملكية" value={fmtPct(results.roe)} color="text-gold" icon="📈" />
            <KPICard label="معدل الرسملة" value={fmtPct(results.capRate)} color="text-blue-400" icon="🏢" />
            <KPICard label="فترة الاسترداد" value={results.payback < 99 ? `${results.payback.toFixed(1)} س` : '—'} color={results.payback <= 10 ? 'text-emerald-400' : 'text-yellow-400'} icon="⏱" />
          </div>

          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
            <p className="text-gold text-sm font-semibold mb-4">التفاصيل المالية</p>
            <InfoRow label="إجمالي تكلفة المشروع" value={fmtCurrency(results.totalCost)} highlight />
            <InfoRow label="حقوق الملكية المستثمرة" value={fmtCurrency(results.equityInvested)} />
            <InfoRow label="الدخل الفعلي السنوي (EGI)" value={fmtCurrency(results.egi)} />
            <InfoRow label="إجمالي المصاريف التشغيلية" value={fmtCurrency(results.totalOpex)} />
            <InfoRow label="صافي الدخل التشغيلي (NOI)" value={fmtCurrency(results.noi)} highlight />
            <InfoRow label="التدفق النقدي قبل التمويل" value={fmtCurrency(results.cashFlowBefore)} />
            <InfoRow label="التدفق النقدي بعد التمويل" value={fmtCurrency(results.cashFlowAfter)} />
            <InfoRow label="نقطة التعادل (إشغال)" value={fmtPct(results.breakEvenOcc)} />
            <InfoRow label="القيمة السوقية (بالدخل)" value={fmtCurrency(results.propertyValue)} highlight />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
              <p className="text-purple-400 text-sm font-semibold mb-3">مؤشرات متقدمة</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className={`text-3xl font-bold num ${results.irr >= 12 ? 'text-emerald-400' : 'text-yellow-400'}`}>{fmtPct(results.irr)}</div>
                  <div className="text-gray-500 text-xs mt-1">معدل العائد الداخلي IRR</div>
                </div>
                <div className="w-px bg-dark-500" />
                <div className="text-center">
                  <div className={`text-3xl font-bold num ${results.npv >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {results.npv >= 0 ? '+' : ''}{Math.round(results.npv / 1000)}k
                  </div>
                  <div className="text-gray-500 text-xs mt-1">صافي القيمة الحالية NPV</div>
                </div>
              </div>
            </div>
            {project.financing.enabled && (
              <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
                <p className="text-blue-400 text-sm font-semibold mb-3">مؤشرات التمويل</p>
                <InfoRow label="القسط الشهري" value={fmtCurrency(results.loanMetrics.monthlyPayment)} />
                <InfoRow label="خدمة الدين السنوية" value={fmtCurrency(results.loanMetrics.annualDebtService)} />
                <InfoRow label="DSCR" value={results.dscr < 99 ? results.dscr.toFixed(2) : '—'} highlight />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Scenarios */}
      {tab === 1 && (
        <div className="space-y-4 animate-fade-in">
          {scenarios.map(({ key, label, results: sr, color }) => (
            <div key={key} className="bg-dark-700 rounded-2xl border border-dark-500 p-5" style={{ borderColor: `${color}33` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg border" style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
                  {RATINGS[sr.rating]?.label}
                </span>
                <p className="font-bold text-white text-lg">{label}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { l: 'ROI', v: fmtPct(sr.roi) },
                  { l: 'NOI', v: fmtCurrency(sr.noi) },
                  { l: 'تدفق نقدي', v: fmtCurrency(sr.cashFlowAfter) },
                  { l: 'استرداد', v: sr.payback < 99 ? `${sr.payback.toFixed(1)} س` : '—' },
                ].map(item => (
                  <div key={item.l} className="text-center">
                    <div className="font-bold text-white num text-sm">{item.v}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{item.l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Comparison table */}
          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
            <p className="text-gold text-sm font-semibold mb-4">مقارنة تفصيلية</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-500">
                    <th className="text-right text-gray-500 pb-2 font-medium">المؤشر</th>
                    {scenarios.map(s => (
                      <th key={s.key} className="text-center pb-2 font-medium" style={{ color: s.color }}>{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {[
                    { label: 'ROI', fn: r => fmtPct(r.roi) },
                    { label: 'ROE', fn: r => fmtPct(r.roe) },
                    { label: 'NOI', fn: r => fmtCurrency(r.noi) },
                    { label: 'تكلفة المشروع', fn: r => fmtCurrency(r.totalCost) },
                    { label: 'التدفق النقدي', fn: r => fmtCurrency(r.cashFlowAfter) },
                    { label: 'فترة الاسترداد', fn: r => r.payback < 99 ? `${r.payback.toFixed(1)} سنة` : '—' },
                    { label: 'IRR', fn: r => fmtPct(r.irr) },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="text-gray-400 py-2.5">{row.label}</td>
                      {scenarios.map(s => (
                        <td key={s.key} className="text-center text-white num py-2.5 text-xs">{row.fn(s.results)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Risks */}
      {tab === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
              overallRisk === 'low' ? 'bg-emerald-500/10' : overallRisk === 'medium' ? 'bg-yellow-500/10' : 'bg-red-500/10'
            }`}>
              {overallRisk === 'low' ? '🛡️' : overallRisk === 'medium' ? '⚠️' : '🚨'}
            </div>
            <div className="flex-1 text-right">
              <RiskBadge level={overallRisk} />
              <p className="text-gray-400 text-xs mt-1">{riskFlags.length} تنبيه(ات) مكتشفة</p>
            </div>
          </div>

          {riskFlags.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-400">لا توجد مخاطر مكتشفة</p>
              <p className="text-gray-600 text-sm">المشروع يفي بجميع المعايير المالية</p>
            </div>
          ) : (
            riskFlags.map((flag, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  flag.level === 'high' ? 'risk-high' : flag.level === 'medium' ? 'risk-medium' : 'risk-low'
                }`}
              >
                <span className="text-lg mt-0.5">{flag.level === 'high' ? '🚨' : '⚠️'}</span>
                <div className="text-right flex-1">
                  <p className="font-semibold text-sm">{flag.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">{flag.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Charts */}
      {tab === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
              <CostBreakdownChart project={project} results={results} />
            </div>
            <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
              <IncomeVsExpenseChart results={results} />
            </div>
          </div>
          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
            <CashFlowChart project={project} results={results} />
          </div>
          <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
            <ScenarioChart scenarios={scenarios} />
          </div>
        </div>
      )}
    </div>
  )
}
