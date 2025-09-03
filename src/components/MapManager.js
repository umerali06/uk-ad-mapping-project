/**
 * MapManager - Handles MapLibre GL JS map initialization and configuration
 */
export class MapManager {
    constructor() {
        this.map = null;
        this.mapContainer = document.getElementById('map');
    }
    
    /**
     * Initialize the MapLibre GL JS map
     */
    async initialize() {
        try {
            console.log('Initializing MapLibre GL JS map...');
            
            // Check if MapLibre GL JS is available
            if (typeof maplibregl === 'undefined') {
                throw new Error('MapLibre GL JS library not loaded');
            }
            
            // Create the map instance with fallback sources
            this.map = new maplibregl.Map({
                container: this.mapContainer,
                style: {
                    version: 8,
                    glyphs: 'https://unpkg.com/@maplibre/maplibre-gl-styles@1.0.0/fonts/{fontstack}/{range}.pbf',
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: [
                                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            ],
                            tileSize: 256,
                            attribution: '© OpenStreetMap contributors'
                        },
                        'carto': {
                            type: 'raster',
                            tiles: [
                                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                            ],
                            tileSize: 256,
                            attribution: '© CARTO'
                        }
                    },
                    layers: [
                        {
                            id: 'osm-tiles',
                            type: 'raster',
                            source: 'osm',
                            minzoom: 0,
                            maxzoom: 19
                        }
                    ]
                },
                center: [-2.5, 54.5], // UK center coordinates
                zoom: 6, // Country view
                minZoom: 5, // Minimum zoom for country view
                maxZoom: 18, // Maximum zoom for detailed site view
                attributionControl: true,
                customAttribution: '© UK AD Mapping Application'
            });
            
            // Wait for map to load with increased timeout and retry logic
            await this.waitForMapLoad();
            
            // Add map controls
            this.addMapControls();
            
            // Add event listeners
            this.addEventListeners();
            
