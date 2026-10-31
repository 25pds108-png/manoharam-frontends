# Manoharam Real Foods — Admin Panel UI/UX Reverse Engineering & Design Specification

> **Document Status**: Production Reverse-Engineered Specification  
> **Source Repository**: `admin-panel/`  
> **Target Audience**: Full-Stack Engineers, System Administrators, Operations Leads, AI Agents  
> **Application Role**: Internal Operational Control & Enterprise Kitchen Dispatch Management  

---

## 1. Admin Application Overview

### 1.1 Purpose of the Admin Panel
The **Manoharam Real Foods Admin Panel** is a centralized operational back-office application. It empowers kitchen managers, fulfillment coordinators, inventory managers, customer support leads, and company administrators to run daily operations:
- **Kitchen Dispatch & Batch Preparation**: Daily subscriber route calculation, pack portioning, and delivery sequencing.
- **Recipe & Inventory Engine**: Artisanal batch tracking with manufacturing/expiry dates, low-stock threshold triggers, recipe scaling calculator, and raw ingredient stock levels.
- **Subscription Lifecycle Administration**: Reviewing customer meal plan requests, approving or rejecting subscriptions, pausing/resuming deliveries, and scheduling company-wide service holidays with automated refund calculations.
- **Catalog Management**: Creation and editing of products, subscription-only delicacies, multi-product subscription meal rotations, and dynamic image uploading.
- **Customer CRM & Order Tracking**: Order status progression (`CONFIRMED` → `OUT_FOR_DELIVERY` → `DELIVERED`), invoice generation, customer directory, account status moderation (`active` / `inactive` / `blocked`), coupon campaign configuration, and customer review moderation.

### 1.2 Intended Users
- **Head Chefs & Kitchen Supervisors**: Monitor daily dispatch portions, scale recipes for mass batch preparation, and audit expiring inventory batches.
- **Operations & Delivery Leads**: Assign deliveries, verify addresses, track driver dispatch routes, and declare service holidays.
- **Store Administrators & Merchandisers**: Upload product photos, manage pricing, publish seasonal meal plan rotations, configure promotional discount coupons, and moderate incoming reviews.

### 1.3 Admin Navigation & Layout Architecture
The Admin Panel utilizes a persistent two-tier fixed frame layout:
- **Global Topbar (`Topbar.jsx`)**:
  - Full-width sticky red bar (`h-16 bg-chili-500 px-6 fixed top-0 inset-x-0 z-40`).
  - Features circular monogram `"M"` inside cream badge, brand title `"Manoharam Real Foods"`, and subtitle `"Admin panel"`.
- **Vertical Sidebar (`Sidebar.jsx`)**:
  - Fixed left sidebar below the topbar (`w-64 fixed left-0 top-16 inset-y-0 z-30 bg-white border-r border-cream-300`).
  - Houses 10 primary navigation links with Lucide icons.
  - Bottom user profile pill with initials avatar, admin name, admin email, and quick logout button.
- **Main Viewport Canvas (`DashboardShell.jsx`)**:
  - Offset by `ml-64` (margin-left: 256px) and `pt-24` (padding-top: 96px) to avoid overlapping the fixed topbar and sidebar.
  - Page container bounded to `max-w-6xl mx-auto px-8 py-8`.
  - Base canvas background: Warm Parchment (`bg-[#FAF6EC]`).

### 1.4 Route Protection & Authentication
- Managed by `RequireAuth.jsx` wrapped inside `react-router-dom` `<Outlet />`.
- Unauthenticated requests are immediately bounced to `/login` with location redirect retention.
- Authentication tokens (`admin_token`) and user sessions are held in `localStorage` and dispatched via HTTP Bearer headers.

---

## 2. Complete Admin Design System & Tokens

### 2.1 Admin Colour Palette
Extracted directly from `admin-panel/src/index.css` (`@theme` block) and component classes:

