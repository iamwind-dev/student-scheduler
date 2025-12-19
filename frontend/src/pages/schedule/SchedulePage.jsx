import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api/apiService';
import './SchedulePage.css';

const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MORNING_PERIODS = [1, 2, 3, 4, 5];
const AFTERNOON_PERIODS = [6, 7, 8, 9, 10];

export default function SchedulePage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('manual');
    const [schedule, setSchedule] = useState({});
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [draggedCourse, setDraggedCourse] = useState(null);
    const [totalCredits, setTotalCredits] = useState(0);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const data = await apiService.getCourses();
                setCourses(data || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    console.log('Schedule Page - Courses:', courses?.length, 'Loading:', loading);

    // Parse course time: "Thứ Hai | Tiết 1->3"
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

    // AI suggest schedule
    const generateAISchedule = () => {
        const newSchedule = {};
        const used = new Set();
        let credits = 0;
        const aiSelected = [];

        // Filter available courses
        const availableCourses = courses.filter(c => {
            const time = parseCourseTime(c.time);
            return time && time.day !== 'Thứ _' && c.quantity > 0;
        });

        // Shuffle courses
        const shuffled = [...availableCourses].sort(() => Math.random() - 0.5);

        for (const course of shuffled) {
            if (credits >= 18) break;

            const time = parseCourseTime(course.time);
            if (!time) continue;

            const key = `${time.day}-${time.startPeriod}-${time.endPeriod}`;

            // Check conflict
            let hasConflict = false;
            for (let p = time.startPeriod; p <= time.endPeriod; p++) {
                const checkKey = `${time.day}-${p}`;
                if (used.has(checkKey)) {
                    hasConflict = true;
                    break;
                }
            }

            if (!hasConflict) {
                newSchedule[key] = course;
                aiSelected.push(course);
                credits += course.credits || 2;

                // Mark periods as used
                for (let p = time.startPeriod; p <= time.endPeriod; p++) {
                    used.add(`${time.day}-${p}`);
                }
            }
        }

        setSchedule(newSchedule);
        setSelectedCourses(aiSelected);
        setTotalCredits(credits);
    };

    // Manual drag & drop
    const handleDragStart = (course) => {
        setDraggedCourse(course);
    };

    const handleDrop = (day, period) => {
        if (!draggedCourse) return;

        const time = parseCourseTime(draggedCourse.time);
        if (!time || time.day !== day) {
            alert('Môn học này không có lịch vào ' + day);
            return;
        }

        const key = `${day}-${time.startPeriod}-${time.endPeriod}`;

        // Check if already added
        if (schedule[key]) {
            alert('Đã có môn học trong khung giờ này!');
            return;
        }

        // Check conflict
        for (let p = time.startPeriod; p <= time.endPeriod; p++) {
            const checkKey = `${day}-${p}`;
            for (const existingKey in schedule) {
                const [existingDay, existingStart, existingEnd] = existingKey.split('-').map((v, i) => i === 0 ? v : parseInt(v));
                if (existingDay === day && p >= existingStart && p <= existingEnd) {
                    alert('Trung lịch với môn học khác!');
                    return;
                }
            }
        }

        const newSchedule = { ...schedule, [key]: draggedCourse };
        setSchedule(newSchedule);

        if (!selectedCourses.find(c => c.courseId === draggedCourse.courseId)) {
            const newSelected = [...selectedCourses, draggedCourse];
            setSelectedCourses(newSelected);
            setTotalCredits(newSelected.reduce((sum, c) => sum + (c.credits || 2), 0));
        }

        setDraggedCourse(null);
    };

    const handleRemoveCourse = (key) => {
        const course = schedule[key];
        const newSchedule = { ...schedule };
        delete newSchedule[key];
        setSchedule(newSchedule);

        const newSelected = selectedCourses.filter(c => c.courseId !== course.courseId);
        setSelectedCourses(newSelected);
        setTotalCredits(newSelected.reduce((sum, c) => sum + (c.credits || 2), 0));
    };

    const clearSchedule = () => {
        setSchedule({});
        setSelectedCourses([]);
        setTotalCredits(0);
    };

    const saveSchedule = async () => {
        try {
            // Validation cơ bản
            if (!user || !user.id) {
                alert('Vui lòng đăng nhập để lưu thời khóa biểu!');
                return;
            }

            if (selectedCourses.length === 0) {
                alert('Vui lòng chọn ít nhất một môn học!');
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || 'https://func-student-schedule-gbcpezaghachdkfn.eastasia-01.azurewebsites.net/api';
            
            // Chuẩn bị dữ liệu
            const userId = user.email || user.id;
            
            // Validate và format courses data
            const formattedCourses = selectedCourses.map(c => ({
                courseId: String(c.id || c.courseId || ''),
                courseName: String(c.courseName || c.name || 'Unknown'),
                courseCode: String(c.courseCode || c.code || ''),
                credits: Number(c.credits) || 2,
                lecturer: String(c.lecturer || c.instructor || 'TBA'),
                time: String(c.time || c.schedule || ''),
                room: String(c.room || ''),
                weeks: String(c.weeks || ''),
                quantity: Number(c.quantity || c.maxStudents || 0)
            }));

            const payload = {
                userId: userId,
                scheduleName: `Thời khóa biểu - ${new Date().toLocaleDateString('vi-VN')}`,
                courses: formattedCourses,
                user: {
                    email: String(user.email || ''),
                    name: String(user.name || 'Unknown'),
                    studentId: String(user.studentId || ''),
                    role: String(user.role?.roleName || 'Student')
                },
                totalCredits: totalCredits,
                createdAt: new Date().toISOString()
            };

            console.log('💾 Saving schedule...', {
                userId,
                coursesCount: formattedCourses.length,
                totalCredits
            });

            // Gửi request với timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(`${API_URL}/schedules`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Kiểm tra response
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Server error (${response.status})`;
                
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.success) {
                // Backup vào localStorage
                localStorage.setItem(`savedSchedule_${user.id}`, JSON.stringify({
                    userId: user.id,
                    userName: user.name,
                    courses: selectedCourses,
                    schedule: schedule,
                    totalCredits: totalCredits,
                    createdAt: new Date().toISOString(),
                    scheduleId: result.data?.scheduleId
                }));
                
                let message = `Đã lưu thành công vào Azure SQL Database!\n\n`;
                message += `User: ${user.name}\n`;
                message += `Schedule ID: ${result.data?.scheduleId || 'N/A'}\n`;
                message += `Số môn học: ${formattedCourses.length}\n`;
                message += `Tổng tín chỉ: ${totalCredits}\n\n`;
                message += `Môn học đã lưu:\n`;
                formattedCourses.slice(0, 5).forEach((course, index) => {
                    message += `${index + 1}. ${course.courseName} - ${course.lecturer} (${course.credits} TC)\n`;
                });
                if (formattedCourses.length > 5) {
                    message += `... và ${formattedCourses.length - 5} môn khác\n`;
                }
                
                alert(message);
            } else {
                throw new Error(result.error || 'Lưu thất bại - không có thông tin lỗi');
            }

        } catch (error) {
            console.error('❌ Save error:', error);
            
            // Xác định loại lỗi
            let errorMessage = '⚠️ Lưu vào Azure SQL thất bại!\n\n';
            
            if (error.name === 'AbortError') {
                errorMessage += '⏱️ Lỗi: Request timeout (quá 30s)\n';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage += '🌐 Lỗi: Không thể kết nối tới server\n';
                errorMessage += 'Kiểm tra:\n';
                errorMessage += '- Server có đang chạy?\n';
                errorMessage += '- VITE_API_URL có đúng?\n';
                errorMessage += `- URL hiện tại: ${import.meta.env.VITE_API_URL || 'https://func-student-schedule-gbcpezaghachdkfn.eastasia-01.azurewebsites.net/api'}\n`;
            } else {
                errorMessage += `📝 Lỗi: ${error.message}\n`;
            }
            
            // Fallback: Lưu vào localStorage
            if (user && user.id) {
                try {
                    localStorage.setItem(`savedSchedule_${user.id}`, JSON.stringify({
                        userId: user.id,
                        userName: user.name,
                        courses: selectedCourses,
                        schedule: schedule,
                        totalCredits: totalCredits,
                        createdAt: new Date().toISOString(),
                        failedSync: true,
                        error: error.message
                    }));
                    errorMessage += '\n✅ Đã backup vào localStorage';
                } catch (localError) {
                    errorMessage += '\n❌ Không thể backup vào localStorage';
                    console.error('LocalStorage error:', localError);
                }
            }
            
            alert(errorMessage);
        }
    };

    // Render course in cell
    const renderCell = (day, period) => {
        // Find course in this cell
        for (const key in schedule) {
            const [schedDay, startPeriod, endPeriod] = key.split('-').map((v, i) => i === 0 ? v : parseInt(v));
            if (schedDay === day && period >= startPeriod && period <= endPeriod) {
                if (period === startPeriod) {
                    const course = schedule[key];
                    const span = endPeriod - startPeriod + 1;
                    return (
                        <div
                            className="schedule-course"
                            style={{ '--span': span }}
                            onClick={() => handleRemoveCourse(key)}
                        >
                            <div className="course-name">{course.courseName}</div>
                            <div className="course-info">
                                {course.lecturer} • {course.room}
                            </div>
                            <div className="course-remove">✕</div>
                        </div>
                    );
                }
                return null; // Merged cell
            }
        }

        return (
            <div
                className="schedule-empty"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(day, period)}
            >
                Kéo thả vào đây
            </div>
        );
    };

    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <h1>Lập Thời Khóa Biểu</h1>
                <div className="schedule-stats">
                    <span>Đã chọn: {selectedCourses.length} môn</span>
                    <span className={totalCredits >= 18 ? 'credits-ok' : 'credits-low'}>
                        Tổng tín chỉ: {totalCredits}/18
                    </span>
                </div>
            </div>

            <div className="schedule-controls">
                <div className="mode-switch">
                    <button
                        className={mode === 'manual' ? 'active' : ''}
                        onClick={() => setMode('manual')}
                    >
                        Tự chọn
                    </button>
                    <button
                        className={mode === 'ai' ? 'active' : ''}
                        onClick={() => setMode('ai')}
                    >
                        AI gợi ý
                    </button>
                </div>

                <div className="schedule-actions">
                    {mode === 'ai' && (
                        <button className="btn-ai" onClick={generateAISchedule}>
                            🤖 Tạo lịch tự động
                        </button>
                    )}
                    <button className="btn-save" onClick={saveSchedule} disabled={selectedCourses.length === 0}>
                        💾 Lưu lịch
                    </button>
                    <button className="btn-clear" onClick={clearSchedule}>
                        Xóa tất cả
                    </button>
                </div>
            </div>

            <div className="schedule-content">
                <div className="course-list">
                    <h3>Danh sách môn học</h3>
                    <div className="course-items">
                        {loading ? (
                            <div className="loading">Đang tải...</div>
                        ) : (
                            courses.slice(0, 50).map(course => (
                                <div
                                    key={course.courseId}
                                    className="course-item"
                                    draggable={mode === 'manual'}
                                    onDragStart={() => handleDragStart(course)}
                                >
                                    <div className="course-item-name">{course.courseName}</div>
                                    <div className="course-item-info">
                                        {course.time} • {course.credits || 2} TC
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="schedule-table-wrapper">
                    <h3>Thời khóa biểu</h3>

                    {/* Morning Schedule */}
                    <div className="schedule-section">
                        <h4>Buổi sáng (Tiết 1-5)</h4>
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Tiết</th>
                                    {DAYS.map(day => (
                                        <th key={day}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MORNING_PERIODS.map(period => (
                                    <tr key={period}>
                                        <td className="period-label">{period}</td>
                                        {DAYS.map(day => (
                                            <td key={`${day}-${period}`} className="schedule-cell">
                                                {renderCell(day, period)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Afternoon Schedule */}
                    <div className="schedule-section">
                        <h4>Buổi chiều (Tiết 6-10)</h4>
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Tiết</th>
                                    {DAYS.map(day => (
                                        <th key={day}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {AFTERNOON_PERIODS.map(period => (
                                    <tr key={period}>
                                        <td className="period-label">{period}</td>
                                        {DAYS.map(day => (
                                            <td key={`${day}-${period}`} className="schedule-cell">
                                                {renderCell(day, period)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
