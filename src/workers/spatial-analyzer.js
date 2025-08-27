/**
 * Spatial Analysis WebWorker
 * Handles spatial analysis tasks in background thread
 */

// Handle messages from main thread
self.onmessage = function(event) {
    const { taskId, data, options } = event.data;
    
    try {
        let result;
        
        switch (options.type || 'default') {
            case 'buffer':
                result = createBuffer(data, options);
                break;
            case 'intersection':
                result = calculateIntersection(data, options);
                break;
            case 'distance':
                result = calculateDistance(data, options);
                break;
            case 'area':
                result = calculateArea(data, options);
                break;
            case 'centroid':
                result = calculateCentroid(data, options);
                break;
            default:
                result = performGenericSpatialAnalysis(data, options);
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
 * Create buffer around geometry
 */
function createBuffer(geometry, options) {
    const { distance = 1000, units = 'meters' } = options;
    
    // Simplified buffer creation
    // In a real implementation, this would use a proper spatial library
    const buffered = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [geometry.coordinates[0] - 0.01, geometry.coordinates[1] - 0.01],
                [geometry.coordinates[0] + 0.01, geometry.coordinates[1] - 0.01],
                [geometry.coordinates[0] + 0.01, geometry.coordinates[1] + 0.01],
                [geometry.coordinates[0] - 0.01, geometry.coordinates[1] + 0.01],
                [geometry.coordinates[0] - 0.01, geometry.coordinates[1] - 0.01]
            ]]
        },
        properties: {
            bufferDistance: distance,
            units: units,
            originalGeometry: geometry
        }
    };
    
    return {
        type: 'buffer',
        result: buffered,
        metadata: {
            distance: distance,
            units: units,
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Calculate intersection between geometries
 */
function calculateIntersection(geometries, options) {
    const { geometry1, geometry2 } = geometries;
    
    // Simplified intersection calculation
    // In a real implementation, this would use a proper spatial library
    const intersection = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [0, 0],
                [0.01, 0],
                [0.01, 0.01],
                [0, 0.01],
                [0, 0]
            ]]
        },
        properties: {
            intersectionType: 'polygon',
            sourceGeometries: [geometry1, geometry2]
        }
    };
    
    return {
        type: 'intersection',
        result: intersection,
        metadata: {
            processedAt: new Date().toISOString(),
            geometryCount: 2
        }
    };
}

/**
 * Calculate distance between points
 */
function calculateDistance(points, options) {
    const { point1, point2, units = 'meters' } = points;
    
    // Haversine formula for distance calculation
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1[1] * Math.PI / 180;
    const lat2 = point2[1] * Math.PI / 180;
    const deltaLat = (point2[1] - point1[1]) * Math.PI / 180;
    const deltaLng = (point2[0] - point1[0]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
               Math.cos(lat1) * Math.cos(lat2) *
               Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = R * c;
    
    return {
        type: 'distance',
        result: {
            distance: distance,
            units: units,
            point1: point1,
            point2: point2
        },
        metadata: {
            processedAt: new Date().toISOString(),
            calculationMethod: 'haversine'
        }
    };
}

/**
 * Calculate area of geometry
 */
function calculateArea(geometry, options) {
    const { units = 'square_meters' } = options;
    
    // Simplified area calculation
    // In a real implementation, this would use a proper spatial library
    let area = 0;
    
    if (geometry.type === 'Polygon') {
        // Shoelace formula for polygon area
        const coords = geometry.coordinates[0];
        let sum = 0;
        
        for (let i = 0; i < coords.length - 1; i++) {
            sum += coords[i][0] * coords[i + 1][1];
            sum -= coords[i + 1][0] * coords[i][1];
        }
        
        area = Math.abs(sum) / 2;
        // Convert to approximate square meters (very rough approximation)
        area = area * 111000 * 111000;
    } else if (geometry.type === 'Point') {
        area = 0; // Points have no area
    } else if (geometry.type === 'LineString') {
        area = 0; // Lines have no area
    }
    
    return {
        type: 'area',
        result: {
            area: area,
            units: units,
            geometryType: geometry.type
        },
        metadata: {
            processedAt: new Date().toISOString(),
            calculationMethod: 'shoelace'
        }
    };
}

/**
 * Calculate centroid of geometry
 */
function calculateCentroid(geometry, options) {
    let centroid = [0, 0];
    
    if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0];
        let sumLng = 0;
        let sumLat = 0;
        
        for (let i = 0; i < coords.length - 1; i++) {
            sumLng += coords[i][0];
            sumLat += coords[i][1];
        }
        
        centroid = [sumLng / (coords.length - 1), sumLat / (coords.length - 1)];
    } else if (geometry.type === 'Point') {
        centroid = geometry.coordinates;
    } else if (geometry.type === 'LineString') {
        const coords = geometry.coordinates;
        const midIndex = Math.floor(coords.length / 2);
        centroid = coords[midIndex];
    }
    
    return {
        type: 'centroid',
        result: {
            centroid: centroid,
            geometryType: geometry.type
        },
        metadata: {
            processedAt: new Date().toISOString(),
            calculationMethod: 'geometric'
        }
    };
}

/**
 * Perform generic spatial analysis
 */
function performGenericSpatialAnalysis(data, options) {
    return {
        type: 'generic-spatial',
        result: {
            data: data,
            analysisType: options.analysisType || 'unknown'
        },
        metadata: {
            processedAt: new Date().toISOString(),
            dataType: typeof data
        }
    };
}
