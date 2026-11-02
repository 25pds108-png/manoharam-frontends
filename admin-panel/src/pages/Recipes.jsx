import { useState, useMemo } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  Calculator,
  ChefHat,
  Wheat,
  Edit,
  Eye,
  Search,
  Scale,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
} from 'lucide-react'
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
  { id: 'recipes', label: 'Culinary Recipes', icon: ChefHat },
  { id: 'ingredients', label: 'Ingredient Library', icon: Wheat },
]

export default function Recipes() {
  const [activeTab, setActiveTab] = useState('recipes')
  const [createRecipeOpen, setCreateRecipeOpen] = useState(false)
  const [createIngredientOpen, setCreateIngredientOpen] = useState(false)
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
        title="Recipes & Ingredients Library"
        description="Craft standardized South Indian recipes, calculate nutritional profiles, and scale ingredients for daily kitchen batches."
        action={
          <Button
            onClick={() => {
              if (activeTab === 'recipes') {
                setCreateRecipeOpen(true)
              } else {
                setCreateIngredientOpen(true)
              }
            }}
            className="text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTab === 'recipes' ? 'New Recipe' : 'New Ingredient'}</span>
          </Button>
        }
      />

      {/* TABS SWITCHER */}
      <div className="mb-6 flex w-full sm:w-fit gap-1 rounded-2xl bg-white p-1.5 shadow-2xs border border-cream-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all select-none ${
              activeTab === id
                ? 'bg-chili-600 text-cream-50 shadow-xs'
                : 'text-ink-700 hover:bg-cream-100 hover:text-ink-950'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'recipes' ? (
        <RecipesTab
          recipesQuery={recipesQuery}
          onScale={(recipe) => setCalcTarget(recipe)}
          onView={(recipe) => setViewRecipeTarget(recipe)}
          onEdit={(recipe) => setEditRecipeTarget(recipe)}
          onDelete={(recipe) => setDeleteRecipeTarget(recipe)}
          onOpenCreate={() => setCreateRecipeOpen(true)}
        />
      ) : (
        <IngredientsTab
          ingredientsQuery={ingredientsQuery}
          onEdit={(ingredient) => setEditIngredientTarget(ingredient)}
          onDelete={(ingredient) => setDeleteIngredientTarget(ingredient)}
          onOpenCreate={() => setCreateIngredientOpen(true)}
        />
      )}

      {/* Modals */}
      <CreateRecipeModal
        open={createRecipeOpen}
        onClose={() => setCreateRecipeOpen(false)}
        ingredientsQuery={ingredientsQuery}
        productsQuery={productsQuery}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['recipes'] })}
      />

      <CreateIngredientModal
        open={createIngredientOpen}
        onClose={() => setCreateIngredientOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['ingredients'] })}
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

      {/* Recipe Scaling Modal */}
      <CalculateRecipeModal
        open={Boolean(calcTarget)}
        recipe={calcTarget}
        onClose={() => setCalcTarget(null)}
      />

      {/* Recipe View Details Modal */}
      <ViewRecipeModal
        open={Boolean(viewRecipeTarget)}
        recipe={viewRecipeTarget}
        onClose={() => setViewRecipeTarget(null)}
        onScale={() => {
          setCalcTarget(viewRecipeTarget)
          setViewRecipeTarget(null)
        }}
      />

      {/* Confirm Delete Recipe Dialog */}
      <ConfirmDialog
        open={Boolean(deleteRecipeTarget)}
        onClose={() => setDeleteRecipeTarget(null)}
        title="Delete Recipe Formula?"
        description={`Are you sure you want to delete "${deleteRecipeTarget?.name}"? Linked nutritional calculations will be detached from the product.`}
        confirmLabel="Yes, Delete Recipe"
        onConfirm={async () => {
          await deleteRecipe(deleteRecipeTarget.id)
          queryClient.invalidateQueries({ queryKey: ['recipes'] })
          setDeleteRecipeTarget(null)
        }}
      />

      {/* Confirm Delete Ingredient Dialog */}
      <ConfirmDialog
        open={Boolean(deleteIngredientTarget)}
        onClose={() => setDeleteIngredientTarget(null)}
        title="Delete Raw Ingredient?"
        description={`Are you sure you want to remove "${deleteIngredientTarget?.name}" from the library? Any recipes currently referencing it might lose nutritional accuracy.`}
        confirmLabel="Yes, Delete Ingredient"
        onConfirm={async () => {
          await deleteIngredient(deleteIngredientTarget.id)
          queryClient.invalidateQueries({ queryKey: ['ingredients'] })
          setDeleteIngredientTarget(null)
        }}
      />
    </DashboardShell>
  )
}

