import React from 'react'
import { useStore } from '../context/store'
import { calculateAll, fmtPct, RATINGS } from '../utils/calculator'
import { StepProgress } from './ui'
import Step1PropertyInfo from './steps/Step1PropertyInfo'
import Step2DevCosts from './steps/Step2DevCosts'
import { Step3Revenue, Step4Opex, Step5Financing } from './steps/Steps3_4_5'
import Step6Results from './steps/Step6Results'

const STEPS = [
  { label: 'العقار', short: '1' },
  { label: 'التكاليف', short: '2' },
  { label: 'الإيرادات', short: '3' },
  { label: 'المصاريف', short: '4' },
  { label: 'التمويل', short: '5' },
  { label: 'النتائج', short: '6' },
]

const STEP_COMPONENTS = [
  Step1PropertyInfo,
  Step2DevCosts,
  Step3Revenue,
  Step4Opex,
  Step5Financing,
  Step6Results,
]

export default function ProjectWizard() {
  const project = useStore(s => s.getActiveProject())
  const activeStep = useStore(s => s.activeStep)
  const closeProject = useStore(s => s.closeProject)
  const nextStep = useStore(s => s.nextStep)
  const prevStep = useStore(s => s.prevStep)
  const setStep = useStore(s => s.setStep)
  const updateProject = useStore(s => s.updateProject)
  const portfolioVM = useStore(s => s)

  if (!project) return null

  const results = calculateAll(project)
  const rating = RATINGS[results.rating]
  const StepComponent = STEP_COMPONENTS[activeStep]

  const handleSave = () => {
    updateProject(project.id, p => ({ ...p, lastModified: new Date().toISOString() }))
    portfolioVM.saveProjects?.()
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark-900/98 backdrop-blur border-b border-dark-600">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 space-y-3">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={closeProject}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              المحفظة
            </button>

            <div className="text-right flex-1 mx-4">
              <p className="text-white font-semibold text-sm leading-tight truncate">{project.name}</p>
              {results.roi > 0 && (
                <span className="text-xs" style={{ color: rating.color }}>
                  {rating.icon} {fmtPct(results.roi)} ROI
                </span>
              )}
            </div>

            <button onClick={handleSave} className="text-gold text-sm font-medium hover:text-gold-light transition-colors">
              حفظ
            </button>
          </div>

          {/* Step tabs */}
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1 w-max min-w-full">
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${activeStep === i
                      ? 'gold-gradient text-dark-900'
                      : i < activeStep
                        ? 'bg-gold/15 text-gold'
                        : 'bg-dark-700 text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <StepProgress
            steps={STEPS.map(s => s.label)}
            current={activeStep}
            onStep={setStep}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6">
          <StepComponent />
        </div>
      </div>

      {/* Footer nav */}
      {activeStep < 5 && (
        <div className="sticky bottom-0 bg-dark-900/98 backdrop-blur border-t border-dark-600">
          <div className="max-w-2xl mx-auto px-5 py-4 flex gap-3">
            {activeStep > 0 && (
              <button onClick={prevStep} className="btn-outline flex-1 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                السابق
              </button>
            )}
            <button onClick={nextStep} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {activeStep === 4 ? 'عرض النتائج' : 'التالي'}
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeStep === 5 && (
        <div className="sticky bottom-0 bg-dark-900/98 backdrop-blur border-t border-dark-600">
          <div className="max-w-2xl mx-auto px-5 py-4">
            <button onClick={prevStep} className="btn-outline w-full flex items-center justify-center gap-2">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة للتعديل
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
