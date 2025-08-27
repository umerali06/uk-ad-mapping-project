/**
 * Data Processing WebWorker
 * Handles data processing tasks in background thread
 */

// Handle messages from main thread
self.onmessage = function(event) {
    const { taskId, data, options } = event.data;
    
    try {
        let result;
        
        switch (options.type || 'default') {
            case 'ad-plants':
                result = processADPlantsData(data, options);
                break;
            case 'boundaries':
                result = processBoundaryData(data, options);
                break;
            case 'filter':
                result = filterData(data, options);
                break;
            case 'transform':
                result = transformData(data, options);
                break;
            default:
                result = processGenericData(data, options);
        }
        
        // Send result back to main thread
        self.postMessage({
            taskId: taskId,
            result: result,
            success: true
        });
        
    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            taskId: taskId,
            error: error.message,
            success: false
        });
    }
};

/**
 * Process AD plants data
 */
function processADPlantsData(data, options) {
    const processed = data.map(plant => ({
        ...plant,
        processed: true,
        timestamp: Date.now(),
        // Add computed properties
        efficiency: calculateEfficiency(plant),
        capacity: parseFloat(plant.capacity) || 0,
        status: plant.status || 'Unknown'
    }));
    
    return {
        type: 'ad-plants',
        geojson: {
            type: 'FeatureCollection',
            features: processed
        },
        count: processed.length,
        metadata: {
            processedAt: new Date().toISOString(),
            totalCapacity: processed.reduce((sum, plant) => sum + plant.capacity, 0)
        }
    };
}

/**
 * Process boundary data
 */
function processBoundaryData(data, options) {
    const processed = data.map(boundary => ({
        ...boundary,
        processed: true,
        timestamp: Date.now(),
        // Add computed properties
        area: calculateArea(boundary.geometry),
        centroid: calculateCentroid(boundary.geometry)
    }));
    
    return {
        type: 'boundaries',
        geojson: {
            type: 'FeatureCollection',
            features: processed
        },
        count: processed.length,
        metadata: {
            processedAt: new Date().toISOString(),
            totalArea: processed.reduce((sum, boundary) => sum + boundary.area, 0)
        }
    };
}

/**
 * Filter data based on criteria
 */
function filterData(data, options) {
    const { filters } = options;
    let filtered = [...data];
    
    if (filters.status) {
        filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.minCapacity) {
        filtered = filtered.filter(item => 
            parseFloat(item.capacity) >= filters.minCapacity
        );
    }
    
    if (filters.maxCapacity) {
        filtered = filtered.filter(item => 
            parseFloat(item.capacity) <= filters.maxCapacity
        );
    }
    
    if (filters.region) {
        filtered = filtered.filter(item => 
            item.region === filters.region
        );
    }
    
    return {
        type: 'filtered',
        data: filtered,
        count: filtered.length,
        filters: filters,
        metadata: {
            processedAt: new Date().toISOString(),
            originalCount: data.length
        }
    };
}

/**
 * Transform data format
 */
function transformData(data, options) {
    const { format, fields } = options;
    
    let transformed;
    
    switch (format) {
        case 'csv':
            transformed = transformToCSV(data, fields);
            break;
        case 'json':
            transformed = transformToJSON(data, fields);
            break;
        case 'geojson':
            transformed = transformToGeoJSON(data, fields);
            break;
        default:
            transformed = data;
    }
    
    return {
        type: 'transformed',
        data: transformed,
        format: format,
        count: data.length,
        metadata: {
            processedAt: new Date().toISOString(),
            fields: fields || Object.keys(data[0] || [])
        }
    };
}

/**
 * Process generic data
 */
function processGenericData(data, options) {
    return {
        type: 'generic',
        data: data,
        count: data.length,
        processed: true,
        timestamp: Date.now(),
        metadata: {
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Calculate efficiency score
 */
function calculateEfficiency(plant) {
    // Simplified efficiency calculation
    const capacity = parseFloat(plant.capacity) || 0;
    const operational = plant.operational || false;
    
    if (!operational) return 0;
    if (capacity < 1000) return 0.6;
    if (capacity < 5000) return 0.8;
    return 0.9;
}

/**
 * Calculate area of geometry
 */
function calculateArea(geometry) {
    // Simplified area calculation
    if (geometry.type === 'Polygon') {
        return 1000; // Mock area
    }
    return 500; // Default area
}

/**
 * Calculate centroid of geometry
 */
function calculateCentroid(geometry) {
    // Simplified centroid calculation
    if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
        const coords = geometry.coordinates[0];
        const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLng / coords.length, sumLat / coords.length];
    }
    return [0, 0]; // Default centroid
}

/**
 * Transform data to CSV format
 */
function transformToCSV(data, fields) {
    if (!data || data.length === 0) return '';
    
    const headers = fields || Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(field => {
            const value = row[field];
            return `"${value || ''}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

/**
 * Transform data to JSON format
 */
function transformToJSON(data, fields) {
    if (!fields) return data;
    
    return data.map(item => {
        const transformed = {};
        fields.forEach(field => {
            if (item.hasOwnProperty(field)) {
                transformed[field] = item[field];
            }
        });
        return transformed;
    });
}

/**
 * Transform data to GeoJSON format
 */
function transformToGeoJSON(data, fields) {
    const features = data.map(item => ({
        type: 'Feature',
        geometry: item.geometry || {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: fields ? 
            fields.reduce((props, field) => {
                if (item.hasOwnProperty(field)) {
                    props[field] = item[field];
                }
                return props;
            }, {}) : 
            item.properties || item
    }));
    
    return {
        type: 'FeatureCollection',
        features: features
    };
}
