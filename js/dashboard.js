/* ========================================
   Dashboard JavaScript
   ======================================== */

// Dashboard State
const DashboardState = {
    initialized: false,
    activeNav: 'dashboard',
    searchFilter: 'all',
    knowledge: [],
    stats: {
        totalNotes: 0,
        totalVideos: 0,
        aiInsights: 0,
        searchQueries: 0
    }
};

// Global Utilities
const utils = {
    getYouTubeThumbnail: (url) => {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
            /youtube\.com\/shorts\/([^&\s?]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
        }
        return null;
    }
};

const SAMPLES = [
    {
        id: 'sample-1',
        type: 'text',
        title: 'The Philosophy of Deep Work',
        content: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the kind of sense of true fulfillment that comes from craftsmanship.',
        status: 'analyzed',
        createdAt: new Date(Date.now() - 3600000 * 24), // 24h ago
        insights: {
            summary: '(AI Estimated) A framework for high-impact productivity by eliminating distractions and focusing on intensive cognitive tasks.',
            keyPoints: [
                'Ability to master hard things quickly',
                'Ability to produce at an elite level',
                'Deep work vs Shallow work dichotomy'
            ],
            tags: ['Productivity', 'Focus', 'Deep Work'],
            score: 92
        },
        hasInsights: true,
        insightCount: 3
    },
    {
        id: 'sample-2',
        type: 'video',
        title: 'Building AI Agents in 2025',
        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder but looks real
        status: 'analyzed',
        createdAt: new Date(Date.now() - 3600000 * 2), // 2h ago
        insights: {
            summary: '(AI Estimated) An exploration of how autonomous AI agents are transitioning from simple chatbots to advanced reasoning systems capable of executing complex workflows.',
            keyPoints: [
                'Memory management in agentic workflows',
                'Self-correction and reflection loops',
                'Multi-agent orchestration patterns'
            ],
            tags: ['AI', 'Agents', 'Engineering'],
            score: 88
        },
        hasInsights: true,
        insightCount: 3
    }
];

// Initialize Dashboard
// Initialize Dashboard
async function initDashboard() {
    if (DashboardState.initialized) return;

    // 1. Render immediately with Samples (Instant UI)
    DashboardState.knowledge = SAMPLES;
    DashboardState.stats = {
        totalNotes: 1,
        totalVideos: 1,
        aiInsights: 6,
        searchQueries: 12
    };
    renderDashboard();
    DashboardState.initialized = true;

    // 2. Fetch Live Data in Background
    try {
        const response = await window.api.getKnowledge();
        const userItems = (response && response.items) ? response.items.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
            hasInsights: item.status === 'analyzed',
            insightCount: (item.insights?.keyPoints?.length || 0)
        })) : [];

        if (userItems.length > 0) {
            // Combine and Re-render only if we have new data
            const existingIds = new Set(userItems.map(i => i.id));
            const filteredSamples = SAMPLES.filter(s => !existingIds.has(s.id));
            DashboardState.knowledge = [...filteredSamples, ...userItems];

            // Re-calculate stats
            DashboardState.stats = {
                totalNotes: DashboardState.knowledge.filter(k => k.type === 'text').length,
                totalVideos: DashboardState.knowledge.filter(k => k.type === 'video').length,
                aiInsights: DashboardState.knowledge.reduce((acc, k) => acc + (k.insights?.keyPoints?.length || 0), 0),
                searchQueries: 12
            };

            // Update the UI silently
            renderDashboard();
        }
    } catch (error) {

    }
}

// Render Dashboard
function renderDashboard() {
    const dashboardPage = document.getElementById('dashboard-page');
    if (!dashboardPage) return;

    dashboardPage.innerHTML = `
        <div class="dashboard-layout">
            ${renderSidebar()}
            <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
            <main class="main-content">
                ${renderTopHeader()}
                <div class="page-content">
                    <!-- Content will be injected by updatePageContent -->
                </div>
            </main>
        </div>
        ${renderAddKnowledgeModal()}
    `;

    // Inject the correct content after the shell is rendered
    updatePageContent(DashboardState.activeNav);

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.nav === DashboardState.activeNav);
    });

    initDashboardEvents();
}

