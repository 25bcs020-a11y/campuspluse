// CampusPulse API Client
const API = {
  baseUrl: window.location.origin,

  async getFacilities(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/api/facilities${queryStr}`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return await res.json();
  },

  async getFacility(id) {
    const res = await fetch(`${this.baseUrl}/api/facilities/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch facility details');
    }
    return await res.json();
  },

  async updateFacilityStatus(id, updateData) {
    const res = await fetch(`${this.baseUrl}/api/facilities/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update facility status');
    }
    return await res.json();
  },

  async createFacility(facilityData) {
    const res = await fetch(`${this.baseUrl}/api/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create facility');
    }
    return await res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${this.baseUrl}/api/users/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update user profile');
    }
    return await res.json();
  },

  async getStats() {
    const res = await fetch(`${this.baseUrl}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch campus statistics');
    return await res.json();
  },

  async getAuditLog() {
    const res = await fetch(`${this.baseUrl}/api/audit-log`);
    if (!res.ok) throw new Error('Failed to fetch audit log');
    return await res.json();
  },

  async getUsers() {
    const res = await fetch(`${this.baseUrl}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  async resetData() {
    const res = await fetch(`${this.baseUrl}/api/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return await res.json();
  }
};
