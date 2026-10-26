import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Calculator, ChefHat, Wheat, Edit, Eye } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import { useCursorList } from '../hooks/useCursorList'
import {
  listRecipes,
  createRecipe,
  calculateRecipe,
  getRecipeDetails,
  updateRecipe,
  deleteRecipe,
} from '../api/recipes'
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../api/ingredients'
import { listProducts } from '../api/products'
import { getApiErrorMessage } from '../api/client'

const TABS = [
  { id: 'recipes', label: 'Recipes', icon: ChefHat },
  { id: 'ingredients', label: 'Ingredients', icon: Wheat },
]

export default function Recipes() {
  const [activeTab, setActiveTab] = useState('recipes')
  const [createOpen, setCreateOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcTarget, setCalcTarget] = useState(null)

  // Recipe detail & edit/delete modals
  const [viewRecipeTarget, setViewRecipeTarget] = useState(null)
  const [editRecipeTarget, setEditRecipeTarget] = useState(null)
  const [deleteRecipeTarget, setDeleteRecipeTarget] = useState(null)

  // Ingredient edit/delete modals
  const [editIngredientTarget, setEditIngredientTarget] = useState(null)
  const [deleteIngredientTarget, setDeleteIngredientTarget] = useState(null)

  const queryClient = useQueryClient()

  const recipesQuery = useCursorList({
    queryKey: ['recipes'],
    queryFn: listRecipes,
    itemsKey: 'recipes',
  })

  const ingredientsQuery = useCursorList({
    queryKey: ['ingredients'],
    queryFn: listIngredients,
    itemsKey: 'ingredients',
  })

  const productsQuery = useCursorList({
    queryKey: ['products'],
    queryFn: listProducts,
    itemsKey: 'products',
  })

  return (
    <DashboardShell>
      <PageHeader
        title="Recipes & Ingredients"
        description="Build recipes from your ingredient library, then scale them for batch production."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {activeTab === 'recipes' ? 'New recipe' : 'New ingredient'}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-pill bg-white p-1 shadow-sm shadow-ink-900/5 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-chili-500 text-cream-50' : 'text-ink-700 hover:bg-cream-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'recipes' ? (
        <RecipesTab
          recipesQuery={recipesQuery}
          onScale={(recipe) => {
            setCalcTarget(recipe)
            setCalcOpen(true)
          }}
          onView={(recipe) => setViewRecipeTarget(recipe)}
          onEdit={(recipe) => setEditRecipeTarget(recipe)}
          onDelete={(recipe) => setDeleteRecipeTarget(recipe)}
        />
      ) : (
        <IngredientsTab
          ingredientsQuery={ingredientsQuery}
          onEdit={(ingredient) => setEditIngredientTarget(ingredient)}
          onDelete={(ingredient) => setDeleteIngredientTarget(ingredient)}
        />
      )}

      {/* Create Modals */}
      <CreateRecipeModal
        open={createOpen && activeTab === 'recipes'}
        onClose={() => setCreateOpen(false)}
        ingredientsQuery={ingredientsQuery}
        productsQuery={productsQuery}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['recipes'] })}
      />

      <CreateIngredientModal
        open={createOpen && activeTab === 'ingredients'}
        onClose={() => setCreateOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['ingredients'] })}
      />

      {/* Recipe Scaling Modal */}
      <CalculateRecipeModal
        open={calcOpen}
        recipe={calcTarget}
        onClose={() => {
          setCalcOpen(false)
          setCalcTarget(null)
        }}
      />

      {/* Recipe View Details Modal */}
      <ViewRecipeModal
        open={Boolean(viewRecipeTarget)}
        recipe={viewRecipeTarget}
        onClose={() => setViewRecipeTarget(null)}
      />

      {/* Edit Recipe Modal */}
      {editRecipeTarget ? (
        <EditRecipeModal
          open={Boolean(editRecipeTarget)}
          recipe={editRecipeTarget}
          ingredientsQuery={ingredientsQuery}
          onClose={() => setEditRecipeTarget(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] })
            setEditRecipeTarget(null)
          }}
        />
      ) : null}

      {/* Delete Recipe Modal */}
      {deleteRecipeTarget ? (
        <DeleteConfirmModal
          open={Boolean(deleteRecipeTarget)}
          title="Delete Recipe"
          message={`Are you sure you want to delete the recipe "${deleteRecipeTarget.name}"? This action cannot be undone.`}
          onClose={() => setDeleteRecipeTarget(null)}
          onConfirm={async () => {
            await deleteRecipe(deleteRecipeTarget.id)
            queryClient.invalidateQueries({ queryKey: ['recipes'] })
            setDeleteRecipeTarget(null)
          }}
        />
      ) : null}

      {/* Edit Ingredient Modal */}
      {editIngredientTarget ? (
        <EditIngredientModal
          open={Boolean(editIngredientTarget)}
          ingredient={editIngredientTarget}
          onClose={() => setEditIngredientTarget(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] })
            setEditIngredientTarget(null)
          }}
        />
      ) : null}

      {/* Delete Ingredient Modal */}
      {deleteIngredientTarget ? (
        <DeleteConfirmModal
          open={Boolean(deleteIngredientTarget)}
          title="Delete Ingredient"
          message={`Are you sure you want to delete "${deleteIngredientTarget.name}"? Recipes using this ingredient may be affected.`}
          onClose={() => setDeleteIngredientTarget(null)}
          onConfirm={async () => {
            await deleteIngredient(deleteIngredientTarget.id)
            queryClient.invalidateQueries({ queryKey: ['ingredients'] })
            setDeleteIngredientTarget(null)
          }}
        />
      ) : null}
    </DashboardShell>
  )
}