| Token Name | Exact HEX | RGB Value | Usage in Admin Panel |
| :--- | :--- | :--- | :--- |
| `--color-chili-50` | `#FDECEC` | `rgb(253, 236, 236)` | Active sidebar navigation item background, delete modal tint |
| `--color-chili-100` | `#FAD2D2` | `rgb(250, 210, 210)` | Danger badge border, soft card alert outline |
| `--color-chili-200` | `#F2A4A4` | `rgb(242, 164, 164)` | Muted alert borders |
| `--color-chili-300` | `#E67878` | `rgb(230, 120, 120)` | Highlight rings |
| `--color-chili-400` | `#D94F4F` | `rgb(217, 79, 79)` | Form input active border (`focus:border-chili-400`) |
| `--color-chili-500` | `#C1272D` | `rgb(193, 39, 45)` | **Topbar Background**, Primary Action Buttons (`bg-chili-500`), Active Navigation Text |
| `--color-chili-600` | `#A31F25` | `rgb(163, 31, 37)` | Button hover state, primary revenue text |
| `--color-chili-700` | `#84181D` | `rgb(132, 24, 29)` | High-contrast danger headlines |
| `--color-chili-800` | `#651216` | `rgb(101, 18, 22)` | Deep red contrast borders |
| `--color-chili-900` | `#470C0F` | `rgb(71, 12, 15)` | Dropdown shadow tint |
| `--color-cream-50` | `#FFFDF8` | `rgb(255, 253, 248)` | Subdued card surface, Topbar logo text (`text-cream-50`) |
| `--color-cream-100` | `#FAF6EC` | `rgb(250, 246, 236)` | **Global Admin Canvas Background**, table hover row bg |
| `--color-cream-200` | `#F3ECDB` | `rgb(243, 236, 219)` | Table header dividers, avatar circular backgrounds |
| `--color-cream-300` | `#E9DEC4` | `rgb(233, 222, 196)` | **Admin Card & Input Border Standard** |
| `--color-cream-400` | `#D8C7A3` | `rgb(216, 199, 163)` | Muted horizontal lines |
| `--color-ink-900` | `#241914` | `rgb(36, 25, 20)` | **Primary Admin Text**, Headings, Table Cell Data |
| `--color-ink-700` | `#463530` | `rgb(70, 53, 48)` | Secondary table headers, sidebar inactive text, labels |
| `--color-ink-500` | `#6E5C55` | `rgb(110, 92, 85)` | PageHeader description, helper text, empty states |
| `--color-ink-300` | `#A6968F` | `rgb(166, 150, 143)` | Input placeholders, inactive chevrons, timestamps |
| `--color-success-500`| `#2E7D32` | `rgb(46, 125, 50)` | Active status badge text, Delivered orders, Completed tasks |
| `--color-success-100`| `#E3F1E4` | `rgb(227, 241, 228)` | Active status badge background |
| `--color-warning-500`| `#C77700` | `rgb(199, 119, 0)` | Pending order status, Out for delivery, Inactive customer |
| `--color-warning-100`| `#FBF0DC` | `rgb(251, 240, 220)` | Pending status badge background |
| `--color-danger-500` | `#C1272D` | `rgb(193, 39, 45)` | Cancelled status, Blocked customer, Delete buttons |
| `--color-danger-100` | `#FDECEC` | `rgb(253, 236, 236)` | Cancelled status badge background |

---

### 2.2 Typography Specification

```css
Display & Editorial Font: 'Fraunces', serif;
Data & User Interface Font: 'Inter', system-ui, sans-serif;
```

| Hierarchy Level | Font Family | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title H1** | Fraunces | `24px` (`text-2xl`) | 600 (Semibold) | `-0.015em` | `PageHeader.jsx`, modal titles |
| **Card Header H2**| Fraunces | `18px` (`text-lg`) | 600 (Semibold) | `-0.01em` | Section headers within cards |
| **Card Header H3**| Fraunces | `16px` (`text-base`) | 600 (Semibold) | Normal | Sub-group headers |
| **KPI Metrics** | Fraunces | `28px` (`text-3xl`) | 600 (Semibold) | Normal | Dashboard revenue numbers, counts |
| **Table Header** | Inter | `12px` (`text-xs`) | 600 (Semibold) | `+0.05em` | Table `<th>`, uppercase tracking |
| **Table Cell Data**| Inter | `14px` (`text-sm`) | 400 / 500 | Normal | Primary table rows, customer names |
| **Table Subtext** | Inter | `12px` (`text-xs`) | 400 (Regular) | Normal | Phone numbers, category metadata |
| **Form Labels** | Inter | `14px` (`text-sm`) | 500 (Medium) | Normal | `<Field>` label text |
| **Form Inputs** | Inter | `14px` (`text-sm`) | 400 (Regular) | Normal | Form inputs, select dropdowns |
| **Status Badge** | Inter | `12px` (`text-xs`) | 600 (Semibold) | Normal | Pill status badges |

---

### 2.3 Layout, Borders & Radius Standards

```css
--radius-card: 1.25rem (20px);
--radius-pill: 999px (full capsule);
```

- **Sidebar Dimensions**: Fixed width `256px` (`w-64`), full viewport height offset by `64px` topbar (`top-16`).
- **Topbar Dimensions**: Full viewport width (`w-full`), fixed height `64px` (`h-16`).
- **Card Standard**: `rounded-2xl border border-cream-300 bg-white` (`rounded-card`).
- **Input Field Standard**: `rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400`.
- **Primary Button Standard**: `rounded-xl bg-chili-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-chili-600 disabled:opacity-50`.
- **Secondary / Ghost Button**: `rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100`.
- **Table Standard**: `w-full text-left text-sm divide-y divide-cream-100`, header `border-b border-cream-200`.