function RecipesTab({ recipesQuery, onScale, onView, onEdit, onDelete, onOpenCreate }) {
  const { items: recipes, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    recipesQuery
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const q = search.toLowerCase().trim()
      return !q || r.name?.toLowerCase().includes(q) || r.product_name?.toLowerCase().includes(q)
    })
  }, [recipes, search])

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search recipes by name or linked dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm outline-none focus:border-chili-500 focus:bg-white transition-colors"
          />
        </div>
        <span className="text-xs font-semibold text-ink-600 shrink-0">
          {filtered.length} Recipes
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-white border border-cream-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-4 w-3/4 rounded bg-cream-200" />
              <div className="h-3 w-1/2 rounded bg-cream-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-chili-600 text-xs">Couldn't load recipes.</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title={search ? 'No matching recipes found' : 'No recipes created yet'}
          description={
            search
              ? 'Try modifying your search query.'
              : 'Add ingredient formulations for your salads, pickles, or powders.'
          }
          actionLabel="Create Recipe"
          onAction={onOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((recipe) => (
            <Card
              key={recipe.id}
              className="p-5 flex flex-col justify-between hover:border-cream-400 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chili-50 text-chili-600">
                      <ChefHat className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
                        Linked Dish
                      </span>
                      <span className="text-xs font-semibold text-ink-700 truncate max-w-[150px] block">
                        {recipe.product_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView(recipe)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                      title="View formulation & nutrition"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(recipe)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                      title="Edit recipe"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(recipe)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-chili-50 hover:text-chili-600"
                      title="Delete recipe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="font-display text-base font-bold text-ink-950 group-hover:text-chili-600 transition-colors">
                    {recipe.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink-600">
                    <span className="rounded-md bg-cream-100 px-2 py-0.5 font-semibold">
                      Yield: {recipe.total_weight_g}g
                    </span>
                    <span className="text-cream-400">·</span>
                    <span className="text-[11px] text-ink-400">
                      Added {new Date(recipe.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onScale(recipe)}
                  className="text-xs"
                >
                  <Calculator className="h-3.5 w-3.5 text-chili-600" />
                  <span>Scale Batch</span>
                </Button>

                <button
                  type="button"
                  onClick={() => onView(recipe)}
                  className="text-xs font-bold text-chili-600 hover:underline"
                >
                  Nutrition →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            size="sm"
          >
            Load More Recipes
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function IngredientsTab({ ingredientsQuery, onEdit, onDelete, onOpenCreate }) {
  const {
    items: ingredients,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = ingredientsQuery
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return ingredients.filter((ing) => {
      const q = search.toLowerCase().trim()
      return !q || ing.name?.toLowerCase().includes(q)
    })
  }, [ingredients, search])

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-2xs">
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
          title={search ? 'No matching ingredients found' : 'No ingredients in library'}
          description={
            search
              ? 'Try modifying your search keyword.'
              : 'Register raw ingredients (spices, cold-pressed oils, lentils) with nutritional values.'
          }
          actionLabel="Add Ingredient"
          onAction={onOpenCreate}
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
                            onClick={() => onEdit(ing)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                            title="Edit ingredient"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(ing)}
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

          {/* Mobile Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {filtered.map((ing) => (
              <Card key={ing.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-cream-100 pb-2">
                  <div>
                    <h4 className="font-bold text-ink-950 text-sm">{ing.name}</h4>
                    <p className="text-[11px] text-ink-500">Unit: {ing.unit} (Values per 100g)</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(ing)}
                      className="p-1.5 rounded-lg text-ink-500 hover:bg-cream-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(ing)}
                      className="p-1.5 rounded-lg text-chili-500 hover:bg-chili-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
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
    </div>
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

    if (!productId) {
      setError('Please select which product this recipe belongs to.')
      return
    }
    if (!name.trim()) {
      setError('Please provide a recipe title.')
      return
    }
    if (!totalWeightG || Number(totalWeightG) <= 0) {
      setError('Please enter a valid total batch yield weight.')
      return
    }

    const validRows = rows.filter((r) => r.ingredient_id && Number(r.quantity_g) > 0)
    if (validRows.length === 0) {
      setError('Add at least one ingredient with a positive gram weight.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await createRecipe({
        product_id: Number(productId),
        name: name.trim(),
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
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Create New Recipe Formulation"
      subtitle="Define raw ingredients and quantities. Backend calculates nutrition automatically."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-3.5">
          <Field
            as="select"
            label="Product Destination"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            hint="Choose which salad, pickle, or dish this recipe standardizes."
            required
          >
            <option value="">Select a product from catalog…</option>
            {productsQuery.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.category ? `(${p.category})` : ''}
              </option>
            ))}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Recipe Formulation Title"
              placeholder="e.g. Master Garlic Pickle Batch v1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Total Batch Yield (g)"
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 1000"
              suffix="grams"
              value={totalWeightG}
              onChange={(e) => setTotalWeightG(e.target.value)}
              hint="Total output weight used to scale nutrition per pack."
              required
            />
          </div>
        </div>

        {/* Dynamic Ingredient Row Builder */}
        <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-cream-200 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                Ingredients Formula ({rows.length})
              </h4>
              <p className="text-[11px] text-ink-500">
                Specify raw ingredients and their weight contribution to the batch.
              </p>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={addRow}>
              <Plus className="h-3.5 w-3.5 text-chili-600" />
              <span>Add Ingredient</span>
            </Button>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-none">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-cream-200 shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <select
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}
                    className="w-full rounded-lg border border-cream-300 bg-cream-50/40 px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-500"
                  >
                    <option value="">Select ingredient…</option>
                    {ingredientsQuery.items.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.calories_per_100g} kcal/100g)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28 shrink-0">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="Weight (g)"
                    value={row.quantity_g}
                    onChange={(e) => updateRow(idx, 'quantity_g', e.target.value)}
                    className="w-full rounded-lg border border-cream-300 bg-cream-50/40 px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-chili-50 hover:text-chili-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
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
            Create Recipe
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditRecipeModal({ open, recipe, ingredientsQuery, onClose, onUpdated }) {
  const [name, setName] = useState(recipe?.name || '')
  const [totalWeightG, setTotalWeightG] = useState(recipe?.total_weight_g || '')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)

  // Fetch recipe ingredients for editing
  useQuery({
    queryKey: ['recipe-details-edit', recipe?.id],
    queryFn: async () => {
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
      setIsLoadingDetails(false)
      return data
    },
    enabled: Boolean(recipe?.id && open),
  })

  const addRow = () => setRows((r) => [...r, { ingredient_id: '', quantity_g: '' }])
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx, field, value) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide a recipe title.')
      return
    }
    if (!totalWeightG || Number(totalWeightG) <= 0) {
      setError('Please enter a valid total batch yield weight.')
      return
    }

    const validRows = rows.filter((r) => r.ingredient_id && Number(r.quantity_g) > 0)
    if (validRows.length === 0) {
      setError('Add at least one ingredient with a positive gram weight.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await updateRecipe({
        id: Number(recipe.id),
        name: name.trim(),
        total_weight_g: Number(totalWeightG),
        ingredients: validRows.map((r) => ({
          ingredient_id: Number(r.ingredient_id),
          quantity_g: Number(r.quantity_g),
        })),
      })
      if (data.success) {
        onUpdated()
        onClose()
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
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Formulation: ${recipe.name}`}
      subtitle={`Linked to product: ${recipe.product_name}`}
      maxWidth="max-w-2xl"
    >
      {isLoadingDetails ? (
        <p className="py-8 text-center text-xs text-ink-400">Loading recipe formulation…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
            <Field
              label="Recipe Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Batch Yield (g)"
              type="number"
              step="any"
              min="1"
              suffix="grams"
              value={totalWeightG}
              onChange={(e) => setTotalWeightG(e.target.value)}
              required
            />
          </div>

          <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-cream-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                Ingredients Formula ({rows.length})
              </h4>
              <Button type="button" size="sm" variant="secondary" onClick={addRow}>
                <Plus className="h-3.5 w-3.5 text-chili-600" />
                <span>Add Ingredient</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-none">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-cream-200 shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <select
                      value={row.ingredient_id}
                      onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}
                      className="w-full rounded-lg border border-cream-300 bg-cream-50/40 px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-500"
                    >
                      <option value="">Select ingredient…</option>
                      {ingredientsQuery.items.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.calories_per_100g} kcal/100g)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28 shrink-0">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      placeholder="Weight (g)"
                      value={row.quantity_g}
                      onChange={(e) => updateRow(idx, 'quantity_g', e.target.value)}
                      className="w-full rounded-lg border border-cream-300 bg-cream-50/40 px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-chili-50 hover:text-chili-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
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
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
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

    if (!form.name.trim()) {
      setError('Please provide an ingredient name.')
      return
    }

    setIsSubmitting(true)
    try {
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
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Add Raw Ingredient"
      subtitle="Register an ingredient to the library with nutritional content per 100g."
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
            placeholder="e.g. Cold-Pressed Sesame Oil"
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
          <div className="border-b border-cream-200 pb-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-800">
              Nutritional Values (Per 100g Portion)
            </h4>
            <p className="text-[11px] text-ink-500">
              Used across all recipe formulas to compute meal calories and macros.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Field
              label="Calories (kcal)"
              type="number"
              step="any"
              placeholder="0"
              value={form.calories_per_100g}
              onChange={update('calories_per_100g')}
            />
            <Field
              label="Protein (g)"
              type="number"
              step="any"
              placeholder="0"
              value={form.protein_per_100g}
              onChange={update('protein_per_100g')}
            />
            <Field
              label="Carbs (g)"
              type="number"
              step="any"
              placeholder="0"
              value={form.carbs_per_100g}
              onChange={update('carbs_per_100g')}
            />
            <Field
              label="Fat (g)"
              type="number"
              step="any"
              placeholder="0"
              value={form.fat_per_100g}
              onChange={update('fat_per_100g')}
            />
            <Field
              label="Fiber (g)"
              type="number"
              step="any"
              placeholder="0"
              value={form.fiber_per_100g}
              onChange={update('fiber_per_100g')}
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
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
            Save Ingredient
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditIngredientModal({ open, ingredient, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: ingredient?.name || '',
    unit: ingredient?.unit || 'g',
    calories_per_100g: ingredient?.calories_per_100g ?? '',
    protein_per_100g: ingredient?.protein_per_100g ?? '',
    carbs_per_100g: ingredient?.carbs_per_100g ?? '',
    fat_per_100g: ingredient?.fat_per_100g ?? '',
    fiber_per_100g: ingredient?.fiber_per_100g ?? '',
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Please provide an ingredient name.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await updateIngredient({
        id: ingredient.id,
        name: form.name.trim(),
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
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Ingredient: ${ingredient.name}`}
      subtitle="Update raw ingredient parameters and nutrition."
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
            onClick={onClose}
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ViewRecipeModal({ open, recipe, onClose, onScale }) {
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
    <Modal
      open={open}
      onClose={onClose}
      title={details.name}
      subtitle={`Formulated for ${details.product_name || recipe.product_name}`}
      maxWidth="max-w-2xl"
    >
      {isLoading ? (
        <p className="py-8 text-center text-xs text-ink-400">Loading recipe formula & nutrition…</p>
      ) : isError ? (
        <p className="py-8 text-center text-xs text-chili-600">Could not load recipe details.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-50 p-4 border border-cream-200">
            <div>
              <p className="text-xs font-bold text-ink-900">
                Total Batch Yield: {details.total_weight_g}g
              </p>
              <p className="text-[11px] text-ink-500 mt-0.5">
                Contains {ingredients.length} standardized ingredients
              </p>
            </div>
            <Button size="sm" onClick={onScale} className="text-xs">
              <Calculator className="h-3.5 w-3.5" />
              <span>Scale for Kitchen Batch</span>
            </Button>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-2.5">
              Ingredients in Batch ({ingredients.length})
            </h4>
            <div className="divide-y divide-cream-100 border border-cream-200 rounded-2xl overflow-hidden bg-white">
              {ingredients.map((ing) => (
                <div
                  key={ing.ingredient_id}
                  className="flex items-center justify-between px-4 py-3 text-xs hover:bg-cream-50/70 transition-colors"
                >
                  <div>
                    <span className="font-bold text-ink-950">{ing.ingredient_name}</span>
                    <span className="ml-2 text-[11px] text-ink-400">
                      ({ing.calories_per_100g} kcal / 100g)
                    </span>
                  </div>
                  <span className="font-bold text-ink-900 bg-cream-100 px-2.5 py-1 rounded-md">
                    {ing.quantity_g}g
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition breakdown cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-2.5">
              Calculated Nutrition Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Calories</span>
                <span className="font-display text-base font-bold text-ink-950 mt-0.5 block">
                  {Math.round(nutritionTotals.calories ?? 0)}
                </span>
                <span className="text-[10px] text-ink-400">
                  {Math.round(nutritionPer100g.calories ?? 0)} / 100g
                </span>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Protein</span>
                <span className="font-display text-base font-bold text-ink-950 mt-0.5 block">
                  {Math.round(nutritionTotals.protein ?? 0)}g
                </span>
                <span className="text-[10px] text-ink-400">
                  {Math.round(nutritionPer100g.protein ?? 0)}g / 100g
                </span>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Carbs</span>
                <span className="font-display text-base font-bold text-ink-950 mt-0.5 block">
                  {Math.round(nutritionTotals.carbs ?? 0)}g
                </span>
                <span className="text-[10px] text-ink-400">
                  {Math.round(nutritionPer100g.carbs ?? 0)}g / 100g
                </span>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Fat</span>
                <span className="font-display text-base font-bold text-ink-950 mt-0.5 block">
                  {Math.round(nutritionTotals.fat ?? 0)}g
                </span>
                <span className="text-[10px] text-ink-400">
                  {Math.round(nutritionPer100g.fat ?? 0)}g / 100g
                </span>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Fiber</span>
                <span className="font-display text-base font-bold text-ink-950 mt-0.5 block">
                  {Math.round(nutritionTotals.fiber ?? 0)}g
                </span>
                <span className="text-[10px] text-ink-400">
                  {Math.round(nutritionPer100g.fiber ?? 0)}g / 100g
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-right">
            <Button variant="secondary" size="sm" onClick={onClose}>
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

    if (!requiredKg || Number(requiredKg) <= 0) {
      setError('Please enter a target production weight in kg.')
      return
    }

    setIsLoading(true)
    try {
      const data = await calculateRecipe({
        recipe_id: recipe.id,
        required_quantity_kg: Number(requiredKg),
      })
      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Could not calculate batch requirements')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not calculate batch requirements'))
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
    <Modal
      open={open}
      onClose={handleClose}
      title={`Scale "${recipe.name}" Batch`}
      subtitle={`Enter how many kilograms the kitchen needs to prepare today.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleCalculate} className="space-y-4">
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        ) : null}

        <Field
          label="Target Batch Production (kg)"
          type="number"
          step="any"
          min="0.1"
          placeholder="e.g. 5 or 25"
          suffix="kg"
          value={requiredKg}
          onChange={(e) => setRequiredKg(e.target.value)}
          hint="Calculates exact ingredient measurements proportionally."
          required
        />

        <Button type="submit" loading={isLoading} className="w-full">
          <Calculator className="h-4 w-4" />
          <span>Calculate Raw Materials</span>
        </Button>
      </form>

      {result ? (
        <div className="mt-5 border-t border-cream-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-700">
              Raw Ingredients Needed
            </span>
            <span className="text-xs font-bold text-chili-600">
              For {result.required_quantity_kg} kg Batch
            </span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
            {result.ingredients.map((ing) => (
              <div
                key={ing.ingredient_id}
                className="flex items-center justify-between rounded-xl bg-cream-50 p-2.5 border border-cream-200 text-xs"
              >
                <span className="font-semibold text-ink-800">{ing.ingredient_name}</span>
                <span className="font-bold text-ink-950 font-mono bg-white px-2 py-0.5 rounded border border-cream-200">
                  {ing.display_quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}