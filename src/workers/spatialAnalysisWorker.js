/**
 * WebWorker for Spatial Analysis - Handles geometric calculations and spatial queries
 * This improves UI responsiveness by offloading spatial analysis tasks
 */

// Worker message handler
self.onmessage = function(e) {
    const { type, data, id } = e.data;
    
    try {
        switch (type) {
            case 'BUFFER_ANALYSIS':
                const bufferResults = performBufferAnalysis(data);
                self.postMessage({
                    type: 'BUFFER_ANALYSIS_COMPLETE',
                    id: id,
                    results: bufferResults
                });
                break;
                
            case 'INTERSECTION_ANALYSIS':
                const intersectionResults = performIntersectionAnalysis(data);
                self.postMessage({
                    type: 'INTERSECTION_ANALYSIS_COMPLETE',
                    id: id,
                    results: intersectionResults
                });
                break;
                
            case 'PROXIMITY_ANALYSIS':
                const proximityResults = performProximityAnalysis(data);
                self.postMessage({
                    type: 'PROXIMITY_ANALYSIS_COMPLETE',
                    id: id,
                    results: proximityResults
                });
                break;
                
            case 'SPATIAL_JOIN':
                const joinResults = performSpatialJoin(data);
                self.postMessage({
                    type: 'SPATIAL_JOIN_COMPLETE',
                    id: id,
                    results: joinResults
                });
                break;
                
            case 'CLUSTER_ANALYSIS':
                const clusterResults = performClusterAnalysis(data);
                self.postMessage({
                    type: 'CLUSTER_ANALYSIS_COMPLETE',
                    id: id,
                    results: clusterResults
                });
                break;
                
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            id: id,
            error: error.message
        });
    }
};

/**
 * Perform buffer analysis around points, lines, or polygons
 */
function performBufferAnalysis(data) {
    const { features, bufferDistance, bufferUnits = 'meters' } = data;
    const results = [];
    
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const buffered = createBuffer(feature, bufferDistance, bufferUnits);
        
        if (buffered) {
            results.push({
                originalFeature: feature,
                bufferedFeature: buffered,
                bufferDistance: bufferDistance,
                bufferUnits: bufferUnits
            });
        }
        
        // Report progress
        if (i % 50 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / features.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Create a buffer around a feature
 */
function createBuffer(feature, distance, units) {
    try {
        const geometry = feature.geometry;
        
        switch (geometry.type) {
            case 'Point':
                return createPointBuffer(geometry.coordinates, distance, units);
                
            case 'LineString':
                return createLineBuffer(geometry.coordinates, distance, units);
                
            case 'Polygon':
                return createPolygonBuffer(geometry.coordinates, distance, units);
                
            default:
                console.warn('Unsupported geometry type for buffer:', geometry.type);
                return null;
        }
    } catch (error) {
        console.error('Error creating buffer:', error);
        return null;
    }
}

/**
 * Create buffer around a point
 */
function createPointBuffer(coordinates, distance, units) {
    const [lng, lat] = coordinates;
    const radiusInDegrees = convertDistanceToDegrees(distance, units, lat);
    
    // Create a simple circular buffer (approximation)
    const points = [];
    const segments = 32;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const deltaLng = radiusInDegrees * Math.cos(angle) / Math.cos(lat * Math.PI / 180);
        const deltaLat = radiusInDegrees * Math.sin(angle);
        
        points.push([lng + deltaLng, lat + deltaLat]);
    }
    
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [points]
        },
        properties: {
            bufferDistance: distance,
            bufferUnits: units,
            originalType: 'Point'
        }
    };
}

/**
 * Create buffer around a line
 */
function createLineBuffer(coordinates, distance, units) {
    const radiusInDegrees = convertDistanceToDegrees(distance, units, 0);
    const bufferPoints = [];
    
    // For each line segment, create perpendicular offset lines
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        
        // Calculate perpendicular vector
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            const perpX = -dy / length;
            const perpY = dx / length;
            
            // Create offset points
            const offset1 = [x1 + perpX * radiusInDegrees, y1 + perpY * radiusInDegrees];
            const offset2 = [x1 - perpX * radiusInDegrees, y1 - perpY * radiusInDegrees];
            
            bufferPoints.push(offset1, offset2);
        }
    }
    
    // Create a simple polygon from the buffer points
    if (bufferPoints.length >= 3) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [bufferPoints]
            },
            properties: {
                bufferDistance: distance,
                bufferUnits: units,
                originalType: 'LineString'
            }
        };
    }
    
    return null;
}