---

## 3. Admin Page-by-Page Documentation

The Admin Panel implements **18 distinct pages / operational views**:

```
1.  /login                        -> Login.jsx
2.  /                             -> Dashboard.jsx
3.  /products                     -> Products.jsx
4.  /products/:id                 -> ProductDetail.jsx
5.  /recipes                      -> Recipes.jsx
6.  /orders                       -> Orders.jsx
7.  /orders/:id                   -> OrderDetail.jsx
8.  /subscriptions                -> Subscriptions.jsx
9.  /subscriptions/:id            -> SubscriptionDetail.jsx (Customer Subscription)
10. /subscriptions/plans/:planId  -> DetailSubscription.jsx (Meal Plan Master)
11. /inventory                    -> Inventory.jsx
12. /inventory/:productId         -> InventoryDetail.jsx
13. /customers                    -> Customers.jsx
14. /customers/:id                -> CustomerDetail.jsx
15. /coupons                      -> Coupons.jsx
16. /reviews                      -> Reviews.jsx
17. /holidays                     -> ServiceHolidays.jsx
18. [Standalone Module]           -> Ingredients.jsx (Integrated tab in Recipes)
```

---

### PAGE 1: Admin Login (`/login`)
- **Source File**: `admin-panel/src/pages/Login.jsx`
- **Route**: `/login`
- **Authentication**: Public entry point for administrators

#### Layout & Visual Structure:
1. Full viewport centering container (`min-h-screen bg-cream-100 flex items-center justify-center px-6`).
2. Card Box (`w-full max-w-sm`):
   - Monogram Header: Circular emblem (`h-12 w-12 bg-chili-500 text-cream-50 font-display text-xl`) with letter `"M"`.
   - Title: `"Manoharam Real Foods"`, subtitle `"Admin panel"`.
   - Heading H1: `"Welcome back"`.
   - Description: `"Sign in with your admin account to continue."`.
   - Form Fields:
     - `Email`: `admin@example.com`, required input.
     - `Password`: `••••••••`, required password input.
   - Error Alert Box (if unauthorized): Red banner displaying `"Invalid email or password"`.
   - Button: Full-width `"Sign in"` button with loading indicator.

---

### PAGE 2: Operations Dashboard & Analytics (`/`)
- **Source File**: `admin-panel/src/pages/Dashboard.jsx`
- **Route**: `/`
- **Parent Layout**: `<DashboardShell>`

#### Layout & Visual Structure:
1. **Page Header**: `"Dashboard & Analytics"`, description `"Real-time operations, revenue metrics, and kitchen dispatches."`.
2. **KPI Metrics Grid (4 Cards)**:
   - **Card 1: Revenue Today**:
     - Metric: `₹{revenue_today}` in `text-3xl text-chili-500 font-display`.
     - Subtitle: `"This month: ₹{revenue_month}"`.
   - **Card 2: Pending Orders**:
     - Metric: `{pending_orders}` in `text-3xl text-ink-900`.
     - Subtitle: `"Today's orders: {orders_today}"`.
   - **Card 3: Active Subscriptions**:
     - Metric: `{active_subscriptions}` in `text-3xl text-forest-600`.
     - Subtitle: `"Subscribers receiving daily meals"`.
   - **Card 4: Total Customers & Inventory Alert**:
     - Metric: `{total_customers}` in `text-3xl text-ink-900`.
     - Subtitle: Low stock warning indicator (e.g. `"{N} low-stock items"` or `"Inventory levels optimal"`).
3. **Sales Analytics & Top Products Module**:
   - Date range selector: `Start Date` and `End Date` inputs.
   - Summary KPIs: `"Total Orders in Period"`, `"Total Net Revenue"`, `"Average Order Value (AOV)"`.
   - **Top Selling Products Table**:
     - Columns: `Product Name`, `Category`, `Units Sold` (aligned right), `Product Revenue` (aligned right in bold crimson).
4. **Kitchen Production & Daily Dispatch Module**:
   - Live dispatch date picker: Select any calendar date.
   - **Kitchen Prep Requirements Breakdown**:
     - Grid of recipe portion cards showing product name, pack portion size (`250 g`), and bold badge (`"{N} packs"`).
   - **Deliveries to Dispatch Table**:
     - Columns: `Customer`, `Phone`, `Salad to Deliver` (with thumbnail and portion size), `Address`, `Subscription` (link to `#{subscription_id}`).
