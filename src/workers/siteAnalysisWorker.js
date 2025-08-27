/**
 * WebWorker for Site Analysis - Handles heavy computations in background
 * This improves UI responsiveness by offloading intensive calculations
 * 
 * Note: This worker uses custom geometric calculations instead of external libraries
 * to maintain compatibility with module workers and avoid importScripts issues.
 */

// Worker message handler
self.onmessage = function(e) {
    const { type, data, id } = e.data;
    
    try {
        switch (type) {
            case 'ANALYZE_SITES':
                const results = analyzeSites(data);
                self.postMessage({
                    type: 'ANALYSIS_COMPLETE',
                    id: id,
                    results: results
                });
                break;
                
            case 'CALCULATE_DISTANCES':
                const distances = calculateDistances(data);
                self.postMessage({
                    type: 'DISTANCES_COMPLETE',
                    id: id,
                    results: distances
                });
                break;
                
            case 'SCORE_SITES':
                const scoredSites = scoreSites(data);
                self.postMessage({
                    type: 'SCORING_COMPLETE',
                    id: id,
                    results: scoredSites
                });
                break;
                
            case 'APPLY_FILTERS':
                const filteredSites = applyFilters(data);
                self.postMessage({
                    type: 'FILTERING_COMPLETE',
                    id: id,
                    results: filteredSites
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
 * Analyze sites using advanced algorithms
 */
function analyzeSites(data) {
    const { sites, constraints, criteria } = data;
    const results = [];
    
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const analysis = performSiteAnalysis(site, constraints, criteria);
        results.push({
            ...site,
            analysis: analysis
        });
        
        // Report progress every 100 sites
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / sites.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Perform detailed analysis for a single site
 */
function performSiteAnalysis(site, constraints, criteria) {
    const props = site.properties;
    
    // Environmental analysis
    const environmentalScore = calculateEnvironmentalScore(props, constraints);
    
    // Infrastructure analysis
    const infrastructureScore = calculateInfrastructureScore(props, constraints);
    
    // Economic analysis
    const economicScore = calculateEconomicScore(props, constraints);
    
    // Social analysis
    const socialScore = calculateSocialScore(props, constraints);
    
    // Calculate weighted total score
    const totalScore = (
        environmentalScore * criteria.environmental.weight +
        infrastructureScore * criteria.infrastructure.weight +
        economicScore * criteria.economic.weight +
        socialScore * criteria.social.weight
    );
    
    return {
        environmental: environmentalScore,
        infrastructure: infrastructureScore,
        economic: economicScore,
        social: socialScore,
        total: totalScore
    };
}

/**
 * Calculate environmental score
 */
function calculateEnvironmentalScore(props, constraints) {
    let score = 0;
    
    // Soil quality (1-10 scale)
    const soilQuality = props.soilQuality || 5;
    score += (soilQuality / 10) * 0.4;
    
    // Water availability (1-10 scale)
    const waterAvailability = props.waterAvailability || 5;
    score += (waterAvailability / 10) * 0.3;
    
    // Biodiversity (1-10 scale)
    const biodiversity = props.biodiversity || 5;
    score += (biodiversity / 10) * 0.2;
    
    // Flood risk (inverted - lower is better)
    const floodRisk = props.floodRisk || 5;
    score += ((10 - floodRisk) / 10) * 0.1;
    
    return score;
}

/**
 * Calculate infrastructure score
 */
function calculateInfrastructureScore(props, constraints) {
    let score = 0;
    
    // Road access
    const roadDistance = props.roadDistance || 2000;
    if (roadDistance <= 500) score += 1.0;
    else if (roadDistance <= 1000) score += 0.9;
    else if (roadDistance <= 2000) score += 0.7;
    else if (roadDistance <= 3000) score += 0.5;
    else score += 0.3;
    
    // Grid connection
    const gridDistance = props.gridDistance || 10000;
    if (gridDistance <= 5000) score += 1.0;
    else if (gridDistance <= 10000) score += 0.8;
    else if (gridDistance <= 15000) score += 0.6;
    else score += 0.4;
    
    // Gas connection
    const gasDistance = props.gasDistance || 5000;
    if (gasDistance <= 2000) score += 1.0;
    else if (gasDistance <= 5000) score += 0.8;
    else if (gasDistance <= 10000) score += 0.6;
    else score += 0.4;
    
    // Water supply
    const waterAvailability = props.waterAvailability || 5;
    score += (waterAvailability / 10);
    
    // Normalize to 0-1 range
    return score / 4;
}

/**
 * Calculate economic score
 */
function calculateEconomicScore(props, constraints) {
    let score = 0;
    
    // Land cost (inverted - lower cost = higher score)
    const landCost = props.landCost || 20000;
    if (landCost <= 10000) score += 1.0;
    else if (landCost <= 20000) score += 0.8;
    else if (landCost <= 30000) score += 0.6;
    else if (landCost <= 40000) score += 0.4;
    else score += 0.2;
    
    // Development cost (inverted)
    const developmentCost = props.developmentCost || 100000;
    if (developmentCost <= 50000) score += 1.0;
    else if (developmentCost <= 100000) score += 0.8;
    else if (developmentCost <= 150000) score += 0.6;
    else if (developmentCost <= 200000) score += 0.4;
    else score += 0.2;
    
    // Operational cost (simplified)
    let operationalScore = 0.7; // Base score
    if (props.gridDistance > 10000) operationalScore -= 0.2;
    if (props.gasDistance > 5000) operationalScore -= 0.1;
    if (props.roadDistance > 2000) operationalScore -= 0.1;
    score += Math.max(0.1, operationalScore);
    
    // Revenue potential
    let revenueScore = 0.6; // Base score
    if (props.area > 20) revenueScore += 0.2;
    if (props.waterAvailability > 7) revenueScore += 0.1;
    if (props.biodiversity > 7) revenueScore += 0.1;
    score += Math.min(1.0, revenueScore);
    
    // Normalize to 0-1 range
    return score / 4;
}

/**
 * Calculate social score
 */
function calculateSocialScore(props, constraints) {
    let score = 0;
    
    // Community acceptance
    let communityScore = 0.6; // Base score
    if (props.residentialDistance > 2000) communityScore += 0.2;
    if (props.protectedAreaDistance > 3000) communityScore += 0.1;
    if (props.conservationAreaDistance > 4000) communityScore += 0.1;
    score += Math.min(1.0, communityScore);
    
    // Job creation
    const area = props.area || 10;
    if (area > 30) score += 1.0;
    else if (area > 20) score += 0.8;
    else if (area > 10) score += 0.6;
    else if (area > 5) score += 0.4;
    else score += 0.2;
    
    // Local benefits
    let benefitsScore = 0.6; // Base score
    if (area > 15) benefitsScore += 0.2;
    if (props.waterAvailability > 6) benefitsScore += 0.1;
    if (props.biodiversity > 6) benefitsScore += 0.1;
    score += Math.min(1.0, benefitsScore);
    
    // Normalize to 0-1 range
    return score / 3;
}

/**
 * Calculate distances between sites and infrastructure
 */
function calculateDistances(data) {
    const { sites, infrastructure } = data;
    const results = [];
    
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const distances = {};
        
        // Calculate distances to various infrastructure points
        if (infrastructure.roads) {
            distances.roadDistance = calculateNearestDistance(site.coordinates, infrastructure.roads);
        }
        
        if (infrastructure.grid) {
            distances.gridDistance = calculateNearestDistance(site.coordinates, infrastructure.grid);
        }
        
        if (infrastructure.gas) {
            distances.gasDistance = calculateNearestDistance(site.coordinates, infrastructure.gas);
        }
        
        results.push({
            siteId: site.id,
            distances: distances
        });
        
        // Report progress
        if (i % 50 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / sites.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Calculate nearest distance to a set of points
 */
function calculateNearestDistance(siteCoords, points) {
    let minDistance = Infinity;
    
    for (const point of points) {
        const distance = calculateHaversineDistance(siteCoords, point.coordinates);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    
    return minDistance;
}

/**
 * Calculate Haversine distance between two coordinates
 */
function calculateHaversineDistance(coord1, coord2) {
    const R = 6371000; // Earth's radius in meters
    const lat1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    const deltaLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const deltaLng = (coord2[0] - coord1[0]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

/**
 * Score sites based on criteria
 */
function scoreSites(data) {
    const { sites, criteria } = data;
    const results = [];
    
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const scores = calculateSiteScores(site, criteria);
        
        results.push({
            ...site,
            scores: scores,
            score: scores.total
        });
        
        // Report progress
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / sites.length) * 100
            });
        }
    }
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Add ranking
    results.forEach((site, index) => {
        site.rank = index + 1;
    });
    
    return results;
}

/**
 * Calculate scores for a single site
 */
function calculateSiteScores(site, criteria) {
    const props = site.properties;
    
    // Environmental score
    const environmentalScore = calculateEnvironmentalScore(props, {});
    
    // Infrastructure score
    const infrastructureScore = calculateInfrastructureScore(props, {});
    
    // Economic score
    const economicScore = calculateEconomicScore(props, {});
    
    // Social score
    const socialScore = calculateSocialScore(props, {});
    
    // Calculate weighted total
    const totalScore = (
        environmentalScore * criteria.environmental.weight +
        infrastructureScore * criteria.infrastructure.weight +
        economicScore * criteria.economic.weight +
        socialScore * criteria.social.weight
    );
    
    return {
        environmental: environmentalScore,
        infrastructure: infrastructureScore,
        economic: economicScore,
        social: socialScore,
        total: totalScore
    };
}

/**
 * Apply filters to sites
 */
function applyFilters(data) {
    const { sites, filters } = data;
    const results = [];
    
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const props = site.properties;
        
        // Check if site passes all filters
        let passes = true;
        
        // Area filtering
        if (filters.minArea && props.area < filters.minArea) passes = false;
        if (filters.maxArea && props.area > filters.maxArea) passes = false;
        
        // Distance filtering
        if (filters.minDistanceFromRoad && props.roadDistance < filters.minDistanceFromRoad) passes = false;
        if (filters.maxDistanceFromRoad && props.roadDistance > filters.maxDistanceFromRoad) passes = false;
        
        if (filters.minDistanceFromGrid && props.gridDistance < filters.minDistanceFromGrid) passes = false;
        if (filters.maxDistanceFromGrid && props.gridDistance > filters.maxDistanceFromGrid) passes = false;
        
        if (filters.minDistanceFromGas && props.gasDistance < filters.minDistanceFromGas) passes = false;
        if (filters.maxDistanceFromGas && props.gasDistance > filters.maxDistanceFromGas) passes = false;
        
        // Environmental filtering
        if (filters.maxSlope && props.slope > filters.maxSlope) passes = false;
        if (filters.minSoilQuality && props.soilQuality < filters.minSoilQuality) passes = false;
        if (filters.maxFloodRisk && props.floodRisk > filters.maxFloodRisk) passes = false;
        if (filters.minWaterAvailability && props.waterAvailability < filters.minWaterAvailability) passes = false;
        
        // Elevation filtering
        if (filters.minElevation && props.elevation < filters.minElevation) passes = false;
        if (filters.maxElevation && props.elevation > filters.maxElevation) passes = false;
        
        if (passes) {
            results.push(site);
        }
        
        // Report progress
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / sites.length) * 100
            });
        }
    }
    
    return results;
}

// Export for use in main thread
self.exports = {
    analyzeSites,
    calculateDistances,
    scoreSites,
    applyFilters
};
