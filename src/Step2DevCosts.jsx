import React from 'react'
import { useStore } from '../../context/store'
import { calcTotalProjectCost, fmtCurrency } from '../../utils/calculator'
import { SectionHeader, NumInput, InfoRow } from '../ui'

export default function Step2DevCosts() {
  const project = useStore(s => s.getActiveProject())
  const updateCosts = useStore(s => s.updateCosts)
  const id = project.id
  const costs = project.costs
  const builtUpArea = project.propertyInfo.builtUpArea || 0
  const up = (f, v) => updateCosts(id, f, v)

  const { base, contingency, total, construction } = calcTotalProjectCost(costs, builtUpArea)

  const fields = [
    { key: 'designFees', label: 'رسوم التصميم والهندسة' },
    { key: 'permitsFees', label: 'رسوم التراخيص والحكومية' },
    { key: 'infrastructure', label: 'البنية التحتية (كهرباء، ماء، صرف)' },
    { key: 'civilDefense', label: 'أنظمة الدفاع المدني' },
    { key: 'elevators', label: 'المصاعد' },
    { key: 'finishingCosts', label: 'أعمال التشطيب' },
    { key: 'marketingCosts', label: 'التسويق والتأجير' },
    { key: 'preOperating', label: 'مصاريف ما قبل التشغيل' },
  ]

  const costBreakdown = [
    { label: 'الأرض', value: costs.landCost || 0 },
    { label: 'البناء', value: construction },
    { label: 'التصميم والهندسة', value: costs.designFees || 0 },
    { label: 'التراخيص', value: costs.permitsFees || 0 },
    { label: 'البنية التحتية', value: costs.infrastructure || 0 },
    { label: 'الدفاع المدني', value: costs.civilDefense || 0 },
    { label: 'المصاعد', value: costs.elevators || 0 },
    { label: 'التشطيب', value: costs.finishingCosts || 0 },
    { label: 'التسويق', value: costs.marketingCosts || 0 },
    { label: 'ما قبل التشغيل', value: costs.preOperating || 0 },
  ].filter(i => i.value > 0)

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader icon="💰" title="تكاليف التطوير" subtitle="الخطوة 2 من 5 — أدخل جميع تكاليف المشروع بالتفصيل" />

      {/* Land & Construction */}
      <div>
        <p className="section-title">الأرض والبناء</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput label="تكلفة الأرض" value={costs.landCost} onChange={v => up('landCost', v)} />
          <NumInput label="تكلفة البناء للمتر المربع" value={costs.constructionCostPerSqm} onChange={v => up('constructionCostPerSqm', v)} unit="ر.س/م²" />
        </div>
        {builtUpArea > 0 && costs.constructionCostPerSqm > 0 && (
          <div className="mt-3 p-4 bg-gold/5 rounded-xl border border-gold/20">
            <div className="flex justify-between items-center">
              <span className="text-gold font-bold text-lg num">{fmtCurrency(construction)}</span>
              <span className="text-gray-400 text-sm">إجمالي تكلفة البناء ({builtUpArea.toLocaleString('ar-SA')} م²)</span>
            </div>
          </div>
        )}
      </div>

      {/* Other costs */}
      <div>
        <p className="section-title">رسوم وتكاليف إضافية</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <NumInput key={f.key} label={f.label} value={costs[f.key]} onChange={v => up(f.key, v)} />
          ))}
        </div>
      </div>

      {/* Contingency */}
      <div>
        <p className="section-title">احتياطي الطوارئ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput label="نسبة الاحتياطي" value={costs.contingencyPct} onChange={v => up('contingencyPct', v)} unit="%" min={0} step={0.5} />
          {contingency > 0 && (
            <div className="flex flex-col justify-end">
              <p className="label">مبلغ الاحتياطي (محسوب تلقائياً)</p>
              <div className="input-field flex items-center justify-end text-yellow-400 font-semibold bg-yellow-500/5 border-yellow-500/20 cursor-not-allowed num">
                {fmtCurrency(contingency)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="bg-dark-700 rounded-2xl border border-gold/30 p-5">
          <p className="text-gold text-sm font-semibold mb-4">ملخص التكاليف</p>
          
          {/* Bars */}
          {costBreakdown.length > 0 && (
            <div className="space-y-2 mb-5">
              {costBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1 bg-dark-600 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.value / base) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-32 text-left">{item.label}</span>
                  <span className="text-white text-xs font-medium num w-28 text-right">{fmtCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-dark-500 pt-4 space-y-2">
            <InfoRow label="المجموع قبل الاحتياطي" value={fmtCurrency(base)} />
            {contingency > 0 && <InfoRow label={`احتياطي الطوارئ (${costs.contingencyPct}%)`} value={fmtCurrency(contingency)} />}
            <div className="flex items-center justify-between py-2 pt-3">
              <span className="text-gold font-bold text-lg num">{fmtCurrency(total)}</span>
              <span className="text-white font-semibold text-sm">إجمالي تكلفة المشروع</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
