/**
 * Performance Dashboard - Displays real-time performance metrics and WebWorker status
 */
export class PerformanceDashboard {
    constructor(performanceManager) {
        this.performanceManager = performanceManager;
        this.isVisible = false;
        this.updateInterval = null;
        this.dashboardElement = null;
        
        this.initialize();
    }
    
    initialize() {
        this.createDashboardUI();
        this.setupEventListeners();
        this.startMonitoring();
        console.log('📊 Performance Dashboard initialized');
    }
    
    createDashboardUI() {
        this.dashboardElement = document.createElement('div');
        this.dashboardElement.id = 'performance-dashboard';
        this.dashboardElement.className = 'performance-dashboard';
        this.dashboardElement.innerHTML = `
            <div class="dashboard-header">
                <h3>📊 Performance Dashboard</h3>
                <button id="close-dashboard" class="close-btn">×</button>
            </div>
            <div class="dashboard-content">
                <div class="metrics-section">
                    <h4>🚀 Performance Metrics</h4>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">Frame Rate</div>
                            <div class="metric-value" id="frame-rate">--</div>
                            <div class="metric-unit">FPS</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Memory Usage</div>
                            <div class="metric-value" id="memory-usage">--</div>
                            <div class="metric-unit">MB</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Active Workers</div>
                            <div class="metric-value" id="active-workers">--</div>
                            <div class="metric-unit">Count</div>
                        </div>
                    </div>
                </div>
                <div class="workers-section">
                    <h4>⚙️ WebWorker Status</h4>
                    <div class="workers-grid" id="workers-grid"></div>
                </div>
                <div class="actions-section">
                    <h4>🔧 Performance Actions</h4>
                    <button id="optimize-performance" class="action-btn">🚀 Optimize</button>
                    <button id="clear-cache" class="action-btn">🗑️ Clear Cache</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.dashboardElement);
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .performance-dashboard {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                max-width: 800px;
                height: 70vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                display: none;
                overflow: hidden;
            }
            .performance-dashboard.visible { display: block; }
            .dashboard-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            .dashboard-content { padding: 20px; height: calc(100% - 80px); overflow-y: auto; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
            .metric-card { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #333; }
            .workers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
            .worker-card { background: #f8f9fa; padding: 16px; border-radius: 8px; }
            .action-btn { margin: 8px; padding: 10px 20px; border: none; border-radius: 6px; background: #007bff; color: white; cursor: pointer; }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        this.dashboardElement.querySelector('#close-dashboard').addEventListener('click', () => this.hide());
        this.dashboardElement.querySelector('#optimize-performance').addEventListener('click', () => this.optimizePerformance());
        this.dashboardElement.querySelector('#clear-cache').addEventListener('click', () => this.clearCache());
    }
    
    startMonitoring() {
        this.updateInterval = setInterval(() => this.updateDashboard(), 2000);
    }
    
    updateDashboard() {
        if (!this.isVisible) return;
        
        try {
            const summary = this.performanceManager.getPerformanceSummary();
            this.updateMetrics(summary);
            this.updateWorkerStatus(summary.workers);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }
    
    updateMetrics(summary) {
        const frameRateElement = this.dashboardElement.querySelector('#frame-rate');
        const memoryElement = this.dashboardElement.querySelector('#memory-usage');
        const activeWorkersElement = this.dashboardElement.querySelector('#active-workers');
        
        if (summary.metrics.frameRate) {
            frameRateElement.textContent = summary.metrics.frameRate.current.toFixed(1);
        }
        
        if (summary.metrics.memory) {
            memoryElement.textContent = summary.metrics.memory.percentage;
        }
        
        const availableWorkers = Object.values(summary.workers).filter(w => w.available).length;
        activeWorkersElement.textContent = availableWorkers;
    }
    
    updateWorkerStatus(workers) {
        const workersGrid = this.dashboardElement.querySelector('#workers-grid');
        workersGrid.innerHTML = '';
        
        for (const [name, info] of Object.entries(workers)) {
            const workerCard = document.createElement('div');
            workerCard.className = 'worker-card';
            workerCard.innerHTML = `
                <div><strong>${name}</strong></div>
                <div>Status: ${info.available ? 'Available' : 'Busy'}</div>
                <div>Tasks: ${info.taskCount}</div>
            `;
            workersGrid.appendChild(workerCard);
        }
    }
    
    async optimizePerformance() {
        try {
            const optimizations = this.performanceManager.optimizePerformance();
            alert(`Performance optimized! Applied ${optimizations.length} optimizations.`);
            this.updateDashboard();
        } catch (error) {
            alert('Failed to optimize performance.');
        }
    }
    
    async clearCache() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            alert('Cache cleared successfully!');
        } catch (error) {
            alert('Failed to clear cache.');
        }
    }
    
    show() {
        this.dashboardElement.classList.add('visible');
        this.isVisible = true;
        this.updateDashboard();
    }
    
    hide() {
        this.dashboardElement.classList.remove('visible');
        this.isVisible = false;
    }
    
    toggle() {
        if (this.isVisible) this.hide(); else this.show();
    }
    
    cleanup() {
        this.stopMonitoring();
        if (this.dashboardElement && this.dashboardElement.parentNode) {
            this.dashboardElement.parentNode.removeChild(this.dashboardElement);
        }
    }
}
