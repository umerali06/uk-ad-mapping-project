/**
 * CollaborationManager - Real-time collaboration tools for UK AD Mapping Application
 * Features: Shared workspaces, user annotations, collaborative mapping, team coordination
 */
export class CollaborationManager {
    constructor() {
        this.workspaces = new Map();
        this.currentWorkspace = null;
        this.users = new Map();
        this.annotations = new Map();
        this.collaborationSocket = null;
        this.isCollaborating = false;
        this.userId = this.generateUserId();
        this.userName = `User_${this.userId.slice(0, 6)}`;
    }

    /**
     * Initialize the collaboration manager
     */
    async initialize() {
        try {
            // Set up collaboration UI
            this.setupCollaborationUI();
            
            // Initialize local storage for offline collaboration
            this.loadCollaborationData();
            
            // Set up event listeners
            this.setupCollaborationEventListeners();
        } catch (error) {
            // Silent error handling
        }
    }

    /**
     * Generate unique user ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Set up collaboration UI in the sidebar
     */
    setupCollaborationUI() {
        const sidebar = document.querySelector('#sidebar');
        if (!sidebar) return;

        // Add collaboration section to sidebar
        const collaborationSection = document.createElement('div');
        collaborationSection.className = 'layer-group';
        collaborationSection.innerHTML = `
            <div class="layer-group-header cursor-pointer">
                <span class="font-medium text-gray-700">🤝 Collaboration</span>
                <svg class="w-4 h-4 transform transition-transform layer-group-arrow" id="collaboration-arrow">▶</svg>
            </div>
            <div id="collaboration-layers" class="layer-group-layers collapsed ml-4">
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="view-user-id">🆔 My User ID</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="create-workspace">➕ Create Workspace</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="join-workspace">🔗 Join Workspace</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="manage-users">👥 Manage Users</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="add-annotation">📝 Add Annotation</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="view-annotations">👁️ View Annotations</div>
                <div class="collaboration-item cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors duration-200" data-action="export-collaboration">📤 Export Data</div>
                <div class="collaboration-item cursor-pointer hover:bg-green-50 hover:text-green-700 px-2 py-1 rounded transition-colors duration-200" data-action="test-collaboration">🧪 Test System</div>
            </div>
        `;

        // Insert after existing layer groups
        const existingGroups = sidebar.querySelectorAll('.layer-group');
        if (existingGroups.length > 0) {
            existingGroups[existingGroups.length - 1].after(collaborationSection);
        } else {
            sidebar.appendChild(collaborationSection);
        }

        console.log('🔧 Collaboration UI initialized in sidebar');
    }

    /**
     * Set up event listeners for collaboration
     */
    setupCollaborationEventListeners() {
        // Collaboration section toggle - use event delegation for robustness
        document.addEventListener('click', (e) => {
            // Check if clicked specifically on collaboration arrow or collaboration header
            const collaborationSection = e.target.closest('.layer-group');
            const isCollaborationSection = collaborationSection && collaborationSection.querySelector('#collaboration-layers');
            
            if (e.target.id === 'collaboration-arrow' || (isCollaborationSection && e.target.closest('.layer-group-header'))) {
                e.preventDefault();
                e.stopPropagation();
                
                const collaborationLayers = document.getElementById('collaboration-layers');
                const collaborationArrow = document.getElementById('collaboration-arrow');
                
                if (collaborationLayers && collaborationArrow) {
                    const isCollapsed = collaborationLayers.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        // Expand
                        collaborationLayers.classList.remove('collapsed');
                        collaborationLayers.classList.add('expanded');
                        collaborationArrow.textContent = '▼'; // Point down when expanded
                    } else {
                        // Collapse
                        collaborationLayers.classList.remove('expanded');
                        collaborationLayers.classList.add('collapsed');
                        collaborationArrow.textContent = '▶'; // Point right when collapsed
                    }
                }
            }
        });

        // Collaboration item clicks - use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('collaboration-item')) {
                e.preventDefault();
                e.stopPropagation();
                
                const action = e.target.dataset.action;
                
