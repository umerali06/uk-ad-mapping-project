/**
 * ErrorHandler - Centralized error handling and user feedback
 * Provides consistent error reporting and user notifications
 */
export class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 5;
        this.errorTimeout = 5000; // 5 seconds
    }

    /**
     * Handle application errors with user-friendly messages
     */
    handleError(error, context = 'Application') {
        try {
            this.errorCount++;
            
            // Log error details
            console.error(`❌ [${context}] Error:`, error);
            
            // Create user-friendly error message
            const userMessage = this.createUserMessage(error, context);
            
            // Show error notification
            this.showErrorNotification(userMessage, context);
            
            // Track error for analytics (in production)
            this.trackError(error, context);
            
            // Prevent error spam
            if (this.errorCount > this.maxErrors) {
                this.showErrorLimitReached();
            }
            
        } catch (errorHandlerError) {
            // Fallback error handling
            console.error('❌ Error handler failed:', errorHandlerError);
            alert(`An error occurred: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Create user-friendly error message
     */
    createUserMessage(error, context) {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error.message) {
            // Common error patterns
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                return 'Network connection failed. Please check your internet connection and try again.';
            }
            
            if (error.message.includes('timeout')) {
                return 'The operation timed out. Please try again.';
            }
            
            if (error.message.includes('permission')) {
                return 'Permission denied. Please check your browser settings.';
            }
            
            if (error.message.includes('not found')) {
                return 'The requested resource was not found.';
            }
            
            return error.message;
        }
        
        return `An unexpected error occurred in ${context}. Please try again.`;
    }

    /**
     * Show error notification to user
     */
    showErrorNotification(message, context) {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
            notification.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold">${context} Error</h4>
                        <p class="text-sm mt-1">${message}</p>
                    </div>
                    <button class="text-white hover:text-red-200" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after timeout
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, this.errorTimeout);
            
        } catch (error) {
            console.error('Failed to show error notification:', error);
            // Fallback to alert
            alert(`${context} Error: ${message}`);
        }
    }

    /**
     * Show success notification
     */
    showSuccessNotification(message, context = 'Success') {
        try {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
            notification.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold">${context}</h4>
                        <p class="text-sm mt-1">${message}</p>
                    </div>
                    <button class="text-white hover:text-green-200" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 3000);
            
        } catch (error) {
            console.error('Failed to show success notification:', error);
        }
    }

    /**
     * Show warning notification
     */
    showWarningNotification(message, context = 'Warning') {
        try {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
            notification.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-7.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold">${context}</h4>
                        <p class="text-sm mt-1">${message}</p>
                    </div>
                    <button class="text-white hover:text-yellow-200" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 4000);
            
        } catch (error) {
            console.error('Failed to show warning notification:', error);
        }
    }

    /**
     * Show error limit reached message
     */
    showErrorLimitReached() {
        const message = 'Too many errors have occurred. Please refresh the page or contact support.';
        this.showErrorNotification(message, 'System Error');
    }

    /**
     * Track error for analytics (placeholder for production)
     */
    trackError(error, context) {
        // In production, this would send error data to analytics service
        console.log(`📊 Error tracked: ${context} - ${error.message || 'Unknown error'}`);
    }

    /**
     * Reset error count
     */
    resetErrorCount() {
        this.errorCount = 0;
    }

    /**
     * Get current error count
     */
    getErrorCount() {
        return this.errorCount;
    }

    /**
     * Check if error limit reached
     */
    isErrorLimitReached() {
        return this.errorCount >= this.maxErrors;
    }

    /**
     * Handle async operations with error catching
     */
    async handleAsync(operation, context = 'Operation') {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error, context);
            throw error;
        }
    }

    /**
     * Handle promise operations with error catching
     */
    handlePromise(promise, context = 'Operation') {
        return promise.catch(error => {
            this.handleError(error, context);
            throw error;
        });
    }
}

// Create global error handler instance
window.ERROR_HANDLER = new ErrorHandler();

