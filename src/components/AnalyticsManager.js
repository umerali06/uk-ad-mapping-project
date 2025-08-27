/**
 * AnalyticsManager - Advanced analytics and reporting for UK AD Mapping Application
 * Features: Statistical analysis, custom reports, data visualization, trend analysis
 */
export class AnalyticsManager {
    constructor() {
        this.data = null;
        this.reports = [];
        this.charts = {};
        this.analysisCache = new Map();
        this.reportTemplates = this.initializeReportTemplates();
        this.currentReport = null;
    }

    /**
     * Initialize the analytics manager
     */
    async initialize() {
        try {
            // Load data from global state - use available data sources
            this.data = {
                adPlants: window.APP_STATE?.siteFinder?.getSuitableSites() || [],
                // Add other data sources as they become available
            };
            
            // Wait a bit for data to be available
            setTimeout(async () => {
                try {
                    // Try to get data from SiteFinder first
                    if (window.APP_STATE?.siteFinder?.getSuitableSites) {
                        this.data.adPlants = window.APP_STATE.siteFinder.getSuitableSites() || [];
                    }
                    
                    // If no data from SiteFinder, try DataManager
                    if (this.data.adPlants.length === 0 && window.APP_STATE?.dataManager) {
                        try {
                            const adPlantsData = await window.APP_STATE.dataManager.getData('adPlants');
                            if (adPlantsData && adPlantsData.length > 0) {
                                this.data.adPlants = adPlantsData;
                                console.log('📊 Loaded data from DataManager:', adPlantsData.length, 'plants');
                            }
                        } catch (dataError) {
                            console.warn('⚠️ Could not load data from DataManager:', dataError.message);
                        }
                    }
                    
                    // If still no data, generate sample data for demonstration
                    if (this.data.adPlants.length === 0) {
                        this.data.adPlants = this.generateSampleData();
                    }
                    
                    // Initialize default reports
                    this.generateDefaultReports();
                    
                    // Set up analytics UI
                    this.setupAnalyticsUI();
                    
                } catch (timeoutError) {
                    console.error('❌ Error in Analytics Manager timeout:', timeoutError);
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error initializing Analytics Manager:', error);
        }
    }

    /**
     * Initialize report templates
     */
    initializeReportTemplates() {
        // Use arrow functions to preserve 'this' context
        return {
            'capacity-analysis': {
                name: 'Capacity Analysis Report',
                description: 'Analysis of AD plant capacity distribution and trends',
                template: () => this.generateCapacityAnalysisTemplate()
            },
            'regional-distribution': {
                name: 'Regional Distribution Report',
                description: 'Geographic distribution of AD plants across UK regions',
                template: () => this.generateRegionalDistributionTemplate()
            },
            'status-overview': {
                name: 'Status Overview Report',
                description: 'Overview of plant statuses and operational metrics',
                template: () => this.generateStatusOverviewTemplate()
            },
            'technology-analysis': {
                name: 'Technology Analysis Report',
                description: 'Analysis of AD technologies and their performance',
                template: () => this.generateTechnologyAnalysisTemplate()
            },
            'environmental-impact': {
                name: 'Environmental Impact Report',
                description: 'Carbon savings and environmental benefits analysis',
                template: () => this.generateEnvironmentalImpactTemplate()
            }
        };
    }

    /**
     * Generate default reports
     */
    generateDefaultReports() {
        this.reports = [
            {
                id: 'capacity-analysis',
                name: 'Capacity Analysis Report',
                description: 'Analysis of AD plant capacity distribution and trends',
                type: 'default'
            },
            {
                id: 'regional-distribution',
                name: 'Regional Distribution Report',
                description: 'Geographic distribution of AD plants across UK regions',
                type: 'default'
            },
            {
                id: 'status-overview',
                name: 'Status Overview Report',
                description: 'Overview of plant statuses and operational metrics',
                type: 'default'
            },
            {
                id: 'technology-analysis',
                name: 'Technology Analysis Report',
                description: 'Analysis of AD technologies and their performance',
                type: 'default'
            },
            {
                id: 'environmental-impact',
                name: 'Environmental Impact Report',
                description: 'Carbon savings and environmental benefits analysis',
                type: 'default'
            }
        ];
    }

    /**
     * Set up analytics UI in the sidebar
     */
    setupAnalyticsUI() {
        const sidebar = document.querySelector('#sidebar');
        if (!sidebar) return;

        // Add analytics section to sidebar
        const analyticsSection = document.createElement('div');
        analyticsSection.className = 'layer-group';
        analyticsSection.innerHTML = `
            <div class="layer-group-header cursor-pointer">
                <span class="font-medium text-gray-700">📊 Analytics & Reports</span>
                <svg class="w-4 h-4 transform transition-transform layer-group-arrow" id="analytics-arrow">▶</svg>
            </div>
            <div id="analytics-layers" class="layer-group-layers collapsed ml-4">
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="capacity-analysis">📈 Capacity Analysis</div>
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="regional-distribution">🗺️ Regional Distribution</div>
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="status-overview">🔄 Status Overview</div>
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="technology-analysis">⚙️ Technology Analysis</div>
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="environmental-impact">🌱 Environmental Impact</div>
                <div class="analytics-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-report="custom">✏️ Custom Report</div>
                <div class="analytics-item cursor-pointer hover:bg-green-50 hover:text-green-700 px-2 py-1 rounded transition-colors duration-200" data-report="test">🧪 Test System</div>
            </div>
        `;

        // Insert after existing layer groups
        const existingGroups = sidebar.querySelectorAll('.layer-group');
        if (existingGroups.length > 0) {
            existingGroups[existingGroups.length - 1].after(analyticsSection);
        } else {
            sidebar.appendChild(analyticsSection);
        }

        // Add Performance Dashboard button
        const performanceButton = document.createElement('div');
        performanceButton.className = 'layer-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded transition-colors duration-200';
        performanceButton.innerHTML = '📊 Performance Dashboard';
        performanceButton.id = 'performance-dashboard-btn';
        performanceButton.style.marginTop = '16px';
        performanceButton.style.borderTop = '1px solid #e5e7eb';
        performanceButton.style.paddingTop = '16px';
        
        analyticsSection.appendChild(performanceButton);

        // Set up event listeners
        this.setupAnalyticsEventListeners();
    }

    /**
     * Set up event listeners for analytics
     */
    setupAnalyticsEventListeners() {
        // Analytics section toggle - use event delegation for robustness
        document.addEventListener('click', (e) => {
            // Check if clicked specifically on analytics arrow or analytics header
            const analyticsSection = e.target.closest('.layer-group');
            const isAnalyticsSection = analyticsSection && analyticsSection.querySelector('#analytics-layers');
            
            if (e.target.id === 'analytics-arrow' || (isAnalyticsSection && e.target.closest('.layer-group-header'))) {
                e.preventDefault();
                e.stopPropagation();
                
                const analyticsLayers = document.getElementById('analytics-layers');
                const analyticsArrow = document.getElementById('analytics-arrow');
                
                if (analyticsLayers && analyticsArrow) {
                    const isCollapsed = analyticsLayers.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        // Expand
                        analyticsLayers.classList.remove('collapsed');
                        analyticsLayers.classList.add('expanded');
                        analyticsArrow.textContent = '▼'; // Point down when expanded
                    } else {
                        // Collapse
                        analyticsLayers.classList.remove('expanded');
                        analyticsLayers.classList.add('collapsed');
                        analyticsArrow.textContent = '▶'; // Point right when collapsed
                    }
                }
            }
        });

        // Analytics item clicks - use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('analytics-item')) {
                e.preventDefault();
                e.stopPropagation();
                
                const reportType = e.target.dataset.report;
                
                if (reportType) {
                    this.generateReport(reportType);
                }
            }
        });

