/**
 * SidebarManager - Manages the left sidebar functionality and layer controls
 * Handles sidebar toggle, layer visibility, and layer group expansion/collapse
 */
export class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.toggleBtn = null;
        this.closeBtn = null;
        this.toggleContainer = null;
        this.layerItems = new Map();
        this.isCollapsed = false;
    }

    /**
     * Initialize the sidebar manager
     */
    initialize() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        this.closeBtn = document.getElementById('sidebar-close');
        this.toggleContainer = document.getElementById('sidebar-toggle-container');
        
        if (!this.sidebar || !this.toggleBtn || !this.closeBtn || !this.toggleContainer) {
            console.error('Sidebar elements not found');
            return;
        }

        this.setupEventListeners();
        this.initializeLayerGroups();
        this.setupLayerItemListeners();
        
        // Initially show the hamburger button as hidden (sidebar is open)
        this.toggleContainer.classList.add('hidden');
        
        console.log('SidebarManager initialized');
    }

    /**
     * Set up event listeners for sidebar functionality
     */
    setupEventListeners() {
        // Hamburger toggle button (outside sidebar)
        this.toggleBtn.addEventListener('click', () => {
            this.openSidebar();
        });

        // Cross close button (inside sidebar)
        this.closeBtn.addEventListener('click', () => {
            this.closeSidebar();
        });

        // Keyboard shortcut (Ctrl/Cmd + B)
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                if (this.isCollapsed) {
                    this.openSidebar();
                } else {
                    this.closeSidebar();
                }
            }
        });
    }

    /**
     * Set up layer item click and hover event listeners
     */
    setupLayerItemListeners() {
        const layerItems = document.querySelectorAll('.layer-item');
        
        layerItems.forEach(item => {
            const layerId = item.dataset.layer;
            if (layerId) {
                this.layerItems.set(layerId, item);
                
                // Click event for layer toggle
                item.addEventListener('click', () => {
                    this.toggleLayer(layerId);
                });
                
                // Hover effects
                item.addEventListener('mouseenter', () => {
                    item.style.transform = 'translateX(4px)';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.transform = 'translateX(0)';
                });
            }
        });
    }

    /**
     * Initialize layer groups with click handlers for expansion/collapse
     */
    initializeLayerGroups() {
        const layerGroups = document.querySelectorAll('.layer-group');
        
        layerGroups.forEach(group => {
            const header = group.querySelector('.layer-group-header');
            const layers = group.querySelector('.layer-group-layers');
            const arrow = group.querySelector('.layer-group-arrow');
            
            if (header && layers && arrow) {
                // Set initial state to collapsed
                layers.classList.add('collapsed');
                layers.classList.remove('expanded');
                
                header.addEventListener('click', () => {
                    const isCollapsed = layers.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        // Expand
                        layers.classList.remove('collapsed');
                        layers.classList.add('expanded');
                        arrow.classList.add('rotated');
                    } else {
                        // Collapse
                        layers.classList.remove('expanded');
                        layers.classList.add('collapsed');
                        arrow.classList.remove('rotated');
                    }
                });
            }
        });
    }

    /**
     * Update layer group headers with active count and enhanced styling
     */
    updateLayerGroupCounts() {
        const layerGroups = document.querySelectorAll('.layer-group');
        
        layerGroups.forEach(group => {
            const header = group.querySelector('.layer-group-header');
            const layers = group.querySelectorAll('.layer-item');
            
            if (header && layers.length > 0) {
                const activeCount = Array.from(layers).filter(item => 
                    item.classList.contains('active')
                ).length;
                
                const totalCount = layers.length;
                
                // Update or create count badge
                let countBadge = header.querySelector('.layer-count-badge');
                if (!countBadge) {
                    countBadge = document.createElement('span');
                    countBadge.className = 'layer-count-badge ml-2 text-xs font-medium px-2 py-1 rounded-full transition-all duration-200';
                    header.appendChild(countBadge);
                }
                
                if (activeCount > 0) {
                    countBadge.textContent = `${activeCount}/${totalCount}`;
                    countBadge.className = 'layer-count-badge ml-2 text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-200 shadow-sm';
                } else {
                    countBadge.textContent = `${totalCount}`;
                    countBadge.className = 'layer-count-badge ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200';
                }

                // Add visual indicator for active groups
                if (activeCount > 0) {
                    header.classList.add('has-active-layers');
                    header.classList.remove('no-active-layers');
                } else {
                    header.classList.remove('has-active-layers');
                    header.classList.add('no-active-layers');
                }
            }
        });
    }

    /**
     * Toggle entire layer group with enhanced feedback
     */
    toggleLayerGroup(groupId) {
        const group = document.querySelector(`[data-group="${groupId}"]`);
        if (!group) return;
        
        const layers = group.querySelectorAll('.layer-item');
        const allActive = Array.from(layers).every(item => 
            item.classList.contains('active')
        );
        
        // Show loading state
        this.showGroupLoading(groupId);
        
        setTimeout(() => {
            layers.forEach(item => {
                const layerId = item.dataset.layer;
                if (layerId) {
                    if (allActive) {
                        // Deactivate all
                        if (item.classList.contains('active')) {
                            this.toggleLayer(layerId);
                        }
                    } else {
                        // Activate all
                        if (!item.classList.contains('active')) {
                            this.toggleLayer(layerId);
                        }
                    }
                }
            });
            
            // Hide loading state
            this.hideGroupLoading(groupId);
            
            // Update counts
            this.updateLayerGroupCounts();
        }, 300);
    }

    /**
     * Show loading state for entire group
     */
    showGroupLoading(groupId) {
        const group = document.querySelector(`[data-group="${groupId}"]`);
        if (group) {
            const header = group.querySelector('.layer-group-header');
            if (header) {
                header.classList.add('loading');
                const loadingSpinner = document.createElement('span');
                loadingSpinner.className = 'ml-2 animate-spin text-primary-600';
                loadingSpinner.innerHTML = '⏳';
                header.appendChild(loadingSpinner);
            }
        }
    }

    /**
     * Hide loading state for entire group
     */
    hideGroupLoading(groupId) {
        const group = document.querySelector(`[data-group="${groupId}"]`);
        if (group) {
            const header = group.querySelector('.layer-group-header');
            if (header) {
                header.classList.remove('loading');
                const loadingSpinner = header.querySelector('.animate-spin');
                if (loadingSpinner) {
                    loadingSpinner.remove();
                }
            }
        }
    }

    /**
     * Enhanced layer toggle with better visual feedback
     */
    toggleLayer(layerId) {
        try {
            // Show loading state
            this.showLayerLoading(layerId);
            
            // Toggle layer in LayerManager
            if (window.APP_STATE && window.APP_STATE.layerManager) {
                window.APP_STATE.layerManager.toggleLayer(layerId);
            }
            
            // Update visual state after a short delay
            setTimeout(() => {
                this.updateLayerVisualState(layerId);
                this.hideLayerLoading(layerId);
                this.updateLayerGroupCounts();
            }, 200);
            
        } catch (error) {
            console.error('❌ Error toggling layer:', error);
            this.showLayerError(layerId, 'Toggle failed');
            this.hideLayerLoading(layerId);
        }
    }

    /**
     * Enhanced visual state update with animations
     */
    updateLayerVisualState(layerId) {
        const layerItem = this.layerItems.get(layerId);
        if (!layerItem) return;
        
        const isActive = layerItem.classList.contains('active');
        
        if (isActive) {
            // Deactivate
            layerItem.classList.remove('active');
            this.removeActiveIndicator(layerItem);
            layerItem.style.backgroundColor = '';
            layerItem.style.borderLeftColor = '';
            
            // Add deactivation animation
            layerItem.style.transform = 'translateX(-4px)';
            setTimeout(() => {
                layerItem.style.transform = 'translateX(0)';
            }, 150);
            
        } else {
            // Activate
            layerItem.classList.add('active');
            this.addActiveIndicator(layerItem);
            layerItem.style.backgroundColor = '#eff6ff'; // bg-blue-50
            layerItem.style.borderLeftColor = '#3b82f6'; // border-blue-500
            
            // Add activation animation
            layerItem.style.transform = 'translateX(4px)';
            setTimeout(() => {
                layerItem.style.transform = 'translateX(0)';
            }, 150);
        }
        
        // Update group counts
        this.updateLayerGroupCounts();
    }

    /**
     * Add active indicator with enhanced styling
     */
    addActiveIndicator(layerItem) {
        // Remove existing indicator
        this.removeActiveIndicator(layerItem);
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'layer-active-indicator ml-2 flex-shrink-0';
        indicator.innerHTML = `
            <div class="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
            </div>
        `;
        
        layerItem.appendChild(indicator);
    }

    /**
     * Remove active indicator
     */
    removeActiveIndicator(layerItem) {
        const indicator = layerItem.querySelector('.layer-active-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Enhanced sidebar open with smooth animations
     */
    openSidebar() {
        this.isCollapsed = false;
        this.sidebar.classList.remove('collapsed');
        
        // Add opening animation
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            this.sidebar.style.transform = 'translateX(0)';
        }, 10);
        
        // Hide hamburger button, show cross button
        this.toggleContainer.classList.add('hidden');
        this.closeBtn.style.display = 'block';
        
        // Update layer counts
        this.updateLayerGroupCounts();
        
        console.log('✅ Sidebar opened with smooth animation');
    }

    /**
     * Enhanced sidebar close with smooth animations
     */
    closeSidebar() {
        this.isCollapsed = true;
        
        // Add closing animation
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.3s ease-in';
        
        setTimeout(() => {
            this.sidebar.classList.add('collapsed');
            this.sidebar.style.transform = '';
            this.sidebar.style.transition = '';
        }, 300);
        
        // Show hamburger button, hide cross button
        this.toggleContainer.classList.remove('hidden');
        this.closeBtn.style.display = 'none';
        
        console.log('✅ Sidebar closed with smooth animation');
    }

    /**
     * Toggle sidebar state (legacy method - now uses open/close)
     */
    toggleSidebar() {
        if (this.isCollapsed) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    /**
     * Update toggle button icon based on sidebar state
     */
    updateToggleButtonIcon(isCollapsed) {
        if (this.toggleBtn) {
            if (isCollapsed) {
                // Show expand icon (hamburger)
                this.toggleBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            } else {
                // Show collapse icon (X)
                this.toggleBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            }
        }
    }

    /**
     * Add new layer item with enhanced styling
     */
    addLayerItem(layerId, name, category, isActive = false) {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item p-3 border-l-4 border-l-transparent hover:bg-gray-50 transition-all duration-200 cursor-pointer ${isActive ? 'active' : ''}`;
        layerItem.dataset.layer = layerId;
        layerItem.dataset.category = category;
        
        layerItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="w-3 h-3 rounded-full mr-3 ${this.getCategoryColor(category)}"></span>
                    <span class="text-sm font-medium text-gray-700">${name}</span>
                </div>
                ${isActive ? '<div class="layer-active-indicator ml-2 flex-shrink-0"><div class="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center"><svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div></div>' : ''}
            </div>
        `;
        
        // Add to layer items map
        this.layerItems.set(layerId, layerItem);
        
        // Add click event listener
        layerItem.addEventListener('click', () => {
            this.toggleLayer(layerId);
        });
        
        // Add hover effects
        layerItem.addEventListener('mouseenter', () => {
            if (!layerItem.classList.contains('active')) {
                layerItem.style.transform = 'translateX(4px)';
                layerItem.style.backgroundColor = '#f3f4f6';
            }
        });
        
        layerItem.addEventListener('mouseleave', () => {
            if (!layerItem.classList.contains('active')) {
                layerItem.style.transform = 'translateX(0)';
                layerItem.style.backgroundColor = '';
            }
        });
        
        return layerItem;
    }

    /**
     * Get category color for layer items
     */
    getCategoryColor(category) {
        const colors = {
            'boundary': 'bg-blue-500',
            'ad-plants': 'bg-green-500',
            'manure': 'bg-yellow-500',
            'environmental': 'bg-purple-500',
            'infrastructure': 'bg-red-500',
            'landRegistry': 'bg-indigo-500'
        };
        return colors[category] || 'bg-gray-500';
    }

    /**
     * Remove layer item with cleanup
     */
    removeLayerItem(layerId) {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            // Remove from DOM
            layerItem.remove();
            
            // Remove from map
            this.layerItems.delete(layerId);
            
            // Update group counts
            this.updateLayerGroupCounts();
            
            console.log(`🗑️ Removed layer item: ${layerId}`);
        }
    }

    /**
     * Update layer item with new data
     */
    updateLayerItem(layerId, updates) {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            // Update properties
            Object.keys(updates).forEach(key => {
                if (key === 'name') {
                    const nameSpan = layerItem.querySelector('.text-gray-700');
                    if (nameSpan) {
                        nameSpan.textContent = updates[key];
                    }
                }
                if (key === 'category') {
                    const colorSpan = layerItem.querySelector('.w-3.h-3');
                    if (colorSpan) {
                        colorSpan.className = `w-3 h-3 rounded-full mr-3 ${this.getCategoryColor(updates[key])}`;
                    }
                    layerItem.dataset.category = updates[key];
                }
            });
            
            console.log(`🔄 Updated layer item: ${layerId}`);
        }
    }

    /**
     * Show loading state for a specific layer
     */
    showLayerLoading(layerId) {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            layerItem.classList.add('loading');
            layerItem.innerHTML += '<span class="ml-2 animate-spin">⏳</span>';
        }
    }

    /**
     * Hide loading state for a specific layer
     */
    hideLayerLoading(layerId) {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            layerItem.classList.remove('loading');
            const loadingSpinner = layerItem.querySelector('.animate-spin');
            if (loadingSpinner) {
                loadingSpinner.remove();
            }
        }
    }

    /**
     * Show error state for a specific layer
     */
    showLayerError(layerId, errorMessage = 'Error') {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            layerItem.classList.add('error');
            layerItem.innerHTML += `<span class="ml-2 text-red-500" title="${errorMessage}">⚠️</span>`;
        }
    }

    /**
     * Clear error state for a specific layer
     */
    clearLayerError(layerId) {
        const layerItem = this.layerItems.get(layerId);
        if (layerItem) {
            layerItem.classList.remove('error');
            const errorIcon = layerItem.querySelector('.text-red-500');
            if (errorIcon) {
                errorIcon.remove();
            }
        }
    }

    /**
     * Get sidebar state
     */
    getSidebarState() {
        return {
            isCollapsed: this.isCollapsed,
            activeLayers: Array.from(this.layerItems.entries())
                .filter(([_, item]) => item.classList.contains('active'))
                .map(([id, _]) => id)
        };
    }

    /**
     * Get all active layers
     */
    getActiveLayers() {
        return Array.from(this.layerItems.entries())
            .filter(([_, item]) => item.classList.contains('active'))
            .map(([layerId, _]) => layerId);
    }

    /**
     * Get layer count by category
     */
    getLayerCountByCategory(category) {
        return Array.from(this.layerItems.values())
            .filter(item => item.dataset.category === category).length;
    }

    /**
     * Reset all layers to inactive state
     */
    resetAllLayers() {
        this.layerItems.forEach((item, layerId) => {
            if (item.classList.contains('active')) {
                this.toggleLayer(layerId);
            }
        });
    }

    /**
     * Export layer configuration
     */
    exportLayerConfig() {
        const config = {
            activeLayers: this.getActiveLayers(),
            layerCounts: {
                total: this.layerItems.size,
                byCategory: {}
            },
            timestamp: new Date().toISOString()
        };
        
        // Count by category
        ['boundary', 'ad-plants', 'manure', 'environmental', 'infrastructure', 'landRegistry'].forEach(category => {
            config.layerCounts.byCategory[category] = this.getLayerCountByCategory(category);
        });
        
        return config;
    }
}
