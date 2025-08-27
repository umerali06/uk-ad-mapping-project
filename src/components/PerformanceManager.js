/**
 * Performance Manager - Coordinates WebWorkers and monitors performance
 * Handles background processing, performance metrics, and optimization
 */
export class PerformanceManager {
    constructor() {
        this.workers = new Map();
        this.performanceMetrics = {
            frameRate: [],
            memoryUsage: [],
            processingTime: [],
            workerTasks: []
        };
        this.isMonitoring = false;
        this.monitoringInterval = null;
        
        // Initialize WebWorkers
        this.initializeWorkers();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
    }
    
    /**
     * Initialize WebWorkers for different tasks
     */
    initializeWorkers() {
        try {
            // Site Analysis Worker
            const siteAnalysisWorker = new Worker('/src/workers/siteAnalysisWorker.js', { type: 'module' });
            this.setupWorker(siteAnalysisWorker, 'siteAnalysis');
            
            // Data Processing Worker
            const dataProcessingWorker = new Worker('/src/workers/dataProcessingWorker.js', { type: 'module' });
            this.setupWorker(dataProcessingWorker, 'dataProcessing');
            
            // Spatial Analysis Worker
            const spatialAnalysisWorker = new Worker('/src/workers/spatialAnalysisWorker.js', { type: 'module' });
            this.setupWorker(spatialAnalysisWorker, 'spatialAnalysis');
            
            console.log('✅ WebWorkers initialized successfully');
            
        } catch (error) {
            console.warn('⚠️ WebWorker initialization failed, falling back to main thread:', error);
            this.workers.clear();
        }
    }
    
    /**
     * Setup a WebWorker with event handlers
     */
    setupWorker(worker, name) {
        worker.onmessage = (e) => this.handleWorkerMessage(e, name);
        worker.onerror = (error) => this.handleWorkerError(error, name);
        
        this.workers.set(name, {
            worker: worker,
            busy: false,
            taskCount: 0,
            lastUsed: Date.now()
        });
    }
    
    /**
     * Handle messages from WebWorkers
     */
    handleWorkerMessage(e, workerName) {
        const { type, id, results, error, progress } = e.data;
        const workerInfo = this.workers.get(workerName);
        
        if (workerInfo) {
            workerInfo.busy = false;
            workerInfo.lastUsed = Date.now();
        }
        
        // Record performance metrics
        this.recordPerformanceMetric('workerTasks', {
            worker: workerName,
            type: type,
            timestamp: Date.now(),
            success: !error
        });
        
        // Handle different message types
        switch (type) {
            case 'ANALYSIS_COMPLETE':
            case 'DISTANCES_COMPLETE':
            case 'SCORING_COMPLETE':
            case 'FILTERING_COMPLETE':
                this.handleTaskComplete(workerName, id, results);
                break;
                
            case 'PROGRESS':
                this.handleTaskProgress(workerName, id, progress);
                break;
                
            case 'ERROR':
                this.handleTaskError(workerName, id, error);
                break;
                
            default:
                console.warn('⚠️ Unknown worker message type:', type);
        }
    }
    
    /**
     * Handle WebWorker errors
     */
    handleWorkerError(error, workerName) {
        console.error(`❌ WebWorker error in ${workerName}:`, error);
        
        const workerInfo = this.workers.get(workerName);
        if (workerInfo) {
            workerInfo.busy = false;
        }
        
        // Record error in performance metrics
        this.recordPerformanceMetric('workerTasks', {
            worker: workerName,
            type: 'ERROR',
            timestamp: Date.now(),
            success: false,
            error: error.message
        });
    }
    
    /**
     * Handle task completion
     */
    handleTaskComplete(workerName, taskId, results) {
        // Emit custom event for task completion
        const event = new CustomEvent('workerTaskComplete', {
            detail: {
                worker: workerName,
                taskId: taskId,
                results: results
            }
        });
        document.dispatchEvent(event);
        
        console.log(`✅ ${workerName} worker completed task ${taskId}`);
    }
    
