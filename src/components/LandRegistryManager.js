/**
 * LandRegistryManager - Manages UK Land Registry data integration with Vector Tiles
 * Provides access to freehold property boundaries, ownership, and planning data
 * Uses PMTiles/Vector Tiles for efficient lazy-loading at high zoom levels
 */
export class LandRegistryManager {
    constructor() {
        this.gcsBaseUrl = 'https://storage.googleapis.com/moaads_maps';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.vectorTileCache = new Map();
        this.loadedTiles = new Set();
        this.map = null;
        this.minZoom = 12; // Only show parcels at zoom 12+
        this.isLayerAdded = false;
        this.currentZoom = 0;
        this.currentBounds = null;
        this.loadingTiles = new Set();
        this.tileLoadQueue = [];
        this.maxConcurrentTileLoads = 4;
    }

    /**
     * Initialize Land Registry Manager with map instance
     */
    async initialize(mapInstance = null) {
        try {
            if (mapInstance) {
                this.map = mapInstance;
                this.setupMapEventListeners();
            }
            
            console.log('🏠 Land Registry Manager initialized with vector tile support');
            console.log(`📊 Minimum zoom for parcel display: ${this.minZoom}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Land Registry Manager:', error);
            return false;
        }
    }

    /**
     * Setup map event listeners for lazy loading
     */
    setupMapEventListeners() {
        if (!this.map) return;

        // Listen for zoom and move events to trigger tile loading
        this.map.on('moveend', () => {
            this.handleMapMove();
        });

        this.map.on('zoomend', () => {
            this.handleZoomChange();
        });
    }

    /**
     * Handle map movement for lazy loading
     */
    async handleMapMove() {
        if (!this.map) return;

        const zoom = this.map.getZoom();
        this.currentZoom = zoom;
        this.currentBounds = this.map.getBounds();

        // Only load tiles at high zoom levels
        if (zoom >= this.minZoom) {
            await this.loadVisibleTiles();
        } else {
            // Hide layer at low zoom
            this.hideLandRegistryLayer();
        }
    }

    /**
     * Handle zoom changes
     */
    async handleZoomChange() {
        const zoom = this.map.getZoom();
        
        if (zoom >= this.minZoom && !this.isLayerAdded) {
            await this.initializeLandRegistryLayer();
        } else if (zoom < this.minZoom && this.isLayerAdded) {
            this.hideLandRegistryLayer();
        }
    }

    /**
     * Initialize Land Registry layer with vector tile source
     */
    async initializeLandRegistryLayer() {
        if (!this.map || this.isLayerAdded) return;

        try {
            console.log('🏠 Initializing Land Registry vector tile layer...');

            // Add vector tile source for freehold parcels
            const sourceId = 'land-registry-parcels';
            
            // For now, we'll use GeoJSON chunked by quadkey as fallback
            // TODO: Convert to PMTiles when ready
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                cluster: false,
                maxzoom: 18
            });

            // Add fill layer for parcel polygons
            this.map.addLayer({
                id: 'land-registry-fill',
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': '#9932cc',
                    'fill-opacity': 0.3
                },
                filter: ['==', ['geometry-type'], 'Polygon']
            });

            // Add line layer for parcel boundaries
            this.map.addLayer({
                id: 'land-registry-line',
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#9932cc',
                    'line-width': 1,
                    'line-opacity': 0.8
                },
                filter: ['==', ['geometry-type'], 'Polygon']
            });

            // Add click handler for parcel details
            this.map.on('click', 'land-registry-fill', (e) => {
                this.handleParcelClick(e);
            });

            // Add hover effects
            this.map.on('mouseenter', 'land-registry-fill', () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });

            this.map.on('mouseleave', 'land-registry-fill', () => {
                this.map.getCanvas().style.cursor = '';
            });

            this.isLayerAdded = true;
            console.log('✅ Land Registry layer initialized');
            
            // Load visible tiles
            await this.loadVisibleTiles();
            
        } catch (error) {
            console.error('❌ Failed to initialize Land Registry layer:', error);
        }
    }

    /**
     * Load visible tiles based on current map bounds and zoom
     */
    async loadVisibleTiles() {
        if (!this.map || this.currentZoom < this.minZoom) return;

        const bounds = this.map.getBounds();
        const zoom = Math.floor(this.currentZoom);
        
        // Calculate tile coordinates for current view
        const tileCoords = this.getBoundingTiles(bounds, zoom);
        
        for (const tileCoord of tileCoords) {
            const tileKey = `${tileCoord.z}-${tileCoord.x}-${tileCoord.y}`;
            
            if (!this.loadedTiles.has(tileKey) && !this.loadingTiles.has(tileKey)) {
                this.tileLoadQueue.push(tileCoord);
            }
        }
        
        // Process tile load queue
        this.processTileLoadQueue();
    }

    /**
     * Process tile loading queue with concurrency control
     */
    async processTileLoadQueue() {
        while (this.tileLoadQueue.length > 0 && this.loadingTiles.size < this.maxConcurrentTileLoads) {
            const tileCoord = this.tileLoadQueue.shift();
            const tileKey = `${tileCoord.z}-${tileCoord.x}-${tileCoord.y}`;
            
            this.loadingTiles.add(tileKey);
            this.loadTile(tileCoord).finally(() => {
                this.loadingTiles.delete(tileKey);
                // Continue processing queue
                this.processTileLoadQueue();
            });
        }
    }

    /**
     * Load individual tile data
     */
    async loadTile(tileCoord) {
        const tileKey = `${tileCoord.z}-${tileCoord.x}-${tileCoord.y}`;
        
        try {
            // For now, simulate loading freehold parcel data
            // In production, this would fetch from your GCS bucket with actual Land Registry GeoJSON
            const tileData = await this.loadTileFromGCS(tileCoord);
            
            if (tileData && tileData.features.length > 0) {
                this.addTileDataToMap(tileData);
                this.loadedTiles.add(tileKey);
                console.log(`✅ Loaded tile ${tileKey} with ${tileData.features.length} parcels`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to load tile ${tileKey}:`, error);
        }
    }

