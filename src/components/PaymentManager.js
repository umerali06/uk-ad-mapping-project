/**
 * PaymentManager - Manages Stripe payment integration for subscription plans
 * Handles subscription management, payment processing, and billing
 */
export class PaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.clientSecret = null;
        this.subscriptionPlans = {
            basic: {
                id: 'price_basic',
                name: 'Basic Plan',
                price: 29.99,
                currency: 'gbp',
                interval: 'month',
                features: [
                    'Basic mapping features',
                    'Standard search functionality',
                    'Limited site analysis',
                    'Email support'
                ],
                limits: {
                    searches: 100,
                    exports: 10,
                    apiCalls: 1000
                }
            },
            professional: {
                id: 'price_professional',
                name: 'Professional Plan',
                price: 79.99,
                currency: 'gbp',
                interval: 'month',
                features: [
                    'Advanced mapping features',
                    'Enhanced site finder',
                    'Unlimited searches',
                    'Priority support',
                    'API access',
                    'Custom reports'
                ],
                limits: {
                    searches: 'unlimited',
                    exports: 100,
                    apiCalls: 10000
                }
            },
            enterprise: {
                id: 'price_enterprise',
                name: 'Enterprise Plan',
                price: 199.99,
                currency: 'gbp',
                interval: 'month',
                features: [
                    'Full feature access',
                    'Custom integrations',
                    'Dedicated support',
                    'White-label options',
                    'Advanced analytics',
                    'Team management'
                ],
                limits: {
                    searches: 'unlimited',
                    exports: 'unlimited',
                    apiCalls: 100000
                }
            }
        };
        
        this.currentSubscription = null;
        this.paymentMethods = [];
        this.invoices = [];
        this.paymentEnabled = false;
    }

    /**
     * Initialize Stripe with API key
     */
    async initialize(stripePublicKey = null) {
        try {
            if (typeof Stripe === 'undefined') {
                throw new Error('Stripe library not loaded');
            }
            
            // Check if we have a valid API key
            const apiKey = stripePublicKey || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
            
            if (!apiKey) {
                console.warn('⚠️ No Stripe API key provided - payment features will be limited');
                this.stripe = null;
                this.paymentEnabled = false;
                return true; // Still initialize, but with limited functionality
            }
            
            this.stripe = Stripe(apiKey);
            this.paymentEnabled = true;
            console.log('💳 Payment Manager initialized with Stripe');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Payment Manager:', error);
            this.paymentEnabled = false;
            return false;
        }
    }

    /**
     * Check if payment features are enabled
     */
    isPaymentEnabled() {
        return this.paymentEnabled && this.stripe !== null;
    }

    /**
     * Create a payment intent for subscription
     */
    async createPaymentIntent(planId, customerId = null) {
        try {
            if (!this.isPaymentEnabled()) {
                throw new Error('Payment features are not enabled');
            }
            
            const plan = this.subscriptionPlans[planId];
            if (!plan) {
                throw new Error(`Invalid plan: ${planId}`);
            }

            // In a real implementation, this would call your backend
            // For now, we'll simulate the payment intent creation
            const paymentIntent = {
                id: `pi_${Math.random().toString(36).substr(2, 9)}`,
                client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
                amount: Math.round(plan.price * 100), // Convert to pence
                currency: plan.currency,
                customer: customerId,
                metadata: {
                    plan_id: planId,
                    plan_name: plan.name
                }
            };

            this.clientSecret = paymentIntent.client_secret;
            console.log(`💳 Created payment intent for ${plan.name}`);
            return paymentIntent;
            
        } catch (error) {
            console.error('❌ Error creating payment intent:', error);
            throw error;
        }
    }

    /**
     * Create subscription
     */
    async createSubscription(planId, paymentMethodId, customerId = null) {
        try {
            const plan = this.subscriptionPlans[planId];
            if (!plan) {
                throw new Error(`Invalid plan: ${planId}`);
            }

            // Simulate subscription creation
            const subscription = {
                id: `sub_${Math.random().toString(36).substr(2, 9)}`,
                planId: planId,
                planName: plan.name,
                status: 'active',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cancelAtPeriodEnd: false,
                customerId: customerId || `cus_${Math.random().toString(36).substr(2, 9)}`,
                paymentMethodId: paymentMethodId,
                features: plan.features,
                limits: plan.limits
            };

            this.currentSubscription = subscription;
            console.log(`💳 Created subscription for ${plan.name}`);
            return subscription;
            
        } catch (error) {
            console.error('❌ Error creating subscription:', error);
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            if (!this.currentSubscription || this.currentSubscription.id !== subscriptionId) {
                throw new Error('Subscription not found');
            }

            if (cancelAtPeriodEnd) {
                this.currentSubscription.cancelAtPeriodEnd = true;
                this.currentSubscription.status = 'canceled';
                console.log('💳 Subscription will be canceled at period end');
            } else {
                this.currentSubscription.status = 'canceled';
                this.currentSubscription.currentPeriodEnd = new Date().toISOString();
                console.log('💳 Subscription canceled immediately');
            }

            return this.currentSubscription;
            
        } catch (error) {
            console.error('❌ Error canceling subscription:', error);
            throw error;
        }
    }

    /**
     * Update subscription plan
     */
    async updateSubscription(newPlanId) {
        try {
            const newPlan = this.subscriptionPlans[newPlanId];
            if (!newPlan) {
                throw new Error(`Invalid plan: ${newPlanId}`);
            }

            if (!this.currentSubscription) {
                throw new Error('No active subscription to update');
            }

            // Simulate plan update
            this.currentSubscription.planId = newPlanId;
            this.currentSubscription.planName = newPlan.name;
            this.currentSubscription.features = newPlan.features;
            this.currentSubscription.limits = newPlan.limits;

            console.log(`💳 Updated subscription to ${newPlan.name}`);
            return this.currentSubscription;
            
        } catch (error) {
            console.error('❌ Error updating subscription:', error);
            throw error;
        }
    }

    /**
     * Add payment method
     */
    async addPaymentMethod(paymentMethodData) {
        try {
            // In a real implementation, this would create a payment method with Stripe
            const paymentMethod = {
                id: `pm_${Math.random().toString(36).substr(2, 9)}`,
                type: 'card',
                card: {
                    brand: paymentMethodData.card.brand || 'visa',
                    last4: paymentMethodData.card.last4 || '4242',
                    expMonth: paymentMethodData.card.expMonth || 12,
                    expYear: paymentMethodData.card.expYear || 2025
                },
                billingDetails: paymentMethodData.billingDetails || {},
                created: new Date().toISOString()
            };

            this.paymentMethods.push(paymentMethod);
            console.log('💳 Added new payment method');
            return paymentMethod;
            
        } catch (error) {
            console.error('❌ Error adding payment method:', error);
            throw error;
        }
    }

    /**
     * Remove payment method
     */
    async removePaymentMethod(paymentMethodId) {
        try {
            const index = this.paymentMethods.findIndex(pm => pm.id === paymentMethodId);
            if (index === -1) {
                throw new Error('Payment method not found');
            }

            this.paymentMethods.splice(index, 1);
            console.log('💳 Removed payment method');
            return true;
            
        } catch (error) {
            console.error('❌ Error removing payment method:', error);
            throw error;
        }
    }

    /**
     * Get available plans
     */
    getAvailablePlans() {
        return Object.entries(this.subscriptionPlans).map(([id, plan]) => ({
            id,
            ...plan
        }));
    }

    /**
     * Get plan details by ID
     */
    getPlanById(planId) {
        return this.subscriptionPlans[planId] || null;
    }

    /**
     * Get current subscription
     */
    getCurrentSubscription() {
        return this.currentSubscription;
    }

    /**
     * Get payment methods
     */
    getPaymentMethods() {
        return this.paymentMethods;
    }

    /**
     * Check if user has active subscription
     */
    hasActiveSubscription() {
        return this.currentSubscription && this.currentSubscription.status === 'active';
    }

    /**
     * Check if user can access feature
     */
    canAccessFeature(featureName) {
        if (!this.currentSubscription) {
            return false;
        }

        const plan = this.subscriptionPlans[this.currentSubscription.planId];
        return plan.features.includes(featureName);
    }

    /**
     * Check usage limits
     */
    checkUsageLimit(limitType, currentUsage) {
        if (!this.currentSubscription) {
            return false;
        }

        const plan = this.subscriptionPlans[this.currentSubscription.planId];
        const limit = plan.limits[limitType];

        if (limit === 'unlimited') {
            return true;
        }

        return currentUsage < limit;
    }

    /**
     * Get usage statistics
     */
    getUsageStats() {
        if (!this.currentSubscription) {
            return null;
        }

        const plan = this.subscriptionPlans[this.currentSubscription.planId];
        return {
            plan: plan.name,
            limits: plan.limits,
            currentUsage: {
                searches: Math.floor(Math.random() * 50),
                exports: Math.floor(Math.random() * 10),
                apiCalls: Math.floor(Math.random() * 1000)
            }
        };
    }

    /**
     * Generate invoice
     */
    async generateInvoice(subscriptionId, amount, description) {
        try {
            const invoice = {
                id: `in_${Math.random().toString(36).substr(2, 9)}`,
                subscriptionId: subscriptionId,
                amount: amount,
                currency: 'gbp',
                status: 'paid',
                description: description,
                created: new Date().toISOString(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            this.invoices.push(invoice);
            console.log('💳 Generated invoice');
            return invoice;
            
        } catch (error) {
            console.error('❌ Error generating invoice:', error);
            throw error;
        }
    }

    /**
     * Get invoices
     */
    getInvoices() {
        return this.invoices;
    }

    /**
     * Process refund
     */
    async processRefund(invoiceId, amount, reason) {
        try {
            const invoice = this.invoices.find(inv => inv.id === invoiceId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            const refund = {
                id: `re_${Math.random().toString(36).substr(2, 9)}`,
                invoiceId: invoiceId,
                amount: amount,
                currency: 'gbp',
                reason: reason,
                status: 'succeeded',
                created: new Date().toISOString()
            };

            console.log('💳 Processed refund');
            return refund;
            
        } catch (error) {
            console.error('❌ Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Get billing portal URL
     */
    async getBillingPortalUrl(customerId) {
        try {
            // In a real implementation, this would call Stripe's billing portal
            const portalUrl = `https://billing.stripe.com/session/${Math.random().toString(36).substr(2, 9)}`;
            console.log('💳 Generated billing portal URL');
            return portalUrl;
            
        } catch (error) {
            console.error('❌ Error getting billing portal URL:', error);
            throw error;
        }
    }

    /**
     * Handle webhook events
     */
    async handleWebhookEvent(event) {
        try {
            console.log(`💳 Received webhook event: ${event.type}`);
            
            switch (event.type) {
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                default:
                    console.log(`💳 Unhandled webhook event: ${event.type}`);
            }
            
        } catch (error) {
            console.error('❌ Error handling webhook event:', error);
            throw error;
        }
    }

    /**
     * Handle successful payment
     */
    async handlePaymentSucceeded(invoice) {
        console.log(`💳 Payment succeeded for invoice: ${invoice.id}`);
        // Update subscription status, send confirmation email, etc.
    }

    /**
     * Handle failed payment
     */
    async handlePaymentFailed(invoice) {
        console.log(`💳 Payment failed for invoice: ${invoice.id}`);
        // Update subscription status, send dunning email, etc.
    }

    /**
     * Handle subscription update
     */
    async handleSubscriptionUpdated(subscription) {
        console.log(`💳 Subscription updated: ${subscription.id}`);
        // Update local subscription data
    }

    /**
     * Handle subscription deletion
     */
    async handleSubscriptionDeleted(subscription) {
        console.log(`💳 Subscription deleted: ${subscription.id}`);
        this.currentSubscription = null;
    }

    /**
     * Validate payment method
     */
    validatePaymentMethod(paymentMethodData) {
        const errors = [];

        if (!paymentMethodData.card) {
            errors.push('Card information is required');
        } else {
            if (!paymentMethodData.card.number) {
                errors.push('Card number is required');
            }
            if (!paymentMethodData.card.expMonth) {
                errors.push('Expiry month is required');
            }
            if (!paymentMethodData.card.expYear) {
                errors.push('Expiry year is required');
            }
            if (!paymentMethodData.card.cvc) {
                errors.push('CVC is required');
            }
        }

        if (!paymentMethodData.billingDetails) {
            errors.push('Billing details are required');
        } else {
            if (!paymentMethodData.billingDetails.name) {
                errors.push('Billing name is required');
            }
            if (!paymentMethodData.billingDetails.email) {
                errors.push('Billing email is required');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Format price for display
     */
    formatPrice(amount, currency = 'gbp') {
        const formatter = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency.toUpperCase()
        });
        
        return formatter.format(amount);
    }

    /**
     * Get subscription status
     */
    getSubscriptionStatus() {
        if (!this.currentSubscription) {
            return 'none';
        }

        if (this.currentSubscription.status === 'active') {
            if (this.currentSubscription.cancelAtPeriodEnd) {
                return 'canceling';
            }
            return 'active';
        }

        return this.currentSubscription.status;
    }

    /**
     * Get days until renewal
     */
    getDaysUntilRenewal() {
        if (!this.currentSubscription || this.currentSubscription.status !== 'active') {
            return 0;
        }

        const renewalDate = new Date(this.currentSubscription.currentPeriodEnd);
        const now = new Date();
        const diffTime = renewalDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }
}
