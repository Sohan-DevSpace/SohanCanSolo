'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Loader2, Trash2, Edit2, CheckCircle2, XCircle, ListTree } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import { createSubcategory, updateSubcategory, deleteSubcategory, toggleSubcategoryStatus } from './actions'
import { getCategoryColor } from '@/lib/utils'

type CategoryRef = { id: string; name: string }

type Subcategory = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  status: string
  created_at: string
  categories?: { name: string } | null
}

export default function SubcategoriesClient({ 
  initialSubcategories, 
  categories 
}: { 
  initialSubcategories: Subcategory[], 
  categories: CategoryRef[] 
}) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({ category_id: '', name: '', slug: '', description: '', image_url: '', status: 'visible' })
  
  const filteredSubs = subcategories.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.categories?.name && s.categories.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenCreate = () => {
    setEditingSub(null)
    setFormData({ category_id: categories[0]?.id || '', name: '', slug: '', description: '', image_url: '', status: 'visible' })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (s: Subcategory) => {
    setEditingSub(s)
    setFormData({
      category_id: s.category_id,
      name: s.name,
      slug: s.slug,
      description: s.description || '',
      image_url: s.image_url || '',
      status: s.status
    })
    setIsFormOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingSub ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.category_id) {
      toast.error('Name, slug, and parent category are required')
      return
    }

    startTransition(async () => {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || ''

      if (editingSub) {
        const res = await updateSubcategory(editingSub.id, formData)
        if (res.success) {
          setSubcategories(subcategories.map(s => 
            s.id === editingSub.id 
              ? { ...s, ...formData, description: formData.description || null, image_url: formData.image_url || null, categories: { name: categoryName } } 
              : s
          ))
          toast.success('Subcategory updated')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to update')
        }
      } else {
        const res = await createSubcategory(formData)
        if (res.success && res.subcategory) {
          setSubcategories([{...res.subcategory, categories: { name: categoryName }}, ...subcategories])
          toast.success('Subcategory created')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to create')
        }
      }
    })
  }

  const handleDelete = async () => {
    if (!editingSub) return
    startTransition(async () => {
      const res = await deleteSubcategory(editingSub.id)
      if (res.success) {
        setSubcategories(subcategories.filter(s => s.id !== editingSub.id))
        toast.success('Subcategory deleted')
        setIsDeleteOpen(false)
        setEditingSub(null)
      } else {
        toast.error(res.error || 'Failed to delete.')
      }
    })
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    startTransition(async () => {
      const res = await toggleSubcategoryStatus(id, currentStatus)
      if (res.success) {
        setSubcategories(subcategories.map(s => s.id === id ? { ...s, status: currentStatus === 'visible' ? 'hidden' : 'visible' } : s))
        toast.success(currentStatus === 'visible' ? 'Subcategory hidden' : 'Subcategory visible')
      } else {
        toast.error('Failed to toggle status')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Subcategories</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage sub-collections inside your main categories.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20 hover:bg-[#B8763C]/20 hover:ring-[#B8763C]/30 text-xs font-bold active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Subcategory
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subcategories..." 
            className="pl-11 bg-[#09090b]/50 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredSubs.length === 0 ? (
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
              <ListTree className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No subcategories found</h3>
              <p className="text-zinc-500 text-sm mt-1">{searchQuery ? 'Try adjusting your search query.' : 'Create your first subcategory.'}</p>
            </div>
          </div>
        ) : (
          filteredSubs.map(sub => {
            const color = getCategoryColor(sub.category_id)
            return (
            <div 
              key={sub.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] rounded-2xl hover:border-white/[0.08] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group"
            >
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">{sub.name}</h3>
                  <span 
                    className="text-[9px] font-bold font-mono px-2 py-1 rounded-md border uppercase tracking-widest shadow-sm"
                    style={{ color, backgroundColor: `${color}1A`, borderColor: `${color}33` }}
                  >
                    IN: {sub.categories?.name || 'Unknown'}
                  </span>
                  {sub.status === 'visible' ? (
                    <span className="text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 px-2.5 py-1 rounded-md flex items-center text-[9px] font-bold uppercase tracking-widest transition-all">
                      <CheckCircle2 className="w-3 h-3 mr-1.5 opacity-70" /> Visible
                    </span>
                  ) : (
                    <span className="text-zinc-400 bg-zinc-500/10 ring-1 ring-inset ring-zinc-500/20 px-2.5 py-1 rounded-md flex items-center text-[9px] font-bold uppercase tracking-widest transition-all">
                      <XCircle className="w-3 h-3 mr-1.5 opacity-70" /> Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-2 font-medium">
                  {sub.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 mt-4 sm:mt-0 bg-white/[0.02] p-1.5 rounded-xl border border-white/[0.04]">
                <div className="px-2">
                  <Switch 
                    checked={sub.status === 'visible'} 
                    onCheckedChange={() => handleToggleStatus(sub.id, sub.status)}
                    disabled={isPending}
                    className="data-[state=checked]:bg-[#B8763C]"
                  />
                </div>
                <div className="w-px h-6 bg-white/[0.06] mx-1"></div>
                <Button onClick={() => handleOpenEdit(sub)} variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/[0.04] active:scale-[0.95] text-zinc-400 hover:text-white transition-all" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button onClick={() => { setEditingSub(sub); setIsDeleteOpen(true) }} variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 active:scale-[0.95] text-zinc-500 hover:text-rose-400 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

            </div>
            )
          })
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-[425px] !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                <ListTree className="w-4 h-4" />
              </div>
              {editingSub ? 'Edit Subcategory' : 'Create Subcategory'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs pl-13 mt-1">
              Assign to a parent category and fill in the details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Parent Category</label>
              <select 
                value={formData.category_id}
                onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                className="w-full bg-white/[0.02] border border-white/[0.04] text-sm h-11 rounded-xl px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B8763C]/50 transition-all"
              >
                {categories.length === 0 && <option value="">No categories available</option>}
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Subcategory Name</label>
              <Input 
                value={formData.name} 
                onChange={handleNameChange}
                placeholder="e.g. Vintage Graphics"
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">URL Slug</label>
              <Input 
                value={formData.slug} 
                onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                placeholder="vintage-graphics"
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm font-mono rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Description (Optional)</label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description..."
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
            <div className="flex items-center justify-between mt-2 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">Visibility Status</div>
                <div className="text-[10px] text-zinc-500 font-medium">Visible to customers in the shop</div>
              </div>
              <Switch checked={formData.status === 'visible'} onCheckedChange={c => setFormData(p => ({ ...p, status: c ? 'visible' : 'hidden' }))} className="data-[state=checked]:bg-[#B8763C]" />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97] transition-all">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending || categories.length === 0} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white border-none rounded-xl font-semibold shadow-md shadow-[#B8763C]/20 transition-all">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSub ? 'Save Changes' : 'Create Subcategory'}
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
              Delete Subcategory
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-3 leading-relaxed pl-10">
              Are you sure you want to delete <strong className="text-zinc-200">{editingSub?.name}</strong>? This action cannot be undone.
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