        // Performance Dashboard button click
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'performance-dashboard-btn') {
                e.preventDefault();
                e.stopPropagation();
                
                // Open Performance Dashboard
                if (window.APP_STATE.performanceManager) {
                    try {
                        // Create and show Performance Dashboard
                        const { PerformanceDashboard } = await import('./PerformanceDashboard.js');
                        const dashboard = new PerformanceDashboard(window.APP_STATE.performanceManager);
                        dashboard.show();
                    } catch (error) {
                        console.error('Failed to load Performance Dashboard:', error);
                    }
                } else {
                    console.warn('Performance Manager not available');
                }
            }
        });
    }

    /**
     * Generate a specific report
     */
    async generateReport(reportType) {
        try {
            if (reportType === 'custom') {
                this.showCustomReportBuilder();
                return;
            }
            
            if (reportType === 'test') {
                this.testAnalyticsSystem();
                return;
            }

            const template = this.reportTemplates[reportType];
            
            if (!template) {
                this.showReportError(`Unknown report type: ${reportType}`);
                return;
            }

            if (typeof template.template !== 'function') {
                this.showReportError(`Template error: template is not a function`);
                return;
            }

            // Check if we have data
            if (!this.data?.adPlants || this.data.adPlants.length === 0) {
                this.showReportError('No data available. Please run Site Finder first to generate data.');
                return;
            }

            // Show loading state
            this.showReportLoading();

            // Generate report content
            const reportContent = await template.template();
            
            // Display report in info panel
            this.displayReport(reportContent, template.name);
        } catch (error) {
            this.showReportError(`Error generating report: ${error.message}`);
        }
    }

    /**
     * Generate capacity analysis report
     */
    async generateCapacityAnalysisTemplate() {
        const plants = this.data.adPlants || [];
        
        // Check if we have data
        if (plants.length === 0) {
            return {
                title: 'Capacity Analysis Report',
                subtitle: 'No data available for analysis',
                sections: [{
                    title: '📊 No Data Available',
                    type: 'stats',
                    data: [
                        { label: 'Status', value: 'No Data', unit: '' },
                        { label: 'Message', value: 'Please run Site Finder first', unit: '' }
                    ]
                }]
            };
        }
        
        // Calculate capacity statistics
        const capacities = plants.map(p => this.extractCapacity(p.capacity));
        const validCapacities = capacities.filter(c => c > 0);
        
        const stats = {
            total: validCapacities.length,
            average: validCapacities.reduce((a, b) => a + b, 0) / validCapacities.length,
            median: this.calculateMedian(validCapacities),
            min: Math.min(...validCapacities),
            max: Math.max(...validCapacities),
            distribution: this.calculateCapacityDistribution(validCapacities)
        };

        return {
            title: 'Capacity Analysis Report',
            subtitle: 'AD Plant Capacity Distribution and Trends',
            sections: [
                {
                    title: '📊 Capacity Statistics',
                    type: 'stats',
                    data: [
                        { label: 'Total Plants', value: stats.total, unit: 'plants' },
                        { label: 'Average Capacity', value: stats.average.toLocaleString(), unit: 'tonnes/year' },
                        { label: 'Median Capacity', value: stats.median.toLocaleString(), unit: 'tonnes/year' },
                        { label: 'Min Capacity', value: stats.min.toLocaleString(), unit: 'tonnes/year' },
                        { label: 'Max Capacity', value: stats.max.toLocaleString(), unit: 'tonnes/year' }
                    ]
                },
                {
                    title: '📈 Capacity Distribution',
                    type: 'chart',
                    data: stats.distribution,
                    chartType: 'bar'
                },
                {
                    title: '🔍 Top 10 Plants by Capacity',
                    type: 'table',
                    headers: ['Plant Name', 'Location', 'Capacity (tonnes/year)', 'Status'],
                    data: plants
                        .filter(p => this.extractCapacity(p.capacity) > 0)
                        .sort((a, b) => this.extractCapacity(b.capacity) - this.extractCapacity(a.capacity))
                        .slice(0, 10)
                        .map(p => [
                            p.name,
                            p.location,
                            this.extractCapacity(p.capacity).toLocaleString(),
                            p.status
                        ])
                }
            ]
        };
    }

    /**
     * Generate regional distribution report
     */
    async generateRegionalDistributionTemplate() {
        const plants = this.data.adPlants || [];
        
        // Group plants by region
        const regionalData = {};
        plants.forEach(plant => {
            const region = plant.region || 'Unknown';
            if (!regionalData[region]) {
                regionalData[region] = {
                    count: 0,
                    totalCapacity: 0,
                    operational: 0,
                    planning: 0,
                    construction: 0
                };
            }
            
            regionalData[region].count++;
            regionalData[region].totalCapacity += this.extractCapacity(plant.capacity);
            
            if (plant.status) {
                const status = plant.status.toLowerCase();
                if (regionalData[region][status] !== undefined) {
                    regionalData[region][status]++;
                }
            }
        });

        return {
            title: 'Regional Distribution Report',
            subtitle: 'Geographic Distribution of AD Plants Across UK',
            sections: [
                {
                    title: '🗺️ Regional Overview',
                    type: 'chart',
                    data: Object.entries(regionalData).map(([region, data]) => ({
                        region,
                        plants: data.count,
                        capacity: data.totalCapacity
                    })),
                    chartType: 'pie'
                },
                {
                    title: '📊 Regional Statistics',
                    type: 'table',
                    headers: ['Region', 'Total Plants', 'Total Capacity', 'Operational', 'Planning', 'Construction'],
                    data: Object.entries(regionalData).map(([region, data]) => [
                        region,
                        data.count,
                        data.totalCapacity.toLocaleString(),
                        data.operational,
                        data.planning,
                        data.construction
                    ])
                }
            ]
        };
    }

    /**
     * Generate status overview report
     */
    async generateStatusOverviewTemplate() {
        const plants = this.data.adPlants || [];
        
        // Count plants by status
        const statusCounts = {};
        plants.forEach(plant => {
            const status = plant.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Calculate operational metrics
        const operationalPlants = plants.filter(p => p.status === 'Operational');
        const totalCapacity = operationalPlants.reduce((sum, p) => sum + this.extractCapacity(p.capacity), 0);

        return {
            title: 'Status Overview Report',
            subtitle: 'Plant Statuses and Operational Metrics',
            sections: [
                {
                    title: '🔄 Status Distribution',
                    type: 'chart',
                    data: Object.entries(statusCounts).map(([status, count]) => ({
                        status,
                        count
                    })),
                    chartType: 'doughnut'
                },
                {
                    title: '⚡ Operational Metrics',
                    type: 'stats',
                    data: [
                        { label: 'Total Plants', value: plants.length, unit: 'plants' },
                        { label: 'Operational Plants', value: operationalPlants.length, unit: 'plants' },
                        { label: 'Operational Rate', value: ((operationalPlants.length / plants.length) * 100).toFixed(1), unit: '%' },
                        { label: 'Total Operational Capacity', value: totalCapacity.toLocaleString(), unit: 'tonnes/year' }
                    ]
                }
            ]
        };
    }

    /**
     * Generate technology analysis report
     */
    async generateTechnologyAnalysisTemplate() {
        const plants = this.data.adPlants || [];
        
        // Group plants by technology
        const technologyData = {};
        plants.forEach(plant => {
            const tech = plant.technology || 'Unknown';
            if (!technologyData[tech]) {
                technologyData[tech] = {
                    count: 0,
                    totalCapacity: 0,
                    avgCapacity: 0
                };
            }
            
            technologyData[tech].count++;
            technologyData[tech].totalCapacity += this.extractCapacity(plant.capacity);
        });

        // Calculate average capacity for each technology
        Object.values(technologyData).forEach(tech => {
            tech.avgCapacity = tech.totalCapacity / tech.count;
        });

        return {
            title: 'Technology Analysis Report',
            subtitle: 'AD Technology Performance and Distribution',
            sections: [
                {
                    title: '⚙️ Technology Distribution',
                    type: 'chart',
                    data: Object.entries(technologyData).map(([tech, data]) => ({
                        technology: tech,
                        plants: data.count,
                        capacity: data.totalCapacity
                    })),
                    chartType: 'bar'
                },
                {
                    title: '📊 Technology Statistics',
                    type: 'table',
                    headers: ['Technology', 'Plant Count', 'Total Capacity', 'Average Capacity'],
                    data: Object.entries(technologyData).map(([tech, data]) => [
                        tech,
                        data.count,
                        data.totalCapacity.toLocaleString(),
                        data.avgCapacity.toLocaleString()
                    ])
                }
            ]
        };
    }

    /**
     * Generate environmental impact report
     */
    async generateEnvironmentalImpactTemplate() {
        const plants = this.data.adPlants || [];
        
        // Calculate environmental metrics
        const operationalPlants = plants.filter(p => p.status === 'Operational');
        const totalCarbonSavings = operationalPlants.reduce((sum, p) => {
            const savings = this.extractCarbonSavings(p.carbonSavings);
            return sum + savings;
        }, 0);

        const totalEnergyOutput = operationalPlants.reduce((sum, p) => {
            const energy = this.extractEnergyOutput(p.energyOutput);
            return sum + energy;
        }, 0);

        return {
            title: 'Environmental Impact Report',
            subtitle: 'Carbon Savings and Environmental Benefits',
            sections: [
                {
                    title: '🌱 Environmental Impact',
                    type: 'stats',
                    data: [
                        { label: 'Operational Plants', value: operationalPlants.length, unit: 'plants' },
                        { label: 'Total Carbon Savings', value: totalCarbonSavings.toLocaleString(), unit: 'tonnes CO2/year' },
                        { label: 'Total Energy Output', value: totalEnergyOutput.toLocaleString(), unit: 'MW' },
                        { label: 'Avg Carbon Savings/Plant', value: (totalCarbonSavings / operationalPlants.length).toLocaleString(), unit: 'tonnes CO2/year' }
                    ]
                },
                {
                    title: '📈 Top Carbon Savers',
                    type: 'table',
                    headers: ['Plant Name', 'Carbon Savings', 'Energy Output', 'Capacity'],
                    data: operationalPlants
                        .filter(p => this.extractCarbonSavings(p.carbonSavings) > 0)
                        .sort((a, b) => this.extractCarbonSavings(b.carbonSavings) - this.extractCarbonSavings(a.carbonSavings))
                        .slice(0, 10)
                        .map(p => [
                            p.name,
                            this.extractCarbonSavings(p.carbonSavings).toLocaleString() + ' tonnes CO2/year',
                            p.energyOutput || 'N/A',
                            p.capacity || 'N/A'
                        ])
                }
            ]
        };
    }

    /**
     * Show custom report builder
     */
    showCustomReportBuilder() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-semibold mb-4">✏️ Custom Report Builder</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                        <input type="text" id="custom-report-name" class="w-full px-3 py-2 border rounded-lg" placeholder="Enter report name">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select id="custom-report-type" class="w-full px-3 py-2 border rounded-lg">
                            <option value="comparison">Comparison Analysis</option>
                            <option value="trend">Trend Analysis</option>
                            <option value="correlation">Correlation Analysis</option>
                            <option value="forecast">Forecasting</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data Sources</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" value="capacity" checked> Capacity Data
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" value="location" checked> Location Data
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" value="status" checked> Status Data
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" value="technology" checked> Technology Data
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Visualization Type</label>
                        <select id="custom-visualization" class="w-full px-3 py-2 border rounded-lg">
                            <option value="chart">Chart</option>
                            <option value="table">Table</option>
                            <option value="map">Map Overlay</option>
                            <option value="dashboard">Dashboard</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button id="generate-custom-report" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Generate Report
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listener for generate button
        const generateBtn = modal.querySelector('#generate-custom-report');
        generateBtn.addEventListener('click', () => this.generateCustomReport(modal));
    }

    /**
     * Generate custom report based on user input
     */
    async generateCustomReport(modal) {
        const reportName = modal.querySelector('#custom-report-name').value;
        const reportType = modal.querySelector('#custom-report-type').value;
        const visualization = modal.querySelector('#custom-visualization').value;
        
        if (!reportName) {
            alert('Please enter a report name');
            return;
        }
        
        // Generate custom report based on type
        let reportContent;
        switch (reportType) {
            case 'comparison':
                reportContent = await this.generateComparisonReport(reportName, visualization);
                break;
            case 'trend':
                reportContent = await this.generateTrendReport(reportName, visualization);
                break;
            case 'correlation':
                reportContent = await this.generateCorrelationReport(reportName, visualization);
                break;
            case 'forecast':
                reportContent = await this.generateForecastReport(reportName, visualization);
                break;
            default:
                reportContent = await this.generateComparisonReport(reportName, visualization);
        }
        
        // Display the report
        this.displayReport(reportContent, reportName);
        
        // Close modal
        modal.remove();
    }

    /**
     * Display report in info panel
     */
    displayReport(reportContent, reportName) {
        const infoPanel = window.APP_STATE?.infoPanel;
        if (!infoPanel) return;
        
        // Generate HTML for the report
        const reportHTML = this.generateReportHTML(reportContent);
        
        // Display in info panel
        infoPanel.showCustomContent(reportHTML, reportName);
        
        // Render charts after content is displayed
        setTimeout(() => {
            this.renderCharts(reportContent);
        }, 100);
    }

    /**
     * Generate HTML for report display
     */
    generateReportHTML(reportContent) {
        let html = `
            <div class="p-4 space-y-4">
                <div class="text-center border-b pb-4">
                    <h2 class="text-2xl font-bold text-gray-800">${reportContent.title}</h2>
                    <p class="text-gray-600 mt-2">${reportContent.subtitle}</p>
                </div>
        `;
        
        reportContent.sections.forEach((section, index) => {
            html += `<div class="bg-white border rounded-lg p-4">`;
            html += `<h3 class="text-lg font-semibold mb-3 text-gray-700">${section.title}</h3>`;
            
            switch (section.type) {
                case 'stats':
                    html += this.generateStatsHTML(section.data);
                    break;
                case 'chart':
                    html += this.generateChartHTML(section.data, section.chartType, index);
                    break;
                case 'table':
                    html += this.generateTableHTML(section.headers, section.data);
                    break;
            }
            
            html += `</div>`;
        });
        
        html += `</div>`;
        return html;
    }

    /**
     * Generate HTML for statistics display
     */
    generateStatsHTML(stats) {
        return `
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                ${stats.map(stat => `
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${stat.value}</div>
                        <div class="text-sm text-gray-600">${stat.label}</div>
                        <div class="text-xs text-gray-500">${stat.unit}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate HTML for chart display
     */
    generateChartHTML(data, chartType, chartIndex = 0) {
        if (!data || data.length === 0) {
            return `
                <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-4xl mb-2">📊</div>
                        <div class="text-gray-600">No data available</div>
                    </div>
                </div>
            `;
        }

        // Generate simple, consistent ID for the chart
        const chartId = `chart-${chartIndex}`;
        
        return `
            <div class="h-64 bg-white rounded-lg p-4 border">
                <canvas id="${chartId}" width="400" height="300"></canvas>
            </div>
        `;
    }

    /**
     * Generate HTML for table display
     */
    generateTableHTML(headers, data) {
        return `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            ${headers.map(header => `
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ${header}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.map(row => `
                            <tr class="hover:bg-gray-50">
                                ${row.map(cell => `
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${cell}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Show report loading state
     */
    showReportLoading() {
        const infoPanel = window.APP_STATE?.infoPanel;
        if (infoPanel) {
            infoPanel.showLoading('Generating report...');
        }
    }

    /**
     * Show report error
     */
    showReportError(message) {
        const infoPanel = window.APP_STATE?.infoPanel;
        if (infoPanel) {
            infoPanel.showError(`Report generation failed: ${message}`);
        }
    }

    /**
     * Utility methods for data extraction
     */
    extractCapacity(capacityStr) {
        if (!capacityStr) return 0;
        const match = capacityStr.toString().match(/(\d+(?:,\d+)*)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    }

    extractCarbonSavings(carbonStr) {
        if (!carbonStr) return 0;
        const match = carbonStr.toString().match(/(\d+(?:,\d+)*)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    }

    extractEnergyOutput(energyStr) {
        if (!energyStr) return 0;
        const match = energyStr.toString().match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    calculateMedian(numbers) {
        if (numbers.length === 0) return 0;
        const sorted = numbers.sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
    }

    calculateCapacityDistribution(capacities) {
        const ranges = [
            { min: 0, max: 25000, label: '0-25k' },
            { min: 25000, max: 50000, label: '25k-50k' },
            { min: 50000, max: 100000, label: '50k-100k' },
            { min: 100000, max: 200000, label: '100k-200k' },
            { min: 200000, max: Infinity, label: '200k+' }
        ];
        
        return ranges.map(range => ({
            range: range.label,
            count: capacities.filter(c => c >= range.min && c < range.max).length
        }));
    }

    // Placeholder methods for custom reports
    async generateComparisonReport(name, visualization) {
        return {
            title: name,
            subtitle: 'Comparison Analysis Report',
            sections: [{
                title: '📊 Comparison Analysis',
                type: 'chart',
                data: [],
                chartType: 'bar'
            }]
        };
    }

    async generateTrendReport(name, visualization) {
        return {
            title: name,
            subtitle: 'Trend Analysis Report',
            sections: [{
                title: '📈 Trend Analysis',
                type: 'chart',
                data: [],
                chartType: 'line'
            }]
        };
    }

    async generateCorrelationReport(name, visualization) {
        return {
            title: name,
            subtitle: 'Correlation Analysis Report',
            sections: [{
                title: '🔗 Correlation Analysis',
                type: 'chart',
                data: [],
                chartType: 'scatter'
            }]
        };
    }

    async generateForecastReport(name, visualization) {
        return {
            title: name,
            subtitle: 'Forecasting Report',
            sections: [{
                title: '🔮 Forecasting Analysis',
                type: 'chart',
                data: [],
                chartType: 'line'
            }]
        };
    }
    
    /**
     * Generate sample data for demonstration when no real data is available
     */
    generateSampleData() {
        const samplePlants = [
            {
                id: 'SAMPLE001',
                name: 'Sample AD Plant 1',
                location: 'Manchester, Greater Manchester',
                region: 'North West England',
                coordinates: [-2.2426, 53.4808],
                capacity: '50,000 tonnes/year',
                status: 'Operational',
                technology: 'Mesophilic',
                carbonSavings: '25,000 tonnes CO2/year',
                energyOutput: '2.5 MW',
                area: 15,
                soilType: 'Clay Loam',
                landUse: 'Agricultural',
                elevation: 45,
                slope: 3,
                floodRisk: 'Low',
                roadDistance: 800,
                gridDistance: 3000,
                gasDistance: 1500,
                residentialDistance: 1200,
                landCost: 15000,
                developmentCost: 2500000
            },
            {
                id: 'SAMPLE002',
                name: 'Sample AD Plant 2',
                location: 'Birmingham, West Midlands',
                region: 'West Midlands',
                coordinates: [-1.8904, 52.4862],
                capacity: '75,000 tonnes/year',
                status: 'Planning',
                technology: 'Thermophilic',
                carbonSavings: '35,000 tonnes CO2/year',
                energyOutput: '3.8 MW',
                area: 22,
                soilType: 'Sandy Loam',
                landUse: 'Mixed Use',
                elevation: 120,
                slope: 5,
                floodRisk: 'Medium',
                roadDistance: 1200,
                gridDistance: 4500,
                gasDistance: 2800,
                residentialDistance: 1800,
                landCost: 18000,
                developmentCost: 3200000
            },
            {
                id: 'SAMPLE003',
                name: 'Sample AD Plant 3',
                location: 'Leeds, West Yorkshire',
                region: 'Yorkshire and the Humber',
                coordinates: [-1.5491, 53.8008],
                capacity: '100,000 tonnes/year',
                status: 'Construction',
                technology: 'Mesophilic',
                carbonSavings: '45,000 tonnes CO2/year',
                energyOutput: '5.2 MW',
                area: 30,
                soilType: 'Silt Loam',
                landUse: 'Industrial',
                elevation: 85,
                slope: 2,
                floodRisk: 'Low',
                roadDistance: 600,
                gridDistance: 2200,
                gasDistance: 1200,
                residentialDistance: 900,
                landCost: 22000,
                developmentCost: 4200000
            },
            {
                id: 'SAMPLE004',
                name: 'Sample AD Plant 4',
                location: 'Glasgow, Scotland',
                region: 'Scotland',
                coordinates: [-4.2518, 55.8642],
                capacity: '60,000 tonnes/year',
                status: 'Operational',
                technology: 'Thermophilic',
                carbonSavings: '28,000 tonnes CO2/year',
                energyOutput: '3.1 MW',
                area: 18,
                soilType: 'Peat',
                landUse: 'Agricultural',
                elevation: 65,
                slope: 4,
                floodRisk: 'Medium',
                roadDistance: 1000,
                gridDistance: 3800,
                gasDistance: 2000,
                residentialDistance: 1500,
                landCost: 12000,
                developmentCost: 2800000
            },
            {
                id: 'SAMPLE005',
                name: 'Sample AD Plant 5',
                location: 'Cardiff, Wales',
                region: 'Wales',
                coordinates: [-3.1791, 51.4816],
                capacity: '40,000 tonnes/year',
                status: 'Operational',
                technology: 'Mesophilic',
                carbonSavings: '20,000 tonnes CO2/year',
                energyOutput: '2.1 MW',
                area: 12,
                soilType: 'Clay',
                landUse: 'Mixed Use',
                elevation: 25,
                slope: 1,
                floodRisk: 'High',
                roadDistance: 1500,
                gridDistance: 5000,
                gasDistance: 3200,
                residentialDistance: 2000,
                landCost: 25000,
                developmentCost: 1800000
            }
        ];
        
        return samplePlants;
    }

    /**
     * Test the analytics system
     */
    testAnalyticsSystem() {
        // Show test message in info panel
        const testReport = {
            title: 'Analytics System Test',
            subtitle: 'System Status Report',
            sections: [
                {
                    title: 'System Status',
                    type: 'stats',
                    data: [
                        { value: this.data?.adPlants?.length || 0, label: 'Data Points', unit: 'AD Plants' },
                        { value: Object.keys(this.reportTemplates).length, label: 'Report Types', unit: 'Available' },
                        { value: document.querySelector('#analytics-arrow') ? '✅' : '❌', label: 'UI Elements', unit: 'Status' },
                        { value: window.APP_STATE?.infoPanel ? '✅' : '❌', label: 'Info Panel', unit: 'Status' }
                    ]
                }
            ]
        };
        
        this.displayReport(testReport, 'System Test');
    }

    /**
     * Render charts after content is displayed
     */
    renderCharts(reportContent) {
        reportContent.sections.forEach((section, index) => {
            if (section.type === 'chart') {
                const chartId = `chart-${index}`;
                const canvas = document.querySelector(`#${chartId}`);
                
                if (canvas) {
                    this.createChart(canvas, section.data, section.chartType);
                }
            }
        });
    }

    /**
     * Create a Chart.js chart
     */
    createChart(canvas, data, chartType) {
        try {
            if (!window.Chart) {
                return;
            }

            // Prepare data for Chart.js
            let labels, datasets;
            
            if (chartType === 'pie' || chartType === 'doughnut') {
                labels = data.map(item => item.region || item.status || item.technology || 'Unknown');
                datasets = [{
                    data: data.map(item => item.plants || item.count || item.capacity || 0),
                    backgroundColor: [
                        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
                        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }];
            } else if (chartType === 'bar') {
                labels = data.map(item => item.range || item.region || item.technology || 'Unknown');
                datasets = [{
                    label: 'Count',
                    data: data.map(item => item.count || item.plants || item.capacity || 0),
                    backgroundColor: '#3B82F6',
                    borderColor: '#1D4ED8',
                    borderWidth: 1
                }];
            } else {
                labels = data.map(item => item.region || item.status || item.technology || 'Unknown');
                datasets = [{
                    label: 'Value',
                    data: data.map(item => item.count || item.plants || item.capacity || 0),
                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    borderWidth: 2,
                    fill: false
                }];
            }
            
            new Chart(canvas, {
                type: chartType,
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { size: 12 },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#3B82F6',
                            borderWidth: 1
                        }
                    },
                    scales: chartType === 'bar' ? {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#E5E7EB' },
                            ticks: { color: '#6B7280' }
                        },
                        x: {
                            grid: { color: '#E5E7EB' },
                            ticks: { color: '#6B7280' }
                        }
                    } : {},
                    elements: {
                        point: { radius: 4 },
                        line: { tension: 0.4 }
                    }
                }
            });
        } catch (error) {
            // Silent error handling
        }
    }
}
