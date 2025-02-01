class StoreManager {
    constructor() {
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadUserSubscription();
    }

    initEventListeners() {
        // Package subscription buttons
        document.querySelectorAll('.package-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleSubscription(e));
        });

        // Individual item purchase buttons
        document.querySelectorAll('.item-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleItemPurchase(e));
        });

        // Donation buttons
        document.querySelectorAll('.donation-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleDonation(e));
        });

        // Custom donation input
        const customDonationInput = document.querySelector('.custom-donation input');
        if (customDonationInput) {
            customDonationInput.addEventListener('input', (e) => {
                this.validateDonationAmount(e.target);
            });
        }
    }

    async loadUserSubscription() {
        try {
            const response = await fetch('/api/user/subscription', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateSubscriptionUI(data.subscription);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        }
    }

    updateSubscriptionUI(subscription) {
        const packages = document.querySelectorAll('.package-card');
        packages.forEach(package => {
            const packageName = package.querySelector('h3').textContent.toLowerCase();
            const button = package.querySelector('.package-btn');
            
            if (subscription && subscription.package === packageName) {
                button.textContent = 'Current Plan';
                button.disabled = true;
            }
        });
    }

    async handleSubscription(event) {
        const button = event.target;
        const package = button.closest('.package-card');
        const packageName = package.querySelector('h3').textContent;
        const priceElement = package.querySelector('.amount');
        const price = parseFloat(priceElement.textContent.replace('$', ''));

        try {
            const response = await fetch('/api/store/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    package: packageName,
                    price: price
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.checkoutUrl;
            } else {
                this.showError('Failed to process subscription. Please try again.');
            }
        } catch (error) {
            console.error('Error processing subscription:', error);
            this.showError('An error occurred. Please try again later.');
        }
    }

    async handleItemPurchase(event) {
        const button = event.target;
        const item = button.closest('.item-card');
        const itemName = item.querySelector('h4').textContent;
        const priceElement = item.querySelector('.item-price');
        const price = parseFloat(priceElement.textContent.replace('$', ''));

        try {
            const response = await fetch('/api/store/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: itemName,
                    price: price
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.checkoutUrl;
            } else {
                this.showError('Failed to process purchase. Please try again.');
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            this.showError('An error occurred. Please try again later.');
        }
    }

    async handleDonation(event) {
        const button = event.target;
        let amount;

        if (button.parentElement.classList.contains('custom-donation')) {
            const input = button.parentElement.querySelector('input');
            amount = parseFloat(input.value);
            if (!this.validateDonationAmount(input)) return;
        } else {
            amount = parseFloat(button.textContent.replace('$', ''));
        }

        try {
            const response = await fetch('/api/store/donate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.checkoutUrl;
            } else {
                this.showError('Failed to process donation. Please try again.');
            }
        } catch (error) {
            console.error('Error processing donation:', error);
            this.showError('An error occurred. Please try again later.');
        }
    }

    validateDonationAmount(input) {
        const amount = parseFloat(input.value);
        const min = 1;
        const max = 1000;

        if (isNaN(amount) || amount < min || amount > max) {
            input.setCustomValidity(`Please enter an amount between $${min} and $${max}`);
            input.reportValidity();
            return false;
        }

        input.setCustomValidity('');
        return true;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        document.querySelector('.store-container').prepend(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the store manager
const storeManager = new StoreManager(); 