// Render Sidebar
function renderSidebar() {
    return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <a href="#" class="nav-logo" onclick="showPage('landing'); return false;">
                    <div class="sidebar-logo">
                        <img src="assets/images/logo-cropped.png" alt="SecondBrain Logo">
                    </div>
                </a>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Main</div>
                    <button class="nav-item active" data-nav="dashboard" onclick="setActiveNav('dashboard')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Dashboard</span>
                    </button>
                    <button class="nav-item" data-nav="knowledge" onclick="setActiveNav('knowledge')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <span>Knowledge</span>
                        <span class="nav-badge">${DashboardState.stats.totalNotes + DashboardState.stats.totalVideos}</span>
                    </button>
                    <button class="nav-item" data-nav="videos" onclick="setActiveNav('videos')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <span>Videos</span>
                        <span class="nav-badge">${DashboardState.stats.totalVideos}</span>
                    </button>
                    <button class="nav-item" data-nav="insights" onclick="setActiveNav('insights')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        <span>AI Insights</span>
                    </button>
                </div>
                <div class="nav-section">
                    <div class="nav-section-title">Tools</div>
                    <button class="nav-item" data-nav="settings" onclick="setActiveNav('settings')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        <span>Settings</span>
                    </button>
                </div>
            </nav>
            <div class="sidebar-footer">
                <div class="user-menu">
                    ${renderUserAvatar()}
                    <div class="user-info">
                        <div class="user-name">${AppState.user.name}</div>
                        <div class="user-email">${AppState.user.email}</div>
                    </div>
                    <svg class="user-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </aside>
    `;
}

// Render Top Header
function renderTopHeader() {
    return `
        <header class="top-header">
            <div class="header-left">
                <button class="sidebar-toggle" onclick="toggleSidebar()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <h1 class="page-title">${getPageTitle(DashboardState.activeNav)}</h1>
            </div>
            <div class="search-bar">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" class="input" placeholder="Search your knowledge..." id="global-search" oninput="handleSearch(event)">
                <span class="search-shortcut">⌘K</span>
            </div>
            <div class="header-actions">
                <button class="btn btn-ghost" onclick="toggleTheme()">
                    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                </button>
                <button class="btn btn-primary" onclick="openAddKnowledgeModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add New</span>
                </button>
            </div>
        </header>
    `;
}

// Render Dashboard Content
function renderDashboardContent() {
    return `
        <!-- Stats Grid -->
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div class="stat-card-help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span class="tooltip-text">Digital file cabinet for all your written ideas, snippets, and articles. Captured manually or synced.</span>
                    </div>
                </div>
                <div class="stat-card-value">${DashboardState.stats.totalNotes}</div>
                <div class="stat-card-label">Total Notes</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-icon accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                    </div>
                    <div class="stat-card-help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span class="tooltip-text">Processed video insights. AI extracts summaries, key points, and communication markers from video URLs.</span>
                    </div>
                </div>
                <div class="stat-card-value">${DashboardState.stats.totalVideos}</div>
                <div class="stat-card-label">Videos Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div class="stat-card-help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span class="tooltip-text">Smart summaries, auto-generated tags, and key takeaways created by LLaMA 3.1 to save you time.</span>
                    </div>
                </div>
                <div class="stat-card-value">${DashboardState.stats.aiInsights}</div>
                <div class="stat-card-label">AI Insights</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-icon warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <div class="stat-card-help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span class="tooltip-text">Quickly find and filter through your entire second brain library using our AI-powered semantic search.</span>
                    </div>
                </div>
                <div class="stat-card-value">${DashboardState.stats.searchQueries}</div>
                <div class="stat-card-label">Search Queries</div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="content-section">
            <div class="section-title">
                <h2>Quick Actions</h2>
            </div>
            <div class="quick-actions">
                <button class="quick-action" onclick="openAddKnowledgeModal('text')">
                    <div class="quick-action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <div class="quick-action-content">
                        <h3>Add Text Note</h3>
                        <p>Capture ideas, articles, or notes</p>
                    </div>
                </button>
                <button class="quick-action" onclick="openAddKnowledgeModal('video')">
                    <div class="quick-action-icon accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                    </div>
                    <div class="quick-action-content">
                        <h3>Analyze Video</h3>
                        <p>Get AI insights from video content</p>
                    </div>
                </button>
            </div>
        </div>
        <!-- Recent Activity -->
        <div class="content-section">
            <div class="section-title">
                <h2>Recent Activity</h2>
            </div>
            ${DashboardState.knowledge.length > 0 ? `
                <div style="display:flex;flex-direction:column;gap:var(--spacing-3);">
                    ${[...DashboardState.knowledge]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map(item => {
                    const displayContext = (Array.isArray(item.insights?.summary) ? item.insights.summary[0] : item.insights?.summary) || item.content || '';
                    const truncatedContext = displayContext.length > 70 ? displayContext.substring(0, 70) + '...' : displayContext;

                    return `
                        <div class="activity-card" onclick="viewKnowledge('${item.id}')">
                            <div class="activity-indicator-dot" style="background:${item.status === 'analyzed' ? 'var(--color-success)' : 'var(--color-warning)'}"></div>
                            <div class="activity-content-wrapper">
                                <div class="activity-header-row">
                                    <span class="badge activity-badge badge-${item.type === 'video' ? 'info' : 'success'}">${item.type}</span>
                                    <span class="activity-title-text">${item.title}</span>
                                </div>
                                <p class="activity-preview-text">
                                    ${item.status === 'analyzed' ? 'Insight: ' : ''}${truncatedContext || 'Pending analysis...'}
                                </p>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                                <span class="activity-timestamp">${formatRelativeTime(item.createdAt)}</span>
                                <button class="btn-delete-small" title="Remove" onclick="deleteKnowledgeItem('${item.id}', event)">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
                </div>
            ` : `
                <div class="empty-state" style="padding:var(--spacing-6);">
                    <p>No recent activity yet. Add your first knowledge item to get started!</p>
                </div>
            `}
        </div>
        
        <!-- Recent Knowledge -->
        <div class="content-section">
            <div class="section-title">
                <h2>Recent Knowledge</h2>
                <button class="btn btn-ghost" onclick="setActiveNav('knowledge')">View All</button>
            </div>
            ${DashboardState.knowledge.length > 0 ? `
                <div class="knowledge-grid">
                    ${[...DashboardState.knowledge]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4)
                .map(item => renderKnowledgeCard(item)).join('')}
                </div>
            ` : `
                <div style="padding:var(--spacing-8);text-align:center;color:var(--text-tertiary);">
                    <svg style="width:48px;height:48px;margin-bottom:var(--spacing-4);opacity:0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <h3 style="margin-bottom:var(--spacing-2);">No knowledge yet</h3>
                    <p style="margin-bottom:var(--spacing-4);">Start building your second brain by adding notes or videos</p>
                    <button class="btn btn-primary" onclick="openAddKnowledgeModal()">+ Add Your First Item</button>
                </div>
            `}
        </div>
    `;
}

