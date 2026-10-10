// View: Settings & Preferences
const SettingsView = {
  render(state) {
    const user = state.currentUser || { name: 'Student', email: 'student@campus.edu', role: 'student', roleTitle: 'Student' };

    return `
      <!-- Header -->
      <div class="page-header-box">
        <div>
          <h1 class="page-title">Settings & Preferences</h1>
          <p class="page-subtitle">Configure your profile, institutional email, notification thresholds, and demonstration dataset.</p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="SettingsView.cancelChanges()">
            Cancel
          </button>
          <button class="btn btn-primary" id="btn-save-settings" onclick="SettingsView.saveSettings()">
            ${UI.icons.check} Save Changes
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Profile Card -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: var(--deep-navy);">Active Profile Details</h3>
              <p style="font-size: 0.82rem; color: var(--secondary-text);">Edit your account information and contact email</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.openRoleModal()">
              Switch Role
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-light);">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--deep-navy); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-family: var(--font-serif-heading); font-weight: 700;">
              ${user.name.charAt(0)}
            </div>
            <div>
              <div style="font-family: var(--font-serif-heading); font-size: 1.2rem; font-weight: 700; color: var(--deep-navy);">${user.name}</div>
              <div style="font-size: 0.82rem; color: var(--primary-blue); font-weight: 700;">${user.roleTitle || user.role}</div>
              <div style="font-size: 0.78rem; color: var(--secondary-text);">${user.email}</div>
            </div>
          </div>

          <form id="profile-settings-form" onsubmit="event.preventDefault(); SettingsView.saveSettings();">
            <div class="form-group">
              <label class="form-label" for="setting-name">Full Name *</label>
              <input type="text" id="setting-name" class="form-input" value="${user.name}" required />
            </div>

            <!-- Editable Institutional Email -->
            <div class="form-group">
              <label class="form-label" for="setting-email">Institutional Email *</label>
              <input 
                type="email" 
                id="setting-email" 
                class="form-input" 
                value="${user.email}" 
                placeholder="e.g. name@campus.edu" 
                required 
              />
              <span style="font-size: 0.76rem; color: var(--secondary-text);">Used for queue updates, notifications, and telemetry audits.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="setting-dept">Affiliated Department</label>
              <input type="text" id="setting-dept" class="form-input" value="${user.department || 'Campus Department'}" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="SettingsView.cancelChanges()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary btn-sm">
                ${UI.icons.check} Save Profile
              </button>
            </div>
          </form>
        </div>

        <!-- Notification Preferences Card -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <h3 style="font-size: 1.2rem; color: var(--deep-navy); margin-bottom: 0.25rem;">Notification Preferences</h3>
          <p style="font-size: 0.85rem; color: var(--secondary-text); margin-bottom: 1.25rem;">Real-time campus availability notifications</p>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="notify-avail" checked style="margin-top: 4px; accent-color: var(--primary-blue);" />
              <div>
                <div style="font-size: 0.92rem; font-weight: 700; color: var(--deep-navy);">Workstation Availability Alerts</div>
                <div style="font-size: 0.8rem; color: var(--secondary-text);">Get notified when computer labs or study spaces drop below 50% capacity.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="notify-canteen" checked style="margin-top: 4px; accent-color: var(--primary-blue);" />
              <div>
                <div style="font-size: 0.92rem; font-weight: 700; color: var(--deep-navy);">Cafeteria Queue Alerts</div>
                <div style="font-size: 0.8rem; color: var(--secondary-text);">Receive notifications when cafeteria waiting times exceed 15 minutes.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="notify-staff" checked style="margin-top: 4px; accent-color: var(--primary-blue);" />
              <div>
                <div style="font-size: 0.92rem; font-weight: 700; color: var(--deep-navy);">Administrative Advisories</div>
                <div style="font-size: 0.8rem; color: var(--secondary-text);">Receive notices regarding examination cell token queues and special hours.</div>
              </div>
            </label>
          </div>
        </div>

      </div>

      <!-- Demo Reset Controls -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.75rem; box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; color: var(--deep-navy); background: var(--cyan-tint); border: 1px solid var(--light-cyan); padding: 0.15rem 0.5rem; border-radius: 4px; margin-bottom: 0.5rem;">
              Demonstration & Evaluation Controls
            </div>
            <h3 style="font-size: 1.25rem; color: var(--deep-navy);">Reset CampusPulse Demo Dataset</h3>
            <p style="font-size: 0.9rem; color: var(--secondary-text); margin-top: 0.25rem; max-width: 620px;">
              Restore all campus facilities, initial crowd levels, waiting times, and audit logs to the clean default demonstration state at any time.
            </p>
          </div>

          <button class="btn btn-secondary" onclick="SettingsView.resetDemoData()" style="color: var(--status-crowded); border-color: #FECACA;">
            ${UI.icons.refresh} Reset All Demo Data
          </button>
        </div>
      </div>
    `;
  },

  async saveSettings() {
    const nameInput = document.getElementById('setting-name');
    const emailInput = document.getElementById('setting-email');
    const deptInput = document.getElementById('setting-dept');
    const btn = document.getElementById('btn-save-settings');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const department = deptInput ? deptInput.value.trim() : '';

    if (!name) {
      UI.showToast('Full Name is required.', 'error');
      if (nameInput) nameInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      UI.showToast('Please provide a valid institutional email address (e.g. name@campus.edu).', 'error');
      if (emailInput) {
        emailInput.style.borderColor = 'var(--status-crowded)';
        emailInput.focus();
      }
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Saving Changes...';
      }

      await Store.updateUserProfile(Store.state.currentUser.id, {
        name,
        email,
        department
      });

      UI.showToast('Profile and institutional email updated successfully!', 'success');
      App.render();
    } catch (err) {
      UI.showToast(err.message || 'Failed to update profile.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `${UI.icons.check} Save Changes`;
      }
    }
  },

  cancelChanges() {
    App.render();
    UI.showToast('Changes discarded.', 'info');
  },

  async resetDemoData() {
    if (!confirm('Reset all facilities, waiting times, and logs back to the clean default state?')) return;
    try {
      await Store.resetData();
      UI.showToast('CampusPulse dataset restored to default state.', 'success');
      App.render();
    } catch (e) {
      UI.showToast('Failed to reset dataset: ' + e.message, 'error');
    }
  }
};
