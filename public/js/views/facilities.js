// View: Campus Facilities Management & Directory
const FacilitiesView = {
  filterState: {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'default'
  },

  render(state) {
    this.filterState.category = state.selectedCategory || 'all';
    this.filterState.search = state.globalSearch || '';

    const filtered = this.applyFilters(state.facilities);
    const canAdd = Store.canAddFacility();

    const categories = [
      { id: 'all', label: 'All Facilities' },
      { id: 'Library', label: 'Library' },
      { id: 'Stationery', label: 'Stationery' },
      { id: 'Computer Lab', label: 'Computer Lab' },
      { id: 'Cafeteria', label: 'Cafeteria' },
      { id: 'Administrative Office', label: 'Administrative Office' },
      { id: 'Other Facilities', label: 'Other Facilities' }
    ];

    return `
      <!-- Page Header with prominent Add Facility button -->
      <div class="page-header-box">
        <div>
          <h1 class="page-title">Campus Facilities</h1>
          <p class="page-subtitle">View and manage campus facilities, current capacity, and real-time availability.</p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <span id="facility-count-text" style="font-size: 0.85rem; color: var(--secondary-text); font-weight: 600;">
            Showing <strong>${filtered.length}</strong> of ${state.facilities.length} locations
          </span>

          <!-- Add Facility Button (Visible with role permission guidance) -->
          <button class="btn btn-primary" onclick="FacilitiesView.handleAddFacilityClick()" id="btn-add-facility" title="Add new campus facility">
            ${UI.icons.plus} Add Facility
          </button>

          <button class="btn btn-secondary btn-sm" onclick="FacilitiesView.resetFilters()">
            ${UI.icons.refresh} Reset Filters
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="filter-toolbar">
        <div class="filter-row-top">
          <!-- Search Bar -->
          <div class="search-input-box">
            <span class="nav-search-icon">${UI.icons.search}</span>
            <input 
              type="text" 
              class="search-input" 
              id="facility-search-input"
              placeholder="Search library, stationery, computer labs, cafeterias, offices..." 
              value="${this.filterState.search}"
              oninput="FacilitiesView.onSearchInput(this.value)"
            />
          </div>

          <!-- Crowd Status Filter -->
          <select class="filter-select" id="status-filter-select" onchange="FacilitiesView.onStatusChange(this.value)">
            <option value="all" ${this.filterState.status === 'all' ? 'selected' : ''}>All Crowd Levels</option>
            <option value="Available" ${this.filterState.status === 'Available' ? 'selected' : ''}>🟢 Available</option>
            <option value="Moderate Crowd" ${this.filterState.status === 'Moderate Crowd' ? 'selected' : ''}>🟡 Moderate Crowd</option>
            <option value="Crowded" ${this.filterState.status === 'Crowded' ? 'selected' : ''}>🔴 Crowded</option>
          </select>

          <!-- Sorting Filter -->
          <select class="filter-select" id="sort-filter-select" onchange="FacilitiesView.onSortChange(this.value)">
            <option value="default" ${this.filterState.sortBy === 'default' ? 'selected' : ''}>Sort: Default</option>
            <option value="wait_asc" ${this.filterState.sortBy === 'wait_asc' ? 'selected' : ''}>Shortest Wait Time</option>
            <option value="wait_desc" ${this.filterState.sortBy === 'wait_desc' ? 'selected' : ''}>Longest Wait Time</option>
            <option value="name_asc" ${this.filterState.sortBy === 'name_asc' ? 'selected' : ''}>Facility Name (A - Z)</option>
            <option value="updated_desc" ${this.filterState.sortBy === 'updated_desc' ? 'selected' : ''}>Most Recently Updated</option>
          </select>
        </div>

        <!-- Exact 6 Category Pills -->
        <div class="filter-pills-row">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; flex: 1;">
            ${categories.map(c => `
              <button 
                class="filter-pill ${this.filterState.category.toLowerCase() === c.id.toLowerCase() ? 'active' : ''}" 
                data-cat-id="${c.id.toLowerCase()}"
                onclick="FacilitiesView.onCategoryClick('${c.id}')"
              >
                ${c.label}
              </button>
            `).join('')}
          </div>

          <!-- Status Legend -->
          <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.78rem; color: var(--secondary-text);">
            <span style="font-weight: 700; color: var(--deep-navy);">Status:</span>
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--status-available);"></span> Available</span>
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--status-moderate);"></span> Moderate</span>
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--status-crowded);"></span> Crowded</span>
          </div>
        </div>
      </div>

      <!-- Facilities Grid Container -->
      <div id="facilities-grid-container">
        ${filtered.length > 0 ? `
          <div class="facilities-grid">
            ${filtered.map(fac => this.renderFacilityCard(fac)).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">${UI.icons.search}</div>
            <h3 class="empty-state-title">No matching campus facilities found</h3>
            <p class="empty-state-desc">We couldn't find any facilities matching your search or filters. Try adjusting your query or reset the filters.</p>
            <button class="btn btn-primary" onclick="FacilitiesView.resetFilters()">
              ${UI.icons.refresh} Clear Filters & View All
            </button>
          </div>
        `}
      </div>

      <!-- Container for Modals -->
      <div id="facilities-modal-mount"></div>
    `;
  },

  renderFacilityCard(fac) {
    const canUpdate = Store.canUpdateFacility(fac);

    return `
      <div class="facility-card">
        <div>
          <div class="facility-card-top">
            <div style="flex: 1;">
              <span class="facility-category-badge">
                ${UI.getCategoryIcon(fac.category)}
                ${fac.category}
              </span>
              <h3 class="facility-name" onclick="App.viewFacilityDetail('${fac.id}')" style="cursor: pointer;">
                ${fac.name}
              </h3>
            </div>
            ${UI.renderStatusBadge(fac.status)}
          </div>

          <div class="facility-location-line">
            ${UI.icons.mapPin}
            <span>${fac.location || (fac.building + ' • ' + fac.floor + ' • Room ' + (fac.room || 'General'))}</span>
          </div>

          <p style="font-size: 0.88rem; color: var(--secondary-text); margin-bottom: 0.85rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${fac.description}
          </p>

          <div class="facility-metrics-row">
            <div>
              <div class="metric-label">Estimated Wait</div>
              <div class="metric-value">${UI.formatWaitTime(fac.estimatedWaitMinutes, fac.status)}</div>
            </div>
            <div>
              <div class="metric-label">Opening Hours</div>
              <div class="metric-value" style="font-size: 0.85rem; font-weight: 600;">${fac.openingHours || '08:30 AM - 05:30 PM'}</div>
            </div>
          </div>

          ${UI.renderOccupancyBar(fac.approximateOccupancy, fac.capacity, fac.crowdPercentage)}
        </div>

        <div class="facility-card-footer">
          <span style="display: flex; align-items: center; gap: 0.3rem;">
            ${UI.icons.clock} ${UI.formatRelativeTime(fac.updatedAt)}
          </span>
          <div style="display: flex; gap: 0.45rem;">
            ${canUpdate ? `
              <button class="btn btn-secondary btn-sm" onclick="FacilitiesView.openUpdateStatusModal('${fac.id}')" title="Update status & waiting time">
                ${UI.icons.edit} Update
              </button>
            ` : ''}
            <button class="btn btn-primary btn-sm" onclick="App.viewFacilityDetail('${fac.id}')">
              Details ${UI.icons.arrowRight}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  applyFilters(facilities) {
    let list = [...facilities];

    // Search query
    if (this.filterState.search.trim()) {
      const q = this.filterState.search.trim().toLowerCase();
      list = list.filter(f =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.location && f.location.toLowerCase().includes(q)) ||
        (f.building && f.building.toLowerCase().includes(q)) ||
        (f.room && f.room.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.filterState.category && this.filterState.category.toLowerCase() !== 'all') {
      list = list.filter(f => f.category && f.category.toLowerCase() === this.filterState.category.toLowerCase());
    }

    // Crowd status filter
    if (this.filterState.status && this.filterState.status.toLowerCase() !== 'all') {
      const s = this.filterState.status.toLowerCase();
      list = list.filter(f => f.status && f.status.toLowerCase().includes(s.slice(0, 4)));
    }

    // Sorting
    if (this.filterState.sortBy === 'wait_asc') {
      list.sort((a, b) => (a.estimatedWaitMinutes || 0) - (b.estimatedWaitMinutes || 0));
    } else if (this.filterState.sortBy === 'wait_desc') {
      list.sort((a, b) => (b.estimatedWaitMinutes || 0) - (a.estimatedWaitMinutes || 0));
    } else if (this.filterState.sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.filterState.sortBy === 'updated_desc') {
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    return list;
  },

  updateGridOnly() {
    const state = Store.state;
    const filtered = this.applyFilters(state.facilities);

    const countEl = document.getElementById('facility-count-text');
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${filtered.length}</strong> of ${state.facilities.length} locations`;
    }

    const gridContainer = document.getElementById('facilities-grid-container');
    if (gridContainer) {
      if (filtered.length > 0) {
        gridContainer.innerHTML = `
          <div class="facilities-grid">
            ${filtered.map(fac => this.renderFacilityCard(fac)).join('')}
          </div>
        `;
      } else {
        gridContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">${UI.icons.search}</div>
            <h3 class="empty-state-title">No matching campus facilities found</h3>
            <p class="empty-state-desc">We couldn't find any facilities matching "${this.filterState.search || 'current filters'}". Try adjusting your search query or reset the filters.</p>
            <button class="btn btn-primary" onclick="FacilitiesView.resetFilters()">
              ${UI.icons.refresh} Clear Filters & View All
            </button>
          </div>
        `;
      }
    } else {
      App.render();
    }
  },

  onSearchInput(val) {
    this.filterState.search = val;
    Store.setGlobalSearch(val, false);

    // Sync nav search bar if present
    const navInput = document.querySelector('.nav-search-input');
    if (navInput && navInput.value !== val) {
      navInput.value = val;
    }
    this.updateGridOnly();
  },

  onCategoryClick(catId) {
    this.filterState.category = catId;
    Store.state.selectedCategory = catId;

    // Update active class on pills in DOM
    const pills = document.querySelectorAll('.filter-pills-row .filter-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-cat-id') === catId.toLowerCase()) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    this.updateGridOnly();
  },

  onStatusChange(status) {
    this.filterState.status = status;
    this.updateGridOnly();
  },

  onSortChange(sortBy) {
    this.filterState.sortBy = sortBy;
    this.updateGridOnly();
  },

  resetFilters() {
    this.filterState = {
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'default'
    };
    Store.state.selectedCategory = 'all';
    Store.setGlobalSearch('', false);

    const searchInput = document.getElementById('facility-search-input');
    if (searchInput) searchInput.value = '';
    const navInput = document.querySelector('.nav-search-input');
    if (navInput) navInput.value = '';
    const statusSelect = document.getElementById('status-filter-select');
    if (statusSelect) statusSelect.value = 'all';
    const sortSelect = document.getElementById('sort-filter-select');
    if (sortSelect) sortSelect.value = 'default';

    const pills = document.querySelectorAll('.filter-pills-row .filter-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-cat-id') === 'all') {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    this.updateGridOnly();
  },

  handleAddFacilityClick() {
    if (Store.canAddFacility()) {
      this.openAddFacilityModal();
    } else {
      this.showPermissionNoticeModal();
    }
  },

  showPermissionNoticeModal() {
    const mount = document.getElementById('facilities-modal-mount') || document.body;
    let modalEl = document.getElementById('permission-notice-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'permission-notice-modal';
      mount.appendChild(modalEl);
    }
    const user = Store.state.currentUser || { name: 'Student', roleTitle: 'Student' };

    modalEl.innerHTML = `
      <div class="modal-overlay" onclick="FacilitiesView.closeModal('permission-notice-modal', event)">
        <div class="modal-card" style="max-width: 520px;" onclick="event.stopPropagation()">
          <div class="modal-header" style="background: var(--deep-navy);">
            <div>
              <h3 class="modal-title">Access Permission Notice</h3>
              <div style="font-size: 0.8rem; color: var(--light-cyan); margin-top: 0.15rem;">
                Campus Infrastructure Management Privileges
              </div>
            </div>
            <button class="modal-close-btn" onclick="FacilitiesView.closeModal('permission-notice-modal')">
              ${UI.icons.close}
            </button>
          </div>
          <div class="modal-body" style="padding: 1.5rem;">
            <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.3rem;">
                ⚠️
              </div>
              <div>
                <h4 style="font-size: 1.05rem; color: var(--deep-navy); margin-bottom: 0.35rem; font-family: var(--font-serif-heading);">
                  Facility Registration Requires Staff Permissions
                </h4>
                <p style="font-size: 0.88rem; color: var(--main-text); line-height: 1.5;">
                  You are currently signed in as <strong>${user.name} (${user.roleTitle || user.role})</strong>. Creating and registering new campus facilities is restricted to <strong>Facility Supervisors</strong> and <strong>Chief Administrators</strong>.
                </p>
              </div>
            </div>

            <div style="background: var(--cyan-tint); border: 1px solid var(--light-cyan); border-radius: 6px; padding: 0.85rem 1rem; font-size: 0.85rem; color: var(--deep-navy); margin-bottom: 0.5rem; line-height: 1.45;">
              <strong>Test Role-Based Access:</strong> Switch to Chief Administrator or Facility Supervisor using the buttons below to create new facilities and verify administrative actions.
            </div>
          </div>
          <div class="modal-footer" style="justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="FacilitiesView.closeModal('permission-notice-modal')">
              Cancel
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="FacilitiesView.switchRoleAndOpenAdd('user-supervisor-1')">
                Switch to Supervisor
              </button>
              <button class="btn btn-primary btn-sm" onclick="FacilitiesView.switchRoleAndOpenAdd('user-chief-admin-1')">
                Switch to Chief Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  switchRoleAndOpenAdd(userId) {
    this.closeModal('permission-notice-modal');
    Store.setCurrentUser(userId);
    UI.showToast(`Active session switched to ${Store.state.currentUser.name} (${Store.state.currentUser.roleTitle})`, 'success');
    App.render();
    setTimeout(() => {
      this.openAddFacilityModal();
    }, 150);
  },

  // FUNCTIONAL ADD FACILITY MODAL
  openAddFacilityModal() {
    const mount = document.getElementById('facilities-modal-mount') || document.body;
    let modalEl = document.getElementById('add-facility-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'add-facility-modal';
      mount.appendChild(modalEl);
    }

    const categories = ['Library', 'Stationery', 'Computer Lab', 'Cafeteria', 'Administrative Office', 'Other Facilities'];
    const statuses = ['Available', 'Moderate Crowd', 'Crowded'];

    modalEl.innerHTML = `
      <div class="modal-overlay" onclick="FacilitiesView.closeModal('add-facility-modal', event)">
        <div class="modal-card" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Add New Campus Facility</h3>
              <div style="font-size: 0.78rem; color: var(--light-cyan); margin-top: 0.15rem;">
                Authorized Campus Infrastructure Management
              </div>
            </div>
            <button class="modal-close-btn" onclick="FacilitiesView.closeModal('add-facility-modal')">
              ${UI.icons.close}
            </button>
          </div>

          <form id="add-facility-form" onsubmit="FacilitiesView.submitAddFacility(event)">
            <div class="modal-body">
              <div id="add-facility-error" style="display: none; background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; padding: 0.75rem; border-radius: 6px; font-size: 0.88rem; margin-bottom: 1rem;"></div>

              <!-- Facility Name -->
              <div class="form-group">
                <label class="form-label" for="add-fac-name">Facility Name *</label>
                <input 
                  type="text" 
                  id="add-fac-name" 
                  name="name" 
                  class="form-input" 
                  placeholder="e.g. Advanced Embedded Systems Lab" 
                  required 
                />
              </div>

              <!-- Facility Category & Status -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="add-fac-category">Facility Category *</label>
                  <select id="add-fac-category" name="category" class="form-select" required>
                    <option value="">Select Category...</option>
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="add-fac-status">Initial Availability Status *</label>
                  <select id="add-fac-status" name="status" class="form-select" required>
                    ${statuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Location -->
              <div class="form-group">
                <label class="form-label" for="add-fac-location">Location (Building, Floor, Room) *</label>
                <input 
                  type="text" 
                  id="add-fac-location" 
                  name="location" 
                  class="form-input" 
                  placeholder="e.g. Science Block C, 2nd Floor, Room 204" 
                  required 
                />
              </div>

              <!-- Opening Hours & Estimated Wait Time -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="add-fac-hours">Opening Hours *</label>
                  <input 
                    type="text" 
                    id="add-fac-hours" 
                    name="openingHours" 
                    class="form-input" 
                    placeholder="e.g. 08:30 AM - 05:30 PM" 
                    value="08:30 AM - 05:30 PM"
                    required 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="add-fac-wait">Estimated Wait (Minutes) *</label>
                  <input 
                    type="number" 
                    id="add-fac-wait" 
                    name="estimatedWaitMinutes" 
                    class="form-input" 
                    min="0" 
                    max="180" 
                    value="0" 
                    required 
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label" for="add-fac-desc">Description *</label>
                <textarea 
                  id="add-fac-desc" 
                  name="description" 
                  class="form-textarea" 
                  rows="3" 
                  placeholder="Briefly describe the facility, equipment, and access guidelines..."
                  required
                ></textarea>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="FacilitiesView.closeModal('add-facility-modal')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="btn-submit-add-facility">
                ${UI.icons.check} Add Facility
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async submitAddFacility(event) {
    event.preventDefault();
    const form = event.target;
    const btn = document.getElementById('btn-submit-add-facility');
    const errBox = document.getElementById('add-facility-error');

    const name = form.name.value.trim();
    const category = form.category.value;
    const location = form.location.value.trim();
    const description = form.description.value.trim();
    const openingHours = form.openingHours.value.trim();
    const status = form.status.value;
    const estimatedWaitMinutes = Number(form.estimatedWaitMinutes.value);

    // Validation
    if (!name) {
      this.showFormError(errBox, 'Facility Name is required.');
      return;
    }
    if (!category) {
      this.showFormError(errBox, 'Please select a Facility Category.');
      return;
    }
    if (!location) {
      this.showFormError(errBox, 'Location is required.');
      return;
    }
    if (!description) {
      this.showFormError(errBox, 'Description is required.');
      return;
    }
    if (!openingHours) {
      this.showFormError(errBox, 'Opening Hours are required.');
      return;
    }
    if (isNaN(estimatedWaitMinutes) || estimatedWaitMinutes < 0) {
      this.showFormError(errBox, 'Estimated waiting time must be a non-negative number.');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerText = 'Saving...';
      errBox.style.display = 'none';

      await Store.addFacility({
        name,
        category,
        location,
        description,
        openingHours,
        status,
        estimatedWaitMinutes
      });

      UI.showToast(`Facility "${name}" created successfully!`, 'success');
      this.closeModal('add-facility-modal');
      App.render();
    } catch (err) {
      this.showFormError(errBox, err.message || 'Failed to add facility.');
      btn.disabled = false;
      btn.innerText = 'Add Facility';
    }
  },

  showFormError(el, msg) {
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  },

  // COMMON FACILITY STATUS UPDATE MODAL
  openUpdateStatusModal(facilityId) {
    const fac = Store.getFacilityById(facilityId);
    if (!fac) return;

    if (!Store.canUpdateFacility(fac)) {
      UI.showToast('You do not have permission to edit this facility.', 'error');
      return;
    }

    const mount = document.getElementById('facilities-modal-mount') || document.body;
    let modalEl = document.getElementById('update-status-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'update-status-modal';
      mount.appendChild(modalEl);
    }

    const statuses = ['Available', 'Moderate Crowd', 'Crowded'];

    modalEl.innerHTML = `
      <div class="modal-overlay" onclick="FacilitiesView.closeModal('update-status-modal', event)">
        <div class="modal-card" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Update Facility Status</h3>
              <div style="font-size: 0.8rem; color: var(--light-cyan); margin-top: 0.15rem;">
                ${fac.name} • ${fac.category}
              </div>
            </div>
            <button class="modal-close-btn" onclick="FacilitiesView.closeModal('update-status-modal')">
              ${UI.icons.close}
            </button>
          </div>

          <form id="update-status-form" onsubmit="FacilitiesView.submitUpdateStatus(event, '${fac.id}')">
            <div class="modal-body">
              <div id="update-status-error" style="display: none; background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; padding: 0.75rem; border-radius: 6px; font-size: 0.88rem; margin-bottom: 1rem;"></div>

              <!-- Status Selection -->
              <div class="form-group">
                <label class="form-label">Availability & Crowd Status *</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                  ${statuses.map(s => `
                    <label style="display: flex; align-items: center; gap: 0.45rem; padding: 0.65rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; background: ${fac.status === s ? 'var(--cyan-tint)' : '#FFFFFF'};">
                      <input type="radio" name="status" value="${s}" ${fac.status === s ? 'checked' : ''} required />
                      <span style="font-size: 0.85rem; font-weight: 700; color: var(--deep-navy);">${s}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Wait Time & Occupancy -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="update-wait">Estimated Wait (Minutes) *</label>
                  <input 
                    type="number" 
                    id="update-wait" 
                    name="estimatedWaitMinutes" 
                    class="form-input" 
                    min="0" 
                    max="180" 
                    value="${fac.estimatedWaitMinutes || 0}" 
                    required 
                  />
                  <span style="font-size: 0.72rem; color: var(--secondary-text);">Non-negative number</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="update-occupancy">Headcount / Occupancy *</label>
                  <input 
                    type="number" 
                    id="update-occupancy" 
                    name="approximateOccupancy" 
                    class="form-input" 
                    min="0" 
                    max="${fac.capacity || 500}" 
                    value="${fac.approximateOccupancy || 0}" 
                    required 
                  />
                  <span style="font-size: 0.72rem; color: var(--secondary-text);">Capacity: ${fac.capacity || 50}</span>
                </div>
              </div>

              <!-- Advisory Note -->
              <div class="form-group">
                <label class="form-label" for="update-note">Staff Advisory Note</label>
                <textarea 
                  id="update-note" 
                  name="statusNote" 
                  class="form-textarea" 
                  rows="2" 
                  placeholder="e.g. Routine cleaning in progress; front rows open for walk-ins."
                >${fac.statusNote || ''}</textarea>
              </div>

              <div style="font-size: 0.78rem; color: var(--secondary-text); background: var(--main-bg); padding: 0.5rem 0.75rem; border-radius: 4px; border: 1px solid var(--border-color);">
                Updated by: <strong>${Store.state.currentUser.name}</strong> (${Store.state.currentUser.roleTitle})
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="FacilitiesView.closeModal('update-status-modal')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="btn-submit-update-status">
                ${UI.icons.check} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async submitUpdateStatus(event, facilityId) {
    event.preventDefault();
    const form = event.target;
    const btn = document.getElementById('btn-submit-update-status');
    const errBox = document.getElementById('update-status-error');

    const status = form.status.value;
    const estimatedWaitMinutes = Number(form.estimatedWaitMinutes.value);
    const approximateOccupancy = Number(form.approximateOccupancy.value);
    const statusNote = form.statusNote.value.trim();

    if (isNaN(estimatedWaitMinutes) || estimatedWaitMinutes < 0) {
      this.showFormError(errBox, 'Estimated waiting time cannot be negative.');
      return;
    }
    if (isNaN(approximateOccupancy) || approximateOccupancy < 0) {
      this.showFormError(errBox, 'Occupancy cannot be negative.');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerText = 'Saving...';
      errBox.style.display = 'none';

      await Store.updateFacilityStatus(facilityId, {
        status,
        estimatedWaitMinutes,
        approximateOccupancy,
        statusNote
      });

      UI.showToast('Facility status updated successfully!', 'success');
      this.closeModal('update-status-modal');
      App.render();
    } catch (err) {
      this.showFormError(errBox, err.message || 'Failed to update status.');
      btn.disabled = false;
      btn.innerText = 'Save Changes';
    }
  },

  closeModal(modalId, event) {
    if (event && event.target && event.target.className !== 'modal-overlay') return;
    const el = document.getElementById(modalId);
    if (el) el.innerHTML = '';
  }
};
