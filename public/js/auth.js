// User session management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check for existing session
        this.checkSession();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Check URL for Steam OpenID response
        this.checkSteamCallback();
    }

    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('login-btn')) {
                this.initiateSteamLogin();
            } else if (e.target.classList.contains('logout-btn')) {
                this.logout();
            }
        });
    }

    checkSession() {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
            try {
                this.currentUser = JSON.parse(sessionData);
                this.updateUI();
                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('auth:login', { detail: this.currentUser }));
            } catch (error) {
                console.error('Error parsing session data:', error);
                this.logout();
            }
        }
    }

    initiateSteamLogin() {
        // Steam OpenID configuration
        const steamOpenIDUrl = 'https://steamcommunity.com/openid/login';
        const returnUrl = `${window.location.origin}/auth/steam/callback`;
        
        // Construct OpenID parameters
        const params = new URLSearchParams({
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': returnUrl,
            'openid.realm': window.location.origin,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        });

        // Redirect to Steam login
        window.location.href = `${steamOpenIDUrl}?${params.toString()}`;
    }

    async checkSteamCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const steamId = urlParams.get('openid.claimed_id');
        
        if (steamId) {
            try {
                // Extract Steam ID from the response
                const steamId64 = steamId.split('/').pop();
                
                // In a real implementation, you would:
                // 1. Verify the OpenID response with Steam
                // 2. Fetch user's Steam profile data
                // 3. Create or update user in your database
                
                // For now, we'll simulate a successful login
                await this.handleSteamLogin(steamId64);
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error processing Steam login:', error);
                this.showError('Failed to complete Steam login. Please try again.');
            }
        }
    }

    async handleSteamLogin(steamId) {
        try {
            // In a real implementation, this would:
            // 1. Call your backend to verify the Steam ID
            // 2. Get or create user profile
            // 3. Set up session
            
            // Simulated user data
            const userData = {
                id: steamId,
                name: 'Steam User',
                role: 'Member',
                avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
                steamId: steamId,
                permissions: ['create_posts', 'create_comments']
            };

            this.setCurrentUser(userData);
            this.updateUI();
            
            // Dispatch login event
            window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
        } catch (error) {
            console.error('Error handling Steam login:', error);
            this.showError('Failed to complete login. Please try again.');
        }
    }

    setCurrentUser(userData) {
        this.currentUser = userData;
        localStorage.setItem('userSession', JSON.stringify(userData));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('userSession');
        this.updateUI();
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Redirect to home page
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    updateUI() {
        const authStatus = document.querySelector('.auth-status');
        if (!authStatus) return;

        if (this.currentUser) {
            authStatus.innerHTML = `
                <span class="user-info">
                    <img src="${this.currentUser.avatar}" alt="" class="user-avatar">
                    <span class="user-name">${this.currentUser.name}</span>
                    <span class="user-role">${this.currentUser.role}</span>
                </span>
                <button class="logout-btn">Logout</button>
            `;
        } else {
            authStatus.innerHTML = `
                <button class="login-btn">
                    <img src="assets/steam-icon.png" alt="Steam icon">
                    Login with Steam
                </button>
            `;
        }
    }

    hasPermission(permission) {
        return this.currentUser?.permissions?.includes(permission) || false;
    }

    showError(message) {
        // In a real implementation, this would show a proper error message UI
        console.error(message);
        alert(message);
    }

    // Helper method to get Steam profile data
    async fetchSteamProfile(steamId) {
        // Note: You'll need to implement this on your backend
        // Steam Web API requires an API key and should not be called directly from frontend
        try {
            const response = await fetch(`/api/steam/profile/${steamId}`);
            if (!response.ok) throw new Error('Failed to fetch Steam profile');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Steam profile:', error);
            throw error;
        }
    }
}

// Initialize the authentication manager
const authManager = new AuthManager();

// Export for use in other scripts
window.authManager = authManager; 