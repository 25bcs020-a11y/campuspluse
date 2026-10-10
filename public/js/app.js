// CampusPulse Application Router & Orchestrator
const App = {
  currentRoute: 'overview',
  routeParam: null,

  async init() {
    Store.subscribe(() => {
      this.render();
    });

    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    await Store.init();
    this.handleHashChange();
  },

  handleHashChange() {
    const hash = window.location.hash.replace(/^#\/?/, '') || 'overview';
    const parts = hash.split('/');
    this.currentRoute = parts[0] || 'overview';
    this.routeParam = parts[1] || null;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigate(route, param = null) {
    if (param) {
      window.location.hash = `#${route}/${param}`;
    } else {
      window.location.hash = `#${route}`;
    }
  },

  viewFacilityDetail(facilityId) {
    this.navigate('facility', facilityId);
  },

  selectCategory(categoryId) {
    Store.setSelectedCategory(categoryId);
    this.navigate('facilities');
  },

  filterByStatus(status) {
    if (FacilitiesView) {
      FacilitiesView.filterState.status = status;
    }
    this.navigate('facilities');
  },

  async refreshData() {
    UI.showToast('Refreshing campus telemetry...', 'info');
    await Store.refreshData();
    UI.showToast('Campus telemetry refreshed.', 'success');
  },

  openRoleModal() {
    let modal = document.getElementById('role-selector-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'role-selector-modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = LoginModal.render(Store.state.users, Store.state.currentUser ? Store.state.currentUser.id : null);
  },

  toggleMobileSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  },

  closeMobileSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  },

  onGlobalNavSearch(value) {
    Store.setGlobalSearch(value, false);
    if (this.currentRoute !== 'facilities') {
      this.navigate('facilities');
    } else {
      const facilitySearch = document.getElementById('facility-search-input');
      if (facilitySearch && facilitySearch.value !== value) {
        facilitySearch.value = value;
      }
      if (typeof FacilitiesView !== 'undefined' && FacilitiesView.onSearchInput) {
        FacilitiesView.filterState.search = value;
        FacilitiesView.updateGridOnly();
      }
    }
  },

  render() {
    const state = Store.state;
    const appEl = document.getElementById('app-root');
    if (!appEl) return;

    if (state.isLoading && state.facilities.length === 0) {
      appEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; gap: 1rem;">
          <div style="font-family: var(--font-serif-heading); font-size: 1.5rem; color: var(--deep-navy);">CampusPulse</div>
          <div style="font-size: 0.95rem; color: var(--secondary-text);">Loading campus facility intelligence...</div>
        </div>
      `;
      return;
    }

    const user = state.currentUser || { name: 'Student', role: 'student', roleTitle: 'Student' };

    appEl.innerHTML = `
      <div id="app-container">
        
        <!-- Sidebar Navigation -->
        <aside class="app-sidebar">
          <div class="sidebar-header">
            <a href="#overview" class="brand-wrapper" onclick="App.navigate('overview')">
              <div class="brand-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <div class="brand-title">CampusPulse</div>
                <div class="brand-tagline">Know Before You Go</div>
              </div>
            </a>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section-label">Campus Navigation</div>
            
            <a class="nav-item ${this.currentRoute === 'overview' ? 'active' : ''}" onclick="App.navigate('overview')">
              ${UI.icons.dashboard}
              <span>Overview</span>
            </a>

            <a class="nav-item ${this.currentRoute === 'facilities' || this.currentRoute === 'facility' ? 'active' : ''}" onclick="App.navigate('facilities')">
              ${UI.icons.facilities}
              <span>Facilities</span>
              <span class="nav-badge">${state.facilities.length}</span>
            </a>

            <a class="nav-item ${this.currentRoute === 'queue' ? 'active' : ''}" onclick="App.navigate('queue')">
              ${UI.icons.queue}
              <span>Queue Status</span>
              <span class="nav-badge" style="background: var(--light-cyan); color: var(--deep-navy);">Live</span>
            </a>

            <a class="nav-item ${this.currentRoute === 'analytics' ? 'active' : ''}" onclick="App.navigate('analytics')">
              ${UI.icons.analytics}
              <span>Busy Hours & Analytics</span>
            </a>

            <div class="nav-section-label">System</div>

            <a class="nav-item ${this.currentRoute === 'settings' ? 'active' : ''}" onclick="App.navigate('settings')">
              ${UI.icons.settings}
              <span>Settings & Preferences</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="user-mini-card" onclick="App.openRoleModal()" title="Click to switch between Student, Lab Assistant, Facility Supervisor, Chief Administrator">
              <div class="user-avatar-initials">
                ${user.name.charAt(0)}
              </div>
              <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-role-pill">${user.roleTitle || user.role}</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Body Container -->
        <div class="app-main">
          
          <!-- Top Navigation Header -->
          <header class="top-navbar">
            <div class="nav-left">
              <button class="mobile-menu-btn" onclick="App.toggleMobileSidebar()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>

              <!-- Global Search -->
              <div class="nav-search-bar">
                <span class="nav-search-icon">${UI.icons.search}</span>
                <input 
                  type="text" 
                  class="nav-search-input" 
                  placeholder="Search campus facilities..."
                  value="${state.globalSearch}"
                  oninput="App.onGlobalNavSearch(this.value)"
                />
              </div>
            </div>

            <div class="nav-right">
              <!-- Demo Role Switcher Pill -->
              <div class="role-badge-btn" onclick="App.openRoleModal()" title="Switch active campus role">
                <span class="role-indicator-dot"></span>
                <span class="role-text-label">${user.roleTitle || user.name}</span>
                <span style="font-size: 0.7rem; color: var(--secondary-text);">▼</span>
              </div>

              <!-- Refresh Button -->
              <button class="header-action-btn" onclick="App.refreshData()" title="Refresh telemetry">
                ${UI.icons.refresh}
              </button>

              <!-- Notification Bell -->
              <button class="header-action-btn" onclick="UI.showToast('All facility updates and queues are current.', 'info')" title="Notifications">
                ${UI.icons.bell}
              </button>
            </div>
          </header>

          <!-- Main View Route Container -->
          <main class="page-content" onclick="App.closeMobileSidebar()">
            ${this.renderCurrentView(state)}
          </main>

        </div>

      </div>
    `;
  },

  renderCurrentView(state) {
    switch (this.currentRoute) {
      case 'overview':
        return DashboardView.render(state);
      case 'facilities':
        return FacilitiesView.render(state);
      case 'facility':
        return FacilityDetailView.render(state, this.routeParam);
      case 'queue':
        return QueueView.render(state);
      case 'analytics':
        return AnalyticsView.render(state);
      case 'settings':
        return SettingsView.render(state);
      default:
        return DashboardView.render(state);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
