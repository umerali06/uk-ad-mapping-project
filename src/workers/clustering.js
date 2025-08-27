/**
 * Clustering WebWorker
 * Handles point clustering tasks in background thread
 */

// Handle messages from main thread
self.onmessage = function(event) {
    const { taskId, data, options } = event.data;
    
    try {
        let result;
        
        switch (options.type || 'default') {
            case 'kmeans':
                result = performKMeansClustering(data, options);
                break;
            case 'grid':
                result = performGridClustering(data, options);
                break;
            case 'hierarchical':
                result = performHierarchicalClustering(data, options);
                break;
            case 'density':
                result = performDensityClustering(data, options);
                break;
            default:
                result = performGenericClustering(data, options);
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
 * Perform K-means clustering
 */
function performKMeansClustering(points, options) {
    const { k = 5, maxIterations = 100, tolerance = 0.001 } = options;
    
    if (points.length < k) {
        return {
            type: 'kmeans',
            result: {
                clusters: points.map(point => [point]),
                centroids: points,
                labels: points.map((_, i) => i)
            },
            metadata: {
                k: points.length,
                iterations: 0,
                tolerance: tolerance,
                processedAt: new Date().toISOString()
            }
        };
    }
    
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * points.length);
        centroids.push([...points[randomIndex].coordinates]);
    }
    
    let labels = new Array(points.length);
    let iterations = 0;
    let converged = false;
    
    while (iterations < maxIterations && !converged) {
        // Assign points to nearest centroid
        for (let i = 0; i < points.length; i++) {
            let minDistance = Infinity;
            let bestCluster = 0;
            
            for (let j = 0; j < k; j++) {
                const distance = calculateDistance(points[i].coordinates, centroids[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestCluster = j;
                }
            }
            
            labels[i] = bestCluster;
        }
        
        // Update centroids
        const newCentroids = new Array(k).fill(0).map(() => [0, 0]);
        const clusterSizes = new Array(k).fill(0);
        
        for (let i = 0; i < points.length; i++) {
            const cluster = labels[i];
            newCentroids[cluster][0] += points[i].coordinates[0];
            newCentroids[cluster][1] += points[i].coordinates[1];
            clusterSizes[cluster]++;
        }
        
        // Check convergence
        converged = true;
        for (let j = 0; j < k; j++) {
            if (clusterSizes[j] > 0) {
                newCentroids[j][0] /= clusterSizes[j];
                newCentroids[j][1] /= clusterSizes[j];
                
                const distance = calculateDistance(centroids[j], newCentroids[j]);
                if (distance > tolerance) {
                    converged = false;
                }
            }
        }
        
        centroids = newCentroids;
        iterations++;
    }
    
    // Group points by cluster
    const clusters = new Array(k).fill(0).map(() => []);
    for (let i = 0; i < points.length; i++) {
        clusters[labels[i]].push(points[i]);
    }
    
    return {
        type: 'kmeans',
        result: {
            clusters: clusters,
            centroids: centroids,
            labels: labels
        },
        metadata: {
            k: k,
            iterations: iterations,
            tolerance: tolerance,
            converged: converged,
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Perform grid-based clustering
 */
function performGridClustering(points, options) {
    const { cellSize = 0.01 } = options;
    
    const grid = new Map();
    
    // Assign points to grid cells
    for (const point of points) {
        const cellX = Math.floor(point.coordinates[0] / cellSize);
        const cellY = Math.floor(point.coordinates[1] / cellSize);
        const cellKey = `${cellX},${cellY}`;
        
        if (!grid.has(cellKey)) {
            grid.set(cellKey, []);
        }
        grid.get(cellKey).push(point);
    }
    
    // Convert grid to clusters
    const clusters = [];
    const centroids = [];
    
    for (const [cellKey, cellPoints] of grid) {
        if (cellPoints.length > 0) {
            clusters.push(cellPoints);
            
            // Calculate centroid for this cell
            const centroid = [
                cellPoints.reduce((sum, p) => sum + p.coordinates[0], 0) / cellPoints.length,
                cellPoints.reduce((sum, p) => sum + p.coordinates[1], 0) / cellPoints.length
            ];
            centroids.push(centroid);
        }
    }
    
    return {
        type: 'grid',
        result: {
            clusters: clusters,
            centroids: centroids,
            gridSize: cellSize
        },
        metadata: {
            cellSize: cellSize,
            totalCells: grid.size,
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Perform hierarchical clustering
 */
function performHierarchicalClustering(points, options) {
    const { linkage = 'single', maxDistance = 0.1 } = options;
    
    if (points.length <= 1) {
        return {
            type: 'hierarchical',
            result: {
                clusters: points.length === 1 ? [points] : [],
                dendrogram: []
            },
            metadata: {
                linkage: linkage,
                maxDistance: maxDistance,
                processedAt: new Date().toISOString()
            }
        };
    }
    
    // Initialize: each point is its own cluster
    let clusters = points.map(point => [point]);
    let distances = [];
    
    // Calculate initial distances between all pairs
    for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
            const distance = calculateClusterDistance(clusters[i], clusters[j], linkage);
            distances.push({ i, j, distance });
        }
    }
    
    // Sort distances
    distances.sort((a, b) => a.distance - b.distance);
    
    // Merge clusters
    const dendrogram = [];
    while (clusters.length > 1 && distances.length > 0) {
        const { i, j, distance } = distances.shift();
        
        if (distance > maxDistance) {
            break;
        }
        
        // Merge clusters i and j
        const mergedCluster = [...clusters[i], ...clusters[j]];
        clusters.splice(Math.max(i, j), 1);
        clusters.splice(Math.min(i, j), 1);
        clusters.push(mergedCluster);
        
        dendrogram.push({
            step: dendrogram.length + 1,
            mergedClusters: [i, j],
            distance: distance,
            newClusterIndex: clusters.length - 1
        });
        
        // Recalculate distances for the new cluster
        distances = distances.filter(d => d.i !== i && d.i !== j && d.j !== i && d.j !== j);
        
        for (let k = 0; k < clusters.length - 1; k++) {
            const distance = calculateClusterDistance(clusters[k], mergedCluster, linkage);
            distances.push({ i: k, j: clusters.length - 1, distance });
        }
        
        distances.sort((a, b) => a.distance - b.distance);
    }
    
    return {
        type: 'hierarchical',
        result: {
            clusters: clusters,
            dendrogram: dendrogram
        },
        metadata: {
            linkage: linkage,
            maxDistance: maxDistance,
            finalClusters: clusters.length,
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Perform density-based clustering
 */
function performDensityClustering(points, options) {
    const { eps = 0.01, minPts = 3 } = options;
    
    const visited = new Set();
    const clusters = [];
    const noise = [];
    
    // Find neighbors for each point
    const neighbors = points.map((point, index) => {
        const pointNeighbors = [];
        for (let i = 0; i < points.length; i++) {
            if (i !== index) {
                const distance = calculateDistance(point.coordinates, points[i].coordinates);
                if (distance <= eps) {
                    pointNeighbors.push(i);
                }
            }
        }
        return pointNeighbors;
    });
    
    // Expand clusters
    for (let i = 0; i < points.length; i++) {
        if (visited.has(i)) continue;
        
        visited.add(i);
        
        if (neighbors[i].length >= minPts) {
            // Start new cluster
            const cluster = [points[i]];
            const seedSet = [...neighbors[i]];
            
            while (seedSet.length > 0) {
                const q = seedSet.shift();
                if (!visited.has(q)) {
                    visited.add(q);
                    cluster.push(points[q]);
                    
                    if (neighbors[q].length >= minPts) {
                        seedSet.push(...neighbors[q]);
                    }
                }
            }
            
            clusters.push(cluster);
        } else {
            noise.push(points[i]);
        }
    }
    
    return {
        type: 'density',
        result: {
            clusters: clusters,
            noise: noise
        },
        metadata: {
            eps: eps,
            minPts: minPts,
            clustersFound: clusters.length,
            noisePoints: noise.length,
            processedAt: new Date().toISOString()
        }
    };
}

/**
 * Perform generic clustering
 */
function performGenericClustering(points, options) {
    return {
        type: 'generic',
        result: {
            clusters: [points], // Single cluster with all points
            centroids: [calculateCentroid(points)]
        },
        metadata: {
            processedAt: new Date().toISOString(),
            clusteringMethod: 'generic'
        }
    };
}

/**
 * Calculate distance between two points
 */
function calculateDistance(point1, point2) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two clusters
 */
function calculateClusterDistance(cluster1, cluster2, linkage) {
    if (linkage === 'single') {
        // Single linkage: minimum distance between any two points
        let minDistance = Infinity;
        for (const point1 of cluster1) {
            for (const point2 of cluster2) {
                const distance = calculateDistance(point1.coordinates, point2.coordinates);
                minDistance = Math.min(minDistance, distance);
            }
        }
        return minDistance;
    } else if (linkage === 'complete') {
        // Complete linkage: maximum distance between any two points
        let maxDistance = 0;
        for (const point1 of cluster1) {
            for (const point2 of cluster2) {
                const distance = calculateDistance(point1.coordinates, point2.coordinates);
                maxDistance = Math.max(maxDistance, distance);
            }
        }
        return maxDistance;
    } else {
        // Average linkage: average distance between all pairs
        let totalDistance = 0;
        let pairCount = 0;
        for (const point1 of cluster1) {
            for (const point2 of cluster2) {
                totalDistance += calculateDistance(point1.coordinates, point2.coordinates);
                pairCount++;
            }
        }
        return totalDistance / pairCount;
    }
}

/**
 * Calculate centroid of a set of points
 */
function calculateCentroid(points) {
    if (points.length === 0) return [0, 0];
    
    const sumLng = points.reduce((sum, point) => sum + point.coordinates[0], 0);
    const sumLat = points.reduce((sum, point) => sum + point.coordinates[1], 0);
    
    return [sumLng / points.length, sumLat / points.length];
}