function RecipesTab({ recipesQuery, onScale, onView, onEdit, onDelete }) {
  const { items: recipes, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    recipesQuery

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chili-50 text-chili-500">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView(recipe)}
                    className="rounded p-1.5 text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                    title="View details & nutrition"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(recipe)}
                    className="rounded p-1.5 text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                    title="Edit recipe"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(recipe)}
                    className="rounded p-1.5 text-ink-300 hover:bg-chili-50 hover:text-chili-500"
                    title="Delete recipe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="mt-3 font-display text-base font-semibold text-ink-900">
                {recipe.name}
              </h3>
              <p className="text-sm text-ink-500">For {recipe.product_name}</p>
              <p className="mt-1 text-xs text-ink-300">
                Total weight: {recipe.total_weight_g}g · Created{' '}
                {new Date(recipe.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between">
              <button
                onClick={() => onScale(recipe)}
                className="inline-flex items-center gap-1.5 rounded-pill bg-cream-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-200"
              >
                <Calculator className="h-3.5 w-3.5" /> Scale for batch
              </button>
              <button
                onClick={() => onView(recipe)}
                className="text-xs font-medium text-chili-500 hover:text-chili-600"
              >
                Details →
              </button>
            </div>
          </Card>
        ))}
      </div>

      {isLoading ? <p className="py-10 text-center text-ink-300">Loading…</p> : null}
      {isError ? (
        <p className="py-10 text-center text-chili-500">Couldn't load recipes.</p>
      ) : null}
      {!isLoading && recipes.length === 0 ? (
        <Card className="p-10 text-center text-ink-300">
          No recipes yet — create one to start tracking nutrition and batch quantities.
        </Card>
      ) : null}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function IngredientsTab({ ingredientsQuery, onEdit, onDelete }) {
  const {
    items: ingredients,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = ingredientsQuery

  return (
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
            <th className="px-5 py-3 text-right font-medium">Actions</th>
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
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(ing)}
                    className="rounded p-1 text-ink-500 hover:bg-cream-200 hover:text-ink-900"
                    title="Edit ingredient"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(ing)}
                    className="rounded p-1 text-ink-300 hover:bg-chili-50 hover:text-chili-500"
                    title="Delete ingredient"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading ? <p className="p-6 text-center text-ink-300">Loading…</p> : null}
      {isError ? <p className="p-6 text-center text-chili-500">Couldn't load ingredients.</p> : null}
      {!isLoading && ingredients.length === 0 ? (
        <p className="p-6 text-center text-ink-300">No ingredients yet.</p>
      ) : null}

      {hasNextPage ? (
        <div className="p-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

function CreateIngredientModal({ open, onClose, onCreated }) {
  const emptyForm = {
    name: '',
    unit: 'g',
    calories_per_100g: '',
    protein_per_100g: '',
    carbs_per_100g: '',
    fat_per_100g: '',
    fiber_per_100g: '',
  }

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const resetAndClose = () => {
    setForm(emptyForm)
    setError(null)
    onClose()
  }

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
        onCreated()
        resetAndClose()
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
    <Modal open={open} onClose={resetAndClose} title="New ingredient">
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
          <Field label="Calories" type="number" step="0.01" value={form.calories_per_100g} onChange={update('calories_per_100g')} />
          <Field label="Protein (g)" type="number" step="0.01" value={form.protein_per_100g} onChange={update('protein_per_100g')} />
          <Field label="Carbs (g)" type="number" step="0.01" value={form.carbs_per_100g} onChange={update('carbs_per_100g')} />
          <Field label="Fat (g)" type="number" step="0.01" value={form.fat_per_100g} onChange={update('fat_per_100g')} />
          <Field label="Fiber (g)" type="number" step="0.01" value={form.fiber_per_100g} onChange={update('fiber_per_100g')} />
        </div>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create ingredient
        </Button>
      </form>
    </Modal>
  )
}

function EditIngredientModal({ open, ingredient, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: ingredient.name || '',
    unit: ingredient.unit || 'g',
    calories_per_100g: String(ingredient.calories_per_100g ?? ''),
    protein_per_100g: String(ingredient.protein_per_100g ?? ''),
    carbs_per_100g: String(ingredient.carbs_per_100g ?? ''),
    fat_per_100g: String(ingredient.fat_per_100g ?? ''),
    fiber_per_100g: String(ingredient.fiber_per_100g ?? ''),
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await updateIngredient({
        id: ingredient.id,
        name: form.name,
        unit: form.unit,
        calories_per_100g: Number(form.calories_per_100g) || 0,
        protein_per_100g: Number(form.protein_per_100g) || 0,
        carbs_per_100g: Number(form.carbs_per_100g) || 0,
        fat_per_100g: Number(form.fat_per_100g) || 0,
        fiber_per_100g: Number(form.fiber_per_100g) || 0,
      })
      if (data.success) {
        onUpdated()
        onClose()
      } else {
        setError(data.message || 'Could not update ingredient')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update ingredient'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${ingredient.name}`}>
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
          <Field label="Calories" type="number" step="0.01" value={form.calories_per_100g} onChange={update('calories_per_100g')} />
          <Field label="Protein (g)" type="number" step="0.01" value={form.protein_per_100g} onChange={update('protein_per_100g')} />
          <Field label="Carbs (g)" type="number" step="0.01" value={form.carbs_per_100g} onChange={update('carbs_per_100g')} />
          <Field label="Fat (g)" type="number" step="0.01" value={form.fat_per_100g} onChange={update('fat_per_100g')} />
          <Field label="Fiber (g)" type="number" step="0.01" value={form.fiber_per_100g} onChange={update('fiber_per_100g')} />
        </div>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function CreateRecipeModal({ open, onClose, onCreated, ingredientsQuery, productsQuery }) {
  const [productId, setProductId] = useState('')
  const [name, setName] = useState('')
  const [totalWeightG, setTotalWeightG] = useState('')
  const [rows, setRows] = useState([{ ingredient_id: '', quantity_g: '' }])
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addRow = () => setRows((r) => [...r, { ingredient_id: '', quantity_g: '' }])
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx, field, value) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)))

  const resetAndClose = () => {
    setProductId('')
    setName('')
    setTotalWeightG('')
    setRows([{ ingredient_id: '', quantity_g: '' }])
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validRows = rows.filter((r) => r.ingredient_id && r.quantity_g)
    if (validRows.length === 0) {
      setError('Add at least one ingredient with a quantity.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await createRecipe({
        product_id: Number(productId),
        name,
        total_weight_g: Number(totalWeightG),
        ingredients: validRows.map((r) => ({
          ingredient_id: Number(r.ingredient_id),
          quantity_g: Number(r.quantity_g),
        })),
      })
      if (data.success) {
        onCreated()
        resetAndClose()
      } else {
        setError(data.message || 'Could not create recipe')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create recipe'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="New recipe" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          as="select"
          label="Product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          hint="Which product this recipe belongs to."
          required
        >
          <option value="">Select a product…</option>
          {productsQuery.items.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.category ? ` — ${p.category}` : ''}
            </option>
          ))}
        </Field>
        <Field label="Recipe name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field
          label="Total weight (g)"
          type="number"
          step="0.01"
          value={totalWeightG}
          onChange={(e) => setTotalWeightG(e.target.value)}
          hint="Total weight this recipe produces — used to scale nutrition per product unit."
          required
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Ingredients</p>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={row.ingredient_id}
                  onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}
                  className="flex-1 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-chili-400"
                >
                  <option value="">Select ingredient…</option>
                  {ingredientsQuery.items.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="grams"
                  value={row.quantity_g}
                  onChange={(e) => updateRow(idx, 'quantity_g', e.target.value)}
                  className="w-28 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-chili-400"
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="rounded-full p-2 text-ink-300 hover:bg-cream-100 hover:text-chili-500"
                  aria-label="Remove ingredient"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} className="mt-2 text-sm font-medium text-chili-500">
            + Add ingredient
          </button>
        </div>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create recipe
        </Button>
      </form>
    </Modal>
  )
}

