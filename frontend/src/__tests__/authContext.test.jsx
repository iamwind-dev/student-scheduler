/**
 * AUTHENTICATION CONTEXT TEST
 * Test suite for AuthContext functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock component to test useAuth hook
const MockAuthComponent = () => {
    const { user, isAuthenticated, isLoading, loginWithMicrosoft, logout } = useAuth();

    return (
        <div>
            <div data-testid="loading-status">{isLoading ? 'Loading' : 'Ready'}</div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div data-testid="user-info">{user ? user.name : 'No User'}</div>
            <button onClick={loginWithMicrosoft} data-testid="login-btn">
                Login
            </button>
            <button onClick={logout} data-testid="logout-btn">
                Logout
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    // Test 1: Initial state
    it('should initialize with correct initial state', async () => {
        render(
            <AuthProvider>
                <MockAuthComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            const loadingStatus = screen.getByTestId('loading-status');
            expect(loadingStatus.textContent).toBe('Ready');
        });

        const authStatus = screen.getByTestId('auth-status');
        expect(authStatus.textContent).toBe('Not Authenticated');

        const userInfo = screen.getByTestId('user-info');
        expect(userInfo.textContent).toBe('No User');
    });

    // Test 2: Check if useAuth can be called within provider
    it('should provide useAuth hook correctly', () => {
        render(
            <AuthProvider>
                <MockAuthComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    });

    // Test 3: Demo mode login (without Azure AD)
    it('should handle demo mode login correctly', async () => {
        render(
            <AuthProvider>
                <MockAuthComponent />
            </AuthProvider>
        );

        const loginBtn = screen.getByTestId('login-btn');
        loginBtn.click();

        // In demo mode, should login automatically
        await waitFor(() => {
            const authStatus = screen.getByTestId('auth-status');
            expect(authStatus.textContent).toBe('Authenticated');
        }, { timeout: 3000 });
    });

    // Test 4: Check if error is handled gracefully
    it('should render without throwing useApp error', () => {
        // This test ensures AppProvider is working
        const { container } = render(
            <AuthProvider>
                <MockAuthComponent />
            </AuthProvider>
        );

        expect(container).toBeInTheDocument();
    });
});

describe('AuthContext Error Handling', () => {
    // Test 5: useAuth must be used within AuthProvider
    it('should throw error when useAuth is used outside AuthProvider', () => {
        // Suppress console.error for this test
        const consoleError = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            render(<MockAuthComponent />);
        }).toThrow('useAuth must be used within an AuthProvider');

        consoleError.mockRestore();
    });
});
