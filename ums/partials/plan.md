

## Global UX / ERP Principles

Use a **shared layout** (like your Jassa template: sidebar + top navbar + content).

Common patterns across pages:

* **Top filter bar**: date range, building, status, search, quick actions.
* **Primary data table**: DataTables style with paging, column sort, column search, export buttons.
* **Right-side drawer / modal**: create/edit entities without leaving the page.
* **Summary cards**: small cards above the table with key KPIs.
* **Charts**: where it makes sense (forecast, performance, counts).
* **Icons**: Feather icons for semantic actions (edit, eye, trash, download, plus, etc.).
* **Messages**: inline alerts + toast-like notifications (success/error/info).

Assume:

* Every page reads/writes from API/Supabase later.
* All “create/edit” are **modals** or **drawers**, never separate full pages.
* All lists support **bulk actions** where logical.

---

# 1. Accommodation Module

### 1. accommodation-allocation.html

**Goal:** Allocate rooms to bookings with minimal clicks; prevent overbooking & conflicts.

**Layout:**

* **Top bar:**

  * Filters: Date range, Building, Floor, Booking type (Group / Individual), Status (Unallocated / Partially / Fully).
  * Buttons: “Auto-Allocate”, “Manual Allocate”, “Export Allocation”.
  * Icons: Info tooltip explaining allocation logic.

* **Main content: 2-column layout**

  * **Left: Bookings table**

    * Columns: SH No., Group/Tour Name, Pax (M/F/Child), Arrive/Depart, Priority, Allocation status, Actions.
    * Row actions: “Allocate”, “View details”, “Hold”.
    * Row badges for high priority / VIP groups.
  * **Right: Room availability grid**

    * Interactive grid by floor/room: color-coded states (vacant, partially filled, full, blocked, maintenance).
    * Hover tooltip: capacity, current occupants, notes.
    * Click room to select; click booking row to snap into allocation mode (master–detail).

* **Modals:**

  * “Allocate Booking”:

    * Form: Suggested rooms (auto-fill), manual room picker, split group options.
    * Buttons: “Apply”, “Apply & Next Booking”.
  * “Conflict details”: list of conflicts when allocation fails.

* **Charts / Cards:**

  * Top cards: “Total rooms”, “Rooms occupied”, “Rooms free today”, “Over-capacity alerts”.
  * Small bar chart: Rooms occupancy per building or floor.

---

### 2. accommodation-checkins-checkouts.html

**Goal:** Operational screen for live check-ins/check-outs.

**Layout:**

* **Top bar:**

  * Filters: Today / Date picker, Building, Status (Expected In, Checked In, Expected Out, Checked Out).
  * Buttons: “Bulk Check-in”, “Bulk Check-out”.

* **Tabs:** `Check-ins` | `Check-outs`

* **Check-ins tab:**

  * Table:

    * Columns: Time window, SH No., Guest / Group, Pax, Building/Room (planned), Status, Actions.
  * Quick action buttons in-row: Check-in (primary), Edit room, Print slip.
  * Inline icon for overbook / unpaid flags.

* **Check-outs tab:**

  * Similar table: Out time, Room, Outstanding dues, Housekeeping status indicator (dirty/clean/pending).

* **Modals:**

  * “Check-in Guest” form: confirm identity, room, collect key info, assign wristband/ID, notes.
  * “Check-out Summary”: stay summary, amounts, key return confirmation, flags (late checkout, damage).

* **Messages:**

  * Toasts on success/failure.
  * Warning banner if over-capacity or multiple pending check-outs.

---

### 3. accommodation-grid-layout.html

**Goal:** Visual building layout to see occupancy & jump to actions.

**Layout:**

* **Top bar:** Building selector, View: “Grid / Stack / Fullscreen”, Legend button.

* **Main content:**

  * Grid by floor:

    * Each room as **card** with:

      * Room No., capacity, current occupants.
      * Status color (occupied, free, reserved, maintenance, blocked).
      * Icons: bed (capacity), broom (housekeeping), wrench (maintenance).
    * Click card to open side drawer: full room details (current booking, upcoming reservations, notes).

* **Right panel (optional drawer):**

  * Room details: booking history list, quick actions: “Move guest”, “Mark maintenance”, “Mark cleaned”.

