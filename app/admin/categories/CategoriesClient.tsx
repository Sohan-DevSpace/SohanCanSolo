'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Loader2, Trash2, Edit2, CheckCircle2, XCircle, Grid2X2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'

import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from './actions'
import { getCategoryColor } from '@/lib/utils'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image_url: '', is_active: true })
  
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', image_url: '', is_active: true })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c)
    setFormData({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image_url: c.image_url || '',
      is_active: c.is_active
    })
    setIsFormOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingCategory ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, formData)
        if (res.success) {
          setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData, description: formData.description || null, image_url: formData.image_url || null } : c))
          toast.success('Category updated')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to update')
        }
      } else {
        const res = await createCategory(formData)
        if (res.success && res.category) {
          setCategories([res.category, ...categories])
          toast.success('Category created')
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Failed to create')
        }
      }
    })
  }

  const handleDelete = async () => {
    if (!editingCategory) return
    startTransition(async () => {
      const res = await deleteCategory(editingCategory.id)
      if (res.success) {
        setCategories(categories.filter(c => c.id !== editingCategory.id))
        toast.success('Category deleted')
        setIsDeleteOpen(false)
        setEditingCategory(null)
      } else {
        toast.error(res.error || 'Failed to delete. Make sure no products are using it.')
      }
    })
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCategoryStatus(id, currentStatus)
      if (res.success) {
        setCategories(categories.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
        toast.success(currentStatus ? 'Category hidden' : 'Category activated')
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
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Categories</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your product categories and collections.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20 hover:bg-[#B8763C]/20 hover:ring-[#B8763C]/30 text-xs font-bold active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..." 
            className="pl-11 bg-[#09090b]/50 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
              <Grid2X2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No categories found</h3>
              <p className="text-zinc-500 text-sm mt-1">{searchQuery ? 'Try adjusting your search query.' : 'Create your first category.'}</p>
            </div>
          </div>
        ) : (
          filteredCategories.map(category => {
            const color = getCategoryColor(category.id)
            return (
            <div 
              key={category.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] rounded-2xl hover:border-white/[0.08] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">{category.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/[0.04]">/{category.slug}</span>
                  {category.is_active ? (
                    <span className="text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 px-2.5 py-1 rounded-md flex items-center text-[9px] font-bold uppercase tracking-widest transition-all">
                      <CheckCircle2 className="w-3 h-3 mr-1.5 opacity-70" /> Active
                    </span>
                  ) : (
                    <span className="text-zinc-400 bg-zinc-500/10 ring-1 ring-inset ring-zinc-500/20 px-2.5 py-1 rounded-md flex items-center text-[9px] font-bold uppercase tracking-widest transition-all">
                      <XCircle className="w-3 h-3 mr-1.5 opacity-70" /> Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-2 font-medium">
                  {category.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 mt-4 sm:mt-0 bg-white/[0.02] p-1.5 rounded-xl border border-white/[0.04]">
                <div className="px-2">
                  <Switch 
                    checked={category.is_active} 
                    onCheckedChange={() => handleToggleActive(category.id, category.is_active)}
                    disabled={isPending}
                    className="data-[state=checked]:bg-[#B8763C]"
                  />
                </div>
                <div className="w-px h-6 bg-white/[0.06] mx-1"></div>
                <Button onClick={() => handleOpenEdit(category)} variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/[0.04] active:scale-[0.95] text-zinc-400 hover:text-white transition-all" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button onClick={() => { setEditingCategory(category); setIsDeleteOpen(true) }} variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 active:scale-[0.95] text-zinc-500 hover:text-rose-400 transition-all" title="Delete">
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
                <Grid2X2 className="w-4 h-4" />
              </div>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs pl-13 mt-1">
              Fill in the details for this category. Slugs must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Category Name</label>
              <Input 
                value={formData.name} 
                onChange={handleNameChange}
                placeholder="e.g. Graphic Tees"
                className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">URL Slug</label>
              <Input 
                value={formData.slug} 
                onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                placeholder="graphic-tees"
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
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">Active Status</div>
                <div className="text-[10px] text-zinc-500 font-medium">Visible to customers in the shop</div>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={c => setFormData(p => ({ ...p, is_active: c }))} className="data-[state=checked]:bg-[#B8763C]" />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97] transition-all">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white border-none rounded-xl font-semibold shadow-md shadow-[#B8763C]/20 transition-all">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? 'Save Changes' : 'Create Category'}
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
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-3 leading-relaxed pl-10">
              Are you sure you want to delete <strong className="text-zinc-200">{editingCategory?.name}</strong>? This action cannot be undone.
              <br/><br/>
              <span className="text-[11px] text-amber-500/80 bg-amber-500/10 px-2.5 py-1.5 rounded-md border border-amber-500/20 flex items-center font-medium">
                Note: Ensure no products are actively using this category before deleting.
              </span>
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