5. **Recent Activity Two-Column Grid**:
   - **Left Column: Recent Orders**:
     - Lists last 5 orders with ID, customer name, status badge, amount, and link to `/orders/:id`.
   - **Right Column: Recent Subscriptions**:
     - Lists last 5 subscription registrations with customer name, plan name, status badge, and link to `/subscriptions/:id`.

---

### PAGE 3: Products Catalog Management (`/products`)
- **Source File**: `admin-panel/src/pages/Products.jsx`
- **Route**: `/products`

#### Layout & Visual Structure:
1. **Page Header**: `"Products"`, description `"Salads, pickles, and masalas on the storefront menu."`.
2. **Action Header Buttons**:
   - Button 1: `"Create subscription"` (opens `CreateSubscriptionModal`).
   - Button 2: `"+ New product"` (opens New Product creation modal).
3. **Products Grid**:
   - Cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Card displays: Product image (`h-36 w-full object-cover`), product name, status badge, `"Subscription Only"` badge (if flagged), category, selling price (`₹{price}` or `"Plan-only"`), pack weight (`250 g`).
   - Clicking a card navigates to `/products/:id`.
4. **"New Product" Modal**:
   - Inputs: Name, Category, Quantity, Unit (`g` / `kg`).
   - `"Subscription-Only Product"` checkbox: Toggles off direct cart sales; makes selling price optional.
   - Selling Price input (required for regular products).
   - Description textarea.
   - **Product Image File Upload Control**: File picker (`accept="image/*"`) with instant live image preview thumbnail, file name, and file size in KB.
   - Status dropdown (`ACTIVE` / `INACTIVE`).
   - **"Make this salad subscribable" Inline Toggle**:
     - Allows creating a linked subscription plan simultaneously: Plan name, Category (`VEG` / `NON_VEG`), Price per week.
5. **"Create Subscription" Standalone Modal (`CreateSubscriptionModal`)**:
   - Allows constructing multi-item meal plans: Name, Category (`VEG` / `NON_VEG`), Price per week, Description, Status, Image file upload.
   - **Rotation Sequence Builder**: Select existing products from catalog, click `"Add product"`, and re-order delivery sequence using Up/Down arrow buttons.

---

### PAGE 4: Product Detail & Editing (`/products/:id`)
- **Source File**: `admin-panel/src/pages/ProductDetail.jsx`
- **Route**: `/products/:id`

#### Layout & Visual Structure:
1. Navigation bar with `"← Back to products"` link, `"Edit product"` button, and `"Deactivate"` button.
2. **Left Column (2 cols)**:
   - Full product image (`h-56 w-full rounded-xl object-cover`).
   - Product name H1, status badge, category, selling price, unit size.
   - Description copy.
3. **Right Column (1 col) — Actions & Metadata**:
   - Deactivation modal dialog: Confirms deactivation without deleting database relations.
4. **Edit Product Modal**:
   - Pre-populates existing name, category, quantity, unit, price, subscription-only flag, description, and status.
   - Image replacement input: Uploading a new file updates the image path on backend; leaving blank retains existing image.

---

### PAGE 5: Recipes & Ingredients Manager (`/recipes`)
- **Source File**: `admin-panel/src/pages/Recipes.jsx`
- **Route**: `/recipes`

#### Layout & Visual Structure:
1. **Page Header**: `"Recipes & Ingredients"`, description `"Build recipes from your ingredient library, then scale them for batch production."`.
2. **Tab Switcher Pill**:
   - Tab 1: `Recipes` (ChefHat icon).
   - Tab 2: `Ingredients` (Wheat icon).
3. **Tab 1 — Recipes Feed**:
   - Cards displaying recipe name, linked product name, yield quantity (`500 g`), preparation time (`45 mins`), and ingredients count.
   - **Action Buttons on Each Recipe Card**:
     - **Scale (Calculator icon)**: Opens `CalculateRecipeModal` — allows typing in target yield (e.g. `10 kg`) and outputs exact required weights for every ingredient.
     - **View (Eye icon)**: Opens full recipe modal with step-by-step kitchen instructions and nutritional summary.
     - **Edit (Pencil icon)**: Opens recipe editor modal.
     - **Delete (Trash icon)**: Deletes recipe record.
   - **"New Recipe" Modal**:
     - Recipe Name, Linked Product dropdown, Base Yield quantity & unit, Preparation Time.
     - Instructions textarea.
     - Multi-Row Dynamic Ingredients Builder: Add ingredient row, select from ingredient catalog, enter quantity, and remove row.
4. **Tab 2 — Ingredients Catalog (`IngredientsTab`)**:
   - Table of all raw pantry ingredients: Name, Unit (`g`, `kg`, `ml`, `l`, `pcs`), Cost per unit, Current stock, Minimum threshold.
   - Create Ingredient Modal: Name, unit, unit cost, starting stock, low stock alert limit.
   - Edit Ingredient Modal & Delete confirmation dialog.

