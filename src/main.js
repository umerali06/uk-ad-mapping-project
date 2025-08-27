// Import component classes
import { MapManager } from './components/MapManager.js';
import { LayerManager } from './components/LayerManager.js';
import { SearchManager } from './components/SearchManager.js';
import { InfoPanel } from './components/InfoPanel.js';
import { SidebarManager } from './components/SidebarManager.js';
import { DataManager } from './components/DataManager.js';
import { SiteFinder } from './components/SiteFinder.js';
import { ErrorHandler } from './utils/ErrorHandler.js';

// Phase 3: Advanced Features
import { LandRegistryManager } from './components/LandRegistryManager.js';
import { PaymentManager } from './components/PaymentManager.js';
import { PerformanceManager } from './components/PerformanceManager.js';
import { AnalyticsManager } from './components/AnalyticsManager.js';
import { CollaborationManager } from './components/CollaborationManager.js';

// Global application state
window.APP_STATE = {
    mapManager: null,
    dataManager: null,
    siteFinder: null,
    currentView: 'map',
    selectedFeature: null,
    searchResults: [],
    layerVisibility: {},
    errorHandler: null,
    
    // Phase 3: Advanced Features
            landRegistryManager: null,
        paymentManager: null,
        performanceManager: null,
        analyticsManager: null,
        collaborationManager: null
};

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing UK AD Mapping Application...');
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
        
        // Initialize ErrorHandler first
        const errorHandler = new ErrorHandler();
        window.APP_STATE.errorHandler = errorHandler;
        
        // Initialize DataManager first
        const dataManager = new DataManager();
        window.APP_STATE.dataManager = dataManager;
        
        // Initialize SiteFinder
        const siteFinder = new SiteFinder(dataManager);
        window.APP_STATE.siteFinder = siteFinder;
        
        // Initialize other managers
        const mapManager = new MapManager();
        const searchManager = new SearchManager();
        const infoPanel = new InfoPanel();
        const sidebarManager = new SidebarManager();
        
        // Store references in global state
        window.APP_STATE.mapManager = mapManager;
        window.APP_STATE.searchManager = searchManager;
        window.APP_STATE.infoPanel = infoPanel;
        window.APP_STATE.sidebarManager = sidebarManager;
        
        // Initialize data loading
        await dataManager.initialize();
        
        // Initialize map first
        await mapManager.initialize();
        
        // Initialize layer manager with map instance
        const layerManager = new LayerManager(mapManager.map);
        window.APP_STATE.layerManager = layerManager;
        await layerManager.initialize();
        
        // Initialize other components
        searchManager.initialize();
        infoPanel.initialize();
        sidebarManager.initialize();
        
        // Phase 3: Initialize Advanced Features
        const landRegistryManager = new LandRegistryManager();
        const paymentManager = new PaymentManager();
        const performanceManager = new PerformanceManager(mapManager);
        const analyticsManager = new AnalyticsManager();
        const collaborationManager = new CollaborationManager();
        
        // Store Phase 3 components in global state
        window.APP_STATE.landRegistryManager = landRegistryManager;
        window.APP_STATE.paymentManager = paymentManager;
        window.APP_STATE.performanceManager = performanceManager;
        window.APP_STATE.analyticsManager = analyticsManager;
        window.APP_STATE.collaborationManager = collaborationManager;
        
        // Initialize Phase 3 components
        await landRegistryManager.initialize();
        await paymentManager.initialize();
        // PerformanceManager initializes itself in constructor
        await analyticsManager.initialize();
        await collaborationManager.initialize();
        
        // Show welcome message in info panel
        infoPanel.showWelcomeMessage();
        
        // Set up event listeners for data loading
        dataManager.on('dataLoaded', (data) => {
            console.log(`Data loaded: ${data.type}`);
            if (data.type === 'adPlants') {
                layerManager.addADPlantsLayer(data.data);
            } else if (data.type === 'boundaries') {
                // Boundaries are already loaded in LayerManager initialization
                console.log('Boundaries already loaded');
            }
        });
        
        dataManager.on('error', (error) => {
            console.error('Data loading error:', error);
            errorHandler.handleError(error, 'Data Loading');
            infoPanel.showError(`Data loading error: ${error.error.message}`);
        });
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        
        // Use ErrorHandler for better error reporting
        if (window.APP_STATE.errorHandler) {
            window.APP_STATE.errorHandler.handleError(error, 'Application Initialization');
        }
        
        // Show error in info panel
        const infoPanel = window.APP_STATE.infoPanel;
        if (infoPanel) {
            infoPanel.showError(`Application initialization error: ${error.message}`);
        }
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
});

// Site finder button click handler
document.addEventListener('DOMContentLoaded', () => {
    const siteFinderBtn = document.getElementById('site-finder-btn');
    if (siteFinderBtn) {
        siteFinderBtn.addEventListener('click', async () => {
            try {
                const siteFinder = window.APP_STATE.siteFinder;
                const infoPanel = window.APP_STATE.infoPanel;
                
                if (siteFinder && infoPanel) {
                    const results = await siteFinder.findSuitableSites();
                    infoPanel.showSiteFinderResults(results);
                }
            } catch (error) {
                console.error('Site finder error:', error);
                
                // Use ErrorHandler for better error reporting
                if (window.APP_STATE.errorHandler) {
                    window.APP_STATE.errorHandler.handleError(error, 'Site Finder');
                }
                
                const infoPanel = window.APP_STATE.infoPanel;
                if (infoPanel) {
                    infoPanel.showError(`Site finder error: ${error.message}`);
                }
            }
        });
    }
});
