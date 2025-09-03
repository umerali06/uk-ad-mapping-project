/**
 * LayerManager - Manages map layers, data sources, and layer visibility
 * Handles AD plant layers, boundary layers, and other geospatial data layers
 */
export class LayerManager {
    constructor(map) {
        this.map = map;
        this.layers = {};
        this.sources = {};
        this.layerGroups = {
            boundaries: ['lad', 'lpa'],
            adPlants: ['ad-plants'],
            manure: ['beef-fym', 'beef-slurry', 'dairy-fym', 'dairy-slurry', 'broilers', 'layers', 'pigs', 'sheep'],
            environmental: ['aonb', 'sssi', 'nvz', 'flood', 'alc'],
            infrastructure: ['dno', 'water', 'brownfield', 'nts', 'roads'],
            landRegistry: ['freehold']
        };
        this.activeLayers = new Set();
        this.dataSources = {
            adPlants: null,
            boundaries: null,
            manure: null,
            environmental: null,
            infrastructure: null,
            landRegistry: null
        };
    }

    /**
     * Initialize the layer manager
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Layer Manager...');
            
            // Wait for map to be available
            if (!this.map) {
                throw new Error('Map instance not available');
            }
            
            // Initialize data sources
            await this.initializeDataSources();
            
            // Load initial layers
            await this.loadInitialLayers();
            
            // Initialize Land Registry Manager
            await this.initializeLandRegistryManager();
            
            console.log('✅ Layer Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Layer Manager:', error);
            throw error;
        }
    }

    /**
     * Initialize Land Registry Manager
     */
    async initializeLandRegistryManager() {
        try {
            if (window.APP_STATE && window.APP_STATE.landRegistryManager) {
                await window.APP_STATE.landRegistryManager.initialize(this.map);
                console.log('✅ Land Registry Manager integrated with LayerManager');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Land Registry Manager:', error);
        }
    }

    /**
     * Initialize data sources
     */
    async initializeDataSources() {
        try {
            // For now, create placeholder data sources
            // In production, this would load from actual data files or APIs
            
            // Boundary data source
            this.dataSources.boundaries = {
                lad: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: { name: 'Sample LAD', type: 'LAD', code: 'E12345678' },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[
                                    [-2.0, 53.0], [-2.0, 53.1], [-1.9, 53.1], [-1.9, 53.0], [-2.0, 53.0]
                                ]]
                            }
                        }
                    ]
                },
                lpa: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: { name: 'Sample LPA', type: 'LPA', code: 'E87654321' },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[
                                    [-1.95, 53.02], [-1.95, 53.08], [-1.85, 53.08], [-1.85, 53.02], [-1.95, 53.02]
                                ]]
                            }
                        }
                    ]
                }
            };
            
            // AD plants data source
            this.dataSources.adPlants = {
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
                            capacity: '50,000 tonnes/year'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [-1.95, 53.05]
                        }
                    }
                ]
            };
            
            // Manure volumes data source (placeholder)
            this.dataSources.manure = {
                beef: { type: 'FeatureCollection', features: [] },
                dairy: { type: 'FeatureCollection', features: [] },
                poultry: { type: 'FeatureCollection', features: [] },
                pigs: { type: 'FeatureCollection', features: [] },
                sheep: { type: 'FeatureCollection', features: [] }
            };
            
            // Environmental data source (placeholder)
            this.dataSources.environmental = {
                aonb: { type: 'FeatureCollection', features: [] },
                sssi: { type: 'FeatureCollection', features: [] },
                nvz: { type: 'FeatureCollection', features: [] },
                flood: { type: 'FeatureCollection', features: [] },
                alc: { type: 'FeatureCollection', features: [] }
            };
            
            // Infrastructure data source (placeholder)
            this.dataSources.infrastructure = {
                dno: { type: 'FeatureCollection', features: [] },
                water: { type: 'FeatureCollection', features: [] },
                brownfield: { type: 'FeatureCollection', features: [] },
                nts: { type: 'FeatureCollection', features: [] },
                roads: { type: 'FeatureCollection', features: [] }
            };
            
            // Land registry data source (placeholder)
            this.dataSources.landRegistry = {
                freehold: { type: 'FeatureCollection', features: [] }
            };
            
            console.log('📊 Data sources initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize data sources:', error);
            throw error;
        }
    }

    /**
     * Load initial layers
     */
    async loadInitialLayers() {
        try {
            // Load boundary layers
            await this.loadBoundaryLayers();
            
            // Load AD plants layer
            await this.loadADPlantsLayer();
            
            // Load other layer types (placeholder layers for now)
            await this.loadPlaceholderLayers();
            
            console.log('✅ Initial layers loaded');
            
        } catch (error) {
            console.error('❌ Failed to load initial layers:', error);
            throw error;
        }
    }

    /**
     * Load boundary layers (LAD and LPA)
     */
    async loadBoundaryLayers() {
        try {
            // Add LAD boundary layer
            await this.addBoundaryLayer('lad', this.dataSources.boundaries.lad);
            
            // Add LPA boundary layer
            await this.addBoundaryLayer('lpa', this.dataSources.boundaries.lpa);
            
            console.log('✅ Boundary layers loaded');
            
        } catch (error) {
            console.error('❌ Failed to load boundary layers:', error);
            throw error;
        }
    }

    /**
     * Add a boundary layer to the map
     */
    async addBoundaryLayer(layerId, data) {
        try {
            if (!this.map) {
                throw new Error('Map instance not available');
            }
            
            const sourceId = `source-${layerId}`;
            const layerIdFull = `layer-${layerId}`;
            
            // Add source
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: data
            });
            
            // Add layer
            this.map.addLayer({
                id: layerIdFull,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 2,
                    'line-opacity': 0.8
                }
            });
            
            // Store references
            this.sources[layerId] = sourceId;
            this.layers[layerId] = layerIdFull;
            
            // Set initial visibility to false
            this.map.setLayoutProperty(layerIdFull, 'visibility', 'none');
            
            console.log(`✅ Added boundary layer: ${layerId}`);
            
        } catch (error) {
            console.error(`❌ Failed to add boundary layer ${layerId}:`, error);
            throw error;
        }
    }

    /**
     * Load AD plants layer
     */
    async loadADPlantsLayer() {
        try {
            await this.addADPlantsLayer(this.dataSources.adPlants);
            console.log('✅ AD plants layer loaded');
            
        } catch (error) {
            console.error('❌ Failed to load AD plants layer:', error);
            throw error;
        }
    }

    /**
     * Add AD plants layer to the map with enhanced styling
     */
    async addADPlantsLayer(data) {
        try {
            if (!this.map) {
                throw new Error('Map instance not available');
            }
            
            const sourceId = 'source-ad-plants';
            const layerId = 'layer-ad-plants';
            
            // Generate realistic AD plant data if not provided
            if (!data || !data.features) {
                data = this.generateADPlantData();
            }
            
            // Add source with clustering enabled for large datasets
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: data,
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points
            });
            
            // Add cluster count layer
            this.map.addLayer({
                id: layerId + '-clusters',
                type: 'circle',
                source: sourceId,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',  // Blue for small clusters
                        10,
                        '#f1f075',  // Yellow for medium clusters
                        30,
                        '#f28cb1'   // Pink for large clusters
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,  // 20px radius for small clusters
                        10,
                        30,  // 30px radius for medium clusters
                        30,
                        40   // 40px radius for large clusters
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
            
            // Add cluster count labels
            this.map.addLayer({
                id: layerId + '-cluster-count',
                type: 'symbol',
                source: sourceId,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });
            
            // Add individual AD plants (unclustered points)
            this.map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceId,
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-radius': [
                        'case',
                        ['==', ['get', 'status'], 'Operational'], 10,
                        ['==', ['get', 'status'], 'Under Construction'], 8,
                        ['==', ['get', 'status'], 'Planning Granted'], 6,
                        5 // Default size
                    ],
                    'circle-color': [
                        'case',
                        ['==', ['get', 'status'], 'Operational'], '#16a34a',
                        ['==', ['get', 'status'], 'Under Construction'], '#2563eb',
                        ['==', ['get', 'status'], 'Planning Granted'], '#9333ea',
                        ['==', ['get', 'status'], 'Planning Application'], '#ea580c',
                        '#dc2626' // Default color for refused/other
                    ],
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-opacity': 0.9
                }
            });
            
            // Add hover effects
            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
            
            // Store references
            this.sources['ad-plants'] = sourceId;
            this.layers['ad-plants'] = [layerId, layerId + '-clusters', layerId + '-cluster-count'];
            
            // Set initial visibility to true to show AD plants by default
            this.map.setLayoutProperty(layerId, 'visibility', 'visible');
            this.map.setLayoutProperty(layerId + '-clusters', 'visibility', 'visible');
            this.map.setLayoutProperty(layerId + '-cluster-count', 'visibility', 'visible');
            this.activeLayers.add('ad-plants');
            
            console.log('✅ Added enhanced AD plants layer with clustering');
            
        } catch (error) {
            console.error('❌ Failed to add AD plants layer:', error);
            throw error;
        }
    }

    /**
     * Generate realistic AD plant data for demonstration
     */
    generateADPlantData() {
        const features = [];
        const statuses = ['Operational', 'Under Construction', 'Planning Granted', 'Planning Application', 'Refused'];
        const technologies = ['CHP', 'GtG', 'GtG+CHP', 'Injection', 'Other'];
        const operators = ['ENGIE', 'Biogen', 'Agrivert', 'Anaergia', 'Future Biogas', 'Independent'];
        
        // Generate 150 realistic AD plants across UK
        for (let i = 0; i < 150; i++) {
            const lng = -6 + Math.random() * 8; // UK longitude range
            const lat = 50 + Math.random() * 10; // UK latitude range
            
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const technology = technologies[Math.floor(Math.random() * technologies.length)];
            const operator = operators[Math.floor(Math.random() * operators.length)];
            const capacity = Math.round((Math.random() * 5 + 0.5) * 100) / 100; // 0.5-5.5 MW
            
            features.push({
                type: 'Feature',
                properties: {
                    name: `${operator} AD Plant ${i + 1}`,
                    status: status,
                    technology: technology,
                    operator: operator,
                    capacity: capacity,
                    operationalDate: status === 'Operational' ? 
                        new Date(2015 + Math.random() * 9, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0] : 
                        null,
                    plannedDate: status !== 'Operational' ? 
                        new Date(2024 + Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0] : 
                        null,
                    feedstock: ['Food waste', 'Agricultural waste', 'Energy crops', 'Sewage sludge'][Math.floor(Math.random() * 4)],
                    gasUtilisation: technology.includes('CHP') ? 'Heat & Power' : technology.includes('GtG') ? 'Grid injection' : 'Other',
                    planningRef: `${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                    postcode: this.generateMockPostcode(),
                    coordinates: [lng, lat]
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            });
        }
        
        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    /**
     * Generate mock UK postcode
     */
    generateMockPostcode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const area = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
        const district = Math.floor(Math.random() * 99) + 1;
        const sector = Math.floor(Math.random() * 9);
        const unit = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
        
        return `${area}${district} ${sector}${unit}`;
    }

    /**
     * Load placeholder layers for other categories
     */
    async loadPlaceholderLayers() {
        try {
            // Add placeholder layers for manure volumes
            await this.addPlaceholderLayer('beef-fym', 'manure', '#8b4513');
            await this.addPlaceholderLayer('beef-slurry', 'manure', '#a0522d');
            await this.addPlaceholderLayer('dairy-fym', 'manure', '#cd853f');
            await this.addPlaceholderLayer('dairy-slurry', 'manure', '#deb887');
            await this.addPlaceholderLayer('broilers', 'manure', '#f4a460');
            await this.addPlaceholderLayer('layers', 'manure', '#daa520');
            await this.addPlaceholderLayer('pigs', 'manure', '#b8860b');
            await this.addPlaceholderLayer('sheep', 'manure', '#d2691e');
            
            // Add placeholder layers for environmental
            await this.addPlaceholderLayer('aonb', 'environmental', '#228b22');
            await this.addPlaceholderLayer('sssi', 'environmental', '#32cd32');
            await this.addPlaceholderLayer('nvz', 'environmental', '#90ee90');
            await this.addPlaceholderLayer('flood', 'environmental', '#4169e1');
            await this.addPlaceholderLayer('alc', 'environmental', '#20b2aa');
            
            // Add placeholder layers for infrastructure
            await this.addPlaceholderLayer('dno', 'infrastructure', '#ff4500');
            await this.addPlaceholderLayer('water', 'infrastructure', '#00bfff');
            await this.addPlaceholderLayer('brownfield', 'infrastructure', '#8b4513');
            await this.addPlaceholderLayer('nts', 'infrastructure', '#ff6347');
            
            // Add roads layer with proper styling by class
            await this.addRoadNetworkLayer();
            
            // Note: Land Registry layer is now handled by LandRegistryManager
            // with proper vector tile support and lazy loading
            
            console.log('✅ Placeholder layers loaded');
            
        } catch (error) {
            console.error('❌ Failed to load placeholder layers:', error);
        }
    }

    /**
     * Add a placeholder layer
     */
    async addPlaceholderLayer(layerId, category, color) {
        try {
            if (!this.map) return;
            
            const sourceId = `source-${layerId}`;
            const layerIdFull = `layer-${layerId}`;
            
            // Create a simple placeholder feature
            const placeholderData = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { name: layerId, category: category },
                        geometry: {
                            type: 'Point',
                            coordinates: [-1.9 + Math.random() * 0.1, 53.0 + Math.random() * 0.1]
                        }
                    }
                ]
            };
            
            // Add source
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: placeholderData
            });
            
            // Add layer
            this.map.addLayer({
                id: layerIdFull,
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': 4,
                    'circle-color': color,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1
                }
            });
            
            // Store references
            this.sources[layerId] = sourceId;
            this.layers[layerId] = layerIdFull;
            
            // Set initial visibility to false
            this.map.setLayoutProperty(layerIdFull, 'visibility', 'none');
            
        } catch (error) {
            console.error(`❌ Failed to add placeholder layer ${layerId}:`, error);
        }
    }

    /**
     * Add road network layer with styling by class (M/A/B roads)
     */
    async addRoadNetworkLayer() {
        try {
            console.log('🛣️ Adding road network layer...');
            
            // Generate mock road data for demonstration
            // In production, this would load from your GCS MBTiles/PMTiles
            const roadData = this.generateMockRoadData();
            
            const sourceId = 'roads-source';
            
            // Add source
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: roadData,
                lineMetrics: true
            });
            
            // Add M-roads (Motorways) - thickest, red
            this.map.addLayer({
                id: 'roads-m',
                type: 'line',
                source: sourceId,
                filter: ['==', ['get', 'road_class'], 'M'],
                paint: {
                    'line-color': '#e74c3c',
                    'line-width': 4,
                    'line-opacity': 0.8
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            // Add A-roads (A-class) - medium, orange
            this.map.addLayer({
                id: 'roads-a',
                type: 'line',
                source: sourceId,
                filter: ['==', ['get', 'road_class'], 'A'],
                paint: {
                    'line-color': '#f39c12',
                    'line-width': 3,
                    'line-opacity': 0.8
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            // Add B-roads (B-class) - thin, yellow
            this.map.addLayer({
                id: 'roads-b',
                type: 'line',
                source: sourceId,
                filter: ['==', ['get', 'road_class'], 'B'],
                paint: {
                    'line-color': '#f1c40f',
                    'line-width': 2,
                    'line-opacity': 0.7
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            // Add minor roads - thinnest, gray
            this.map.addLayer({
                id: 'roads-minor',
                type: 'line',
                source: sourceId,
                filter: ['==', ['get', 'road_class'], 'Minor'],
                paint: {
                    'line-color': '#95a5a6',
                    'line-width': 1,
                    'line-opacity': 0.6
                },
                layout: {
                    'visibility': 'none'
                }
            });
            
            // Store references for the combined roads layer
            this.sources['roads'] = sourceId;
            this.layers['roads'] = ['roads-m', 'roads-a', 'roads-b', 'roads-minor'];
            
            console.log('✅ Road network layer added with class-based styling');
            
        } catch (error) {
            console.error('❌ Failed to add road network layer:', error);
        }
    }
    
    /**
     * Generate mock road data for demonstration
     */
    generateMockRoadData() {
        const features = [];
        const roadClasses = ['M', 'A', 'B', 'Minor'];
        const roadNames = {
            'M': ['M1', 'M25', 'M4', 'M6', 'M40'],
            'A': ['A1', 'A40', 'A34', 'A413', 'A4010'],
            'B': ['B480', 'B481', 'B4009', 'B4011'],
            'Minor': ['Station Road', 'High Street', 'Church Lane', 'Mill Road']
        };
        
        // Generate roads across UK
        for (let i = 0; i < 100; i++) {
            const roadClass = roadClasses[Math.floor(Math.random() * roadClasses.length)];
            const roadName = roadNames[roadClass][Math.floor(Math.random() * roadNames[roadClass].length)];
            
            // Generate random road segment
            const startLng = -6 + Math.random() * 8; // Roughly UK bounds
            const startLat = 50 + Math.random() * 10;
            const endLng = startLng + (Math.random() - 0.5) * 0.1;
            const endLat = startLat + (Math.random() - 0.5) * 0.1;
            
            features.push({
                type: 'Feature',
                properties: {
                    road_class: roadClass,
                    road_name: roadName,
                    surface: Math.random() > 0.1 ? 'paved' : 'unpaved',
                    access: 'public'
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [startLng, startLat],
                        [endLng, endLat]
                    ]
                }
            });
        }
        
        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    /**
     * Toggle layer visibility
     */
    toggleLayer(layerId) {
        try {
            if (layerId === 'roads') {
                // Special handling for roads layer (multiple sub-layers)
                const roadLayers = this.layers[layerId];
                if (Array.isArray(roadLayers)) {
                    const firstLayerVisibility = this.map.getLayoutProperty(roadLayers[0], 'visibility');
                    const newVisibility = firstLayerVisibility === 'visible' ? 'none' : 'visible';
                    
                    roadLayers.forEach(layerId => {
                        if (this.map.getLayer(layerId)) {
                            this.map.setLayoutProperty(layerId, 'visibility', newVisibility);
                        }
                    });
                    
                    if (newVisibility === 'visible') {
                        this.activeLayers.add(layerId);
                    } else {
                        this.activeLayers.delete(layerId);
                    }
                    
                    console.log(`✅ Roads layer ${newVisibility === 'visible' ? 'enabled' : 'disabled'}`);
                    return;
                }
            } else if (layerId === 'freehold') {
                // Special handling for Land Registry layer
                if (window.APP_STATE && window.APP_STATE.landRegistryManager) {
                    window.APP_STATE.landRegistryManager.toggleLayer();
                    return;
                }
            }
            
            // Standard layer handling
            if (!this.layers[layerId]) {
                console.warn(`⚠️ Layer ${layerId} not found`);
                return;
            }
            
            const layerName = this.layers[layerId];
            const isVisible = this.map.getLayoutProperty(layerName, 'visibility') === 'visible';
            
            if (isVisible) {
                this.map.setLayoutProperty(layerName, 'visibility', 'none');
                this.activeLayers.delete(layerId);
                console.log(`✅ Disabled layer: ${layerId}`);
            } else {
                this.map.setLayoutProperty(layerName, 'visibility', 'visible');
                this.activeLayers.add(layerId);
                console.log(`✅ Enabled layer: ${layerId}`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to toggle layer ${layerId}:`, error);
        }
    }

    /**
     * Toggle layer group visibility
     */
    toggleLayerGroup(groupId) {
        try {
            const layers = this.layerGroups[groupId];
            if (!layers) {
                console.warn(`⚠️ Layer group ${groupId} not found`);
                return;
            }
            
            const allVisible = layers.every(layerId => 
                this.activeLayers.has(layerId)
            );
            
            if (allVisible) {
                // Disable all layers in group
                layers.forEach(layerId => {
                    if (this.layers[layerId]) {
                        this.map.setLayoutProperty(this.layers[layerId], 'visibility', 'none');
                        this.activeLayers.delete(layerId);
                    }
                });
                console.log(`✅ Disabled layer group: ${groupId}`);
            } else {
                // Enable all layers in group
                layers.forEach(layerId => {
                    if (this.layers[layerId]) {
                        this.map.setLayoutProperty(this.layers[layerId], 'visibility', 'visible');
                        this.activeLayers.add(layerId);
                    }
                });
                console.log(`✅ Enabled layer group: ${groupId}`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to toggle layer group ${groupId}:`, error);
        }
    }

    /**
     * Get layer visibility state
     */
    isLayerVisible(layerId) {
        if (!this.layers[layerId]) return false;
        
        const layerName = this.layers[layerId];
        return this.map.getLayoutProperty(layerName, 'visibility') === 'visible';
    }

    /**
     * Get active layers
     */
    getActiveLayers() {
        return Array.from(this.activeLayers);
    }

    /**
     * Update layer data
     */
    updateLayerData(layerId, newData) {
        try {
            if (!this.sources[layerId]) {
                console.warn(`⚠️ Source for layer ${layerId} not found`);
                return;
            }
            
            const source = this.map.getSource(this.sources[layerId]);
            if (source && source.setData) {
                source.setData(newData);
                console.log(`✅ Updated layer data: ${layerId}`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to update layer data for ${layerId}:`, error);
        }
    }

    /**
     * Remove a layer
     */
    removeLayer(layerId) {
        try {
            if (this.layers[layerId]) {
                this.map.removeLayer(this.layers[layerId]);
                delete this.layers[layerId];
            }
            
            if (this.sources[layerId]) {
                this.map.removeSource(this.sources[layerId]);
                delete this.sources[layerId];
            }
            
            this.activeLayers.delete(layerId);
            console.log(`✅ Removed layer: ${layerId}`);
            
        } catch (error) {
            console.error(`❌ Failed to remove layer ${layerId}:`, error);
        }
    }

    /**
     * Clear all layers
     */
    clearAllLayers() {
        try {
            Object.keys(this.layers).forEach(layerId => {
                this.removeLayer(layerId);
            });
            
            this.activeLayers.clear();
            console.log('✅ Cleared all layers');
            
        } catch (error) {
            console.error('❌ Failed to clear all layers:', error);
        }
    }
}
