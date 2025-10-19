/**
 * AUTHENTICATION CONTEXT v2.0
 * Global authentication state management
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, isDemoMode } from '../authConfig';
import apiService from '../services/api/apiService';

let msalInstance = null;

// Initialize MSAL instance if not in demo mode
if (!isDemoMode) {
    msalInstance = new PublicClientApplication(msalConfig);
}

// Authentication Context
const AuthContext = createContext();

// Authentication Actions
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial State
const initialState = {
    user: null,
    sessionToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    loginAttempts: 0,
    lastLoginTime: null
};

// Authentication Reducer
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null,
                loginAttempts: state.loginAttempts + 1
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                sessionToken: action.payload.sessionToken,
                refreshToken: action.payload.refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                lastLoginTime: new Date().toISOString()
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                sessionToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload.error
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...initialState,
                isLoading: false
            };

        case AUTH_ACTIONS.REFRESH_TOKEN:
            return {
                ...state,
                sessionToken: action.payload.sessionToken,
                error: null
            };

        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}

// Authentication Provider Component
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize authentication on app load
    useEffect(() => {
        initializeAuth();
    }, []);

    // Set up token refresh timer
    useEffect(() => {
        if (state.sessionToken && state.isAuthenticated) {
            const refreshTimer = setInterval(() => {
                refreshAuthToken();
            }, 20 * 60 * 1000); // Refresh every 20 minutes

            return () => clearInterval(refreshTimer);
        }
    }, [state.sessionToken, state.isAuthenticated]);

    /**
     * Initialize authentication state from storage
     */
    async function initializeAuth() {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            // Initialize MSAL if not in demo mode
            if (!isDemoMode && msalInstance) {
                await msalInstance.initialize();
            }

            const sessionToken = localStorage.getItem('sessionToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userData = localStorage.getItem('userData');

            if (sessionToken && refreshToken && userData) {
                // Validate session with backend
                const validation = await apiService.validateSession();

                if (validation.success) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user: JSON.parse(userData),
                            sessionToken,
                            refreshToken
                        }
                    });
                } else {
                    // Session expired, try refresh
                    await refreshAuthToken();
                }
            } else if (isDemoMode) {
                // Auto-login in demo mode
                console.log('🎭 Demo mode detected - Auto-login as demo user');
                await loginWithMicrosoft();
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            clearAuthData();
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    }

    /**
     * Login with Microsoft
     */
    async function loginWithMicrosoft() {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });

            // Check if demo mode
            if (isDemoMode) {
                // Demo mode login
                console.log('🎭 Demo mode - Setting up demo user');

                const demoUser = {
                    id: 'demo-user-123',
                    email: 'demo@student.edu',
                    name: 'Sinh viên Demo',
                    role: {
                        roleName: 'Student',
                        roleId: 1
                    }
                };

                const demoTokens = {
                    sessionToken: 'demo-session-token',
                    refreshToken: 'demo-refresh-token'
                };

                // Store demo data
                localStorage.setItem('sessionToken', demoTokens.sessionToken);
                localStorage.setItem('refreshToken', demoTokens.refreshToken);
                localStorage.setItem('userData', JSON.stringify(demoUser));

                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        user: demoUser,
                        sessionToken: demoTokens.sessionToken,
                        refreshToken: demoTokens.refreshToken
                    }
                });

                // Show success messages
                console.log('✅ Đăng nhập thành công với Demo Mode!');
                console.log('✅ Kết nối API thành công!');
                console.log(`👤 Xin chào: ${demoUser.name}`);

                // Optional: Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Student Scheduler', {
                        body: '✅ Đăng nhập thành công!\n👤 ' + demoUser.name,
                        icon: '/vite.svg'
                    });
                }

                return { success: true, user: demoUser };
            }

            // Microsoft login popup
            if (!msalInstance) {
                throw new Error('MSAL not initialized. Please check your configuration.');
            }

            const loginResponse = await msalInstance.loginPopup({
                scopes: ['User.Read'],
                prompt: 'select_account'
            });

            if (loginResponse.accessToken) {
                // Send token to backend
                const authResponse = await apiService.login(loginResponse.accessToken);

                if (authResponse.success) {
                    // Store tokens and user data
                    localStorage.setItem('sessionToken', authResponse.data.sessionToken);
                    localStorage.setItem('refreshToken', authResponse.data.refreshToken);
                    localStorage.setItem('userData', JSON.stringify(authResponse.data.user));

                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: authResponse.data
                    });

                    return { success: true, user: authResponse.data.user };
                } else {
                    throw new Error('Backend authentication failed');
                }
            } else {
                throw new Error('Microsoft login failed');
            }
        } catch (error) {
            console.error('Login error:', error);

            const errorMessage = error.message || 'Login failed. Please try again.';

            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: { error: errorMessage }
            });

            return { success: false, error: errorMessage };
        }
    }

    /**
     * Silent login attempt
     */
    async function silentLogin() {
        try {
            // Skip silent login in demo mode
            if (isDemoMode || !msalInstance) {
                return false;
            }

            const silentRequest = {
                scopes: ['User.Read'],
                account: msalInstance.getActiveAccount()
            };

            const silentResponse = await msalInstance.acquireTokenSilent(silentRequest);

            if (silentResponse.accessToken) {
                const authResponse = await apiService.login(silentResponse.accessToken);

                if (authResponse.success) {
                    localStorage.setItem('sessionToken', authResponse.data.sessionToken);
                    localStorage.setItem('refreshToken', authResponse.data.refreshToken);
                    localStorage.setItem('userData', JSON.stringify(authResponse.data.user));

                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: authResponse.data
                    });

                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Silent login failed:', error);
            return false;
        }
    }

    /**
     * Refresh authentication token
     */
    async function refreshAuthToken() {
        try {
            // Skip token refresh in demo mode
            if (isDemoMode) {
                return true;
            }

            const refreshResponse = await apiService.refreshToken();

            if (refreshResponse.success) {
                localStorage.setItem('sessionToken', refreshResponse.data.sessionToken);

                dispatch({
                    type: AUTH_ACTIONS.REFRESH_TOKEN,
                    payload: {
                        sessionToken: refreshResponse.data.sessionToken
                    }
                });

                return true;
            } else {
                // Refresh failed, logout user
                await logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            await logout();
            return false;
        }
    }

    /**
     * Logout user
     */
    async function logout() {
        try {
            // Call backend logout (skip in demo mode)
            if (!isDemoMode) {
                await apiService.logout();
            }
        } catch (error) {
            console.error('Backend logout error:', error);
        }

        // Microsoft logout (skip in demo mode)
        if (!isDemoMode && msalInstance) {
            try {
                await msalInstance.logoutPopup({
                    postLogoutRedirectUri: window.location.origin
                });
            } catch (error) {
                console.error('Microsoft logout error:', error);
            }
        }

        // Clear local data
        clearAuthData();

        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }

    /**
     * Update user profile in state
     */
    function updateUserProfile(updatedUser) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));

        dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
                ...state,
                user: updatedUser
            }
        });
    }

    /**
     * Clear authentication data from storage
     */
    function clearAuthData() {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
    }

    /**
     * Clear authentication error
     */
    function clearError() {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }

    /**
     * Check if user has specific role
     */
    function hasRole(role) {
        return state.user?.role?.roleName === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    function hasAnyRole(roles) {
        if (!state.user?.role?.roleName) return false;
        return roles.includes(state.user.role.roleName);
    }

    const value = {
        // State
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        loginAttempts: state.loginAttempts,
        lastLoginTime: state.lastLoginTime,

        // Actions
        loginWithMicrosoft,
        silentLogin,
        logout,
        refreshAuthToken,
        updateUserProfile,
        clearError,
        hasRole,
        hasAnyRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use authentication context
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