            console.log('Map initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize map:', error);
            throw error;
        }
    }

    /**
     * Wait for map to load with retry logic and fallback sources
     */
    async waitForMapLoad() {
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`🔄 Attempting map load (attempt ${retryCount + 1}/${maxRetries})...`);
                
                // Wait for map to load with increased timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Map loading timeout (attempt ${retryCount + 1})`));
                    }, 60000); // 60 seconds timeout
                    
                    this.map.on('load', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    
                    this.map.on('error', (e) => {
                        clearTimeout(timeout);
                        reject(new Error(`Map error: ${e.error?.message || 'Unknown error'}`));
                    });
                });
                
                console.log('✅ Map loaded successfully');
                return;
                
            } catch (error) {
                retryCount++;
                console.warn(`⚠️ Map load attempt ${retryCount} failed:`, error.message);
                
                if (retryCount < maxRetries) {
                    // Try switching to fallback tile source
                    try {
                        console.log('🔄 Switching to fallback tile source...');
                        this.map.getSource('osm-tiles').setTiles([
                            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                        ]);
                        
                        // Wait a bit before retrying
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                    } catch (fallbackError) {
                        console.warn('⚠️ Fallback source switch failed:', fallbackError.message);
                    }
                } else {
                    // All retries failed, throw error
                    throw new Error(`Map failed to load after ${maxRetries} attempts. Last error: ${error.message}`);
                }
            }
        }
    }
    
    /**
     * Add map controls (zoom, rotation, etc.)
     */
    addMapControls() {
        // Add zoom control
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        
        // Add fullscreen control
        this.map.addControl(new maplibregl.FullscreenControl(), 'top-right');
        
        // Add geolocate control
        this.map.addControl(new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        }), 'top-right');
    }
    
    /**
     * Add map event listeners
     */
    addEventListeners() {
        // Map click event for feature selection
        this.map.on('click', (e) => {
            this.handleMapClick(e);
        });
        
        // Map move event for updating coordinates
        this.map.on('move', () => {
            this.updateCoordinates();
        });
        
        // Map load event for additional setup
        this.map.on('load', () => {
            this.onMapLoad();
        });
        
        // Error handling
        this.map.on('error', (e) => {
            console.error('Map error:', e);
        });
    }
    
    /**
     * Handle map click events with priority-based feature selection
     */
    handleMapClick(e) {
        const features = this.map.queryRenderedFeatures(e.point);
        
        if (features.length > 0) {
            // Define feature priority (higher priority = more important)
            const featurePriorities = {
                'layer-ad-plants': 100,           // AD plants highest priority
                'land-registry-fill': 90,         // Land registry parcels high priority
                'layer-lad': 80,                  // LAD boundaries
                'layer-lpa': 80,                  // LPA boundaries
                'roads-m': 70,                    // Motorways
                'roads-a': 65,                    // A-roads
                'roads-b': 60,                    // B-roads
                'roads-minor': 55,                // Minor roads
                'layer-dno': 50,                  // Infrastructure layers
                'layer-water': 50,
                'layer-nts': 50,
                'layer-brownfield': 45,
                'layer-aonb': 40,                 // Environmental layers
                'layer-sssi': 40,
                'layer-nvz': 35,
                'layer-flood': 35,
                'layer-alc': 30,
                'default': 10                     // Default priority
            };
            
            // Sort features by priority
            const sortedFeatures = features.sort((a, b) => {
                const priorityA = featurePriorities[a.layer?.id] || featurePriorities['default'];
                const priorityB = featurePriorities[b.layer?.id] || featurePriorities['default'];
                return priorityB - priorityA;
            });
            
            const feature = sortedFeatures[0];
            console.log('Clicked feature (priority-selected):', feature);
            
            // Add visual feedback for click
            this.addClickFeedback(e.lngLat);
            
            // Show feature information based on type
            this.showFeatureInfo(feature, e.lngLat);
        } else {
            // Hide info panel if clicking on empty space
            this.hideFeatureInfo();
        }
    }

    /**
     * Add visual feedback for map clicks
     */
    addClickFeedback(lngLat) {
        // Remove previous click marker
        if (this.clickMarker) {
            this.clickMarker.remove();
        }
        
        // Add temporary click marker
        this.clickMarker = new maplibregl.Marker({
            color: '#ff4444',
            scale: 0.8
        })
        .setLngLat(lngLat)
        .addTo(this.map);
        
        // Remove click marker after 2 seconds
        setTimeout(() => {
            if (this.clickMarker) {
                this.clickMarker.remove();
                this.clickMarker = null;
            }
        }, 2000);
    }
    
    /**
     * Show feature information in the info panel
     */
    showFeatureInfo(feature, coordinates) {
        const layerId = feature.layer?.id;
        const properties = feature.properties || {};
        
        // Enhanced feature information with type detection
        const featureInfo = {
            ...feature,
            clickCoordinates: coordinates,
            detectedType: this.detectFeatureType(layerId, properties),
            formattedProperties: this.formatFeatureProperties(properties, layerId)
        };
        
        // Send to appropriate handler based on feature type
        if (window.APP_STATE?.infoPanel) {
            const infoPanel = window.APP_STATE.infoPanel;
            
            switch (featureInfo.detectedType) {
                case 'ad-plant':
                    infoPanel.showADPlantDetails(featureInfo.formattedProperties);
                    break;
                case 'land-registry':
                    infoPanel.showParcelDetails(featureInfo.formattedProperties);
                    break;
                case 'lad-boundary':
                    infoPanel.showLADAnalysis(featureInfo.formattedProperties);
                    break;
                case 'lpa-boundary':
                    infoPanel.showLPAAnalysis(featureInfo.formattedProperties);
                    break;
                case 'road':
                    infoPanel.showRoadDetails(featureInfo.formattedProperties);
                    break;
                case 'infrastructure':
                    infoPanel.showInfrastructureDetails(featureInfo.formattedProperties);
                    break;
                case 'environmental':
                    infoPanel.showEnvironmentalDetails(featureInfo.formattedProperties);
                    break;
                default:
                    infoPanel.showFeatureInfo(featureInfo);
            }
        }
        
        // Dispatch custom event for other components
        const event = new CustomEvent('showFeatureInfo', { detail: featureInfo });
        document.dispatchEvent(event);
    }

    /**
     * Detect feature type based on layer and properties
     */
    detectFeatureType(layerId, properties) {
        if (layerId?.includes('ad-plants')) return 'ad-plant';
        if (layerId?.includes('land-registry')) return 'land-registry';
        if (layerId?.includes('lad')) return 'lad-boundary';
        if (layerId?.includes('lpa')) return 'lpa-boundary';
        if (layerId?.includes('roads')) return 'road';
        if (layerId?.includes('dno') || layerId?.includes('water') || layerId?.includes('nts') || layerId?.includes('brownfield')) return 'infrastructure';
        if (layerId?.includes('aonb') || layerId?.includes('sssi') || layerId?.includes('nvz') || layerId?.includes('flood') || layerId?.includes('alc')) return 'environmental';
        
        return 'generic';
    }

    /**
     * Format feature properties for display
     */
    formatFeatureProperties(properties, layerId) {
        const formatted = { ...properties };
        
        // Add layer-specific formatting
        if (layerId?.includes('ad-plants')) {
            formatted.displayName = properties.name || properties.siteName || 'AD Plant';
            formatted.category = 'Anaerobic Digestion Facility';
            formatted.status = properties.status || properties.operationalStatus || 'Unknown';
            formatted.capacity = properties.capacity ? `${properties.capacity} MW` : 'Not specified';
            formatted.technology = properties.technology || properties.techType || 'Not specified';
            formatted.operator = properties.operator || properties.developer || 'Not specified';
        } else if (layerId?.includes('land-registry')) {
            formatted.displayName = `Land Parcel ${properties.title_no || ''}`;
            formatted.category = 'Land Registry Property';
        } else if (layerId?.includes('roads')) {
            formatted.displayName = properties.road_name || properties.name || 'Road';
            formatted.category = `${properties.road_class || 'Unknown'} Road`;
            formatted.surface = properties.surface || 'Unknown';
        } else if (layerId?.includes('lad')) {
            formatted.displayName = properties.LAD23NM || properties.name || 'LAD District';
            formatted.category = 'Local Authority District';
            formatted.code = properties.LAD23CD || properties.code;
        } else if (layerId?.includes('lpa')) {
            formatted.displayName = properties.LPA23NM || properties.name || 'LPA Authority';
            formatted.category = 'Local Planning Authority';
            formatted.code = properties.LPA23CD || properties.code;
        }
        
        return formatted;
    }
    
    /**
     * Hide feature information panel
     */
    hideFeatureInfo() {
        // Dispatch custom event for info panel to handle
        const event = new CustomEvent('hideFeatureInfo');
        document.dispatchEvent(event);
    }
    
    /**
     * Focus map on a specific location
     */
    focusOnLocation(coordinates) {
        if (!this.map) return;
        
        try {
            const [lng, lat] = coordinates;
            
            // Fly to the location with animation
            this.map.flyTo({
                center: [lng, lat],
                zoom: 14, // Close zoom for site detail
                duration: 2000, // 2 second animation
                essential: true
            });
            
            // Add a temporary marker to highlight the location
            this.addTemporaryMarker(coordinates);
            
        } catch (error) {
            console.error('Error focusing on location:', error);
        }
    }
    
    /**
     * Add a temporary marker at the specified location
     */
    addTemporaryMarker(coordinates) {
        if (!this.map) return;
        
        const [lng, lat] = coordinates;
        
        // Remove any existing temporary marker
        if (this.tempMarker) {
            this.map.removeLayer('temp-marker');
            this.map.removeSource('temp-marker');
        }
        
        // Add temporary marker source
        this.map.addSource('temp-marker', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                properties: {}
            }
        });
        
        // Add temporary marker layer
        this.map.addLayer({
            id: 'temp-marker',
            type: 'circle',
            source: 'temp-marker',
            paint: {
                'circle-radius': 12,
                'circle-color': '#3b82f6',
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 3
            }
        });
        
        // Store reference to remove later
        this.tempMarker = true;
        
        // Remove marker after 5 seconds
        setTimeout(() => {
            if (this.map && this.tempMarker) {
                this.map.removeLayer('temp-marker');
                this.map.removeSource('temp-marker');
                this.tempMarker = null;
            }
        }, 5000);
    }
    
    /**
     * Update coordinate display
     */
    updateCoordinates() {
        if (!this.map) return;
        
        const center = this.map.getCenter();
        // You can add a coordinate display element here if needed
        console.log('Map center:', center.lng.toFixed(4), center.lat.toFixed(4));
    }
    
    /**
     * Additional setup after map loads
     */
    onMapLoad() {
        console.log('Map fully loaded');
        
        // Add custom map style adjustments
        this.map.getCanvas().style.cursor = 'default';
        
        // You can add additional map setup here
    }
    
    /**
     * Get map instance
     */
    getMap() {
        return this.map;
    }
    
    /**
     * Destroy map instance
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}
