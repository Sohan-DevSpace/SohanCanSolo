'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Loader2, Trash2, Edit2, Palette, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { createDesign, updateDesign, deleteDesign, toggleDesignStatus } from './actions'

type CategoryRef = { id: string; name: string }

type Design = {
  id: string
  name: string
  slug: string
  image_url: string
  thumbnail_url: string | null
  category_id: string | null
  tags: string[]
  is_active: boolean
  category?: { name: string } | null
}

export default function DesignsClient({ 
  initialDesigns, 
  categories 
}: { 
  initialDesigns: Design[], 
  categories: CategoryRef[] 
}) {
  const [designs, setDesigns] = useState<Design[]>(initialDesigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingDesign, setEditingDesign] = useState<Design | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({ category_id: '', name: '', image_url: '', tags: '' })
  const [togglingId, setTogglingId] = useState<string | null>(null)
  
  const filteredDesigns = designs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.category?.name && d.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    d.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenCreate = () => {
    setEditingDesign(null)
    setFormData({ category_id: '', name: '', image_url: '', tags: '' })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (d: Design) => {
    setEditingDesign(d)
    setFormData({
      category_id: d.category_id || '',
      name: d.name,
      image_url: d.image_url,
      tags: d.tags?.join(', ') || ''
    })
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.image_url.trim()) {
      toast.error('Name and Image URL are required')
      return
    }

    startTransition(async () => {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || ''

      const payload = {
        name: formData.name,
        image_url: formData.image_url,
        category_id: formData.category_id || undefined,
        tags: tagsArray
      }

      if (editingDesign) {
        const res = await updateDesign(editingDesign.id, payload)
        if (res.success) {
          setDesigns(designs.map(d => 
            d.id === editingDesign.id 
              ? { ...d, ...payload, thumbnail_url: payload.image_url, category: { name: categoryName }, category_id: payload.category_id || null } 
              : d
          ))
          toast.success('Design updated')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to update')
        }
      } else {
        const res = await createDesign(payload)
        if (res.success && res.design) {
          setDesigns([{...res.design, category: { name: categoryName }}, ...designs])
          toast.success('Design created')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to create')
        }
      }
    })
  }

  const handleDelete = async () => {
    if (!editingDesign) return
    startTransition(async () => {
      const res = await deleteDesign(editingDesign.id)
      if (res.success) {
        setDesigns(designs.filter(d => d.id !== editingDesign.id))
        toast.success('Design deleted')
        setIsDeleteOpen(false)
        setEditingDesign(null)
      } else {
        toast.error(res.error || 'Failed to delete')
      }
    })
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    startTransition(async () => {
      const res = await toggleDesignStatus(id, currentStatus)
      if (res.success) {
        setDesigns(designs.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d))
        toast.success(!currentStatus ? 'Design is now active' : 'Design hidden')
      } else {
        toast.error('Failed to toggle status')
      }
      setTogglingId(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Designs</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage printable artwork and graphic overlays.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20 hover:bg-[#B8763C]/20 hover:ring-[#B8763C]/30 text-xs font-bold active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Design
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search designs..." 
            className="pl-11 bg-[#09090b]/50 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredDesigns.map((design) => (
            <div key={design.id} className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] rounded-2xl overflow-hidden hover:border-white/[0.08] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group flex flex-col">
              <div className="aspect-square bg-[#09090b]/50 relative flex items-center justify-center p-6 border-b border-white/[0.02]">
                <img
                  src={design.thumbnail_url || design.image_url}
                  alt={design.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                />
                {!design.is_active && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                    <span className="px-3 py-1.5 bg-zinc-900/90 border border-white/[0.08] rounded-md text-[10px] font-bold text-zinc-400 uppercase tracking-widest shadow-sm">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white text-sm line-clamp-1 transition-colors" title={design.name}>{design.name}</h3>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8763C] mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {design.category?.name || 'Uncategorized'}
                  </div>
                </div>
                
                {design.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                    {design.tags.slice(0, 2).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white/[0.02] border border-white/[0.04] text-zinc-400 rounded-md text-[9px] font-medium tracking-wide">
                        {tag}
                      </span>
                    ))}
                    {design.tags.length > 2 && (
                      <span className="px-2 py-1 text-zinc-500 bg-transparent border border-dashed border-white/[0.04] rounded-md text-[9px] font-medium">+{design.tags.length - 2}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-auto">
                  <button 
                    onClick={() => handleToggleStatus(design.id, design.is_active)} 
                    disabled={togglingId === design.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]"
                    title={design.is_active ? "Hide Design" : "Show Design"}
                  >
                    {togglingId === design.id ? <Loader2 className="w-4 h-4 animate-spin" /> : design.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleOpenEdit(design)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingDesign(design); setIsDeleteOpen(true) }} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-[0.95]" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-20 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
            <Palette className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-white tracking-tight">No designs found</h3>
            <p className="text-zinc-500 text-sm mt-1">Add your first design to start customizing products.</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-semibold mt-2 active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-md shadow-[#B8763C]/20">
            <Plus className="w-4 h-4 mr-1.5" /> Add Design
          </Button>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-[425px] !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              {editingDesign ? 'Edit Design' : 'Create Design'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs pl-13 mt-1">
              Upload a transparent PNG graphic for print on demand.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Design Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Vintage Tiger"
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Image URL</label>
              <Input 
                value={formData.image_url} 
                onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                placeholder="https://..."
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Category (Optional)</label>
              <Select value={formData.category_id} onValueChange={(val) => setFormData(p => ({ ...p, category_id: val || '' }))}>
                <SelectTrigger className="h-11 bg-white/[0.02] border-white/[0.04] focus:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-white/[0.08] shadow-2xl text-white rounded-xl">
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tags (comma separated)</label>
              <Input 
                value={formData.tags} 
                onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                placeholder="vintage, tiger, illustration"
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97] transition-all">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white border-none rounded-xl font-semibold shadow-md shadow-[#B8763C]/20 transition-all">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDesign ? 'Save Changes' : 'Create Design'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-[420px] !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2.5 font-display text-lg tracking-tight">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              Delete Design
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-3 leading-relaxed pl-10">
              Are you sure you want to delete <strong className="text-zinc-200">{editingDesign?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97] transition-all">Cancel</Button>
            <Button onClick={handleDelete} disabled={isPending} className="bg-rose-500 hover:bg-rose-600 active:scale-[0.97] text-white border-none rounded-xl font-semibold shadow-md shadow-rose-500/20 transition-all">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
