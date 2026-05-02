import React from 'react'
import { useStore } from '../../context/store'
import { PROPERTY_TYPES } from '../../utils/calculator'
import { SectionHeader, NumInput, TextInput } from '../ui'

export default function Step1PropertyInfo() {
  const project = useStore(s => s.getActiveProject())
  const updatePropertyInfo = useStore(s => s.updatePropertyInfo)
  const id = project.id
  const info = project.propertyInfo
  const up = (f, v) => updatePropertyInfo(id, f, v)

  const builtToLandRatio = info.landArea > 0 ? ((info.builtUpArea / info.landArea) * 100).toFixed(0) : 0

  return (
    <div className="animate-slide-up space-y-6">
      <SectionHeader icon="🏢" title="معلومات العقار" subtitle="الخطوة 1 من 5 — اختر نوع العقار وأدخل التفاصيل الأساسية" />

      {/* Property Type */}
      <div>
        <p className="section-title">نوع العقار</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROPERTY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => up('propertyType', type.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center
                ${info.propertyType === type.id
                  ? 'gold-gradient border-transparent text-dark-900 scale-[1.02] shadow-lg'
                  : 'bg-dark-700 border-dark-500 text-gray-300 hover:border-gold/30'
                }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs font-medium leading-tight">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="section-title">الموقع</p>
        <TextInput
          label="المدينة / الحي"
          value={info.city}
          onChange={v => up('city', v)}
          placeholder="مثال: الرياض - حي النرجس"
        />
      </div>

      {/* Areas */}
      <div>
        <p className="section-title">المساحات</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumInput label="مساحة الأرض" value={info.landArea} onChange={v => up('landArea', v)} unit="م²" />
          <NumInput label="مساحة البناء الإجمالية" value={info.builtUpArea} onChange={v => up('builtUpArea', v)} unit="م²" />
        </div>
        {info.landArea > 0 && info.builtUpArea > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-gold/5 rounded-xl border border-gold/20">
            <span className="text-gold text-sm">📐</span>
            <span className="text-gray-400 text-xs">نسبة البناء إلى الأرض:</span>
            <span className="text-gold font-semibold text-sm num">{builtToLandRatio}%</span>
          </div>
        )}
      </div>

      {/* Counts */}
      <div>
        <p className="section-title">التفاصيل</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumInput label="عدد الطوابق" value={info.floors} onChange={v => up('floors', v)} unit="طابق" min={1} step={1} />
          <NumInput label="عدد الوحدات" value={info.units} onChange={v => up('units', v)} unit="وحدة" min={1} step={1} />
          <NumInput label="مدة المشروع" value={info.projectDurationYears} onChange={v => up('projectDurationYears', v)} unit="سنة" min={1} step={1} />
        </div>
      </div>

      {/* Summary card */}
      {info.builtUpArea > 0 && (
        <div className="bg-dark-700 rounded-2xl border border-gold/20 p-5">
          <p className="text-gold text-sm font-semibold mb-3">ملخص العقار</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: 'النوع', value: PROPERTY_TYPES.find(t => t.id === info.propertyType)?.label },
              { label: 'مساحة البناء', value: `${(info.builtUpArea || 0).toLocaleString('ar-SA')} م²` },
              { label: 'عدد الوحدات', value: info.units || 1 },
              { label: 'مدة المشروع', value: `${info.projectDurationYears} سنة` },
            ].map(item => (
              <div key={item.label}>
                <div className="text-white font-semibold num">{item.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
