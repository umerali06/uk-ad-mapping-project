/**
 * InfoPanel - Manages the right-side information display panel
 * Shows feature information, search results, and site finder results
 * Now collapsible like the sidebar
 */
export class InfoPanel {
    constructor() {
        this.panel = null;
        this.content = null;
        this.collapseBtn = null;
        this.reopenBtn = null;
        this.reopenContainer = null;
        this.isCollapsed = false;
        this.tempMarker = null;
    }

    initialize() {
        this.panel = document.getElementById('info-panel');
        this.content = document.getElementById('info-content');
        this.collapseBtn = document.getElementById('info-collapse');
        this.reopenBtn = document.getElementById('info-reopen');
        this.reopenContainer = document.getElementById('info-reopen-container');
        
        if (!this.panel || !this.content || !this.collapseBtn || !this.reopenBtn || !this.reopenContainer) {
            console.error('InfoPanel elements not found');
            return;
        }

        // Set up event listeners
        this.collapseBtn.addEventListener('click', () => this.collapse());
        this.reopenBtn.addEventListener('click', () => this.expand());
        
        // Close on escape key
        this.panel.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.collapse();
            }
        });

        console.log('InfoPanel initialized with collapse functionality');
    }

    show() {
        // Show the panel and ensure it's expanded
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.expand();
        }
    }

    hide() {
        // Hide the panel completely
        if (this.panel) {
            this.panel.style.display = 'none';
            this.toggleContainer.classList.add('hidden');
        }
    }

    /**
     * Collapse the info panel
     */
    collapse() {
        if (this.panel && !this.isCollapsed) {
            this.panel.classList.add('collapsed');
            this.isCollapsed = true;
            this.reopenContainer.classList.remove('hidden');
            console.log('📋 Info panel collapsed');
        }
    }

    /**
     * Expand the info panel
     */
    expand() {
        if (this.panel && this.isCollapsed) {
            this.panel.classList.remove('collapsed');
            this.isCollapsed = false;
            this.reopenContainer.classList.add('hidden');
            console.log('📋 Info panel expanded');
        }
    }

    /**
     * Toggle between collapsed and expanded states
     */
    toggleCollapse() {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /**
     * Display enhanced item information (from search results)
     */
    showItemInfo(item) {
        if (!this.content) return;
        
        const statusColor = this.getStatusColor(item.status);
        const typeColor = this.getTypeColor(item.type);
        
        this.content.innerHTML = `
            <div class="p-4">
                <div class="flex items-start justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">${item.name || 'Unknown Item'}</h3>
                    <div class="flex space-x-2">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${item.status || 'Unknown'}
                        </span>
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColor}">
                            ${item.type || 'Unknown'}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="space-y-3">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.developer || 'Unknown Developer'}</span>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.location || 'Unknown Location'}</span>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.technology || 'Unknown Technology'}</span>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.capacity || 'Unknown Capacity'}</span>
                        </div>
                        
                        ${item.feedstock ? `
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.feedstock}</span>
                        </div>
                        ` : ''}
                        
                        ${item.coordinates ? `
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                            <span class="text-sm text-gray-600">${item.coordinates[1].toFixed(4)}, ${item.coordinates[0].toFixed(4)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${item.coordinates ? `
                <div class="border-t border-gray-200 pt-4">
                    <button id="focus-map-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                        🗺️ Focus on Map
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        
        // Add event listener for focus map button
        if (item.coordinates) {
            const focusBtn = this.content.querySelector('#focus-map-btn');
            if (focusBtn) {
                focusBtn.addEventListener('click', () => {
                    this.focusOnMap(item.coordinates);
                });
            }
        }
        
        this.show();
    }

    /**
     * Show Land Registry parcel details
     */
    showParcelDetails(properties) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    🏠 Land Registry Parcel
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Title Number</label>
                            <p class="text-gray-900">${properties.title_no || 'N/A'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Ownership Type</label>
                            <p class="text-gray-900">${properties.ownership_type || 'Unknown'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Area</label>
                            <p class="text-gray-900">${properties.area_hectares || 'N/A'} hectares</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Land Use</label>
                            <p class="text-gray-900">${properties.land_use || 'Not specified'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Registered Owner</label>
                            <p class="text-gray-900">${properties.registered_owner || 'Private'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Registration Date</label>
                            <p class="text-gray-900">${properties.registration_date || 'Unknown'}</p>
                        </div>
                        
                        ${properties.price_paid ? `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Last Sale Price</label>
                            <p class="text-gray-900">£${parseInt(properties.price_paid).toLocaleString()}</p>
                        </div>
                        ` : ''}
                        
                        ${properties.restrictions && properties.restrictions !== 'None' ? `
                        <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <label class="text-sm font-medium text-yellow-800">Restrictions</label>
                            <p class="text-yellow-900">${properties.restrictions}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <button onclick="window.APP_STATE.siteFinder?.analyzeSite('${properties.title_no}')" 
                                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            🎯 Analyze for AD Plant Suitability
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Display feature information (from map clicks)
     */
    showFeatureInfo(feature) {
        if (!this.content) return;
        
        const properties = feature.properties || {};
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3">${properties.name || 'Feature Information'}</h3>
                <div class="space-y-2">
                    ${Object.entries(properties).map(([key, value]) => 
                        `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`
                    ).join('')}
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Show AD Plant details
     */
    showADPlantDetails(properties) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    ⚡ ${properties.displayName || properties.name || 'AD Plant'}
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Status</label>
                            <p class="text-gray-900 flex items-center">
                                <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: ${
                                    properties.status === 'Operational' ? '#16a34a' :
                                    properties.status === 'Under Construction' ? '#2563eb' :
                                    properties.status === 'Planning Granted' ? '#9333ea' :
                                    properties.status === 'Planning Application' ? '#ea580c' : '#dc2626'
                                }"></span>
                                ${properties.status || 'Unknown'}
                            </p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Capacity</label>
                            <p class="text-gray-900">${properties.capacity || 'Not specified'} MW</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Technology</label>
                            <p class="text-gray-900">${properties.technology || 'Not specified'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Operator</label>
                            <p class="text-gray-900">${properties.operator || 'Not specified'}</p>
                        </div>
                        
                        ${properties.feedstock ? `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Feedstock</label>
                            <p class="text-gray-900">${properties.feedstock}</p>
                        </div>
                        ` : ''}
                        
                        ${properties.operationalDate ? `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Operational Since</label>
                            <p class="text-gray-900">${properties.operationalDate}</p>
                        </div>
                        ` : ''}
                        
                        ${properties.plannedDate ? `
                        <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <label class="text-sm font-medium text-yellow-800">Planned Date</label>
                            <p class="text-yellow-900">${properties.plannedDate}</p>
                        </div>
                        ` : ''}
                        
                        ${properties.postcode ? `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Location</label>
                            <p class="text-gray-900">${properties.postcode}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <button onclick="window.APP_STATE.siteFinder?.analyzeNearbyResources('${properties.name}')"
                                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            🌾 Analyze Nearby Resources
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Show Road details
     */
    showRoadDetails(properties) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    🛣️ ${properties.displayName || properties.road_name || 'Road'}
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Road Class</label>
                            <p class="text-gray-900">${properties.road_class || 'Unknown'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Surface</label>
                            <p class="text-gray-900">${properties.surface || 'Unknown'}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Access</label>
                            <p class="text-gray-900">${properties.access || 'Public'}</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <p class="text-sm text-gray-600">
                            💡 This road classification affects AD plant accessibility for feedstock delivery and maintenance.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Show Infrastructure details
     */
    showInfrastructureDetails(properties) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    ⚡ ${properties.displayName || properties.name || 'Infrastructure'}
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <label class="text-sm font-medium text-gray-700">Type</label>
                            <p class="text-gray-900">${properties.category || 'Infrastructure'}</p>
                        </div>
                        
                        ${Object.entries(properties).filter(([key, value]) => 
                            key !== 'displayName' && key !== 'name' && key !== 'category' && 
                            value && typeof value === 'string'
                        ).map(([key, value]) => `
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <label class="text-sm font-medium text-gray-700">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                                <p class="text-gray-900">${value}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <p class="text-sm text-gray-600">
                            💡 Infrastructure proximity is crucial for AD plant viability and connection costs.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Show Environmental details
     */
    showEnvironmentalDetails(properties) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3 flex items-center">
                    🌿 ${properties.displayName || properties.name || 'Environmental Area'}
                </h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="bg-green-50 p-3 rounded-lg border border-green-200">
                            <label class="text-sm font-medium text-green-800">Protection Status</label>
                            <p class="text-green-900">${properties.category || 'Protected Area'}</p>
                        </div>
                        
                        ${Object.entries(properties).filter(([key, value]) => 
                            key !== 'displayName' && key !== 'name' && key !== 'category' && 
                            value && typeof value === 'string'
                        ).map(([key, value]) => `
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <label class="text-sm font-medium text-gray-700">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                                <p class="text-gray-900">${value}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-200">
                        <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p class="text-sm text-red-800">
                                ⚠️ <strong>Planning Constraint:</strong> This environmental designation may restrict or prohibit AD plant development.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Display LAD analysis information
     */
    showLADAnalysis(ladData) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3">🗺️ LAD Analysis: ${ladData.displayName || ladData.name || 'District'}</h3>
                <div class="space-y-3">
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">District Information</h4>
                        <p><strong>Code:</strong> ${ladData.code || 'N/A'}</p>
                        <p><strong>Area:</strong> ${ladData.area || 'N/A'}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">AD Plant Summary</h4>
                        <p><strong>Total Plants:</strong> ${ladData.totalPlants || 0}</p>
                        <p><strong>Operational:</strong> ${ladData.operational || 0}</p>
                        <p><strong>Under Construction:</strong> ${ladData.underConstruction || 0}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">Capacity Analysis</h4>
                        <p><strong>Total Capacity:</strong> ${ladData.totalCapacity || 'N/A'}</p>
                        <p><strong>Average Plant Size:</strong> ${ladData.averageSize || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Display LPA analysis information
     */
    showLPAAnalysis(lpaData) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3">🏛️ LPA Analysis: ${lpaData.displayName || lpaData.name || 'Authority'}</h3>
                <div class="space-y-3">
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">Authority Information</h4>
                        <p><strong>Code:</strong> ${lpaData.code || 'N/A'}</p>
                        <p><strong>Type:</strong> Local Planning Authority</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">Planning Summary</h4>
                        <p><strong>Applications:</strong> ${lpaData.applications || 'N/A'}</p>
                        <p><strong>Approvals:</strong> ${lpaData.approvals || 'N/A'}</p>
                        <p><strong>Success Rate:</strong> ${lpaData.successRate || 'N/A'}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <h4 class="font-medium mb-2">Policy Framework</h4>
                        <p><strong>Renewable Energy Policy:</strong> ${lpaData.renewablePolicy || 'Standard'}</p>
                        <p><strong>AD Support Level:</strong> ${lpaData.adSupport || 'Moderate'}</p>
                    </div>
                </div>
            </div>
        `;
        
        this.show();
    }

    /**
     * Show default welcome message
     */
    showWelcomeMessage() {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4">
                <div class="text-center">
                    <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Welcome to UK AD Mapping</h3>
                    <p class="text-gray-600 mb-4">Use the search bar or click on map features to view detailed information.</p>
                    
                    <div class="space-y-3 text-left">
                        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">Search AD Plants</div>
                                <div class="text-sm text-gray-600">Find facilities by name, location, or technology</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">Explore Layers</div>
                                <div class="text-sm text-gray-600">Toggle different data layers from the sidebar</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">Site Finder</div>
                                <div class="text-sm text-gray-600">Use the Site Finder tool for location analysis</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                            <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span class="text-orange-600 text-lg">🤝</span>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">Collaboration</div>
                                <div class="text-sm text-gray-600">Create shared workspaces and add annotations</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Collaboration Status Display -->
                    <div id="collaboration-status" class="mt-4">
                        <!-- Status will be populated by CollaborationManager -->
                    </div>
                </div>
            </div>
        `;
        
        this.show();
        
        // Update collaboration status if available
        if (window.APP_STATE?.collaborationManager) {
            window.APP_STATE.collaborationManager.updateCollaborationStatus();
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        
        this.show();
    }

    /**
     * Display enhanced site finder results with charts and analytics
     */
    showSiteFinderResults(results) {
        if (!this.content) return;
        
        // Store the results data for back navigation
        this.lastSitesData = results;
        
        // Extract data from the SiteFinder results structure
        const sites = results.results || [];
        
        this.content.innerHTML = `
            <div class="p-4 space-y-4">
                <!-- Header with enhanced controls -->
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-800">🎯 Site Finder Results</h3>
                    <div class="flex space-x-2">
                        <button id="toggle-view" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm">
                            📊 Chart View
                        </button>
                        <button id="export-site-finder-results" class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm">
                            📥 Export
                        </button>
                    </div>
                </div>
                
                <!-- Enhanced Summary Cards -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg">
                        <div class="text-2xl font-bold">${results.suitableSites || 0}</div>
                        <div class="text-sm opacity-90">Suitable Sites</div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg">
                        <div class="text-2xl font-bold">${results.totalAnalyzed || 0}</div>
                        <div class="text-sm opacity-90">Analyzed</div>
                    </div>
                </div>
                
                <!-- Score Distribution Chart -->
                <div class="bg-white border rounded-lg p-4">
                    <h4 class="font-semibold mb-3 text-gray-700">Score Distribution</h4>
                    <div id="score-chart" class="h-32 bg-gray-50 rounded flex items-end justify-center space-x-1 p-2">
                        ${this.generateScoreChart(sites)}
                    </div>
                </div>
                
                <!-- Advanced Filters -->
                <div class="bg-gray-50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-semibold text-gray-700">Quick Filters</h4>
                        <button id="advanced-filters-btn" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            ⚙️ Advanced
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button class="filter-btn active px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700" data-filter="all">
                            All (${sites.length})
                        </button>
                        <button class="filter-btn px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300" data-filter="excellent">
                            Excellent (${sites.filter(s => s.score >= 0.8).length})
                        </button>
                        <button class="filter-btn px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300" data-filter="good">
                            Good (${sites.filter(s => s.score >= 0.6 && s.score < 0.8).length})
                        </button>
                        <button class="filter-btn px-2 py-1 bg-gray-200 text-gray-200 text-xs rounded hover:bg-gray-300" data-filter="fair">
                            Fair (${sites.filter(s => s.score < 0.6).length})
                        </button>
                    </div>
                    
                    <!-- Advanced Filters Panel (Hidden by default) -->
                    <div id="advanced-filters-panel" class="hidden mt-3 pt-3 border-t border-gray-200">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Min Area (ha)</label>
                                <input type="number" id="min-area" class="w-full px-2 py-1 border rounded text-xs" placeholder="2" min="0" max="100">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Max Area (ha)</label>
                                <input type="number" id="max-area" class="w-full px-2 py-1 border rounded text-xs" placeholder="50" min="0" max="100">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Max Road Distance (m)</label>
                                <input type="number" id="max-road-distance" class="w-full px-2 py-1 border rounded text-xs" placeholder="2000" min="100" max="10000">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Max Grid Distance (m)</label>
                                <input type="number" id="max-grid-distance" class="w-full px-2 py-1 border rounded text-xs" placeholder="15000" min="1000" max="50000">
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-3">
                            <button id="apply-advanced-filters" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                Apply Filters
                            </button>
                            <button id="save-filters" class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                💾 Save
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Site List -->
                <div class="space-y-3 max-h-80 overflow-y-auto" id="sites-container">
                    ${this.generateEnhancedSiteList(sites.slice(0, 10))}
                </div>
                
                <!-- Pagination -->
                ${sites.length > 10 ? `
                    <div class="flex justify-center items-center space-x-2 text-sm">
                        <span class="text-gray-600">Showing 1-10 of ${sites.length}</span>
                        <button class="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Next</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Show and expand the panel to display results
        this.show();
        this.expand();
        
        // Add event listeners
        this.setupSiteFinderEventListeners(sites);
        
        // Initialize charts
        this.initializeCharts(sites);
    }

    /**
     * Generate score distribution chart
     */
    generateScoreChart(sites) {
        if (!sites || sites.length === 0) return '<div class="text-gray-500 text-center">No data available</div>';
        
        const scoreRanges = [
            { min: 0.8, max: 1.0, label: 'Excellent', color: 'bg-green-500' },
            { min: 0.6, max: 0.8, label: 'Good', color: 'bg-blue-500' },
            { min: 0.4, max: 0.6, label: 'Fair', color: 'bg-yellow-500' },
            { min: 0.0, max: 0.4, label: 'Poor', color: 'bg-red-500' }
        ];
        
        const maxCount = Math.max(...scoreRanges.map(range => 
            sites.filter(s => s.score >= range.min && s.score < range.max).length
        ));
        
        return scoreRanges.map(range => {
            const count = sites.filter(s => s.score >= range.min && s.score < range.max).length;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return `
                <div class="flex flex-col items-center">
                    <div class="w-8 ${range.color} rounded-t" style="height: ${height}%"></div>
                    <div class="text-xs text-gray-600 mt-1">${count}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Generate enhanced site list with better styling
     */
    generateEnhancedSiteList(sites) {
        if (!sites || sites.length === 0) return '<div class="text-gray-500 text-center">No sites found</div>';
        
        return sites.map((site, index) => {
            const scoreClass = site.score >= 0.8 ? 'bg-green-100 text-green-800' : 
                              site.score >= 0.6 ? 'bg-blue-100 text-blue-800' : 
                              site.score >= 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800';
            
            return `
                <div class="site-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white" 
                     data-site-index="${index}" data-coordinates="${site.coordinates[0]},${site.coordinates[1]}">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-sm font-bold text-blue-600">${index + 1}</span>
                            </div>
                            <h4 class="font-semibold text-gray-800">Site ${index + 1}</h4>
                        </div>
                        <span class="text-sm px-3 py-1 rounded-full ${scoreClass} font-medium">
                            ${(site.score * 100).toFixed(1)}%
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Area:</span>
                                <span class="font-medium">${site.properties.area.toFixed(1)} ha</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Soil:</span>
                                <span class="font-medium">${site.properties.soilType}</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Land Use:</span>
                                <span class="font-medium">${site.properties.landUse}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Location:</span>
                                <span class="font-medium">${site.coordinates[0].toFixed(3)}, ${site.coordinates[1].toFixed(3)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3 pt-3 border-t border-gray-100">
                        <div class="flex justify-between items-center">
                            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium site-details-btn" data-site-index="${index}">
                                📋 View Details
                            </button>
                            <button class="text-green-600 hover:text-green-800 text-sm font-medium site-focus-btn" data-coordinates="${JSON.stringify(site.coordinates)}">
                                🗺️ Focus Map
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Setup event listeners for enhanced site finder
     */
    setupSiteFinderEventListeners(sites) {
        // Export button
        const exportBtn = this.content.querySelector('#export-site-finder-results');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSiteFinderResults());
        }
        
        // Filter buttons
        const filterBtns = this.content.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applySiteFilter(btn, sites));
        });
        
        // Toggle view button
        const toggleBtn = this.content.querySelector('#toggle-view');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSiteView());
        }
        
        // Advanced filters button
        const advancedFiltersBtn = this.content.querySelector('#advanced-filters-btn');
        if (advancedFiltersBtn) {
            advancedFiltersBtn.addEventListener('click', () => this.toggleAdvancedFilters());
        }
        
        // Apply advanced filters button
        const applyFiltersBtn = this.content.querySelector('#apply-advanced-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyAdvancedFilters(sites));
        }
        
        // Save filters button
        const saveFiltersBtn = this.content.querySelector('#save-filters');
        if (saveFiltersBtn) {
            saveFiltersBtn.addEventListener('click', () => this.saveCurrentFilters());
        }
        
        // Attach event listeners to site cards
        this.attachSiteCardEventListeners(sites);
    }

    /**
     * Attach event listeners to site cards
     */
    attachSiteCardEventListeners(sites) {
        // Site card clicks
        const siteCards = this.content.querySelectorAll('.site-card');
        siteCards.forEach(card => {
            card.addEventListener('click', () => {
                const coordinates = card.dataset.coordinates.split(',').map(Number);
                this.focusOnSite(coordinates);
            });
        });
        
        // Site details buttons
        const detailsBtns = this.content.querySelectorAll('.site-details-btn');
        detailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const siteIndex = parseInt(btn.dataset.siteIndex);
                const site = sites[siteIndex];
                if (site) {
                    this.showSiteDetails(site);
                }
            });
        });
        
        // Site focus buttons
        const focusBtns = this.content.querySelectorAll('.site-focus-btn');
        focusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    const coordinates = JSON.parse(btn.dataset.coordinates);
                    this.focusOnSite(coordinates);
                } catch (error) {
                    console.error('❌ Error parsing coordinates:', error);
                }
            });
        });
    }

    /**
     * Toggle between different site view modes
     */
    toggleSiteView() {
        const toggleBtn = this.content.querySelector('#toggle-view');
        const sitesContainer = this.content.querySelector('#sites-container');
        
        if (toggleBtn && sitesContainer) {
            const currentView = toggleBtn.textContent;
            
            if (currentView.includes('Chart')) {
                // Switch to table view
                toggleBtn.textContent = '📋 Table View';
                this.showTableView();
            } else {
                // Switch to chart view
                toggleBtn.textContent = '📊 Chart View';
                this.showChartView();
            }
        }
    }
    
    /**
     * Show table view of sites
     */
    showTableView() {
        // Implementation for table view
        console.log('📋 Switching to table view');
    }
    
    /**
     * Show chart view of sites
     */
    showChartView() {
        // Implementation for chart view
        console.log('📊 Switching to chart view');
    }

    /**
     * Apply site filtering
     */
    applySiteFilter(clickedBtn, sites) {
        // Update active button
        this.content.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        clickedBtn.classList.remove('bg-gray-200', 'text-gray-700');
        clickedBtn.classList.add('active', 'bg-blue-600', 'text-white');
        
        // Apply filter
        const filter = clickedBtn.dataset.filter;
        let filteredSites = sites;
        
        switch (filter) {
            case 'excellent':
                filteredSites = sites.filter(s => s.score >= 0.8);
                break;
            case 'good':
                filteredSites = sites.filter(s => s.score >= 0.6 && s.score < 0.8);
                break;
            case 'fair':
                filteredSites = sites.filter(s => s.score < 0.6);
                break;
            default:
                filteredSites = sites;
        }
        
        // Update site list
        const sitesContainer = this.content.querySelector('#sites-container');
        if (sitesContainer) {
            sitesContainer.innerHTML = this.generateEnhancedSiteList(filteredSites.slice(0, 10));
        }
    }

    /**
     * Toggle between chart and list view
     */
    toggleSiteView() {
        const toggleBtn = this.content.querySelector('#toggle-view');
        const scoreChart = this.content.querySelector('#score-chart');
        
        if (toggleBtn.textContent.includes('Chart')) {
            toggleBtn.textContent = '📋 List View';
            scoreChart.style.display = 'none';
        } else {
            toggleBtn.textContent = '📊 Chart View';
            scoreChart.style.display = 'block';
        }
    }

    /**
     * Initialize charts and visualizations
     */
    initializeCharts(sites) {
        // Additional chart initialization can go here
        console.log('📊 Charts initialized for', sites.length, 'sites');
    }

    /**
     * Show custom content in the info panel
     */
    showCustomContent(content, title = 'Custom Content') {
        if (!this.content) return;
        
        this.content.innerHTML = content;
        this.show();
        this.expand();
        
        console.log('📋 Custom content displayed:', title);
    }

    /**
     * Show site details in info panel
     */
    showSiteDetails(site) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4 space-y-4">
                <div class="text-center border-b pb-4">
                    <h2 class="text-xl font-bold text-gray-800">${site.name || 'Site Details'}</h2>
                    <p class="text-gray-600 mt-2">Site Information</p>
                </div>
                
                <div class="space-y-3">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">📍 Location</h3>
                        <p class="text-sm text-gray-600">Coordinates: ${site.coordinates?.[0]?.toFixed(4)}, ${site.coordinates?.[1]?.toFixed(4)}</p>
                        <p class="text-sm text-gray-600">Region: ${site.region || 'N/A'}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">📊 Score & Performance</h3>
                        <p class="text-sm text-gray-600">Suitability: ${((site.score || 0) * 100).toFixed(1)}%</p>
                        <p class="text-sm text-gray-600">Capacity: ${site.capacity || 'N/A'}</p>
                        <p class="text-sm text-gray-600">Technology: ${site.technology || 'N/A'}</p>
                        <p class="text-sm text-gray-600">Status: ${site.status || 'N/A'}</p>
                    </div>
                    
                    ${site.properties ? `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <h3 class="font-semibold text-gray-700 mb-2">🏗️ Properties</h3>
                            <div class="space-y-1 text-sm text-gray-600">
                                ${site.properties.area ? `<p>Area: ${site.properties.area.toFixed(1)} ha</p>` : ''}
                                ${site.properties.soilType ? `<p>Soil Type: ${site.properties.soilType}</p>` : ''}
                                ${site.properties.landUse ? `<p>Land Use: ${site.properties.landUse}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">🔍 Analysis</h3>
                        <p class="text-sm text-gray-600">Constraints: ${site.constraints?.length || 0} applied</p>
                        <p class="text-sm text-gray-600">Distance to Infrastructure: ${site.distanceToInfrastructure?.toFixed(2) || 'N/A'} km</p>
                        <p class="text-sm text-gray-600">Environmental Impact: ${site.environmentalImpact || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="flex justify-center space-x-3 pt-4">
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus-map-btn" data-coordinates="${site.coordinates?.[0]},${site.coordinates?.[1]}">
                        🗺️ Focus on Map
                    </button>
                    <button class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 back-to-sites-btn">
                        ← Back to Sites List
                    </button>
                </div>
            </div>
        `;
        
        this.show();
        this.expand();
        
        // Set up event listeners for the new buttons
        this.setupSiteDetailsEventListeners();
        
        console.log('📋 Site details displayed:', site);
    }

    /**
     * Set up event listeners for site details view
     */
    setupSiteDetailsEventListeners() {
        // Focus on map button
        const focusMapBtn = this.content.querySelector('.focus-map-btn');
        if (focusMapBtn) {
            focusMapBtn.addEventListener('click', () => {
                const coordinates = focusMapBtn.dataset.coordinates.split(',').map(Number);
                this.focusOnSite(coordinates);
            });
        }
        
        // Back to sites list button
        const backBtn = this.content.querySelector('.back-to-sites-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Go back to the sites list view
                this.goBackToSitesList();
            });
        }
    }
    
    /**
     * Go back to sites list from site details
     */
    goBackToSitesList() {
        // Check if we have stored sites data to go back to
        if (this.lastSitesData) {
            this.showSiteFinderResults(this.lastSitesData);
        } else {
            // If no stored data, show a message
            this.showError('No previous sites list available. Please run Site Finder again.');
        }
    }

    /**
     * Focus map on specific site
     */
    focusOnSite(coordinates) {
        try {
            if (window.APP_STATE && window.APP_STATE.mapManager && window.APP_STATE.mapManager.map) {
                const map = window.APP_STATE.mapManager.map;
                
                if (Array.isArray(coordinates) && coordinates.length === 2) {
                    const [lng, lat] = coordinates;
                    
                    if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
                        map.flyTo({
                            center: coordinates,
                            zoom: 14,
                            duration: 2000,
                            essential: true
                        });
                        
                        // Add temporary marker
                        this.addTemporaryMarker(coordinates);
                        
                        console.log('🗺️ Map focused on site:', coordinates);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error focusing on site:', error);
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div class="text-sm text-gray-600">${message}</div>
            </div>
        `;
        
        this.show();
        this.expand();
    }

    /**
     * Show error message
     */
    showError(message) {
        if (!this.content) return;
        
        this.content.innerHTML = `
            <div class="p-4 text-red-600">
                <h3 class="font-bold mb-2">Error</h3>
                <p>${message}</p>
                <button onclick="this.closest('#info-panel').classList.add('hidden')" 
                        class="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    Close
                </button>
            </div>
        `;
        
        this.show();
    }

    /**
     * Get status color class
     */
    getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'operational':
                return 'bg-green-100 text-green-800';
            case 'planning':
                return 'bg-yellow-100 text-yellow-800';
            case 'construction':
                return 'bg-blue-100 text-blue-800';
            case 'decommissioned':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Get type color class
     */
    getTypeColor(type) {
        switch (type?.toLowerCase()) {
            case 'commercial':
                return 'bg-blue-100 text-blue-800';
            case 'municipal':
                return 'bg-purple-100 text-purple-800';
            case 'agricultural':
                return 'bg-green-100 text-green-800';
            case 'industrial':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Focus map on specific coordinates
     */
    focusOnMap(coordinates) {
        try {
            if (window.APP_STATE && window.APP_STATE.mapManager && window.APP_STATE.mapManager.map && coordinates) {
                const map = window.APP_STATE.mapManager.map;
                
                // Check if coordinates are valid
                if (Array.isArray(coordinates) && coordinates.length === 2) {
                    const [lng, lat] = coordinates;
                    
                    // Validate coordinates
                    if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
                        // Smooth fly to location with animation
                        map.flyTo({
                            center: coordinates,
                            zoom: 14,
                            duration: 2000,
                            essential: true
                        });
                        
                        // Add a temporary marker
                        this.addTemporaryMarker(coordinates);
                        
                        console.log(`✅ Focused map on coordinates: ${coordinates}`);
                    } else {
                        console.warn('⚠️ Invalid coordinates:', coordinates);
                    }
                } else {
                    console.warn('⚠️ Missing or invalid coordinates:', coordinates);
                }
            } else {
                console.warn('⚠️ MapManager not available');
            }
        } catch (error) {
            console.error('❌ Error focusing on map:', error);
        }
    }

    /**
     * Add temporary marker on map
     */
    addTemporaryMarker(coordinates) {
        try {
            if (window.APP_STATE && window.APP_STATE.mapManager && window.APP_STATE.mapManager.map) {
                const map = window.APP_STATE.mapManager.map;
                
                // Remove existing temporary marker
                if (this.tempMarker) {
                    if (map.getLayer('info-panel-marker-layer')) {
                        map.removeLayer('info-panel-marker-layer');
                    }
                    if (map.getSource('info-panel-marker-source')) {
                        map.removeSource('info-panel-marker-source');
                    }
                }
                
                // Add new temporary marker
                const markerData = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        properties: {
                            name: 'Info Panel Location'
                        }
                    }]
                };
                
                map.addSource('info-panel-marker-source', {
                    type: 'geojson',
                    data: markerData
                });
                
                map.addLayer({
                    id: 'info-panel-marker-layer',
                    type: 'circle',
                    source: 'info-panel-marker-source',
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#10b981',
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 3
                    }
                });
                
                this.tempMarker = 'info-panel-marker-layer';
                
                // Remove marker after 15 seconds
                setTimeout(() => {
                    if (this.tempMarker && map.getLayer('info-panel-marker-layer')) {
                        map.removeLayer('info-panel-marker-layer');
                        map.removeSource('info-panel-marker-source');
                        this.tempMarker = null;
                    }
                }, 15000);
                
                console.log('📍 Added temporary marker for info panel location');
            } else {
                console.warn('⚠️ MapManager not available');
            }
        } catch (error) {
            console.error('❌ Error adding temporary marker:', error);
        }
    }

    /**
     * Export site finder results
     */
    exportSiteFinderResults() {
        try {
            const siteFinder = window.APP_STATE.siteFinder;
            if (!siteFinder) {
                throw new Error('Site Finder not available');
            }
            
            const csvData = siteFinder.exportResults('csv');
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `site-finder-results-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError(`Export failed: ${error.message}`);
        }
    }
    
    /**
     * Toggle advanced filters panel
     */
    toggleAdvancedFilters() {
        const panel = this.content.querySelector('#advanced-filters-panel');
        const btn = this.content.querySelector('#advanced-filters-btn');
        
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            btn.textContent = '⚙️ Hide';
        } else {
            panel.classList.add('hidden');
            btn.textContent = '⚙️ Advanced';
        }
    }
    
    /**
     * Apply advanced filters to site results
     */
    applyAdvancedFilters(sites) {
        try {
            const minArea = parseFloat(this.content.querySelector('#min-area').value) || 0;
            const maxArea = parseFloat(this.content.querySelector('#max-area').value) || 100;
            const maxRoadDistance = parseFloat(this.content.querySelector('#max-road-distance').value) || 10000;
            const maxGridDistance = parseFloat(this.content.querySelector('#max-grid-distance').value) || 50000;
            
            // Apply filters
            const filteredSites = sites.filter(site => {
                const props = site.properties;
                return props.area >= minArea && 
                       props.area <= maxArea && 
                       props.roadDistance <= maxRoadDistance && 
                       props.gridDistance <= maxGridDistance;
            });
            
            // Update the display
            this.updateFilteredResults(filteredSites);
            
            console.log(`✅ Applied advanced filters: ${filteredSites.length} sites remain`);
            
        } catch (error) {
            console.error('❌ Advanced filter error:', error);
            alert('Filter application failed: ' + error.message);
        }
    }
    
    /**
     * Update filtered results display
     */
    updateFilteredResults(filteredSites) {
        const sitesContainer = this.content.querySelector('#sites-container');
        if (sitesContainer) {
            sitesContainer.innerHTML = this.generateEnhancedSiteList(filteredSites);
        }
        
        // Update filter counts
        const allBtn = this.content.querySelector('[data-filter="all"]');
        if (allBtn) {
            allBtn.textContent = `All (${filteredSites.length})`;
        }
        
        // Re-attach event listeners to the new filtered site cards
        this.attachSiteCardEventListeners(filteredSites);
    }
    
    /**
     * Show detailed information for a specific site
     */
    showSiteDetails(site) {
        try {
            // Create a detailed site information modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">📋 Site Details</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-blue-800 mb-2">📍 Location</h4>
                                <p class="text-sm text-blue-700">
                                    <strong>Coordinates:</strong> ${site.coordinates[0].toFixed(6)}, ${site.coordinates[1].toFixed(6)}<br>
                                    <strong>Area:</strong> ${site.properties.area.toFixed(1)} hectares<br>
                                    <strong>Land Use:</strong> ${site.properties.landUse}<br>
                                    <strong>Soil Type:</strong> ${site.properties.soilType}
                                </p>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-green-800 mb-2">🏆 Suitability Score</h4>
                                <p class="text-2xl font-bold text-green-600">${(site.score * 100).toFixed(1)}%</p>
                                <p class="text-sm text-green-700">
                                    <strong>Rank:</strong> ${site.rank || 'N/A'}<br>
                                    <strong>Environmental:</strong> ${site.scores?.environmental?.toFixed(2) || 'N/A'}<br>
                                    <strong>Infrastructure:</strong> ${site.scores?.infrastructure?.toFixed(2) || 'N/A'}<br>
                                    <strong>Economic:</strong> ${site.scores?.economic?.toFixed(2) || 'N/A'}<br>
                                    <strong>Social:</strong> ${site.scores?.social?.toFixed(2) || 'N/A'}
                                </p>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="bg-yellow-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-yellow-800 mb-2">🌍 Environmental</h4>
                                <p class="text-sm text-yellow-700">
                                    <strong>Elevation:</strong> ${site.properties.elevation?.toFixed(0) || 'N/A'}m<br>
                                    <strong>Slope:</strong> ${site.properties.slope?.toFixed(1) || 'N/A'}°<br>
                                    <strong>Flood Risk:</strong> ${site.properties.floodRisk || 'N/A'}/10<br>
                                    <strong>Biodiversity:</strong> ${site.properties.biodiversity || 'N/A'}/10<br>
                                    <strong>Water Availability:</strong> ${site.properties.waterAvailability || 'N/A'}/10
                                </p>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-purple-800 mb-2">🏗️ Infrastructure</h4>
                                <p class="text-sm text-purple-700">
                                    <strong>Road Distance:</strong> ${site.properties.roadDistance?.toFixed(0) || 'N/A'}m<br>
                                    <strong>Grid Distance:</strong> ${site.properties.gridDistance?.toFixed(0) || 'N/A'}m<br>
                                    <strong>Gas Distance:</strong> ${site.properties.gasDistance?.toFixed(0) || 'N/A'}m<br>
                                    <strong>Residential Distance:</strong> ${site.properties.residentialDistance?.toFixed(0) || 'N/A'}m
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-3">
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                            Close
                        </button>
                        <button onclick="this.closest('.fixed').remove(); window.APP_STATE?.infoPanel?.focusOnSite(${JSON.stringify(site.coordinates)})" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            🗺️ Focus on Map
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            console.log('✅ Site details modal displayed for:', site.id);
            
        } catch (error) {
            console.error('❌ Error showing site details:', error);
            alert('Failed to show site details: ' + error.message);
        }
    }
    
    /**
     * Focus the map on a specific site location
     */
    focusOnSite(coordinates) {
        try {
            if (window.APP_STATE && window.APP_STATE.mapManager && window.APP_STATE.mapManager.map) {
                const map = window.APP_STATE.mapManager.map;
                
                // Fly to the site location with animation
                map.flyTo({
                    center: coordinates,
                    zoom: 14,
                    duration: 2000,
                    essential: true
                });
                
                // Add a temporary marker at the site location
                this.addTemporaryMarker(coordinates);
                
                console.log('✅ Map focused on site at:', coordinates);
                
            } else {
                console.warn('⚠️ MapManager not available');
                alert('Map not available. Please ensure the map is loaded.');
            }
        } catch (error) {
            console.error('❌ Error focusing on site:', error);
            alert('Failed to focus on site: ' + error.message);
        }
    }

    /**
     * Save current filter configuration
     */
    saveCurrentFilters() {
        try {
            const filterName = prompt('Enter a name for this filter configuration:');
            if (!filterName) return;
            
            const filterConfig = {
                minArea: parseFloat(this.content.querySelector('#min-area').value) || 0,
                maxArea: parseFloat(this.content.querySelector('#max-area').value) || 100,
                maxRoadDistance: parseFloat(this.content.querySelector('#max-road-distance').value) || 10000,
                maxGridDistance: parseFloat(this.content.querySelector('#max-grid-distance').value) || 50000
            };
            
            // Save to SiteFinder if available
            if (window.APP_STATE?.siteFinder) {
                window.APP_STATE.siteFinder.saveFilter(filterName, filterConfig);
                alert(`Filter "${filterName}" saved successfully!`);
            } else {
                // Fallback to localStorage
                const savedFilters = JSON.parse(localStorage.getItem('siteFinder_savedFilters') || '{}');
                savedFilters[filterName] = {
                    ...filterConfig,
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('siteFinder_savedFilters', JSON.stringify(savedFilters));
                alert(`Filter "${filterName}" saved successfully!`);
            }
            
        } catch (error) {
            console.error('❌ Save filter error:', error);
            alert('Failed to save filter: ' + error.message);
        }
    }
}
