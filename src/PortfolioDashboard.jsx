import React from 'react'
import { useStore } from './store'
import { calculateAll, fmtCurrency, fmtPct, RATINGS, PROPERTY_TYPES } from ''./calculator'
import { EmptyState } from './ui'

export default function PortfolioDashboard() {
  const projects = useStore(s => s.projects)
  const addProject = useStore(s => s.addProject)
  const openProject = useStore(s => s.openProject)
  const deleteProject = useStore(s => s.deleteProject)

  const allResults = projects.map(p => ({ project: p, results: calculateAll(p) }))
  const totalInvestment = allResults.reduce((s, r) => s + r.results.totalCost, 0)
  const avgROI = allResults.length > 0 ? allResults.reduce((s, r) => s + r.results.roi, 0) / allResults.length : 0
  const totalNOI = allResults.reduce((s, r) => s + r.results.noi, 0)

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur border-b border-dark-600 px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={addProject} className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
            <span>+</span>
            <span>مشروع جديد</span>
          </button>
          <div className="text-right">
            <h1 className="text-white font-bold text-xl leading-tight">عقار برو</h1>
            <p className="text-gray-500 text-xs">Real Estate Investment Pro</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Portfolio KPIs */}
        {projects.length > 0 && (
          <div className="gold-gradient rounded-2xl p-5 text-dark-900">
            <p className="text-dark-900/60 text-xs font-medium mb-1">إجمالي محفظة الاستثمار</p>
            <p className="text-3xl font-bold num">{fmtCurrency(totalInvestment)}</p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-dark-900/60 text-xs">متوسط العائد</p>
                <p className="font-bold text-lg num">{fmtPct(avgROI)}</p>
              </div>
              <div>
                <p className="text-dark-900/60 text-xs">صافي الدخل السنوي</p>
                <p className="font-bold text-lg num">{fmtCurrency(totalNOI)}</p>
              </div>
              <div>
                <p className="text-dark-900/60 text-xs">عدد المشاريع</p>
                <p className="font-bold text-lg">{projects.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">{projects.length} مشروع</span>
            <h2 className="text-white font-semibold">المشاريع</h2>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon="🏢"
              title="لا توجد مشاريع بعد"
              desc="أضف مشروعك الاستثماري الأول وابدأ التحليل"
              action={
                <button onClick={addProject} className="btn-gold">
                  + إضافة مشروع
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {allResults.map(({ project, results }) => {
                const rating = RATINGS[results.rating]
                const propType = PROPERTY_TYPES.find(t => t.id === project.propertyInfo.propertyType)
                return (
                  <div
                    key={project.id}
                    className="bg-dark-700 rounded-2xl border border-dark-500 hover:border-gold/25 transition-all duration-200 overflow-hidden cursor-pointer group"
                    onClick={() => openProject(project.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-dark-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {propType?.icon || '🏢'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ color: rating.color, background: rating.bg, borderColor: rating.border }}>
                              {rating.label}
                            </span>
                          </div>
                          <p className="text-white font-semibold mt-0.5 truncate">{project.name}</p>
                          <p className="text-gray-500 text-xs truncate">{project.propertyInfo.city || 'موقع غير محدد'}</p>
                        </div>

                        {/* ROI */}
                        <div className="text-left flex-shrink-0">
                          <div className={`text-2xl font-bold num ${results.roi >= 10 ? 'text-emerald-400' : results.roi >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {fmtPct(results.roi)}
                          </div>
                          <div className="text-gray-500 text-xs">ROI</div>
                        </div>

                        <svg className="w-4 h-4 text-gray-600 group-hover:text-gold transition-colors flex-shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* KPIs row */}
                      <div className="flex justify-around mt-4 pt-4 border-t border-dark-600 text-center">
                        <div>
                          <div className="text-white text-sm font-medium num">{fmtCurrency(results.totalCost)}</div>
                          <div className="text-gray-600 text-xs">التكلفة</div>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium num">{fmtCurrency(results.noi)}</div>
                          <div className="text-gray-600 text-xs">NOI</div>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium num">{results.payback < 99 ? `${results.payback.toFixed(1)} س` : '—'}</div>
                          <div className="text-gray-600 text-xs">الاسترداد</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
