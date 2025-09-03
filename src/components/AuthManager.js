/**
 * AuthManager - Comprehensive Authentication System
 * Supports email/password authentication and SSO (Google/Apple)
 * Manages user sessions, JWT tokens, and freemium access control
 */
export class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.sessionToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.loginModal = null;
        this.listeners = new Map();
        this.featureGates = new Set(); // For freemium restrictions
        
        // OAuth providers
        this.googleAuth = null;
        this.appleAuth = null;
        
        // Configuration
        this.config = {
            apiBaseUrl: '/api/auth', // Would be your backend API
            tokenStorageKey: 'uk_ad_auth_token',
            refreshStorageKey: 'uk_ad_refresh_token',
            userStorageKey: 'uk_ad_user_data',
            sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
            refreshThreshold: 5 * 60 * 1000 // Refresh if expires in 5 minutes
        };
        
        // Freemium feature gates
        this.premiumFeatures = new Set([
            'land_registry_access',
            'advanced_site_finder',
            'bulk_export',
            'premium_layers',
            'api_access'
        ]);
    }

    /**
     * Initialize Authentication Manager
     */
    async initialize() {
        try {
            console.log('🔐 Initializing Authentication Manager...');
            
            // Create login modal UI
            this.createLoginModal();
            
            // Check for existing session
            await this.checkExistingSession();
            
            // Initialize OAuth providers
            await this.initializeOAuthProviders();
            
            // Set up token refresh interval
            this.setupTokenRefresh();
            
            console.log('✅ Authentication Manager initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Authentication Manager:', error);
            return false;
        }
    }

    /**
     * Create login modal UI
     */
    createLoginModal() {
        const modalHTML = `
            <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Access UK AD Mapping</h2>
                        <p class="text-gray-600">Sign in to unlock premium features</p>
                    </div>
                    
                    <!-- Login Form -->
                    <div id="login-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="login-email" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="your@email.com" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="login-password" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Enter your password" required>
                        </div>
                        
                        <button id="login-submit" 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Sign In
                        </button>
                        
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-300"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>
                        
                        <!-- OAuth Buttons -->
                        <div class="space-y-3">
                            <button id="google-signin" 
                                    class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>
                            
                            <button id="apple-signin" 
                                    class="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C8.396 0 8.012.167 8.012 3.589v.413c0 1.691.55 2.476 1.316 3.053.577.434 1.316.869 1.316 1.738s-.739 1.304-1.316 1.738c-.765.577-1.316 1.362-1.316 3.053v.413C8.012 23.833 8.396 24 12.017 24c3.622 0 4.006-.167 4.006-3.589v-.413c0-1.691-.55-2.476-1.316-3.053-.577-.434-1.316-.869-1.316-1.738s.739-1.304 1.316-1.738c.765-.577 1.316-1.362 1.316-3.053v-.413C16.023.167 15.639 0 12.017 0z"/>
                                </svg>
                                Continue with Apple
                            </button>
                        </div>
                        
                        <div class="text-center">
                            <button id="show-register" class="text-blue-600 hover:text-blue-800 text-sm">
                                Don't have an account? Register
                            </button>
                        </div>
                    </div>
                    
                    <!-- Register Form -->
                    <div id="register-form" class="space-y-4 hidden">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="register-name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Your full name" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="register-email" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="your@email.com" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="register-password" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Create a strong password" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input type="password" id="register-confirm" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Confirm your password" required>
                        </div>
                        
                        <button id="register-submit" 
                                class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Create Account
                        </button>
                        
                        <div class="text-center">
                            <button id="show-login" class="text-blue-600 hover:text-blue-800 text-sm">
                                Already have an account? Sign In
                            </button>
                        </div>
                    </div>
                    
                    <!-- Close Button -->
                    <button id="auth-modal-close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    
                    <!-- Error Message -->
                    <div id="auth-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm hidden"></div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.loginModal = document.getElementById('auth-modal');
        
        // Set up event listeners
        this.setupModalEventListeners();
    }

    /**
     * Set up modal event listeners
     */
    setupModalEventListeners() {
        // Close modal
        document.getElementById('auth-modal-close').addEventListener('click', () => {
            this.hideLoginModal();
        });
        
        // Toggle between login and register
        document.getElementById('show-register').addEventListener('click', () => {
            this.toggleForms('register');
        });
        
        document.getElementById('show-login').addEventListener('click', () => {
            this.toggleForms('login');
        });
        
        // Form submissions
        document.getElementById('login-submit').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleEmailLogin();
        });
        
        document.getElementById('register-submit').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleEmailRegister();
        });
        
        // OAuth buttons
        document.getElementById('google-signin').addEventListener('click', () => {
            this.handleGoogleLogin();
        });
        
        document.getElementById('apple-signin').addEventListener('click', () => {
            this.handleAppleLogin();
        });
        
        // Enter key submission
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.loginModal.classList.contains('hidden')) {
                const activeForm = document.getElementById('login-form').classList.contains('hidden') ? 'register' : 'login';
                if (activeForm === 'login') {
                    this.handleEmailLogin();
                } else {
                    this.handleEmailRegister();
                }
            }
        });
    }

    /**
     * Toggle between login and register forms
     */
    toggleForms(form) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (form === 'register') {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        } else {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
        
        this.clearError();
    }

    /**
     * Handle email/password login
     */
    async handleEmailLogin() {
        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                this.showError('Please enter both email and password');
                return;
            }
            
            this.showLoading('Signing in...');
            
            // Simulate API call - replace with actual backend
            const loginResult = await this.simulateLogin(email, password);
            
            if (loginResult.success) {
                await this.handleAuthSuccess(loginResult);
                this.hideLoginModal();
                this.showSuccessMessage('Welcome back! You now have access to premium features.');
            } else {
                this.showError(loginResult.error || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('An error occurred during login');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle email/password registration
     */
    async handleEmailRegister() {
        try {
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            if (!name || !email || !password || !confirmPassword) {
                this.showError('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showError('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                this.showError('Password must be at least 8 characters long');
                return;
            }
            
            this.showLoading('Creating account...');
            
            // Simulate API call - replace with actual backend
            const registerResult = await this.simulateRegister(name, email, password);
            
            if (registerResult.success) {
                await this.handleAuthSuccess(registerResult);
                this.hideLoginModal();
                this.showSuccessMessage('Account created successfully! Welcome to UK AD Mapping.');
            } else {
                this.showError(registerResult.error || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('An error occurred during registration');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle Google OAuth login
     */
    async handleGoogleLogin() {
        try {
            this.showLoading('Connecting to Google...');
            
            // In production, this would use Google OAuth SDK
            // For now, simulate successful Google login
            const googleResult = await this.simulateOAuthLogin('google', 'user@gmail.com');
            
            if (googleResult.success) {
                await this.handleAuthSuccess(googleResult);
                this.hideLoginModal();
                this.showSuccessMessage('Successfully signed in with Google!');
            } else {
                this.showError('Google sign-in failed');
            }
            
        } catch (error) {
            console.error('Google login error:', error);
            this.showError('Google sign-in error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle Apple OAuth login
     */
    async handleAppleLogin() {
        try {
            this.showLoading('Connecting to Apple...');
            
            // In production, this would use Apple OAuth SDK
            // For now, simulate successful Apple login
            const appleResult = await this.simulateOAuthLogin('apple', 'user@icloud.com');
            
            if (appleResult.success) {
                await this.handleAuthSuccess(appleResult);
                this.hideLoginModal();
                this.showSuccessMessage('Successfully signed in with Apple!');
            } else {
                this.showError('Apple sign-in failed');
            }
            
        } catch (error) {
            console.error('Apple login error:', error);
            this.showError('Apple sign-in error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle successful authentication
     */
    async handleAuthSuccess(authResult) {
        this.isAuthenticated = true;
        this.currentUser = authResult.user;
        this.sessionToken = authResult.token;
        this.refreshToken = authResult.refreshToken;
        this.tokenExpiry = new Date(Date.now() + this.config.sessionDuration);
        
        // Store tokens securely
        this.storeTokens();
        
        // Update UI
        this.updateAuthUI();
        
        // Emit authentication event
        this.emit('authenticated', this.currentUser);
        
        console.log('✅ User authenticated:', this.currentUser.email);
    }

    /**
     * Check for existing session on page load
     */
    async checkExistingSession() {
        try {
            const storedToken = localStorage.getItem(this.config.tokenStorageKey);
            const storedUser = localStorage.getItem(this.config.userStorageKey);
            
            if (storedToken && storedUser) {
                // Verify token is still valid
                const isValid = await this.verifyToken(storedToken);
                
                if (isValid) {
                    this.isAuthenticated = true;
                    this.currentUser = JSON.parse(storedUser);
                    this.sessionToken = storedToken;
                    this.updateAuthUI();
                    console.log('✅ Existing session restored for:', this.currentUser.email);
                } else {
                    this.clearStoredTokens();
                }
            }
        } catch (error) {
            console.error('Session check error:', error);
            this.clearStoredTokens();
        }
    }

    /**
     * Store authentication tokens
     */
    storeTokens() {
        localStorage.setItem(this.config.tokenStorageKey, this.sessionToken);
        localStorage.setItem(this.config.userStorageKey, JSON.stringify(this.currentUser));
        if (this.refreshToken) {
            localStorage.setItem(this.config.refreshStorageKey, this.refreshToken);
        }
    }

    /**
     * Clear stored tokens
     */
    clearStoredTokens() {
        localStorage.removeItem(this.config.tokenStorageKey);
        localStorage.removeItem(this.config.userStorageKey);
        localStorage.removeItem(this.config.refreshStorageKey);
    }

    /**
     * Update authentication UI
     */
    updateAuthUI() {
        // Add user menu to the sidebar if authenticated
        if (this.isAuthenticated && this.currentUser) {
            this.addUserMenu();
        } else {
            this.removeUserMenu();
        }
    }

    /**
     * Add user menu to sidebar
     */
    addUserMenu() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Remove existing user menu
        const existingMenu = document.getElementById('user-menu');
        if (existingMenu) existingMenu.remove();
        
        const userMenuHTML = `
            <div id="user-menu" class="p-4 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center space-x-3 mb-3">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">
                            ${this.currentUser.name ? this.currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                            ${this.currentUser.name || 'User'}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                            ${this.currentUser.email}
                        </p>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            this.currentUser.subscription === 'premium' ? 'bg-gold-100 text-gold-800' : 'bg-green-100 text-green-800'
                        }">
                            ${this.currentUser.subscription === 'premium' ? '⭐ Premium' : '🆓 Free'}
                        </span>
                    </div>
                </div>
                <div class="space-y-1">
                    ${this.currentUser.subscription !== 'premium' ? `
                    <button id="upgrade-btn" class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        ⭐ Upgrade to Premium
                    </button>
                    ` : ''}
                    <button id="logout-btn" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        🚪 Sign Out
                    </button>
                </div>
            </div>
        `;
        
        sidebar.insertAdjacentHTML('beforeend', userMenuHTML);
        
        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        if (this.currentUser.subscription !== 'premium') {
            document.getElementById('upgrade-btn').addEventListener('click', () => {
                this.showUpgradeModal();
            });
        }
    }

    /**
     * Remove user menu from sidebar
     */
    removeUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) userMenu.remove();
    }

    /**
     * Show login modal
     */
    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('hidden');
            this.clearError();
            this.toggleForms('login'); // Start with login form
        }
    }

    /**
     * Hide login modal
     */
    hideLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.add('hidden');
            this.clearError();
            this.clearForms();
        }
    }

    /**
     * Clear form inputs
     */
    clearForms() {
        const inputs = this.loginModal.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    /**
     * Show loading state
     */
    showLoading(message) {
        const buttons = this.loginModal.querySelectorAll('button[type="submit"], #login-submit, #register-submit');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.textContent = message;
        });
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('login-submit').textContent = 'Sign In';
        document.getElementById('register-submit').textContent = 'Create Account';
        
        const buttons = this.loginModal.querySelectorAll('button[type="submit"], #login-submit, #register-submit');
        buttons.forEach(btn => {
            btn.disabled = false;
        });
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Logout user
     */
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.sessionToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        this.clearStoredTokens();
        this.updateAuthUI();
        this.emit('logout');
        
        this.showSuccessMessage('You have been signed out successfully.');
        console.log('✅ User logged out');
    }

    /**
     * Check if user has access to premium feature
     */
    hasFeatureAccess(featureId) {
        if (!this.isAuthenticated) return false;
        if (this.currentUser.subscription === 'premium') return true;
        
        return !this.premiumFeatures.has(featureId);
    }

    /**
     * Show upgrade modal for premium features
     */
    showUpgradeModal() {
        if (window.APP_STATE && window.APP_STATE.paymentManager) {
            window.APP_STATE.paymentManager.showUpgradeModal();
        } else {
            this.showSuccessMessage('Premium upgrade coming soon! Contact support for early access.');
        }
    }

    /**
     * Require authentication for premium features
     */
    requireAuth(featureId = null, message = null) {
        if (this.isAuthenticated) {
            if (!featureId || this.hasFeatureAccess(featureId)) {
                return true;
            } else {
                this.showUpgradeModal();
                return false;
            }
        } else {
            this.showLoginModal();
            return false;
        }
    }

    // Simulation methods (replace with real API calls in production)
    
    async simulateLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication
        if (email && password) {
            return {
                success: true,
                user: {
                    id: 'user_' + Date.now(),
                    email: email,
                    name: email.split('@')[0],
                    subscription: Math.random() > 0.7 ? 'premium' : 'free',
                    createdAt: new Date().toISOString()
                },
                token: 'jwt_token_' + Math.random().toString(36),
                refreshToken: 'refresh_' + Math.random().toString(36)
            };
        } else {
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }
    }

    async simulateRegister(name, email, password) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        return {
            success: true,
            user: {
                id: 'user_' + Date.now(),
                email: email,
                name: name,
                subscription: 'free',
                createdAt: new Date().toISOString()
            },
            token: 'jwt_token_' + Math.random().toString(36),
            refreshToken: 'refresh_' + Math.random().toString(36)
        };
    }

    async simulateOAuthLogin(provider, email) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
            success: true,
            user: {
                id: 'user_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                provider: provider,
                subscription: 'free',
                createdAt: new Date().toISOString()
            },
            token: 'jwt_token_' + Math.random().toString(36),
            refreshToken: 'refresh_' + Math.random().toString(36)
        };
    }

    async verifyToken(token) {
        // Simulate token verification
        await new Promise(resolve => setTimeout(resolve, 200));
        return token && token.startsWith('jwt_token_');
    }

    async initializeOAuthProviders() {
        // In production, initialize Google and Apple OAuth SDKs here
        console.log('🔐 OAuth providers initialized (simulation mode)');
    }

    setupTokenRefresh() {
        // Set up automatic token refresh
        setInterval(() => {
            if (this.isAuthenticated && this.tokenExpiry) {
                const timeUntilExpiry = this.tokenExpiry.getTime() - Date.now();
                if (timeUntilExpiry < this.config.refreshThreshold) {
                    this.refreshAuthToken();
                }
            }
        }, 60000); // Check every minute
    }

    async refreshAuthToken() {
        if (!this.refreshToken) return;
        
        try {
            // Simulate token refresh
            const newToken = 'jwt_token_' + Math.random().toString(36);
            this.sessionToken = newToken;
            this.tokenExpiry = new Date(Date.now() + this.config.sessionDuration);
            
            localStorage.setItem(this.config.tokenStorageKey, newToken);
            console.log('🔄 Token refreshed successfully');
            
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }
}