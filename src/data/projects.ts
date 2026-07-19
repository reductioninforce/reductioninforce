export type Project = {
  id: string
  title: string
  subtitle: string
  url: string
  tone: string
  accent: string
  ink: string
}

const BLUE = '#0020D9'
const ORANGE = '#FB6604'
const PINK = '#F90CC6'

export const projects: Project[] = [
  {
    id: 'atelier',
    title: 'Atelier',
    subtitle: 'Product design system',
    url: 'https://example.com/atelier',
    tone: BLUE,
    accent: ORANGE,
    ink: BLUE,
  },
  {
    id: 'ledger',
    title: 'Ledger',
    subtitle: 'Fintech platform',
    url: 'https://example.com/ledger',
    tone: ORANGE,
    accent: PINK,
    ink: ORANGE,
  },
  {
    id: 'grove',
    title: 'Grove',
    subtitle: 'Brand & culture',
    url: 'https://example.com/grove',
    tone: PINK,
    accent: BLUE,
    ink: PINK,
  },
  {
    id: 'signal',
    title: 'Signal',
    subtitle: 'Motion identity',
    url: 'https://example.com/signal',
    tone: BLUE,
    accent: PINK,
    ink: ORANGE,
  },
]
