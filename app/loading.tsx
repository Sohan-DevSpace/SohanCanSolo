import PageLoader from '@/components/ui/PageLoader'

export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF7F4]">
      <PageLoader />
    </div>
  )
}
