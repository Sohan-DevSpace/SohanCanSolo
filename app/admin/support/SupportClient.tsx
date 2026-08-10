'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  MessageSquare, Search, Filter, Clock, CheckCircle2, AlertCircle, 
  Sparkles, Mail, Phone, ShoppingCart, Paperclip, ChevronDown, User
} from 'lucide-react'

interface SupportTicket {
  id: string
  name: string
  email: string
  phone: string | null
  order_number: string | null
  topic: string
  priority: string
  message: string
  file_url: string | null
  status: string
  created_at: string
}

export function SupportClient({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = tickets.length
    const pending = tickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length
    const urgent = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'VIP').length
    const resolved = tickets.filter(t => t.status === 'Resolved').length
    return { total, pending, urgent, resolved }
  }, [tickets])

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.order_number && t.order_number.toLowerCase().includes(q)) ||
        t.topic.toLowerCase().includes(q)
      )
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tickets, searchQuery, statusFilter])

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId)
    try {
      const res = await fetch(`/api/admin/support/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: newStatus })
      })
      const json = await res.json()
      setUpdatingId(null)

      if (json.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
        toast.success(`Ticket #${ticketId.slice(0, 6)} updated to "${newStatus}"`)
      } else {
        toast.error(json.error || 'Failed to update status.')
      }
    } catch (err) {
      setUpdatingId(null)
      toast.error('Network error.')
    }
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#B8763C]" /> Support Tickets & Messages
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage incoming Help Center customer inquiries, order issues, and VIP concierge tickets.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Tickets</span>
            <MessageSquare size={16} className="text-[#B8763C]" />
          </div>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Pending Action</span>
            <Clock size={16} />
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Urgent / VIP</span>
            <Sparkles size={16} />
          </div>
          <p className="text-2xl font-black text-rose-400">{stats.urgent}</p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Resolved</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.resolved}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, email, or order #..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B8763C]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Pending', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'bg-[#B8763C] text-white shadow-xs' 
                  : 'bg-zinc-900 border border-zinc-700/60 text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm">
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Topic & Priority</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Message Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 align-top">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white text-sm">{ticket.name}</p>
                        <p className="text-zinc-400 flex items-center gap-1">
                          <Mail size={11} /> {ticket.email}
                        </p>
                        {ticket.phone && (
                          <p className="text-zinc-400 flex items-center gap-1 text-[11px]">
                            <Phone size={11} /> {ticket.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4 align-top space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 font-bold text-[11px]">
                        {ticket.topic}
                      </span>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          ticket.priority === 'VIP' ? 'bg-[#B8763C]/20 text-[#B8763C] border border-[#B8763C]/40' :
                          ticket.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      {ticket.order_number ? (
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <ShoppingCart size={12} /> #{ticket.order_number}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="p-4 align-top max-w-xs">
                      <p className="text-zinc-300 font-medium leading-relaxed line-clamp-3">
                        {ticket.message}
                      </p>
                      {ticket.file_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
                          <Paperclip size={11} /> File: {ticket.file_url}
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top text-zinc-400 whitespace-nowrap text-[11px]">
                      {new Date(ticket.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="p-4 align-top">
                      <select
                        value={ticket.status}
                        disabled={updatingId === ticket.id}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#B8763C] cursor-pointer ${
                          ticket.status === 'Pending' ? 'text-amber-400 border-amber-500/40' :
                          ticket.status === 'Resolved' ? 'text-emerald-400 border-emerald-500/40' :
                          'text-zinc-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <MessageSquare size={32} className="text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-400">No support tickets match query.</p>
          </div>
        )}
      </div>

    </div>
  )
}