* **Modals:**

  * “Move guest to another room”
  * “Block/unblock room with reason”

* **Cards / Charts:**

  * Cards summarizing: “Occupancy % by building”, “Rooms under maintenance”.
  * Small pie chart: Room status distribution.

---

### 4. accommodation-housekeeping.html

**Goal:** Manage cleaning schedules, statuses, and staff assignments.

**Layout:**

* **Top bar:** Date, Building, Floor, Status filters (Dirty, In Progress, Clean), Housekeeper filter.

* **Main content:**

  * **Left: housekeeping schedule table**

    * Columns: Room, Guest/Group, Checkout date/time, Status, Assigned staff, Priority, Notes, Actions.
    * Row badges for rush/priority clean.
  * **Right: staff workload cards**

    * Each card: Staff name, total rooms, ETA, performance indicator.

* **Forms / Modals:**

  * “Assign rooms” modal: multi-select rooms + assignee.
  * “Update status” quick modal with status dropdown and comment.
  * “Report issue” modal (if housekeeper finds damage / missing items).

* **Messages:**

  * Inline alert if rooms overdue for cleaning.

---

### 5. accommodation-maintenance.html

**Goal:** Track room/building maintenance requests and status.

**Layout:**

* **Top bar:** Filters: Building, Severity, Status, Category (Plumbing, Electrical, Furniture, HVAC).

* **Main content:**

  * **Cards row:** Total open tickets, Critical issues, Avg resolution time.
  * **Table of maintenance tickets:**

    * Ticket ID, Room/Area, Issue summary, Category, Priority, Assigned to, Status, Open date, Actions.
  * **Right panel:** Maintenance calendar mini-view for scheduled tasks.

* **Modals / Forms:**

  * “New maintenance request” form (room selection autocomplete).
  * “Update ticket” modal: change status, add internal notes, upload photos.
  * “Close ticket” confirmation with resolution summary required.

* **Charts:**

  * Bar chart: Issues by category.
  * Line chart: Open vs closed by day/week.

---

### 6. accommodation-vacancy-forecast.html

**Goal:** Forecast vacancies & availability for planning.

**Layout:**

* **Top bar:** Date range, Building, View (Daily / Weekly / Monthly), Export.

* **Main content:**

  * **Top cards:** Forecasted occupancy %, Total expected arrivals/departures in range.
  * **Chart:** Area/line chart of occupancy over time.
  * **Table:**

    * Date, Rooms available, Rooms reserved, Expected arrivals, Expected departures, Overbooking risk flag.

* **Side widgets:**

  * “What if?” mini-form:

    * Inputs: add X new bookings / close Y rooms.
    * Button: Recalculate forecast → updates chart.

* **Messages:**

  * Inline risk warning if occupancy exceeds threshold on any day.

---

# 2. Accounts Module

### 7. accounts-cash-submission.html

**Goal:** Capture daily cash submissions from different departments.

**Layout:**

* **Top bar:** Date, Department, Collector, Shift selector.

* **Cards:** Total submitted today, Difference vs system, Pending submissions.

* **Table:**

  * Rows per department/shift.
  * Columns: Department, Expected cash, Submitted cash, Variance, Collector, Submission time, Status, Actions.

* **Forms / Modals:**

  * “New submission” modal: department, amount, payment types breakdown, reference, attachments.
  * “Approve / Reject submission” dialog with comments.

* **Messages:**

  * Error if variance beyond allowed tolerance; warning with override.

---

### 8. accounts-expenses-maintenance.html

### 9. accounts-expenses-mawaid.html

### 10. accounts-expenses-other.html

### 11. accounts-expenses-transport.html

All four are variants of an **Expenses** screen, with tuned defaults.

**Layout (common skeleton):**

* **Top bar:** Date range, Cost center (for “other”), Vendor, Approval status, Export.

* **Cards:** Total spend, Avg ticket size, Pending approvals, Top category/vendor.

* **Tabs:** `List` | `Analytics`

* **List tab:**

  * Table:

    * Expense ID, Date, Department, Category (pre-defined per page), Vendor, Amount, Payment mode, Status, Actions.
  * Row icons: invoice icon for attachment, warning icon for flagged expense.

* **Analytics tab:**

  * Charts:

    * Pie: spend by subcategory.
    * Bar: daily/weekly spend.
  * Small table: Top 10 vendors by spend.

