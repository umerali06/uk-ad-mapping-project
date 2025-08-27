/**
 * DataManager - Handles data loading, caching, and management
 * Manages AD plant data, boundary data, and other geospatial datasets
 */
export class DataManager {
    constructor() {
        this.cache = new Map();
        this.dataSources = {
            adPlants: null,
            boundaries: null,
            landRegistry: null
        };
        this.loadingStates = {
            adPlants: false,
            boundaries: false,
            landRegistry: false
        };
        this.eventListeners = new Map();
    }

    /**
     * Initialize data sources and load initial data
     */
    async initialize() {
        try {
            console.log('Initializing DataManager...');
            
            // Load boundary data first (LAD/LPA boundaries)
            await this.loadBoundaryData();
            
            // Load AD plant data
            await this.loadADPlantData();
            
            console.log('DataManager initialized successfully');
            this.emit('dataReady', { boundaries: true, adPlants: true });
            
        } catch (error) {
            console.error('Error initializing DataManager:', error);
            this.emit('error', { type: 'initialization', error });
        }
    }

    /**
     * Load boundary data (Local Authority Districts and Local Planning Authorities)
     */
    async loadBoundaryData() {
        if (this.loadingStates.boundaries) return;
        
        this.loadingStates.boundaries = true;
        this.emit('loadingStateChanged', { type: 'boundaries', loading: true });
        
        try {
            // For now, create placeholder boundary data
            // In production, this would load from actual GeoJSON files or API
            const boundaryData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            name: 'Sample LAD',
                            type: 'LAD',
                            code: 'E12345678'
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [-2.0, 53.0],
                                [-2.0, 53.1],
                                [-1.9, 53.1],
                                [-1.9, 53.0],
                                [-2.0, 53.0]
                            ]]
                        }
                    }
                ]
            };
            
            this.dataSources.boundaries = boundaryData;
            this.cache.set('boundaries', boundaryData);
            
            console.log('Boundary data loaded successfully');
            this.emit('dataLoaded', { type: 'boundaries', data: boundaryData });
            
        } catch (error) {
            console.error('Error loading boundary data:', error);
            this.emit('error', { type: 'boundaries', error });
        } finally {
            this.loadingStates.boundaries = false;
            this.emit('loadingStateChanged', { type: 'boundaries', loading: false });
        }
    }

    /**
     * Load AD plant data
     */
    async loadADPlantData() {
        if (this.loadingStates.adPlants) return;
        
        this.loadingStates.adPlants = true;
        this.emit('loadingStateChanged', { type: 'adPlants', loading: true });
        
        try {
            // For now, create placeholder AD plant data
            // In production, this would load from actual database or API
            const adPlantData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            name: 'Sample AD Plant',
                            developer: 'Sample Developer Ltd',
                            location: 'Sample Location',
                            technology: 'Anaerobic Digestion',
                            status: 'Operational',
                            capacity: '50,000 tonnes/year',
                            feedstock: 'Food waste, agricultural waste',
                            energyOutput: '2.5 MW',
                            commissioningDate: '2023-01-01'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [-1.95, 53.05]
                        }
                    }
                ]
            };
            
            this.dataSources.adPlants = adPlantData;
            this.cache.set('adPlants', adPlantData);
            
            console.log('AD plant data loaded successfully');
            this.emit('dataLoaded', { type: 'adPlants', data: adPlantData });
            
        } catch (error) {
            console.error('Error loading AD plant data:', error);
            this.emit('error', { type: 'adPlants', error });
        } finally {
            this.loadingStates.adPlants = false;
            this.emit('loadingStateChanged', { type: 'adPlants', loading: false });
        }
    }

    /**
     * Get data by type
     */
    getData(type) {
        return this.dataSources[type] || this.cache.get(type);
    }

    /**
     * Get loading state for a data type
     */
    isLoading(type) {
        return this.loadingStates[type] || false;
    }

    /**
     * Check if all required data is loaded
     */
    isDataReady() {
        return this.dataSources.boundaries && this.dataSources.adPlants;
    }

    /**
     * Clear cache for a specific data type
     */
    clearCache(type) {
        if (type) {
            this.cache.delete(type);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Event system for data loading states
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

