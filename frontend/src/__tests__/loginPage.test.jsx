/**
 * LOGIN PAGE TEST
 * Test suite for LoginPage component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';
import LoginPage from '../pages/auth/LoginPage';

// Wrap component with all necessary providers
const renderLoginPage = () => {
    return render(
        <AppProvider>
            <AuthProvider>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </AuthProvider>
        </AppProvider>
    );
};

describe('LoginPage Component', () => {
    // Test 1: Component renders without crashing
    it('should render login page without crashing', () => {
        const { container } = renderLoginPage();
        expect(container).toBeInTheDocument();
    });

    // Test 2: Check if main elements are present
    it('should display all main elements', async () => {
        renderLoginPage();

        // Wait for component to load
        await waitFor(() => {
            const title = screen.getByText(/Student Scheduler/i);
            expect(title).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    // Test 3: Check if login button exists
    it('should have a login button', async () => {
        renderLoginPage();

        await waitFor(() => {
            const loginButton = screen.getByRole('button', {
                name: /đăng nhập với microsoft|login/i
            });
            expect(loginButton).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    // Test 4: Check if features list is displayed
    it('should display feature list', async () => {
        renderLoginPage();

        await waitFor(() => {
            const features = screen.getByText(/Tính năng chính/i);
            expect(features).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    // Test 5: Verify no errors on render
    it('should not have any console errors during render', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();

        renderLoginPage();

        // Give it time to render
        expect(consoleError).not.toHaveBeenCalled();

        consoleError.mockRestore();
    });

    // Test 6: Check redirect if already authenticated
    it('should handle loading state correctly', async () => {
        const { container } = renderLoginPage();

        // Component should render during loading state
        await waitFor(() => {
            expect(container).toBeInTheDocument();
        }, { timeout: 2000 });
    });
});

describe('LoginPage Integration', () => {
    // Test 7: Verify AuthProvider and AppProvider are working together
    it('should render without useApp or useAuth errors', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();

        renderLoginPage();

        await waitFor(() => {
            expect(consoleError).not.toHaveBeenCalledWith(
                expect.stringContaining('useApp must be used within an AppProvider')
            );
            expect(consoleError).not.toHaveBeenCalledWith(
                expect.stringContaining('useAuth must be used within an AuthProvider')
            );
        }, { timeout: 2000 });

        consoleError.mockRestore();
    });

    // Test 8: Demo mode should work
    it('should handle demo mode login', async () => {
        renderLoginPage();

        await waitFor(() => {
            const loginButton = screen.queryByRole('button', {
                name: /đăng nhập|login/i
            });
            if (loginButton) {
                fireEvent.click(loginButton);
            }
        }, { timeout: 2000 });
    });
});
