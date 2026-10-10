// View: Live Queue Status & Wait Times
const QueueView = {
  filterStatus: 'all',
  sortBy: 'wait_asc',

  render(state) {
    let facilities = [...state.facilities];

    // Filter by status tab
    if (this.filterStatus !== 'all') {
      facilities = facilities.filter(f => f.status && f.status.toLowerCase().includes(this.filterStatus.toLowerCase().slice(0, 4)));
    }

    // Sort facilities
    if (this.sortBy === 'wait_asc') {
      facilities.sort((a, b) => (a.estimatedWaitMinutes || 0) - (b.estimatedWaitMinutes || 0));
    } else if (this.sortBy === 'wait_desc') {
      facilities.sort((a, b) => (b.estimatedWaitMinutes || 0) - (a.estimatedWaitMinutes || 0));
    } else if (this.sortBy === 'name_asc') {
      facilities.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'updated_desc') {
      facilities.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    const waitingQueues = state.facilities.filter(f => f.status !== 'Closed' && (f.estimatedWaitMinutes || 0) > 0);
    const avgWait = waitingQueues.length > 0 
      ? Math.round(waitingQueues.reduce((acc, f) => acc + f.estimatedWaitMinutes, 0) / waitingQueues.length)
      : 0;

    return `
      <!-- Header -->
      <div class="page-header-box">
        <div>
          <h1 class="page-title">Queue Status & Waiting Times</h1>
          <p class="page-subtitle">Real-time waiting times, queue lengths, and occupancy status across campus services.</p>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.65rem; box-shadow: var(--shadow-card);">
          <div style="color: var(--primary-blue);">${UI.icons.clock}</div>
          <div>
            <div style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase; font-weight: 700;">Average Campus Wait</div>
            <div style="font-size: 1.15rem; font-family: var(--font-serif-heading); font-weight: 700; color: var(--deep-navy);">${avgWait} mins</div>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="filter-toolbar">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <!-- Filter Tabs -->
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button class="filter-pill ${this.filterStatus === 'all' ? 'active' : ''}" onclick="QueueView.setStatusFilter('all')">
              All Facilities (${state.facilities.length})
            </button>
            <button class="filter-pill ${this.filterStatus === 'Available' ? 'active' : ''}" onclick="QueueView.setStatusFilter('Available')">
              🟢 Available (0 min)
            </button>
            <button class="filter-pill ${this.filterStatus === 'Moderate' ? 'active' : ''}" onclick="QueueView.setStatusFilter('Moderate')">
              🟡 Moderate Wait
            </button>
            <button class="filter-pill ${this.filterStatus === 'Crowded' ? 'active' : ''}" onclick="QueueView.setStatusFilter('Crowded')">
              🔴 Heavy Queue
            </button>
          </div>

          <!-- Sorting -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--deep-navy);">Sort By:</span>
            <select class="filter-select" onchange="QueueView.setSorting(this.value)">
              <option value="wait_asc" ${this.sortBy === 'wait_asc' ? 'selected' : ''}>Shortest Wait Time</option>
              <option value="wait_desc" ${this.sortBy === 'wait_desc' ? 'selected' : ''}>Longest Wait Time</option>
              <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Facility Name (A - Z)</option>
              <option value="updated_desc" ${this.sortBy === 'updated_desc' ? 'selected' : ''}>Most Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Queue Status Table -->
      ${facilities.length > 0 ? `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Facility & Category</th>
                <th>Location</th>
                <th>Availability Status</th>
                <th>Estimated Wait</th>
                <th>Current Occupancy</th>
                <th>Last Verified</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${facilities.map(fac => {
                const canUpdate = Store.canUpdateFacility(fac);
                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 36px; height: 36px; border-radius: 6px; background: var(--cyan-tint); color: var(--deep-navy); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          ${UI.getCategoryIcon(fac.category)}
                        </div>
                        <div>
                          <div style="font-family: var(--font-serif-heading); font-weight: 700; color: var(--deep-navy); cursor: pointer;" onclick="App.viewFacilityDetail('${fac.id}')">
                            ${fac.name}
                          </div>
                          <div style="font-size: 0.78rem; color: var(--secondary-text);">
                            ${fac.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style="font-size: 0.88rem; color: var(--deep-navy);">
                        ${fac.location || fac.building}
                      </div>
                    </td>

                    <td>
                      ${UI.renderStatusBadge(fac.status)}
                    </td>

                    <td>
                      <div style="font-weight: 700; font-size: 0.95rem; color: ${fac.status === 'Crowded' ? 'var(--status-crowded)' : (fac.status === 'Moderate Crowd' ? 'var(--status-moderate)' : 'var(--status-available)')};">
                        ${UI.formatWaitTime(fac.estimatedWaitMinutes, fac.status)}
                      </div>
                    </td>

                    <td style="min-width: 140px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.2rem;">
                        <span>${fac.approximateOccupancy || 0}/${fac.capacity || 50}</span>
                        <span>${fac.crowdPercentage}%</span>
                      </div>
                      <div class="progress-track" style="height: 5px;">
                        <div class="progress-fill ${fac.crowdPercentage >= 80 ? 'fill-crowded' : (fac.crowdPercentage >= 45 ? 'fill-moderate' : 'fill-available')}" style="width: ${fac.crowdPercentage}%;"></div>
                      </div>
                    </td>

                    <td>
                      <div style="font-size: 0.82rem; color: var(--secondary-text);">
                        ${UI.formatRelativeTime(fac.updatedAt)}
                      </div>
                    </td>

                    <td style="text-align: right;">
                      <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
                        ${canUpdate ? `
                          <button class="btn btn-secondary btn-sm" onclick="FacilitiesView.openUpdateStatusModal('${fac.id}')">
                            Update
                          </button>
                        ` : ''}
                        <button class="btn btn-primary btn-sm" onclick="App.viewFacilityDetail('${fac.id}')">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">${UI.icons.queue}</div>
          <h3 class="empty-state-title">No queue data found for selected filter</h3>
          <p class="empty-state-desc">There are no facilities currently matching this crowd filter.</p>
          <button class="btn btn-primary" onclick="QueueView.setStatusFilter('all')">
            View All Queues
          </button>
        </div>
      `}

      <!-- Demonstration Data Disclosure -->
      <div style="margin-top: 1.5rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--secondary-text);">
          <div style="color: var(--primary-blue);">${UI.icons.info}</div>
          <span>Estimated wait times are derived from reported capacity levels and staff telemetry. Data is refreshed regularly.</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.refreshData()">
          ${UI.icons.refresh} Refresh Telemetry
        </button>
      </div>

      <!-- Modal mount -->
      <div id="facilities-modal-mount"></div>
    `;
  },

  setStatusFilter(status) {
    this.filterStatus = status;
    App.render();
  },

  setSorting(sortBy) {
    this.sortBy = sortBy;
    App.render();
  }
};
