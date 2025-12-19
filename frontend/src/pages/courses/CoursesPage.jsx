/**
 * COURSES PAGE
 * Display and manage courses with credits
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookIcon, TeacherIcon, ClockIcon, LocationIcon, CalendarIcon, WarningIcon } from '../../components/common/Icons';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCredits, setFilterCredits] = useState('all');
    const [filterLecturer, setFilterLecturer] = useState('all');
    const [filterRoom, setFilterRoom] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'https://student-api-func.azurewebsites.net/api';
            const response = await fetch(`${API_URL}/courses`);

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            setCourses(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Không thể tải danh sách môn học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.lecturer?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCredits =
            filterCredits === 'all' ||
            course.credits?.toString() === filterCredits;

        const matchesLecturer =
            filterLecturer === 'all' ||
            course.lecturer === filterLecturer;

        const matchesRoom =
            filterRoom === 'all' ||
            course.room?.startsWith(filterRoom);

        return matchesSearch && matchesCredits && matchesLecturer && matchesRoom;
    });

    const uniqueCredits = [...new Set(courses.map(c => c.credits))].filter(Boolean).sort((a, b) => a - b);
    const uniqueLecturers = [...new Set(courses.map(c => c.lecturer))].filter(Boolean).sort();
    const uniqueCampuses = [...new Set(courses.map(c => c.room?.split('.')[0]))].filter(Boolean).sort();

    if (loading) {
        return <LoadingSpinner fullscreen message="Đang tải danh sách môn học..." />;
    }

    return (
        <div className="courses-page" style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}><BookIcon size={28} /> Quản lý môn học</h1>
                <p style={styles.subtitle}>Tổng số: {courses.length} môn học</p>
            </div>

            {error && (
                <div style={styles.errorBox}>
                    <span><WarningIcon size={20} /></span>
                    <p>{error}</p>
                    <button onClick={fetchCourses} style={styles.retryBtn}>Thử lại</button>
                </div>
            )}

            <div style={styles.filterSection}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên hoặc mã môn học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />

                <select
                    value={filterCredits}
                    onChange={(e) => setFilterCredits(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="all">Tất cả tín chỉ</option>
                    {uniqueCredits.map(credit => (
                        <option key={credit} value={credit}>{credit} tín chỉ</option>
                    ))}
                </select>

                <select
                    value={filterLecturer}
                    onChange={(e) => setFilterLecturer(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="all">Tất cả giảng viên</option>
                    {uniqueLecturers.map(lecturer => (
                        <option key={lecturer} value={lecturer}>{lecturer}</option>
                    ))}
                </select>

                <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="all">Tất cả cơ sở</option>
                    {uniqueCampuses.map(campus => (
                        <option key={campus} value={campus}>Cơ sở {campus}</option>
                    ))}
                </select>
            </div>

            <div style={styles.statsBar}>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Tìm thấy:</span>
                    <span style={styles.statValue}>{filteredCourses.length} môn</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Tổng tín chỉ:</span>
                    <span style={styles.statValue}>
                        {filteredCourses.reduce((sum, c) => sum + (c.credits || 0), 0)} TC
                    </span>
                </div>
            </div>

            <div style={styles.courseGrid}>
                {filteredCourses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🔍</span>
                        <p>Không tìm thấy môn học nào</p>
                    </div>
                ) : (
                    filteredCourses.map((course) => (
                        <div key={course.courseId} style={styles.courseCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.courseName}>{course.courseName}</h3>
                                <span style={styles.creditBadge}>
                                    {course.credits || 0} TC
                                </span>
                            </div>
                            <div style={styles.cardBody}>
                                <p style={styles.courseInfo}>
                                    <span style={styles.infoIcon}><TeacherIcon size={16} /></span>
                                    <strong>Giảng viên:</strong> {course.lecturer || 'Chưa có'}
                                </p>
                                <p style={styles.courseInfo}>
                                    <span style={styles.infoIcon}><ClockIcon size={16} /></span>
                                    <strong>Thời gian:</strong> {course.time || 'Chưa có'}
                                </p>
                                <p style={styles.courseInfo}>
                                    <span style={styles.infoIcon}><LocationIcon size={16} /></span>
                                    <strong>Phòng:</strong> {course.room || 'Chưa có'}
                                </p>
                                <p style={styles.courseInfo}>
                                    <span style={styles.infoIcon}><CalendarIcon size={16} /></span>
                                    <strong>Tuần học:</strong> {course.weeks || 'Chưa có'}
                                </p>
                                <p style={styles.courseInfo}>
                                    <span style={styles.infoIcon}><TeacherIcon size={16} /></span>
                                    <strong>Sỉ số:</strong> {course.quantity || 0} sinh viên
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '30px'
    },
    title: {
        fontSize: '2em',
        color: '#333',
        marginBottom: '8px'
    },
    subtitle: {
        color: '#666',
        fontSize: '1.1em'
    },
    errorBox: {
        background: '#fee',
        border: '2px solid #f66',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    retryBtn: {
        marginLeft: 'auto',
        padding: '8px 16px',
        background: '#f66',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    filterSection: {
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    searchInput: {
        flex: 1,
        minWidth: '250px',
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        outline: 'none'
    },
    filterSelect: {
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        minWidth: '180px'
    },
    statsBar: {
        display: 'flex',
        gap: '24px',
        marginBottom: '24px',
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '8px'
    },
    statItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    statLabel: {
        color: '#666',
        fontSize: '14px'
    },
    statValue: {
        color: '#333',
        fontSize: '18px',
        fontWeight: '600'
    },
    courseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
    },
    courseCard: {
        background: 'white',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '16px',
        gap: '12px'
    },
    courseName: {
        fontSize: '1.1em',
        color: '#333',
        margin: 0,
        lineHeight: '1.4',
        flex: 1
    },
    creditBadge: {
        background: '#667eea',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.9em',
        fontWeight: '600',
        flexShrink: 0
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    courseCode: {
        color: '#666',
        fontSize: '0.95em',
        margin: 0
    },
    courseDesc: {
        color: '#888',
        fontSize: '0.9em',
        margin: 0,
        lineHeight: '1.5'
    },
    courseInfo: {
        color: '#555',
        fontSize: '0.9em',
        margin: '6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    infoIcon: {
        fontSize: '1em',
        width: '20px'
    },
    emptyState: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '60px 20px',
        color: '#999'
    },
    emptyIcon: {
        fontSize: '4em',
        display: 'block',
        marginBottom: '16px'
    }
};

export default CoursesPage;
