/**
 * Enhanced SiteFinder - Advanced Multi-Criteria Decision Analysis for AD site selection
 * Now includes realistic environmental constraints, improved scoring, and data integration
 */
export class SiteFinder {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.analysisResults = null;
        this.savedFilters = new Map();
        this.analysisHistory = [];
        
        // Load saved filters from localStorage
        this.loadSavedFilters();
        
        // Enhanced constraints with user-configurable ranges
        this.constraints = {
            // Environmental constraints (realistic UK values)
            minDistanceFromResidential: 500, // meters
            maxDistanceFromResidential: 10000, // meters
            minDistanceFromRoad: 100, // meters
            maxDistanceFromRoad: 5000, // meters
            minDistanceFromWater: 100, // meters
            maxDistanceFromWater: 10000, // meters
            minDistanceFromProtectedArea: 1000, // meters
            maxDistanceFromProtectedArea: 5000, // meters
            maxSlope: 15, // degrees
            minArea: 2, // hectares
            maxArea: 100, // hectares
            
            // Infrastructure constraints
            minDistanceFromGrid: 1000, // meters
            maxDistanceFromGrid: 20000, // meters
            minDistanceFromGas: 1000, // meters
            maxDistanceFromGas: 15000, // meters
            
            // Planning constraints
            minDistanceFromConservationArea: 1000, // meters
            maxDistanceFromConservationArea: 10000, // meters
            minDistanceFromAONB: 2000, // meters
            maxDistanceFromAONB: 10000, // meters
            minDistanceFromSSSI: 1000, // meters
            maxDistanceFromSSSI: 10000, // meters
            minDistanceFromNationalPark: 3000, // meters
            maxDistanceFromNationalPark: 15000, // meters
            
            // Additional constraints
            minElevation: 0, // meters
            maxElevation: 500, // meters
            minSoilQuality: 1, // 1-10 scale
            maxSoilQuality: 10,
            minBiodiversity: 1, // 1-10 scale
            maxBiodiversity: 10,
            maxFloodRisk: 5, // 1-10 scale (lower is better)
            minWaterAvailability: 1, // 1-10 scale
            maxWaterAvailability: 10
        };
        
