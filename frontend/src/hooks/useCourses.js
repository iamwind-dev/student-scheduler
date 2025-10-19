/**
 * COURSES HOOK v2.0
 * Course management with caching and state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api/apiService';

export function useCourses(initialFilters = {}) {
    // State
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [filters, setFilters] = useState({
        semesterCode: '',
        subjectCode: '',
        campusCode: '',
        dayOfWeek: null,
        lecturer: '',
        credits: null,
        search: '',
        ...initialFilters
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // App context
    const { handleApiError, showSuccess, showError } = useApp();

    // Cache
    const [cache, setCache] = useState({});
    const [lastFetch, setLastFetch] = useState(null);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Generate cache key for current filters
     */
    const getCacheKey = useCallback((currentFilters, currentPage) => {
        const key = JSON.stringify({
            ...currentFilters,
            page: currentPage
        });
        return btoa(key); // Base64 encode for safe key
    }, []);

    /**
     * Check if cache is valid
     */
    const isCacheValid = useCallback((cacheEntry) => {
        if (!cacheEntry) return false;
        return (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
    }, []);

    /**
     * Fetch courses with caching
     */
    const fetchCourses = useCallback(async (currentFilters = filters, currentPage = pagination.page, forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const cacheKey = getCacheKey(currentFilters, currentPage);
            const cachedData = cache[cacheKey];

            // Return cached data if valid and not forcing refresh
            if (!forceRefresh && isCacheValid(cachedData)) {
                setCourses(cachedData.data.courses);
                setPagination(cachedData.data.pagination);
                setLastFetch(cachedData.timestamp);
                setLoading(false);
                return cachedData.data;
            }

            // Fetch from API
            const response = await apiService.getCourses(currentFilters, currentPage, pagination.limit);

            if (response.success) {
                const { courses: fetchedCourses, pagination: paginationData } = response.data;

                setCourses(fetchedCourses);
                setPagination(paginationData);

                // Update cache
                const cacheEntry = {
                    data: response.data,
                    timestamp: Date.now()
                };
                setCache(prevCache => ({
                    ...prevCache,
                    [cacheKey]: cacheEntry
                }));
                setLastFetch(Date.now());

                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch courses');
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to load courses';
            setError(errorMessage);
            handleApiError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit, cache, getCacheKey, isCacheValid, handleApiError]);

    /**
     * Search courses
     */
    const searchCourses = useCallback(async (searchParams, page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.searchCourses(searchParams, page, pagination.limit);

            if (response.success) {
                setCourses(response.data.courses);
                setPagination(response.data.pagination);
                return response.data;
            } else {
                throw new Error(response.error || 'Search failed');
            }
        } catch (err) {
            const errorMessage = err.message || 'Search failed';
            setError(errorMessage);
            handleApiError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [pagination.limit, handleApiError]);

    /**
     * Get course details
     */
    const getCourseDetails = useCallback(async (courseId) => {
        try {
            setLoading(true);

            const response = await apiService.getCourseDetails(courseId);

            if (response.success) {
                setSelectedCourse(response.data);
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch course details');
            }
        } catch (err) {
            handleApiError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    /**
     * Check course conflicts
     */
    const checkConflicts = useCallback(async (courseId, semesterCode) => {
        try {
            const response = await apiService.checkCourseConflicts(courseId, semesterCode);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to check conflicts');
            }
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    }, [handleApiError]);

    /**
     * Enroll in course
     */
    const enrollInCourse = useCallback(async (courseId, enrollmentType = 'Enrolled') => {
        try {
            setLoading(true);

            const response = await apiService.enrollInCourse(courseId, enrollmentType);

            if (response.success) {
                showSuccess('Successfully enrolled in course!');
                // Refresh courses to update enrollment count
                await fetchCourses(filters, pagination.page, true);
                return response.data;
            } else {
                throw new Error(response.error || 'Enrollment failed');
            }
        } catch (err) {
            handleApiError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, fetchCourses, showSuccess, handleApiError]);

    /**
     * Update filters
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    /**
     * Clear filters
     */
    const clearFilters = useCallback(() => {
        setFilters({
            semesterCode: '',
            subjectCode: '',
            campusCode: '',
            dayOfWeek: null,
            lecturer: '',
            credits: null,
            search: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    /**
     * Go to specific page
     */
    const goToPage = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    /**
     * Change page size
     */
    const changePageSize = useCallback((limit) => {
        setPagination(prev => ({
            ...prev,
            limit,
            page: 1 // Reset to first page
        }));
    }, []);

    /**
     * Refresh data
     */
    const refresh = useCallback(() => {
        return fetchCourses(filters, pagination.page, true);
    }, [fetchCourses, filters, pagination.page]);

    /**
     * Clear cache
     */
    const clearCache = useCallback(() => {
        setCache({});
        setLastFetch(null);
    }, []);

    // Apply local filtering for instant search
    useEffect(() => {
        if (!filters.search) {
            setFilteredCourses(courses);
            return;
        }

        const searchTerm = filters.search.toLowerCase();
        const filtered = courses.filter(course => {
            return (
                course.courseCode?.toLowerCase().includes(searchTerm) ||
                course.subject?.subjectName?.toLowerCase().includes(searchTerm) ||
                course.lecturer?.lecturerName?.toLowerCase().includes(searchTerm) ||
                course.subject?.department?.toLowerCase().includes(searchTerm)
            );
        });

        setFilteredCourses(filtered);
    }, [courses, filters.search]);

    // Fetch courses when filters change
    useEffect(() => {
        if (Object.values(filters).some(value => value !== '' && value !== null)) {
            fetchCourses();
        }
    }, [filters, pagination.page, pagination.limit]);

    // Computed values
    const hasFilters = useMemo(() => {
        return Object.values(filters).some(value => value !== '' && value !== null);
    }, [filters]);

    const displayCourses = useMemo(() => {
        return filters.search ? filteredCourses : courses;
    }, [courses, filteredCourses, filters.search]);

    const stats = useMemo(() => {
        return {
            total: pagination.total,
            displayed: displayCourses.length,
            hasMore: pagination.page < pagination.totalPages,
            currentPage: pagination.page,
            totalPages: pagination.totalPages
        };
    }, [pagination, displayCourses]);

    return {
        // Data
        courses: displayCourses,
        selectedCourse,
        filters,
        pagination,
        stats,

        // State
        loading,
        error,
        hasFilters,
        lastFetch,

        // Actions
        fetchCourses,
        searchCourses,
        getCourseDetails,
        checkConflicts,
        enrollInCourse,
        updateFilters,
        clearFilters,
        goToPage,
        changePageSize,
        refresh,
        clearCache,
        setSelectedCourse
    };
}
