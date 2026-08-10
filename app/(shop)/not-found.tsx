import Link from 'next/link'
import { IconFileQuestion, IconArrowRight, IconHome } from '@/components/shared/PremiumIcons'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-[#FAF7F4] text-center">
      <div className="bg-[#F5F1EC] p-6 rounded-full mb-8 flex items-center justify-center">
        <IconFileQuestion size={64} className="text-[#B8763C]" color="currentColor" />
      </div>
      <h1 className="text-balance text-4xl font-bold text-[#1A1A1A] mb-4 font-serif">Page not found</h1>
      <p className="text-[#555555] mb-8 max-w-md text-lg">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="outline" className="active:scale-[0.97] w-full sm:w-auto border-[#E5E5E5] text-[#1A1A1A] bg-white hover:bg-[#F5F1EC] rounded-full px-6 h-11 cursor-pointer flex items-center justify-center">
            <IconHome size={16} color="currentColor" className="mr-2" />
            Go Home
          </Button>
        </Link>
        <Link href="/shop">
          <Button className="active:scale-[0.97] w-full sm:w-auto bg-[#B8763C] text-white hover:bg-[#B06024] font-medium rounded-full px-6 h-11 cursor-pointer flex items-center justify-center">
            Browse Shop
            <IconArrowRight size={16} color="currentColor" className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