        this.criteria = {
            // Environmental criteria (weighted scoring)
            environmental: {
                weight: 0.35,
                subCriteria: {
                    soilQuality: { weight: 0.4, min: 0, max: 10 },
                    waterAvailability: { weight: 0.3, min: 0, max: 10 },
                    biodiversity: { weight: 0.2, min: 0, max: 10 },
                    floodRisk: { weight: 0.1, min: 0, max: 10 }
                }
            },
            
            // Infrastructure criteria
            infrastructure: {
                weight: 0.25,
                subCriteria: {
                    roadAccess: { weight: 0.4, min: 0, max: 10 },
                    gridConnection: { weight: 0.3, min: 0, max: 10 },
                    gasConnection: { weight: 0.2, min: 0, max: 10 },
                    waterSupply: { weight: 0.1, min: 0, max: 10 }
                }
            },
            
            // Economic criteria
            economic: {
                weight: 0.25,
                subCriteria: {
                    landCost: { weight: 0.4, min: 0, max: 10 },
                    developmentCost: { weight: 0.3, min: 0, max: 10 },
                    operationalCost: { weight: 0.2, min: 0, max: 10 },
                    revenuePotential: { weight: 0.1, min: 0, max: 10 }
                }
            },
            
            // Social criteria
            social: {
                weight: 0.15,
                subCriteria: {
                    communityAcceptance: { weight: 0.5, min: 0, max: 10 },
                    jobCreation: { weight: 0.3, min: 0, max: 10 },
                    localBenefits: { weight: 0.2, min: 0, max: 10 }
                }
            }
        };
    }

    /**
     * Enhanced site suitability analysis with realistic constraints and advanced filtering
     */
    async findSuitableSites(options = {}) {
        try {
            console.log('🚀 Starting enhanced site suitability analysis...');
            
            // Check if WebWorkers are available for performance optimization
            const useWebWorkers = window.APP_STATE.performanceManager && 
                                window.APP_STATE.performanceManager.isWorkerAvailable('siteAnalysis');
            
            if (useWebWorkers) {
                console.log('⚡ Using WebWorkers for enhanced performance...');
                return await this.findSitesWithWebWorkers(options);
            } else {
                console.log('🔄 Falling back to main thread processing...');
                return await this.findSitesMainThread(options);
            }
            
        } catch (error) {
            console.error('❌ Enhanced site finder error:', error);
            throw error;
        }
    }

    /**
     * Find sites using WebWorkers for enhanced performance
     */
    async findSitesWithWebWorkers(options = {}) {
        try {
            // Get available data
            const adPlants = await this.dataManager.getData('adPlants');
            const boundaries = await this.dataManager.getData('boundaries');
            
            if (!adPlants || !boundaries) {
                throw new Error('Required data not available for analysis');
            }
            
            // Apply user-defined filters
            const appliedFilters = this.applyUserFilters(options.filters || {});
            console.log('🔍 Applied user filters:', appliedFilters);
            
            // Generate potential sites based on constraints
            const potentialSites = this.generatePotentialSites(boundaries, options);
            console.log(`📍 Generated ${potentialSites.length} potential sites`);
            
            // Use WebWorker for heavy computations
            const performanceManager = window.APP_STATE.performanceManager;
            
            // Submit site analysis task to WebWorker
            const taskId = performanceManager.submitTask('siteAnalysis', 'ANALYZE_SITES', {
                sites: potentialSites,
                constraints: this.constraints,
                criteria: this.criteria,
                filters: appliedFilters
            });
            
            console.log(`⚡ WebWorker task submitted: ${taskId}`);
            
            // Wait for WebWorker completion
            return new Promise((resolve, reject) => {
                const handleWorkerMessage = (event) => {
                    if (event.detail.taskId === taskId) {
                        if (event.detail.type === 'ANALYSIS_COMPLETE') {
                            const results = event.detail.results;
                            
                            // Process results
                            const rankedSites = this.rankSites(results);
                            
                            // Store analysis results
                            this.analysisResults = {
                                totalAnalyzed: potentialSites.length,
                                suitableSites: rankedSites.length,
                                analysisDate: new Date().toISOString(),
                                constraints: this.constraints,
                                criteria: this.criteria,
                                options: options,
                                appliedFilters: appliedFilters,
                                results: rankedSites,
                                processingMethod: 'WebWorker'
                            };
                            
                            // Add to analysis history
                            this.analysisHistory.push({
                                id: `analysis_${Date.now()}`,
                                date: new Date().toISOString(),
                                filters: appliedFilters,
                                results: rankedSites.length,
                                totalAnalyzed: potentialSites.length,
                                processingMethod: 'WebWorker'
                            });
                            
                            // Keep only last 10 analyses
                            if (this.analysisHistory.length > 10) {
                                this.analysisHistory = this.analysisHistory.slice(-10);
                            }
                            
                            // Remove event listener
                            document.removeEventListener('workerTaskComplete', handleWorkerMessage);
                            
                            console.log(`✅ WebWorker analysis complete: ${rankedSites.length} suitable sites found`);
                            resolve(this.analysisResults);
                            
                        } else if (event.detail.type === 'ERROR') {
                            document.removeEventListener('workerTaskComplete', handleWorkerMessage);
                            reject(new Error(`WebWorker error: ${event.detail.error}`));
                        }
                    }
                };
                
                // Listen for WebWorker completion
                document.addEventListener('workerTaskComplete', handleWorkerMessage);
                
                // Set timeout for WebWorker tasks
                setTimeout(() => {
                    document.removeEventListener('workerTaskComplete', handleWorkerMessage);
                    reject(new Error('WebWorker task timeout'));
                }, 30000); // 30 second timeout
            });
            
        } catch (error) {
            console.error('❌ WebWorker analysis error:', error);
            // Fallback to main thread
            return await this.findSitesMainThread(options);
        }
    }

    /**
     * Find sites using main thread (fallback method)
     */
    async findSitesMainThread(options = {}) {
        try {
            // Get available data
            const adPlants = await this.dataManager.getData('adPlants');
            const boundaries = await this.dataManager.getData('boundaries');
            
            if (!adPlants || !boundaries) {
                throw new Error('Required data not available for analysis');
            }
            
            // Apply user-defined filters
            const appliedFilters = this.applyUserFilters(options.filters || {});
            console.log('🔍 Applied user filters:', appliedFilters);
            
            // Generate potential sites based on constraints
            const potentialSites = this.generatePotentialSites(boundaries, options);
            console.log(`📍 Generated ${potentialSites.length} potential sites`);
            
            // Apply environmental and planning constraints
            const constrainedSites = this.applyConstraints(potentialSites);
            console.log(`🔒 Applied constraints: ${constrainedSites.length} sites remain`);
            
            // Apply advanced filtering
            const filteredSites = this.applyAdvancedFilters(constrainedSites, appliedFilters);
            console.log(`🎯 Applied advanced filters: ${filteredSites.length} sites remain`);
            
            // Score sites using enhanced MCDA
            const scoredSites = this.scoreSites(filteredSites);
            console.log(`📊 Scored ${scoredSites.length} sites`);
            
            // Rank sites by suitability
            const rankedSites = this.rankSites(scoredSites);
            
            // Store analysis results with filter information
            this.analysisResults = {
                totalAnalyzed: potentialSites.length,
                suitableSites: rankedSites.length,
                analysisDate: new Date().toISOString(),
                constraints: this.constraints,
                criteria: this.criteria,
                options: options,
                appliedFilters: appliedFilters,
                results: rankedSites,
                processingMethod: 'MainThread'
            };
            
            // Add to analysis history
            this.analysisHistory.push({
                id: `analysis_${Date.now()}`,
                date: new Date().toISOString(),
                filters: appliedFilters,
                results: rankedSites.length,
                totalAnalyzed: potentialSites.length,
                processingMethod: 'MainThread'
            });
            
            // Keep only last 10 analyses
            if (this.analysisHistory.length > 10) {
                this.analysisHistory = this.analysisHistory.slice(-10);
            }
            
            console.log(`✅ Main thread analysis complete: ${rankedSites.length} suitable sites found`);
            return this.analysisResults;
            
        } catch (error) {
            console.error('❌ Main thread analysis error:', error);
            throw error;
        }
    }

    /**
     * Generate potential sites with realistic UK land characteristics
     */
    generatePotentialSites(boundaries, options) {
        const sites = [];
        const { minArea = 2, maxArea = 50, targetCount = 1000 } = options;
        
        // Use existing AD plant locations as reference points
        const referencePoints = this.dataManager.getData('adPlants') || [];
        
        // Generate sites around reference points and in suitable areas
        for (let i = 0; i < targetCount; i++) {
            const site = this.generateRealisticSite(referencePoints, boundaries, minArea, maxArea, i);
            if (site) {
                sites.push(site);
            }
        }
        
        return sites;
    }

    /**
     * Generate a realistic site with UK-specific characteristics
     */
    generateRealisticSite(referencePoints, boundaries, minArea, maxArea, siteIndex) {
        try {
            // Select a random reference point or generate new coordinates
            let coordinates;
            if (referencePoints.length > 0 && Math.random() < 0.7) {
                // 70% chance to generate near existing AD plants
                const refPoint = referencePoints[Math.floor(Math.random() * referencePoints.length)];
                coordinates = this.generateNearbyCoordinates(refPoint.coordinates, 5000, 20000);
            } else {
                // 30% chance to generate in new areas
                coordinates = this.generateUKCoordinates();
            }
            
            // Generate realistic site properties
            const site = {
                id: `site_${Date.now()}_${siteIndex}`,
                coordinates: coordinates,
                properties: {
                    area: this.generateRealisticArea(minArea, maxArea),
                    soilType: this.generateSoilType(coordinates),
                    landUse: this.generateLandUse(coordinates),
                    elevation: this.generateElevation(coordinates),
                    slope: this.generateSlope(coordinates),
                    floodRisk: this.generateFloodRisk(coordinates),
                    biodiversity: this.generateBiodiversityScore(coordinates),
                    waterAvailability: this.generateWaterAvailability(coordinates),
                    roadDistance: this.calculateRoadDistance(coordinates),
                    gridDistance: this.calculateGridDistance(coordinates),
                    gasDistance: this.calculateGasDistance(coordinates),
                    residentialDistance: this.calculateResidentialDistance(coordinates),
                    protectedAreaDistance: this.calculateProtectedAreaDistance(coordinates),
                    conservationAreaDistance: this.calculateConservationAreaDistance(coordinates),
                    landCost: this.generateLandCost(coordinates),
                    developmentCost: this.generateDevelopmentCost(coordinates)
                }
            };
            
            return site;
            
        } catch (error) {
            console.warn('⚠️ Error generating site:', error);
            return null;
        }
    }

    /**
     * Apply user-defined filters to constraints
     */
    applyUserFilters(userFilters) {
        const appliedFilters = {};
        
        // Apply each user filter to the constraints
        Object.keys(userFilters).forEach(key => {
            if (this.constraints.hasOwnProperty(key)) {
                if (key.startsWith('min')) {
                    this.constraints[key] = Math.max(this.constraints[key], userFilters[key]);
                } else if (key.startsWith('max')) {
                    this.constraints[key] = Math.min(this.constraints[key], userFilters[key]);
                } else {
                    this.constraints[key] = userFilters[key];
                }
                appliedFilters[key] = userFilters[key];
            }
        });
        
        return appliedFilters;
    }
    
    /**
     * Apply advanced filtering based on user preferences
     */
    applyAdvancedFilters(sites, filters) {
        if (!filters || Object.keys(filters).length === 0) {
            return sites;
        }
        
        return sites.filter(site => {
            const props = site.properties;
            
            // Area filtering
            if (filters.minArea && props.area < filters.minArea) return false;
            if (filters.maxArea && props.area > filters.maxArea) return false;
            
            // Distance filtering
            if (filters.minDistanceFromRoad && props.roadDistance < filters.minDistanceFromRoad) return false;
            if (filters.maxDistanceFromRoad && props.roadDistance > filters.maxDistanceFromRoad) return false;
            
            if (filters.minDistanceFromGrid && props.gridDistance < filters.minDistanceFromGrid) return false;
            if (filters.maxDistanceFromGrid && props.gridDistance > filters.maxDistanceFromGrid) return false;
            
            if (filters.minDistanceFromGas && props.gasDistance < filters.minDistanceFromGas) return false;
            if (filters.maxDistanceFromGas && props.gasDistance > filters.maxDistanceFromGas) return false;
            
            // Environmental filtering
            if (filters.maxSlope && props.slope > filters.maxSlope) return false;
            if (filters.minSoilQuality && props.soilQuality < filters.minSoilQuality) return false;
            if (filters.maxFloodRisk && props.floodRisk > filters.maxFloodRisk) return false;
            if (filters.minWaterAvailability && props.waterAvailability < filters.minWaterAvailability) return false;
            
            // Elevation filtering
            if (filters.minElevation && props.elevation < filters.minElevation) return false;
            if (filters.maxElevation && props.elevation > filters.maxElevation) return false;
            
            return true;
        });
    }
    
    /**
     * Save a filter configuration for future use
     */
    saveFilter(name, filterConfig) {
        this.savedFilters.set(name, {
            ...filterConfig,
            savedAt: new Date().toISOString(),
            id: `filter_${Date.now()}`
        });
        
        // Save to localStorage
        try {
            localStorage.setItem('siteFinder_savedFilters', JSON.stringify(Array.from(this.savedFilters.entries())));
        } catch (error) {
            console.warn('Could not save filters to localStorage:', error);
        }
    }
    
    /**
     * Load saved filters from localStorage
     */
    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('siteFinder_savedFilters');
            if (saved) {
                this.savedFilters = new Map(JSON.parse(saved));
            }
        } catch (error) {
            console.warn('Could not load saved filters:', error);
        }
        return this.savedFilters;
    }
    
    /**
     * Get filter recommendations based on analysis results
     */
    getFilterRecommendations() {
        if (!this.analysisResults || !this.analysisResults.results.length) {
            return [];
        }
        
        const recommendations = [];
        const results = this.analysisResults.results;
        
        // Analyze top-performing sites to suggest optimal ranges
        const topSites = results.slice(0, Math.min(10, results.length));
        
        // Area recommendations
        const areas = topSites.map(site => site.properties.area);
        const avgArea = areas.reduce((a, b) => a + b, 0) / areas.length;
        recommendations.push({
            type: 'area',
            message: `Optimal land area: ${avgArea.toFixed(1)} hectares`,
            suggestedRange: [Math.max(2, avgArea * 0.7), Math.min(100, avgArea * 1.3)]
        });
        
        // Distance recommendations
        const roadDistances = topSites.map(site => site.properties.roadDistance);
        const avgRoadDistance = roadDistances.reduce((a, b) => a + b, 0) / roadDistances.length;
        recommendations.push({
            type: 'roadDistance',
            message: `Optimal road distance: ${avgRoadDistance.toFixed(0)}m`,
            suggestedRange: [Math.max(100, avgRoadDistance * 0.8), Math.min(5000, avgRoadDistance * 1.2)]
        });
        
        return recommendations;
    }
    
    /**
     * Export analysis results in various formats
     */
    exportResults(format = 'json') {
        if (!this.analysisResults) {
            throw new Error('No analysis results to export');
        }
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.analysisResults, null, 2);
                
            case 'csv':
                return this.convertToCSV(this.analysisResults.results);
                
            case 'geojson':
                return this.convertToGeoJSON(this.analysisResults.results);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    /**
     * Convert results to CSV format
     */
    convertToCSV(results) {
        if (!results || results.length === 0) return '';
        
        const headers = ['Site ID', 'Latitude', 'Longitude', 'Area (ha)', 'Score', 'Soil Quality', 'Road Distance (m)', 'Grid Distance (m)'];
        const rows = results.map(site => [
            site.id,
            site.coordinates[1],
            site.coordinates[0],
            site.properties.area,
            site.score || 0,
            site.properties.soilQuality,
            site.properties.roadDistance,
            site.properties.gridDistance
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    /**
     * Convert results to GeoJSON format
     */
    convertToGeoJSON(results) {
        return {
            type: 'FeatureCollection',
            features: results.map(site => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: site.coordinates
                },
                properties: {
                    id: site.id,
                    score: site.score || 0,
                    ...site.properties
                }
            }))
        };
    }
    
    /**
     * Get analysis history
     */
    getAnalysisHistory() {
        return this.analysisHistory;
    }
    
    /**
     * Get saved filters
     */
    getSavedFilters() {
        return this.savedFilters;
    }
    
    /**
     * Delete a saved filter
     */
    deleteFilter(filterId) {
        this.savedFilters.delete(filterId);
        
        // Update localStorage
        try {
            localStorage.setItem('siteFinder_savedFilters', JSON.stringify(Array.from(this.savedFilters.entries())));
        } catch (error) {
            console.warn('Could not update saved filters in localStorage:', error);
        }
    }
    
    /**
     * Clear all saved filters
     */
    clearSavedFilters() {
        this.savedFilters.clear();
        
        try {
            localStorage.removeItem('siteFinder_savedFilters');
        } catch (error) {
            console.warn('Could not clear saved filters from localStorage:', error);
        }
    }
    
    /**
     * Generate realistic UK coordinates
     */
    generateUKCoordinates() {
        // UK bounding box: approximately -8.5 to 2.0 longitude, 49.5 to 61.0 latitude
        const lng = -8.5 + Math.random() * 10.5;
        const lat = 49.5 + Math.random() * 11.5;
        return [lng, lat];
    }

    /**
     * Generate coordinates near a reference point
     */
    generateNearbyCoordinates(referenceCoords, minDistance, maxDistance) {
        const [refLng, refLat] = referenceCoords;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        const bearing = Math.random() * 360;
        
        // Convert to radians
        const lat1 = refLat * Math.PI / 180;
        const lng1 = refLng * Math.PI / 180;
        const brng = bearing * Math.PI / 180;
        
        // Calculate new position
        const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(distance / 6371000) +
            Math.cos(lat1) * Math.sin(distance / 6371000) * Math.cos(brng)
        );
        
        const lng2 = lng1 + Math.atan2(
            Math.sin(brng) * Math.sin(distance / 6371000) * Math.cos(lat1),
            Math.cos(distance / 6371000) - Math.sin(lat1) * Math.sin(lat2)
        );
        
        return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI];
    }

    /**
     * Generate realistic site area
     */
    generateRealisticArea(minArea, maxArea) {
        // Most AD plants are between 2-20 hectares, with some larger ones
        const distribution = Math.random();
        if (distribution < 0.6) {
            // 60% small sites (2-10 ha)
            return minArea + Math.random() * 8;
        } else if (distribution < 0.9) {
            // 30% medium sites (10-30 ha)
            return 10 + Math.random() * 20;
        } else {
            // 10% large sites (30-50 ha)
            return 30 + Math.random() * 20;
        }
    }

    /**
     * Generate realistic soil type based on UK soil distribution
     */
    generateSoilType(coordinates) {
        const soilTypes = [
            'Clay', 'Silt', 'Sandy', 'Loamy', 'Peaty', 'Chalky'
        ];
        const weights = [0.3, 0.2, 0.2, 0.15, 0.1, 0.05]; // UK soil distribution
        
        return this.weightedRandomChoice(soilTypes, weights);
    }

    /**
     * Generate realistic land use
     */
    generateLandUse(coordinates) {
        const landUses = [
            'Agricultural', 'Pasture', 'Forest', 'Wetland', 'Brownfield', 'Greenfield'
        ];
        const weights = [0.4, 0.25, 0.2, 0.1, 0.03, 0.02]; // UK land use distribution
        
        return this.weightedRandomChoice(landUses, weights);
    }

    /**
     * Generate realistic elevation
     */
    generateElevation(coordinates) {
        // UK elevation ranges from sea level to ~1,300m
        const [lng, lat] = coordinates;
        
        // Rough elevation model for UK
        if (lat > 56) {
            // Scotland - higher elevations
            return 100 + Math.random() * 1200;
        } else if (lat > 52) {
            // Northern England - medium elevations
            return 50 + Math.random() * 800;
        } else {
            // Southern England - lower elevations
            return 10 + Math.random() * 400;
        }
    }

    /**
     * Generate realistic slope
     */
    generateSlope(coordinates) {
        const elevation = this.generateElevation(coordinates);
        
        // Higher elevations tend to have steeper slopes
        if (elevation > 500) {
            return 5 + Math.random() * 25; // 5-30 degrees
        } else if (elevation > 200) {
            return 2 + Math.random() * 15; // 2-17 degrees
        } else {
            return 1 + Math.random() * 8; // 1-9 degrees
        }
    }

    /**
     * Generate flood risk score
     */
    generateFloodRisk(coordinates) {
        const [lng, lat] = coordinates;
        
        // Coastal and river areas have higher flood risk
        if (Math.abs(lng) < 1.5 && lat < 52) {
            // Southeast England - higher flood risk
            return 3 + Math.random() * 7; // 3-10
        } else if (Math.abs(lng) < 2.5 && lat < 54) {
            // Central England - medium flood risk
            return 2 + Math.random() * 6; // 2-8
        } else {
            // Northern areas - lower flood risk
            return 1 + Math.random() * 4; // 1-5
        }
    }

    /**
     * Generate biodiversity score
     */
    generateBiodiversityScore(coordinates) {
        const [lng, lat] = coordinates;
        
        // Areas with more natural habitats have higher biodiversity
        if (lat > 55) {
            // Scotland - higher biodiversity
            return 6 + Math.random() * 4; // 6-10
        } else if (lat > 52) {
            // Northern England - medium biodiversity
            return 4 + Math.random() * 4; // 4-8
        } else {
            // Southern England - lower biodiversity (more developed)
            return 2 + Math.random() * 4; // 2-6
        }
    }

    /**
     * Generate water availability score
     */
    generateWaterAvailability(coordinates) {
        const [lng, lat] = coordinates;
        
        // Areas with more rainfall have higher water availability
        if (lat > 55) {
            // Scotland - high rainfall
            return 7 + Math.random() * 3; // 7-10
        } else if (lat > 52) {
            // Northern England - medium rainfall
            return 5 + Math.random() * 3; // 5-8
        } else {
            // Southern England - lower rainfall
            return 3 + Math.random() * 4; // 3-7
        }
    }

    /**
     * Calculate road distance (simplified)
     */
    calculateRoadDistance(coordinates) {
        // Simplified calculation - in real implementation, this would use actual road network data
        return 500 + Math.random() * 3000; // 500m to 3.5km
    }

    /**
     * Calculate grid connection distance
     */
    calculateGridDistance(coordinates) {
        // Most UK areas have grid access within 5-15km
        return 3000 + Math.random() * 12000; // 3km to 15km
    }

    /**
     * Calculate gas connection distance
     */
    calculateGasDistance(coordinates) {
        // Gas network coverage varies across UK
        return 2000 + Math.random() * 8000; // 2km to 10km
    }

    /**
     * Calculate residential area distance
     */
    calculateResidentialDistance(coordinates) {
        // Ensure minimum distance from residential areas
        return 800 + Math.random() * 2000; // 800m to 2.8km
    }

    /**
     * Calculate protected area distance
     */
    calculateProtectedAreaDistance(coordinates) {
        // Distance from various protected areas
        return 1500 + Math.random() * 5000; // 1.5km to 6.5km
    }

    /**
     * Calculate conservation area distance
     */
    calculateConservationAreaDistance(coordinates) {
        return 2500 + Math.random() * 5000; // 2.5km to 7.5km
    }

    /**
     * Generate realistic land cost
     */
    generateLandCost(coordinates) {
        const [lng, lat] = coordinates;
        
        // Land costs vary significantly across UK
        if (lat > 55) {
            // Scotland - lower land costs
            return 5000 + Math.random() * 15000; // £5k-20k per hectare
        } else if (lat > 52) {
            // Northern England - medium land costs
            return 8000 + Math.random() * 22000; // £8k-30k per hectare
        } else {
            // Southern England - higher land costs
            return 15000 + Math.random() * 35000; // £15k-50k per hectare
        }
    }

    /**
     * Generate development cost
     */
    generateDevelopmentCost(coordinates) {
        const landCost = this.generateLandCost(coordinates);
        
        // Development costs are typically 3-5x land costs
        return landCost * (3 + Math.random() * 2);
    }

    /**
     * Weighted random choice utility
     */
    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    /**
     * Apply environmental and planning constraints to sites
     */
    applyConstraints(sites) {
        return sites.filter(site => {
            const props = site.properties;
            
            // Check area constraints
            if (props.area < this.constraints.minArea || props.area > this.constraints.maxArea) {
                return false;
            }
            
            // Check slope constraints
            if (props.slope > this.constraints.maxSlope) {
                return false;
            }
            
            // Check distance constraints
            if (props.residentialDistance < this.constraints.minDistanceFromResidential) {
                return false;
            }
            
            if (props.roadDistance > this.constraints.maxDistanceFromRoad) {
                return false;
            }
            
            if (props.protectedAreaDistance < this.constraints.minDistanceFromProtectedArea) {
                return false;
            }
            
            if (props.conservationAreaDistance < this.constraints.minDistanceFromConservationArea) {
                return false;
            }
            
            // Check infrastructure constraints
            if (props.gridDistance < this.constraints.minDistanceFromGrid || 
                props.gridDistance > this.constraints.maxDistanceFromGrid) {
                return false;
            }
            
            if (props.gasDistance < this.constraints.minDistanceFromGas || 
                props.gasDistance > this.constraints.maxDistanceFromGas) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * Score sites using enhanced MCDA methodology
     */
    scoreSites(sites) {
        return sites.map(site => {
            const props = site.properties;
            
            // Calculate environmental score
            const environmentalScore = this.calculateCriterionScore('environmental', {
                soilQuality: this.calculateSoilQualityScore(props.soilType),
                waterAvailability: props.waterAvailability,
                biodiversity: props.biodiversity,
                floodRisk: this.calculateFloodRiskScore(props.floodRisk)
            });
            
            // Calculate infrastructure score
            const infrastructureScore = this.calculateCriterionScore('infrastructure', {
                roadAccess: this.calculateRoadAccessScore(props.roadDistance),
                gridConnection: this.calculateGridConnectionScore(props.gridDistance),
                gasConnection: this.calculateGasConnectionScore(props.gasDistance),
                waterSupply: this.calculateWaterSupplyScore(props.waterAvailability)
            });
            
            // Calculate economic score
            const economicScore = this.calculateCriterionScore('economic', {
                landCost: this.calculateLandCostScore(props.landCost),
                developmentCost: this.calculateDevelopmentCostScore(props.developmentCost),
                operationalCost: this.calculateOperationalCostScore(props),
                revenuePotential: this.calculateRevenuePotentialScore(props)
            });
            
            // Calculate social score
            const socialScore = this.calculateCriterionScore('social', {
                communityAcceptance: this.calculateCommunityAcceptanceScore(props),
                jobCreation: this.calculateJobCreationScore(props.area),
                localBenefits: this.calculateLocalBenefitsScore(props)
            });
            
            // Calculate weighted total score
            const totalScore = (
                environmentalScore * this.criteria.environmental.weight +
                infrastructureScore * this.criteria.infrastructure.weight +
                economicScore * this.criteria.economic.weight +
                socialScore * this.criteria.social.weight
            );
            
            return {
                ...site,
                scores: {
                    environmental: environmentalScore,
                    infrastructure: infrastructureScore,
                    economic: economicScore,
                    social: socialScore,
                    total: totalScore
                },
                score: totalScore
            };
        });
    }

    /**
     * Calculate score for a specific criterion
     */
    calculateCriterionScore(criterionName, subScores) {
        const criterion = this.criteria[criterionName];
        let totalScore = 0;
        
        for (const [subCriterion, score] of Object.entries(subScores)) {
            const subCriterionConfig = criterion.subCriteria[subCriterion];
            if (subCriterionConfig) {
                totalScore += score * subCriterionConfig.weight;
            }
        }
        
        return totalScore;
    }

    /**
     * Calculate soil quality score
     */
    calculateSoilQualityScore(soilType) {
        const soilScores = {
            'Clay': 8, 'Silt': 7, 'Loamy': 9, 'Sandy': 6, 'Peaty': 4, 'Chalky': 5
        };
        return soilScores[soilType] || 5;
    }

    /**
     * Calculate flood risk score (inverted - lower risk = higher score)
     */
    calculateFloodRiskScore(floodRisk) {
        return Math.max(0, 10 - floodRisk);
    }

    /**
     * Calculate road access score
     */
    calculateRoadAccessScore(distance) {
        if (distance <= 500) return 10;
        if (distance <= 1000) return 9;
        if (distance <= 2000) return 7;
        if (distance <= 3000) return 5;
        return 3;
    }

    /**
     * Calculate grid connection score
     */
    calculateGridConnectionScore(distance) {
        if (distance <= 5000) return 10;
        if (distance <= 10000) return 8;
        if (distance <= 15000) return 6;
        return 4;
    }

    /**
     * Calculate gas connection score
     */
    calculateGasConnectionScore(distance) {
        if (distance <= 2000) return 10;
        if (distance <= 5000) return 8;
        if (distance <= 10000) return 6;
        return 4;
    }

    /**
     * Calculate water supply score
     */
    calculateWaterSupplyScore(availability) {
        return Math.min(10, availability);
    }

    /**
     * Calculate land cost score (inverted - lower cost = higher score)
     */
    calculateLandCostScore(cost) {
        if (cost <= 10000) return 10;
        if (cost <= 20000) return 8;
        if (cost <= 30000) return 6;
        if (cost <= 40000) return 4;
        return 2;
    }

    /**
     * Calculate development cost score
     */
    calculateDevelopmentCostScore(cost) {
        if (cost <= 50000) return 10;
        if (cost <= 100000) return 8;
        if (cost <= 150000) return 6;
        if (cost <= 200000) return 4;
        return 2;
    }

    /**
     * Calculate operational cost score
     */
    calculateOperationalCostScore(props) {
        // Simplified calculation based on location and infrastructure
        let score = 7; // Base score
        
        if (props.gridDistance > 10000) score -= 2;
        if (props.gasDistance > 5000) score -= 1;
        if (props.roadDistance > 2000) score -= 1;
        
        return Math.max(1, score);
    }

    /**
     * Calculate revenue potential score
     */
    calculateRevenuePotentialScore(props) {
        // Based on area and location
        let score = 6; // Base score
        
        if (props.area > 20) score += 2;
        if (props.waterAvailability > 7) score += 1;
        if (props.biodiversity > 7) score += 1;
        
        return Math.min(10, score);
    }

    /**
     * Calculate community acceptance score
     */
    calculateCommunityAcceptanceScore(props) {
        let score = 6; // Base score
        
        if (props.residentialDistance > 2000) score += 2;
        if (props.protectedAreaDistance > 3000) score += 1;
        if (props.conservationAreaDistance > 4000) score += 1;
        
        return Math.min(10, score);
    }

    /**
     * Calculate job creation score
     */
    calculateJobCreationScore(area) {
        // Larger sites create more jobs
        if (area > 30) return 10;
        if (area > 20) return 8;
        if (area > 10) return 6;
        if (area > 5) return 4;
        return 2;
    }

    /**
     * Calculate local benefits score
     */
    calculateLocalBenefitsScore(props) {
        let score = 6; // Base score
        
        if (props.area > 15) score += 2;
        if (props.waterAvailability > 6) score += 1;
        if (props.biodiversity > 6) score += 1;
        
        return Math.min(10, score);
    }

    /**
     * Rank sites by suitability score
     */
    rankSites(scoredSites) {
        return scoredSites
            .sort((a, b) => b.score - a.score)
            .map((site, index) => ({
                ...site,
                rank: index + 1
            }));
    }

    /**
     * Get detailed analysis results
     */
    getAnalysisResults() {
        return this.analysisResults;
    }

    /**
     * Get suitable sites
     */
    getSuitableSites() {
        return this.analysisResults?.results || [];
    }

    /**
     * Export results to various formats
     */
    exportResults(format = 'json') {
        if (!this.analysisResults) {
            throw new Error('No analysis results available');
        }
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this.convertToCSV(this.analysisResults.results);
            case 'json':
                return JSON.stringify(this.analysisResults, null, 2);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert results to CSV format
     */
    convertToCSV(results) {
        if (!results || results.length === 0) return '';
        
        const headers = [
            'Rank', 'Site ID', 'Longitude', 'Latitude', 'Area (ha)', 'Total Score',
            'Environmental Score', 'Infrastructure Score', 'Economic Score', 'Social Score',
            'Soil Type', 'Land Use', 'Elevation', 'Slope', 'Flood Risk',
            'Road Distance (m)', 'Grid Distance (m)', 'Gas Distance (m)',
            'Residential Distance (m)', 'Land Cost (£/ha)', 'Development Cost (£)'
        ];
        
        const csvRows = [headers.join(',')];
        
        for (const site of results) {
            const row = [
                site.rank,
                site.id,
                site.coordinates[0],
                site.coordinates[1],
                site.properties.area,
                site.score.toFixed(2),
                site.scores.environmental.toFixed(2),
                site.scores.environmental.toFixed(2),
                site.scores.infrastructure.toFixed(2),
                site.scores.economic.toFixed(2),
                site.scores.social.toFixed(2),
                site.properties.soilType,
                site.properties.landUse,
                site.properties.elevation,
                site.properties.slope,
                site.properties.floodRisk,
                site.properties.roadDistance,
                site.properties.gridDistance,
                site.properties.gasDistance,
                site.properties.residentialDistance,
                site.properties.landCost,
                site.properties.developmentCost
            ];
            
            csvRows.push(row.map(field => `"${field}"`).join(','));
        }
        
        return csvRows.join('\n');
    }
}
