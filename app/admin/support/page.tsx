import { createClient } from '@/lib/supabase/server'
import { SupportClient } from './SupportClient'

export const metadata = {
  title: 'Support Tickets | Admin | Alpona',
  description: 'Manage customer concierge inquiries and support tickets.',
}

export default async function AdminSupportPage() {
  const supabase = await createClient()

  // Fetch all support tickets ordered by created_at desc
  const { data: tickets, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support tickets:', error)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SupportClient initialTickets={tickets || []} />
    </div>
  )
}
