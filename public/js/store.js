// CampusPulse Central State Management
const Store = {
  state: {
    facilities: [],
    users: [],
    currentUser: null,
    stats: null,
    auditLog: [],
    selectedCategory: 'all',
    globalSearch: '',
    isLoading: true,
    error: null
  },

  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (e) { console.error('Listener error:', e); }
    });
  },

  async init() {
    try {
      this.state.isLoading = true;
      this.notify();

      // Fetch users
      const users = await API.getUsers();
      this.state.users = users;

      // Restore saved user or default to student
      const savedUserId = localStorage.getItem('campuspulse_user_id');
      const foundUser = users.find(u => u.id === savedUserId);
      this.state.currentUser = foundUser || users[0] || {
        id: 'user-student-1',
        name: 'Priya Sharma',
        role: 'student',
        roleTitle: 'Student',
        department: 'Computer Science & Engineering'
      };

      await this.refreshData();
    } catch (err) {
      console.error('Store init error:', err);
      this.state.error = err.message;
      this.state.isLoading = false;
      this.notify();
    }
  },

  async refreshData() {
    try {
      const [facilities, stats, auditLog] = await Promise.all([
        API.getFacilities(),
        API.getStats(),
        API.getAuditLog()
      ]);

      this.state.facilities = facilities;
      this.state.stats = stats;
      this.state.auditLog = auditLog;
      this.state.isLoading = false;
      this.state.error = null;
      this.notify();
    } catch (err) {
      console.error('Error refreshing data:', err);
      this.state.error = err.message;
      this.state.isLoading = false;
      this.notify();
    }
  },

  setCurrentUser(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      localStorage.setItem('campuspulse_user_id', user.id);
      this.notify();
    }
  },

  setSelectedCategory(cat) {
    this.state.selectedCategory = cat;
    this.notify();
  },

  setGlobalSearch(query, triggerNotify = false) {
    this.state.globalSearch = query;
    if (triggerNotify) {
      this.notify();
    }
  },

  async updateUserProfile(userId, profileData) {
    const targetId = userId || (this.state.currentUser ? this.state.currentUser.id : null);
    const res = await API.updateProfile({
      userId: targetId,
      ...profileData
    });
    if (res.user) {
      const idx = this.state.users.findIndex(u => u.id === res.user.id);
      if (idx !== -1) {
        this.state.users[idx] = res.user;
      }
      if (this.state.currentUser && this.state.currentUser.id === res.user.id) {
        this.state.currentUser = { ...this.state.currentUser, ...res.user };
      }
      this.notify();
    }
    return res;
  },

  // Role Permission Checks
  canAddFacility() {
    if (!this.state.currentUser) return false;
    const role = this.state.currentUser.role;
    return role === 'chief_administrator' || role === 'facility_supervisor';
  },

  canUpdateFacility(facility) {
    if (!this.state.currentUser || !facility) return false;
    const role = this.state.currentUser.role;

    if (role === 'student') return false;
    if (role === 'chief_administrator') return true;

    const assigned = this.state.currentUser.assignedFacilities || [];
    if (assigned.includes('*')) return true;

    if (role === 'facility_supervisor') {
      return assigned.includes(facility.id);
    }

    if (role === 'lab_assistant') {
      // Lab assistant only manages specifically assigned lab facilities
      return assigned.includes(facility.id);
    }

    return false;
  },

  canDeleteFacility() {
    if (!this.state.currentUser) return false;
    return this.state.currentUser.role === 'chief_administrator';
  },

  async addFacility(facilityData) {
    if (!this.canAddFacility()) {
      throw new Error('Unauthorized: Your role does not have permission to add new facilities.');
    }

    const author = this.state.currentUser
      ? `${this.state.currentUser.name} (${this.state.currentUser.roleTitle})`
      : 'Campus Administrator';

    const payload = {
      ...facilityData,
      updatedBy: author
    };

    const res = await API.createFacility(payload);
    if (res.facility) {
      this.state.facilities.unshift(res.facility);
      this.state.stats = await API.getStats();
      this.notify();
    }
    return res;
  },

  async updateFacilityStatus(facilityId, updatePayload) {
    const fac = this.getFacilityById(facilityId);
    if (!fac || !this.canUpdateFacility(fac)) {
      throw new Error('Unauthorized: You do not have permission to update this facility.');
    }

    const author = this.state.currentUser
      ? `${this.state.currentUser.name} (${this.state.currentUser.roleTitle})`
      : 'Campus Staff';

    const payload = {
      ...updatePayload,
      updatedBy: author
    };

    const result = await API.updateFacilityStatus(facilityId, payload);

    const index = this.state.facilities.findIndex(f => f.id === facilityId);
    if (index !== -1 && result.facility) {
      this.state.facilities[index] = result.facility;
    }

    if (result.audit) {
      this.state.auditLog.unshift(result.audit);
    }

    this.state.stats = await API.getStats();
    this.notify();
    return result;
  },

  async resetData() {
    await API.resetData();
    await this.refreshData();
  },

  getFacilityById(id) {
    return this.state.facilities.find(f => f.id === id);
  }
};
