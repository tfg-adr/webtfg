export const temas = {
  1: {
    '--color-primary':        '#ff5c00',
    '--color-primary-light':  '#ff8c00',
    '--color-primary-bg':     'rgba(255,92,0,0.1)',
    '--color-primary-bg-sm':  'rgba(255,92,0,0.05)',
    '--color-primary-bg-md':  'rgba(255,92,0,0.15)',
    '--color-primary-border': 'rgba(255,92,0,0.3)',
    '--color-primary-border-sm': 'rgba(255,92,0,0.2)',
    '--color-primary-border-lg': 'rgba(255,92,0,0.4)',
  },
  2: {
    '--color-primary':        '#00b4d8',
    '--color-primary-light':  '#0077b6',
    '--color-primary-bg':     'rgba(0,180,216,0.1)',
    '--color-primary-bg-sm':  'rgba(0,180,216,0.05)',
    '--color-primary-bg-md':  'rgba(0,180,216,0.15)',
    '--color-primary-border': 'rgba(0,180,216,0.3)',
    '--color-primary-border-sm': 'rgba(0,180,216,0.2)',
    '--color-primary-border-lg': 'rgba(0,180,216,0.4)',
  },
  3: {
    '--color-primary':        '#a855f7',
    '--color-primary-light':  '#7c3aed',
    '--color-primary-bg':     'rgba(168,85,247,0.1)',
    '--color-primary-bg-sm':  'rgba(168,85,247,0.05)',
    '--color-primary-bg-md':  'rgba(168,85,247,0.15)',
    '--color-primary-border': 'rgba(168,85,247,0.3)',
    '--color-primary-border-sm': 'rgba(168,85,247,0.2)',
    '--color-primary-border-lg': 'rgba(168,85,247,0.4)',
  },
}

export function aplicarTema(id_gym) {
  const tema = temas[id_gym] ?? temas[1]
  const root = document.documentElement
  Object.entries(tema).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}