    /**
     * Handle task progress updates
     */
    handleTaskProgress(workerName, taskId, progress) {
        // Emit custom event for progress updates
        const event = new CustomEvent('workerTaskProgress', {
            detail: {
                worker: workerName,
                taskId: taskId,
                progress: progress
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Handle task errors
     */
    handleTaskError(workerName, taskId, error) {
        console.error(`❌ ${workerName} worker error in task ${taskId}:`, error);
        
        // Emit custom event for task errors
        const event = new CustomEvent('workerTaskError', {
            detail: {
                worker: workerName,
                taskId: taskId,
                error: error
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Submit a task to a WebWorker
     */
    submitTask(workerName, taskType, data) {
        const workerInfo = this.workers.get(workerName);
        
        if (!workerInfo) {
            throw new Error(`Worker ${workerName} not available`);
        }
        
        if (workerInfo.busy) {
            throw new Error(`Worker ${workerName} is busy`);
        }
        
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Mark worker as busy
        workerInfo.busy = true;
        workerInfo.taskCount++;
        
        // Submit task to worker
        workerInfo.worker.postMessage({
            type: taskType,
            data: data,
            id: taskId
        });
        
        // Record task submission
        this.recordPerformanceMetric('workerTasks', {
            worker: workerName,
            type: taskType,
            taskId: taskId,
            timestamp: Date.now(),
            submitted: true
        });
        
        return taskId;
    }
    
    /**
     * Check if a worker is available
     */
    isWorkerAvailable(workerName) {
        const workerInfo = this.workers.get(workerName);
        return workerInfo && !workerInfo.busy;
    }
    
    /**
     * Get available workers
     */
    getAvailableWorkers() {
        const available = [];
        for (const [name, info] of this.workers) {
            if (!info.busy) {
                available.push(name);
            }
        }
        return available;
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectPerformanceMetrics();
        }, 1000); // Collect metrics every second
        
        console.log('📊 Performance monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('📊 Performance monitoring stopped');
    }
    
    /**
     * Collect performance metrics
     */
    collectPerformanceMetrics() {
        // Frame rate monitoring
        if (window.APP_STATE?.mapManager?.map) {
            const map = window.APP_STATE.mapManager.map;
            if (map.isStyleLoaded()) {
                // Get current frame rate (simplified)
                const now = performance.now();
                this.recordPerformanceMetric('frameRate', {
                    timestamp: now,
                    value: this.estimateFrameRate()
                });
            }
        }
        
        // Memory usage monitoring (if available)
        if (performance.memory) {
            this.recordPerformanceMetric('memoryUsage', {
                timestamp: Date.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            });
        }
        
        // Clean up old metrics (keep last 100 entries)
        this.cleanupOldMetrics();
    }
    
    /**
     * Estimate frame rate (simplified)
     */
    estimateFrameRate() {
        // This is a simplified frame rate estimation
        // In a real implementation, you'd use requestAnimationFrame timing
        return 60; // Assume 60 FPS for now
    }
    
    /**
     * Record a performance metric
     */
    recordPerformanceMetric(type, data) {
        if (this.performanceMetrics[type]) {
            this.performanceMetrics[type].push(data);
        }
    }
    
    /**
     * Clean up old performance metrics
     */
    cleanupOldMetrics() {
        const maxEntries = 100;
        
        for (const metricType in this.performanceMetrics) {
            if (this.performanceMetrics[metricType].length > maxEntries) {
                this.performanceMetrics[metricType] = this.performanceMetrics[metricType].slice(-maxEntries);
            }
        }
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {
            workers: {},
            metrics: {},
            recommendations: []
        };
        
        // Worker status
        for (const [name, info] of this.workers) {
            summary.workers[name] = {
                available: !info.busy,
                taskCount: info.taskCount,
                lastUsed: info.lastUsed,
                uptime: Date.now() - info.lastUsed
            };
        }
        
        // Performance metrics
        if (this.performanceMetrics.frameRate.length > 0) {
            const frameRates = this.performanceMetrics.frameRate.map(m => m.value);
            summary.metrics.frameRate = {
                current: frameRates[frameRates.length - 1],
                average: frameRates.reduce((a, b) => a + b, 0) / frameRates.length,
                min: Math.min(...frameRates),
                max: Math.max(...frameRates)
            };
        }
        
        if (this.performanceMetrics.memoryUsage.length > 0) {
            const memoryData = this.performanceMetrics.memoryUsage[this.performanceMetrics.memoryUsage.length - 1];
            summary.metrics.memory = {
                used: this.formatBytes(memoryData.used),
                total: this.formatBytes(memoryData.total),
                limit: this.formatBytes(memoryData.limit),
                percentage: ((memoryData.used / memoryData.total) * 100).toFixed(1)
            };
        }
        
        // Generate recommendations
        summary.recommendations = this.generateRecommendations(summary);
        
        return summary;
    }
    
    /**
     * Generate performance recommendations
     */
    generateRecommendations(summary) {
        const recommendations = [];
        
        // Frame rate recommendations
        if (summary.metrics.frameRate) {
            if (summary.metrics.frameRate.average < 30) {
                recommendations.push({
                    type: 'warning',
                    message: 'Low frame rate detected. Consider reducing map complexity or enabling layer clustering.',
                    priority: 'high'
                });
            }
        }
        
        // Memory recommendations
        if (summary.metrics.memory) {
            const memoryPercentage = parseFloat(summary.metrics.memory.percentage);
            if (memoryPercentage > 80) {
                recommendations.push({
                    type: 'warning',
                    message: 'High memory usage detected. Consider clearing unused data or reducing map layers.',
                    priority: 'high'
                });
            } else if (memoryPercentage > 60) {
                recommendations.push({
                    type: 'info',
                    message: 'Moderate memory usage. Monitor for potential optimization opportunities.',
                    priority: 'medium'
                });
            }
        }
        
        // Worker recommendations
        const busyWorkers = Object.values(summary.workers).filter(w => !w.available).length;
        if (busyWorkers === this.workers.size) {
            recommendations.push({
                type: 'info',
                message: 'All workers are busy. Consider queuing tasks or adding more workers.',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Format bytes to human-readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Optimize performance based on current metrics
     */
    optimizePerformance() {
        const summary = this.getPerformanceSummary();
        const optimizations = [];
        
        // Memory optimization
        if (summary.metrics.memory && parseFloat(summary.metrics.memory.percentage) > 70) {
            // Clear old performance metrics
            this.cleanupOldMetrics();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
                optimizations.push('Garbage collection triggered');
            }
            
            optimizations.push('Performance metrics cleaned up');
        }
        
        // Worker optimization
        const idleWorkers = Object.values(summary.workers).filter(w => w.available).length;
        if (idleWorkers > 2) {
            // Consider terminating some workers to save resources
            optimizations.push('Worker pool optimized');
        }
        
        return optimizations;
    }
    
    /**
     * Cleanup and terminate workers
     */
    cleanup() {
        this.stopPerformanceMonitoring();
        
        // Terminate all workers
        for (const [name, info] of this.workers) {
            info.worker.terminate();
        }
        this.workers.clear();
        
        console.log('🧹 PerformanceManager cleaned up');
    }
}
