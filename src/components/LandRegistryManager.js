/**
 * LandRegistryManager - Manages UK Land Registry data integration
 * Provides access to property boundaries, ownership, and planning data
 */
export class LandRegistryManager {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://landregistry.data.gov.uk';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.rateLimit = {
            requests: 0,
            maxRequests: 1000, // Per hour
            resetTime: Date.now() + (60 * 60 * 1000)
        };
    }

    /**
     * Initialize with API key
     */
    async initialize(apiKey = null) {
        try {
            this.apiKey = apiKey || import.meta.env.VITE_LAND_REGISTRY_API_KEY;
            
            if (!this.apiKey) {
                console.warn('⚠️ No Land Registry API key provided - using public endpoints only');
            }
            
            console.log('🏠 Land Registry Manager initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Land Registry Manager:', error);
            return false;
        }
    }

    /**
     * Search for properties by location
     */
    async searchProperties(location, radius = 5000) {
        try {
            const cacheKey = `search_${location.join('_')}_${radius}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const [lng, lat] = location;
            const url = `${this.baseUrl}/data/ppi/transaction-record.json`;
            
            const params = new URLSearchParams({
                'lat': lat.toString(),
                'lng': lng.toString(),
                'radius': radius.toString(),
                'limit': '100'
            });

            const response = await this.makeRequest(url, params);
            const data = await response.json();
            
            const properties = this.parsePropertyData(data);
            this.addToCache(cacheKey, properties);
            
            console.log(`🏠 Found ${properties.length} properties near ${location}`);
            return properties;
            
        } catch (error) {
            console.error('❌ Error searching properties:', error);
            return [];
        }
    }

    /**
     * Get property details by ID
     */
    async getPropertyDetails(propertyId) {
        try {
            const cacheKey = `property_${propertyId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.baseUrl}/data/ppi/transaction-record/${propertyId}.json`;
            const response = await this.makeRequest(url);
            const data = await response.json();
            
            const property = this.parsePropertyDetails(data);
            this.addToCache(cacheKey, property);
            
            return property;
            
        } catch (error) {
            console.error('❌ Error getting property details:', error);
            return null;
        }
    }

    /**
     * Get planning data for a location
     */
    async getPlanningData(location) {
        try {
            const [lng, lat] = location;
            const cacheKey = `planning_${lng}_${lat}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // This would integrate with local planning authority APIs
            // For now, return mock data based on location
            const planningData = this.generateMockPlanningData(location);
            this.addToCache(cacheKey, planningData);
            
            return planningData;
            
        } catch (error) {
            console.error('❌ Error getting planning data:', error);
            return null;
        }
    }

    /**
     * Get land ownership information
     */
    async getOwnershipInfo(propertyId) {
        try {
            const cacheKey = `ownership_${propertyId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // This would integrate with Land Registry ownership APIs
            // For now, return mock data
            const ownership = this.generateMockOwnershipData(propertyId);
            this.addToCache(cacheKey, ownership);
            
            return ownership;
            
        } catch (error) {
            console.error('❌ Error getting ownership info:', error);
            return null;
        }
    }

    /**
     * Get environmental constraints for a location
     */
    async getEnvironmentalConstraints(location) {
        try {
            const [lng, lat] = location;
            const cacheKey = `environmental_${lng}_${lat}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // This would integrate with Natural England and Environment Agency APIs
            const constraints = this.generateMockEnvironmentalConstraints(location);
            this.addToCache(cacheKey, constraints);
            
            return constraints;
            
        } catch (error) {
            console.error('❌ Error getting environmental constraints:', error);
            return null;
        }
    }

    /**
     * Make API request with rate limiting
     */
    async makeRequest(url, params = null) {
        // Check rate limit
        if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
            const timeUntilReset = this.rateLimit.resetTime - Date.now();
            if (timeUntilReset > 0) {
                throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / 1000)} seconds`);
            }
            this.resetRateLimit();
        }

        // Build full URL
        const fullUrl = params ? `${url}?${params.toString()}` : url;
        
        // Make request
        const response = await fetch(fullUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'UK-AD-Mapping-App/1.0',
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Update rate limit
        this.rateLimit.requests++;
        
        return response;
    }

    /**
     * Parse property search results
     */
    parsePropertyData(data) {
        if (!data || !data.result || !data.result.items) {
            return [];
        }

        return data.result.items.map(item => ({
            id: item.property_id,
            address: item.property_address,
            coordinates: [item.longitude, item.latitude],
            price: item.price_paid,
            date: item.date_of_transfer,
            propertyType: item.property_type,
            tenure: item.tenure,
            newBuild: item.new_build === 'Y',
            estateType: item.estate_type
        }));
    }

    /**
     * Parse detailed property information
     */
    parsePropertyDetails(data) {
        if (!data || !data.result) {
            return null;
        }

        const result = data.result;
        return {
            id: result.property_id,
            address: result.property_address,
            coordinates: [result.longitude, result.latitude],
            price: result.price_paid,
            date: result.date_of_transfer,
            propertyType: result.property_type,
            tenure: result.tenure,
            newBuild: result.new_build === 'Y',
            estateType: result.estate_type,
            building: result.building,
            locality: result.locality,
            town: result.town,
            district: result.district,
            county: result.county,
            postcode: result.postcode
        };
    }

    /**
     * Generate mock planning data based on location
     */
    generateMockPlanningData(location) {
        const [lng, lat] = location;
        
        // Generate realistic planning data based on UK location
        const planningZones = [
            'Agricultural', 'Residential', 'Commercial', 'Industrial', 'Green Belt', 'Conservation'
        ];
        
        const zone = planningZones[Math.floor(Math.random() * planningZones.length)];
        
        return {
            planningZone: zone,
            permittedUses: this.getPermittedUses(zone),
            restrictions: this.getPlanningRestrictions(zone, location),
            applications: this.generateMockPlanningApplications(location),
            policies: this.getPlanningPolicies(zone)
        };
    }

    /**
     * Generate mock ownership data
     */
    generateMockOwnershipData(propertyId) {
        const ownershipTypes = ['Freehold', 'Leasehold', 'Commonhold'];
        const ownerTypes = ['Private Individual', 'Company', 'Local Authority', 'Trust'];
        
        return {
            propertyId: propertyId,
            ownershipType: ownershipTypes[Math.floor(Math.random() * ownershipTypes.length)],
            ownerType: ownerTypes[Math.floor(Math.random() * ownerTypes.length)],
            registeredOwner: this.generateMockOwnerName(),
            registrationDate: this.generateRandomDate('2010-01-01', '2024-01-01'),
            titleNumber: `TITLE${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            charges: this.generateMockCharges()
        };
    }

    /**
     * Generate mock environmental constraints
     */
    generateMockEnvironmentalConstraints(location) {
        const [lng, lat] = location;
        
        return {
            floodRisk: this.calculateFloodRisk(location),
            airQuality: this.calculateAirQuality(location),
            noiseLevels: this.calculateNoiseLevels(location),
            protectedSpecies: this.getProtectedSpecies(location),
            conservationAreas: this.getConservationAreas(location),
            greenBelt: this.isGreenBelt(location),
            aonb: this.isAONB(location),
            nationalPark: this.isNationalPark(location)
        };
    }

    /**
     * Get permitted uses for planning zone
     */
    getPermittedUses(zone) {
        const permittedUses = {
            'Agricultural': ['Farming', 'Agricultural buildings', 'Renewable energy'],
            'Residential': ['Housing', 'Gardens', 'Accessory buildings'],
            'Commercial': ['Offices', 'Retail', 'Services'],
            'Industrial': ['Manufacturing', 'Warehousing', 'Processing'],
            'Green Belt': ['Agriculture', 'Recreation', 'Limited development'],
            'Conservation': ['Preservation', 'Limited alteration', 'Heritage use']
        };
        
        return permittedUses[zone] || [];
    }

    /**
     * Get planning restrictions
     */
    getPlanningRestrictions(zone, location) {
        const restrictions = [];
        
        if (zone === 'Green Belt') {
            restrictions.push('Very limited development permitted');
            restrictions.push('Must preserve openness');
        }
        
        if (zone === 'Conservation') {
            restrictions.push('Heritage considerations apply');
            restrictions.push('Design approval required');
        }
        
        if (zone === 'Agricultural') {
            restrictions.push('Agricultural use priority');
            restrictions.push('Limited non-agricultural development');
        }
        
        return restrictions;
    }

    /**
     * Generate mock planning applications
     */
    generateMockPlanningApplications(location) {
        const applications = [];
        const numApplications = Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numApplications; i++) {
            applications.push({
                id: `APP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                type: ['Extension', 'New Building', 'Change of Use', 'Demolition'][Math.floor(Math.random() * 4)],
                status: ['Pending', 'Approved', 'Rejected', 'Under Review'][Math.floor(Math.random() * 4)],
                date: this.generateRandomDate('2020-01-01', '2024-01-01'),
                description: 'Mock planning application description'
            });
        }
        
        return applications;
    }

    /**
     * Get planning policies
     */
    getPlanningPolicies(zone) {
        const policies = {
            'Agricultural': ['Support sustainable agriculture', 'Protect rural character'],
            'Residential': ['Provide housing', 'Maintain residential amenity'],
            'Commercial': ['Support local economy', 'Maintain commercial viability'],
            'Industrial': ['Support employment', 'Minimize environmental impact'],
            'Green Belt': ['Preserve openness', 'Prevent urban sprawl'],
            'Conservation': ['Protect heritage', 'Maintain character']
        };
        
        return policies[zone] || [];
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
     * Generate mock charges
     */
    generateMockCharges() {
        const charges = [];
        const numCharges = Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numCharges; i++) {
            charges.push({
                type: ['Mortgage', 'Easement', 'Restrictive Covenant'][Math.floor(Math.random() * 3)],
                date: this.generateRandomDate('2010-01-01', '2024-01-01'),
                description: 'Mock charge description'
            });
        }
        
        return charges;
    }

    /**
     * Calculate flood risk based on location
     */
    calculateFloodRisk(location) {
        const [lng, lat] = location;
        
        // Simplified flood risk calculation
        if (Math.abs(lng) < 1.5 && lat < 52) {
            return 'High'; // Southeast England
        } else if (Math.abs(lng) < 2.5 && lat < 54) {
            return 'Medium'; // Central England
        } else {
            return 'Low'; // Northern areas
        }
    }

    /**
     * Calculate air quality
     */
    calculateAirQuality(location) {
        const [lng, lat] = location;
        
        if (Math.abs(lng) < 1.5 && lat < 52) {
            return 'Moderate'; // Southeast England
        } else if (lat > 55) {
            return 'Good'; // Scotland
        } else {
            return 'Fair'; // Other areas
        }
    }

    /**
     * Calculate noise levels
     */
    calculateNoiseLevels(location) {
        const [lng, lat] = location;
        
        if (Math.abs(lng) < 1.5 && lat < 52) {
            return 'High'; // Southeast England
        } else if (lat > 55) {
            return 'Low'; // Scotland
        } else {
            return 'Medium'; // Other areas
        }
    }

    /**
     * Get protected species
     */
    getProtectedSpecies(location) {
        const [lng, lat] = location;
        const species = [];
        
        if (lat > 55) {
            species.push('Red Squirrel', 'Golden Eagle');
        } else if (lat > 52) {
            species.push('Hedgehog', 'Barn Owl');
        } else {
            species.push('Hedgehog', 'Common Toad');
        }
        
        return species;
    }

    /**
     * Get conservation areas
     */
    getConservationAreas(location) {
        const [lng, lat] = location;
        
        if (Math.abs(lng) < 1.5 && lat < 52) {
            return ['Historic Town Centre', 'Rural Village'];
        } else if (lat > 55) {
            return ['Historic District', 'Natural Landscape'];
        } else {
            return ['Historic Area', 'Rural Conservation'];
        }
    }

    /**
     * Check if location is in Green Belt
     */
    isGreenBelt(location) {
        const [lng, lat] = location;
        
        // Simplified Green Belt check
        return Math.abs(lng) < 1.5 && lat < 52;
    }

    /**
     * Check if location is in AONB
     */
    isAONB(location) {
        const [lng, lat] = location;
        
        // Simplified AONB check
        return lat > 54 && Math.abs(lng) > 1.5;
    }

    /**
     * Check if location is in National Park
     */
    isNationalPark(location) {
        const [lng, lat] = location;
        
        // Simplified National Park check
        return lat > 55 && Math.abs(lng) > 2.0;
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
     * Reset rate limit
     */
    resetRateLimit() {
        this.rateLimit.requests = 0;
        this.rateLimit.resetTime = Date.now() + (60 * 60 * 1000);
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxAge: this.cacheExpiry,
            rateLimit: this.rateLimit
        };
    }
}
