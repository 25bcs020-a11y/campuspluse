# CampusPulse — Smart Campus Availability & Queue Intelligence
> **Tagline:** *"Know Before You Go."*  
> **Running Live at:** [http://localhost:5173/](http://localhost:5173/) *(Secondary: [http://localhost:3000/](http://localhost:3000/))*

---

## 🎨 Professional Visual Palette & Typography

* **Primary Blue:** `#26658C` (Buttons, links, and active navigation)
* **Deep Navy Blue:** `#023859` (Major headings, header banners, and important navigation)
* **Light Cyan:** `#A7EBF2` (Subtle highlights, selected states, and accents)
* **Main Background:** `#F5F8FA`
* **Card Background:** `#FFFFFF`
* **Main Text:** `#152536`
* **Secondary Text:** `#64748B`
* **Borders:** `#DCE6EC`

### Typography:
* **Interface & Body Typography:** *Times New Roman*, Times, serif
* **Major Headings:** *Playfair Display*, Georgia, serif (elegant retro serif)

---

## 👥 The 4 User Roles & Permissions

1. **Student (`Priya Sharma`):**
   * View all permitted campus facilities across all 6 categories (Library, Stationery, Computer Lab, Cafeteria, Administrative Office, Other Facilities).
   * Real-time search, category filtering, and sorting.
   * View facility details, operating hours, capacity bars, transparent queue waiting estimates, and busy-hour trends.
   * View Queue Status and Analytics.
   * Read-only: cannot add, edit, or delete facilities.
2. **Lab Assistant (`Rajesh Kumar`):**
   * Valid role in authentication, permissions, and data.
   * Uses the **common facility management interface** (no separate Lab Assistant page or sidebar section).
   * Can view campus facilities.
   * Authorized to update availability and crowd status for specifically assigned computer labs (`comp-lab-*`).
   * Cannot update Library, Stationery, Cafeteria, or unassigned facilities. Cannot add new facilities.
3. **Facility Supervisor (`Anita Desai`):**
   * Authorized to manage and update status for assigned campus facilities (e.g., Central Library, Reprographics, Cafeteria, Clinic).
   * Authorized to **Add New Facilities** via the prominent **"+ Add Facility"** feature.
4. **Chief Administrator (`Dr. S. Ramanathan`):**
   * Broadest facility-management authority.
   * Full access to view, update, and manage all campus facilities.
   * Authorized to **Add New Facilities** and access system reset controls.

---

## 🏛️ The 6 Exact Campus Categories

1. **Library** (Central Library, Digital Resource & E-Library, 24/7 Silent Study Arena)
2. **Stationery** (Campus Reprographics & Printing, Student Stationery Store, Engineering Drafting Desk)
3. **Computer Lab** (Programming Lab, Operating Systems Lab, AI & Deep Learning Lab, Cyber Security Lab)
4. **Cafeteria** (Main Student Cafeteria, North Quad Snack Bar, Hostel Dining Mess)
5. **Administrative Office** (Central Registrar Office, Controller of Examinations, Student Accounts & Fee Counter, Help Desk)
6. **Other Facilities** (Campus Health Clinic, Indoor Sports Arena, Placement Cell, IT Support Desk)

---

## 🚀 Running the Project

Run the application with:
```powershell
node server.js
```
The server will start on:
* **Primary URL:** `http://localhost:5173/`
* **Secondary URL:** `http://localhost:3000/`

---

## 🧪 Testing Instructions

### 1. How to Test the 4 Roles:
* Click the role badge pill in the top header or click the user card in the sidebar footer.
* The **Role Selector Portal** opens with all 4 personas:
  * **Student (`Priya Sharma`)**: Notice the "+ Add Facility" button is hidden and facility cards do not display edit controls.
  * **Lab Assistant (`Rajesh Kumar`)**: Navigate to Facilities. Notice they can update status on assigned Computer Labs, but not on Library or Cafeteria.
  * **Facility Supervisor (`Anita Desai`)**: Notice the "+ Add Facility" button is visible and active, and supervisor can update assigned services.
  * **Chief Administrator (`Dr. S. Ramanathan`)**: Full administrative access across all facilities with Add Facility privileges.

### 2. How to Test "Add Facility":
1. Switch to **Chief Administrator** or **Facility Supervisor**.
2. Navigate to **Facilities** (`#/facilities`).
3. Click the prominent **"+ Add Facility"** button next to the page heading.
4. Try clicking **Add Facility** with an empty name or negative wait time — notice the validation error is displayed.
5. Fill out the fields:
   * **Facility Name:** *Robotics & Automation Lab*
   * **Category:** *Computer Lab*
   * **Location:** *Tech Wing Block B, 1st Floor, Room B-105*
   * **Opening Hours:** *09:00 AM - 05:00 PM*
   * **Status:** *Available*
   * **Estimated Wait:** *0*
   * **Description:** *Autonomous robotics simulation and testing facility.*
6. Click **Add Facility**.
7. Notice:
   * The form closes with a success notification.
   * The new facility appears immediately in the directory.
   * The total count on the dashboard updates.
   * The facility is searchable and filterable.
   * Clicking **Details** opens the facility details page correctly.

### 3. How to Reset Demo Data:
* Navigate to **Settings & Preferences** (`#/settings`) and click **"Reset All Demo Data"** to restore the clean initial state at any time.