/**
 * Create buffer around a polygon
 */
function createPolygonBuffer(coordinates, distance, units) {
    const radiusInDegrees = convertDistanceToDegrees(distance, units, 0);
    const expandedCoordinates = [];
    
    // Expand each ring of the polygon
    for (const ring of coordinates) {
        const expandedRing = [];
        
        for (let i = 0; i < ring.length; i++) {
            const [x, y] = ring[i];
            const [prevX, prevY] = ring[(i - 1 + ring.length) % ring.length];
            const [nextX, nextY] = ring[(i + 1) % ring.length];
            
            // Calculate normal vector for this vertex
            const normal = calculateNormalVector(prevX, prevY, x, y, nextX, nextY);
            
            // Apply buffer distance
            const expandedX = x + normal[0] * radiusInDegrees;
            const expandedY = y + normal[1] * radiusInDegrees;
            
            expandedRing.push([expandedX, expandedY]);
        }
        
        expandedCoordinates.push(expandedRing);
    }
    
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: expandedCoordinates
        },
        properties: {
            bufferDistance: distance,
            bufferUnits: units,
            originalType: 'Polygon'
        }
    };
}

/**
 * Calculate normal vector for a vertex
 */
function calculateNormalVector(prevX, prevY, x, y, nextX, nextY) {
    // Calculate vectors to previous and next points
    const v1x = x - prevX;
    const v1y = y - prevY;
    const v2x = nextX - x;
    const v2y = nextY - y;
    
    // Normalize vectors
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
    
    if (len1 === 0 || len2 === 0) {
        return [0, 1]; // Default normal
    }
    
    const n1x = v1x / len1;
    const n1y = v1y / len1;
    const n2x = v2x / len2;
    const n2y = v2y / len2;
    
    // Average the normals
    const avgX = (n1x + n2x) / 2;
    const avgY = (n1y + n2y) / 2;
    
    // Normalize the average
    const avgLen = Math.sqrt(avgX * avgX + avgY * avgY);
    return avgLen > 0 ? [avgX / avgLen, avgY / avgLen] : [0, 1];
}

/**
 * Convert distance to degrees based on units and latitude
 */
function convertDistanceToDegrees(distance, units, latitude) {
    const earthRadius = 6371000; // Earth's radius in meters
    
    // Convert to meters
    let distanceInMeters = distance;
    switch (units.toLowerCase()) {
        case 'kilometers':
            distanceInMeters = distance * 1000;
            break;
        case 'miles':
            distanceInMeters = distance * 1609.34;
            break;
        case 'feet':
            distanceInMeters = distance * 0.3048;
            break;
        case 'meters':
        default:
            distanceInMeters = distance;
    }
    
    // Convert to degrees (approximate)
    const degreesPerMeter = 1 / (earthRadius * Math.PI / 180);
    return distanceInMeters * degreesPerMeter / Math.cos(latitude * Math.PI / 180);
}

/**
 * Perform intersection analysis between two sets of features
 */
