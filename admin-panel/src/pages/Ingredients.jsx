import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Wheat, Edit, Trash2, AlertCircle } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useCursorList } from '../hooks/useCursorList'
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../api/ingredients'
import { getApiErrorMessage } from '../api/client'

const emptyForm = {
  name: '',
  unit: 'g',
  calories_per_100g: '',
  protein_per_100g: '',
  carbs_per_100g: '',
  fat_per_100g: '',
  fiber_per_100g: '',
}

export default function Ingredients() {
  const {
    items: ingredients,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCursorList({ queryKey: ['ingredients'], queryFn: listIngredients, itemsKey: 'ingredients' })

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleOpenCreate = () => {
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (ing) => {
    setEditTarget(ing)
    setForm({
      name: ing.name || '',
      unit: ing.unit || 'g',
      calories_per_100g: ing.calories_per_100g ?? '',
      protein_per_100g: ing.protein_per_100g ?? '',
      carbs_per_100g: ing.carbs_per_100g ?? '',
      fat_per_100g: ing.fat_per_100g ?? '',
      fiber_per_100g: ing.fiber_per_100g ?? '',
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Please provide an ingredient name.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editTarget) {
        const data = await updateIngredient({
          id: editTarget.id,
          name: form.name.trim(),
          unit: form.unit,
          calories_per_100g: Number(form.calories_per_100g) || 0,
          protein_per_100g: Number(form.protein_per_100g) || 0,
          carbs_per_100g: Number(form.carbs_per_100g) || 0,
          fat_per_100g: Number(form.fat_per_100g) || 0,
          fiber_per_100g: Number(form.fiber_per_100g) || 0,
        })
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ['ingredients'] })
          setEditTarget(null)
        } else {
          setError(data.message || 'Could not update ingredient')
        }
      } else {
        const data = await createIngredient({
          name: form.name.trim(),
          unit: form.unit,
          calories_per_100g: Number(form.calories_per_100g) || 0,
          protein_per_100g: Number(form.protein_per_100g) || 0,
          carbs_per_100g: Number(form.carbs_per_100g) || 0,
          fat_per_100g: Number(form.fat_per_100g) || 0,
          fiber_per_100g: Number(form.fiber_per_100g) || 0,
        })
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ['ingredients'] })
          setModalOpen(false)
          setForm(emptyForm)
        } else {
          setError(data.message || 'Could not create ingredient')
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save ingredient'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    return ingredients.filter((ing) => {
      const q = search.toLowerCase().trim()
      return !q || ing.name?.toLowerCase().includes(q)
    })
  }, [ingredients, search])

  return (
    <DashboardShell>
      <PageHeader
        title="Raw Ingredients Library"
        description="Master directory of pantry ingredients, grains, cold-pressed oils, and spices with nutritional macros per 100g."
        action={
          <Button onClick={handleOpenCreate} className="text-xs sm:text-sm">
            <Plus className="h-4 w-4" />
            <span>New Ingredient</span>
          </Button>
        }
      />

      {/* Search Header */}
      <div className="mb-6 flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search raw ingredients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm outline-none focus:border-chili-500 focus:bg-white transition-colors"
          />
        </div>
        <span className="text-xs font-semibold text-ink-600 shrink-0">
          {filtered.length} Ingredients
        </span>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-xs text-ink-400">Loading ingredient library…</Card>
      ) : isError ? (
        <Card className="p-8 text-center text-chili-600 text-xs">Couldn't load ingredients.</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title={search ? 'No matching ingredients' : 'No ingredients added yet'}
          description={
            search
              ? 'Try modifying your search query.'
              : 'Add ingredients to track nutritional macros across recipes and meal plans.'
          }
          actionLabel="Add First Ingredient"
          onAction={handleOpenCreate}
        />
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-cream-200 bg-cream-50/70 text-xs font-bold uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-5 py-3.5">Ingredient Name</th>
                    <th className="px-4 py-3.5">Unit</th>
                    <th className="px-4 py-3.5 text-right">Calories</th>
                    <th className="px-4 py-3.5 text-right">Protein</th>
                    <th className="px-4 py-3.5 text-right">Carbs</th>
                    <th className="px-4 py-3.5 text-right">Fat</th>
                    <th className="px-4 py-3.5 text-right">Fiber</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {filtered.map((ing) => (
                    <tr key={ing.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-ink-950">{ing.name}</td>
                      <td className="px-4 py-3.5 text-ink-600">{ing.unit}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink-900">
                        {ing.calories_per_100g} <span className="text-[10px] text-ink-400">kcal</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink-900">
                        {ing.protein_per_100g}g
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink-900">
                        {ing.carbs_per_100g}g
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink-900">
                        {ing.fat_per_100g}g
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink-900">
                        {ing.fiber_per_100g}g
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ing)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                            title="Edit ingredient"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ing)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-chili-50 hover:text-chili-600"
                            title="Delete ingredient"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden space-y-3">
            {filtered.map((ing) => (
              <Card key={ing.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-cream-100 pb-2">
                  <div>
                    <h4 className="font-bold text-ink-950 text-sm">{ing.name}</h4>
                    <p className="text-[11px] text-ink-500">Standard Unit: {ing.unit}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ing)}
                      className="p-1.5 rounded-lg text-ink-500 hover:bg-cream-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ing)}
                      className="p-1.5 rounded-lg text-chili-500 hover:bg-chili-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center text-xs">
                  <div className="rounded-lg bg-cream-50 p-1.5 border border-cream-200">
                    <span className="block text-[10px] text-ink-400">kcal</span>
                    <span className="font-bold text-ink-900">{ing.calories_per_100g}</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-1.5 border border-cream-200">
                    <span className="block text-[10px] text-ink-400">Protein</span>
                    <span className="font-bold text-ink-900">{ing.protein_per_100g}g</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-1.5 border border-cream-200">
                    <span className="block text-[10px] text-ink-400">Carbs</span>
                    <span className="font-bold text-ink-900">{ing.carbs_per_100g}g</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-1.5 border border-cream-200">
                    <span className="block text-[10px] text-ink-400">Fat</span>
                    <span className="font-bold text-ink-900">{ing.fat_per_100g}g</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-1.5 border border-cream-200">
                    <span className="block text-[10px] text-ink-400">Fiber</span>
                    <span className="font-bold text-ink-900">{ing.fiber_per_100g}g</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            size="sm"
          >
            Load More Ingredients
          </Button>
        </div>
      ) : null}

      {/* CREATE & EDIT INGREDIENT MODAL */}
      <Modal
        open={modalOpen || Boolean(editTarget)}
        onClose={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        title={editTarget ? `Edit ${editTarget.name}` : 'Add Raw Ingredient'}
        subtitle="Manage ingredient nutritional specifications per 100g portion."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Ingredient Name"
              placeholder="e.g. Ground White Pepper"
              value={form.name}
              onChange={update('name')}
              required
            />
            <Field as="select" label="Standard Unit" value={form.unit} onChange={update('unit')}>
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (l)</option>
              <option value="piece">Piece (pcs)</option>
            </Field>
          </div>

          <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-800">
              Nutritional Values (Per 100g Portion)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Field
                label="Calories (kcal)"
                type="number"
                step="any"
                value={form.calories_per_100g}
                onChange={update('calories_per_100g')}
              />
              <Field
                label="Protein (g)"
                type="number"
                step="any"
                value={form.protein_per_100g}
                onChange={update('protein_per_100g')}
              />
              <Field
                label="Carbs (g)"
                type="number"
                step="any"
                value={form.carbs_per_100g}
                onChange={update('carbs_per_100g')}
              />
              <Field
                label="Fat (g)"
                type="number"
                step="any"
                value={form.fat_per_100g}
                onChange={update('fat_per_100g')}
              />
              <Field
                label="Fiber (g)"
                type="number"
                step="any"
                value={form.fiber_per_100g}
                onChange={update('fiber_per_100g')}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditTarget(null)
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {editTarget ? 'Save Changes' : 'Create Ingredient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Raw Ingredient?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Yes, Delete"
        onConfirm={async () => {
          await deleteIngredient(deleteTarget.id)
          queryClient.invalidateQueries({ queryKey: ['ingredients'] })
          setDeleteTarget(null)
        }}
      />
    </DashboardShell>
  )
}
