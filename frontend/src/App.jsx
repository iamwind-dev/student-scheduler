/**
 * MAIN APP COMPONENT v2.0
 * Root application component with providers and routing
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastContainer, useToast } from './components/common/Toast';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const CoursesPage = lazy(() => import('./pages/courses/CoursesPage'));
const CourseDetailsPage = lazy(() => import('./pages/courses/CourseDetailsPage'));
const PreferencesPage = lazy(() => import('./pages/preferences/PreferencesPage'));
const SchedulePage = lazy(() => import('./pages/schedule/SchedulePage'));
const ScheduleDetailsPage = lazy(() => import('./pages/schedule/ScheduleDetailsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));

// Styles
import './styles/globals.css';

// App Content Component (needs to be inside AuthProvider)
function AppContent() {
    const { user, isAuthenticated } = useAuth();
    const { toasts, removeToast, showSuccess, showInfo } = useToast();

    // Show login success toast
    useEffect(() => {
        if (isAuthenticated && user) {
            // Show welcome toast after a short delay
            const timer = setTimeout(() => {
                showSuccess(`Đăng nhập thành công! Xin chào ${user.name}`);
                setTimeout(() => {
                    showInfo('Kết nối API thành công');
                }, 200);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user?.id, showSuccess, showInfo]); // Include all dependencies

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="app">
                <Suspense fallback={<LoadingSpinner fullscreen />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            {/* Dashboard */}
                            <Route index element={<DashboardPage />} />

                            {/* Courses */}
                            <Route path="courses" element={<CoursesPage />} />
                            <Route path="courses/:courseId" element={<CourseDetailsPage />} />

                            {/* Preferences */}
                            <Route path="preferences" element={<PreferencesPage />} />

                            {/* Schedule */}
                            <Route path="schedule" element={<SchedulePage />} />
                            <Route path="schedule/:scheduleId" element={<ScheduleDetailsPage />} />

                            {/* Profile */}
                            <Route path="profile" element={<ProfilePage />} />

                            {/* Redirects */}
                            <Route path="dashboard" element={<Navigate to="/" replace />} />
                        </Route>

                        {/* Error Routes */}
                        <Route path="/404" element={<NotFoundPage />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
}

function App() {
    useEffect(() => {
        // Set theme on app load
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Set up global error handlers
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleGlobalError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleGlobalError);
        };
    }, []);

    const handleUnhandledRejection = (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Could send to error reporting service
    };

    const handleGlobalError = (event) => {
        console.error('Global error:', event.error);
        // Could send to error reporting service
    };

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, errorInfo) => {
                console.error('React Error Boundary:', error, errorInfo);
            }}
            onReset={() => {
                window.location.reload();
            }}
        >
            <AppProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