---

### PAGE 6: Orders Management (`/orders`)
- **Source File**: `admin-panel/src/pages/Orders.jsx`
- **Route**: `/orders`

#### Layout & Visual Structure:
1. **Page Header**: `"Orders"`, description `"All customer orders."`.
2. **Orders Master Table**:
   - Columns:
     - `Order`: Order ID in crimson (`#1042`).
     - `Customer`: Customer name.
     - `Date`: Formatted date (`14 Oct 2026`).
     - `Total`: Formatted total (`₹540`).
     - `Status`: Colored Badge (`toneForStatus`).
   - Interactive Behavior: Entire row is clickable with hover effect (`hover:bg-cream-50`), navigating to `/orders/:id`.
3. Cursor-based pagination: `"Load more"` button.

---

### PAGE 7: Order Detail & Status Transition (`/orders/:id`)
- **Source File**: `admin-panel/src/pages/OrderDetail.jsx`
- **Route**: `/orders/:id`

#### Layout & Visual Structure:
1. Back button to `/orders`.
2. **Left Column (2 cols)**:
   - Order Header Card: Order ID, Date & Time, Status Badge.
   - Ordered Items List: Product thumbnail, name, unit quantity, unit price, line total, and grand total.
3. **Right Column (1 col)**:
   - Customer Details Card: Name, Email, Phone, Delivery Address.
   - **Status Transition Card**:
     - If status is `DELIVERED` or `CANCELLED`: Displays locked notice: `"This order is delivered/cancelled and can no longer be modified."`
     - Otherwise: Status selector dropdown with allowed transitions (`CONFIRMED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and `"Update status"` button.

---

### PAGE 8: Subscriptions Hub (`/subscriptions`)
- **Source File**: `admin-panel/src/pages/Subscriptions.jsx`
- **Route**: `/subscriptions`

#### Layout & Visual Structure:
1. **Page Header**: `"Subscriptions"`, description `"Salad subscriptions — manage which salads are subscribable, and review customer sign-ups."`.
2. **Action Button**: `"+ New plan"`.
3. **Tab Switcher Pill**:
   - Tab 1: `Subscribers` (Users icon).
   - Tab 2: `Plans` (Sparkles icon).
4. **Tab 1 — Subscribers Table**:
   - Columns: `Customer` (name + phone), `Salad / Plan` (product name + plan name), `Dates` (start date – end date), `Status` (Badge), `Actions` (`"View"` link to `/subscriptions/:id`).
5. **Tab 2 — Master Plans Grid**:
   - Cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
   - Plan image (`h-32 w-full object-cover`), plan name, category pill (`VEG` / `NON_VEG`), status badge, salad rotation summary (e.g. `Garden Salad → Sprout Bowl → Fruit Salad`), price per week, number of salads in rotation.
   - Clicking card navigates to `/subscriptions/plans/:planId`.
6. **"Create Plan" Modal (`CreatePlanModal`)**:
   - Multi-salad rotation creator with image upload and re-orderable product sequence.

---

### PAGE 9: Customer Subscription Inspection (`/subscriptions/:id`)
- **Source File**: `admin-panel/src/pages/SubscriptionDetail.jsx`
- **Route**: `/subscriptions/:id`

#### Layout & Visual Structure:
1. Back button to `/subscriptions`.
2. **Left Column (2 cols)**:
   - Subscription Header Card: Subscription ID, Status Badge, Date Range, Duration (`{weeks} weeks`), Total Amount, Weekend exclusion rules.
   - Rotation Delicacies Card: Products list with thumbnails, sequence numbers, pack sizes, and complete nutritional stats.
   - Master Plan Info: Plan name, weekly price, category, description.
   - Delivery Schedule Table: Complete sequence of assigned delivery dates and scheduled delicacies.
   - Skipped Deliveries Log: Dates skipped by customer or service holidays, skip type (`CUSTOMER_SKIP` / `SERVICE_HOLIDAY`), reason, and refund credit.
3. **Right Column (1 col)**:
   - Customer Details Card: Name, Email, Phone, Address.
   - **Approval & Moderation Actions**:
     - If status is `PENDING`: Displays `"Approve subscription"` (green button) and `"Reject subscription"` (red outlined button).
     - Rejection modal: Prompts for rejection reason.
     - Manual Status Override dropdown: Allows setting status to `ACTIVE`, `COMPLETED`, `CANCELLED`.

---

### PAGE 10: Master Plan Details & Editing (`/subscriptions/plans/:planId`)
- **Source File**: `admin-panel/src/pages/DetailSubscription.jsx`
- **Route**: `/subscriptions/plans/:planId`

#### Layout & Visual Structure:
1. Plan Hero Card: Plan image (`h-56 w-full rounded-xl object-cover`), plan name, status badge, category, weekly price, description.
2. Salads in Rotation Card: Sequence list with delivery order numbers, product thumbnails, names, portion sizes, and calorie counts.
3. Actions Card: `"Edit Plan"` button opening modal to update title, category, weekly price, description, status, image, and rotation products.

---

### PAGE 11: Inventory & Stock Auditing (`/inventory`)
- **Source File**: `admin-panel/src/pages/Inventory.jsx`
- **Route**: `/inventory`

#### Layout & Visual Structure:
1. **Page Header & Tabs**:
   - Tab 1: `All stock`
   - Tab 2: `Low stock`
   - Tab 3: `Expiring soon`
2. **Tab 1 — All Stock Table**:
   - Columns: `Product` (name + pack size), `Category`, `Batches` (count), `Total` (units produced), `Remaining` (units in stock), `Status`.
   - Zero stock highlighted in crimson text.
   - Clicking row navigates to `/inventory/:productId`.
3. **Tab 2 — Low Stock Auditor**:
   - Threshold input: `"Remaining at or below: [10]"`.
   - Action Button: `"Check low stock"` (triggers backend low stock check).
   - Results Table: Lists items at or below threshold.
4. **Tab 3 — Expiring Soon Auditor**:
   - Days ahead input: `"Days ahead: [30]"`.
   - Action Button: `"Check expiring batches"`.
   - Results Table: Batch number, product, expiry date, days remaining, units left.

---

### PAGE 12: Product Batch Inventory Detail (`/inventory/:productId`)
- **Source File**: `admin-panel/src/pages/InventoryDetail.jsx`
- **Route**: `/inventory/:productId`

#### Layout & Visual Structure:
1. Product title, category, pack size, status, and `"+ Add batch"` button.
2. **Summary KPI Cards (3 Cards)**:
   - `Batches`: Total batches created.
   - `Total produced`: Lifetime units cooked.
   - `Remaining`: Current available physical units.
3. **Batches Table**:
   - Columns: `Batch #`, `Produced`, `Remaining`, `Manufactured`, `Expires`, `Actions` (`Edit` button).
4. **Create / Edit Batch Modal**:
   - Inputs: Batch Number (`batch_no`), Manufactured Date (`YYYY-MM-DD`), Expiry Date (`YYYY-MM-DD`), Initial Quantity.

---

### PAGE 13: Customer Directory & CRM (`/customers`)
- **Source File**: `admin-panel/src/pages/Customers.jsx`
- **Route**: `/customers`

#### Layout & Visual Structure:
1. **Search & Filter Bar**:
   - Search input: `"Search by name, email, or phone…"` with Search button.
   - Total customer counter: `"Total customers: {N}"`.
2. **Customers Table**:
   - Columns:
     - `Customer`: Avatar monogram + full name (links to `/customers/:id`).
     - `Contact`: Email + phone number.
     - `Orders`: Count of orders placed.
     - `Subscriptions`: Count of active/past subscriptions.
     - `Lifetime Spend`: Total spend (`₹{total_spent}` in bold crimson).
     - `Status`: Badge (`ACTIVE`, `INACTIVE`, `BLOCKED`).
     - `Actions`: Status modification dropdown (`active`, `inactive`, `blocked`).
3. Pagination controls: Previous / Next page arrows with current page index.

---

### PAGE 14: Customer Profile 360° View (`/customers/:id`)
- **Source File**: `admin-panel/src/pages/CustomerDetail.jsx`
- **Route**: `/customers/:id`

#### Layout & Visual Structure:
1. Customer full name H1, ID, registration date, status badge, and status modification dropdown.
2. **3-Column Overview Grid**:
   - **Personal Details Card (1 col)**: Full Name, Email, Phone, Primary Registration Address.
   - **Saved Delivery Addresses Card (2 cols)**: Grid of all saved address entries from customer's address book.
3. **Customer Orders History Card**:
   - Table of all orders placed by customer with date, items summary, amount, and status.
4. **Customer Subscriptions History Card**:
   - Table of all subscriptions with plan name, start/end dates, total amount, and status.

---

### PAGE 15: Coupon Engine & Promotions (`/coupons`)
- **Source File**: `admin-panel/src/pages/Coupons.jsx`
- **Route**: `/coupons`

#### Layout & Visual Structure:
1. **Page Header**: `"Coupons & Discounts"`, description `"Manage promo codes, seasonal discounts, and cart voucher rules."`.
2. **Action Button**: `"+ Create Coupon"`.
3. **Coupons Table**:
   - Columns: `Code` (bold mono badge), `Type` (`PERCENTAGE` / `FIXED`), `Discount Value` (`10%` / `₹50`), `Min Order` (`₹200`), `Max Discount` (`₹100`), `Validity Dates`, `Usage Limit` (`{used} / {limit}`), `Status` (Badge), `Actions` (`Edit` & `Delete`).
4. **Create / Edit Coupon Modal**:
   - **One-Click Presets Strip**:
     - `🎉 10% Off (Cap ₹100)`: `SAVE10`
     - `✨ 15% Festive Deal`: `FESTIVE15`
     - `🏷️ Flat ₹50 Off`: `FLAT50`
     - `🚚 Free Shipping / ₹30 Off`: `FREESHIP`
   - **3-Step Tab Wizard**:
     1. `Offer`: Coupon Code, Description, Discount Type (`PERCENTAGE` / `FIXED`), Discount Value.
     2. `Rules`: Minimum Order Amount, Maximum Discount Cap (for percentage discounts).
     3. `Dates & Limits`: Start Date, End Date, Usage Limit, Status.

---

### PAGE 16: Product Review Moderation (`/reviews`)
- **Source File**: `admin-panel/src/pages/Reviews.jsx`
- **Route**: `/reviews`

#### Layout & Visual Structure:
1. **Two-Column Layout (`lg:grid-cols-4`)**:
   - **Left Column (1 col) — Product Selection Drawer**:
     - Scrollable list of all products in catalog.
     - Selecting a product highlights it in `#FDECEC` and loads its customer reviews.
   - **Right Column (3 cols) — Reviews Feed & Moderation**:
     - Product Rating Card: Product title, 5-star visual average rating, published review count.
     - Reviews Feed:
       - Customer name, verified purchase badge, star rating, review headline, full text review, submission date.
       - Moderation Actions:
         - `"Approve"` button: Publishes review to public storefront.
         - `"Reject"` button: Hides review from storefront.

---

### PAGE 17: Service Holidays & Kitchen Closures (`/holidays`)
- **Source File**: `admin-panel/src/pages/ServiceHolidays.jsx`
- **Route**: `/holidays`

#### Layout & Visual Structure:
1. **Page Header**: `"Service Holidays & Kitchen Closures"`, description `"Declare dates when the kitchen is closed. Active subscriptions are automatically skipped and credited."`.
2. **Action Button**: `"+ Declare Holiday"`.
3. **Filter**: Month selector dropdown (`All months`, `October 2026`, etc.).
4. **Service Holidays Table**:
   - Columns: `Holiday Date`, `Day of Week`, `Occasion / Reason`, `Actions` (`Delete / Restore` trash icon).
5. **"Declare Service Holiday" Modal**:
   - Mode Toggle: `Single Date` or `Date Range` (Start Date to End Date).
   - **Quick Occasions Presets**:
     - `🪔 Diwali Festival`
     - `🌾 Pongal Festival`
     - `🎄 Christmas / New Year`
     - `🇮🇳 National Holiday`
     - `🛠️ Kitchen Deep Cleaning`
     - `🌧️ Weather / Heavy Rain`
   - Custom reason textarea.
   - Impact summary notice upon submission:
     `"Holiday declared successfully. {N} active subscriptions were automatically skipped and ₹{amount} in refunds credited."`

---

### PAGE 18: Ingredients Catalog (`Ingredients.jsx` Standalone / Embedded)
- **Source File**: `admin-panel/src/pages/Ingredients.jsx` (and embedded in `Recipes.jsx`)
- **Route**: Available as secondary tab within `/recipes` and direct module.

#### Layout & Visual Structure:
1. Table of pantry ingredients: Name, Unit, Unit Cost, Current Stock, Alert Limit.
2. Modal for creating and editing ingredient stock specifications.

---

## 4. Admin Reusable Component Catalogue

| Component Name | Source File | Key Props / Variants | Primary Purpose & Visual Design |
| :--- | :--- | :--- | :--- |
| **`DashboardShell`**| `components/layout/DashboardShell.jsx`| `children` | Core frame wrapper rendering fixed `Topbar`, fixed `Sidebar`, and content container (`ml-64 pt-24 px-8 py-8`). |
| **`Topbar`** | `components/layout/Topbar.jsx` | None | Fixed red bar (`h-16 bg-chili-500`) with circular monogram `"M"` and brand headline. |
| **`Sidebar`** | `components/layout/Sidebar.jsx` | None | Fixed vertical sidebar (`w-64`) with 10 primary navigation links, active states, and admin logout footer. |
| **`PageHeader`** | `components/layout/PageHeader.jsx` | `title`, `description`, `action` | Editorial Fraunces page title with optional subtext and action button slot. |
| **`Card`** | `components/ui/Card.jsx` | `className`, `children` | Rounded container with `--radius-card: 1.25rem` (20px), white background, and cream border. |
| **`Badge`** | `components/ui/Badge.jsx` | `tone` (`success`, `warning`, `danger`, `neutral`), `children` | Status capsule badge formatting statuses (`ACTIVE`, `PENDING`, `DELIVERED`, `CANCELLED`). |
| **`Button`** | `components/ui/Button.jsx` | `variant` (`primary`, `ghost`), `loading`, `disabled` | Primary red button (`bg-chili-500`) with loading spinner. |
| **`Field`** | `components/ui/Field.jsx` | `label`, `hint`, `as` (`input`, `select`, `textarea`), `...props` | Form field wrapper standardizing labels, inputs, and helper hints. |
| **`Modal`** | `components/ui/Modal.jsx` | `open`, `onClose`, `title`, `children`, `maxWidth` | Centered dialog overlay with dark backdrop (`bg-ink-900/40`), close `"X"` button, and scrollable container. |
| **`ProductImage`** | `components/ui/ProductImage.jsx` | `src`, `alt`, `category`, `className` | Dynamic backend image resolver with branded placeholder icon fallback. |
| **`ProductPlaceholder`**| `components/ui/ProductImage.jsx`| `alt`, `category`, `className` | Vector placeholder fallback for admin cards and tables. |
| **`useCursorList`** | `hooks/useCursorList.js` | `queryKey`, `queryFn`, `itemsKey` | Reusable infinite cursor pagination hook managing item lists, next cursors, and fetch states. |

---

## 5. Admin Interaction and Motion Specification

| Interaction | Trigger | Target Properties | Duration & Easing | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Sidebar Navigation** | Tap / Click | `background-color`, `color` | `150ms ease` | Active item gains `#FDECEC` background and `#C1272D` text |
| **Table Row Click** | Tap on row | `background-color` | `150ms ease` | Row highlights in `#FAF6EC` with pointer cursor |
| **Modal Entrance** | Trigger button | `opacity`, `transform` | `200ms ease-out` | Backdrop dims to 40% black; modal scales in smoothly |
| **Button Loading** | Submission | `opacity`, `cursor` | Instant | Button shows `"…"` or spinner and disables double-clicks |
| **Batch Expiry Alert** | Expiry date < 30 days | `color`, `font-weight` | Static visual | Cell text turns crimson `#C1272D` with warning badge |
| **Delivery Sequence Reorder**| Move Up / Down | DOM array index | Instant | Swap indices in state, immediately updating delivery sequence numbers |

---

## 6. Admin Error Handling and Application States

| Scenario | Displayed UI | Icon | Message / Notice | Recovery Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Login Failure** | Red alert banner | None | `"Invalid email or password"` | Re-enter credentials |
| **Unauthorized Session**| Auto redirect | None | Clears token and bounces to `/login` | Log in with active admin account |
| **Empty Table** | Centered card | `Package` or `Users` | `"No records found / create your first to get started"` | Create record via action button |
| **Image Upload Failure**| Red error text in modal | `AlertCircle` | Backend validation message | Re-select valid image file (< 2MB) |
| **Delete Confirmation** | Modal popup | `Trash2` / `AlertTriangle` | `"Are you sure you want to deactivate/delete this record?"` | Confirm or Cancel buttons |
| **Locked Order Status** | Subtext paragraph | None | `"This order is delivered/cancelled and can no longer be modified."` | Read-only state enforced |
| **Holiday Conflict** | Modal alert | `ShieldAlert` | Lists conflict error | Adjust holiday dates |

---

## 7. Responsive Behavior & Usability Findings

### 7.1 Desktop & Large Displays (1366px & 1920px)
- The layout is optimized for desktop and widescreen tablets:
  - Sidebar fixed at `256px` (`w-64`).
  - Topbar fixed at `64px` (`h-16`).
  - Content container spans up to `1152px` (`max-w-6xl`) with generous spacing.
  - Multi-column tables display all operational columns comfortably without horizontal scroll.

### 7.2 Narrow Tablets & Mobile Screens (375px, 390px, 768px)
- **Documented Usability Discrepancy**:
  - The current `Sidebar.jsx` implementation does not include a collapsible hamburger drawer for screens `< 768px`.
  - On mobile viewports (375px/390px), the sidebar remains fixed at `w-64` overlapping the main canvas or forcing horizontal scroll.
  - Tables utilize `overflow-x-auto` to allow horizontal swipe navigation on narrow screens.
  - Modals adapt to mobile screen dimensions with `max-w-sm` and `max-h-[90vh] overflow-y-auto`.
