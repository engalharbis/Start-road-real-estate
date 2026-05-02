import React from 'react'
import { useStore } from '../../context/store'
import { calcEffectiveGrossIncome, calcTotalOpex, calcLoanMetrics, fmtCurrency, fmtPct } from '../../utils/calculator'
import { SectionHeader, NumInput, Toggle, InfoRow } from '../ui'

// ═══ Step 3: Revenue ═══════════════════════════════════════════════════════════
export function Step3Revenue() {
  const project = useStore(s => s.getActiveProject())
  const updateRevenue = useStore(s => s.updateRevenue)
  const id = project.id
  const rev = project.revenue
  const up = (f, v) => updateRevenue(id, f, v)
  const egi = calcEffectiveGrossIncome(rev)
  const isHotel = project.propertyInfo.propertyType === 'hotel'

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader icon="💵" title="نموذج الإيرادات" subtitle="الخطوة 3 من 5 — حدد مصادر الدخل المتوقعة" />

      <div>
        <p className="section-title">الإيجار الأساسي</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput label="الإيجار السنوي المتوقع (إجمالي)" value={rev.annualRent} onChange={v => up('annualRent', v)} />
          <NumInput label="معدل الإشغال" value={rev.occupancyRate} onChange={v => up('occupancyRate', Math.min(100, v))} unit="%" min={0} step={1} />
          <NumInput label="نسبة الزيادة السنوية في الإيجار" value={rev.annualRentIncrease} onChange={v => up('annualRentIncrease', v)} unit="%" min={0} step={0.5} />
        </div>
        {rev.annualRent > 0 && (
          <div className="mt-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex justify-between items-center">
            <span className="text-emerald-400 font-bold num">{fmtCurrency(egi.baseRent)}</span>
            <span className="text-gray-400 text-xs">الإيجار الفعلي بعد الإشغال ({rev.occupancyRate}%)</span>
          </div>
        )}
      </div>

      <div>
        <p className="section-title">دخل إضافي</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput label="إيرادات المواقف" value={rev.parkingIncome} onChange={v => up('parkingIncome', v)} />
          <NumInput label="إيرادات الإعلانات" value={rev.advertisingIncome} onChange={v => up('advertisingIncome', v)} />
          <NumInput label="إيرادات الخدمات" value={rev.servicesIncome} onChange={v => up('servicesIncome', v)} />
          {isHotel && (
            <NumInput label="إيرادات الضيافة" value={rev.hospitalityIncome} onChange={v => up('hospitalityIncome', v)} />
          )}
        </div>
      </div>

      {egi.total > 0 && (
        <div className="bg-dark-700 rounded-2xl border border-emerald-500/20 p-5">
          <p className="text-emerald-400 text-sm font-semibold mb-3">ملخص الإيرادات</p>
          <InfoRow label="الإيجار الفعلي (بعد الإشغال)" value={fmtCurrency(egi.baseRent)} />
          {egi.additional > 0 && <InfoRow label="الإيرادات الإضافية" value={fmtCurrency(egi.additional)} />}
          <div className="flex items-center justify-between pt-3 border-t border-dark-500 mt-2">
            <span className="text-emerald-400 font-bold text-xl num">{fmtCurrency(egi.total)}</span>
            <span className="text-white font-semibold">إجمالي الدخل الفعلي السنوي</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ Step 4: Opex ═════════════════════════════════════════════════════════════
export function Step4Opex() {
  const project = useStore(s => s.getActiveProject())
  const updateOpex = useStore(s => s.updateOpex)
  const id = project.id
  const opex = project.opex
  const up = (f, v) => updateOpex(id, f, v)
  const total = calcTotalOpex(opex)
  const egi = calcEffectiveGrossIncome(project.revenue).total
  const ratio = egi > 0 ? (total / egi) * 100 : 0

  const fields = [
    { key: 'maintenance', label: 'الصيانة' },
    { key: 'security', label: 'الأمن والحراسة' },
    { key: 'cleaning', label: 'النظافة' },
    { key: 'managementFees', label: 'رسوم الإدارة' },
    { key: 'utilities', label: 'المرافق (المناطق المشتركة)' },
    { key: 'insurance', label: 'التأمين' },
    { key: 'governmentFees', label: 'الرسوم الحكومية' },
    { key: 'marketing', label: 'التسويق والإعلان' },
    { key: 'vacancyLoss', label: 'خسارة الشواغر' },
    { key: 'collectionCosts', label: 'تكاليف التحصيل' },
  ]

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader icon="🏢" title="المصاريف التشغيلية" subtitle="الخطوة 4 من 5 — أدخل المصاريف السنوية للتشغيل" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <NumInput key={f.key} label={f.label} value={opex[f.key]} onChange={v => up(f.key, v)} />
        ))}
      </div>

      {total > 0 && (
        <div className="bg-dark-700 rounded-2xl border border-red-500/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-right">
              <p className="text-red-400 font-bold text-xl num">{fmtCurrency(total)}</p>
              <p className="text-gray-500 text-xs">إجمالي المصاريف السنوية</p>
            </div>
            {egi > 0 && (
              <div className="text-center">
                <div className={`text-lg font-bold num ${ratio > 40 ? 'text-red-400' : 'text-emerald-400'}`}>{ratio.toFixed(1)}%</div>
                <div className="text-gray-500 text-xs">نسبة المصاريف من الإيرادات</div>
              </div>
            )}
          </div>
          {egi > 0 && (
            <div className="bg-dark-600 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${ratio > 60 ? 'bg-red-400' : ratio > 40 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══ Step 5: Financing ════════════════════════════════════════════════════════
export function Step5Financing() {
  const project = useStore(s => s.getActiveProject())
  const updateFinancing = useStore(s => s.updateFinancing)
  const id = project.id
  const fin = project.financing
  const up = (f, v) => updateFinancing(id, f, v)
  const metrics = calcLoanMetrics(fin)

  // live NOI preview for DSCR
  const { calcEffectiveGrossIncome: egi, calcTotalOpex: opex } = {
    calcEffectiveGrossIncome: calcEffectiveGrossIncome(project.revenue).total,
    calcTotalOpex: calcTotalOpex(project.opex)
  }
  const noi = egi - opex
  const dscr = metrics.annualDebtService > 0 ? noi / metrics.annualDebtService : 99
  const dscrColor = dscr >= 1.25 ? 'text-emerald-400' : dscr >= 1.0 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader icon="🏦" title="التمويل" subtitle="الخطوة 5 من 5 — اختياري: أضف تفاصيل القرض البنكي" />

      {/* Toggle */}
      <div className="bg-dark-700 rounded-2xl border border-dark-500 p-5">
        <div className="flex items-center justify-between">
          <Toggle checked={fin.enabled} onChange={v => up('enabled', v)} />
          <div className="text-right">
            <p className="text-white font-medium">تفعيل التمويل البنكي</p>
            <p className="text-gray-500 text-xs mt-0.5">أوقف هذا الخيار للحساب بتمويل ذاتي كامل</p>
          </div>
        </div>
      </div>

      {fin.enabled && (
        <div className="animate-slide-up space-y-6">
          <div>
            <p className="section-title">شروط القرض</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumInput label="مبلغ القرض" value={fin.loanAmount} onChange={v => up('loanAmount', v)} />
              <NumInput label="نسبة التمويل من القيمة (LTV)" value={fin.ltvPct} onChange={v => up('ltvPct', v)} unit="%" min={0} step={5} />
              <NumInput label="معدل الفائدة السنوي" value={fin.interestRate} onChange={v => up('interestRate', v)} unit="%" min={0} step={0.25} />
              <NumInput label="مدة القرض" value={fin.loanTermYears} onChange={v => up('loanTermYears', v)} unit="سنة" min={1} step={1} />
              <NumInput label="فترة السماح" value={fin.gracePeriodMonths} onChange={v => up('gracePeriodMonths', v)} unit="شهر" min={0} step={1} />
            </div>
          </div>

          {metrics.monthlyPayment > 0 && (
            <div className="bg-dark-700 rounded-2xl border border-blue-500/20 p-5 space-y-1">
              <p className="text-blue-400 text-sm font-semibold mb-3">ملخص القرض</p>
              <InfoRow label="القسط الشهري" value={fmtCurrency(metrics.monthlyPayment)} />
              <InfoRow label="خدمة الدين السنوية" value={fmtCurrency(metrics.annualDebtService)} />
              <InfoRow label="إجمالي الفائدة" value={fmtCurrency(metrics.totalInterest)} />
              <InfoRow label="إجمالي المبلغ المسدد" value={fmtCurrency(metrics.totalPaid)} />

              {noi > 0 && (
                <div className="pt-4 mt-2 border-t border-dark-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-3xl font-bold num ${dscrColor}`}>{dscr < 99 ? dscr.toFixed(2) : '—'}</span>
                      <p className={`text-xs mt-0.5 ${dscrColor}`}>
                        {dscr >= 1.25 ? '✅ ممتاز' : dscr >= 1.0 ? '⚠️ مقبول' : '🚨 خطر'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium text-sm">نسبة تغطية خدمة الدين</p>
                      <p className="text-gray-500 text-xs">DSCR — المعيار المقبول ≥ 1.25</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