    /**
     * Load tile data from Google Cloud Storage
     */
    async loadTileFromGCS(tileCoord) {
        try {
            // This would be the actual URL to your Land Registry GeoJSON tiles
            // For now, generating mock data based on tile coordinates
            return this.generateMockParcelData(tileCoord);
            
            // Production implementation would be:
            // const url = `${this.gcsBaseUrl}/land_registry_tiles/${tileCoord.z}/${tileCoord.x}/${tileCoord.y}.json`;
            // const response = await fetch(url);
            // return await response.json();
            
        } catch (error) {
            console.error('❌ Error loading tile from GCS:', error);
            return null;
        }
    }

    /**
     * Generate mock parcel data for demonstration
     */
    generateMockParcelData(tileCoord) {
        const features = [];
        const numParcels = Math.floor(Math.random() * 20) + 5; // 5-25 parcels per tile
        
        // Calculate tile bounds
        const tileBounds = this.getTileBounds(tileCoord.x, tileCoord.y, tileCoord.z);
        
        for (let i = 0; i < numParcels; i++) {
            // Generate random parcel within tile bounds
            const centerLng = tileBounds.west + Math.random() * (tileBounds.east - tileBounds.west);
            const centerLat = tileBounds.south + Math.random() * (tileBounds.north - tileBounds.south);
            
            // Generate small rectangular parcel
            const width = 0.001 + Math.random() * 0.002; // ~100-300m
            const height = 0.001 + Math.random() * 0.002;
            
            const coordinates = [[
                [centerLng - width/2, centerLat - height/2],
                [centerLng + width/2, centerLat - height/2],
                [centerLng + width/2, centerLat + height/2],
                [centerLng - width/2, centerLat + height/2],
                [centerLng - width/2, centerLat - height/2]
            ]];
            
            features.push({
                type: 'Feature',
                properties: {
                    title_no: `TITLE${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    ownership_type: ['Freehold', 'Leasehold'][Math.floor(Math.random() * 2)],
                    area_hectares: (width * height * 12100).toFixed(2), // Rough conversion
                    land_use: ['Agricultural', 'Residential', 'Commercial', 'Industrial'][Math.floor(Math.random() * 4)],
                    registered_owner: this.generateMockOwnerName(),
                    registration_date: this.generateRandomDate('2010-01-01', '2024-01-01'),
                    restrictions: Math.random() > 0.7 ? 'Planning restrictions apply' : 'None',
                    price_paid: Math.floor(Math.random() * 500000) + 100000
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: coordinates
                }
            });
        }
        
        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    /**
     * Add tile data to map
     */
    addTileDataToMap(tileData) {
        if (!this.map) return;
        
        const source = this.map.getSource('land-registry-parcels');
        if (source) {
            // Get existing data
            const existingData = source._data || { type: 'FeatureCollection', features: [] };
            
            // Merge new features
            const mergedFeatures = [...existingData.features, ...tileData.features];
            
            // Update source
            source.setData({
                type: 'FeatureCollection',
                features: mergedFeatures
            });
        }
    }

    /**
     * Handle parcel click events
     */
    handleParcelClick(e) {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        console.log('🏠 Parcel clicked:', properties);
        
        // Show parcel information in info panel
        if (window.APP_STATE && window.APP_STATE.infoPanel) {
            window.APP_STATE.infoPanel.showParcelDetails(properties);
        }
        
        // Highlight selected parcel
        this.highlightParcel(feature);
    }

    /**
     * Highlight selected parcel
     */
    highlightParcel(feature) {
        if (!this.map) return;
        
        // Remove previous highlight
        if (this.map.getLayer('parcel-highlight')) {
            this.map.removeLayer('parcel-highlight');
        }
        if (this.map.getSource('parcel-highlight-source')) {
            this.map.removeSource('parcel-highlight-source');
        }
        
        // Add highlight layer
        this.map.addSource('parcel-highlight-source', {
            type: 'geojson',
            data: feature
        });
        
        this.map.addLayer({
            id: 'parcel-highlight',
            type: 'line',
            source: 'parcel-highlight-source',
            paint: {
                'line-color': '#ff0000',
                'line-width': 3,
                'line-opacity': 1
            }
        });
    }

    /**
     * Hide Land Registry layer
     */
    hideLandRegistryLayer() {
        if (!this.map || !this.isLayerAdded) return;
        
        if (this.map.getLayer('land-registry-fill')) {
            this.map.setLayoutProperty('land-registry-fill', 'visibility', 'none');
        }
        if (this.map.getLayer('land-registry-line')) {
            this.map.setLayoutProperty('land-registry-line', 'visibility', 'none');
        }
    }

    /**
     * Show Land Registry layer
     */
    showLandRegistryLayer() {
        if (!this.map || !this.isLayerAdded) return;
        
        if (this.map.getLayer('land-registry-fill')) {
            this.map.setLayoutProperty('land-registry-fill', 'visibility', 'visible');
        }
        if (this.map.getLayer('land-registry-line')) {
            this.map.setLayoutProperty('land-registry-line', 'visibility', 'visible');
        }
    }

    /**
     * Toggle Land Registry layer visibility
     */
    toggleLayer() {
        if (!this.map || !this.isLayerAdded) return;
        
        const fillLayer = this.map.getLayer('land-registry-fill');
        if (fillLayer) {
            const visibility = this.map.getLayoutProperty('land-registry-fill', 'visibility');
            if (visibility === 'visible') {
                this.hideLandRegistryLayer();
            } else {
                this.showLandRegistryLayer();
            }
        }
    }

    /**
     * Calculate bounding tiles for given bounds and zoom
     */
    getBoundingTiles(bounds, zoom) {
        const tiles = [];
        
        const minTile = this.lngLatToTile(bounds.getWest(), bounds.getNorth(), zoom);
        const maxTile = this.lngLatToTile(bounds.getEast(), bounds.getSouth(), zoom);
        
        for (let x = minTile.x; x <= maxTile.x; x++) {
            for (let y = minTile.y; y <= maxTile.y; y++) {
                tiles.push({ x, y, z: zoom });
            }
        }
        
        return tiles;
    }

    /**
     * Convert longitude/latitude to tile coordinates
     */
    lngLatToTile(lng, lat, zoom) {
        const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
        const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        return { x, y };
    }

    /**
     * Get tile bounds from tile coordinates
     */
    getTileBounds(x, y, z) {
        const n = Math.pow(2, z);
        const west = x / n * 360 - 180;
        const east = (x + 1) / n * 360 - 180;
        const north = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
        const south = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;
        
        return { north, south, east, west };
    }

    /**
     * Get parcel details for Site Finder analysis
     */
    async getParcelDetails(titleNumber) {
        try {
            const cacheKey = `parcel_${titleNumber}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // Mock detailed parcel data for Site Finder
            const details = {
                titleNumber: titleNumber,
                area: Math.random() * 50 + 10, // 10-60 hectares
                soilType: ['Clay', 'Sandy', 'Loam', 'Chalk'][Math.floor(Math.random() * 4)],
                gradient: Math.random() * 15, // 0-15% slope
                access: ['A-road', 'B-road', 'Minor road', 'Farm track'][Math.floor(Math.random() * 4)],
                utilities: {
                    electricity: Math.random() > 0.3,
                    water: Math.random() > 0.2,
                    gas: Math.random() > 0.6
                },
                constraints: {
                    flood: Math.random() > 0.8,
                    protected: Math.random() > 0.9,
                    heritage: Math.random() > 0.95
                },
                development: {
                    planningHistory: Math.floor(Math.random() * 5),
                    approvedUses: ['Agricultural', 'Renewable Energy'][Math.floor(Math.random() * 2)]
                }
            };
            
            this.addToCache(cacheKey, details);
            return details;
            
        } catch (error) {
            console.error('❌ Error getting parcel details:', error);
            return null;
        }
    }

    /**
     * Search parcels within radius for Site Finder
     */
    async searchParcelsInRadius(center, radiusKm) {
        const parcels = [];
        const [centerLng, centerLat] = center;
        
        // Search through loaded tiles for parcels within radius
        if (this.map) {
            const source = this.map.getSource('land-registry-parcels');
            if (source && source._data) {
                const features = source._data.features;
                
                for (const feature of features) {
                    const [lng, lat] = feature.geometry.coordinates[0][0]; // First coordinate of polygon
                    const distance = this.calculateDistance(centerLat, centerLng, lat, lng);
                    
                    if (distance <= radiusKm) {
                        parcels.push({
                            ...feature,
                            distance: distance
                        });
                    }
                }
            }
        }
        
        return parcels.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Calculate distance between two points in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Generate mock owner name
     */
    generateMockOwnerName() {
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }

    /**
     * Generate random date
     */
    generateRandomDate(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        return new Date(randomTime).toISOString().split('T')[0];
    }

    /**
     * Clear all loaded tiles and cache
     */
    clearTiles() {
        this.loadedTiles.clear();
        this.vectorTileCache.clear();
        this.tileLoadQueue = [];
        this.loadingTiles.clear();
        
        // Clear map data
        if (this.map) {
            const source = this.map.getSource('land-registry-parcels');
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: []
                });
            }
        }
        
        console.log('🗑️ Land Registry tiles cleared');
    }

    /**
     * Cache management
     */
    addToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Land Registry cache cleared');
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            loadedTiles: this.loadedTiles.size,
            loadingTiles: this.loadingTiles.size,
            queuedTiles: this.tileLoadQueue.length,
            cacheSize: this.cache.size,
            vectorCacheSize: this.vectorTileCache.size,
            minZoom: this.minZoom,
            currentZoom: this.currentZoom,
            isLayerAdded: this.isLayerAdded
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.getStats(),
            cacheHitRate: this.cache.size > 0 ? (this.cache.size / (this.cache.size + this.loadedTiles.size)) : 0,
            memoryUsage: {
                tilesInMemory: this.loadedTiles.size,
                cacheEntries: this.cache.size,
                estimatedMB: (this.loadedTiles.size * 50 + this.cache.size * 10) / 1024 // Rough estimate
            }
        };
    }
}