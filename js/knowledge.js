/* ========================================
   Knowledge Management JavaScript
   ======================================== */

// Knowledge State
const KnowledgeState = {
    currentItem: null,
    processingQueue: [],
    isProcessing: false
};

// AI Processing Simulation
function simulateAIProcessing(item) {
    return new Promise((resolve) => {
        // Simulate varying processing times
        const processingTime = item.type === 'video' ? 3000 : 1500;

        setTimeout(() => {
            const insights = generateMockInsights(item);
            resolve({
                ...item,
                insights,
                processed: true,
                processedAt: new Date()
            });
        }, processingTime);
    });
}

// Generate Mock AI Insights
function generateMockInsights(item) {
    const summaries = [
        'This content covers essential concepts with practical applications. Key takeaways include implementation strategies and common pitfalls to avoid.',
        'Comprehensive overview of the topic with expert-level insights. The content is well-structured and provides actionable recommendations.',
        'In-depth analysis with clear explanations. The author provides valuable perspectives on best practices and emerging trends.'
    ];

    const keyPoints = [
        'Core concepts explained with clarity',
        'Practical implementation examples provided',
        'Best practices for scalability discussed',
        'Common mistakes and how to avoid them',
        'Future trends and considerations'
    ];

    const videoInsights = item.type === 'video' ? {
        communication: {
            clarity: (Math.random() * 2 + 7.5).toFixed(1),
            engagement: (Math.random() * 2 + 7.5).toFixed(1),
            structure: (Math.random() * 2 + 7).toFixed(1),
            pace: (Math.random() * 2 + 7.5).toFixed(1)
        },
        duration: '12:34',
        transcript: 'Full transcript available...'
    } : {};

    return {
        summary: summaries[Math.floor(Math.random() * summaries.length)],
        keyPoints: keyPoints.slice(0, Math.floor(Math.random() * 3) + 3),
        tags: ['development', 'best-practices', 'tutorial'],
        sentiment: 'informative',
        readingTime: item.type === 'text' ? `${Math.floor(Math.random() * 8) + 3} min read` : null,
        ...videoInsights
    };
}

// Knowledge Search Functionality
function searchKnowledge(query, filters = {}) {
    if (!query || query.length < 2) {
        return [];
    }

    const normalizedQuery = query.toLowerCase();

    return DashboardState.knowledge.filter(item => {
        // Apply type filter
        if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
            return false;
        }

        // Search in title and preview
        const matchesTitle = item.title.toLowerCase().includes(normalizedQuery);
        const matchesPreview = item.preview.toLowerCase().includes(normalizedQuery);
        const matchesContent = item.content?.toLowerCase().includes(normalizedQuery);

        return matchesTitle || matchesPreview || matchesContent;
    });
}

