import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';

const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MORNING_PERIODS = [1, 2, 3, 4, 5];
const AFTERNOON_PERIODS = [6, 7, 8, 9, 10];

const ProfilePage = () => {
    const { user } = useAuth();
    const [savedSchedule, setSavedSchedule] = useState(null);
    const [scheduleTable, setScheduleTable] = useState({});

    useEffect(() => {
        if (user) {
            loadSchedule();
        }
    }, [user]);

    const loadSchedule = async () => {
        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!user || !user.email) {
                console.log('❌ Chưa đăng nhập, không thể load schedule');
                return;
            }

            // Load từ SQL Server với userId thực
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';
            const userId = user.email || user.id;
            
            console.log(`📥 Loading schedule for user: ${userId}`);
            const response = await fetch(`${API_URL}/schedules/user/${encodeURIComponent(userId)}`);
            const result = await response.json();

            // API returns: { success, data: { success, schedules: [...] } }
            const schedules = result.data?.schedules || result.schedules || [];
            
            if (result.success && schedules.length > 0) {
                // Lấy schedule mới nhất - API đã trả về courses trong schedules
                const latestSchedule = schedules[0];
                
                // Courses đã có sẵn trong schedule (từ coursesJson)
                const courses = latestSchedule.courses || [];
                
                const data = {
                    scheduleId: latestSchedule.scheduleId,
                    scheduleName: latestSchedule.scheduleName || `Lịch học ${new Date(latestSchedule.createdAt).toLocaleDateString('vi-VN')}`,
                    courses: courses,
                    totalCredits: latestSchedule.totalCredits,
                    createdAt: latestSchedule.createdAt
                };
                
                // Rebuild schedule object từ courses
                const scheduleObj = {};
                courses.forEach(course => {
                    const timeInfo = parseCourseTime(course.time || course.Time);
                    if (timeInfo) {
                        const key = `${timeInfo.day}-${timeInfo.startPeriod}-${timeInfo.endPeriod}`;
                        scheduleObj[key] = {
                            ...course,
                            courseName: course.courseName || course.CourseName,
                            lecturer: course.lecturer || course.Lecturer,
                            credits: course.credits || course.Credits
                        };
                    }
                });
                
                data.schedule = scheduleObj;
                setSavedSchedule(data);
                setScheduleTable(scheduleObj);
                
                console.log(`✅ Loaded schedule: ${data.scheduleName} (${courses.length} courses)`);
            } else {
                console.log('⚠️ Chưa có schedule được lưu trong database');
            }
        } catch (error) {
            console.error('❌ Load schedule error:', error);
        }
    };

    // Helper function to parse course time
    const parseCourseTime = (timeString) => {
        if (!timeString) return null;
        const parts = timeString.split('|');
        if (parts.length !== 2) return null;

        const day = parts[0].trim();
        const periodMatch = parts[1].match(/Tiết (\d+)->(\d+)|Tiết (\d+)/);
        if (!periodMatch) return null;

        const startPeriod = parseInt(periodMatch[1] || periodMatch[3]);
        const endPeriod = parseInt(periodMatch[2] || periodMatch[3]);

        return { day, startPeriod, endPeriod };
    };

    const deleteSchedule = async () => {
        if (!confirm('Bạn có chắc muốn xóa TẤT CẢ thời khóa biểu đã lưu?\n\n⚠️ Hành động này sẽ xóa:\n- Tất cả data trong localStorage\n- Tất cả schedules trong Azure SQL Database')) {
            return;
        }

        try {
            // 1. Xóa localStorage
            localStorage.clear();
            
            // 2. Xóa tất cả schedules từ database
            if (user && user.email) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';
                
                // Get all schedules của user
                const getResponse = await fetch(`${API_URL}/schedules/user/${user.email}`);
                const getResult = await getResponse.json();
                
                if (getResult.success && getResult.data?.schedules) {
                    // Xóa từng schedule
                    for (const schedule of getResult.data.schedules) {
                        await fetch(`${API_URL}/schedules/${schedule.ScheduleId}`, {
                            method: 'DELETE'
                        });
                    }
                }
            }
            
            setSavedSchedule(null);
            setScheduleTable({});
            alert('✅ Đã xóa tất cả thời khóa biểu thành công!');
            
        } catch (error) {
            console.error('Delete error:', error);
            // Vẫn xóa localStorage dù có lỗi
            localStorage.clear();
            setSavedSchedule(null);
            setScheduleTable({});
            alert('⚠️ Đã xóa localStorage. Có thể còn data trong database.');
        }
    };

    // Render course in cell
    const renderCell = (day, period) => {
        // Find course in this cell
        for (const key in scheduleTable) {
            const [schedDay, startPeriod, endPeriod] = key.split('-').map((v, i) => i === 0 ? v : parseInt(v));
            if (schedDay === day && period >= startPeriod && period <= endPeriod) {
                if (period === startPeriod) {
                    const course = scheduleTable[key];
                    const span = endPeriod - startPeriod + 1;
                    return (
                        <div
                            className="schedule-course-cell"
                            style={{
                                '--span': span,
                                gridRow: `span ${span}`
                            }}
                        >
                            <div className="course-name">{course.courseName}</div>
                            <div className="course-info">
                                <span>📍 {course.room}</span>
                                <span>👨‍🏫 {course.lecturer}</span>
                            </div>
                            <div className="course-credits">{course.credits || 2} TC</div>
                        </div>
                    );
                }
                return null; // Skip merged cells
            }
        }
        return <div className="empty-cell">-</div>;
    };

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header-card">
                <div className="profile-avatar-large">
                    {user?.name?.charAt(0) || 'S'}
                </div>
                <div className="profile-info-section">
                    <h1 className="profile-name">{user?.name || 'Sinh viên'}</h1>
                    <p className="profile-email">{user?.email || 'student@example.com'}</p>
                    <div className="profile-badges">
                        <span className="badge badge-primary">🎓 Sinh viên</span>
                        <span className="badge badge-success">✅ Đã xác thực</span>
                    </div>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="schedule-section">
                <div className="section-header">
                    <h2>📅 Thời khóa biểu đã lưu</h2>
                    {savedSchedule && (
                        <button className="btn-delete-modern" onClick={deleteSchedule}>
                            🗑️ Xóa lịch
                        </button>
                    )}
                </div>

                {savedSchedule ? (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card stat-primary">
                                <div className="stat-icon">📚</div>
                                <div className="stat-content">
                                    <div className="stat-value">{savedSchedule.courses.length}</div>
                                    <div className="stat-label">Môn học</div>
                                </div>
                            </div>
                            <div className="stat-card stat-success">
                                <div className="stat-icon">✨</div>
                                <div className="stat-content">
                                    <div className="stat-value">{savedSchedule.totalCredits}</div>
                                    <div className="stat-label">Tín chỉ</div>
                                </div>
                            </div>
                            <div className="stat-card stat-info">
                                <div className="stat-icon">📆</div>
                                <div className="stat-content">
                                    <div className="stat-value">
                                        {new Date(savedSchedule.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="stat-label">Ngày tạo</div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <div className="schedule-table-container">
                            <h3 className="table-title">🗓️ Lịch học trong tuần</h3>

                            {/* Morning Schedule */}
                            <div className="period-section">
                                <h4 className="period-header">☀️ Buổi sáng (Tiết 1-5)</h4>
                                <div className="schedule-table">
                                    <div className="table-header">
                                        <div className="header-cell period-cell">Tiết</div>
                                        {DAYS.map(day => (
                                            <div key={day} className="header-cell">{day}</div>
                                        ))}
                                    </div>

                                    {MORNING_PERIODS.map(period => (
                                        <div key={period} className="table-row">
                                            <div className="period-label">{period}</div>
                                            {DAYS.map(day => (
                                                <div key={`${day}-${period}`} className="table-cell">
                                                    {renderCell(day, period)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Afternoon Schedule */}
                            <div className="period-section">
                                <h4 className="period-header">🌙 Buổi chiều (Tiết 6-10)</h4>
                                <div className="schedule-table">
                                    <div className="table-header">
                                        <div className="header-cell period-cell">Tiết</div>
                                        {DAYS.map(day => (
                                            <div key={day} className="header-cell">{day}</div>
                                        ))}
                                    </div>

                                    {AFTERNOON_PERIODS.map(period => (
                                        <div key={period} className="table-row">
                                            <div className="period-label">{period}</div>
                                            {DAYS.map(day => (
                                                <div key={`${day}-${period}`} className="table-cell">
                                                    {renderCell(day, period)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Course List */}
                        {/* <div className="course-list-section">
                            <h3 className="section-title">📖 Danh sách môn học chi tiết</h3>
                            <div className="course-grid">
                                {savedSchedule.courses.map((course, index) => (
                                    <div key={index} className="course-card-modern">
                                        <div className="course-header-modern">
                                            <span className="course-number">#{index + 1}</span>
                                            <span className="course-credits-badge">{course.credits || 2} TC</span>
                                        </div>
                                        <h4 className="course-title">{course.courseName}</h4>
                                        <div className="course-details-modern">
                                            <div className="detail-row">
                                                <span className="detail-icon">🕐</span>
                                                <span>{course.time}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-icon">📍</span>
                                                <span>{course.room}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-icon">👨‍🏫</span>
                                                <span>{course.lecturer}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}
                    </>
                ) : (
                    <div className="empty-state-modern">
                        <div className="empty-icon">📋</div>
                        <h3>Chưa có thời khóa biểu</h3>
                        <p>Bạn chưa lưu thời khóa biểu nào. Hãy tạo lịch học mới!</p>
                        <a href="/schedule" className="btn-create-schedule">
                            ➕ Tạo thời khóa biểu
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