// Render Knowledge Card
function renderKnowledgeCard(item) {
    const typeIcon = item.type === 'video'
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
           </svg>`;

    const statusBadge = item.status === 'analyzed'
        ? '<span class="badge badge-success">✓ Analyzed</span>'
        : '<span class="badge badge-pending">Pending</span>';

    const preview = item.insights?.summary || item.preview || (item.content ? item.content.substring(0, 120) + '...' : 'Processing content...');

    const thumbnail = item.type === 'video' ? utils.getYouTubeThumbnail(item.content) : null;

    return `
        <article class="knowledge-card card" onclick="viewKnowledge('${item.id}')" style="cursor: pointer;">
            ${thumbnail ? `
                <div style="margin:-1.25rem -1.25rem 1rem -1.25rem;height:140px;overflow:hidden;border-radius:var(--radius-lg) var(--radius-lg) 0 0;background:var(--bg-tertiary);">
                    <img src="${thumbnail}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display='none';">
                </div>
            ` : ''}
            <div class="knowledge-card-header">
                <span class="knowledge-type ${item.type}">
                    ${typeIcon}
                    ${item.type === 'video' ? 'Video' : 'Text'}
                </span>
                <div class="card-header-actions">
                    ${statusBadge}
                    <button class="btn-icon btn-delete" title="Remove" onclick="deleteKnowledgeItem('${item.id}', event)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <h3 class="knowledge-card-title">${item.title}</h3>
            <p class="knowledge-card-preview">${preview}</p>
            <div class="knowledge-card-footer">
                <span class="knowledge-card-date">${formatRelativeTime(item.createdAt)}</span>
                ${item.hasInsights ? `
                    <span class="knowledge-card-insights">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        ${item.insightCount} insights
                    </span>
                ` : ''}
            </div>
        </article>
    `;
}

// Delete Knowledge Item
async function deleteKnowledgeItem(id, event) {
    if (event) event.stopPropagation();

    // Custom confirm style (using browser confirm for now but styled)
    if (!confirm('Are you sure you want to remove this item? This cannot be undone.')) return;

    try {
        await window.api.deleteKnowledge(id);

        // Update state
        DashboardState.knowledge = DashboardState.knowledge.filter(k => k.id !== id);

        // Recalculate stats
        const totalNotes = DashboardState.knowledge.filter(k => k.type === 'text').length;
        const totalVideos = DashboardState.knowledge.filter(k => k.type === 'video').length;
        DashboardState.stats = {
            ...DashboardState.stats,
            totalNotes,
            totalVideos,
            aiInsights: DashboardState.knowledge.reduce((acc, k) => acc + (k.insights?.keyPoints?.length || 0), 0)
        };

        // Refresh UI
        renderDashboard();

        if (typeof showToast === 'function') {
            showToast('Knowledge item removed', 'success');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to remove item', 'error');
        }
    }
}

// Add Knowledge Modal
function renderAddKnowledgeModal() {
    return `
        <div class="modal-overlay" id="add-knowledge-modal">
            <div class="modal scale-in">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;gap:var(--spacing-3);">
                        <div style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--color-primary-100);color:var(--color-primary);display:flex;align-items:center;justify-content:center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h2 class="modal-title">Add New Knowledge</h2>
                    </div>
                    <button class="modal-close" onclick="closeAddKnowledgeModal()" aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="tabs" id="knowledge-type-tabs">
                        <button class="tab active" data-type="text" onclick="setKnowledgeType('text')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:8px;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Text Note
                        </button>
                        <button class="tab" data-type="video" onclick="setKnowledgeType('video')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:8px;">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            YouTube Video
                        </button>
                    </div>
                    
                    <form id="add-knowledge-form" style="margin-top: var(--spacing-6);">
                        <div class="input-group">
                            <label class="input-label" for="knowledge-title">Title</label>
                            <input type="text" class="input" id="knowledge-title" placeholder="e.g., GraphQL Security Patterns" required>
                        </div>
                        
                        <div id="text-content-field" class="input-group">
                            <label class="input-label" for="knowledge-content">Content</label>
                            <textarea class="textarea" id="knowledge-content" placeholder="Paste your text content, notes, or article here... AI will analyze it for you." rows="6"></textarea>
                        </div>
                        
                        <div id="video-content-field" class="input-group" style="display: none;">
                            <label class="input-label" for="knowledge-video-url">Video URL</label>
                            <input type="url" class="input" id="knowledge-video-url" placeholder="Paste YouTube link here...">
                            <p style="font-size:12px;color:var(--text-tertiary);margin-top:var(--spacing-2);">AI will generate a summary and key insights from the video.</p>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" onclick="closeAddKnowledgeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="addKnowledge()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:var(--spacing-2);">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M12 22V12" />
                        </svg>
                        Analyze with AI
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Modal State Management
function openAddKnowledgeModal(type = 'text') {
    // Inject modal if not present
    if (!document.getElementById('add-knowledge-modal')) {
        const modalHtml = renderAddKnowledgeModal();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modal = document.getElementById('add-knowledge-modal');
    modal.classList.add('active');

    // Set initial type
    setKnowledgeType(type);
}

function closeAddKnowledgeModal() {
    const modal = document.getElementById('add-knowledge-modal');
    if (modal) {
        modal.classList.remove('active');
        // Optional: remove from DOM after animation
        setTimeout(() => modal.remove(), 300);
    }
}

function setKnowledgeType(type) {
    // Update tabs
    const tabs = document.querySelectorAll('#knowledge-type-tabs .tab');
    tabs.forEach(tab => {
        if (tab.dataset.type === type) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Toggle fields
    const textField = document.getElementById('text-content-field');
    const videoField = document.getElementById('video-content-field');

    if (type === 'text') {
        if (textField) textField.style.display = 'block';
        if (videoField) videoField.style.display = 'none';
    } else {
        if (textField) textField.style.display = 'none';
        if (videoField) videoField.style.display = 'block';
    }
}

// Dashboard Events
function initDashboardEvents() {
    // Global search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Search page specific events
    const searchInputLarge = document.getElementById('search-input');
    if (searchInputLarge) {
        searchInputLarge.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            performLargeSearch(query);
        }, 300));
    }

    // Search filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            DashboardState.searchFilter = e.target.dataset.filter; // Use dataset.filter for consistency
            const query = document.getElementById('search-input')?.value || '';
            performLargeSearch(query);
        };
    });
}