function EditRecipeModal({ open, recipe, ingredientsQuery, onClose, onUpdated }) {
  const [name, setName] = useState(recipe.name || '')
  const [totalWeightG, setTotalWeightG] = useState(String(recipe.total_weight_g || ''))
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)

  // Fetch recipe ingredients for editing
  useQuery({
    queryKey: ['recipe-details-for-edit', recipe.id],
    queryFn: async () => {
      setIsLoadingDetails(true)
      try {
        const data = await getRecipeDetails(recipe.id)
        if (data?.ingredients?.length > 0) {
          setRows(
            data.ingredients.map((ing) => ({
              ingredient_id: String(ing.ingredient_id),
              quantity_g: String(ing.quantity_g),
            }))
          )
        } else {
          setRows([{ ingredient_id: '', quantity_g: '' }])
        }
      } catch {
        setRows([{ ingredient_id: '', quantity_g: '' }])
      } finally {
        setIsLoadingDetails(false)
      }
      return null
    },
    enabled: Boolean(recipe.id),
  })

  const addRow = () => setRows((r) => [...r, { ingredient_id: '', quantity_g: '' }])
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx, field, value) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validRows = rows.filter((r) => r.ingredient_id && r.quantity_g)
    if (validRows.length === 0) {
      setError('Add at least one ingredient with a quantity.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await updateRecipe({
        recipe_id: recipe.id,
        name,
        total_weight_g: Number(totalWeightG),
        ingredients: validRows.map((r) => ({
          ingredient_id: Number(r.ingredient_id),
          quantity_g: Number(r.quantity_g),
        })),
      })
      if (data.success) {
        onUpdated()
      } else {
        setError(data.message || 'Could not update recipe')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update recipe'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit "${recipe.name}"`} maxWidth="max-w-2xl">
      {isLoadingDetails ? (
        <p className="py-6 text-center text-sm text-ink-300">Loading recipe components…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Recipe name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Field
            label="Total weight (g)"
            type="number"
            step="0.01"
            value={totalWeightG}
            onChange={(e) => setTotalWeightG(e.target.value)}
            required
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Ingredients</p>
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}
                    className="flex-1 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-chili-400"
                  >
                    <option value="">Select ingredient…</option>
                    {ingredientsQuery.items.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="grams"
                    value={row.quantity_g}
                    onChange={(e) => updateRow(idx, 'quantity_g', e.target.value)}
                    className="w-28 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-chili-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="rounded-full p-2 text-ink-300 hover:bg-cream-100 hover:text-chili-500"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="mt-2 text-sm font-medium text-chili-500">
              + Add ingredient
            </button>
          </div>

          {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function ViewRecipeModal({ open, recipe, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipe-details', recipe?.id],
    queryFn: () => getRecipeDetails(recipe.id),
    enabled: Boolean(recipe?.id && open),
  })

  if (!recipe) return null

  const details = data?.recipe || recipe
  const ingredients = data?.ingredients || []
  const nutritionTotals = data?.nutrition_totals || {}
  const nutritionPer100g = data?.nutrition_per_100g || {}

  return (
    <Modal open={open} onClose={onClose} title={details.name} maxWidth="max-w-2xl">
      {isLoading ? (
        <p className="py-8 text-center text-sm text-ink-300">Loading recipe details…</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-chili-500">Could not load recipe details.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <div>
              <p className="text-sm font-medium text-ink-900">
                Product: {details.product_name || recipe.product_name}
              </p>
              <p className="text-xs text-ink-500">Total batch weight: {details.total_weight_g}g</p>
            </div>
            {details.selling_price ? (
              <span className="font-semibold text-chili-500">₹{details.selling_price}</span>
            ) : null}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Ingredients in Batch ({ingredients.length})
            </h4>
            <div className="divide-y divide-cream-100 border border-cream-200 rounded-xl overflow-hidden">
              {ingredients.map((ing) => (
                <div key={ing.ingredient_id} className="flex items-center justify-between px-3.5 py-2.5 text-sm bg-white hover:bg-cream-50">
                  <div>
                    <span className="font-medium text-ink-900">{ing.ingredient_name}</span>
                    <span className="ml-2 text-xs text-ink-300">
                      ({ing.calories_per_100g} kcal / 100g)
                    </span>
                  </div>
                  <span className="font-semibold text-ink-700">
                    {ing.quantity_g}g
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition breakdown cards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Nutritional Profile (Batch Total / Per 100g)
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-2.5">
                <span className="text-ink-500 block">Calories</span>
                <span className="font-bold text-ink-900 mt-0.5 block">{nutritionTotals.calories ?? '—'}</span>
                <span className="text-[10px] text-ink-300">{nutritionPer100g.calories ?? '—'}/100g</span>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-2.5">
                <span className="text-ink-500 block">Protein</span>
                <span className="font-bold text-ink-900 mt-0.5 block">{nutritionTotals.protein ? `${nutritionTotals.protein}g` : '—'}</span>
                <span className="text-[10px] text-ink-300">{nutritionPer100g.protein ? `${nutritionPer100g.protein}g` : '—'}</span>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-2.5">
                <span className="text-ink-500 block">Carbs</span>
                <span className="font-bold text-ink-900 mt-0.5 block">{nutritionTotals.carbs ? `${nutritionTotals.carbs}g` : '—'}</span>
                <span className="text-[10px] text-ink-300">{nutritionPer100g.carbs ? `${nutritionPer100g.carbs}g` : '—'}</span>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-2.5">
                <span className="text-ink-500 block">Fat</span>
                <span className="font-bold text-ink-900 mt-0.5 block">{nutritionTotals.fat ? `${nutritionTotals.fat}g` : '—'}</span>
                <span className="text-[10px] text-ink-300">{nutritionPer100g.fat ? `${nutritionPer100g.fat}g` : '—'}</span>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-2.5">
                <span className="text-ink-500 block">Fiber</span>
                <span className="font-bold text-ink-900 mt-0.5 block">{nutritionTotals.fiber ? `${nutritionTotals.fiber}g` : '—'}</span>
                <span className="text-[10px] text-ink-300">{nutritionPer100g.fiber ? `${nutritionPer100g.fiber}g` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-right">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function CalculateRecipeModal({ open, recipe, onClose }) {
  const [requiredKg, setRequiredKg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setIsLoading(true)
    try {
      const data = await calculateRecipe({
        recipe_id: recipe.id,
        required_quantity_kg: Number(requiredKg),
      })
      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Could not calculate')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not calculate'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setRequiredKg('')
    setResult(null)
    setError(null)
    onClose()
  }

  if (!recipe) return null

  return (
    <Modal open={open} onClose={handleClose} title={`Scale "${recipe.name}" for batch production`}>
      <form onSubmit={handleCalculate} className="space-y-4">
        <Field
          label="Required quantity (kg)"
          type="number"
          step="0.01"
          value={requiredKg}
          onChange={(e) => setRequiredKg(e.target.value)}
          hint="How many kg of this product do you need to produce?"
          required
        />

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isLoading} className="w-full">
          Calculate
        </Button>
      </form>

      {result ? (
        <div className="mt-5 border-t border-cream-200 pt-4">
          <p className="text-sm font-medium text-ink-700">
            Ingredients needed for {result.required_quantity_kg} kg:
          </p>
          <div className="mt-2 space-y-1.5">
            {result.ingredients.map((ing) => (
              <div
                key={ing.ingredient_id}
                className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2 text-sm"
              >
                <span className="text-ink-700">{ing.ingredient_name}</span>
                <span className="font-semibold text-ink-900">{ing.display_quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

function DeleteConfirmModal({ open, title, message, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setError(null)
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Action failed'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-ink-700">{message}</p>
        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={isDeleting}
            onClick={handleConfirm}
            className="bg-chili-500 text-white hover:bg-chili-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}