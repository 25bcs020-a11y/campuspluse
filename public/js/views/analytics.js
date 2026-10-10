// View: Busy Hours & Campus Analytics
const AnalyticsView = {
  render(state) {
    const facilities = state.facilities;

    // Group facilities by the 6 exact categories
    const categoryStats = {};
    facilities.forEach(f => {
      const cat = f.category || 'Other Facilities';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, available: 0, moderate: 0, crowded: 0, totalWait: 0 };
      }
      categoryStats[cat].total++;
      if (f.status === 'Available') categoryStats[cat].available++;
      else if (f.status === 'Moderate Crowd') categoryStats[cat].moderate++;
      else if (f.status === 'Crowded') categoryStats[cat].crowded++;
      categoryStats[cat].totalWait += (f.estimatedWaitMinutes || 0);
    });

    // Top 5 locations with highest crowd percentage
    const busiest = [...facilities]
      .sort((a, b) => (b.crowdPercentage || 0) - (a.crowdPercentage || 0))
      .slice(0, 5);

    // Days of the week traffic pattern
    const weeklyPattern = [
      { day: 'Monday', traffic: 84, peak: '12:00 PM – 2:00 PM', desc: 'Heavy cafeteria & lab usage' },
      { day: 'Tuesday', traffic: 89, peak: '11:30 AM – 1:30 PM', desc: 'Peak weekday footfall' },
      { day: 'Wednesday', traffic: 82, peak: '01:00 PM – 3:00 PM', desc: 'Midweek lab practical slots' },
      { day: 'Thursday', traffic: 76, peak: '12:30 PM – 2:00 PM', desc: 'Balanced campus traffic' },
      { day: 'Friday', traffic: 85, peak: '02:00 PM – 4:30 PM', desc: 'Afternoon library & sports rush' },
      { day: 'Saturday', traffic: 45, peak: '10:00 AM – 1:00 PM', desc: 'Weekend self-study & reading hall' }
    ];

    return `
      <!-- Header -->
      <div class="page-header-box">
        <div>
          <h1 class="page-title">Busy Hours & Analytics</h1>
          <p class="page-subtitle">Understand campus traffic flow, weekly congestion patterns, and peak service periods.</p>
        </div>

        <span style="font-size: 0.78rem; padding: 0.25rem 0.65rem; border-radius: 4px; background: var(--cyan-tint); color: var(--deep-navy); font-weight: 700; border: 1px solid var(--light-cyan);">
          Analytical Telemetry
        </span>
      </div>

      <!-- Actionable Insights Banner -->
      <div style="background-color: var(--deep-navy); color: #FFFFFF; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; border-left: 6px solid var(--primary-blue); box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div style="max-width: 720px;">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; background: rgba(167, 235, 242, 0.15); color: var(--light-cyan); padding: 0.2rem 0.55rem; border-radius: 4px; margin-bottom: 0.5rem; border: 1px solid var(--light-cyan);">
              Campus Intelligence Advisory
            </div>
            <h3 style="font-size: 1.4rem; color: #FFFFFF; margin-bottom: 0.4rem;">
              Peak Service Period Notice: 12:30 PM – 2:00 PM
            </h3>
            <p style="font-size: 0.95rem; color: #DCE6EC; line-height: 1.5;">
              Demonstration data indicates the <strong>Main Cafeteria</strong> and <strong>Controller of Examinations</strong> experience peak queues during midday hours. Visit the <strong>North Academic Quad Snack Bar</strong> for faster service, and consider utilizing <strong>Computer Labs</strong> during off-peak morning windows.
            </p>
          </div>
          <button class="btn btn-primary" onclick="App.navigate('queue')">
            View Live Queues ${UI.icons.arrowRight}
          </button>
        </div>
      </div>

      <!-- Two-Column Analytics Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Weekly Congestion Trends -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: var(--deep-navy);">Weekly Congestion Patterns</h3>
              <p style="font-size: 0.85rem; color: var(--secondary-text);">Aggregate traffic volume across campus academic buildings</p>
            </div>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: var(--main-bg); color: var(--secondary-text); border: 1px solid var(--border-color); font-weight: 700;">
              Demonstration Data
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${weeklyPattern.map(item => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                  <span style="font-weight: 700; color: var(--deep-navy);">${item.day} • <span style="font-weight: 400; color: var(--secondary-text);">${item.desc}</span></span>
                  <span style="font-weight: 700; color: ${item.traffic > 85 ? 'var(--status-crowded)' : 'var(--deep-navy)'};">${item.traffic}% avg</span>
                </div>
                <div class="progress-track" style="height: 6px;">
                  <div class="progress-fill ${item.traffic > 85 ? 'fill-crowded' : 'fill-moderate'}" style="width: ${item.traffic}%;"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--muted-text); margin-top: 0.2rem;">
                  Peak Interval: <strong>${item.peak}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Highest Capacity Pressure Points -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: var(--deep-navy);">High Utilization Locations</h3>
              <p style="font-size: 0.85rem; color: var(--secondary-text);">Facilities currently operating near peak capacity</p>
            </div>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #FEE2E2; color: #991B1B; font-weight: 700;">
              High Load
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${busiest.map(fac => `
              <div style="padding: 0.75rem; border-radius: 6px; background: #FAFCFD; border: 1px solid var(--border-light); cursor: pointer;"
                   onclick="App.viewFacilityDetail('${fac.id}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                  <div>
                    <div style="font-family: var(--font-serif-heading); font-weight: 700; font-size: 0.95rem; color: var(--deep-navy);">${fac.name}</div>
                    <div style="font-size: 0.8rem; color: var(--secondary-text);">${fac.category} • Est. Wait: <strong>${fac.estimatedWaitMinutes} mins</strong></div>
                  </div>
                  <span style="font-size: 0.9rem; font-weight: 700; color: var(--status-crowded);">${fac.crowdPercentage}%</span>
                </div>
                <div class="progress-track" style="height: 5px;">
                  <div class="progress-fill ${fac.crowdPercentage >= 80 ? 'fill-crowded' : 'fill-moderate'}" style="width: ${fac.crowdPercentage}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Category Load Breakdown Table -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.75rem; box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--deep-navy);">Category Utilization Summary</h3>
            <p style="font-size: 0.85rem; color: var(--secondary-text);">Aggregated status across the 6 major campus facility domains</p>
          </div>
          <span style="font-size: 0.78rem; color: var(--secondary-text);">
            Total Facilities: ${facilities.length}
          </span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Facility Category</th>
                <th>Total Managed</th>
                <th>Available</th>
                <th>Moderate Crowd</th>
                <th>Crowded</th>
                <th>Avg Wait Time</th>
                <th>Overall Status</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(categoryStats).map(([cat, d]) => {
                const avgWait = d.total > 0 ? Math.round(d.totalWait / d.total) : 0;
                let health = '🟢 Normal';
                if (d.crowded > d.available) health = '🔴 High Queue';
                else if (d.moderate > d.available) health = '🟡 Moderate';

                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: var(--deep-navy);">
                        ${UI.getCategoryIcon(cat)}
                        <span>${cat}</span>
                      </div>
                    </td>
                    <td><strong>${d.total}</strong></td>
                    <td><span style="color: var(--status-available); font-weight: 700;">${d.available}</span></td>
                    <td><span style="color: var(--status-moderate); font-weight: 700;">${d.moderate}</span></td>
                    <td><span style="color: var(--status-crowded); font-weight: 700;">${d.crowded}</span></td>
                    <td>~${avgWait} mins</td>
                    <td style="font-size: 0.85rem; font-weight: 600;">${health}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
