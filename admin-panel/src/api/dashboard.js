import { api } from './client'

/**
 * GET /admin_routes/get_dashboard_stats.php
 * Auth required (ADMIN). Returns executive overview metrics.
 */
export function getDashboardStats() {
  return api.get('admin_routes/get_dashboard_stats.php').then((res) => res.data)
}

/**
 * GET /admin_routes/sales_report.php
 * Auth required (ADMIN).
 * Params: { start_date?, end_date? }
 */
export function getSalesReport({ startDate, endDate } = {}) {
  const params = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  return api.get('admin_routes/sales_report.php', { params }).then((res) => res.data)
}
