import React from 'react'
import { useStore } from './context/store'
import PortfolioDashboard from './components/PortfolioDashboard'
import ProjectWizard from './components/ProjectWizard'

export default function App() {
  const view = useStore(s => s.view)

  return (
    <div className="min-h-screen bg-dark-900 font-arabic">
      {view === 'portfolio' ? <PortfolioDashboard /> : <ProjectWizard />}
    </div>
  )
}