                if (action) {
                    this.handleCollaborationAction(action);
                }
            }
        });
    }

    /**
     * Handle collaboration actions
     */
    handleCollaborationAction(action) {
        try {
            switch (action) {
                case 'view-user-id':
                    this.showUserIDModal();
                    break;
                case 'create-workspace':
                    this.showCreateWorkspaceModal();
                    break;
                case 'join-workspace':
                    this.showJoinWorkspaceModal();
                    break;
                case 'manage-users':
                    this.showUserManagementModal();
                    break;
                case 'add-annotation':
                    this.showAddAnnotationModal();
                    break;
                case 'view-annotations':
                    this.showAnnotationsList();
                    break;
                case 'export-collaboration':
                    this.exportCollaborationData();
                    break;
                case 'test-collaboration':
                    this.testCollaborationSystem();
                    break;
                default:
                    // Silent handling for unknown actions
            }
        } catch (error) {
            this.showCollaborationMessage(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Show user ID modal
     */
    showUserIDModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">🆔 My User ID</h3>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-blue-800">Your Unique User ID</h4>
                            <p class="text-xs text-blue-600 mt-1">Share this ID with team members so they can invite you to workspaces</p>
                        </div>
                        <button id="copy-user-id-display" class="text-blue-600 hover:text-blue-800" title="Copy User ID">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="mt-2">
                        <code class="bg-white px-3 py-2 rounded border text-sm font-mono text-blue-900 break-all">${this.userId}</code>
                    </div>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 class="text-sm font-medium text-yellow-800">How to Use Your User ID</h4>
                    <ul class="text-xs text-yellow-700 mt-2 space-y-1">
                        <li>• Share this ID with workspace owners</li>
                        <li>• Use it when joining private workspaces</li>
                        <li>• Include it in collaboration invitations</li>
                        <li>• Keep it safe - it's your unique identifier</li>
                    </ul>
                </div>
                
                <div class="flex justify-end mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up copy functionality
        const copyBtn = modal.querySelector('#copy-user-id-display');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.userId).then(() => {
                // Show copy success feedback
                copyBtn.innerHTML = `
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    `;
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = this.userId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show copy success feedback
                copyBtn.innerHTML = `
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    `;
                }, 2000);
            });
        });
    }

    /**
     * Show create workspace modal
     */
    showCreateWorkspaceModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">➕ Create New Workspace</h3>
                
                <!-- User ID Display Section -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-blue-800">Your User ID</h4>
                            <p class="text-xs text-blue-600 mt-1">Share this ID with team members so they can join your workspace</p>
                        </div>
                        <button id="copy-user-id" class="text-blue-600 hover:text-blue-800" title="Copy User ID">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="mt-2">
                        <code class="bg-white px-3 py-2 rounded border text-sm font-mono text-blue-900 break-all">${this.userId}</code>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
                        <input type="text" id="workspace-name" class="w-full px-3 py-2 border rounded-lg" placeholder="Enter workspace name">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="workspace-description" class="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Enter workspace description"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                        <select id="workspace-access" class="w-full px-3 py-2 border rounded-lg">
                            <option value="public">Public - Anyone can join</option>
                            <option value="invite-only">Invite Only - Requires invitation</option>
                            <option value="private">Private - Only you</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button id="create-workspace-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Create Workspace
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners
        const createBtn = modal.querySelector('#create-workspace-btn');
        const copyUserIdBtn = modal.querySelector('#copy-user-id');
        
        createBtn.addEventListener('click', () => this.createWorkspace(modal));
        
        // Copy user ID functionality
        copyUserIdBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.userId).then(() => {
                // Show copy success feedback
                copyUserIdBtn.innerHTML = `
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                `;
                setTimeout(() => {
                    copyUserIdBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    `;
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = this.userId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show copy success feedback
                copyUserIdBtn.innerHTML = `
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                `;
                setTimeout(() => {
                    copyUserIdBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    `;
                }, 2000);
            });
        });
    }

    /**
     * Create a new workspace
     */
    createWorkspace(modal) {
        const name = modal.querySelector('#workspace-name').value;
        const description = modal.querySelector('#workspace-description').value;
        const access = modal.querySelector('#workspace-access').value;
        
        if (!name.trim()) {
            alert('Please enter a workspace name');
            return;
        }
        
        const workspace = {
            id: 'workspace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            description: description.trim(),
            access: access,
            createdBy: this.userId,
            createdAt: new Date().toISOString(),
            users: [this.userId],
            annotations: [],
            settings: {
                allowAnnotations: true,
                allowUserManagement: true,
                maxUsers: access === 'public' ? 100 : 20
            }
        };
        
        // Add to workspaces
        this.workspaces.set(workspace.id, workspace);
        this.currentWorkspace = workspace;
        
        // Save to local storage
        this.saveCollaborationData();
        
        // Update UI
        this.updateCollaborationStatus();
        
        // Close modal
        modal.remove();
        
        console.log('✅ Workspace created:', workspace.name);
        
        // Show success message
        this.showCollaborationMessage(`Workspace "${workspace.name}" created successfully!`, 'success');
    }

    /**
     * Show join workspace modal
     */
    showJoinWorkspaceModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">🔗 Join Workspace</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Workspace ID</label>
                        <input type="text" id="workspace-id" class="w-full px-3 py-2 border rounded-lg" placeholder="Enter workspace ID">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                        <input type="text" id="user-name" class="w-full px-3 py-2 border rounded-lg" placeholder="Enter your name" value="${this.userName}">
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button id="join-workspace-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Join Workspace
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listener for join button
        const joinBtn = modal.querySelector('#join-workspace-btn');
        joinBtn.addEventListener('click', () => this.joinWorkspace(modal));
    }

    /**
     * Join an existing workspace
     */
    joinWorkspace(modal) {
        const workspaceId = modal.querySelector('#workspace-id').value;
        const userName = modal.querySelector('#user-name').value;
        
        if (!workspaceId.trim() || !userName.trim()) {
            alert('Please enter both workspace ID and your name');
            return;
        }
        
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace) {
            alert('Workspace not found. Please check the ID.');
            return;
        }
        
        // Update user name
        this.userName = userName.trim();
        
        // Add user to workspace
        if (!workspace.users.includes(this.userId)) {
            workspace.users.push(this.userId);
        }
        
        // Set as current workspace
        this.currentWorkspace = workspace;
        
        // Save to local storage
        this.saveCollaborationData();
        
        // Update UI
        this.updateCollaborationStatus();
        
        // Close modal
        modal.remove();
        
        console.log('✅ Joined workspace:', workspace.name);
        
        // Show success message
        this.showCollaborationMessage(`Successfully joined workspace "${workspace.name}"!`, 'success');
    }

    /**
     * Show user management modal
     */
    showUserManagementModal() {
        if (!this.currentWorkspace) {
            this.showCollaborationMessage('Please join a workspace first', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-semibold mb-4">👥 User Management - ${this.currentWorkspace.name}</h3>
                
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium mb-2">Current Users (${this.currentWorkspace.users.length})</h4>
                        <div class="space-y-2">
                            ${this.currentWorkspace.users.map(userId => `
                                <div class="flex justify-between items-center p-2 bg-white rounded border">
                                    <span class="text-sm">${userId === this.userId ? this.userName + ' (You)' : 'User_' + userId.slice(0, 6)}</span>
                                    ${userId === this.currentWorkspace.createdBy ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Owner</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium mb-2">Workspace Settings</h4>
                        <div class="space-y-2 text-sm">
                            <p><strong>Access Level:</strong> ${this.currentWorkspace.access}</p>
                            <p><strong>Created:</strong> ${new Date(this.currentWorkspace.createdAt).toLocaleDateString()}</p>
                            <p><strong>Max Users:</strong> ${this.currentWorkspace.settings.maxUsers}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Show add annotation modal
     */
    showAddAnnotationModal() {
        if (!this.currentWorkspace) {
            this.showCollaborationMessage('Please join a workspace first', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">📝 Add Annotation</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Annotation Type</label>
                        <select id="annotation-type" class="w-full px-3 py-2 border rounded-lg">
                            <option value="note">📝 Note</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="suggestion">💡 Suggestion</option>
                            <option value="question">❓ Question</option>
                            <option value="highlight">✨ Highlight</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input type="text" id="annotation-title" class="w-full px-3 py-2 border rounded-lg" placeholder="Enter annotation title">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="annotation-description" class="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Enter annotation description"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                        <input type="text" id="annotation-location" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Coordinates or area name">
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button id="add-annotation-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add Annotation
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listener for add button
        const addBtn = modal.querySelector('#add-annotation-btn');
        addBtn.addEventListener('click', () => this.addAnnotation(modal));
    }

    /**
     * Add a new annotation
     */
    addAnnotation(modal) {
        const type = modal.querySelector('#annotation-type').value;
        const title = modal.querySelector('#annotation-title').value;
        const description = modal.querySelector('#annotation-description').value;
        const location = modal.querySelector('#annotation-location').value;
        
        if (!title.trim() || !description.trim()) {
            alert('Please enter both title and description');
            return;
        }
        
        const annotation = {
            id: 'annotation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            title: title.trim(),
            description: description.trim(),
            location: location.trim() || null,
            createdBy: this.userId,
            createdByName: this.userName,
            createdAt: new Date().toISOString(),
            workspaceId: this.currentWorkspace.id,
            status: 'active'
        };
        
        // Add to annotations
        this.annotations.set(annotation.id, annotation);
        
        // Add to workspace
        this.currentWorkspace.annotations.push(annotation.id);
        
        // Save to local storage
        this.saveCollaborationData();
        
        // Close modal
        modal.remove();
        
        console.log('✅ Annotation added:', annotation.title);
        
        // Show success message
        this.showCollaborationMessage(`Annotation "${annotation.title}" added successfully!`, 'success');
    }

    /**
     * Show annotations list
     */
    showAnnotationsList() {
        if (!this.currentWorkspace) {
            this.showCollaborationMessage('Please join a workspace first', 'error');
            return;
        }
        
        const workspaceAnnotations = Array.from(this.annotations.values())
            .filter(ann => ann.workspaceId === this.currentWorkspace.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-semibold mb-4">👁️ Annotations - ${this.currentWorkspace.name}</h3>
                
                ${workspaceAnnotations.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📝</div>
                        <p>No annotations yet</p>
                        <p class="text-sm">Create the first annotation to get started!</p>
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${workspaceAnnotations.map(annotation => `
                            <div class="border rounded-lg p-4 ${this.getAnnotationTypeClass(annotation.type)}">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-lg">${this.getAnnotationTypeIcon(annotation.type)}</span>
                                        <h4 class="font-medium">${annotation.title}</h4>
                                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${annotation.type}</span>
                                    </div>
                                    <span class="text-xs text-gray-500">${new Date(annotation.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p class="text-sm text-gray-700 mb-2">${annotation.description}</p>
                                ${annotation.location ? `<p class="text-xs text-gray-500">📍 ${annotation.location}</p>` : ''}
                                <p class="text-xs text-gray-500 mt-2">By: ${annotation.createdByName || 'Unknown'}</p>
                            </div>
                        `).join('')}
                    </div>
                `}
                
                <div class="flex justify-end mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Get annotation type icon
     */
    getAnnotationTypeIcon(type) {
        const icons = {
            'note': '📝',
            'warning': '⚠️',
            'suggestion': '💡',
            'question': '❓',
            'highlight': '✨'
        };
        return icons[type] || '📝';
    }

    /**
     * Get annotation type CSS class
     */
    getAnnotationTypeClass(type) {
        const classes = {
            'note': 'bg-blue-50 border-blue-200',
            'warning': 'bg-yellow-50 border-yellow-200',
            'suggestion': 'bg-green-50 border-green-200',
            'question': 'bg-purple-50 border-purple-200',
            'highlight': 'bg-orange-50 border-orange-200'
        };
        return classes[type] || 'bg-gray-50 border-gray-200';
    }

    /**
     * Export collaboration data
     */
    exportCollaborationData() {
        if (!this.currentWorkspace) {
            this.showCollaborationMessage('Please join a workspace first', 'error');
            return;
        }
        
        const exportData = {
            workspace: this.currentWorkspace,
            annotations: Array.from(this.annotations.values())
                .filter(ann => ann.workspaceId === this.currentWorkspace.id),
            exportDate: new Date().toISOString(),
            exportedBy: this.userName
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `collaboration_${this.currentWorkspace.name}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📤 Collaboration data exported');
        this.showCollaborationMessage('Collaboration data exported successfully!', 'success');
    }

    /**
     * Update collaboration status in UI
     */
    updateCollaborationStatus() {
        const statusElement = document.querySelector('#collaboration-status');
        if (!statusElement) return;
        
        if (this.currentWorkspace) {
            statusElement.innerHTML = `
                <div class="bg-green-100 border border-green-200 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-green-600">🟢</span>
                        <span class="text-sm font-medium text-green-800">Active: ${this.currentWorkspace.name}</span>
                    </div>
                    <p class="text-xs text-green-600 mt-1">${this.currentWorkspace.users.length} users, ${this.currentWorkspace.annotations.length} annotations</p>
                </div>
            `;
        } else {
            statusElement.innerHTML = `
                <div class="bg-gray-100 border border-gray-200 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-600">⚪</span>
                        <span class="text-sm font-medium text-gray-800">No Active Workspace</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">Create or join a workspace to start collaborating</p>
                </div>
            `;
        }
    }

    /**
     * Show collaboration message
     */
    showCollaborationMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageElement.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(messageElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    /**
     * Save collaboration data to local storage
     */
    saveCollaborationData() {
        try {
            const data = {
                workspaces: Array.from(this.workspaces.entries()),
                annotations: Array.from(this.annotations.entries()),
                currentWorkspace: this.currentWorkspace?.id || null,
                userId: this.userId,
                userName: this.userName
            };
            localStorage.setItem('uk-ad-collaboration', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error saving collaboration data:', error);
        }
    }

    /**
     * Load collaboration data from local storage
     */
    loadCollaborationData() {
        try {
            const data = localStorage.getItem('uk-ad-collaboration');
            if (data) {
                const parsed = JSON.parse(data);
                
                // Restore workspaces
                this.workspaces = new Map(parsed.workspaces || []);
                
                // Restore annotations
                this.annotations = new Map(parsed.annotations || []);
                
                // Restore current workspace
                if (parsed.currentWorkspace) {
                    this.currentWorkspace = this.workspaces.get(parsed.currentWorkspace);
                }
                
                // Restore user info
                if (parsed.userId) this.userId = parsed.userId;
                if (parsed.userName) this.userName = parsed.userName;
                
                console.log('📂 Collaboration data loaded from local storage');
            }
        } catch (error) {
            console.error('❌ Error loading collaboration data:', error);
        }
    }

    /**
     * Get current workspace info
     */
    getCurrentWorkspace() {
        return this.currentWorkspace;
    }

    /**
     * Get all annotations for current workspace
     */
    getWorkspaceAnnotations() {
        if (!this.currentWorkspace) return [];
        return Array.from(this.annotations.values())
            .filter(ann => ann.workspaceId === this.currentWorkspace.id);
    }

    /**
     * Check if user is in a workspace
     */
    isInWorkspace() {
        return this.currentWorkspace !== null;
    }
    
    /**
     * Test the collaboration system
     */
    testCollaborationSystem() {
        console.log('🧪 Testing collaboration system...');
        
        // Show test results
        const testResults = {
            workspaces: this.workspaces.size,
            annotations: this.annotations.size,
            currentWorkspace: this.currentWorkspace?.name || 'None',
            userId: this.userId,
            userName: this.userName,
            eventListeners: 'Active',
            uiElements: document.querySelector('#collaboration-arrow') ? 'Found' : 'Missing'
        };
        
        console.table(testResults);
        
        // Show test message
        this.showCollaborationMessage('🧪 Collaboration system test completed! Check console for details.', 'info');
        
        // Create a test workspace if none exists
        if (this.workspaces.size === 0) {
            this.showCollaborationMessage('💡 No workspaces found. Try creating one!', 'info');
        }
    }
}