function performIntersectionAnalysis(data) {
    const { features1, features2, operation = 'intersection' } = data;
    const results = [];
    
    for (let i = 0; i < features1.length; i++) {
        const feature1 = features1[i];
        const intersections = [];
        
        for (let j = 0; j < features2.length; j++) {
            const feature2 = features2[j];
            const intersection = calculateIntersection(feature1, feature2, operation);
            
            if (intersection) {
                intersections.push({
                    feature2: feature2,
                    intersection: intersection
                });
            }
        }
        
        if (intersections.length > 0) {
            results.push({
                feature1: feature1,
                intersections: intersections
            });
        }
        
        // Report progress
        if (i % 25 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / features1.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Calculate intersection between two features
 */
function calculateIntersection(feature1, feature2, operation) {
    try {
        const geom1 = feature1.geometry;
        const geom2 = feature2.geometry;
        
        // Simple intersection check for basic geometry types
        if (geom1.type === 'Point' && geom2.type === 'Polygon') {
            return pointInPolygon(geom1.coordinates, geom2.coordinates) ? feature1 : null;
        }
        
        if (geom1.type === 'Polygon' && geom2.type === 'Point') {
            return pointInPolygon(geom2.coordinates, geom1.coordinates) ? feature2 : null;
        }
        
        if (geom1.type === 'Polygon' && geom2.type === 'Polygon') {
            return polygonsIntersect(geom1.coordinates, geom2.coordinates);
        }
        
        // For other combinations, return null (would need more complex logic)
        return null;
        
    } catch (error) {
        console.error('Error calculating intersection:', error);
        return null;
    }
}

/**
 * Check if a point is inside a polygon
 */
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
}

/**
 * Check if two polygons intersect
 */
function polygonsIntersect(poly1, poly2) {
    // Check if any point from poly1 is inside poly2
    for (const ring of poly1) {
        for (const point of ring) {
            if (pointInPolygon(point, poly2[0])) {
                return true;
            }
        }
    }
    
    // Check if any point from poly2 is inside poly1
    for (const ring of poly2) {
        for (const point of ring) {
            if (pointInPolygon(point, poly1[0])) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Perform proximity analysis
 */
function performProximityAnalysis(data) {
    const { features, targetFeatures, maxDistance, distanceUnits = 'meters' } = data;
    const results = [];
    
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const nearbyFeatures = [];
        
        for (let j = 0; j < targetFeatures.length; j++) {
            const targetFeature = targetFeatures[j];
            const distance = calculateDistance(feature, targetFeature, distanceUnits);
            
            if (distance <= maxDistance) {
                nearbyFeatures.push({
                    feature: targetFeature,
                    distance: distance
                });
            }
        }
        
        if (nearbyFeatures.length > 0) {
            // Sort by distance
            nearbyFeatures.sort((a, b) => a.distance - b.distance);
            
            results.push({
                feature: feature,
                nearbyFeatures: nearbyFeatures,
                count: nearbyFeatures.length
            });
        }
        
        // Report progress
        if (i % 50 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / features.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Calculate distance between two features
 */
function calculateDistance(feature1, feature2, units) {
    try {
        const geom1 = feature1.geometry;
        const geom2 = feature2.geometry;
        
        if (geom1.type === 'Point' && geom2.type === 'Point') {
            return calculatePointDistance(geom1.coordinates, geom2.coordinates, units);
        }
        
        // For other geometry types, calculate centroid distance
        const centroid1 = calculateCentroid(geom1);
        const centroid2 = calculateCentroid(geom2);
        
        return calculatePointDistance(centroid1, centroid2, units);
        
    } catch (error) {
        console.error('Error calculating distance:', error);
        return Infinity;
    }
}

/**
 * Calculate distance between two points
 */
function calculatePointDistance(point1, point2, units) {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    // Haversine formula
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInMeters = R * c;
    
    // Convert to requested units
    switch (units.toLowerCase()) {
        case 'kilometers':
            return distanceInMeters / 1000;
        case 'miles':
            return distanceInMeters / 1609.34;
        case 'feet':
            return distanceInMeters / 0.3048;
        case 'meters':
        default:
            return distanceInMeters;
    }
}

/**
 * Calculate centroid of a geometry
 */
function calculateCentroid(geometry) {
    switch (geometry.type) {
        case 'Point':
            return geometry.coordinates;
            
        case 'LineString':
            return calculateLineCentroid(geometry.coordinates);
            
        case 'Polygon':
            return calculatePolygonCentroid(geometry.coordinates[0]);
            
        default:
            return [0, 0]; // Default centroid
    }
}

/**
 * Calculate centroid of a line
 */
function calculateLineCentroid(coordinates) {
    if (coordinates.length === 0) return [0, 0];
    if (coordinates.length === 1) return coordinates[0];
    
    let totalLength = 0;
    let weightedX = 0;
    let weightedY = 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        
        const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        totalLength += segmentLength;
        
        weightedX += (x1 + x2) / 2 * segmentLength;
        weightedY += (y1 + y2) / 2 * segmentLength;
    }
    
    return totalLength > 0 ? [weightedX / totalLength, weightedY / totalLength] : coordinates[0];
}

/**
 * Calculate centroid of a polygon
 */
function calculatePolygonCentroid(coordinates) {
    if (coordinates.length === 0) return [0, 0];
    if (coordinates.length === 1) return coordinates[0];
    
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        
        const crossProduct = x1 * y2 - x2 * y1;
        area += crossProduct;
        
        centroidX += (x1 + x2) * crossProduct;
        centroidY += (y1 + y2) * crossProduct;
    }
    
    area = area / 2;
    
    if (Math.abs(area) < 1e-10) {
        // Degenerate polygon, return first point
        return coordinates[0];
    }
    
    return [centroidX / (6 * area), centroidY / (6 * area)];
}

/**
 * Perform spatial join between two feature collections
 */
function performSpatialJoin(data) {
    const { leftFeatures, rightFeatures, joinType = 'inner', spatialPredicate = 'intersects' } = data;
    const results = [];
    
    for (let i = 0; i < leftFeatures.length; i++) {
        const leftFeature = leftFeatures[i];
        const joinedFeatures = [];
        
        for (let j = 0; j < rightFeatures.length; j++) {
            const rightFeature = rightFeatures[j];
            
            let shouldJoin = false;
            switch (spatialPredicate) {
                case 'intersects':
                    shouldJoin = featuresIntersect(leftFeature, rightFeature);
                    break;
                case 'within':
                    shouldJoin = featureWithin(leftFeature, rightFeature);
                    break;
                case 'contains':
                    shouldJoin = featureWithin(rightFeature, leftFeature);
                    break;
                case 'near':
                    const distance = calculateDistance(leftFeature, rightFeature, 'meters');
                    shouldJoin = distance <= (data.nearDistance || 1000);
                    break;
            }
            
            if (shouldJoin) {
                joinedFeatures.push(rightFeature);
            }
        }
        
        if (joinedFeatures.length > 0 || joinType === 'left') {
            results.push({
                leftFeature: leftFeature,
                joinedFeatures: joinedFeatures,
                joinCount: joinedFeatures.length
            });
        }
        
        // Report progress
        if (i % 25 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / leftFeatures.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Check if two features intersect
 */
function featuresIntersect(feature1, feature2) {
    return calculateIntersection(feature1, feature2, 'intersection') !== null;
}

/**
 * Check if one feature is within another
 */
function featureWithin(innerFeature, outerFeature) {
    if (innerFeature.geometry.type === 'Point' && outerFeature.geometry.type === 'Polygon') {
        return pointInPolygon(innerFeature.geometry.coordinates, outerFeature.geometry.coordinates[0]);
    }
    return false; // Simplified implementation
}

/**
 * Perform cluster analysis on point features
 */
function performClusterAnalysis(data) {
    const { features, algorithm = 'kmeans', parameters = {} } = data;
    const results = [];
    
    switch (algorithm.toLowerCase()) {
        case 'kmeans':
            results.push(...performKMeansClustering(features, parameters));
            break;
            
        case 'dbscan':
            results.push(...performDBSCANClustering(features, parameters));
            break;
            
        case 'hierarchical':
            results.push(...performHierarchicalClustering(features, parameters));
            break;
            
        default:
            throw new Error(`Unknown clustering algorithm: ${algorithm}`);
    }
    
    return results;
}

/**
 * Perform K-means clustering
 */
function performKMeansClustering(features, parameters) {
    const k = parameters.k || 5;
    const maxIterations = parameters.maxIterations || 100;
    
    // Extract point coordinates
    const points = features
        .filter(f => f.geometry.type === 'Point')
        .map(f => f.geometry.coordinates);
    
    if (points.length === 0) return [];
    
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * points.length);
        centroids.push([...points[randomIndex]]);
    }
    
    let clusters = [];
    let iterations = 0;
    
    while (iterations < maxIterations) {
        // Assign points to nearest centroid
        clusters = Array.from({ length: k }, () => []);
        
        for (const point of points) {
            let minDistance = Infinity;
            let nearestCentroid = 0;
            
            for (let i = 0; i < k; i++) {
                const distance = calculatePointDistance(point, centroids[i], 'meters');
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCentroid = i;
                }
            }
            
            clusters[nearestCentroid].push(point);
        }
        
        // Update centroids
        let centroidsChanged = false;
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                const newCentroid = calculateCentroid({
                    type: 'Point',
                    coordinates: clusters[i]
                });
                
                const distance = calculatePointDistance(centroids[i], newCentroid, 'meters');
                if (distance > 1) { // 1 meter threshold
                    centroidsChanged = true;
                    centroids[i] = newCentroid;
                }
            }
        }
        
        if (!centroidsChanged) break;
        iterations++;
    }
    
    // Convert clusters to results
    return clusters.map((cluster, index) => ({
        clusterId: index,
        centroid: centroids[index],
        points: cluster,
        count: cluster.length,
        algorithm: 'kmeans'
    }));
}

/**
 * Perform DBSCAN clustering
 */
function performDBSCANClustering(features, parameters) {
    const eps = parameters.eps || 1000; // meters
    const minPts = parameters.minPts || 3;
    
    const points = features
        .filter(f => f.geometry.type === 'Point')
        .map(f => f.geometry.coordinates);
    
    if (points.length === 0) return [];
    
    const visited = new Set();
    const clusters = [];
    let clusterId = 0;
    
    for (let i = 0; i < points.length; i++) {
        if (visited.has(i)) continue;
        
        visited.add(i);
        const neighbors = findNeighbors(points, i, eps);
        
        if (neighbors.length < minPts) {
            // Noise point
            continue;
        }
        
        // Start new cluster
        const cluster = [points[i]];
        clusters.push({
            clusterId: clusterId++,
            centroid: points[i],
            points: cluster,
            count: 1,
            algorithm: 'dbscan'
        });
        
        // Expand cluster
        for (let j = 0; j < neighbors.length; j++) {
            const neighborIndex = neighbors[j];
            if (!visited.has(neighborIndex)) {
                visited.add(neighborIndex);
                cluster.push(points[neighborIndex]);
                clusters[clusters.length - 1].count++;
                
                const neighborNeighbors = findNeighbors(points, neighborIndex, eps);
                if (neighborNeighbors.length >= minPts) {
                    neighbors.push(...neighborNeighbors.filter(n => !visited.has(n)));
                }
            }
        }
        
        // Update cluster centroid
        if (cluster.length > 1) {
            clusters[clusters.length - 1].centroid = calculateCentroid({
                type: 'Point',
                coordinates: cluster
            });
            clusters[clusters.length - 1].points = cluster;
        }
    }
    
    return clusters;
}

/**
 * Find neighbors within eps distance
 */
function findNeighbors(points, pointIndex, eps) {
    const neighbors = [];
    const point = points[pointIndex];
    
    for (let i = 0; i < points.length; i++) {
        if (i !== pointIndex) {
            const distance = calculatePointDistance(point, points[i], 'meters');
            if (distance <= eps) {
                neighbors.push(i);
            }
        }
    }
    
    return neighbors;
}

/**
 * Perform hierarchical clustering
 */
function performHierarchicalClustering(features, parameters) {
    const maxDistance = parameters.maxDistance || 5000; // meters
    const points = features
        .filter(f => f.geometry.type === 'Point')
        .map(f => f.geometry.coordinates);
    
    if (points.length === 0) return [];
    
    // Single-linkage hierarchical clustering
    const clusters = points.map((point, index) => ({
        id: index,
        points: [point],
        centroid: point
    }));
    
    while (clusters.length > 1) {
        let minDistance = Infinity;
        let cluster1Index = -1;
        let cluster2Index = -1;
        
        // Find closest pair of clusters
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const distance = calculatePointDistance(
                    clusters[i].centroid,
                    clusters[j].centroid,
                    'meters'
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    cluster1Index = i;
                    cluster2Index = j;
                }
            }
        }
        
        // Stop if minimum distance exceeds threshold
        if (minDistance > maxDistance) break;
        
        // Merge clusters
        const cluster1 = clusters[cluster1Index];
        const cluster2 = clusters[cluster2Index];
        
        const mergedCluster = {
            id: cluster1.id,
            points: [...cluster1.points, ...cluster2.points],
            centroid: calculateCentroid({
                type: 'Point',
                coordinates: [...cluster1.points, ...cluster2.points]
            })
        };
        
        // Remove old clusters and add merged one
        clusters.splice(Math.max(cluster1Index, cluster2Index), 1);
        clusters.splice(Math.min(cluster1Index, cluster2Index), 1);
        clusters.push(mergedCluster);
    }
    
    // Convert to results format
    return clusters.map((cluster, index) => ({
        clusterId: index,
        centroid: cluster.centroid,
        points: cluster.points,
        count: cluster.points.length,
        algorithm: 'hierarchical'
    }));
}

// Export for use in main thread
self.exports = {
    performBufferAnalysis,
    performIntersectionAnalysis,
    performProximityAnalysis,
    performSpatialJoin,
    performClusterAnalysis
};