// Navigation
function setActiveNav(navItem) {
    DashboardState.activeNav = navItem;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.nav === navItem) {
            item.classList.add('active');
        }
    });

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = getPageTitle(navItem);
    }

    // Update content area
    updatePageContent(navItem);
}

function getPageTitle(navItem) {
    const titles = {
        dashboard: 'Dashboard',
        knowledge: 'Knowledge Library',
        videos: 'Video Analysis',
        insights: 'AI Insights',
        search: 'Search',
        settings: 'Settings'
    };
    return titles[navItem] || 'Dashboard';
}

function updatePageContent(navItem) {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return;

    switch (navItem) {
        case 'search':
            pageContent.innerHTML = renderSearchPage();
            break;
        case 'knowledge':
            pageContent.innerHTML = renderKnowledgePage();
            break;
        case 'videos':
            pageContent.innerHTML = renderVideosPage();
            break;
        case 'insights':
            pageContent.innerHTML = renderInsightsPage();
            break;
        case 'settings':
            pageContent.innerHTML = renderSettingsPage();
            break;
        default:
            pageContent.innerHTML = renderDashboardContent();
    }
}

// Search Page
function renderSearchPage() {
    return `
        <div class="search-page fade-in">
            <div class="search-header">
                <div class="search-input-large">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" class="input" placeholder="Search your knowledge base..." id="search-input" autofocus>
                </div>
                <div class="search-filters">
                    <button class="filter-btn ${DashboardState.searchFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                    <button class="filter-btn ${DashboardState.searchFilter === 'text' ? 'active' : ''}" data-filter="text">Text Notes</button>
                    <button class="filter-btn ${DashboardState.searchFilter === 'video' ? 'active' : ''}" data-filter="video">Videos</button>
                    <button class="filter-btn ${DashboardState.searchFilter === 'recent' ? 'active' : ''}" data-filter="recent">Recent</button>
                </div>
            </div>
            <div class="search-results" id="search-results">
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <h3 class="empty-state-title">Search Your Knowledge</h3>
                    <p class="empty-state-text">Type to search through all your notes, videos, and AI-generated insights.</p>
                </div>
            </div>
        </div>
    `;
}

// Knowledge Page
function renderKnowledgePage() {
    const items = DashboardState.knowledge;
    const hasItems = items && items.length > 0;

    const emptyState = `
        <div class="empty-state" style="text-align: center; padding: 4rem 2rem; color: var(--color-text-secondary);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5; margin-bottom: 1rem;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <h3 style="margin-bottom: 0.5rem; color: var(--color-text-primary);">No knowledge yet</h3>
            <p style="margin-bottom: 1.5rem;">Add your first note or video to get started</p>
            <button class="btn btn-primary" onclick="openAddKnowledgeModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Knowledge
            </button>
        </div>
    `;

    const knowledgeList = items.map(item => renderKnowledgeCard(item)).join('');

    return `
        <div class="fade-in">
            <div class="content-section">
                <div class="section-title">
                    <div style="display:flex;align-items:center;gap:var(--spacing-3);">
                        <h2>All Knowledge</h2>
                        <span class="nav-badge" style="position:static;margin:0;">${items.length}</span>
                    </div>
                    <button class="btn btn-primary" onclick="openAddKnowledgeModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add New
                    </button>
                </div>
                ${hasItems ? `<div class="knowledge-grid">${knowledgeList}</div>` : emptyState}
            </div>
        </div>
    `;
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        AppState.sidebarOpen = sidebar.classList.contains('open');
    }
}

// Modal Functions
function openAddKnowledgeModal(type = 'text') {
    const modal = document.getElementById('add-knowledge-modal');
    if (modal) {
        modal.classList.add('active');
        setKnowledgeType(type);
    }
}

