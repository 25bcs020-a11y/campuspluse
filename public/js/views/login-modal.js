// View: Role Selector & Demo Authentication Modal
const LoginModal = {
  render(users, currentUserId) {
    return `
      <div class="modal-overlay" onclick="LoginModal.close(event)">
        <div class="modal-card" style="max-width: 520px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; color: var(--light-cyan);">
                CampusPulse Identity & Access Portal
              </div>
              <h2 class="modal-title" style="margin-top: 0.15rem;">
                Select Role Experience
              </h2>
              <div style="font-size: 0.85rem; color: #E0EDF5;">
                Know Before You Go. Your Campus, At a Glance.
              </div>
            </div>
            <button class="modal-close-btn" onclick="LoginModal.close()">
              ${UI.icons.close}
            </button>
          </div>

          <div class="modal-body">
            <div style="background: var(--cyan-tint); border: 1px solid var(--light-cyan); border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.88rem; color: var(--deep-navy);">
              <strong>Role-Based Access Control:</strong> Select one of the four verified campus roles to test permission boundaries, common facility management, and student views.
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${users.map(u => {
                const isActive = u.id === currentUserId;
                let roleIcon = '🎓';
                if (u.role === 'lab_assistant') roleIcon = '🔬';
                if (u.role === 'facility_supervisor') roleIcon = '🏢';
                if (u.role === 'chief_administrator') roleIcon = '⚙️';

                return `
                  <div 
                    style="border: 2px solid ${isActive ? 'var(--primary-blue)' : 'var(--border-color)'}; background: ${isActive ? 'var(--cyan-tint)' : '#FFFFFF'}; border-radius: 8px; padding: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.15s ease;"
                    onmouseover="if(!${isActive}) this.style.borderColor='var(--primary-blue)';"
                    onmouseout="if(!${isActive}) this.style.borderColor='var(--border-color)';"
                    onclick="LoginModal.selectUser('${u.id}')"
                  >
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <div style="font-size: 1.5rem; width: 44px; height: 44px; border-radius: 6px; background: var(--main-bg); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                        ${roleIcon}
                      </div>
                      <div>
                        <div style="font-family: var(--font-serif-heading); font-weight: 700; font-size: 1.05rem; color: var(--deep-navy); display: flex; align-items: center; gap: 0.4rem;">
                          ${u.name}
                          ${isActive ? '<span style="font-family: var(--font-serif-body); font-size: 0.68rem; background: var(--deep-navy); color: #fff; padding: 0.1rem 0.45rem; border-radius: 4px;">ACTIVE</span>' : ''}
                        </div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary-blue);">
                          ${u.roleTitle || u.role}
                        </div>
                        <div style="font-size: 0.78rem; color: var(--secondary-text);">
                          ${u.department} • ${u.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}">
                        ${isActive ? 'Selected' : 'Switch'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <span style="font-size: 0.8rem; color: var(--secondary-text);">Select any profile to test live access checks</span>
            <button class="btn btn-secondary btn-sm" onclick="LoginModal.close()">
              Close Window
            </button>
          </div>
        </div>
      </div>
    `;
  },

  selectUser(userId) {
    Store.setCurrentUser(userId);
    UI.showToast(`Active session switched to ${Store.state.currentUser.name} (${Store.state.currentUser.roleTitle})`, 'success');
    this.close();
    App.render();
  },

  close(event) {
    if (event && event.target && event.target.className !== 'modal-overlay') return;
    const modal = document.getElementById('role-selector-modal');
    if (modal) modal.innerHTML = '';
  }
};
