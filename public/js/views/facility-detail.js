// View: Facility Details Page
const FacilityDetailView = {
  render(state, facilityId) {
    const fac = state.facilities.find(f => f.id === facilityId);

    if (!fac) {
      return `
        <div class="empty-state" style="margin-top: 2rem;">
          <div class="empty-state-icon">${UI.icons.info}</div>
          <h2 class="empty-state-title">Facility Record Not Found</h2>
          <p class="empty-state-desc">The requested facility ID "${facilityId}" does not exist in the active campus directory.</p>
          <button class="btn btn-primary" onclick="App.navigate('facilities')">
            ${UI.icons.arrowLeft} Return to Facilities Directory
          </button>
        </div>
      `;
    }

    const canUpdate = Store.canUpdateFacility(fac);
    const hourlyTrends = fac.hourlyTrends || [15, 30, 50, 70, 75, 80, 75, 65, 50, 35, 20, 10];
    const hoursLabels = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];

    return `
      <!-- Back Navigation & Action Bar -->
      <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <button class="btn btn-secondary btn-sm" onclick="App.navigate('facilities')">
          ${UI.icons.arrowLeft} Back to Facilities
        </button>

        ${canUpdate ? `
          <button class="btn btn-primary btn-sm" onclick="FacilitiesView.openUpdateStatusModal('${fac.id}')">
            ${UI.icons.edit} Update Availability Status
          </button>
        ` : ''}
      </div>

      <!-- Facility Header Banner -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 2rem; margin-bottom: 1.75rem; box-shadow: var(--shadow-card); border-top: 4px solid var(--deep-navy);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="facility-category-badge">
                ${UI.getCategoryIcon(fac.category)}
                ${fac.category}
              </span>
              <span style="font-size: 0.78rem; color: var(--secondary-text); background: var(--main-bg); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
                ID: ${fac.id}
              </span>
            </div>

            <h1 style="font-size: 2rem; color: var(--deep-navy); margin-bottom: 0.5rem;">
              ${fac.name}
            </h1>

            <div style="display: flex; align-items: center; gap: 0.85rem; color: var(--secondary-text); font-size: 0.95rem; flex-wrap: wrap;">
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                ${UI.icons.mapPin}
                ${fac.location || (fac.building + ' • ' + fac.floor)}
              </span>
              <span>•</span>
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                ${UI.icons.clock}
                ${fac.openingHours || '08:30 AM - 05:30 PM'}
              </span>
            </div>
          </div>

          <!-- Status Display -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
            ${UI.renderStatusBadge(fac.status)}
            <span style="font-size: 0.75rem; color: var(--secondary-text);">
              Verified ${UI.formatRelativeTime(fac.updatedAt)}
            </span>
          </div>
        </div>

        <p style="font-size: 1rem; color: var(--main-text); margin-top: 1.25rem; line-height: 1.6; border-top: 1px solid var(--border-light); padding-top: 1.25rem;">
          ${fac.description}
        </p>
      </div>

      <!-- Live Metrics Dashboard Cards -->
      <div class="summary-grid" style="margin-bottom: 1.75rem;">
        
        <!-- Current Capacity / Headcount Card -->
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.4rem;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <span class="stat-label">Current Headcount</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--deep-navy);">${fac.crowdPercentage}% full</span>
          </div>
          <div style="font-size: 1.85rem; font-family: var(--font-serif-heading); font-weight: 700; color: var(--deep-navy);">
            ${fac.approximateOccupancy || 0} <span style="font-size: 1rem; color: var(--secondary-text); font-family: var(--font-serif-body);">/ ${fac.capacity || 50} capacity</span>
          </div>
          <div style="width: 100%; margin-top: 0.25rem;">
            ${UI.renderOccupancyBar(fac.approximateOccupancy, fac.capacity, fac.crowdPercentage)}
          </div>
        </div>

        <!-- Estimated Waiting Time Card -->
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.4rem;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <span class="stat-label">Estimated Queue Wait</span>
            <span style="font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: var(--cyan-tint); color: var(--deep-navy); font-weight: 700;">Estimate</span>
          </div>
          <div style="font-size: 1.85rem; font-family: var(--font-serif-heading); font-weight: 700; color: var(--deep-navy);">
            ${UI.formatWaitTime(fac.estimatedWaitMinutes, fac.status)}
          </div>
          <div style="font-size: 0.82rem; color: var(--secondary-text);">
            Calculated queue duration to access service counter or workstation.
          </div>
        </div>

        <!-- Operating Hours Card -->
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.4rem;">
          <div class="stat-label">Operating Schedule</div>
          <div style="font-size: 1.35rem; font-family: var(--font-serif-heading); font-weight: 700; color: var(--deep-navy); margin-top: 0.15rem;">
            ${fac.openingHours || '08:30 AM - 05:30 PM'}
          </div>
          <div style="font-size: 0.82rem; color: var(--secondary-text);">
            Official campus academic schedule
          </div>
        </div>

        <!-- Verification Record Card -->
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.4rem;">
          <div class="stat-label">Last Updated By</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--deep-navy); margin-top: 0.15rem;">
            ${fac.updatedBy || 'Campus Staff'}
          </div>
          <div style="font-size: 0.78rem; color: var(--secondary-text);">
            Timestamp: ${new Date(fac.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(fac.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>

      </div>

      <!-- Staff Advisory Note -->
      ${fac.statusNote ? `
        <div style="background-color: var(--cyan-tint); border: 1px solid var(--light-cyan); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.75rem; display: flex; gap: 0.85rem; align-items: flex-start;">
          <div style="color: var(--primary-blue); margin-top: 2px;">
            ${UI.icons.info}
          </div>
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--deep-navy); text-transform: uppercase;">
              Active Staff Advisory Note
            </div>
            <div style="font-size: 0.95rem; color: var(--main-text); margin-top: 0.25rem; line-height: 1.5;">
              "${fac.statusNote}"
            </div>
            <div style="font-size: 0.78rem; color: var(--secondary-text); margin-top: 0.35rem;">
              Reported by ${fac.updatedBy || 'Campus Personnel'} • ${UI.formatRelativeTime(fac.updatedAt)}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Hourly Typical Crowd Distribution -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.75rem; box-shadow: var(--shadow-card); margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.3rem; color: var(--deep-navy);">Typical Hourly Footfall Pattern</h3>
            <p style="font-size: 0.88rem; color: var(--secondary-text);">Historical congestion profile across operating hours (8:00 AM – 8:00 PM)</p>
          </div>
          <span style="font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--main-bg); color: var(--secondary-text); border: 1px solid var(--border-color); font-weight: 700;">
            Demonstration Pattern
          </span>
        </div>

        <div style="display: flex; align-items: flex-end; gap: 0.75rem; height: 180px; padding: 1rem 0; border-bottom: 1px solid var(--border-light); overflow-x: auto;">
          ${hourlyTrends.map((val, idx) => {
            let barColor = 'var(--status-available)';
            if (val >= 80) barColor = 'var(--status-crowded)';
            else if (val >= 50) barColor = 'var(--status-moderate)';

            return `
              <div style="flex: 1; min-width: 36px; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--secondary-text); margin-bottom: 0.25rem;">
                  ${val}%
                </span>
                <div style="width: 100%; max-width: 26px; height: ${Math.max(8, val)}%; background: ${barColor}; border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--muted-text); margin-top: 0.5rem; font-weight: 600; white-space: nowrap;">
                  ${hoursLabels[idx]}
                </span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.82rem; color: var(--secondary-text); flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--status-available);"></span> Low (&lt;50%)</span>
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--status-moderate);"></span> Moderate (50-79%)</span>
            <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 8px; height: 8px; border-radius: 2px; background: var(--status-crowded);"></span> High Traffic (&ge;80%)</span>
          </div>
          <span>Recommendation: Schedule visits during lower traffic intervals.</span>
        </div>
      </div>
    `;
  }
};
