/**
 * APP CONTEXT TEST
 * Test suite for AppContext functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../contexts/AppContext';

// Mock component to test useApp hook
const MockAppComponent = () => {
    const {
        isLoading,
        error,
        notification,
        theme,
        pageTitle,
        setLoading,
        setError,
        clearError,
        showNotification,
        toggleTheme,
        setPageTitle
    } = useApp();

    return (
        <div>
            <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
            <div data-testid="error">{error || 'No Error'}</div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="page-title">{pageTitle}</div>
            <div data-testid="notification">
                {notification ? notification.message : 'No Notification'}
            </div>

            <button onClick={() => setLoading(true)} data-testid="set-loading">
                Set Loading
            </button>
            <button onClick={() => setError('Test Error')} data-testid="set-error">
                Set Error
            </button>
            <button onClick={() => clearError()} data-testid="clear-error">
                Clear Error
            </button>
            <button onClick={() => showNotification('Test Notification')} data-testid="show-notif">
                Show Notification
            </button>
            <button onClick={() => toggleTheme()} data-testid="toggle-theme">
                Toggle Theme
            </button>
            <button onClick={() => setPageTitle('New Title')} data-testid="set-title">
                Set Title
            </button>
        </div>
    );
};

describe('AppContext', () => {
    // Test 1: Initial state
    it('should initialize with correct initial state', () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        const loading = screen.getByTestId('loading');
        expect(loading.textContent).toBe('Ready');

        const error = screen.getByTestId('error');
        expect(error.textContent).toBe('No Error');

        const pageTitle = screen.getByTestId('page-title');
        expect(pageTitle.textContent).toBe('Student Scheduler');
    });

    // Test 2: Check if useApp can be called within provider
    it('should provide useApp hook correctly', () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        expect(screen.getByTestId('set-loading')).toBeInTheDocument();
        expect(screen.getByTestId('set-error')).toBeInTheDocument();
        expect(screen.getByTestId('clear-error')).toBeInTheDocument();
    });

    // Test 3: Set error state
    it('should set error state correctly', async () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        const setErrorBtn = screen.getByTestId('set-error');
        setErrorBtn.click();

        await waitFor(() => {
            const error = screen.getByTestId('error');
            expect(error.textContent).toBe('Test Error');
        });
    });

    // Test 4: Clear error state
    it('should clear error state correctly', async () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        const setErrorBtn = screen.getByTestId('set-error');
        setErrorBtn.click();

        await waitFor(() => {
            const error = screen.getByTestId('error');
            expect(error.textContent).toBe('Test Error');
        });

        const clearErrorBtn = screen.getByTestId('clear-error');
        clearErrorBtn.click();

        await waitFor(() => {
            const error = screen.getByTestId('error');
            expect(error.textContent).toBe('No Error');
        });
    });

    // Test 5: Show notification
    it('should show notification correctly', async () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        const showNotifBtn = screen.getByTestId('show-notif');
        showNotifBtn.click();

        await waitFor(() => {
            const notification = screen.getByTestId('notification');
            expect(notification.textContent).toBe('Test Notification');
        });
    });

    // Test 6: Set page title
    it('should set page title correctly', async () => {
        render(
            <AppProvider>
                <MockAppComponent />
            </AppProvider>
        );

        const setTitleBtn = screen.getByTestId('set-title');
        setTitleBtn.click();

        await waitFor(() => {
            const pageTitle = screen.getByTestId('page-title');
            expect(pageTitle.textContent).toBe('New Title');
        });
    });
});

describe('AppContext Error Handling', () => {
    // Test 7: useApp must be used within AppProvider
    it('should throw error when useApp is used outside AppProvider', () => {
        // Suppress console.error for this test
        const consoleError = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            render(<MockAppComponent />);
        }).toThrow('useApp must be used within an AppProvider');

        consoleError.mockRestore();
    });
});
