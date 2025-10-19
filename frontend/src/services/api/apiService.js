/**
 * API SERVICE v2.0
 * Professional API client with interceptors and error handling
 */

import axios from 'axios';

class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

        // Create axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Setup interceptors
        this.setupInterceptors();
    }

    /**
     * Setup request and response interceptors
     */
    setupInterceptors() {
        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('sessionToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add request timestamp for debugging
                config.metadata = { startTime: Date.now() };

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - handle common errors
        this.client.interceptors.response.use(
            (response) => {
                // Log response time
                const duration = Date.now() - response.config.metadata.startTime;
                if (duration > 5000) {
                    console.warn(`Slow API response: ${response.config.url} took ${duration}ms`);
                }

                return response.data; // Return only data portion
            },
            (error) => {
                return this.handleResponseError(error);
            }
        );
    }

    /**
     * Handle API response errors
     */
    handleResponseError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Token expired - redirect to login
                    this.handleUnauthorized();
                    break;

                case 403:
                    // Forbidden - show access denied message
                    this.handleForbidden();
                    break;

                case 429:
                    // Rate limited - show retry message
                    this.handleRateLimit(error.response);
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors - show generic error message
                    this.handleServerError(status);
                    break;
            }

            // Return structured error
            return Promise.reject({
                status,
                message: data?.error?.message || 'An error occurred',
                code: data?.error?.code || 'UNKNOWN_ERROR',
                details: data?.error?.details
            });
        }

        if (error.request) {
            // Network error
            return Promise.reject({
                status: 0,
                message: 'Network error - please check your connection',
                code: 'NETWORK_ERROR'
            });
        }

        // Other error
        return Promise.reject({
            status: 0,
            message: error.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
        });
    }

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        // Clear stored tokens
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('refreshToken');

        // Redirect to login
        window.location.href = '/login';
    }

    /**
     * Handle forbidden access
     */
    handleForbidden() {
        // Show notification or redirect to access denied page
        console.error('Access denied - insufficient permissions');
    }

    /**
     * Handle rate limiting
     */
    handleRateLimit(response) {
        const retryAfter = response.headers['retry-after'];
        console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    /**
     * Handle server errors
     */
    handleServerError(status) {
        console.error(`Server error: ${status}`);
    }

    // =====================================
    // AUTHENTICATION ENDPOINTS
    // =====================================

    /**
     * Login with Microsoft token
     */
    async login(accessToken, tokenType = 'Bearer') {
        return this.client.post('/user/login', {
            accessToken,
            tokenType
        });
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        return this.client.post('/user/refresh', {}, {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });
    }

    /**
     * Logout
     */
    async logout() {
        return this.client.post('/user/logout');
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        return this.client.get('/user/profile');
    }

    /**
     * Validate current session
     */
    async validateSession() {
        return this.client.get('/auth/validate');
    }

    // =====================================
    // USER MANAGEMENT ENDPOINTS
    // =====================================

    /**
     * Get current user details
     */
    async getCurrentUser() {
        return this.client.get('/users/me');
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        return this.client.put('/users/me', profileData);
    }

    /**
     * Get user enrollments
     */
    async getUserEnrollments(semesterCode = null) {
        const params = semesterCode ? { semesterCode } : {};
        return this.client.get('/users/me/enrollments', { params });
    }

    /**
     * Enroll in course
     */
    async enrollInCourse(courseID, enrollmentType = 'Enrolled') {
        return this.client.post('/users/me/enrollments', {
            courseID,
            enrollmentType
        });
    }

    /**
     * Drop course enrollment
     */
    async dropEnrollment(enrollmentId) {
        return this.client.delete(`/users/me/enrollments/${enrollmentId}`);
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        return this.client.get('/users/me/statistics');
    }

    // =====================================
    // COURSE MANAGEMENT ENDPOINTS
    // =====================================

    /**
     * Get courses with filtering and pagination
     */
    async getCourses(filters = {}, page = 1, limit = 20) {
        const params = {
            ...filters,
            page,
            limit
        };

        return this.client.get('/courses', { params });
    }

    /**
     * Get course details by ID
     */
    async getCourseDetails(courseId) {
        return this.client.get(`/courses/${courseId}`);
    }

    /**
     * Search courses
     */
    async searchCourses(searchParams = {}, page = 1, limit = 20) {
        const params = {
            ...searchParams,
            page,
            limit
        };

        return this.client.get('/courses/search', { params });
    }

    /**
     * Get available semesters
     */
    async getSemesters() {
        return this.client.get('/courses/semesters');
    }

    /**
     * Get available subjects
     */
    async getSubjects(filters = {}) {
        return this.client.get('/courses/subjects', { params: filters });
    }

    /**
     * Get available lecturers
     */
    async getLecturers(filters = {}) {
        return this.client.get('/courses/lecturers', { params: filters });
    }

    /**
     * Get available campuses
     */
    async getCampuses() {
        return this.client.get('/courses/campuses');
    }

    /**
     * Check course conflicts
     */
    async checkCourseConflicts(courseId, semesterCode) {
        const params = semesterCode ? { semesterCode } : {};
        return this.client.get(`/courses/${courseId}/conflicts`, { params });
    }

    // =====================================
    // PREFERENCES ENDPOINTS
    // =====================================

    /**
     * Get user preferences
     */
    async getPreferences(semesterCode = null) {
        const params = semesterCode ? { semesterCode } : {};
        return this.client.get('/preferences', { params });
    }

    /**
     * Create preferences
     */
    async createPreferences(preferenceData) {
        return this.client.post('/preferences', preferenceData);
    }

    /**
     * Update preferences
     */
    async updatePreferences(preferenceId, preferenceData) {
        return this.client.put(`/preferences/${preferenceId}`, preferenceData);
    }

    /**
     * Delete preferences
     */
    async deletePreferences(preferenceId) {
        return this.client.delete(`/preferences/${preferenceId}`);
    }

    /**
     * Get preference templates
     */
    async getPreferenceTemplates() {
        return this.client.get('/preferences/templates');
    }

    /**
     * Copy preferences between semesters
     */
    async copyPreferences(sourceSemesterCode, targetSemesterCode, overwrite = false) {
        return this.client.post('/preferences/copy', {
            sourceSemesterCode,
            targetSemesterCode,
            overwrite
        });
    }

    /**
     * Validate preferences
     */
    async validatePreferences(semesterCode) {
        return this.client.get('/preferences/validation', {
            params: { semesterCode }
        });
    }

    // =====================================
    // SCHEDULE ENDPOINTS
    // =====================================

    /**
     * Generate schedule recommendations
     */
    async generateSchedule(generationParams) {
        return this.client.post('/schedules/generate', generationParams);
    }

    /**
     * Get schedule history
     */
    async getScheduleHistory(filters = {}, page = 1, limit = 10) {
        const params = {
            ...filters,
            page,
            limit
        };

        return this.client.get('/schedules/history', { params });
    }

    /**
     * Get schedule details
     */
    async getScheduleDetails(scheduleId) {
        return this.client.get(`/schedules/${scheduleId}`);
    }

    /**
     * Bookmark schedule
     */
    async bookmarkSchedule(scheduleId) {
        return this.client.post(`/schedules/${scheduleId}/bookmark`);
    }

    /**
     * Apply schedule (enroll in courses)
     */
    async applySchedule(scheduleId, options = {}) {
        return this.client.post(`/schedules/${scheduleId}/apply`, options);
    }

    /**
     * Compare schedules
     */
    async compareSchedules(scheduleId, compareWith) {
        return this.client.post(`/schedules/${scheduleId}/compare`, compareWith);
    }

    /**
     * Optimize schedule
     */
    async optimizeSchedule(optimizationParams) {
        return this.client.post('/schedules/optimize', optimizationParams);
    }

    /**
     * Get schedule analytics
     */
    async getScheduleAnalytics(filters = {}) {
        return this.client.get('/schedules/analytics', { params: filters });
    }

    /**
     * Delete schedule
     */
    async deleteSchedule(scheduleId) {
        return this.client.delete(`/schedules/${scheduleId}`);
    }

    // =====================================
    // UTILITY METHODS
    // =====================================

    /**
     * Upload file (generic)
     */
    async uploadFile(file, endpoint) {
        const formData = new FormData();
        formData.append('file', file);

        return this.client.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Download file (generic)
     */
    async downloadFile(endpoint, filename) {
        const response = await this.client.get(endpoint, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get API health status
     */
    async getHealthStatus() {
        return this.client.get('/health');
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
