/**
 * Enhanced SearchManager - Advanced search functionality with fuzzy search, 
 * keyboard navigation, search history, and enhanced user experience
 * Features: Fuse.js fuzzy search, real-time results, advanced filtering, export capabilities
 */
export class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.fuse = null;
        this.searchData = [];
        this.currentResults = [];
        this.selectedIndex = -1;
        this.isSearching = false;
        this.searchHistory = [];
        this.maxHistoryItems = 15;
        this.savedSearches = [];
        this.maxSavedSearches = 10;
        this.filters = {
            status: [],
            type: [],
            capacity: [],
            region: [],
            technology: [],
            commissioningDate: []
        };
        this.sortBy = 'relevance'; // relevance, name, location, capacity, date
        this.advancedSearchMode = false;
        this.naturalLanguageProcessor = null;
    }

    /**
     * Initialize the enhanced search manager
     */
    initialize() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        
        if (!this.searchInput || !this.searchResults) {
            console.error('❌ Search elements not found');
            return;
        }

        this.initializeSearchData();
        this.setupFuseSearch();
        this.setupNaturalLanguageProcessor();
        this.setupEventListeners();
        this.loadSearchHistory();
        this.loadSavedSearches();
        this.setupAdvancedFilters();
        this.setupAdvancedSearchUI();
        
        console.log('🔍 Enhanced Search Manager initialized with advanced features');
    }

    /**
     * Initialize comprehensive search data with UK AD plants
     */
    initializeSearchData() {
        this.searchData = [
            {
                id: 1,
                name: 'Newcastle Bioenergy Centre',
                location: 'Newcastle upon Tyne, Tyne and Wear',
                status: 'Operational',
                capacity: '50,000 tonnes/year',
                type: 'Food Waste',
                developer: 'Newcastle City Council',
                coordinates: [-1.6178, 54.9783],
                region: 'North East',
                commissioningDate: '2020-03-15',
                technology: 'Mesophilic AD',
                feedstock: 'Food waste, garden waste',
                energyOutput: '2.5 MW',
                carbonSavings: '15,000 tonnes CO2/year'
            },
            {
                id: 2,
                name: 'Bristol Anaerobic Digestion Plant',
                location: 'Bristol, South Gloucestershire',
                status: 'Under Construction',
                capacity: '75,000 tonnes/year',
                type: 'Mixed Waste',
                developer: 'Bristol Waste Company',
                coordinates: [-2.5879, 51.4545],
                region: 'South West',
                commissioningDate: '2024-06-30',
                technology: 'Thermophilic AD',
                feedstock: 'Mixed waste, food waste',
                energyOutput: '3.8 MW',
                carbonSavings: '22,500 tonnes CO2/year'
            },
            {
                id: 3,
                name: 'Leeds Biogas Facility',
                location: 'Leeds, West Yorkshire',
                status: 'Operational',
                capacity: '60,000 tonnes/year',
                type: 'Agricultural Waste',
                developer: 'Leeds City Council',
                coordinates: [-1.5491, 53.8008],
                region: 'Yorkshire and Humber',
                commissioningDate: '2019-11-20',
                technology: 'Mesophilic AD',
                feedstock: 'Agricultural waste, manure',
                energyOutput: '3.0 MW',
                carbonSavings: '18,000 tonnes CO2/year'
            },
            {
                id: 4,
                name: 'Manchester Green Energy Plant',
                location: 'Manchester, Greater Manchester',
                status: 'Planning',
                capacity: '100,000 tonnes/year',
                type: 'Food & Garden Waste',
                developer: 'Manchester City Council',
                coordinates: [-2.2426, 53.4808],
                region: 'North West',
                commissioningDate: '2025-12-31',
                technology: 'Advanced AD',
                feedstock: 'Food waste, garden waste, commercial waste',
                energyOutput: '5.2 MW',
                carbonSavings: '30,000 tonnes CO2/year'
            },
            {
                id: 5,
                name: 'Birmingham Waste to Energy',
                location: 'Birmingham, West Midlands',
                status: 'Operational',
                capacity: '80,000 tonnes/year',
                type: 'Mixed Waste',
                developer: 'Birmingham City Council',
                coordinates: [-1.8904, 52.4862],
                region: 'West Midlands',
                commissioningDate: '2021-08-10',
                technology: 'Mesophilic AD',
                feedstock: 'Mixed waste, food waste',
                energyOutput: '4.0 MW',
                carbonSavings: '24,000 tonnes CO2/year'
            }
        ];
        
        console.log('📊 Loaded', this.searchData.length, 'comprehensive searchable items');
    }

    /**
     * Set up advanced Fuse.js configuration
     */
    setupFuseSearch() {
        try {
            this.fuse = new Fuse(this.searchData, {
                keys: [
                    { name: 'name', weight: 0.8 },
                    { name: 'location', weight: 0.6 },
                    { name: 'developer', weight: 0.4 },
                    { name: 'type', weight: 0.3 },
                    { name: 'region', weight: 0.2 },
                    { name: 'technology', weight: 0.2 }
                ],
                includeScore: true,
                includeMatches: true,
                threshold: 0.2,
                minMatchCharLength: 2,
                distance: 100,
                ignoreLocation: true
            });
            
                    console.log('🔍 Advanced Fuse.js configured with enhanced options');
    } catch (error) {
        console.warn('⚠️ Fuse.js not available, using enhanced fallback search');
        this.fuse = null;
    }
}

    /**
     * Set up natural language processor for advanced search queries
     */
    setupNaturalLanguageProcessor() {
        this.naturalLanguageProcessor = {
            // Parse natural language queries like "Find operational plants near Manchester with capacity over 50,000 tonnes"
            parseQuery: (query) => {
                const parsed = {
                    keywords: [],
                    filters: {},
                    location: null,
                    range: null
                };
                
                const lowerQuery = query.toLowerCase();
                
                // Extract location patterns
                const locationPatterns = [
                    /near\s+([a-zA-Z\s]+)/,
                    /in\s+([a-zA-Z\s]+)/,
                    /around\s+([a-zA-Z\s]+)/,
                    /close\s+to\s+([a-zA-Z\s]+)/
                ];
                
                for (const pattern of locationPatterns) {
                    const match = lowerQuery.match(pattern);
                    if (match) {
                        parsed.location = match[1].trim();
                        break;
                    }
                }
                
                // Extract capacity patterns
                const capacityPatterns = [
                    /over\s+([0-9,]+)\s*tonnes?/,
                    /under\s+([0-9,]+)\s*tonnes?/,
                    /more\s+than\s+([0-9,]+)\s*tonnes?/,
                    /less\s+than\s+([0-9,]+)\s*tonnes?/
                ];
                
                for (const pattern of capacityPatterns) {
                    const match = lowerQuery.match(pattern);
                    if (match) {
                        const value = parseInt(match[1].replace(/,/g, ''));
                        if (lowerQuery.includes('over') || lowerQuery.includes('more than')) {
                            parsed.range = { type: 'min', value };
                        } else {
                            parsed.range = { type: 'max', value };
                        }
                        break;
                    }
                }
                
                // Extract status patterns
                const statusPatterns = ['operational', 'planning', 'construction', 'decommissioned'];
                for (const status of statusPatterns) {
                    if (lowerQuery.includes(status)) {
                        parsed.filters.status = [status];
                        break;
                    }
                }
                
                // Extract type patterns
                const typePatterns = ['food waste', 'agricultural', 'mixed waste', 'garden waste'];
                for (const type of typePatterns) {
                    if (lowerQuery.includes(type)) {
                        parsed.filters.type = [type];
                        break;
                    }
                }
                
                // Extract remaining keywords
                const stopWords = ['find', 'plants', 'near', 'in', 'around', 'close', 'to', 'with', 'over', 'under', 'more', 'than', 'less', 'tonnes', 'operational', 'planning', 'construction', 'decommissioned', 'food', 'waste', 'agricultural', 'mixed', 'garden'];
                const words = query.toLowerCase().split(/\s+/);
                parsed.keywords = words.filter(word => !stopWords.includes(word) && word.length > 2);
                
                return parsed;
            },
            
            // Generate search suggestions based on parsed query
            generateSuggestions: (parsed) => {
                const suggestions = [];
                
                if (parsed.location) {
                    suggestions.push(`📍 Location: ${parsed.location}`);
                }
                
                if (parsed.range) {
                    const rangeText = parsed.range.type === 'min' ? 'over' : 'under';
                    suggestions.push(`⚖️ Capacity: ${rangeText} ${parsed.range.value.toLocaleString()} tonnes`);
                }
                
                if (parsed.filters.status) {
                    suggestions.push(`🔄 Status: ${parsed.filters.status.join(', ')}`);
                }
                
                if (parsed.filters.type) {
                    suggestions.push(`🗑️ Type: ${parsed.filters.type.join(', ')}`);
                }
                
                return suggestions;
            }
        };
        
        console.log('🧠 Natural language processor initialized');
    }

    /**
     * Set up advanced search UI with filters and saved searches
     */
    setupAdvancedSearchUI() {
        const searchContainer = this.searchInput.closest('.p-4');
        if (!searchContainer) return;
        
        // Add advanced search toggle
        const advancedToggle = document.createElement('button');
        advancedToggle.id = 'advanced-search-toggle';
        advancedToggle.className = 'ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all duration-200';
        advancedToggle.innerHTML = '🔧 Advanced';
        advancedToggle.onclick = () => this.toggleAdvancedSearch();
        
        // Insert after search input
        this.searchInput.parentNode.appendChild(advancedToggle);
        
        // Create advanced search panel
        const advancedPanel = document.createElement('div');
        advancedPanel.id = 'advanced-search-panel';
        advancedPanel.className = 'mt-3 p-3 bg-gray-50 rounded-lg hidden';
        advancedPanel.innerHTML = this.generateAdvancedSearchHTML();
        
        // Insert after search container
        searchContainer.appendChild(advancedPanel);
        
        // Add saved searches button
        const savedSearchesBtn = document.createElement('button');
        savedSearchesBtn.id = 'saved-searches-btn';
        savedSearchesBtn.className = 'ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all duration-200';
        savedSearchesBtn.innerHTML = '💾 Saved';
        savedSearchesBtn.onclick = () => this.showSavedSearches();
        
        this.searchInput.parentNode.appendChild(savedSearchesBtn);
        
        console.log('🔧 Advanced search UI initialized');
    }

    /**
     * Toggle advanced search panel
     */
    toggleAdvancedSearch() {
        const panel = document.getElementById('advanced-search-panel');
        const toggle = document.getElementById('advanced-search-toggle');
        
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            toggle.innerHTML = '🔧 Hide Advanced';
            toggle.classList.add('bg-blue-100', 'text-blue-700');
            this.advancedSearchMode = true;
        } else {
            panel.classList.add('hidden');
            toggle.innerHTML = '🔧 Advanced';
            toggle.classList.remove('bg-blue-100', 'text-blue-700');
            this.advancedSearchMode = false;
        }
    }

    /**
     * Show saved searches panel
     */
    showSavedSearches() {
        if (this.savedSearches.length === 0) {
            alert('No saved searches yet. Use the "Save Search" button to save your current search criteria.');
            return;
        }
        
        const savedSearchesHTML = this.savedSearches.map((search, index) => `
            <div class="saved-search-item p-2 border rounded hover:bg-gray-50 cursor-pointer" onclick="this.loadSavedSearch(${index})">
                <div class="font-medium text-sm">${search.name}</div>
                <div class="text-xs text-gray-600">${search.query}</div>
                <div class="text-xs text-gray-500">${new Date(search.date).toLocaleDateString()}</div>
            </div>
        `).join('');
        
        // Create modal or overlay to show saved searches
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">Saved Searches</h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    ${savedSearchesHTML}
                </div>
                <button class="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onclick="this.parentElement.parentElement.remove()">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Load a saved search
     */
    loadSavedSearch(index) {
        const savedSearch = this.savedSearches[index];
        if (!savedSearch) return;
        
        // Apply saved search criteria
        this.filters = { ...savedSearch.filters };
        this.sortBy = savedSearch.sortBy;
        this.searchInput.value = savedSearch.query;
        
        // Update UI
        this.updateAdvancedSearchUI();
        
        // Perform search
        this.handleSearchInput(savedSearch.query);
        
        // Close modal
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
        
        console.log('💾 Loaded saved search:', savedSearch.name);
    }

    /**
     * Update advanced search UI with current filter values
     */
    updateAdvancedSearchUI() {
        // Update status filters
        document.querySelectorAll('.status-filter').forEach(checkbox => {
            checkbox.checked = this.filters.status.includes(checkbox.value);
        });
        
        // Update type filters
        document.querySelectorAll('.type-filter').forEach(checkbox => {
            checkbox.checked = this.filters.type.includes(checkbox.value);
        });
        
        // Update region filter
        const regionSelect = document.getElementById('region-filter');
        if (regionSelect) {
            regionSelect.value = this.filters.region[0] || '';
        }
        
        // Update sort options
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) {
            sortSelect.value = this.sortBy;
        }
    }

    /**
     * Save current search criteria
     */
    saveCurrentSearch() {
        const searchName = prompt('Enter a name for this search:');
        if (!searchName) return;
        
        const savedSearch = {
            name: searchName,
            query: this.searchInput.value,
            filters: { ...this.filters },
            sortBy: this.sortBy,
            date: new Date().toISOString()
        };
        
        this.savedSearches.unshift(savedSearch);
        if (this.savedSearches.length > this.maxSavedSearches) {
            this.savedSearches.pop();
        }
        
        this.saveSavedSearches();
        console.log('💾 Search saved:', searchName);
        
        // Show confirmation
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = `Search "${searchName}" saved successfully!`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * Load saved searches from localStorage
     */
    loadSavedSearches() {
        try {
            const saved = localStorage.getItem('uk-ad-saved-searches');
            if (saved) {
                this.savedSearches = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ Could not load saved searches:', error);
        }
    }

    /**
     * Save searches to localStorage
     */
    saveSavedSearches() {
        try {
            localStorage.setItem('uk-ad-saved-searches', JSON.stringify(this.savedSearches));
        } catch (error) {
            console.warn('⚠️ Could not save searches:', error);
        }
    }

    /**
     * Generate HTML for advanced search panel
     */
    generateAdvancedSearchHTML() {
        return `
            <div class="space-y-3">
                <h4 class="font-medium text-gray-700">Advanced Filters</h4>
                
                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <div class="flex flex-wrap gap-2">
                        ${['Operational', 'Planning', 'Construction', 'Decommissioned'].map(status => `
                            <label class="flex items-center">
                                <input type="checkbox" class="status-filter mr-1" value="${status.toLowerCase()}" 
                                       ${this.filters.status.includes(status.toLowerCase()) ? 'checked' : ''}>
                                <span class="text-sm text-gray-700">${status}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Type Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <div class="flex flex-wrap gap-2">
                        ${['Food Waste', 'Agricultural', 'Mixed Waste', 'Garden Waste'].map(type => `
                            <label class="flex items-center">
                                <input type="checkbox" class="type-filter mr-1" value="${type.toLowerCase()}" 
                                       ${this.filters.type.includes(type.toLowerCase()) ? 'checked' : ''}>
                                <span class="text-sm text-gray-700">${type}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Capacity Range -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Capacity Range (tonnes/year)</label>
                    <div class="flex space-x-2">
                        <input type="number" id="min-capacity" placeholder="Min" class="w-20 px-2 py-1 text-sm border rounded">
                        <span class="text-gray-500">to</span>
                        <input type="number" id="max-capacity" placeholder="Max" class="w-20 px-2 py-1 text-sm border rounded">
                    </div>
                </div>
                
                <!-- Region Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Region</label>
                    <select id="region-filter" class="w-full px-2 py-1 text-sm border rounded">
                        <option value="">All Regions</option>
                        ${['North East', 'North West', 'Yorkshire and Humber', 'West Midlands', 'East Midlands', 'South West', 'South East', 'London', 'East of England'].map(region => 
                            `<option value="${region}" ${this.filters.region.includes(region) ? 'selected' : ''}>${region}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <!-- Sort Options -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Sort By</label>
                    <select id="sort-options" class="w-full px-2 py-1 text-sm border rounded">
                        <option value="relevance" ${this.sortBy === 'relevance' ? 'selected' : ''}>Relevance</option>
                        <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name</option>
                        <option value="location" ${this.sortBy === 'location' ? 'selected' : ''}>Location</option>
                        <option value="capacity" ${this.sortBy === 'capacity' ? 'selected' : ''}>Capacity</option>
                        <option value="date" ${this.sortBy === 'date' ? 'selected' : ''}>Commissioning Date</option>
                    </select>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex space-x-2 pt-2">
                    <button id="apply-filters" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all duration-200">
                        Apply Filters
                    </button>
                    <button id="clear-filters" class="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-all duration-200">
                        Clear All
                    </button>
                    <button id="save-search" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-all duration-200">
                        Save Search
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Set up comprehensive event listeners
     */
    setupEventListeners() {
        // Real-time search input with debouncing
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearchInput(e.target.value);
            }, 300);
        });

        // Focus events
        this.searchInput.addEventListener('focus', () => {
            if (this.searchHistory.length > 0) {
                this.showSearchHistory();
            }
        });

        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSearchResults(), 300);
        });

        // Enhanced keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Search results click handling
        this.searchResults.addEventListener('click', (e) => {
            this.handleResultClick(e);
        });

        // Advanced filter changes
        this.setupFilterEventListeners();
        
        console.log('🎯 Comprehensive event listeners configured');
    }

    /**
     * Set up advanced filter event listeners
     */
    setupFilterEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = Array.from(statusFilter.selectedOptions).map(opt => opt.value);
                this.applyFiltersAndSearch();
            });
        }

        // Type filter
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.filters.type = Array.from(typeFilter.selectedOptions).map(opt => opt.value);
                this.applyFiltersAndSearch();
            });
        }

        // Sort by
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.sortBy = sortFilter.value;
                this.applyFiltersAndSearch();
            });
        }
    }

    /**
     * Set up advanced filter UI elements with responsive design
     */
    setupAdvancedFilters() {
        // Create filter container if it doesn't exist
        let filterContainer = document.getElementById('search-filters');
        if (!filterContainer) {
            filterContainer = document.createElement('div');
            filterContainer.id = 'search-filters';
            filterContainer.className = 'search-filters bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm';
            
            // Insert after search input
            this.searchInput.parentNode.insertBefore(filterContainer, this.searchInput.nextSibling);
        }

        // Create responsive filter HTML with 2-column layout
        filterContainer.innerHTML = `
            <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-3">
                <!-- First Row: Status and Type -->
                <div class="w-full">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select id="status-filter" class="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                        <option value="">All Statuses</option>
                        <option value="Operational">Operational</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Planning">Planning</option>
                        <option value="Decommissioned">Decommissioned</option>
                        <option value="Proposed">Proposed</option>
                    </select>
                </div>
                <div class="w-full">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select id="type-filter" class="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                        <option value="">All Types</option>
                        <option value="Food Waste">Food Waste</option>
                        <option value="Mixed Waste">Mixed Waste</option>
                        <option value="Agricultural Waste">Agricultural Waste</option>
                        <option value="Food & Garden Waste">Food & Garden Waste</option>
                    </select>
                </div>
                
                <!-- Second Row: Sort and Export -->
                <div class="w-full">
                    <label class="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                    <select id="sort-filter" class="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                        <option value="relevance">Relevance</option>
                        <option value="name">Name A-Z</option>
                        <option value="location">Location</option>
                        <option value="capacity">Capacity (High-Low)</option>
                        <option value="date">Commissioning Date</option>
                    </select>
                </div>
                <div class="w-full flex items-end">
                    <button id="export-results" class="w-full bg-primary-600 text-white text-sm px-4 py-2 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium">
                        <span class="hidden sm:inline">Export Results</span>
                        <span class="sm:hidden">📊 Export</span>
                    </button>
                </div>
            </div>
        `;

        // Add export functionality
        const exportBtn = document.getElementById('export-results');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSearchResults());
        }
    }

    /**
     * Handle real-time search input with advanced processing and natural language support
     */
    handleSearchInput(query) {
        if (!query || query.trim().length < 2) {
            this.hideSearchResults();
            return;
        }
        
        this.isSearching = true;
        this.showSearchLoading();
        
        // Use natural language processing if available
        if (this.naturalLanguageProcessor) {
            const parsed = this.naturalLanguageProcessor.parseQuery(query);
            this.applyNaturalLanguageFilters(parsed);
            
            // Show natural language suggestions
            this.showNaturalLanguageSuggestions(parsed);
        }
        
        // Simulate search delay for better UX
        setTimeout(() => {
            this.performSearch(query);
            this.isSearching = false;
        }, 150);
        
        // Add to search history
        this.addToSearchHistory(query);
    }

    /**
     * Apply natural language filters to search
     */
    applyNaturalLanguageFilters(parsed) {
        // Apply location filter
        if (parsed.location) {
            this.filters.region = [parsed.location];
        }
        
        // Apply status filter
        if (parsed.filters.status) {
            this.filters.status = parsed.filters.status;
        }
        
        // Apply type filter
        if (parsed.filters.type) {
            this.filters.type = parsed.filters.type;
        }
        
        // Apply capacity range
        if (parsed.range) {
            // This would need to be implemented in the search logic
            console.log('Capacity range filter:', parsed.range);
        }
        
        console.log('🧠 Applied natural language filters:', parsed);
    }

    /**
     * Show natural language suggestions
     */
    showNaturalLanguageSuggestions(parsed) {
        const suggestions = this.naturalLanguageProcessor.generateSuggestions(parsed);
        if (suggestions.length === 0) return;
        
        // Create suggestions display
        const suggestionsHTML = `
            <div class="natural-language-suggestions p-2 bg-blue-50 border-l-4 border-blue-400 mb-2">
                <div class="text-xs font-medium text-blue-800 mb-1">🤖 Search Suggestions:</div>
                <div class="space-y-1">
                    ${suggestions.map(suggestion => `
                        <div class="text-xs text-blue-700">${suggestion}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert before search results
        if (this.searchResults) {
            this.searchResults.insertAdjacentHTML('beforebegin', suggestionsHTML);
        }
    }

    /**
     * Add query to search history
     */
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > this.maxHistoryItems) {
                this.searchHistory.pop();
            }
            this.saveSearchHistory();
        }
    }

    /**
     * Show search loading state
     */
    showSearchLoading() {
        if (this.searchResults) {
            this.searchResults.innerHTML = `
                <div class="p-4 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <div class="text-sm text-gray-600">Searching...</div>
                </div>
            `;
            this.showSearchResults();
        }
    }
    
    /**
     * Perform advanced fuzzy search with filtering and sorting
     */
    performSearch(query) {
        try {
            let results = [];
            
            if (this.fuse) {
                // Use Fuse.js for fuzzy search
                results = this.fuse.search(query).slice(0, 20);
                results = results.map(result => ({
                    ...result.item,
                    score: result.score,
                    matches: result.matches
                }));
            } else {
                // Enhanced fallback search
                results = this.searchData.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.location.toLowerCase().includes(query.toLowerCase()) ||
                    item.developer.toLowerCase().includes(query.toLowerCase()) ||
                    item.type.toLowerCase().includes(query.toLowerCase()) ||
                    item.region.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 20);
            }
            
            // Apply filters
            results = this.applyFilters(results);
            
            // Sort results
            results = this.sortResults(results);
            
            this.currentResults = results;
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            this.displaySearchError();
        }
    }

    /**
     * Apply advanced filters to search results
     */
    applyFilters(results) {
        let filtered = results;

        // Status filter
        if (this.filters.status.length > 0) {
            filtered = filtered.filter(item => this.filters.status.includes(item.status));
        }

        // Type filter
        if (this.filters.type.length > 0) {
            filtered = filtered.filter(item => this.filters.type.includes(item.type));
        }

        return filtered;
    }

    /**
     * Sort search results based on selected criteria
     */
    sortResults(results) {
        switch (this.sortBy) {
            case 'name':
                return results.sort((a, b) => a.name.localeCompare(b.name));
            case 'location':
                return results.sort((a, b) => a.location.localeCompare(b.location));
            case 'capacity':
                return results.sort((a, b) => {
                    const aCap = parseInt(a.capacity.replace(/[^\d]/g, ''));
                    const bCap = parseInt(b.capacity.replace(/[^\d]/g, ''));
                    return bCap - aCap;
                });
            case 'date':
                return results.sort((a, b) => new Date(b.commissioningDate) - new Date(a.commissioningDate));
            default: // relevance
                return results.sort((a, b) => (a.score || 0) - (b.score || 0));
        }
    }

    /**
     * Apply filters and re-run search
     */
    applyFiltersAndSearch() {
        const currentQuery = this.searchInput.value.trim();
        if (currentQuery.length >= 2) {
            this.performSearch(currentQuery);
        }
    }
    
    /**
     * Display enhanced search results with responsive design
     */
    displaySearchResults(results, query) {
        if (!this.searchResults || results.length === 0) {
            this.hideSearchResults();
            return;
        }

        const resultsHTML = results.map((result, index) => {
            const isSelected = index === this.selectedIndex;
            const selectedClass = isSelected ? 'bg-primary-50 border-l-primary-500 shadow-md' : 'bg-white hover:bg-gray-50 border-l-transparent';
            
            return `
                <div class="search-result-item ${selectedClass} border-l-4 p-3 sm:p-4 cursor-pointer transition-all duration-200 rounded-lg mb-2" 
                     data-index="${index}" data-id="${result.id}">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-gray-900 mb-2 text-base sm:text-lg truncate">${this.highlightMatch(result.name, query)}</div>
                            <div class="text-sm text-gray-600 mb-2 flex items-center">
                                <span class="mr-2 text-red-500">📍</span>
                                <span class="truncate">${result.location}</span>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(result.status)} truncate">
                                    ${result.status}
                                </span>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate">
                                    ${result.capacity}
                                </span>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 truncate">
                                    ${result.type}
                                </span>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 truncate">
                                    ${result.region}
                                </span>
                            </div>
                            <div class="text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div class="truncate"><strong>Developer:</strong> ${result.developer}</div>
                                <div class="truncate"><strong>Technology:</strong> ${result.technology}</div>
                                <div class="truncate"><strong>Energy Output:</strong> ${result.energyOutput}</div>
                                <div class="truncate"><strong>Carbon Savings:</strong> ${result.carbonSavings}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 flex-shrink-0 flex flex-col items-end space-y-1">
                            ${isSelected ? '<span class="text-primary-600 text-lg">👆</span>' : ''}
                            <div class="text-xs bg-gray-100 px-2 py-1 rounded">${result.commissioningDate}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = `
            <div class="p-3 sm:p-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 px-1 space-y-2 sm:space-y-0">
                    <div class="text-sm text-gray-600 font-medium flex items-center">
                        <span class="mr-2">🔍</span>
                        <span>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</span>
                    </div>
                    <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        Use ↑↓ to navigate, Enter to select, Esc to close
                    </div>
                </div>
                ${resultsHTML}
                <div class="mt-3 pt-3 border-t border-gray-200 text-center">
                    <button class="text-sm text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-md transition-colors" onclick="this.exportSearchResults()">
                        📊 Export All Results
                    </button>
                </div>
            </div>
        `;

        this.showSearchResults();
    }

    /**
     * Get enhanced status color classes
     */
    getStatusColor(status) {
        const statusColors = {
            'Operational': 'bg-green-100 text-green-800 border border-green-200',
            'Under Construction': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'Planning': 'bg-blue-100 text-blue-800 border border-blue-200',
            'Decommissioned': 'bg-red-100 text-red-800 border border-red-200',
            'Proposed': 'bg-purple-100 text-purple-800 border border-purple-200'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    }

    /**
     * Enhanced highlight matching with better styling
     */
    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded font-semibold">$1</mark>');
    }

    /**
     * Export search results to CSV
     */
    exportSearchResults() {
        if (this.currentResults.length === 0) {
            alert('No results to export');
            return;
        }

        const headers = [
            'Name', 'Location', 'Status', 'Capacity', 'Type', 'Developer', 
            'Region', 'Technology', 'Feedstock', 'Energy Output', 'Carbon Savings', 'Commissioning Date'
        ];

        const csvContent = [
            headers.join(','),
            ...this.currentResults.map(result => [
                `"${result.name}"`,
                `"${result.location}"`,
                `"${result.status}"`,
                `"${result.capacity}"`,
                `"${result.type}"`,
                `"${result.developer}"`,
                `"${result.region}"`,
                `"${result.technology}"`,
                `"${result.feedstock}"`,
                `"${result.energyOutput}"`,
                `"${result.carbonSavings}"`,
                `"${result.commissioningDate}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ad_plants_search_results_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Display search error
     */
    displaySearchError() {
        if (this.searchResults) {
            this.searchResults.innerHTML = `
                <div class="p-4 text-center">
                    <div class="text-red-500 mb-2 text-2xl">⚠️</div>
                    <div class="text-sm text-gray-600 mb-2">Search temporarily unavailable</div>
                    <div class="text-xs text-gray-500">Please try again in a moment</div>
                </div>
            `;
            this.showSearchResults();
        }
    }

    /**
     * Show search history with enhanced responsive UI
     */
    showSearchHistory() {
        if (this.searchHistory.length === 0) return;
        
        const historyHTML = this.searchHistory.map((item, index) => `
            <div class="search-history-item bg-gray-50 hover:bg-gray-100 p-3 cursor-pointer transition-all duration-200 rounded-lg mb-2" 
                 data-query="${item.query}">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <div class="flex items-center">
                        <span class="text-gray-400 mr-2 text-sm">🔍</span>
                        <span class="text-sm text-gray-700 font-medium truncate">${item.query}</span>
                    </div>
                    <div class="text-xs text-gray-400 bg-white px-2 py-1 rounded-full self-start sm:self-auto">${this.formatTimeAgo(item.timestamp)}</div>
                </div>
            </div>
        `).join('');

        this.searchResults.innerHTML = `
            <div class="p-3 sm:p-4">
                <div class="text-sm text-gray-600 font-medium mb-3 flex items-center">
                    <span class="mr-2">📚</span>
                    <span>Recent Searches (${this.searchHistory.length})</span>
                </div>
                ${historyHTML}
                <div class="mt-3 pt-3 border-t border-gray-200 text-center">
                    <button class="text-xs text-gray-500 hover:text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors" onclick="this.clearSearchHistory()">
                        🗑️ Clear History
                    </button>
                </div>
            </div>
        `;

        this.showSearchResults();
        
        // Add click handlers for history items
        this.searchResults.querySelectorAll('.search-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.searchInput.value = query;
                this.handleSearchInput(query);
            });
        });
    }

    /**
     * Format timestamp for display
     */
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    /**
     * Handle enhanced keyboard navigation
     */
    handleKeyboardNavigation(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigateResults(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateResults(-1);
                break;
            case 'Enter':
                event.preventDefault();
                if (this.selectedIndex >= 0 && this.currentResults[this.selectedIndex]) {
                    this.selectResult(this.selectedIndex);
                }
                break;
            case 'Escape':
                this.hideSearchResults();
                this.searchInput.blur();
                break;
            case 'Tab':
                // Allow tab navigation
                break;
            default:
                // Reset selection for other keys
                this.selectedIndex = -1;
        }
    }

    /**
     * Navigate through search results
     */
    navigateResults(direction) {
        if (this.currentResults.length === 0) return;
        
        this.selectedIndex += direction;
        
        if (this.selectedIndex >= this.currentResults.length) {
            this.selectedIndex = 0;
        } else if (this.selectedIndex < 0) {
            this.selectedIndex = this.currentResults.length - 1;
        }
        
        this.updateSelection();
        this.scrollToSelected();
    }

    /**
     * Scroll to selected result
     */
    scrollToSelected() {
        const selectedItem = this.searchResults.querySelector(`[data-index="${this.selectedIndex}"]`);
        if (selectedItem) {
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Update visual selection
     */
    updateSelection() {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('bg-primary-50', 'border-l-primary-500', 'shadow-md');
                item.classList.remove('bg-white', 'hover:bg-gray-50', 'border-l-transparent');
            } else {
                item.classList.remove('bg-primary-50', 'border-l-primary-500', 'shadow-md');
                item.classList.add('bg-white', 'hover:bg-gray-50', 'border-l-transparent');
            }
        });
    }

    /**
     * Handle result click
     */
    handleResultClick(event) {
        const resultItem = event.target.closest('.search-result-item');
        if (!resultItem) return;
        
        const index = parseInt(resultItem.dataset.index);
        this.selectResult(index);
    }

    /**
     * Select a search result
     */
    selectResult(index) {
        const result = this.currentResults[index];
        if (!result) return;
        
        // Add to search history
        this.addToSearchHistory(this.searchInput.value);
        
        // Focus on map location
        this.focusOnLocation(result.coordinates, result.name);
        
        // Show in info panel
        this.showInInfoPanel(result);
        
        // Hide search results
        this.hideSearchResults();
        
        // Clear search input
        this.searchInput.value = '';
        
        console.log('✅ Selected result:', result.name);
    }

    /**
     * Focus map on location using MapManager
     */
    focusOnLocation(coordinates, name) {
        if (window.APP_STATE && window.APP_STATE.mapManager) {
            try {
                // Use MapManager's focusOnLocation method
                window.APP_STATE.mapManager.focusOnLocation(coordinates);
                console.log('🗺️ Map focused on:', name, 'at', coordinates);
            } catch (error) {
                console.error('❌ Error focusing map:', error);
            }
        } else {
            console.warn('⚠️ MapManager not available');
        }
    }

    /**
     * Add temporary marker on map using MapManager
     */
    addTemporaryMarker(coordinates, name) {
        if (window.APP_STATE && window.APP_STATE.mapManager) {
            try {
                // MapManager already handles temporary markers in focusOnLocation
                console.log('📍 MapManager will add temporary marker for:', name);
            } catch (error) {
                console.error('❌ Error adding temporary marker:', error);
            }
        } else {
            console.warn('⚠️ MapManager not available');
        }
    }

    /**
     * Show result in info panel
     */
    showInInfoPanel(result) {
        if (window.APP_STATE && window.APP_STATE.infoPanel) {
            window.APP_STATE.infoPanel.showItemInfo(result);
        }
    }

    /**
     * Add search to history
     */
    addToSearchHistory(query) {
        if (!query || query.trim().length === 0) return;
        
        const timestamp = Date.now();
        const historyItem = { query: query.trim(), timestamp };
        
        // Remove duplicate if exists
        this.searchHistory = this.searchHistory.filter(item => item.query !== query.trim());
        
        // Add to beginning
        this.searchHistory.unshift(historyItem);
        
        // Keep only max items
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        this.saveSearchHistory();
    }

    /**
     * Show search results
     */
    showSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.remove('hidden');
            this.searchResults.style.display = 'block';
        }
    }

    /**
     * Hide search results
     */
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.add('hidden');
            this.searchResults.style.display = 'none';
        }
    }

    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('⚠️ Could not save search history:', error);
        }
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ Could not load search history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.hideSearchResults();
    }

    /**
     * Get current search results
     */
    getCurrentResults() {
        return this.currentResults;
    }

    /**
     * Get search history
     */
    getSearchHistory() {
        return this.searchHistory;
    }

    /**
     * Reset search state
     */
    resetSearch() {
        this.currentResults = [];
        this.selectedIndex = -1;
        this.hideSearchResults();
        this.searchInput.value = '';
    }
}