* **Forms / Modals:**

  * “Add expense” modal: date, category, vendor, amount, description, upload bill, cost center tags.
  * “Approve / Reject” dialog with comment.
  * “Split expense” mini-modal (across departments).

Each page:

* **maintenance:** default category filter = Maintenance; extra fields: building/room.
* **mawaid:** extra fields: meal type (breakfast/lunch/dinner), event/occasion.
* **transport:** extra fields: vehicle, trip ID, fuel vs toll vs driver overtime.
* **other:** free-form categories, additional “Justification” textarea.

---

### 12. accounts-lawazim-collection.html

**Goal:** Track lawazim items issued & payments.

**Layout:**

* **Top bar:** Date range, Item, Booking/group, Payment status.

* **Table:**

  * Lawazim ID, SH No./Guest, Item, Qty, Rate, Total, Paid status, Payment method, Actions.

* **Forms / Modals:**

  * “Issue lawazim” form: search guest or group, select items, quantities, auto-calc amounts.
  * “Mark as paid” modal with receipt no.
  * “Return/exchange item” modal.

* **Charts:**

  * Bar chart: Lawazim revenue over time.
  * Pie: Items issued by type.

---

### 13. accounts-niyaz-collection.html

**Goal:** Manage niyaz contributions/collections.

**Layout:**

* **Top bar:** Date, Source (Individual / Group / Sponsor), Mode (Cash / Transfer).

* **Cards:** Total niyaz today, Month-to-date, Avg per guest.

* **Table:**

  * Receipt ID, Date, Payer name/group, Amount, Mode, Reference, Allocated (Y/N).

* **Forms / Modals:**

  * “Record niyaz” form.
  * “Allocate niyaz” modal: link to cost centers or specific events.

* **Messages:** Success/failure; warning if duplicate reference detected.

---

### 14. accounts-salaries.html

**Goal:** Handle salary disbursement tracking.

**Layout:**

* **Top bar:** Month selector, Department, Status (Pending / Approved / Paid).

* **Cards:** Total payroll, Paid %, Pending amount.

* **Table:**

  * Employee, Role, Department, Basic, Allowances, Deductions, Net, Status, Payment date, Actions.

* **Forms / Modals:**

  * “Generate payroll” modal: month, selected departments.
  * “Adjust salary” modal per employee (with reason).
  * “Mark as paid” modal with transaction details.

* **Chart:**

  * Bar chart: Department-wise salary cost.

---

# 3. HR Module

### 15. hr-leave-management.html

**Goal:** Manage leave requests & balances.

**Layout:**

* **Top bar:** Date range, Department, Leave type, Status.

* **Cards:** Total leaves in range, Today’s absences, Critical roles on leave.

* **Tabs:** `Requests` | `Calendar`

* **Requests tab:**

  * Table: Request ID, Employee, Dept, Leave type, From–To, Days, Status, Approver, Actions.

* **Calendar tab:**

  * Monthly calendar view with colored blocks by employee/department.
  * Click day → side panel listing who is off.

* **Forms / Modals:**

  * “New leave request” form.
  * “Approve/Reject” modal with comment.
  * “Override policy” confirmation.

---

### 16. hr-scheduling.html

**Goal:** Shift / duty scheduling.

**Layout:**

* **Top bar:** Week selector, Department, Role.

* **Main content:**

  * **Gantt-like table:** Rows = employees, columns = days; cells show shift (M/E/N/Off).
  * Drag & drop to move shifts.
  * Icons: warning if overtime, conflict.

* **Side panel:** Summary per day: headcount required vs assigned.

* **Forms / Modals:**

  * “Generate schedule” modal from template.
  * “Edit shift” cell modal: shift type, notes.
  * “Publish schedule” confirmation (messages sent out).

---

### 17. hr-staff-directory.html

**Goal:** Master list of all staff.

**Layout:**

* **Top bar:** Search by name/ITS, filters for department, role, status.

* **Cards row:** Total staff, Active, On leave, Contractors.

* **Table:**

  * Photo avatar, Name, ITS#, Role, Dept, Phone, Email, Status, Actions.

* **Side panel / Modal:**

  * “View profile” details card with tabs: Personal, Employment, Documents.

