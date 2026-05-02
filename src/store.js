import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultProject, sampleProject } from './calculator'

export const useStore = create(
  persist(
    (set, get) => ({
      projects: [sampleProject()],
      activeProjectId: 'sample-1',
      activeStep: 0,
      view: 'portfolio', // 'portfolio' | 'project'

      // Project CRUD
      addProject: () => {
        const p = defaultProject()
        set(s => ({ projects: [...s.projects, p], activeProjectId: p.id, activeStep: 0, view: 'project' }))
      },
      deleteProject: (id) => {
        set(s => {
          const projects = s.projects.filter(p => p.id !== id)
          return { projects, activeProjectId: projects[0]?.id || null, view: 'portfolio' }
        })
      },
      openProject: (id) => set({ activeProjectId: id, activeStep: 0, view: 'project' }),
      closeProject: () => set({ view: 'portfolio' }),

      // Update project fields
      updateProject: (id, updater) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? (typeof updater === 'function' ? updater(p) : { ...p, ...updater }) : p)
        }))
      },
      updatePropertyInfo: (id, field, value) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, propertyInfo: { ...p.propertyInfo, [field]: value } } : p)
        }))
      },
      updateCosts: (id, field, value) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, costs: { ...p.costs, [field]: value } } : p)
        }))
      },
      updateRevenue: (id, field, value) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, revenue: { ...p.revenue, [field]: value } } : p)
        }))
      },
      updateOpex: (id, field, value) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, opex: { ...p.opex, [field]: value } } : p)
        }))
      },
      updateFinancing: (id, field, value) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, financing: { ...p.financing, [field]: value } } : p)
        }))
      },

      // Navigation
      setStep: (step) => set({ activeStep: step }),
      nextStep: () => set(s => ({ activeStep: Math.min(s.activeStep + 1, 5) })),
      prevStep: () => set(s => ({ activeStep: Math.max(s.activeStep - 1, 0) })),

      // Getters
      getActiveProject: () => {
        const s = get()
        return s.projects.find(p => p.id === s.activeProjectId)
      }
    }),
    {
      name: 'real-estate-pro-storage',
      version: 1,
    }
  )
)
