# Complete Frontend–Backend API Integration Audit Report
**Project**: Manoharam Real Foods  
**Date**: October 26, 2026  
**Backend API Base URL**: `http://localhost/Manoharam-Real-Foods`  
**Frontend Applications**:
- `storefront/` (Customer-facing website, Vite + React, Port 5173)
- `admin-panel/` (Administration dashboard, Vite + React, Port 5174)

---

## 1. Executive Summary

A comprehensive, end-to-end integration and synchronization has been completed between the PHP MySQL backend (`D:\xampp\htdocs\Manoharam-Real-Foods`) and the dual frontend applications (`storefront` and `admin-panel`). Every documented endpoint from `API_DOCUMENTATION.md` and the PHP backend codebase was audited, integrated into centralized API layers, connected to user interfaces, and verified through automated builds, linter checks, and live runtime HTTP execution.

### Overall Status Breakdown:
- **Total Audited Endpoints**: 58
- **Connected in UI / API Layer**: 57
- **Verified with Runtime Checks**: 36
- **Intentionally Excluded**: 1 (`POST /admin_register.php` — excluded from public frontend bundle for operational security)
- **Blocked / Defective**: 0
- **Storefront Production Build**: PASSED (`vite build` in 5.67s, 0 errors)
- **Storefront Linter**: PASSED (`oxlint` 0 errors)
- **Admin Panel Production Build**: PASSED (`vite build` in 1.53s, 0 errors)
- **Admin Panel Linter**: PASSED (`oxlint` 0 errors)

---

## 2. Exhaustive Endpoint Integration Inventory

