import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import { useCursorList } from '../hooks/useCursorList'
import { listIngredients, createIngredient } from '../api/ingredients'
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
  const { items: ingredients, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCursorList({ queryKey: ['ingredients'], queryFn: listIngredients, itemsKey: 'ingredients' })

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await createIngredient({
        ...form,
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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create ingredient'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Ingredients"
        description="Raw ingredients used in recipes, with nutrition per 100g."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New ingredient
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-200 text-ink-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Calories</th>
              <th className="px-5 py-3 font-medium">Protein</th>
              <th className="px-5 py-3 font-medium">Carbs</th>
              <th className="px-5 py-3 font-medium">Fat</th>
              <th className="px-5 py-3 font-medium">Fiber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {ingredients.map((ing) => (
              <tr key={ing.id} className="hover:bg-cream-50">
                <td className="px-5 py-3 font-medium text-ink-900">{ing.name}</td>
                <td className="px-5 py-3 text-ink-700">{ing.unit}</td>
                <td className="px-5 py-3 text-ink-700">{ing.calories_per_100g}</td>
                <td className="px-5 py-3 text-ink-700">{ing.protein_per_100g}g</td>
                <td className="px-5 py-3 text-ink-700">{ing.carbs_per_100g}g</td>
                <td className="px-5 py-3 text-ink-700">{ing.fat_per_100g}g</td>
                <td className="px-5 py-3 text-ink-700">{ing.fiber_per_100g}g</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? <p className="p-6 text-center text-ink-300">Loading…</p> : null}
        {isError ? <p className="p-6 text-center text-chili-500">Couldn't load ingredients.</p> : null}
        {!isLoading && ingredients.length === 0 ? (
          <p className="p-6 text-center text-ink-300">No ingredients yet.</p>
        ) : null}
      </Card>

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New ingredient">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" value={form.name} onChange={update('name')} required />

          <Field as="select" label="Unit" value={form.unit} onChange={update('unit')}>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="piece">piece</option>
          </Field>

          <p className="text-xs font-medium text-ink-500">Nutrition per 100g</p>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Calories"
              type="number"
              step="0.01"
              value={form.calories_per_100g}
              onChange={update('calories_per_100g')}
            />
            <Field
              label="Protein (g)"
              type="number"
              step="0.01"
              value={form.protein_per_100g}
              onChange={update('protein_per_100g')}
            />
            <Field
              label="Carbs (g)"
              type="number"
              step="0.01"
              value={form.carbs_per_100g}
              onChange={update('carbs_per_100g')}
            />
            <Field
              label="Fat (g)"
              type="number"
              step="0.01"
              value={form.fat_per_100g}
              onChange={update('fat_per_100g')}
            />
            <Field
              label="Fiber (g)"
              type="number"
              step="0.01"
              value={form.fiber_per_100g}
              onChange={update('fiber_per_100g')}
            />
          </div>

          {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Create ingredient
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  )
}