* **Forms / Modals:**

  * “Add staff” form.
  * “Deactivate staff” confirm modal with reason.

---

### 18. hr-training.html

**Goal:** Track training programs & attendance.

**Layout:**

* **Top bar:** Training type, Date range, Status (Planned / Ongoing / Completed).

* **Cards:** Sessions planned, Complete %, Avg attendance.

* **Main content:**

  * Table: Session name, Date, Trainer, Target dept, Seats, Enrolled, Completed, Actions.
  * Button: “View attendees” opens modal with list, status, scores.

* **Forms / Modals:**

  * “Create session” form.
  * “Mark attendance” modal with checkboxes.
  * “Upload resources” modal (file attachments).

* **Charts:**

  * Bar chart: Attendance rate per session.
  * Radar chart (optional) for skills coverage.

---

# 4. Mawaid Module

### 19. mawaid-dining-hall.html

**Goal:** Operational view of dining hall capacity & sessions.

**Layout:**

* **Top bar:** Date, Meal type (Breakfast/Lunch/Dinner), Location.

* **Cards:** Expected pax, Seated, Remaining capacity.

* **Main content:**

  * **Session timeline:** Cards for each session/slot with time, capacity, bookings.
  * **Table:** Group/SH No., Pax, Hall, Slot, Status (waiting, seated, completed), Actions.

* **Forms / Modals:**

  * “Assign hall & time” for groups.
  * “Mark seated” quick action modal.
  * “Move group to other hall”.

* **Chart:** Live bar showing “Expected vs actual seated” for current meal.

---

### 20. mawaid-inventory.html

**Goal:** Track raw material inventory.

**Layout:**

* **Top bar:** Category, Store, Stock status (Low, OK, Overstock).

* **Cards:** Total items, Low stock items, Out-of-stock.

* **Table:**

  * Item name, Category, Unit, Current stock, Reorder level, Supplier, Last GRN, Actions.

* **Forms / Modals:**

  * “Adjust stock” (increment/decrement with reason).
  * “New item” form.
  * “Set reorder rule” modal.

* **Charts:**

  * Bar chart: Stock value by category.
  * Inline sparkline for consumption trend per item (optional).

---

### 21. mawaid-kitchen-operations.html

**Goal:** Kitchen production planning & execution.

**Layout:**

* **Top bar:** Date, Meal type, Kitchen location.

* **Cards:** Total thals, Total plates, Veg/Non-veg split.

* **Main content:**

  * **Prep plan table:**

    * Dish, Planned qty, Unit, Status (Not started / In progress / Completed), Responsible, Actions.
  * **Right panel:** “Live issues” list (delays, shortages).

* **Forms / Modals:**

  * “Generate prep plan” from menu & headcount.
  * “Update status” inline or modal.
  * “Report shortage” modal linking to inventory.

* **Chart:** Gantt-style progress for dishes over time.

---

### 22. mawaid-make-recipies.html

**Goal:** Master recipes management.

**Layout:**

* **Top bar:** Dish search, Category, Tags (veg/non-veg, spicy, etc.).

* **Cards:** Total recipes, Active, Under testing.

* **Table:**

  * Dish name, Category, Yield (servings), Status, Last updated, Actions.

* **Modals / Forms:**

  * “Create / Edit recipe” modal:

    * Fields: Dish name, category, yield, method text, notes.
    * **Ingredients sub-table**:

      * Columns: Ingredient (dropdown), Quantity, Unit.
      * Buttons: “Add row”, “Duplicate row”.
  * “Scale recipe” mini-modal: desired servings → recalculates ingredient quantities.

---

### 23. mawaid-menu-planning.html

**Goal:** Plan menus per day/meal.

**Layout:**

* **Top bar:** Date range, Location.

* **Main content:**

  * Calendar-like grid: rows = date, columns = meals (B/L/D), each cell shows dish cards.
  * Click cell to open “Edit menu” modal with:

    * Dish selection (autocomplete).
    * Flags (signature, light meal, kids-friendly).

* **Cards:** Upcoming special event days, fasts, etc.

* **Charts:**

  * Pie: Cuisine mix over the week.
  * Heatmap: dish frequency.

---

### 24. mawaid-reports.html

**Goal:** Analytical reports for Mawaid.

