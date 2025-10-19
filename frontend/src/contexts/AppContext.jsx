/**
 * APP CONTEXT v2.0
 * Global application state management
 */

import React, { createContext, useContext, useReducer } from 'react';

// App Context
const AppContext = createContext();

// App Actions
const APP_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_NOTIFICATION: 'SET_NOTIFICATION',
    CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
    SET_THEME: 'SET_THEME',
    TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
    SET_PAGE_TITLE: 'SET_PAGE_TITLE',
    SET_BREADCRUMBS: 'SET_BREADCRUMBS'
};

// Initial State
const initialState = {
    // UI State
    isLoading: false,
    error: null,
    notification: null,
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: window.innerWidth >= 768, // Default open on desktop

    // Navigation State
    pageTitle: 'Student Scheduler',
    breadcrumbs: [],

    // App State
    currentSemester: localStorage.getItem('currentSemester') || null,
    language: localStorage.getItem('language') || 'en'
};

// App Reducer
function appReducer(state, action) {
    switch (action.type) {
        case APP_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case APP_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case APP_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case APP_ACTIONS.SET_NOTIFICATION:
            return {
                ...state,
                notification: action.payload
            };

        case APP_ACTIONS.CLEAR_NOTIFICATION:
            return {
                ...state,
                notification: null
            };

        case APP_ACTIONS.SET_THEME:
            return {
                ...state,
                theme: action.payload
            };

        case APP_ACTIONS.TOGGLE_SIDEBAR:
            return {
                ...state,
                sidebarOpen: !state.sidebarOpen
            };

        case APP_ACTIONS.SET_PAGE_TITLE:
            return {
                ...state,
                pageTitle: action.payload
            };

        case APP_ACTIONS.SET_BREADCRUMBS:
            return {
                ...state,
                breadcrumbs: action.payload
            };

        default:
            return state;
    }
}

// App Provider Component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    /**
     * Set global loading state
     */
    function setLoading(isLoading) {
        dispatch({ type: APP_ACTIONS.SET_LOADING, payload: isLoading });
    }

    /**
     * Set global error
     */
    function setError(error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
        dispatch({ type: APP_ACTIONS.SET_ERROR, payload: errorMessage });
    }

    /**
     * Clear global error
     */
    function clearError() {
        dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration
        };

        dispatch({ type: APP_ACTIONS.SET_NOTIFICATION, payload: notification });

        // Auto-clear notification
        if (duration > 0) {
            setTimeout(() => {
                clearNotification();
            }, duration);
        }
    }

    /**
     * Show success notification
     */
    function showSuccess(message, duration = 3000) {
        showNotification(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    function showError(message, duration = 5000) {
        showNotification(message, 'error', duration);
    }

    /**
     * Show warning notification
     */
    function showWarning(message, duration = 4000) {
        showNotification(message, 'warning', duration);
    }

    /**
     * Show info notification
     */
    function showInfo(message, duration = 3000) {
        showNotification(message, 'info', duration);
    }

    /**
     * Clear notification
     */
    function clearNotification() {
        dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATION });
    }

    /**
     * Toggle theme (light/dark)
     */
    function toggleTheme() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        dispatch({ type: APP_ACTIONS.SET_THEME, payload: newTheme });

        // Update document class for CSS
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    /**
     * Set specific theme
     */
    function setTheme(theme) {
        localStorage.setItem('theme', theme);
        dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Toggle sidebar visibility
     */
    function toggleSidebar() {
        dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
    }

    /**
     * Set sidebar state
     */
    function setSidebar(isOpen) {
        if (state.sidebarOpen !== isOpen) {
            dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
        }
    }

    /**
     * Set page title
     */
    function setPageTitle(title) {
        dispatch({ type: APP_ACTIONS.SET_PAGE_TITLE, payload: title });

        // Update document title
        document.title = `${title} - Student Scheduler`;
    }

    /**
     * Set breadcrumbs
     */
    function setBreadcrumbs(breadcrumbs) {
        dispatch({ type: APP_ACTIONS.SET_BREADCRUMBS, payload: breadcrumbs });
    }

    /**
     * Set current semester
     */
    function setCurrentSemester(semesterCode) {
        localStorage.setItem('currentSemester', semesterCode);
        // Could dispatch action if needed in state
    }

    /**
     * Handle API errors globally
     */
    function handleApiError(error, showNotification = true) {
        console.error('API Error:', error);

        let errorMessage = 'An unexpected error occurred';

        if (error?.message) {
            errorMessage = error.message;
        } else if (error?.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        }

        setError(errorMessage);

        if (showNotification) {
            showError(errorMessage);
        }
    }

    /**
     * Format error for display
     */
    function formatError(error) {
        if (typeof error === 'string') {
            return error;
        }

        if (error?.response?.data?.error?.message) {
            return error.response.data.error.message;
        }

        if (error?.message) {
            return error.message;
        }

        return 'An unexpected error occurred';
    }

    const value = {
        // State
        isLoading: state.isLoading,
        error: state.error,
        notification: state.notification,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        pageTitle: state.pageTitle,
        breadcrumbs: state.breadcrumbs,
        currentSemester: state.currentSemester,
        language: state.language,

        // Actions
        setLoading,
        setError,
        clearError,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearNotification,
        toggleTheme,
        setTheme,
        toggleSidebar,
        setSidebar,
        setPageTitle,
        setBreadcrumbs,
        setCurrentSemester,
        handleApiError,
        formatError
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use app context
export function useApp() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }

    return context;
}

export default AppContext;
