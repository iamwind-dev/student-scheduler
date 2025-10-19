const { app } = require('@azure/functions');
const { AuthenticationService } = require('../services/auth-service');
const { ResponseHelper } = require('../utils/response-helper');
const { ValidationHelper } = require('../utils/validation-helper');

const authService = new AuthenticationService();
const response = new ResponseHelper();
const validator = new ValidationHelper();

app.http('auth-login', {
    methods: ['POST', 'OPTIONS'],
    route: 'user/login',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }

        try {
            const body = await request.json();

            const validation = validator.validateLoginRequest(body);
            if (!validation.isValid) {
                return response.validationError(validation.errors);
            }

            const result = await authService.authenticateWithMicrosoft(
                body.accessToken,
                body.tokenType
            );

            return {
                ...response.success(result, 'Login successful'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };

        } catch (error) {
            context.log.error('Login error:', error.message);

            if (error.message.includes('Invalid Microsoft token')) {
                return {
                    ...response.unauthorized('Invalid authentication token'),
                    headers: {
                        'Access-Control-Allow-Origin': 'http://localhost:5173',
                        'Access-Control-Allow-Credentials': 'true'
                    }
                };
            }

            return {
                ...response.serverError('Authentication failed', error.message),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }
    }
});

app.http('auth-refresh', {
    methods: ['POST', 'OPTIONS'],
    route: 'user/refresh',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }

        try {
            const body = await request.json();
            const validation = validator.validateRefreshRequest(body);

            if (!validation.isValid) {
                return response.validationError(validation.errors);
            }

            const result = await authService.refreshToken(body.refreshToken);

            return {
                ...response.success(result, 'Token refreshed'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };

        } catch (error) {
            context.log.error('Refresh error:', error.message);

            return {
                ...response.unauthorized('Invalid refresh token'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }
    }
});

app.http('auth-logout', {
    methods: ['POST', 'OPTIONS'],
    route: 'user/logout',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }

        try {
            const body = await request.json();
            await authService.logout(body.userId);

            return {
                ...response.success(null, 'Logout successful'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };

        } catch (error) {
            context.log.error('Logout error:', error.message);

            return {
                ...response.serverError('Logout failed', error.message),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }
    }
});

app.http('auth-me', {
    methods: ['GET', 'OPTIONS'],
    route: 'user/me',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }

        try {
            const authHeader = request.headers.get('authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    ...response.unauthorized('Missing or invalid authorization header'),
                    headers: {
                        'Access-Control-Allow-Origin': 'http://localhost:5173',
                        'Access-Control-Allow-Credentials': 'true'
                    }
                };
            }

            const token = authHeader.substring(7);
            const user = await authService.validateToken(token);

            return {
                ...response.success(user, 'User retrieved'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };

        } catch (error) {
            context.log.error('Get user error:', error.message);

            return {
                ...response.unauthorized('Invalid or expired token'),
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }
    }
});
