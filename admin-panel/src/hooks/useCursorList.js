import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

/**
 * Every admin list endpoint (products, ingredients, recipes, orders,
 * subscriptions) returns the same shape:
 *   { success, <itemsKey>: [...], pagination: { limit, has_more, next_cursor } }
 * This hook wraps that pattern once instead of repeating it five times.
 */
export function useCursorList({ queryKey, queryFn, itemsKey, limit = 20 }) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ cursor: pageParam, limit }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage?.pagination?.has_more ?? lastPage?.has_more
      const nextCursor = lastPage?.pagination?.next_cursor ?? lastPage?.next_cursor
      return hasMore ? nextCursor : undefined
    },
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page?.[itemsKey] || []) ?? [],
    [query.data, itemsKey]
  )

  return { ...query, items }
}
