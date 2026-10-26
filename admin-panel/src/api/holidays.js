import { api } from './client'

/**
 * GET /admin_routes/list_service_holidays.php
 * Auth required (ADMIN).
 */
export function listAdminServiceHolidays(month) {
  const params = month ? { month } : {}
  return api.get('admin_routes/list_service_holidays.php', { params }).then((res) => res.data)
}

/**
 * POST /admin_routes/add_service_holiday.php
 * Auth required (ADMIN).
 * Body: { date?, dates?: string[], reason }
 */
export function addServiceHoliday({ date, dates, reason }) {
  return api
    .post('admin_routes/add_service_holiday.php', { date, dates, reason })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/delete_service_holiday.php
 * Auth required (ADMIN).
 * Body: { holiday_date }
 */
export function deleteServiceHoliday(holidayDate) {
  return api
    .post('admin_routes/delete_service_holiday.php', { holiday_date: holidayDate })
    .then((res) => res.data)
}
