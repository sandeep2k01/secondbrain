// API client for backend communication
const API_BASE = 'http://localhost:3001/api';

const api = {
    // List knowledge items
    async getKnowledge(options = {}) {
        const params = new URLSearchParams();
        if (options.type) params.set('type', options.type);
        if (options.limit) params.set('limit', options.limit);

        const res = await fetch(`${API_BASE}/knowledge?${params}`);
        if (!res.ok) throw new Error('Failed to fetch knowledge');
        return res.json();
    },

    // Get single knowledge item
    async getKnowledgeById(id) {
        const res = await fetch(`${API_BASE}/knowledge/${id}`);
        if (!res.ok) throw new Error('Item not found');
        return res.json();
    },

    // Create new knowledge item
    async createKnowledge(data) {
        const res = await fetch(`${API_BASE}/knowledge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create knowledge');
        return res.json();
    },

    // Trigger AI analysis
    async analyzeKnowledge(id) {
        const res = await fetch(`${API_BASE}/knowledge/${id}/analyze`, { method: 'POST' });
        if (!res.ok) throw new Error('AI analysis failed');
        return res.json();
    },

    // Delete knowledge item
    async deleteKnowledge(id) {
        const res = await fetch(`${API_BASE}/knowledge/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete knowledge');
        return res.json();
    },

    // Get dashboard stats
    async getStats() {
        const res = await fetch(`${API_BASE}/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    // Get all AI insights
    async getInsights() {
        const res = await fetch(`${API_BASE}/insights`);
        if (!res.ok) throw new Error('Failed to fetch insights');
        return res.json();
    }
};

// Export
window.api = api;
