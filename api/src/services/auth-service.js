/**
 * AUTHENTICATION SERVICE
 * Handles Microsoft Entra ID token validation and user authentication
 */

class AuthenticationService {
    constructor() {
        this.tokenCache = new Map();
    }

    /**
     * Authenticate with Microsoft Entra ID token
     * Validates token and returns user info
     */
    async authenticateWithMicrosoft(accessToken, tokenType = 'Bearer') {
        try {
            if (!accessToken) {
                throw new Error('Access token is required');
            }

            // In production, validate token with Azure AD
            // For now, we'll do basic validation and return user info
            const tokenParts = accessToken.split('.');

            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            // Decode JWT payload (second part)
            let payload;
            try {
                const decoded = Buffer.from(tokenParts[1], 'base64').toString('utf-8');
                payload = JSON.parse(decoded);
            } catch (e) {
                throw new Error('Invalid token - could not decode payload');
            }

            // Validate token expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                throw new Error('Token has expired');
            }

            // Extract user information from token
            const user = {
                id: payload.oid || payload.sub,
                email: payload.email || payload.preferred_username,
                name: payload.name || payload.given_name,
                role: {
                    roleName: 'Student',
                    roleId: 1
                }
            };

            // Cache the token
            this.tokenCache.set(user.id, {
                accessToken,
                payload,
                timestamp: Date.now()
            });

            return {
                user,
                accessToken,
                tokenType,
                expiresIn: payload.exp ? payload.exp - now : 3600
            };

        } catch (error) {
            throw new Error(`Invalid Microsoft token: ${error.message}`);
        }
    }

    /**
     * Refresh authentication token
     * Validates and refreshes the token
     */
    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error('Refresh token is required');
            }

            // In production, this would call Azure AD token endpoint
            // For now, return a mock response
            return {
                accessToken: refreshToken,
                tokenType: 'Bearer',
                expiresIn: 3600
            };

        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    /**
     * Validate user token
     * Checks if token is still valid
     */
    async validateToken(accessToken) {
        try {
            if (!accessToken) {
                return { isValid: false, error: 'No token provided' };
            }

            const tokenParts = accessToken.split('.');
            if (tokenParts.length !== 3) {
                return { isValid: false, error: 'Invalid token format' };
            }

            // Decode and check expiration
            const decoded = Buffer.from(tokenParts[1], 'base64').toString('utf-8');
            const payload = JSON.parse(decoded);

            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return { isValid: false, error: 'Token has expired' };
            }

            return { isValid: true, payload };

        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }

    /**
     * Logout - clear cached tokens
     */
    logout(userId) {
        if (userId && this.tokenCache.has(userId)) {
            this.tokenCache.delete(userId);
        }
        return { success: true, message: 'Logged out successfully' };
    }
}

module.exports = { AuthenticationService };
