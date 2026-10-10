// View: Live Campus Status & Staff Updates Workspace
const StaffView = {
  activeModalFacilityId: null,

  render(state) {
    const user = state.currentUser;
    const isStudent = user.role === 'student';
    const isAdmin = user.role === 'admin';
    const isLabAsst = user.role === 'lab_assistant';
    const isFacilityStaff = user.role === 'facility_staff';

    // Facilities assigned to current user
    let assigned = [];
    if (isAdmin) {
      assigned = state.facilities;
    } else if (user.assignedFacilities && user.assignedFacilities.length > 0) {
      assigned = state.facilities.filter(f => user.assignedFacilities.includes(f.id));
    }

    return `
      <!-- Workspace Header -->
      <div class="page-header-box">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary-indigo); background: #EEF2FF; padding: 0.2rem 0.6rem; border-radius: 9999px; margin-bottom: 0.5rem;">
            ${UI.icons.staff} Staff & Authorized Personnel Workspace
          </div>
          <h1 class="page-title">Live Availability Management</h1>
          <p class="page-subtitle">Report live occupancy, waiting times, and status advisories for campus facilities.</p>
        </div>

        <!-- Role Simulator Badge / Quick Switcher -->
        <div style="display: flex; align-items: center; gap: 0.75rem; background: #FFFFFF; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 12px; box-shadow: var(--shadow-subtle);">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.68rem; color: var(--muted-text); text-transform: uppercase; font-weight: 700;">Active Session</span>
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--primary-text);">${user.name}</span>
            <span style="font-size: 0.72rem; color: var(--primary-indigo); font-weight: 600;">${user.roleTitle || user.role}</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.openRoleModal()">
            Switch Role
          </button>
        </div>
      </div>

      <!-- Role Guidance Banner -->
      ${isStudent ? `
        <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.75rem; display: flex; gap: 1rem; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <div style="color: #D97706;">${UI.icons.info}</div>
            <div>
              <div style="font-weight: 700; color: #92400E; font-size: 0.92rem;">You are viewing as a Student (Read-Only)</div>
              <div style="font-size: 0.82rem; color: #B45309;">Students cannot publish live availability updates. Switch to a Lab Assistant or Facility Staff profile to test the update workflow.</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm" style="background: #D97706; color: #FFFFFF;" onclick="Store.setCurrentUser('user-lab-asst-1')">
              Switch to Lab Assistant
            </button>
            <button class="btn btn-sm" style="background: #4F46E5; color: #FFFFFF;" onclick="Store.setCurrentUser('user-facility-staff-1')">
              Switch to Facility Staff
            </button>
          </div>
        </div>
      ` : `
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: #166534; font-weight: 500;">
            <div style="color: #16A34A;">${UI.icons.check}</div>
            <span>Authorized access: You have reporting permissions for <strong>${assigned.length}</strong> designated campus ${isAdmin ? 'facilities (Full Admin Access)' : 'facilities'}.</span>
          </div>
          <span style="font-size: 0.75rem; background: #DCFCE7; color: #15803D; padding: 0.2rem 0.55rem; border-radius: 6px; font-weight: 700;">
            Demo Mode Authenticated
          </span>
        </div>
      `}

      <!-- Assigned Facilities Grid -->
      <div style="margin-bottom: 2rem;">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">
              <span>Your Assigned Facilities (${assigned.length})</span>
            </h2>
            <p style="font-size: 0.85rem; color: var(--secondary-text);">
              ${isAdmin ? 'All facilities across campus departments' : `Specific locations assigned to ${user.name}`}
            </p>
          </div>

          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="StaffView.openNewFacilityModal()">
              + Add New Facility
            </button>
          ` : ''}
        </div>

        ${assigned.length > 0 ? `
          <div class="facilities-grid">
            ${assigned.map(fac => `
              <div class="facility-card" style="border-left: 4px solid ${fac.status === 'available' ? 'var(--status-available)' : (fac.status === 'moderate' ? 'var(--status-moderate)' : 'var(--status-crowded)')};">
                <div>
                  <div class="facility-card-top">
                    <div class="facility-title-box">
                      <span class="facility-category-badge">${fac.categoryName}</span>
                      <h3 class="facility-name" style="margin-top: 0.25rem;">${fac.name}</h3>
                    </div>
                    ${UI.renderStatusBadge(fac.status)}
                  </div>

                  <div class="facility-location-line">
                    ${UI.icons.mapPin}
                    <span>${fac.building} • ${fac.floor} (${fac.room})</span>
                  </div>

                  <div class="facility-metrics-row">
                    <div class="metric-item">
                      <span class="metric-label">Reported Wait</span>
                      <span class="metric-value">${UI.formatWaitTime(fac.estimatedWaitMinutes, fac.status)}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Headcount</span>
                      <span class="metric-value">${fac.approximateOccupancy} / ${fac.capacity}</span>
                    </div>
                  </div>

                  ${UI.renderOccupancyBar(fac.approximateOccupancy, fac.capacity, fac.crowdPercentage)}

                  ${fac.statusNote ? `
                    <div style="font-size: 0.75rem; color: var(--secondary-text); background: #FAFAFC; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-light); margin-bottom: 0.75rem; font-style: italic;">
                      "${fac.statusNote}"
                    </div>
                  ` : ''}
                </div>

                <div class="facility-card-footer">
                  <span style="font-size: 0.72rem; color: var(--muted-text);">
                    ${UI.icons.clock} ${UI.formatRelativeTime(fac.updatedAt)}
                  </span>
                  <button class="btn btn-primary btn-sm" onclick="StaffView.openUpdateModal('${fac.id}')">
                    Update Availability ${UI.icons.arrowRight}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">${UI.icons.staff}</div>
            <h3 class="empty-state-title">No facilities assigned to this account</h3>
            <p class="empty-state-desc">You are currently logged in as ${user.name}. Switch to a Lab Assistant or Facility Staff profile to view and report facility availability.</p>
            <button class="btn btn-primary" onclick="App.openRoleModal()">
              Switch to Staff Account
            </button>
          </div>
        `}
      </div>

      <!-- Status Update Audit History -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-text);">Recent Availability Update Logs</h3>
            <p style="font-size: 0.82rem; color: var(--secondary-text);">Audit trail of status changes published across campus</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.refreshData()">
            ${UI.icons.refresh} Refresh Log
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Facility Name</th>
                <th>Previous Status</th>
                <th>Updated Status</th>
                <th>Reported Wait</th>
                <th>Updated By</th>
                <th>Staff Note</th>
              </tr>
            </thead>
            <tbody>
              ${state.auditLog.slice(0, 8).map(entry => `
                <tr>
                  <td style="font-size: 0.78rem; color: var(--secondary-text); white-space: nowrap;">
                    ${new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                  <td style="font-weight: 700; font-size: 0.85rem;">
                    ${entry.facilityName}
                  </td>
                  <td>
                    ${UI.renderStatusBadge(entry.oldStatus)}
                  </td>
                  <td>
                    ${UI.renderStatusBadge(entry.newStatus)}
                  </td>
                  <td style="font-weight: 700;">
                    ${entry.estimatedWaitMinutes} mins
                  </td>
                  <td style="font-size: 0.8rem; color: var(--primary-text);">
                    ${entry.updatedBy}
                  </td>
                  <td style="font-size: 0.78rem; color: var(--secondary-text); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${entry.statusNote || '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openUpdateModal(facilityId) {
    const fac = Store.getFacilityById(facilityId);
    if (!fac) return;

    this.activeModalFacilityId = facilityId;

    let modal = document.getElementById('update-status-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'update-status-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-overlay" onclick="StaffView.closeModal(event)">
        <div class="modal-card" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.72rem; color: var(--primary-indigo); font-weight: 700; text-transform: uppercase;">
                Publish Live Status
              </div>
              <h3 class="modal-title">${fac.name}</h3>
            </div>
            <button class="modal-close-btn" onclick="StaffView.closeModal()">
              ${UI.icons.close}
            </button>
          </div>

          <form id="status-update-form" onsubmit="StaffView.submitUpdate(event, '${fac.id}')">
            <div class="modal-body">
              
              <!-- Status Selection Buttons -->
              <div class="form-group">
                <label class="form-label">Current Availability Status *</label>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                  <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; background: ${fac.status === 'available' ? 'var(--status-available-bg)' : '#FFFFFF'};">
                    <input type="radio" name="status" value="available" ${fac.status === 'available' ? 'checked' : ''} required />
                    <span style="font-weight: 700; color: var(--status-available);">🟢 Available</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; background: ${fac.status === 'moderate' ? 'var(--status-moderate-bg)' : '#FFFFFF'};">
                    <input type="radio" name="status" value="moderate" ${fac.status === 'moderate' ? 'checked' : ''} />
                    <span style="font-weight: 700; color: var(--status-moderate);">🟡 Moderate</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; background: ${fac.status === 'crowded' ? 'var(--status-crowded-bg)' : '#FFFFFF'};">
                    <input type="radio" name="status" value="crowded" ${fac.status === 'crowded' ? 'checked' : ''} />
                    <span style="font-weight: 700; color: var(--status-crowded);">🔴 Crowded</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; background: ${fac.status === 'closed' ? 'var(--status-closed-bg)' : '#FFFFFF'};">
                    <input type="radio" name="status" value="closed" ${fac.status === 'closed' ? 'checked' : ''} />
                    <span style="font-weight: 700; color: var(--status-closed);">⚪ Closed</span>
                  </label>
                </div>
              </div>

              <!-- Estimated Wait & Headcount -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="wait-input">Est. Wait (minutes) *</label>
                  <input 
                    type="number" 
                    id="wait-input" 
                    name="estimatedWaitMinutes" 
                    class="form-input" 
                    min="0" 
                    max="180" 
                    value="${fac.estimatedWaitMinutes || 0}" 
                    required 
                  />
                  <span style="font-size: 0.68rem; color: var(--muted-text);">Min: 0 mins. No negative numbers allowed.</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="occupancy-input">Current Occupancy *</label>
                  <input 
                    type="number" 
                    id="occupancy-input" 
                    name="approximateOccupancy" 
                    class="form-input" 
                    min="0" 
                    max="${fac.capacity || 500}" 
                    value="${fac.approximateOccupancy || 0}" 
                    required 
                  />
                  <span style="font-size: 0.68rem; color: var(--muted-text);">Capacity: ${fac.capacity} students</span>
                </div>
              </div>

              <!-- Status Note / Announcement -->
              <div class="form-group">
                <label class="form-label" for="note-input">Staff Note / Advisory to Students</label>
                <textarea 
                  id="note-input" 
                  name="statusNote" 
                  class="form-textarea" 
                  rows="3" 
                  placeholder="e.g. Practical examination in progress; back rows free for open lab access..."
                >${fac.statusNote || ''}</textarea>
              </div>

              <div style="font-size: 0.75rem; color: var(--secondary-text); background: #FAFAFC; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-light);">
                Reported by: <strong>${Store.state.currentUser.name}</strong> (${Store.state.currentUser.roleTitle})
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="StaffView.closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="save-status-btn">
                Publish Status Update ${UI.icons.check}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async submitUpdate(event, facilityId) {
    event.preventDefault();
    const form = event.target;
    const btn = document.getElementById('save-status-btn');

    const status = form.status.value;
    const estimatedWaitMinutes = Number(form.estimatedWaitMinutes.value);
    const approximateOccupancy = Number(form.approximateOccupancy.value);
    const statusNote = form.statusNote.value.trim();

    // Strict validation
    if (estimatedWaitMinutes < 0) {
      UI.showToast('Waiting time cannot be negative', 'error');
      return;
    }
    if (approximateOccupancy < 0) {
      UI.showToast('Occupancy count cannot be negative', 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerText = 'Publishing...';

      await Store.updateFacilityStatus(facilityId, {
        status,
        estimatedWaitMinutes,
        approximateOccupancy,
        statusNote
      });

      UI.showToast('Availability status updated and published successfully!', 'success');
      this.closeModal();
      App.render();
    } catch (err) {
      UI.showToast(err.message || 'Error updating status', 'error');
      btn.disabled = false;
      btn.innerText = 'Publish Status Update';
    }
  },

  closeModal(event) {
    if (event && event.target && event.target.className !== 'modal-overlay') return;
    const modal = document.getElementById('update-status-modal');
    if (modal) modal.innerHTML = '';
  },

  openNewFacilityModal() {
    UI.showToast('Facility configuration panel available for Administrators.', 'info');
  }
};
