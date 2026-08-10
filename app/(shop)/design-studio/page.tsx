import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const DesignStudio = dynamic(
  () => import('@/components/create/DesignStudio').then((mod) => mod.DesignStudio),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F4]">
        <div className="w-8 h-8 border-2 border-[#B8763C] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Design Studio | Alpona',
  description:
    'Design custom premium print-on-demand products. Customize layouts, generate designs with AI, or work directly with our professional team.',
  openGraph: {
    title: 'Design Studio | Alpona',
    description:
      'Design custom premium print-on-demand products. Customize layouts, generate designs with AI, or work directly with our professional team.',
  },
}

export default function DesignStudioPage() {
  return (
    <ErrorBoundary sectionName="Design Studio">
      <DesignStudio />
    </ErrorBoundary>
  )
}