// Render Video Analysis View
function renderVideoAnalysis(item) {
    if (item.type !== 'video') return '';

    const insights = item.insights || {};
    const communication = insights.communication || {};

    return `
        <div class="video-analysis fade-in">
            <div class="analysis-header">
                <div class="analysis-status success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Analysis Complete
                </div>
                <span class="analysis-duration">${insights.duration || '00:00'}</span>
            </div>
            
            <div class="analysis-grid">
                <div class="analysis-card">
                    <h4>Video Summary</h4>
                    <p>${insights.summary || 'AI summary will appear here after processing.'}</p>
                </div>
                
                <div class="analysis-card">
                    <h4>Communication Feedback</h4>
                    <div class="communication-scores">
                        <div class="comm-score">
                            <span class="comm-label">Clarity</span>
                            <div class="comm-bar">
                                <div class="comm-fill" style="width: ${(communication.clarity / 10 * 100) || 0}%"></div>
                            </div>
                            <span class="comm-value">${communication.clarity || '-'}/10</span>
                        </div>
                        <div class="comm-score">
                            <span class="comm-label">Engagement</span>
                            <div class="comm-bar">
                                <div class="comm-fill" style="width: ${(communication.engagement / 10 * 100) || 0}%"></div>
                            </div>
                            <span class="comm-value">${communication.engagement || '-'}/10</span>
                        </div>
                        <div class="comm-score">
                            <span class="comm-label">Structure</span>
                            <div class="comm-bar">
                                <div class="comm-fill" style="width: ${(communication.structure / 10 * 100) || 0}%"></div>
                            </div>
                            <span class="comm-value">${communication.structure || '-'}/10</span>
                        </div>
                        <div class="comm-score">
                            <span class="comm-label">Pace</span>
                            <div class="comm-bar">
                                <div class="comm-fill" style="width: ${(communication.pace / 10 * 100) || 0}%"></div>
                            </div>
                            <span class="comm-value">${communication.pace || '-'}/10</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <h4>Tone Analysis</h4>
                    <div class="tone-tags">
                        <span class="tone-tag professional">Professional</span>
                        <span class="tone-tag informative">Informative</span>
                        <span class="tone-tag engaging">Engaging</span>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <h4>Improvement Suggestions</h4>
                    <ul class="suggestions-list">
                        <li>Consider adding visual aids for complex concepts</li>
                        <li>Vary pace during technical explanations</li>
                        <li>Include summary points at section transitions</li>
                        <li>Add timestamps for key topics in description</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Render Processing State
function renderProcessingState(type = 'text') {
    return `
        <div class="processing-state">
            <div class="processing-animation">
                <div class="processing-circle"></div>
                <div class="processing-circle"></div>
                <div class="processing-circle"></div>
            </div>
            <h3>Analyzing ${type === 'video' ? 'Video' : 'Content'}...</h3>
            <p>AI is extracting key insights and generating summaries</p>
            <div class="processing-steps">
                <div class="processing-step active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Content parsed
                </div>
                <div class="processing-step active">
                    <div class="spinner spinner-sm"></div>
                    Analyzing structure
                </div>
                <div class="processing-step">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Generating insights
                </div>
            </div>
        </div>
    `;
}

// Add Additional CSS for Video Analysis (injected dynamically)
function injectVideoAnalysisStyles() {
    if (document.getElementById('video-analysis-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'video-analysis-styles';
    styles.textContent = `
        .video-analysis {
            margin-top: var(--spacing-6);
        }
        
        .analysis-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--spacing-6);
        }
        
        .analysis-status {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-2);
            padding: var(--spacing-2) var(--spacing-4);
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            border-radius: var(--radius-full);
        }
        
        .analysis-status.success {
            background: var(--color-success-light);
            color: var(--color-success);
        }
        
        .analysis-status svg {
            width: 16px;
            height: 16px;
        }
        
        .analysis-duration {
            font-size: var(--font-size-sm);
            color: var(--text-tertiary);
        }
        
        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-5);
        }
        
        .analysis-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            padding: var(--spacing-5);
        }
        
        .analysis-card h4 {
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-semibold);
            margin-bottom: var(--spacing-4);
            color: var(--text-primary);
        }
        
        .analysis-card p {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            line-height: var(--line-height-relaxed);
        }
        
        .communication-scores {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
        }
        
        .comm-score {
            display: grid;
            grid-template-columns: 80px 1fr 50px;
            align-items: center;
            gap: var(--spacing-3);
        }
        
        .comm-label {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
        }
        
        .comm-bar {
            height: 6px;
            background: var(--bg-tertiary);
            border-radius: var(--radius-full);
            overflow: hidden;
        }
        
        .comm-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
            border-radius: var(--radius-full);
            transition: width var(--transition-slow);
        }
        
        .comm-value {
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-semibold);
            color: var(--color-primary);
            text-align: right;
        }
        
        .tone-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-2);
        }
        
        .tone-tag {
            padding: var(--spacing-1) var(--spacing-3);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-medium);
            border-radius: var(--radius-full);
            background: var(--color-primary-100);
            color: var(--color-primary);
        }
        
        .tone-tag.professional { background: rgba(99, 102, 241, 0.1); color: var(--color-primary); }
        .tone-tag.informative { background: rgba(6, 182, 212, 0.1); color: var(--color-accent); }
        .tone-tag.engaging { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }
        
        .suggestions-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-2);
        }
        
        .suggestions-list li {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            padding-left: var(--spacing-4);
            position: relative;
        }
        
        .suggestions-list li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--color-primary);
        }
        
        /* Processing State */
        .processing-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-16);
            text-align: center;
        }
        
        .processing-animation {
            display: flex;
            gap: var(--spacing-2);
            margin-bottom: var(--spacing-6);
        }
        
        .processing-circle {
            width: 16px;
            height: 16px;
            background: var(--color-primary);
            border-radius: 50%;
            animation: processing-bounce 1.4s ease-in-out infinite;
        }
        
        .processing-circle:nth-child(2) { animation-delay: 0.2s; }
        .processing-circle:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes processing-bounce {
            0%, 80%, 100% {
                transform: scale(0.6);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .processing-state h3 {
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            margin-bottom: var(--spacing-2);
        }
        
        .processing-state p {
            color: var(--text-secondary);
            margin-bottom: var(--spacing-6);
        }
        
        .processing-steps {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
            text-align: left;
        }
        
        .processing-step {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            font-size: var(--font-size-sm);
            color: var(--text-tertiary);
        }
        
        .processing-step.active {
            color: var(--text-secondary);
        }
        
        .processing-step svg {
            width: 16px;
            height: 16px;
        }
        
        .processing-step.active svg {
            color: var(--color-success);
        }
        
        /* Toast Styles */
        .toast-container {
            position: fixed;
            bottom: var(--spacing-6);
            right: var(--spacing-6);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
            z-index: var(--z-toast);
        }
        
        .toast {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-4);
            padding: var(--spacing-4) var(--spacing-5);
        }
        
        .toast-message {
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
        }
        
        .toast-close {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
            color: var(--text-tertiary);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .toast-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        
        .toast-close svg {
            width: 14px;
            height: 14px;
        }
        
        .toast-info { border-left: 3px solid var(--color-info); }
        .toast-success { border-left: 3px solid var(--color-success); }
        .toast-warning { border-left: 3px solid var(--color-warning); }
        .toast-error { border-left: 3px solid var(--color-error); }
        
        .fade-out {
            animation: fadeOut var(--transition-base) ease-out forwards;
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
        }
        
        @media (max-width: 768px) {
            .analysis-grid {
                grid-template-columns: 1fr;
            }
            
            .toast-container {
                left: var(--spacing-4);
                right: var(--spacing-4);
                bottom: var(--spacing-4);
            }
        }
    `;

    document.head.appendChild(styles);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    injectVideoAnalysisStyles();
});

// Export functions
window.searchKnowledge = searchKnowledge;
window.simulateAIProcessing = simulateAIProcessing;
window.renderVideoAnalysis = renderVideoAnalysis;
window.renderProcessingState = renderProcessingState;