function closeAddKnowledgeModal() {
    const modal = document.getElementById('add-knowledge-modal');
    if (modal) {
        modal.classList.remove('active');
        // Reset form
        document.getElementById('add-knowledge-form')?.reset();
    }
}

function setKnowledgeType(type) {
    // Update tabs
    document.querySelectorAll('#knowledge-type-tabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Show/hide fields
    const textField = document.getElementById('text-content-field');
    const videoField = document.getElementById('video-content-field');

    if (textField) textField.style.display = type === 'text' ? 'flex' : 'none';
    if (videoField) videoField.style.display = type === 'video' ? 'flex' : 'none';
}

// Add Knowledge
async function addKnowledge() {
    const titleDom = document.getElementById('knowledge-title');
    const contentDom = document.getElementById('knowledge-content');
    const videoUrlDom = document.getElementById('knowledge-video-url');

    const title = titleDom?.value;
    const textContent = contentDom?.value;
    const videoUrl = videoUrlDom?.value;

    const activeTab = document.querySelector('#knowledge-type-tabs .tab.active');
    const type = activeTab?.dataset.type || 'text';

    if (!title) {
        showToast('Please enter a title', 'error');
        return;
    }

    const content = type === 'text' ? textContent : videoUrl;
    if (!content) {
        showToast(`Please enter ${type === 'text' ? 'some text content' : 'a video URL'}`, 'error');
        return;
    }

    try {
        // Show loading state on button
        const analyzeBtn = document.querySelector('.modal-footer .btn-primary'); // Corrected selector
        const originalBtnText = analyzeBtn?.innerHTML;
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
        }

        showToast('Saving and starting AI analysis...', 'info');

        // 1. Save to backend
        const newItem = await window.api.createKnowledge({
            type,
            title,
            content
        });



        // 2. Trigger analysis
        const analysisResult = await window.api.analyzeKnowledge(newItem.id);


        closeAddKnowledgeModal();

        // 3. Reload data and stats from API
        const [knowledgeRes, statsRes] = await Promise.all([
            window.api.getKnowledge(),
            window.api.getStats()
        ]);

        if (knowledgeRes && knowledgeRes.items) {
            DashboardState.knowledge = knowledgeRes.items.map(item => ({
                ...item,
                createdAt: new Date(item.createdAt),
                hasInsights: item.status === 'analyzed',
                insightCount: item.insights?.keyPoints?.length || 0
            }));
        }

        if (statsRes) {
            DashboardState.stats = statsRes;
        }

        // 4. Refresh the current page view
        renderDashboard();

        showToast('Knowledge analyzed and saved!', 'success');

    } catch (error) {
        console.error('Error adding knowledge:', error);

        // Reset button state
        const analyzeBtn = document.querySelector('.modal-footer .btn-primary'); // Corrected selector
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                </svg>
                Analyze with AI
            `;
        }

        // Show user-friendly error
        const errorMessage = error.message.includes('fetch')
            ? 'Unable to connect to server. Please ensure the backend is running.'
            : error.message;
        showToast('Failed: ' + errorMessage, 'error');
    }
}

// View Knowledge Detail
function viewKnowledge(id) {
    const item = DashboardState.knowledge.find(k => k.id === id);
    if (!item) return;

    showKnowledgeDetail(item);
}

function showKnowledgeDetail(item) {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return;

    pageContent.innerHTML = renderKnowledgeDetail(item);

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'Knowledge Detail';
    }
}

function renderKnowledgeDetail(item) {
    const thumbnail = item.type === 'video' ? utils.getYouTubeThumbnail(item.content) : null;

    return `
        <div class="fade-in">
            <div class="detail-navigation">
                <button class="btn btn-ghost btn-back" onclick="setActiveNav('knowledge')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back to Knowledge
                </button>
            </div>
            
            <div class="detail-layout">
                <div class="detail-main">
                    <header class="detail-header">
                        <div class="detail-meta">
                            <span class="knowledge-type ${item.type}">
                                ${item.type === 'video' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:12px;height:12px;"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> Video' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:12px;height:12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Text Note'}
                            </span>
                            <span class="knowledge-card-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                ${formatRelativeTime(item.createdAt)}
                            </span>
                        </div>
                        <h1 class="detail-title">${item.title}</h1>
                    </header>
                    
                    <div class="detail-content">
                        ${item.type === 'video'
            ? `<div class="video-container">
                                ${thumbnail
                ? `<a href="${item.content}" target="_blank" rel="noopener noreferrer" class="video-link-overlay">
                                        <img src="${thumbnail}" alt="${item.title}" class="video-poster" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                                        <div class="video-fallback">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <div class="play-button-overlay">
                                            <div class="play-button">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                    <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
                                                </svg>
                                            </div>
                                        </div>
                                       </a>`
                : `<div class="video-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:64px;height:64px;opacity:0.3;">
                                            <polygon points="23 7 16 12 23 17 23 7"/>
                                            <rect x="1" y="5" width="15" height="14" rx="2"/>
                                        </svg>
                                        <a href="${item.content}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">Watch Original Video</a>
                                       </div>`
            }
                               </div>`
            : `<div class="detail-text-wrapper"><p class="detail-text">${item.content || 'No content available.'}</p></div>`
        }
                    </div>
                </div>
                
                <div class="insights-sidebar">
                    ${renderInsightCards(item)}
                </div>
            </div>
        </div>
    `;
}

function renderInsightCards(item) {
    const insights = item.insights || {};
    const keyPoints = insights.keyPoints || ['Analysis pending...'];
    const tags = insights.tags || [];
    const communication = insights.communication || null;

    // Generate key points HTML from real API data
    const keyPointsHtml = keyPoints.map(point =>
        `<div class="insight-item">${point}</div>`
    ).join('');

    // Generate tags HTML
    const tagsHtml = tags.length > 0
        ? `<div class="insight-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    // Generate communication scores for videos (using real API values with fallback)
    const renderCommunicationCard = () => {
        if (item.type !== 'video') return '';

        const clarity = communication?.clarity ?? 'N/A';
        const engagement = communication?.engagement ?? 'N/A';
        const structure = communication?.structure ?? 'N/A';

        const getScorePercent = (score) => typeof score === 'number' ? score * 10 : 0;
        const formatScore = (score) => typeof score === 'number' ? `${score.toFixed(1)}/10` : 'AI Estimated';

        return `
        <div class="insight-card">
            <div class="insight-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>Communication Analysis</h3>
            </div>
            <div class="insight-card-body">
                <div class="analysis-scores">
                    <div class="score-item">
                        <div class="score-header">
                            <span class="score-label">Clarity</span>
                            <span class="score-value">${formatScore(clarity)}</span>
                        </div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${getScorePercent(clarity)}%"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-header">
                            <span class="score-label">Engagement</span>
                            <span class="score-value">${formatScore(engagement)}</span>
                        </div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${getScorePercent(engagement)}%"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <div class="score-header">
                            <span class="score-label">Structure</span>
                            <span class="score-value">${formatScore(structure)}</span>
                        </div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${getScorePercent(structure)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    };

    return `
        <div class="insight-card">
            <div class="insight-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <h3>AI Summary</h3>
            </div>
            <div class="insight-card-body">
                <p class="insight-summary">${insights.summary || item.preview || 'Processing...'}</p>
                ${tagsHtml}
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <h3>Key Points</h3>
            </div>
            <div class="insight-card-body">
                <div class="insight-list">
                    ${keyPointsHtml}
                </div>
            </div>
        </div>
        
        ${renderCommunicationCard()}
    `;
}

// Utility Functions
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        // Reset to current page view
        updatePageContent(DashboardState.activeNav);
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = getPageTitle(DashboardState.activeNav);
        }
        return;
    }

    // Filter knowledge items by title or content
    const results = DashboardState.knowledge.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const contentMatch = item.content?.toLowerCase().includes(query);
        // Handle summary being either a string or an array
        const summaryText = Array.isArray(item.insights?.summary)
            ? item.insights.summary.join(' ')
            : (item.insights?.summary || '');
        const summaryMatch = summaryText.toLowerCase().includes(query);
        return titleMatch || contentMatch || summaryMatch;
    });

    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return;

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = results.length > 0
            ? `Search: "${query}" (${results.length} result${results.length !== 1 ? 's' : ''})`
            : `No results for "${query}"`;
    }

    if (results.length === 0) {
        pageContent.innerHTML = `
            <div class="fade-in">
                <div class="empty-state" style="text-align:center;padding:4rem 2rem;">
                    <svg style="width:64px;height:64px;color:var(--text-tertiary);margin-bottom:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <h3 style="margin-bottom:0.5rem;color:var(--text-primary);">No results for "${query}"</h3>
                    <p style="color:var(--text-secondary);">Try "Deep", "AI", or "focus"</p>
                </div>
            </div>
        `;
    } else {
        pageContent.innerHTML = `
            <div class="fade-in">
                <div class="knowledge-grid">
                    ${results.map(item => renderKnowledgeCard(item)).join('')}
                </div>
            </div>
        `;
    }
}

function performLargeSearch(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    let filtered = DashboardState.knowledge;

    // Filter by type
    if (DashboardState.searchFilter === 'text') { // Changed from 'text notes' to 'text' to match data-filter
        filtered = filtered.filter(k => k.type === 'text');
    } else if (DashboardState.searchFilter === 'video') { // Changed from 'videos' to 'video' to match data-filter
        filtered = filtered.filter(k => k.type === 'video');
    } else if (DashboardState.searchFilter === 'recent') {
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Filter by query
    if (query) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(item =>
            item.title?.toLowerCase().includes(q) ||
            item.content?.toLowerCase().includes(q) ||
            item.insights?.summary?.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <h3 class="empty-state-title">No matches found</h3>
                <p class="empty-state-text">Try adjusting your search or filters.</p>
            </div>
        `;
    } else {
        searchResults.innerHTML = `
            <div class="knowledge-grid">
                ${filtered.map(item => renderKnowledgeCard(item)).join('')}
            </div>
        `;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Videos Page
function renderVideosPage() {
    const videos = DashboardState.knowledge.filter(k => k.type === 'video');

    return `
        <div class="fade-in">
            <div class="section-header-row">
                <div style="display:flex;flex-direction:column;gap:var(--spacing-1);">
                    <div style="display:flex;align-items:center;gap:var(--spacing-3);">
                        <h2 style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);margin:0;">Video Analysis</h2>
                        <span class="nav-badge" style="position:static;margin:0;">${videos.length}</span>
                    </div>
                    <p style="color:var(--text-secondary);">AI-powered insights from your video content</p>
                </div>
                <button class="btn btn-primary" onclick="openAddKnowledgeModal('video')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    Add Video
                </button>
            </div>
            
            ${videos.length > 0 ? `
                <div class="knowledge-grid" style="margin-top:var(--spacing-6);">
                    ${videos.map(v => renderKnowledgeCard(v)).join('')}
                </div>
            ` : `
                <div class="empty-state" style="margin-top:var(--spacing-8);">
                    <svg style="width:64px;height:64px;color:var(--text-tertiary);margin-bottom:var(--spacing-4);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    <h3 class="empty-state-title">No videos yet</h3>
                    <p class="empty-state-text">Add a YouTube link or upload a video to get AI analysis</p>
                    <button class="btn btn-primary" onclick="openAddKnowledgeModal('video')">Add Your First Video</button>
                </div>
            `}
        </div>
    `;
}

// AI Insights Page
function renderInsightsPage() {
    // Calculate real stats from knowledge items
    const analyzedItems = DashboardState.knowledge.filter(k => k.status === 'analyzed');
    const totalInsights = analyzedItems.reduce((sum, item) => sum + (item.insights?.keyPoints?.length || 0), 0);
    const uniqueTags = new Set();
    analyzedItems.forEach(item => {
        (item.insights?.tags || []).forEach(tag => uniqueTags.add(tag));
    });
    const topicCount = uniqueTags.size;

    return `
        <div class="fade-in">
            <div style="margin-bottom:var(--spacing-8);">
                <h2 style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);margin-bottom:var(--spacing-1);">AI Insights</h2>
                <p style="color:var(--text-secondary);">Patterns and connections across your knowledge</p>
            </div>
            
            <div class="dashboard-grid" style="margin-bottom:var(--spacing-8);">
                <div class="stat-card">
                    <div class="stat-card-value" style="color:var(--color-primary);">${totalInsights}</div>
                    <div class="stat-card-label">Key Points Extracted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value" style="color:var(--color-accent);">${analyzedItems.length}</div>
                    <div class="stat-card-label">Items Analyzed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value" style="color:var(--color-success);">${DashboardState.knowledge.length}</div>
                    <div class="stat-card-label">Total Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${topicCount}</div>
                    <div class="stat-card-label">Topics Identified</div>
                </div>
            </div>
            
            <div class="insights-layout">
                <div class="card">
                    <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-5);">Recent Insights</h3>
                    <div style="display:flex;flex-direction:column;gap:var(--spacing-4);">
                        ${renderInsightsList()}
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--spacing-5);">
                    <div class="card">
                        <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-4);">Top Topics</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--spacing-3);">
                            ${renderTopTopics()}
                        </div>
                    </div>
                    <div class="card">
                        <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-4);">Suggested</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--spacing-3);font-size:var(--font-size-sm);color:var(--text-secondary);">
                            <div style="display:flex;align-items:center;gap:var(--spacing-2);">
                                <span style="color:var(--color-primary);">→</span>
                                Add notes on GraphQL patterns
                            </div>
                            <div style="display:flex;align-items:center;gap:var(--spacing-2);">
                                <span style="color:var(--color-primary);">→</span>
                                Review unused API design notes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTopTopics() {
    // Count tags across all analyzed items
    const tagCounts = {};
    DashboardState.knowledge.forEach(item => {
        (item.insights?.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    // Sort by count and take top 4
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    if (sortedTags.length === 0) {
        return `<p style="font-size:var(--font-size-sm);color:var(--text-tertiary);">Add knowledge to see topics here</p>`;
    }

    return sortedTags.map(([tag, count]) => `
        <div style="display:flex;justify-content:space-between;font-size:var(--font-size-sm);">
            <span>${tag}</span>
            <span style="color:var(--text-tertiary);">${count} item${count !== 1 ? 's' : ''}</span>
        </div>
    `).join('');
}

function renderInsightsList() {
    // Generate insights from actual knowledge items
    const analyzedItems = DashboardState.knowledge.filter(k => k.status === 'analyzed');

    if (analyzedItems.length === 0) {
        return `
            <div style="padding:var(--spacing-6);text-align:center;color:var(--text-tertiary);">
                <p>Add and analyze content to see AI-generated insights here.</p>
            </div>
        `;
    }

    // Create insights from recent items
    const recentInsights = analyzedItems.slice(0, 6).map(item => ({
        id: item.id,
        title: item.insights?.summary || `Analyzed: ${item.title}`,
        type: item.type === 'video' ? 'video' : 'note',
        time: formatRelativeTime(item.createdAt)
    }));

    return recentInsights.map(i => {
        // Ensure title is a string and handle array if necessary
        const displayTitle = Array.isArray(i.title) ? i.title.join(' ') : String(i.title || '');
        const truncatedTitle = displayTitle.length > 120 ? displayTitle.substring(0, 120) + '...' : displayTitle;

        return `
            <div class="activity-card" onclick="viewKnowledge('${i.id}')" style="background: var(--bg-secondary);">
                <span class="badge activity-badge badge-${i.type === 'video' ? 'info' : 'success'}">${i.type === 'note' ? 'Text' : 'Video'}</span>
                <p style="flex:1;font-size:var(--font-size-sm);line-height:1.4;margin:0;">${truncatedTitle}</p>
                <span style="font-size:var(--font-size-xs);color:var(--text-tertiary);white-space:nowrap;">${i.time}</span>
            </div>
        `;
    }).join('');
}


// Settings Page
function renderSettingsPage() {
    return `
        <div class="fade-in">
            <div style="margin-bottom:var(--spacing-8);">
                <h2 style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);margin-bottom:var(--spacing-1);">Settings</h2>
                <p style="color:var(--text-secondary);">Manage your preferences</p>
                <div style="margin-top:var(--spacing-3);padding:var(--spacing-3) var(--spacing-4);background:var(--color-warning-bg, rgba(234,179,8,0.1));border:1px solid var(--color-warning, #eab308);border-radius:var(--radius-md);display:inline-flex;align-items:center;gap:var(--spacing-2);font-size:var(--font-size-sm);color:var(--text-secondary);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Demo profile — authentication not enabled
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:200px 1fr;gap:var(--spacing-8);">
                <div style="display:flex;flex-direction:column;gap:var(--spacing-1);">
                    <button class="nav-item active" style="text-align:left;">Profile</button>
                    <button class="nav-item" style="text-align:left;">Appearance</button>
                    <button class="nav-item" style="text-align:left;">AI Settings</button>
                    <button class="nav-item" style="text-align:left;">Notifications</button>
                    <button class="nav-item" style="text-align:left;">Data & Privacy</button>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:var(--spacing-6);">
                    <div class="card">
                        <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-5);">Profile Information</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--spacing-5);">
                            <div style="display:flex;align-items:center;gap:var(--spacing-4);">
                                ${renderUserAvatar('avatar-lg')}
                                <input type="file" id="profile-pic-input" style="display:none;" accept="image/*" onchange="handleProfilePicChange(event)">
                                <button class="btn btn-ghost" onclick="document.getElementById('profile-pic-input').click()">Change photo</button>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Full Name</label>
                                <input type="text" id="settings-name" class="input" value="${AppState.user.name}">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Email</label>
                                <input type="email" id="settings-email" class="input" value="${AppState.user.email}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-5);">Appearance</h3>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:var(--font-weight-medium);">Dark Mode</div>
                                <div style="font-size:var(--font-size-sm);color:var(--text-secondary);">Switch between light and dark themes</div>
                            </div>
                            <button class="toggle-switch ${AppState.theme === 'dark' ? 'active' : ''}" onclick="toggleTheme(); this.classList.toggle('active');">
                                <span class="toggle-knob"></span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-5);">AI Preferences</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--spacing-5);">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:var(--font-weight-medium);">Auto-analyze new content</div>
                                    <div style="font-size:var(--font-size-sm);color:var(--text-secondary);">Automatically process content when added</div>
                                </div>
                                <button class="toggle-switch active">
                                    <span class="toggle-knob"></span>
                                </button>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:var(--font-weight-medium);">Video communication feedback</div>
                                    <div style="font-size:var(--font-size-sm);color:var(--text-secondary);">Get speaking and clarity analysis</div>
                                </div>
                                <button class="toggle-switch active">
                                    <span class="toggle-knob"></span>
                                </button>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Summary Length</label>
                                <select class="input">
                                    <option>Concise</option>
                                    <option selected>Balanced</option>
                                    <option>Detailed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:var(--spacing-3);">
                        <button class="btn btn-primary" onclick="saveProfileSettings()">Save Changes</button>
                        <button class="btn btn-ghost" onclick="setActiveNav('dashboard')">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export functions
window.initDashboard = initDashboard;
window.setActiveNav = setActiveNav;
window.toggleSidebar = toggleSidebar;
window.openAddKnowledgeModal = openAddKnowledgeModal;
window.closeAddKnowledgeModal = closeAddKnowledgeModal;
window.setKnowledgeType = setKnowledgeType;
window.addKnowledge = addKnowledge;
window.viewKnowledge = viewKnowledge;
window.deleteKnowledgeItem = deleteKnowledgeItem;
window.handleProfilePicChange = handleProfilePicChange;
window.saveProfileSettings = saveProfileSettings;

// --- Helper Functions ---

function renderUserAvatar(extraClass = '') {
    if (AppState.user.photoUrl) {
        return `<div class="avatar ${extraClass}"><img src="${AppState.user.photoUrl}" alt="${AppState.user.name}"></div>`;
    }
    return `<div class="avatar ${extraClass}">${AppState.user.initials}</div>`;
}

function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            AppState.user.photoUrl = e.target.result;
            localStorage.setItem('user', JSON.stringify(AppState.user));
            // Silent refresh of avatars
            const avatars = document.querySelectorAll('.avatar');
            avatars.forEach(avatar => {
                if (avatar.classList.contains('avatar-lg')) {
                    avatar.innerHTML = `<img src="${AppState.user.photoUrl}" alt="${AppState.user.name}">`;
                } else {
                    avatar.innerHTML = `<img src="${AppState.user.photoUrl}" alt="${AppState.user.name}">`;
                }
            });
            showToast('Photo uploaded!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileSettings() {
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');

    if (!nameInput || !emailInput) return;

    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();

    if (!newName || !newEmail) {
        showToast('Name and email are required', 'error');
        return;
    }

    // Update State
    AppState.user.name = newName;
    AppState.user.email = newEmail;

    // Update Initials
    const names = newName.split(' ');
    AppState.user.initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2);

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(AppState.user));

    // Re-render Shell to update Sidebar
    renderDashboard();

    showToast('Profile updated successfully!', 'success');
}

