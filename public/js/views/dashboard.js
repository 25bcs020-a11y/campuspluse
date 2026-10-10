// View: Main Campus Dashboard
const DashboardView = {
  render(state) {
    const stats = state.stats || {
      total: state.facilities.length,
      available: state.facilities.filter(f => f.status === 'Available').length,
      moderate: state.facilities.filter(f => f.status === 'Moderate Crowd').length,
      crowded: state.facilities.filter(f => f.status === 'Crowded').length
    };

    // The 6 exact Categories
    const categories = [
      { id: 'Library', name: 'Library', desc: 'Central library, quiet study & reading halls' },
      { id: 'Stationery', name: 'Stationery', desc: 'Reprographics, printing, books & lab stationery' },
      { id: 'Computer Lab', name: 'Computer Lab', desc: 'Workstations, programming, AI & systems labs' },
      { id: 'Cafeteria', name: 'Cafeteria', desc: 'Food court, snack bars, mess & dining halls' },
      { id: 'Administrative Office', name: 'Administrative Office', desc: 'Exam cell, registrar, accounts & student desks' },
      { id: 'Other Facilities', name: 'Other Facilities', desc: 'Campus clinic, indoor sports, placement & IT desk' }
    ];

    // Compute category counts
    const counts = {};
    state.facilities.forEach(f => {
      if (f.category) {
        counts[f.category] = (counts[f.category] || 0) + 1;
      }
    });

    // Recently updated facilities
    const recentlyUpdated = [...state.facilities]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 5);

    return `
      <!-- Dashboard Welcome Banner -->
      <div style="background-color: var(--deep-navy); color: #FFFFFF; border-radius: 8px; padding: 2rem; margin-bottom: 2rem; border-left: 6px solid var(--primary-blue); box-shadow: var(--shadow-card);">
        <div style="max-width: 750px;">
          <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(167, 235, 242, 0.15); border: 1px solid var(--light-cyan); color: var(--light-cyan); padding: 0.2rem 0.65rem; border-radius: 4px; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
            CampusPulse Intelligence • Know Before You Go
          </div>
          <h1 style="font-size: 2.1rem; color: #FFFFFF; margin-bottom: 0.5rem; line-height: 1.15;">
            Campus Facility & Queue Intelligence
          </h1>
          <p style="font-size: 1rem; color: #DCE6EC; line-height: 1.5; margin-bottom: 1.25rem;">
            Good morning! Plan your campus visit smarter. Check live workstation availability, crowd levels, and estimated waiting times across academic and service buildings before walking across campus.
          </p>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.navigate('facilities')">
              Browse All Facilities ${UI.icons.arrowRight}
            </button>
            <button class="btn" style="background: rgba(255,255,255,0.1); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.3);" onclick="App.navigate('queue')">
              ${UI.icons.queue} View Queue Status
            </button>
          </div>
        </div>
      </div>

      <!-- Live Summary Cards -->
      <div class="summary-grid">
        <div class="stat-card" onclick="App.navigate('facilities')" style="cursor: pointer;">
          <div class="stat-icon-wrapper">
            ${UI.icons.facilities}
          </div>
          <div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Facilities</div>
          </div>
        </div>

        <div class="stat-card card-available" onclick="App.filterByStatus('Available')" style="cursor: pointer;">
          <div class="stat-icon-wrapper">
            ${UI.icons.check}
          </div>
          <div>
            <div class="stat-value">${stats.available}</div>
            <div class="stat-label">Available Now</div>
          </div>
        </div>

        <div class="stat-card card-moderate" onclick="App.filterByStatus('Moderate Crowd')" style="cursor: pointer;">
          <div class="stat-icon-wrapper">
            ${UI.icons.clock}
          </div>
          <div>
            <div class="stat-value">${stats.moderate}</div>
            <div class="stat-label">Moderate Crowd</div>
          </div>
        </div>

        <div class="stat-card card-crowded" onclick="App.filterByStatus('Crowded')" style="cursor: pointer;">
          <div class="stat-icon-wrapper">
            ${UI.icons.queue}
          </div>
          <div>
            <div class="stat-value">${stats.crowded}</div>
            <div class="stat-label">Crowded / Peak</div>
          </div>
        </div>
      </div>

      <!-- Find Your Next Destination (6 Categories) -->
      <div class="category-section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title">Find Your Next Destination</h2>
            <p style="font-size: 0.9rem; color: var(--secondary-text);">Explore campus buildings by verified facility categories</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('facilities')">
            All Categories (${state.facilities.length}) ${UI.icons.arrowRight}
          </button>
        </div>

        <div class="category-cards-grid">
          ${categories.map(cat => `
            <div class="category-card" onclick="App.selectCategory('${cat.id}')">
              <div class="category-icon-box">
                ${UI.getCategoryIcon(cat.id)}
              </div>
              <div class="category-name">${cat.name}</div>
              <div class="category-count">${counts[cat.id] || 0} locations</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Two Column Layout: Crowd Distribution & Recently Updated -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Live Status Distribution Card -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: var(--deep-navy);">Campus Crowd Overview</h3>
              <p style="font-size: 0.85rem; color: var(--secondary-text);">Real-time status breakdown across monitored facilities</p>
            </div>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--cyan-tint); color: var(--deep-navy); font-weight: 700; border: 1px solid var(--light-cyan);">
              Live Status
            </span>
          </div>

          <!-- Donut chart -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; padding: 1rem 0;">
            <div style="position: relative; width: 130px; height: 130px;">
              <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" stroke-width="4"/>
                ${this.renderDonutSegments(stats)}
              </svg>
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-family: var(--font-serif-heading); font-size: 1.45rem; font-weight: 700; color: var(--deep-navy);">${stats.total}</span>
                <span style="font-size: 0.7rem; color: var(--secondary-text); text-transform: uppercase;">Places</span>
              </div>
            </div>

            <!-- Legend with percentages -->
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--status-available);"></span>
                <span style="color: var(--secondary-text);">Available:</span>
                <strong style="color: var(--deep-navy);">${stats.available} (${Math.round((stats.available/stats.total)*100 || 0)}%)</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--status-moderate);"></span>
                <span style="color: var(--secondary-text);">Moderate:</span>
                <strong style="color: var(--deep-navy);">${stats.moderate} (${Math.round((stats.moderate/stats.total)*100 || 0)}%)</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--status-crowded);"></span>
                <span style="color: var(--secondary-text);">Crowded:</span>
                <strong style="color: var(--deep-navy);">${stats.crowded} (${Math.round((stats.crowded/stats.total)*100 || 0)}%)</strong>
              </div>
            </div>
          </div>

          <!-- Sample Crowd Insight -->
          <div style="background-color: var(--cyan-tint); border: 1px solid var(--light-cyan); border-radius: 6px; padding: 0.85rem 1rem; display: flex; gap: 0.75rem; align-items: flex-start; margin-top: 0.75rem;">
            <div style="color: var(--primary-blue); margin-top: 2px;">
              ${UI.icons.info}
            </div>
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--deep-navy); text-transform: uppercase;">
                Demonstration Insight
              </div>
              <div style="font-size: 0.88rem; color: var(--main-text); margin-top: 0.15rem; line-height: 1.45;">
                Demonstration data indicates peak footfall around the <strong>Main Cafeteria</strong> and <strong>Exam Cell</strong> between 12:30 PM & 2:00 PM. <strong>Computer Labs</strong> and the <strong>Digital E-Library</strong> currently show high availability.
              </div>
            </div>
          </div>
        </div>

        <!-- Recently Updated Facilities -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.15rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: var(--deep-navy);">Recently Updated Facilities</h3>
              <p style="font-size: 0.85rem; color: var(--secondary-text);">Status updates verified by authorized campus personnel</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.refreshData()">
              ${UI.icons.refresh} Refresh
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${recentlyUpdated.map(fac => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-light); background: #FAFCFD; cursor: pointer; transition: all 0.15s ease;"
                   onmouseover="this.style.borderColor='var(--primary-blue)'; this.style.backgroundColor='var(--cyan-tint)';"
                   onmouseout="this.style.borderColor='var(--border-light)'; this.style.backgroundColor='#FAFCFD';"
                   onclick="App.viewFacilityDetail('${fac.id}')">
                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                  <div style="width: 36px; height: 36px; border-radius: 6px; background: var(--cyan-tint); color: var(--deep-navy); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${UI.getCategoryIcon(fac.category)}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-family: var(--font-serif-heading); font-weight: 700; font-size: 0.95rem; color: var(--deep-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${fac.name}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--secondary-text);">
                      <span>${fac.category}</span> • <span>${fac.location || fac.building}</span> • <span>${UI.formatRelativeTime(fac.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${UI.renderStatusBadge(fac.status)}
                  <span style="color: var(--secondary-text);">${UI.icons.arrowRight}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  },

  renderDonutSegments(stats) {
    const total = stats.total || 1;
    const p1 = (stats.available / total) * 100;
    const p2 = (stats.moderate / total) * 100;
    const p3 = (stats.crowded / total) * 100;

    const stroke1 = `${p1} ${100 - p1}`;
    const stroke2 = `${p2} ${100 - p2}`;
    const offset2 = -p1;
    const stroke3 = `${p3} ${100 - p3}`;
    const offset3 = -(p1 + p2);

    return `
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#16A34A" stroke-width="4"
              stroke-dasharray="${stroke1}" stroke-dashoffset="0"/>
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#D97706" stroke-width="4"
              stroke-dasharray="${stroke2}" stroke-dashoffset="${offset2}"/>
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#DC2626" stroke-width="4"
              stroke-dasharray="${stroke3}" stroke-dashoffset="${offset3}"/>
    `;
  }
};