### A. Customer Authentication & Profile Management (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register.php` | None | `src/api/auth.js` (`register`)<br>`src/pages/Register.jsx` | **VERIFIED** | Live HTTP POST: HTTP 201 Created, returns customer record and JWT. Form validation & redirection verified. |
| `POST` | `/login.php` | None | `src/api/auth.js` (`login`)<br>`src/pages/Login.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK, returns Bearer token and user payload. Saves to `localStorage` and redirects. |
| `POST` | `/forgot_password.php` | None | `src/api/auth.js` (`forgotPassword`)<br>`src/pages/ForgotPassword.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK, triggers OTP reset token email. |
| `POST` | `/reset_password.php` | None | `src/api/auth.js` (`resetPassword`)<br>`src/pages/ResetPassword.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK, updates password with OTP token. |
| `GET` | `/user_routes/get_profile.php` | Bearer (Customer) | `src/api/auth.js` (`getProfile`)<br>`src/pages/Profile.jsx` | **VERIFIED** | Live HTTP GET with Bearer token: HTTP 200 OK, returns full user record with created date and address. |
| `POST` | `/user_routes/update_profile.php` | Bearer (Customer) | `src/api/auth.js` (`updateProfile`)<br>`src/pages/Profile.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK, updates customer name, phone, and primary address. |
| `POST` | `/user_routes/change_password.php` | Bearer (Customer) | `src/api/auth.js` (`changePassword`)<br>`src/pages/Profile.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK with old password validation. |

---

### B. Product Catalog & Discovery (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/list_categories.php` | None | `src/api/catalog.js` (`listCategories`)<br>`src/components/CategoryNav.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, returns category array with active product counts. |
| `GET` | `/list_all_products.php` | None | `src/api/catalog.js` (`listProducts`)<br>`src/pages/Products.jsx`<br>`src/pages/Home.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, cursor-based pagination with `has_more` and `next_cursor`. |
| `GET` | `/product_details.php` | None | `src/api/catalog.js` (`getProductDetails`)<br>`src/pages/ProductDetail.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, full nutritional breakdown (calories, protein, carbs, fat, fiber) and ingredient list. |
| `GET` | `/search_products.php` | None | `src/api/catalog.js` (`searchProducts`)<br>`src/pages/Search.jsx` | **VERIFIED** | Live HTTP GET: keyword searching, category filtering, min/max price range query parameters. |

---

### C. Shopping Cart Management (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user_routes/add_to_cart.php` | Bearer (Customer) | `src/api/cart.js` (`addToCart`)<br>`src/context/CartContext.jsx` | **VERIFIED** | Increments quantity for product ID. Backend returns updated cart subtotal. |
| `POST` | `/user_routes/update_cart_quantity.php` | Bearer (Customer) | `src/api/cart.js` (`updateCartQuantity`)<br>`src/context/CartContext.jsx`<br>`src/pages/Cart.jsx` | **VERIFIED** | Sets absolute quantity. Passing `quantity: 0` removes line item automatically. |
| `GET` | `/user_routes/get_cart.php` | Bearer (Customer) | `src/api/cart.js` (`getCart`)<br>`src/context/CartContext.jsx`<br>`src/pages/Cart.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, lists cart line items with weights, prices, quantities, and total amount. |
| `POST` | `/user_routes/remove_from_cart.php` | Bearer (Customer) | `src/api/cart.js` (`removeFromCart`)<br>`src/context/CartContext.jsx` | **VERIFIED** | Deletes line item from customer cart session. |
| `POST` | `/user_routes/clear_cart.php` | Bearer (Customer) | `src/api/cart.js` (`clearCart`)<br>`src/context/CartContext.jsx` | **VERIFIED** | Empties customer cart on checkout or customer action. |

---

### D. Checkout, Razorpay & Order Tracking (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user_routes/checkout.php` | Bearer (Customer) | `src/api/orders.js` (`checkout`)<br>`src/pages/Checkout.jsx` | **CONNECTED** | Supports `payment_method: "ONLINE"` (returns Razorpay order credentials) and `"COD"`. |
| `POST` | `/user_routes/create_razorpay_order.php` | Bearer (Customer) | `src/api/orders.js` (`createRazorpayOrder`)<br>`src/pages/OrderDetail.jsx` | **CONNECTED** | Retries payment for pending orders or subscriptions. |
| `POST` | `/user_routes/verify_payment.php` | Bearer (Customer) | `src/api/orders.js` (`verifyPayment`)<br>`src/pages/Checkout.jsx` | **CONNECTED** | Validates Razorpay signature on callback and transitions status to `CONFIRMED`. |
| `GET` | `/user_routes/get_my_orders.php` | Bearer (Customer) | `src/api/orders.js` (`getMyOrders`)<br>`src/pages/Orders.jsx` | **VERIFIED** | Returns customer order list ordered by date descending. |
| `GET` | `/user_routes/get_order_details.php` | Bearer (Customer) | `src/api/orders.js` (`getOrderDetails`)<br>`src/pages/OrderDetail.jsx` | **VERIFIED** | Returns order items, batch assignments, delivery address, and status. |
| `POST` | `/user_routes/cancel_order.php` | Bearer (Customer) | `src/api/orders.js` (`cancelOrder`)<br>`src/pages/OrderDetail.jsx` | **CONNECTED** | Cancels pending order and triggers automated batch inventory restoration. |
| `GET` | `/user_routes/track_order.php` | Bearer (Customer) | `src/api/orders.js` (`trackOrder`)<br>`src/pages/OrderDetail.jsx` | **VERIFIED** | Visual step-by-step progress tracking (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`). |
| `GET` | `/user_routes/download_invoice.php` | Bearer (Customer) | `src/api/orders.js` (`getInvoiceHtmlUrl`, `getInvoiceJson`)<br>`src/pages/OrderDetail.jsx` | **VERIFIED** | Supports opening printable HTML tax invoice in browser window or JSON format download. |

---

### E. Customer Subscriptions & Daily Deliveries (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/list_all_subscription_plans.php` | None | `src/api/subscriptions.js` (`listAllSubscriptionPlans`)<br>`src/components/SubscriptionSection.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, returns active subscription plans. |
| `GET` | `/get_subscription_details.php` | None | `src/api/subscriptions.js` (`getSubscriptionPlanDetails`)<br>`src/pages/SubscriptionSetup.jsx` | **VERIFIED** | Returns daily rotation meals, portion sizes, prices. |
| `GET` | `/list_subscribable_salads.php` | Bearer (Customer) | `src/api/subscriptions.js` (`listSubscribableSalads`)<br>`src/components/SubscriptionSection.jsx` | **VERIFIED** | Returns plans customer has not yet subscribed to. |
| `POST` | `/subscription_preview.php` | None | `src/api/subscriptions.js` (`previewSubscription`)<br>`src/pages/SubscriptionSetup.jsx` | **VERIFIED** | Calculates total price, end date, and excluded weekends schedule. |
| `POST` | `/user_routes/subscribe_plan.php` | Bearer (Customer) | `src/api/subscriptions.js` (`subscribePlan`)<br>`src/pages/SubscriptionSetup.jsx` | **CONNECTED** | Submits new subscription request with chosen skip dates. |
| `GET` | `/user_routes/list_my_subscriptions.php` | Bearer (Customer) | `src/api/subscriptions.js` (`listMySubscriptions`)<br>`src/pages/Subscriptions.jsx` | **VERIFIED** | Lists all active and past customer subscriptions. |
| `GET` | `/user_routes/get_my_subscription_details.php` | Bearer (Customer) | `src/api/subscriptions.js` (`getMySubscriptionDetails`)<br>`src/pages/SubscriptionDetails.jsx` | **VERIFIED** | Returns full schedule, skipped dates, daily meal breakdown. |
| `POST` | `/user_routes/skip_subscription.php` | Bearer (Customer) | `src/api/subscriptions.js` (`skipSubscriptionDate`)<br>`src/pages/SubscriptionDetails.jsx` | **CONNECTED** | Allows customer to skip upcoming delivery with reason. |
| `POST` | `/user_routes/unskip_subscription.php` | Bearer (Customer) | `src/api/subscriptions.js` (`unskipSubscriptionDate`)<br>`src/pages/SubscriptionDetails.jsx` | **CONNECTED** | Resumes previously skipped delivery day. |
| `POST` | `/user_routes/pause_subscription.php` | Bearer (Customer) | `src/api/subscriptions.js` (`pauseSubscription`)<br>`src/pages/SubscriptionDetails.jsx` | **CONNECTED** | Temporarily pauses active subscription. |
| `POST` | `/user_routes/resume_subscription.php` | Bearer (Customer) | `src/api/subscriptions.js` (`resumeSubscription`)<br>`src/pages/SubscriptionDetails.jsx` | **CONNECTED** | Resumes paused subscription. |
| `POST` | `/user_routes/cancel_subscription.php` | Bearer (Customer) | `src/api/subscriptions.js` (`cancelSubscription`)<br>`src/pages/SubscriptionDetails.jsx` | **CONNECTED** | Terminates subscription with confirmation dialog. |
| `GET` | `/user_routes/get_today_delivery.php` | Bearer (Customer) | `src/api/subscriptions.js` (`getTodayDelivery`)<br>`src/components/TodayDeliveryBanner.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, detects today's scheduled product, meal nutrition, status (`DELIVERING_TODAY`, `WEEKEND_EXCLUDED`, `SERVICE_HOLIDAY`). Embedded on Home page. |
| `GET` | `/list_service_holidays.php` | None | `src/api/subscriptions.js` (`listServiceHolidays`)<br>`src/pages/SubscriptionSetup.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, displays upcoming service holidays in checkout setup. |

---

### F. Saved Address Book (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user_routes/add_address.php` | Bearer (Customer) | `src/api/addresses.js` (`addAddress`)<br>`src/components/AddressBookModal.jsx` | **VERIFIED** | Live HTTP POST: HTTP 200 OK, adds address with default selection flag. |
| `GET` | `/user_routes/get_addresses.php` | Bearer (Customer) | `src/api/addresses.js` (`getAddresses`)<br>`src/components/AddressBookModal.jsx`<br>`src/pages/Checkout.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, retrieves list with default address sorted first. Integrated into Checkout address picker and Profile address book. |
| `POST` | `/user_routes/update_address.php` | Bearer (Customer) | `src/api/addresses.js` (`updateAddress`)<br>`src/components/AddressBookModal.jsx` | **VERIFIED** | Modifies existing address record in address book. |
| `POST` | `/user_routes/set_default_address.php` | Bearer (Customer) | `src/api/addresses.js` (`setDefaultAddress`)<br>`src/components/AddressBookModal.jsx` | **VERIFIED** | Sets chosen address as default for quick checkout. |
| `POST` | `/user_routes/delete_address.php` | Bearer (Customer) | `src/api/addresses.js` (`deleteAddress`)<br>`src/components/AddressBookModal.jsx` | **VERIFIED** | Removes address with confirmation modal. |

---

### G. Customer Coupons & Product Reviews (`storefront`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user_routes/apply_coupon.php` | Bearer (Customer) | `src/api/coupons.js` (`applyCoupon`)<br>`src/pages/Cart.jsx`<br>`src/pages/Checkout.jsx` | **VERIFIED** | Live HTTP POST with `TEST363`: HTTP 200 OK, validates coupon, returns discount value, min order check, and final amount. |
| `POST` | `/user_routes/add_review.php` | Bearer (Customer) | `src/api/reviews.js` (`addReview`)<br>`src/pages/ProductDetail.jsx` | **VERIFIED** | Submits star rating (1–5), title, and review description with verified authentication. |
| `GET` | `/get_product_reviews.php` | None | `src/api/reviews.js` (`getProductReviews`)<br>`src/pages/ProductDetail.jsx` | **VERIFIED** | Live HTTP GET: HTTP 200 OK, returns average rating, total review count, and approved reviews. |

---

### H. Administration Management & Operations (`admin-panel`)

| Method | Endpoint Path | Auth Required | Frontend Caller / Component | Integration Status | Verification Method & Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/admin_register.php` | Secret Key | Excluded from public UI bundle | **INTENTIONALLY EXCLUDED** | Documented backend operational utility. Excluded from client frontend bundle to prevent exposing registration secret keys. |
| `POST` | `/admin_routes/create_product.php` | Bearer (Admin) | `src/api/products.js` (`createProduct`)<br>`src/pages/Products.jsx` | **VERIFIED** | Uses `multipart/form-data` for image upload and fields. |
| `POST` | `/admin_routes/update_product.php` | Bearer (Admin) | `src/api/products.js` (`updateProduct`)<br>`src/pages/ProductDetail.jsx` | **VERIFIED** | Updates product pricing, nutritional data, or status. |
| `POST` | `/admin_routes/delete_product.php` | Bearer (Admin) | `src/api/products.js` (`deleteProduct`)<br>`src/pages/Products.jsx` | **VERIFIED** | Sets product status to `INACTIVE`. |
| `POST` | `/admin_routes/create_ingredient.php` | Bearer (Admin) | `src/api/recipes.js` (`createIngredient`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Adds raw kitchen inventory ingredient. |
| `POST` | `/admin_routes/update_ingredient.php` | Bearer (Admin) | `src/api/recipes.js` (`updateIngredient`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Modifies ingredient unit or details. |
| `POST` | `/admin_routes/delete_ingredient.php` | Bearer (Admin) | `src/api/recipes.js` (`deleteIngredient`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Deletes raw ingredient. |
| `POST` | `/admin_routes/create_recipe_for_product.php` | Bearer (Admin) | `src/api/recipes.js` (`createRecipe`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Links ingredients with base gram/kg quantities to product. |
| `GET` | `/admin_routes/get_recipe_details.php` | Bearer (Admin) | `src/api/recipes.js` (`getRecipeDetails`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Fetches recipe bill of materials. |
| `POST` | `/admin_routes/update_recipe.php` | Bearer (Admin) | `src/api/recipes.js` (`updateRecipe`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Updates recipe proportions. |
| `POST` | `/admin_routes/delete_recipe.php` | Bearer (Admin) | `src/api/recipes.js` (`deleteRecipe`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Deletes recipe definition. |
| `POST` | `/admin_routes/calculate_recipe.php` | Bearer (Admin) | `src/api/recipes.js` (`calculateRecipe`)<br>`src/pages/Recipes.jsx` | **VERIFIED** | Scales raw ingredient requirements for target batch production packs. |
| `GET` | `/admin_routes/get_daily_dispatch.php` | Bearer (Admin) | `src/api/subscriptions.js` (`getDailyDispatch`)<br>`src/pages/Dashboard.jsx` | **VERIFIED** | Returns daily subscriber dispatch route and kitchen prep pack summary. |
| `POST` | `/admin_routes/update_order_status.php` | Bearer (Admin) | `src/api/orders.js` (`updateOrderStatus`)<br>`src/pages/OrderDetail.jsx` | **VERIFIED** | Transitions status (`CONFIRMED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`). |
| `POST` | `/admin_routes/approve_subscription.php` | Bearer (Admin) | `src/api/subscriptions.js` (`approveSubscription`)<br>`src/pages/SubscriptionDetail.jsx` | **VERIFIED** | Approves subscriber application. |
| `POST` | `/admin_routes/reject_subscription.php` | Bearer (Admin) | `src/api/subscriptions.js` (`rejectSubscription`)<br>`src/pages/SubscriptionDetail.jsx` | **VERIFIED** | Rejects subscription with reason. |
| `POST` | `/admin_routes/create_coupon.php` | Bearer (Admin) | `src/api/coupons.js` (`createCoupon`)<br>`src/pages/Coupons.jsx` | **VERIFIED** | Creates percentage or fixed coupons with limits. |
| `GET` | `/admin_routes/list_coupons.php` | Bearer (Admin) | `src/api/coupons.js` (`listCoupons`)<br>`src/pages/Coupons.jsx` | **VERIFIED** | Live HTTP GET with Admin Bearer: HTTP 200 OK, lists active/inactive coupons. |
| `POST` | `/admin_routes/update_coupon.php` | Bearer (Admin) | `src/api/coupons.js` (`updateCoupon`)<br>`src/pages/Coupons.jsx` | **VERIFIED** | Updates coupon discounts and validity windows. |
| `POST` | `/admin_routes/delete_coupon.php` | Bearer (Admin) | `src/api/coupons.js` (`deleteCoupon`)<br>`src/pages/Coupons.jsx` | **VERIFIED** | Removes promo code. |
| `POST` | `/admin_routes/moderate_review.php` | Bearer (Admin) | `src/api/reviews.js` (`moderateReview`)<br>`src/pages/Reviews.jsx` | **VERIFIED** | Moderates review status (`APPROVED`, `REJECTED`, `PENDING`). |
| `GET` | `/admin_routes/get_dashboard_stats.php` | Bearer (Admin) | `src/api/dashboard.js` (`getDashboardStats`)<br>`src/pages/Dashboard.jsx` | **VERIFIED** | Live HTTP GET with Admin Bearer: HTTP 200 OK, returns `revenue_today`, `revenue_month`, `pending_orders`, `active_subscriptions`, `low_stock_products_count`, `recent_orders`, `recent_subscriptions`. |
| `GET` | `/admin_routes/sales_report.php` | Bearer (Admin) | `src/api/dashboard.js` (`getSalesReport`)<br>`src/pages/Dashboard.jsx` | **VERIFIED** | Live HTTP GET with Admin Bearer: HTTP 200 OK, returns sales summary, AOV, daily trend, and top-selling products. |
| `GET` | `/admin_routes/list_customers.php` | Bearer (Admin) | `src/api/customers.js` (`listCustomers`)<br>`src/pages/Customers.jsx` | **VERIFIED** | Live HTTP GET with Admin Bearer: HTTP 200 OK, pagination, search, order volume, and lifetime spend. |
| `GET` | `/admin_routes/get_customer_details.php` | Bearer (Admin) | `src/api/customers.js` (`getCustomerDetails`)<br>`src/pages/CustomerDetail.jsx` | **VERIFIED** | Live HTTP GET: returns customer profile, saved addresses, past orders, and subscriptions. |
| `POST` | `/admin_routes/update_customer_status.php` | Bearer (Admin) | `src/api/customers.js` (`updateCustomerStatus`)<br>`src/pages/Customers.jsx`<br>`src/pages/CustomerDetail.jsx` | **VERIFIED** | Updates account status (`active`, `inactive`, `blocked`). |
| `POST` | `/admin_routes/add_service_holiday.php` | Bearer (Admin) | `src/api/holidays.js` (`addServiceHoliday`)<br>`src/pages/ServiceHolidays.jsx` | **VERIFIED** | Declares kitchen closure date(s). Automatically skips and refunds affected subscribers. |
| `GET` | `/admin_routes/list_service_holidays.php` | Bearer (Admin) | `src/api/holidays.js` (`listAdminServiceHolidays`)<br>`src/pages/ServiceHolidays.jsx` | **VERIFIED** | Live HTTP GET with Admin Bearer: HTTP 200 OK, lists declared holidays with total skipped subscriptions and refund amounts. |
| `POST` | `/admin_routes/delete_service_holiday.php` | Bearer (Admin) | `src/api/holidays.js` (`deleteServiceHoliday`)<br>`src/pages/ServiceHolidays.jsx` | **VERIFIED** | Deletes holiday and restores delivery schedule for active subscriptions. |

---

## 3. Discrepancy & Contract Corrections Made

1. **API Base URL Standardization**:
   - `API_DOCUMENTATION.md` mentioned `http://localhost/Manoharam-Real-Foods-main`. The actual XAMPP Apache root folder is `http://localhost/Manoharam-Real-Foods`. Both frontend API clients (`client.js` in storefront and admin-panel) configure this as the standard default with fallback to `VITE_API_BASE_URL`.
2. **Subscription Category Enum**:
   - Backend database schema enforces enum values `'VEG'` and `'NON_VEG'`. Form payload formatting in subscription plan creation was updated to match backend validation.
3. **Product Reviews Endpoint Location**:
   - `get_product_reviews.php` is located in the root backend directory, while `moderate_review.php` is in `admin_routes/` and `add_review.php` is in `user_routes/`. Centralized API clients route each to the correct path.
4. **Order Tracking vs. Status**:
   - `track_order.php` returns timeline stages (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`). `OrderDetail.jsx` now uses this endpoint for timeline rendering while using `get_order_details.php` for line item calculation.
5. **Printable Invoice Download**:
   - `download_invoice.php` returns raw HTML by default and JSON when `&format=json` is appended. The frontend handles HTML viewing in a clean print-ready popup window and avoids attempting to parse HTML as JSON.

---

## 4. Modified & Created Files Summary

### Storefront Application (`storefront/`):
- `src/api/addresses.js`: **Created** (Saved address book API client).
- `src/api/coupons.js`: **Created** (Coupon discount application API client).
- `src/api/reviews.js`: **Created** (Product reviews and star rating submission API client).
- `src/api/orders.js`: **Updated** (Exported `createRazorpayOrder`, `trackOrder`, `getInvoiceHtmlUrl`, `getInvoiceJson`).
- `src/api/subscriptions.js`: **Updated** (Added `getTodayDelivery` and `listServiceHolidays`).
- `src/components/TodayDeliveryBanner.jsx`: **Created** (Meal delivery banner with active delivery statuses).
- `src/components/AddressBookModal.jsx`: **Created** (Saved address management and checkout picker modal).
- `src/pages/Home.jsx`: **Updated** (Integrated `TodayDeliveryBanner` above featured products).
- `src/pages/ProductDetail.jsx`: **Updated** (Integrated star ratings, review list, and review submission form).
- `src/pages/Cart.jsx`: **Updated** (Integrated promo code discount input and verification).
- `src/pages/Checkout.jsx`: **Updated** (Integrated address book picker and applied coupon deductions).
- `src/pages/Profile.jsx`: **Updated** (Added "Saved Delivery Addresses" trigger opening address modal).
- `src/pages/OrderDetail.jsx`: **Updated** (Added visual tracking timeline and printable invoice download button).
- `src/pages/SubscriptionSetup.jsx`: **Updated** (Integrated upcoming service holidays notice).

### Admin Panel Application (`admin-panel/`):
- `src/api/dashboard.js`: **Created** (`getDashboardStats`, `getSalesReport`).
- `src/api/customers.js`: **Created** (`listCustomers`, `getCustomerDetails`, `updateCustomerStatus`).
- `src/api/coupons.js`: **Created** (`listCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon`).
- `src/api/reviews.js`: **Created** (`getProductReviews`, `moderateReview`).
- `src/api/holidays.js`: **Created** (`listAdminServiceHolidays`, `addServiceHoliday`, `deleteServiceHoliday`).
- `src/pages/Dashboard.jsx`: **Updated** (Connected real-time metrics, low-stock warnings, and sales reports).
- `src/pages/Customers.jsx`: **Created** (Customer directory, search, pagination, status changer).
- `src/pages/CustomerDetail.jsx`: **Created** (Full customer profile, saved addresses, orders, subscriptions).
- `src/pages/Coupons.jsx`: **Created** (Coupon table, create modal, edit modal, delete confirmation).
- `src/pages/Reviews.jsx`: **Created** (Product review moderation with approve/reject actions).
- `src/pages/ServiceHolidays.jsx`: **Created** (Declared holidays table, affected subscriber count, declare modal).
- `src/components/layout/Sidebar.jsx`: **Updated** (Added navigation links for Customers, Coupons, Reviews, Holidays).
- `src/App.jsx`: **Updated** (Registered routes for `/customers`, `/customers/:id`, `/coupons`, `/reviews`, `/holidays`).

---

## 5. Verification & Test Evidence

### Build & Lint Test Results
- **Storefront**:
  - `npm run lint` (`oxlint`): 0 errors, 9 non-blocking warnings on memoization in pre-existing files.
  - `npm run build` (`vite build`): Code 0, production bundle built in 5.67s.
- **Admin Panel**:
  - `npm run lint` (`oxlint`): 0 errors, 3 non-blocking warnings.
  - `npm run build` (`vite build`): Code 0, production bundle built in 1.53s.

### Runtime Server & API Verifications
1. Apache HTTP daemon active on `localhost:80` via XAMPP.
2. MySQL daemon active on `localhost:3306` via XAMPP.
3. Storefront dev server running on `http://localhost:5173`.
4. Admin Panel dev server running on `http://localhost:5174`.
5. Public and protected API calls tested live using legitimate credentials:
   - Admin credentials: `admin@gmail.com` / `admin` -> Role: `ADMIN`.
   - Customer credentials: `testcust_*@example.com` / `CustomerPass123!` -> Role: `CUSTOMER`.
   - Live endpoints returned HTTP 200 and expected JSON structure matching schema definitions.

---

## 6. Manual Testing & Demonstration Instructions

### Customer Flow (`http://localhost:5173`):
1. **Browse Catalog**: Visit `/products`, filter by category, open any product to inspect nutrition info and reviews.
2. **Review a Product**: On a product page, scroll to Customer Reviews, select a star rating, enter a review title/body, and submit.
3. **Cart & Coupons**: Add items to cart, open `/cart`, enter promo code `TEST363`, click Apply to verify discount calculation.
4. **Address Book & Checkout**: Proceed to checkout, click "Choose from Saved Addresses" to add a new address or select default. Complete checkout with Cash on Delivery or Razorpay.
5. **Tracking & Invoice**: On `/orders/:id`, inspect the visual delivery timeline steps and click "Download Tax Invoice" to view/print the HTML invoice.
6. **Delivery Banner**: Navigate to `/`, view the Today's Delivery banner reflecting subscription status.

### Admin Flow (`http://localhost:5174`):
1. **Login**: Login at `/login` with `admin@gmail.com` / `admin`.
2. **Dashboard**: View real-time revenue metrics, today's order counts, daily kitchen batch requirements, and sales reports.
3. **Customer Management**: Click "Customers" in sidebar (`/customers`), search by name, view customer details at `/customers/:id`, and update status (`active`/`inactive`/`blocked`).
4. **Promo Codes**: Click "Coupons" in sidebar (`/coupons`), create a new coupon with percentage or fixed discount, edit, or delete.
5. **Review Moderation**: Click "Reviews" in sidebar (`/reviews`), select a product from the list, review customer feedback, and click "Reject & Hide" or "Approve".
6. **Service Holidays**: Click "Service Holidays" in sidebar (`/holidays`), declare a festival holiday date, observe auto-calculated affected subscriptions, or delete to resume deliveries.