**Layout:**

* Filter bar: Date range, Building, Meal type, Vendor.

* Sectioned cards with embedded charts:

  * Consumption vs headcount line chart.
  * Food cost % bar chart by day.
  * Top 10 dishes by frequency.
  * Waste quantity chart.

* Download buttons for each widget: “Export CSV”, “Download PDF”.

---

### 25. mawaid-supply-chain.html

**Goal:** Purchase orders & deliveries.

**Layout:**

* **Top bar:** Date, Supplier, Status (Draft, Sent, Partially received, Closed).

* **Cards:** Open POs, Late deliveries, Total PO value.

* **Table (PO list):**

  * PO No., Date, Supplier, Items count, Value, Status, Expected delivery, Actions.

* **Modals:**

  * “Create PO” form:

    * Supplier, item lines, quantities, prices, delivery date.
  * “Receive items” modal: per item delivered qty, short/excess, remarks.

* **Chart:** Bar chart: Ordered vs received per supplier.

---

### 26. mawaid-thal-counts.html

**Goal:** Thal count & meal count management.

**Layout:**

* **Top bar:** Date, Meal type, Group/Building filter.

* **Cards:** Total thals, Extra thals, Cancelled thals.

* **Table:**

  * Group/SH No., Pax, Thals requested, Extra, Net, Notes, Actions.

* **Forms / Modals:**

  * “Adjust thals” modal.
  * “Lock counts” confirmation (prevents edits after freeze time).

* **Chart:** Line chart of thal counts over day/week.

---

### 27. mawaid-vendors.html

**Goal:** Manage food vendors.

**Layout:**

* **Top bar:** Vendor type, Status.

* **Table:**

  * Vendor name, Type, Contact, Rating, Avg lead time, Active status, Actions.

* **Side panel:** Vendor profile, list of recent POs, complaints.

* **Forms / Modals:**

  * “Add vendor” form.
  * “Rate vendor” dialog with stars & comments.

---

# 5. Settings & Users

### 28. pages-settings.html

**Goal:** Global app & user preferences, including theme palettes.

**Layout:**

* **Tabs:** `General` | `Modules` | `Roles & Permissions` | `Themes`

* **General:**

  * Forms: Org name, logo upload, timezone, language.

* **Modules:**

  * Toggle cards for enabling/disabling modules (Accommodation, Mawaid, Transport, etc.) with icons.

* **Roles & Permissions:**

  * Table: Role, Description, Assigned count, Actions.
  * Permission matrix modal: features vs roles with checkboxes.

* **Themes:**

  * Show your **7 named palettes** as selectable cards (with their brand names).
  * Radio/checkbox to pick default palette + per-user override option.
  * Button: “Preview theme” triggers a global class change.

* **Messages:** Banners for “Settings saved”, “Restart session to apply theme” etc.

---

### 29. ums-users.html

**Goal:** Central user management.

**Layout:**

* **Top bar:** Search, Filters: role, status, department, module access.

* **Cards:** Total users, Active, Locked, Pending invite.

* **Table:**

  * Avatar, Name, Username, ITS, Email, Role, Status, Last login, Actions.

* **Modals:**

  * “Invite user” form (email, role, module access).
  * “Edit user” modal with tabs: Profile, Roles, Restrictions.
  * “Reset password” confirmation.

* **Messages:** Warnings when demoting admin / revoking access.

---

# 6. Reports Module

Each report-* page is primarily **filters + charts + exportable tables**.

### 30. report-accommodation.html

* Filters: Date range, Building, Room type.
* Charts: Occupancy %, ADR (if used), length-of-stay histogram.
* Table: Date, Rooms occupied, Rooms vacant, Turnaways, Overbookings.

### 31. report-accounts.html

* Filters: Date range, Department, Account head.
* Charts: Revenue vs Expenses line chart; bar chart by department.
* Table: aggregated figures per day/department.

### 32. report-fakkulehraam.html

* Filters: Date range, Package type.
* Cards: Total fakkulehraam processed, Avg spend.
* Table: Guest/group, dates, amounts.
* Chart: Bar per day.

### 33. report-human-resources.html

* Filters: Date range, Department.
* Charts: Headcount trend, attrition, absence rate.
* Table: metrics per department.

### 34. report-legal.html

