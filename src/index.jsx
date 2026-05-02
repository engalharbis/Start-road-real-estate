import React from 'react'

// ─── Number Input ──────────────────────────────────────────────────────────────
export function NumInput({ label, value, onChange, unit = 'ر.س', hint, placeholder = '0', min = 0, step = 1 }) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <div className="relative flex items-center">
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          min={min}
          step={step}
          className="input-field pl-14"
        />
        {unit && (
          <span className="absolute left-3 text-xs text-gray-500 font-medium pointer-events-none select-none">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  )
}

// ─── Text Input ────────────────────────────────────────────────────────────────
export function TextInput({ label, value, onChange, placeholder = '' }) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center text-dark-900 text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
export function KPICard({ label, value, sub, color = 'text-white', icon }) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-2">
        {icon && <span className="text-gray-600 text-sm">{icon}</span>}
      </div>
      <div className={`text-xl font-bold num ${color} mb-1`}>{value}</div>
      <div className="text-xs text-gray-400 leading-snug">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', gold = false }) {
  return (
    <div className={`card ${gold ? 'border-gold/30' : ''} ${className}`}>
      {children}
    </div>
  )
}

// ─── Risk Badge ────────────────────────────────────────────────────────────────
export function RiskBadge({ level }) {
  const map = {
    high: 'risk-high',
    medium: 'risk-medium',
    low: 'risk-low',
  }
  const labels = { high: 'مخاطر عالية', medium: 'مخاطر متوسطة', low: 'مخاطر منخفضة' }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${map[level]}`}>
      {labels[level]}
    </span>
  )
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-gold' : 'bg-dark-400'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'right-0.5' : 'right-5'}`} />
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  )
}

// ─── Step Progress ─────────────────────────────────────────────────────────────
export function StepProgress({ steps, current, onStep }) {
  return (
    <div className="flex gap-1.5">
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => onStep(i)}
          className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-gold' : 'bg-dark-500'}`}
          title={s}
        />
      ))}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <h3 className="text-gray-400 font-medium text-lg mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-6">{desc}</p>
      {action}
    </div>
  )
}

// ─── Loading ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-dark-400 border-t-gold rounded-full animate-spin" />
    </div>
  )
}

// ─── Row ───────────────────────────────────────────────────────────────────────
export function InfoRow({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-dark-500 last:border-0 ${highlight ? 'text-gold' : ''}`}>
      <span className={`num text-sm font-medium ${highlight ? 'text-gold' : 'text-white'}`}>{value}</span>
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
  )
}
