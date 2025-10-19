import { useState, useEffect } from 'react';
import apiService from '../../services/api/apiService';
import './SchedulePage.css';

const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MORNING_PERIODS = [1, 2, 3, 4, 5];
const AFTERNOON_PERIODS = [6, 7, 8, 9, 10];

export default function SchedulePage() {
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
      // Lưu vào SQL Server
      const response = await fetch('http://localhost:7071/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          courses: selectedCourses,
          totalCredits: totalCredits
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Backup vào localStorage
        localStorage.setItem('savedSchedule', JSON.stringify({
          courses: selectedCourses,
          schedule: schedule,
          totalCredits: totalCredits,
          createdAt: new Date().toISOString()
        }));
        alert('✅ Đã lưu vào SQL Server!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      // Fallback: Lưu vào localStorage
      localStorage.setItem('savedSchedule', JSON.stringify({
        courses: selectedCourses,
        schedule: schedule,
        totalCredits: totalCredits,
        createdAt: new Date().toISOString()
      }));
      alert('⚠️ Đã lưu vào localStorage (SQL Server lỗi)');
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