* Filters: Case type, Status, Date range.
* Table: Case ID, Type, Parties, Status, Next hearing date.
* Chart: Cases by status / age.

### 35. report-mawaid.html

* Consolidates Mawaid analytics:

  * Food cost %, dish frequency, waste metrics.
* Same patterns as `mawaid-reports` but higher-level.

### 36. report-reservations.html

* Filters: Date range, Source (online/offline/TO), Status.
* Charts: Bookings per day, conversion funnel.
* Table: bookings aggregated by operator/country.

### 37. report-transport.html

* Filters: Date, Route, Vehicle.
* Charts: Trips per day, avg occupancy, fuel usage.
* Table: Trip summary data.

---

# 7. Reservations Module

### 38. reservations-approved.html

**Goal:** List of approved reservations ready for further processing.

* Filters: Date range, Type (Individual/TO), Status (Approved, Confirmed).
* Table: Ref no, Guest/Group, Pax, Dates, Package, Source, Status, Actions.
* Actions: Download confirmation, send message, convert to check-in batch.
* Modal: “View reservation” with tabs: Pax, Payments, Notes.

---

### 39. reservations-create-individuals.html

**Goal:** Guided form to create individual reservations.

* Multi-step form (could be using progress bar):

  * Step 1: Guest info (ITS, name, contact, nationality).
  * Step 2: Dates & package selection.
  * Step 3: Room preferences, special requests.
  * Step 4: Payment info (if applicable).
* Right side: Summary card updating live.
* Buttons: “Save draft”, “Submit for approval”.
* Validation messages inline + top error banner.

---

### 40. reservations-create-tour-operator.html

**Goal:** Bulk/group reservation creation.

* Similar steps but:

  * Group info, operator, contract reference.
  * Pax breakdown (male/female/child).
  * Upload pax list (CSV) with preview table.
* Extra modal: “Map CSV columns” before import.

---

### 41. reservations-pending.html

**Goal:** Work-queue of pending reservations.

* Filters: Source, Age (how many days pending), Risk level.
* Cards: Total pending, >3 days old, high-risk.
* Table: Ref, Guest/Group, Date requested, Age, Source, Notes, Actions.
* Actions: Approve, Reject, Request info (opens message compose modal).

---

# 8. Transport Module

### 42. transport-driver-management.html

**Goal:** Manage driver profiles & availability.

* Filters: Status (On duty, Off, Leave), License expiry.

* Cards: Total drivers, On duty, On leave.

* Table: Driver name, Code, Phone, License no & expiry, Assigned vehicle, Status, Actions.

* Modals:

  * “Add driver” form.
  * “Assign vehicle” modal.
  * “Suspend driver” confirmation.

---

### 43. transport-journeys-istiqbal.html

### 44. transport-journeys-madina.html

### 45. transport-journeys-salawaat.html

### 46. transport-journeys-ziyarah.html

All are journey planners, each filtered by journey type.

**Layout:**

* Top bar: Date, Route, Vehicle type, Status.
* Cards: Trips scheduled, Completed, Pax moved.
* Table:

  * Trip ID, Date/Time, Route, Vehicle, Driver, Pax capacity / booked, Status, Actions.
* Side drawer: Trip details with list of passengers/groups.
* Modals:

  * “Create trip” form (route, capacity, timings, pickup points).
  * “Assign passengers” modal (multi-select groups).
* Chart: Trips per day / On-time vs delayed.

Each page pre-filters to its type (Istiqbal, Madina, etc.) and can have a small header label / icon indicating the journey type.

---

### 47. transport-roster.html

**Goal:** Driver & vehicle roster schedule.

* Gantt-style view: rows = drivers or vehicles, columns = time.
* Drag trips between drivers if needed.
* Colors by journey type.
* Modals: “Reassign trip” confirm, “Block vehicle” for maintenance.

---

### 48. transport-vehicle-maintenance.html

**Goal:** Maintenance schedule for vehicles.

* Filters: Vehicle type, Status, Next service due.

* Cards: Vehicles active, Under maintenance, Overdue service.

* Table: Vehicle ID, Plate, Last service date, Next service due, Odometer, Status, Actions.

* Modals:

  * “Log service” form.
  * “Schedule service” modal.

* Chart: Bar chart of service cost per vehicle / month.

